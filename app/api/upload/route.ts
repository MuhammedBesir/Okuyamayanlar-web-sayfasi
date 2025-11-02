import { NextResponse } from "next/server"
import { auth } from "@/auth"
import cloudinary from "@/lib/cloudinary"

export async function POST(request: Request) {
  try {
    const session = await auth()
    
    // Oturum açmış kullanıcılar yükleme yapabilir
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const contentType = request.headers.get("content-type")
    
    // JSON ile URL gönderimi (Google Drive vs)
    if (contentType?.includes("application/json")) {
      const body = await request.json()
      const { url } = body
      
      if (!url) {
        return NextResponse.json({ error: "No URL provided" }, { status: 400 })
      }

      console.log("📥 Uploading from URL:", url)

      // Google Drive linklerini işle
      if (url.includes('drive.google.com')) {
        try {
          // File ID'yi çıkar
          const fileIdMatch = url.match(/\/d\/([a-zA-Z0-9_-]+)/) || url.match(/id=([a-zA-Z0-9_-]+)/)
          
          if (!fileIdMatch || !fileIdMatch[1]) {
            return NextResponse.json({ 
              error: "Google Drive link geçersiz",
              details: "File ID bulunamadı"
            }, { status: 400 })
          }
          
          const fileId = fileIdMatch[1]
          console.log("📁 Google Drive File ID:", fileId)
          
          // Google Drive'dan görseli fetch et
          const driveUrl = `https://drive.google.com/uc?export=download&id=${fileId}`
          console.log("� Fetching from:", driveUrl)
          
          const imageResponse = await fetch(driveUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          })
          
          if (!imageResponse.ok) {
            console.error("❌ Google Drive fetch failed:", imageResponse.status, imageResponse.statusText)
            return NextResponse.json({ 
              error: "Google Drive'dan görsel indirilemedi",
              details: `HTTP ${imageResponse.status}: ${imageResponse.statusText}. Dosyanın herkese açık olduğundan emin olun.`
            }, { status: 400 })
          }
          
          // Görseli buffer'a çevir
          const imageBuffer = Buffer.from(await imageResponse.arrayBuffer())
          console.log("📦 Image downloaded, size:", imageBuffer.length, "bytes")
          
          // Cloudinary'ye stream olarak yükle
          const result = await new Promise<any>((resolve, reject) => {
            cloudinary.uploader.upload_stream(
              {
                folder: 'okuyamayanlar',
                resource_type: 'auto',
              },
              (error, result) => {
                if (error) {
                  console.error("❌ Cloudinary upload error:", error)
                  reject(error)
                } else {
                  console.log("✅ Cloudinary upload success:", result?.secure_url)
                  resolve(result)
                }
              }
            ).end(imageBuffer)
          })
          
          return NextResponse.json({ 
            success: true, 
            url: result.secure_url,
            fileName: result.public_id
          })
          
        } catch (driveError: any) {
          console.error("❌ Google Drive upload error:", driveError)
          return NextResponse.json(
            { 
              error: "Google Drive görseli yüklenemedi",
              details: driveError.message || String(driveError)
            },
            { status: 500 }
          )
        }
      }

      // Diğer URL'ler için Cloudinary'nin direkt upload özelliğini kullan
      try {
        console.log("🌐 Uploading from external URL:", url)
        const result = await cloudinary.uploader.upload(url, {
          folder: 'okuyamayanlar',
          resource_type: 'auto',
        })
        
        console.log("✅ Upload successful:", result.secure_url)
        
        return NextResponse.json({ 
          success: true, 
          url: result.secure_url,
          fileName: result.public_id
        })
      } catch (uploadError: any) {
        console.error("❌ External URL upload error:", uploadError)
        return NextResponse.json(
          { 
            error: "URL'den yükleme başarısız",
            details: uploadError.message || String(uploadError)
          },
          { status: 500 }
        )
      }
    }

    // FormData ile dosya yükleme (mevcut kod)
    const formData = await request.formData()
    const file = formData.get("file") as File
    
    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 })
    }

    // Dosya türünü kontrol et
    const allowedTypes = [
      "image/jpeg", 
      "image/jpg", 
      "image/png", 
      "image/gif", 
      "image/webp",
      "image/heic",
      "image/heif",
      "application/octet-stream"
    ]
    
    const originalFileName = file.name.toLowerCase()
    const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.heic', '.heif']
    const hasValidExtension = validExtensions.some(ext => originalFileName.endsWith(ext))
    
    if (!allowedTypes.includes(file.type) && !hasValidExtension) {
      return NextResponse.json(
        { error: "Sadece resim dosyaları yüklenebilir (JPG, PNG, GIF, WebP, HEIC)" },
        { status: 400 }
      )
    }

    // Dosya boyutunu kontrol et (10MB max)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Dosya boyutu 10MB'dan küçük olmalıdır" },
        { status: 400 }
      )
    }

    // Dosyayı buffer'a çevir
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    // Cloudinary'ye yükle
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'okuyamayanlar',
          resource_type: 'auto',
        },
        (error, result) => {
          if (error) reject(error)
          else resolve(result)
        }
      ).end(buffer)
    })
    
    return NextResponse.json({ 
      success: true, 
      url: result.secure_url,
      fileName: result.public_id
    })
  } catch (error) {
    console.error("Upload error:", error)
    
    // Daha detaylı hata mesajı
    let errorMessage = "Dosya yüklenirken bir hata oluştu"
    let errorDetails = "Bilinmeyen hata"
    
    if (error instanceof Error) {
      errorDetails = error.message
    } else if (typeof error === 'object' && error !== null) {
      errorDetails = JSON.stringify(error, null, 2)
    } else {
      errorDetails = String(error)
    }
    
    console.error("Error details:", errorDetails)
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails
      },
      { status: 500 }
    )
  }
}
