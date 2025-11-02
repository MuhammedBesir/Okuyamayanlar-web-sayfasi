import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixHeicUrls() {
  try {
    console.log('🔍 HEIC formatındaki fotoğraflar aranıyor...')

    // EventPhoto tablosundaki HEIC fotoğrafları bul
    const heicPhotos = await prisma.eventPhoto.findMany({
      where: {
        url: {
          contains: '.heic'
        }
      }
    })

    console.log(`📸 ${heicPhotos.length} adet HEIC fotoğraf bulundu`)

    if (heicPhotos.length === 0) {
      console.log('✅ Düzeltilecek HEIC fotoğraf yok')
      return
    }

    // Her birini güncelle
    let updated = 0
    for (const photo of heicPhotos) {
      const oldUrl = photo.url
      const newUrl = oldUrl.replace('.heic', '.jpg').replace('.HEIC', '.jpg')
      
      await prisma.eventPhoto.update({
        where: { id: photo.id },
        data: { url: newUrl }
      })

      console.log(`✅ Güncellendi: ${photo.id}`)
      console.log(`   Eski: ${oldUrl}`)
      console.log(`   Yeni: ${newUrl}`)
      updated++
    }

    console.log(`\n🎉 Toplam ${updated} fotoğraf güncellendi!`)

    // Book cover'ları da kontrol et
    console.log('\n🔍 Kitap kapakları kontrol ediliyor...')
    const heicBooks = await prisma.book.findMany({
      where: {
        coverImage: {
          contains: '.heic'
        }
      }
    })

    console.log(`📚 ${heicBooks.length} adet HEIC kapak resmi bulundu`)

    for (const book of heicBooks) {
      if (!book.coverImage) continue
      
      const oldUrl = book.coverImage
      const newUrl = oldUrl.replace('.heic', '.jpg').replace('.HEIC', '.jpg')
      
      await prisma.book.update({
        where: { id: book.id },
        data: { coverImage: newUrl }
      })

      console.log(`✅ Kitap kapağı güncellendi: ${book.title}`)
      updated++
    }

    // Event image'ları da kontrol et
    console.log('\n🔍 Etkinlik görselleri kontrol ediliyor...')
    const heicEvents = await prisma.event.findMany({
      where: {
        image: {
          contains: '.heic'
        }
      }
    })

    console.log(`🎪 ${heicEvents.length} adet HEIC etkinlik görseli bulundu`)

    for (const event of heicEvents) {
      if (!event.image) continue
      
      const oldUrl = event.image
      const newUrl = oldUrl.replace('.heic', '.jpg').replace('.HEIC', '.jpg')
      
      await prisma.event.update({
        where: { id: event.id },
        data: { image: newUrl }
      })

      console.log(`✅ Etkinlik görseli güncellendi: ${event.title}`)
      updated++
    }

    // User avatar'ları da kontrol et
    console.log('\n🔍 Kullanıcı avatarları kontrol ediliyor...')
    const heicUsers = await prisma.user.findMany({
      where: {
        image: {
          contains: '.heic'
        }
      }
    })

    console.log(`👤 ${heicUsers.length} adet HEIC avatar bulundu`)

    for (const user of heicUsers) {
      if (!user.image) continue
      
      const oldUrl = user.image
      const newUrl = oldUrl.replace('.heic', '.jpg').replace('.HEIC', '.jpg')
      
      await prisma.user.update({
        where: { id: user.id },
        data: { image: newUrl }
      })

      console.log(`✅ Avatar güncellendi: ${user.name || user.email}`)
      updated++
    }

    console.log(`\n🎉 TOPLAM ${updated} görsel güncellendi!`)
    console.log('✅ Tüm HEIC URL\'leri JPG olarak güncellendi')

  } catch (error) {
    console.error('❌ Hata:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixHeicUrls()
