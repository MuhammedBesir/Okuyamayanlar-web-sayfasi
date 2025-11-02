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

      // Google Drive linkini dönüştür
      let processedUrl = url
      if (url.includes('drive.google.com')) {
        const fileIdMatch = url.match(/[-\w]{25,}/)
        if (fileIdMatch) {
          const fileId = fileIdMatch[0]
          // Google Drive'dan direkt indirme linki
          processedUrl = `https://drive.google.com/uc?export=download&id=${fileId}`
          console.log("🔄 Converted Google Drive URL:", processedUrl)
        }
      }

      try {
        // Cloudinary'nin upload metodunu kullan
        const result = await cloudinary.uploader.upload(processedUrl, {
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
        console.error("❌ Cloudinary upload error:", uploadError)
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
