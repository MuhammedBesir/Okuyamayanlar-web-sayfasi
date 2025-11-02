import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

// Fotoğrafları getir
export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params
    const eventId = params.id

    const photos = await prisma.eventPhoto.findMany({
      where: { eventId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ photos })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch photos" }, { status: 500 })
  }
}

// Fotoğraf ekle
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const params = await context.params
    const eventId = params.id
    const body = await request.json()
    const { url, caption } = body

    if (!url || url.trim().length === 0) {
      return NextResponse.json({ error: "Photo URL is required" }, { status: 400 })
    }

    // Etkinliğin COMPLETED olduğunu kontrol et
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      select: { status: true },
    })

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 })
    }

    if (event.status !== 'COMPLETED') {
      return NextResponse.json({ 
        error: "Photos can only be added to completed events" 
      }, { status: 400 })
    }

    // Kullanıcının bu etkinliğe yüklediği fotoğraf sayısını kontrol et (max 5)
    const userPhotoCount = await prisma.eventPhoto.count({
      where: {
        eventId,
        userId: session.user.id
      }
    })

    if (userPhotoCount >= 5) {
      return NextResponse.json({ 
        error: "Bir etkinliğe en fazla 5 fotoğraf yükleyebilirsiniz" 
      }, { status: 400 })
    }

    const photo = await prisma.eventPhoto.create({
      data: {
        eventId,
        userId: session.user.id,
        url: url.trim(),
        caption: caption?.trim() || null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    })

    return NextResponse.json({ photo }, { status: 201 })
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Event photo upload error:', error)
    }
    const errorMessage = error instanceof Error ? error.message : 'Failed to create photo'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}

// Fotoğraf sil
export async function DELETE(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const photoId = searchParams.get('photoId')

    if (!photoId) {
      return NextResponse.json({ error: "Photo ID is required" }, { status: 400 })
    }

    // Fotoğrafın sahibini kontrol et
    const photo = await prisma.eventPhoto.findUnique({
      where: { id: photoId },
      select: { userId: true },
    })

    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 })
    }

    // Sadece fotoğraf sahibi veya admin silebilir
    if (photo.userId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.eventPhoto.delete({
      where: { id: photoId },
    })

    return NextResponse.json({ message: "Photo deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete photo" }, { status: 500 })
  }
}
