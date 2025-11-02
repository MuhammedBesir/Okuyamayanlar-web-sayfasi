import { NextResponse } from "next/server"
import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const session = await auth()
    
    if (!session?.user?.id || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { books } = await request.json()

    if (!Array.isArray(books) || books.length === 0) {
      return NextResponse.json({ error: "Invalid books data" }, { status: 400 })
    }

    const results = {
      added: 0,
      skipped: 0,
      errors: [] as string[]
    }

    for (const book of books) {
      try {
        // Kitap zaten var mı kontrol et
        const existing = await prisma.book.findFirst({
          where: {
            OR: [
              { title: book.title },
              ...(book.isbn ? [{ isbn: book.isbn }] : [])
            ]
          }
        })

        if (existing) {
          results.skipped++
          continue
        }

        // Kitabı ekle
        await prisma.book.create({
          data: {
            title: book.title,
            author: book.author,
            description: book.description || '',
            isbn: book.isbn || null,
            publishedYear: book.publishedYear || null,
            pageCount: book.pageCount || null,
            language: book.language || 'Turkish',
            genre: book.genre || 'Genel',
            available: true,
            coverImage: book.coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400'
          }
        })

        results.added++
      } catch (err) {
        results.errors.push(`${book.title}: ${err instanceof Error ? err.message : 'Unknown error'}`)
      }
    }

    return NextResponse.json({
      success: true,
      message: `${results.added} kitap eklendi, ${results.skipped} atlandı`,
      ...results
    })

  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Bulk add books error:', error)
    }
    return NextResponse.json(
      { error: "Failed to add books" },
      { status: 500 }
    )
  }
}
