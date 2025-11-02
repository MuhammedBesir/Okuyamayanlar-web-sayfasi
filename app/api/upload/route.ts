import { NextResponse } from "next/server"
import { auth } from "@/auth"
import cloudinary from "@/lib/cloudinary"

export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session) {
      return NextResponse.json({ error: "Giriş yapmanız gerekiyor" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File
    
    if (!file) {
      return NextResponse.json({ error: "Dosya bulunamadı" }, { status: 400 })
    }

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
        { error: "Geçersiz dosya formatı", details: "Sadece JPG, PNG, GIF, WebP, HEIC formatları desteklenir" },
        { status: 400 }
      )
    }

    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "Dosya çok büyük", details: `Maksimum 10MB, dosya boyutu: ${(file.size / (1024 * 1024)).toFixed(1)}MB` },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    
    const result = await new Promise<any>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          folder: 'okuyamayanlar',
          resource_type: 'auto',
          format: 'jpg',
          transformation: [
            { quality: 'auto:good' },
            { fetch_format: 'auto' }
          ]
        },
        (error, result) => {
          if (error) {
            reject(error)
          } else {
            resolve(result)
          }
        }
      ).end(buffer)
    })
    
    return NextResponse.json({ 
      success: true, 
      url: result.secure_url,
      fileName: result.public_id
    })
  } catch (error) {
    // Server-side logging for debugging
    if (process.env.NODE_ENV === 'development') {
      console.error("Upload error:", error)
    }
    
    let errorMessage = "Dosya yüklenirken bir hata oluştu"
    let errorDetails = "Bilinmeyen hata"
    
    if (error instanceof Error) {
      errorDetails = error.message
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? errorDetails : 'Lütfen tekrar deneyin'
      },
      { status: 500 }
    )
  }
}
