import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: NextRequest) {
  try {
    const session = await auth()

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Giriş yapmanız gerekiyor" },
        { status: 401 }
      )
    }

    // Kullanıcının admin olup olmadığını kontrol et
    const currentUser = await prisma.user.findUnique({
      where: { email: session.user.email! },
      select: { role: true }
    })

    if (!currentUser || currentUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Bu işlem için admin yetkisi gerekiyor" },
        { status: 403 }
      )
    }

    // Tüm kullanıcıları getir
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        email: true,
        role: true,
        banned: true,
        bannedAt: true,
        bannedReason: true,
        createdAt: true,
        _count: {
          select: {
            forumTopics: true,
            forumReplies: true
          }
        },
        userBadges: {
          select: {
            badge: {
              select: {
                id: true,
                name: true,
                icon: true,
                color: true
              }
            }
          },
          take: 10 // İlk 10 rozeti getir
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ users })
  } catch (error) {
    return NextResponse.json(
      { error: "Kullanıcılar getirilirken bir hata oluştu" },
      { status: 500 }
    )
  }
}
