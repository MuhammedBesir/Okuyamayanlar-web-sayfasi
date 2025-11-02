import { NextResponse } from "next/server"
import { auth } from "@/auth"
import cloudinary from "@/lib/cloudinary"

export async function POST(request: Request) {
  try {
    console.log('📥 Upload request received')
    const session = await auth()
    
    if (!session) {
      console.log('❌ No session found')
      return NextResponse.json({ error: "Giriş yapmanız gerekiyor" }, { status: 401 })
    }

    console.log('✅ Session verified:', session.user?.email)

    const formData = await request.formData()
    const file = formData.get("file") as File
    
    if (!file) {
      console.log('❌ No file in formData')
      return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 })
    }

    console.log('📁 File received:', file.name, 'Size:', (file.size / 1024).toFixed(2), 'KB', 'Type:', file.type)

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
      console.log('❌ Invalid file type:', file.type, 'Extension valid:', hasValidExtension)
      return NextResponse.json(
        { error: "Geçersiz dosya formatı", details: "Sadece JPG, PNG, GIF, WebP, HEIC formatları desteklenir" },
        { status: 400 }
      )
    }

    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      console.log('❌ File too large:', (file.size / (1024 * 1024)).toFixed(2), 'MB')
      return NextResponse.json(
        { error: "Dosya çok büyük", details: `Maksimum 10MB, dosya boyutu: ${(file.size / (1024 * 1024)).toFixed(1)}MB` },
        { status: 400 }
      )
    }

    console.log('⚙️ Converting file to buffer...')
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    console.log('✅ Buffer created, size:', buffer.length, 'bytes')
    
    console.log('☁️ Uploading to Cloudinary...')
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'okuyamayanlar',
          resource_type: 'auto',
          format: 'jpg', // HEIC ve diğer formatları JPG'ye dönüştür
          transformation: [
            { quality: 'auto:good' }, // Otomatik kalite optimizasyonu
            { fetch_format: 'auto' } // Tarayıcıya göre en uygun format
          ]
        },
        (error, result) => {
          if (error) {
            console.error('❌ Cloudinary error:', error)
            reject(error)
          } else {
            console.log('✅ Cloudinary upload successful:', result?.secure_url)
            resolve(result)
          }
        }
      ).end(buffer)
    })
    
    console.log('✅ Upload completed successfully')
    return NextResponse.json({ 
      success: true, 
      url: result.secure_url,
      fileName: result.public_id
    })
  } catch (error) {
    console.error("❌ Upload error:", error)
    
    let errorMessage = "Dosya yüklenirken bir hata oluştu"
    let errorDetails = "Bilinmeyen hata"
    
    if (error instanceof Error) {
      errorDetails = error.message
      console.error("Error message:", error.message)
      console.error("Error stack:", error.stack)
    } else if (typeof error === 'object' && error !== null) {
      errorDetails = JSON.stringify(error, null, 2)
      console.error("Error object:", error)
    } else {
      errorDetails = String(error)
      console.error("Error string:", error)
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails
      },
      { status: 500 }
    )
  }
}
