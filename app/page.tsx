"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, BookOpen, Calendar, Users, Quote, Star, Award, TrendingUp, MessageCircle, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import { useToast } from "@/components/ui/use-toast"

const featuredBooks = [
  {
    id: "1",
    title: "Kürk Mantolu Madonna",
    author: "Sabahattin Ali",
    coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400",
    description: "Türk edebiyatının걸작lerinden. Raif Efendi'nin Maria Puder'e olan aşkı ve trajik sonu.",
    genre: "Roman",
    pages: 176,
  },
  {
    id: "2",
    title: "İnce Memed",
    author: "Yaşar Kemal",
    coverImage: "https://images.unsplash.com/photo-1495640452828-3df6795cf331?w=400",
    description: "Çukurova'nın acı gerçeklerini anlatan destansı bir roman. Memed'in özgürlük mücadelesi.",
    genre: "Epik Roman",
    pages: 432,
  },
  {
    id: "3",
    title: "Tutunamayanlar",
    author: "Oğuz Atay",
    coverImage: "https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400",
    description: "Modern Türk edebiyatının başyapıtı. Selim'in iç dünyasına yolculuk.",
    genre: "Felsefi Roman",
    pages: 724,
  },
  {
    id: "4",
    title: "Saatleri Ayarlama Enstitüsü",
    author: "Ahmet Hamdi Tanpınar",
    coverImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    description: "Doğu-Batı çatışmasını mizahi bir dille işleyen걸작 eser.",
    genre: "Mizahi Roman",
    pages: 408,
  },
  {
    id: "5",
    title: "Beyaz Kale",
    author: "Orhan Pamuk",
    coverImage: "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400",
    description: "Kimlik, ikiz benlik ve Doğu-Batı ilişkilerini sorgulayan tarihsel roman.",
    genre: "Tarihsel Roman",
    pages: 176,
  },
  {
    id: "6",
    title: "Şu Çılgın Türkler",
    author: "Turgut Özakman",
    coverImage: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400",
    description: "Çanakkale Savaşı'nın destansı hikayesi. Vatan sevgisi ve kahramanlık.",
    genre: "Tarihsel Roman",
    pages: 584,
  },
]

const upcomingEvents = [
  {
    id: "1",
    title: "Yaşar Kemal Kitap Kulübü",
    date: "25 Ekim 2025",
    location: "Online - Zoom",
    attendees: 18,
    maxAttendees: 30,
    description: "Bu ay İnce Memed'i tartışıyoruz. Çukurova'nın destanını birlikte okuyalım.",
  },
  {
    id: "2",
    title: "Orhan Pamuk Söyleşisi",
    date: "1 Kasım 2025",
    location: "Merkez Kütüphane - Konferans Salonu",
    attendees: 42,
    maxAttendees: 50,
    description: "Nobel ödüllü yazarımız eserlerini ve yazma sürecini anlatacak.",
  },
  {
    id: "3",
    title: "Türk Şiiri Gecesi",
    date: "5 Kasım 2025",
    location: "Kitap Kafe - Bahçe",
    attendees: 15,
    maxAttendees: 25,
    description: "Nazım Hikmet, Orhan Veli, Cahit Sıtkı şiirleri ile dolu bir akşam.",
  },
]

const bookQuotes = [
  {
    text: "İnsan sevdiğini koruyabildiği müddetçe mutludur.",
    author: "Sabahattin Ali",
    book: "Kürk Mantolu Madonna",
  },
  {
    text: "Çocuklar acıkmıştı. Analar ağlıyordu. Babalar sustular.",
    author: "Yaşar Kemal",
    book: "İnce Memed",
  },
]

export default function HomePage() {
  const { data: session, status } = useSession()
  const { toast } = useToast()
  const [activeDiscussions, setActiveDiscussions] = useState<any[]>([])
  const [loadingDiscussions, setLoadingDiscussions] = useState(true)
  const [pastEvents, setPastEvents] = useState<any[]>([])
  const [loadingEvents, setLoadingEvents] = useState(true)
  const [bookOfTheMonth, setBookOfTheMonth] = useState<any>(null)
  const [loadingFeaturedBook, setLoadingFeaturedBook] = useState(true)
  const [addingToList, setAddingToList] = useState(false)
  const [isInReadingList, setIsInReadingList] = useState(false)

  // Öne çıkan kitabı çek
  useEffect(() => {
    const fetchFeaturedBook = async () => {
      try {
        const response = await fetch('/api/featured-book')
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        if (data && data.featuredBook) {
          setBookOfTheMonth(data.featuredBook)
        } else {
          setBookOfTheMonth(null)
        }
      } catch (error) {
        setBookOfTheMonth(null) // Hata durumunda null
      } finally {
        setLoadingFeaturedBook(false)
      }
    }

    fetchFeaturedBook()
  }, [])

  // Kitabın okuma listesinde olup olmadığını kontrol et
  useEffect(() => {
    const checkReadingList = async () => {
      if (!session?.user?.id || !bookOfTheMonth) return

      try {
        const response = await fetch('/api/reading-list')
        if (response.ok) {
          const readingList = await response.json()
          const bookId = bookOfTheMonth.bookId || bookOfTheMonth.id
          const isInList = readingList.some((item: any) => item.bookId === bookId)
          setIsInReadingList(isInList)
        }
      } catch (error) {
        console.error('Error checking reading list:', error)
      }
    }

    checkReadingList()
  }, [session, bookOfTheMonth])

  // Forum verilerini çek
  useEffect(() => {
    const fetchDiscussions = async () => {
      try {
        const response = await fetch('/api/forum?featured=true&limit=6')
        const data = await response.json()
        // Veriyi düzgün şekilde kontrol et
        if (data && data.topics && Array.isArray(data.topics)) {
          setActiveDiscussions(data.topics)
        } else if (Array.isArray(data)) {
          setActiveDiscussions(data)
        } else {
          setActiveDiscussions([]) // Fallback: boş array
        }
      } catch (error) {
        setActiveDiscussions([]) // Hata durumunda boş array
      } finally {
        setLoadingDiscussions(false)
      }
    }

    fetchDiscussions()
  }, [])

  // Geçmiş etkinlikleri çek
  useEffect(() => {
    const fetchPastEvents = async () => {
      try {
        const response = await fetch('/api/events?past=true&featured=true&limit=3')
        const data = await response.json()
        // Veriyi düzgün şekilde kontrol et
        if (data && data.events && Array.isArray(data.events)) {
          setPastEvents(data.events)
        } else if (Array.isArray(data)) {
          setPastEvents(data)
        } else {
          setPastEvents([]) // Fallback: boş array
        }
      } catch (error) {
        setPastEvents([]) // Hata durumunda boş array
      } finally {
        setLoadingEvents(false)
      }
    }

    fetchPastEvents()
  }, [])
  // Paylaşım fonksiyonu
  const handleShare = async () => {
    if (!bookOfTheMonth) return;
    
    const shareData = {
      title: `${bookOfTheMonth.title} - ${bookOfTheMonth.author}`,
      text: `Bu ayın seçimi: ${bookOfTheMonth.title} - ${bookOfTheMonth.quote || ''}`,
      url: window.location.origin + `/library/${bookOfTheMonth.bookId || bookOfTheMonth.id}`
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        // Fallback: URL'yi kopyala
        await navigator.clipboard.writeText(shareData.url)
      }
    } catch (err) {
    }
  }

  // Okuma listesine ekleme fonksiyonu
  const handleAddToReadingList = async () => {
    if (!bookOfTheMonth) return
    
    if (!session?.user) {
      toast({
        title: "⚠️ Giriş Yapmanız Gerekiyor",
        description: "Okuma listesine kitap eklemek için giriş yapmalısınız.",
        variant: "destructive",
      })
      return
    }
    
    setAddingToList(true)
    
    try {
      const bookId = bookOfTheMonth.bookId || bookOfTheMonth.id

      // Eğer kitap listede ise, çıkar
      if (isInReadingList) {
        const response = await fetch(`/api/reading-list?bookId=${bookId}`, {
          method: 'DELETE',
        })

        const data = await response.json()

        if (response.ok) {
          toast({
            title: "✅ Başarılı!",
            description: `"${bookOfTheMonth.title}" okuma listenizden çıkarıldı!`,
          })
          setIsInReadingList(false)
        } else {
          throw new Error(data.error || 'Bir hata oluştu')
        }
      } 
      // Eğer kitap listede değilse, ekle
      else {
        const response = await fetch('/api/reading-list', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            bookId: bookId
          }),
        })

        const data = await response.json()

        if (response.ok) {
          toast({
            title: "✅ Başarılı!",
            description: `"${bookOfTheMonth.title}" okuma listenize eklendi!`,
          })
          setIsInReadingList(true)
        } else if (response.status === 400 && data.error?.includes('already')) {
          toast({
            title: "ℹ️ Zaten Listenizde",
            description: "Bu kitap zaten okuma listenizde bulunuyor.",
          })
          setIsInReadingList(true)
        } else {
          throw new Error(data.error || 'Bir hata oluştu')
        }
      }
    } catch (error: any) {
      console.error('Reading list error:', error)
      toast({
        title: "❌ Hata",
        description: error.message || "İşlem sırasında bir hata oluştu. Lütfen tekrar deneyin.",
        variant: "destructive",
      })
    } finally {
      setAddingToList(false)
    }
  }

  return (
    <div className="flex flex-col">
      {/* Hero Section - Sadece giriş yapmamış kullanıcılara göster */}
      {!session && (
      <section className="relative py-12 sm:py-16 md:py-24 lg:py-32 xl:py-48 bg-gradient-to-br from-[#F5F0E8] to-[#E8DED0] dark:from-gray-900 dark:to-gray-950 overflow-hidden">
        <div className="absolute top-10 left-10 w-32 h-32 bg-amber-200/20 dark:bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-40 h-40 bg-orange-200/20 dark:bg-orange-500/10 rounded-full blur-3xl" />
        
        <div className="container px-4 sm:px-6 md:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
            className="mx-auto max-w-5xl text-center"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black tracking-tight mb-4 sm:mb-5 md:mb-6 lg:mb-8 leading-[1.15] sm:leading-tight text-gray-900 dark:text-gray-100 px-2">
              Kitaplarla Birlikte{" "}
              <span className="text-[#E67350] dark:text-[#FF8A65]">Büyüyen</span>{" "}
              Bir Topluluk
            </h1>
            
            <p className="text-sm sm:text-base md:text-lg lg:text-xl xl:text-2xl text-gray-700 dark:text-gray-300 mb-6 sm:mb-7 md:mb-10 lg:mb-12 max-w-3xl mx-auto leading-relaxed font-medium px-4">
              Her ay yeni kitaplar, keyifli sohbetler ve sınırsız eğlence. Katılmak için tek bir tıklama yeterli!
            </p>
            
            <div className="flex justify-center px-4">
              <Button 
                size="lg" 
                className="bg-[#6B5544] hover:bg-[#5a4638] dark:bg-[#FF8A65] dark:hover:bg-[#FF7043] text-white text-sm sm:text-base md:text-lg h-12 sm:h-13 md:h-14 px-8 sm:px-10 md:px-12 rounded-xl shadow-xl font-bold transition-all w-full sm:w-auto max-w-sm" 
                asChild
              >
                <Link href="/events">
                  <Calendar className="mr-2 h-5 w-5 sm:h-5 sm:w-5 md:h-6 md:w-6" />
                  Hemen Keşfet
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
      )}

      {/* Bu Ayın Seçimi - Görseldeki gibi */}
      {!loadingFeaturedBook && bookOfTheMonth && (
      <section className="py-10 sm:py-12 md:py-16 lg:py-20 bg-gradient-to-br from-[#FFFAF7] to-[#FFF3ED] dark:from-gray-900 dark:to-gray-950">
        <div className="container px-4 sm:px-6 md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-6xl mx-auto"
          >
            {/* Badge */}
            <div className="mb-5 sm:mb-6 md:mb-8 text-center sm:text-left">
              <div className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 sm:px-5 md:px-6 py-2 sm:py-2.5 md:py-3 rounded-full font-semibold shadow-lg text-xs sm:text-sm md:text-base">
                {bookOfTheMonth.badge || '⭐ Bu Ayın Seçimi'}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 sm:gap-8 md:gap-10 items-start">
              {/* Sol: Kitap Görseli */}
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="md:col-span-2"
              >
                <div className="relative aspect-[3/4] max-w-sm mx-auto md:max-w-none rounded-2xl overflow-hidden shadow-2xl group">
                  <Image
                    src={bookOfTheMonth.coverImage}
                    alt={bookOfTheMonth.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {/* Rating ve Okuyucu overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 sm:p-5 md:p-6">
                    <div className="flex items-center justify-around gap-2 text-white">
                      <div className="bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl flex-1 text-center">
                        <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-1">
                          <Star className="h-4 w-4 sm:h-5 sm:w-5 fill-yellow-400 text-yellow-400" />
                          <span className="text-xl sm:text-2xl md:text-3xl font-bold">{bookOfTheMonth.rating || 0}</span>
                        </div>
                        <div className="text-[10px] sm:text-xs opacity-90 font-medium">Rating</div>
                      </div>
                      <div className="bg-white/20 backdrop-blur-sm px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl flex-1 text-center">
                        <div className="flex items-center justify-center gap-1.5 sm:gap-2 mb-1">
                          <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                          <span className="text-xl sm:text-2xl md:text-3xl font-bold">{bookOfTheMonth.readers}</span>
                        </div>
                        <div className="text-[10px] sm:text-xs opacity-90 font-medium">Okuyucu</div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Sağ: Kitap Bilgileri */}
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                className="space-y-4 sm:space-y-5 md:space-y-6 md:col-span-3"
              >
                {/* Kategori */}
                <div className="text-center sm:text-left">
                  <span className="inline-block text-[#E67350] dark:text-[#FF8A65] font-bold text-xs sm:text-sm bg-[#E67350]/10 dark:bg-[#FF8A65]/20 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full">
                    {bookOfTheMonth.genre || bookOfTheMonth.category || 'Genel'}
                  </span>
                </div>

                {/* Başlık */}
                <div className="text-center sm:text-left">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-gray-900 dark:text-gray-100 mb-2 sm:mb-3 leading-tight">
                    {bookOfTheMonth.title}
                  </h2>
                  <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 font-semibold">
                    {bookOfTheMonth.author}
                  </p>
                </div>

                {/* Yıldızlar ve Değerlendirme */}
                <div className="flex items-center justify-center sm:justify-start gap-1.5 sm:gap-2">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      className={`h-5 w-5 sm:h-6 sm:w-6 ${
                        i < Math.floor(bookOfTheMonth.rating || 0)
                          ? "fill-yellow-400 text-yellow-400"
                          : "text-gray-300"
                      }`}
                    />
                  ))}
                  <span className="text-gray-600 dark:text-gray-400 ml-1 sm:ml-2 text-sm sm:text-base">
                    ({bookOfTheMonth.reviewCount || 0} değerlendirme)
                  </span>
                </div>

                {/* Alıntı Kutusu */}
                {bookOfTheMonth.quote && (
                <div className="bg-muted p-4 sm:p-5 md:p-6 rounded-xl border-l-4 border-primary">
                  <Quote className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary mb-2 sm:mb-3" />
                  <p className="text-muted-foreground italic leading-relaxed text-sm sm:text-base md:text-lg">
                    &quot;{bookOfTheMonth.quote}&quot;
                  </p>
                </div>
                )}

                {/* Açıklama */}
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm sm:text-base md:text-lg text-center sm:text-left">
                  {bookOfTheMonth.description}
                </p>

                {/* Butonlar */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-2 sm:pt-4">
                  <div className="w-full sm:flex-1">
                    <Button 
                      size="lg" 
                      className={`${
                        isInReadingList 
                          ? 'bg-green-600 hover:bg-green-700 dark:bg-green-600 dark:hover:bg-green-700' 
                          : 'bg-[#6B5544] hover:bg-[#5a4638] dark:bg-[#8D6E63] dark:hover:bg-[#A1887F]'
                      } text-white font-bold rounded-xl shadow-lg transition-all text-sm sm:text-base h-11 sm:h-12 md:h-13 w-full`}
                      onClick={handleAddToReadingList}
                      disabled={addingToList || !session?.user}
                    >
                      {addingToList 
                        ? '⏳ İşleniyor...' 
                        : isInReadingList 
                          ? '✅ Okuma Listemde (Çıkarmak için tıkla)' 
                          : '📕 Okuma Listeme Ekle'
                      }
                    </Button>
                  </div>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="border-2 border-[#E67350] text-[#E67350] hover:bg-[#E67350]/10 dark:border-[#FF8A65] dark:text-[#FF8A65] dark:hover:bg-[#FF8A65]/10 font-bold rounded-xl transition-all text-sm sm:text-base h-11 sm:h-12 md:h-13 w-full sm:w-auto sm:px-8" 
                    onClick={handleShare}
                  >
                    🔗 Paylaş
                  </Button>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>
      )}

      {/* Active Discussions Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-[#FFFAF7] via-[#FFF7F2] to-[#FFF3ED] dark:from-gray-900 dark:via-gray-925 dark:to-gray-950">
        <div className="container px-3 sm:px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-10 md:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-black mb-3 sm:mb-4 text-[#E67350] dark:text-[#FF8A65]" style={{ fontFamily: "'Poppins', 'Inter', sans-serif" }}>
              🔥 Aktif Tartışmalar
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto font-medium px-4">
              Topluluğumuzun en çok konuştuğu konular ve kitaplar
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-6xl mx-auto">
            {loadingDiscussions ? (
              // Loading skeleton
              [...Array(6)].map((_, index) => (
                <Card key={index} className="animate-pulse">
                  <CardHeader className="pb-3 p-4 sm:p-6">
                    <div className="h-5 sm:h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2 w-20"></div>
                    <div className="h-5 sm:h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  </CardHeader>
                  <CardContent className="p-4 sm:p-6">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                  </CardContent>
                </Card>
              ))
            ) : activeDiscussions.length > 0 ? (
              activeDiscussions.map((discussion, index) => {
                const replyCount = discussion._count?.replies || 0
                const createdDate = new Date(discussion.createdAt)
                const now = new Date()
                const diffTime = Math.abs(now.getTime() - createdDate.getTime())
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
                const diffHours = Math.floor(diffTime / (1000 * 60 * 60))
                
                let timeAgo = ""
                if (diffDays > 0) {
                  timeAgo = `${diffDays} gün önce`
                } else if (diffHours > 0) {
                  timeAgo = `${diffHours} saat önce`
                } else {
                  timeAgo = "Az önce"
                }

                return (
                  <motion.div
                    key={discussion.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 hover:border-[#FF9B7A] dark:hover:border-[#E67350] bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm h-full flex flex-col">
                      <CardHeader className="pb-2 sm:pb-3 p-3 sm:p-4 md:p-6">
                        <div className="flex items-start justify-between mb-2 gap-2">
                          <span className="inline-block px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-bold rounded-full bg-[#E67350] dark:bg-[#D96544] text-white flex-shrink-0">
                            {discussion.category}
                          </span>
                          <div className="flex items-center gap-0.5 sm:gap-1 text-xs text-gray-500 dark:text-gray-400">
                            <MessageCircle className="h-3 w-3" />
                            <span className="font-semibold">{replyCount}</span>
                          </div>
                        </div>
                        <CardTitle className="line-clamp-2 text-sm sm:text-base md:text-lg leading-tight text-gray-900 dark:text-gray-100 group-hover:text-[#E67350] dark:group-hover:text-[#FF8A65] transition-colors" style={{ fontFamily: "'Poppins', 'Inter', sans-serif" }}>
                          {discussion.title}
                        </CardTitle>
                        {discussion.pinned && (
                          <div className="flex items-center gap-1 text-[10px] sm:text-xs text-[#E67350] dark:text-[#FF9B7A] mt-1">
                            <Star className="h-2.5 w-2.5 sm:h-3 sm:w-3 fill-current" />
                            <span>Sabitlenmiş</span>
                          </div>
                        )}
                      </CardHeader>
                      <CardContent className="pb-2 sm:pb-3 p-3 sm:p-4 md:p-6 pt-0 flex-1">
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-2 sm:mb-3">
                          {discussion.content}
                        </p>
                        <div className="flex items-center justify-between text-[10px] sm:text-xs">
                          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                            <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-gradient-to-br from-[#E67350] to-[#D96544] flex items-center justify-center text-white text-[10px] sm:text-xs font-bold flex-shrink-0">
                              {discussion.user?.name?.charAt(0) || "?"}
                            </div>
                            <span className="font-medium text-gray-700 dark:text-gray-300 truncate">
                              {discussion.user?.name || "Anonim"}
                            </span>
                          </div>
                          <span className="text-gray-500 dark:text-gray-400 flex-shrink-0 ml-2">{timeAgo}</span>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-0 p-3 sm:p-4 md:p-6">
                        <Button 
                          className="w-full h-8 sm:h-9 text-xs sm:text-sm bg-gradient-to-r from-[#E67350] to-[#D96544] hover:from-[#D96544] hover:to-[#CC5638] dark:from-[#FF8A65] dark:to-[#FF7043] dark:hover:from-[#FF7043] dark:hover:to-[#FF5722] font-bold text-white" 
                          asChild
                        >
                          <Link href={`/forum/${discussion.id}`}>
                            💬 Tartışmaya Katıl
                          </Link>
                        </Button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                )
              })
            ) : (
              <div className="col-span-full text-center py-12">
                <MessageCircle className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">Henüz tartışma bulunmuyor</p>
              </div>
            )}
          </div>

          <div className="text-center mt-8 sm:mt-10 md:mt-12">
            <Button size="lg" variant="outline" className="border-2 border-[#E67350] text-[#E67350] hover:bg-orange-50 dark:hover:bg-orange-950/30 font-bold text-sm sm:text-base h-10 sm:h-11 md:h-12 px-6 sm:px-8" asChild>
              <Link href="/forum">
                Tüm Tartışmaları Gör
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Past Events Section */}
      <section className="py-12 sm:py-16 md:py-20 bg-gradient-to-br from-[#FFFAF7] to-[#FFF3ED] dark:from-gray-900 dark:to-gray-950">
        <div className="container px-3 sm:px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8 sm:mb-10 md:mb-12"
          >
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-black mb-3 sm:mb-4 text-[#6B5544] dark:text-[#A1887F]" style={{ fontFamily: "'Poppins', 'Inter', sans-serif" }}>
              📅 Geçmiş Etkinliklerimiz
            </h2>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto font-medium px-4">
              Gerçekleştirdiğimiz başarılı etkinlikler ve unutulmaz anlar
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-6xl mx-auto">
            {loadingEvents ? (
              // Loading skeleton
              [...Array(3)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="aspect-[16/10] bg-gray-200 dark:bg-gray-700 rounded-2xl mb-4"></div>
                  <div className="h-5 sm:h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                </div>
              ))
            ) : pastEvents.length > 0 ? (
              pastEvents.map((event, index) => {
                const eventDate = new Date(event.startDate || event.date)
                const day = eventDate.getDate()
                const month = eventDate.getMonth() + 1
                const year = eventDate.getFullYear()
                const formattedDate = `${day}/${month}/${year}`

                const defaultImage = "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&h=500&fit=crop"

                return (
                  <Link href={`/events/${event.id}`} key={event.id} className="block">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      className="group cursor-pointer h-full"
                    >
                    {/* Event Image */}
                    <div className="relative aspect-[16/10] rounded-2xl overflow-hidden mb-3 sm:mb-4 shadow-xl">
                      <Image
                        src={event.image || defaultImage}
                        alt={event.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-6">
                          <div className="flex items-center gap-2 text-white">
                            <Eye className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span className="text-xs sm:text-sm font-semibold">Detayları Gör</span>
                          </div>
                        </div>
                      </div>
                      {/* Date Badge */}
                      <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-sm px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl shadow-lg">
                        <div className="text-xl sm:text-2xl font-black text-[#6B5544] dark:text-[#A1887F]">
                          {day}
                        </div>
                        <div className="text-[10px] sm:text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                          {month}/{year}
                        </div>
                      </div>
                    </div>

                    {/* Event Info */}
                    <div className="px-1 sm:px-2">
                      <h3 className="text-base sm:text-lg md:text-xl font-bold mb-2 text-gray-900 dark:text-gray-100 group-hover:text-[#6B5544] dark:group-hover:text-[#A1887F] transition-colors line-clamp-2">
                        {event.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2 sm:mb-3">
                        {event.description}
                      </p>
                      <div className="flex items-center justify-between text-xs sm:text-sm text-gray-500 dark:text-gray-400 mb-3 sm:mb-4">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="font-semibold">
                            {event.attendeeCount !== null && event.attendeeCount !== undefined 
                              ? event.attendeeCount 
                              : (event._count?.rsvps || 0)
                            }
                            {event.maxAttendees && ` / ${event.maxAttendees}`} Katılımcı
                          </span>
                        </div>
                        <div className="flex items-center gap-1 truncate">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      </div>
                      
                      {/* Rating Göster - Geçmiş etkinlikler için */}
                      {event.averageRating !== null && (
                        <div className="mb-2 sm:mb-3 p-2 bg-amber-50 dark:bg-amber-950/20 rounded-lg border border-amber-200 dark:border-amber-800">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1 sm:gap-1.5">
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${
                                      star <= Math.round(event.averageRating!)
                                        ? 'fill-yellow-400 text-yellow-400'
                                        : 'text-gray-300 dark:text-gray-600'
                                    }`}
                                  />
                                ))}
                              </div>
                              <span className="font-semibold text-xs sm:text-sm text-gray-900 dark:text-gray-100">
                                {event.averageRating.toFixed(1)}
                              </span>
                            </div>
                            <span className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
                              {event.totalRatings} değerlendirme
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </motion.div>
                  </Link>
                )
              })
            ) : (
              <div className="col-span-full text-center py-12">
                <Calendar className="h-12 w-12 sm:h-16 sm:w-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">Henüz tamamlanmış etkinlik bulunmuyor</p>
              </div>
            )}
          </div>

          {pastEvents.length > 0 && (
            <div className="text-center mt-8 sm:mt-10 md:mt-12">
              <Button size="lg" variant="outline" className="border-2 border-[#6B5544] text-[#6B5544] hover:bg-[#6B5544]/10 dark:border-[#A1887F] dark:text-[#A1887F] dark:hover:bg-[#A1887F]/10 font-bold transition-all text-sm sm:text-base h-10 sm:h-11 md:h-12 px-6 sm:px-8" asChild>
                <Link href="/events">
                  Tüm Etkinlikler Sayfasına Git
                  <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
                </Link>
              </Button>
            </div>
          )}
        </div>
      </section>

    </div>
  )
}
