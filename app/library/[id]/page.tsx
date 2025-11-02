"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { 
  ArrowLeft, BookOpen, Calendar, FileText, Star, User, 
  CheckCircle, XCircle, Plus, Minus, Clock, MessageSquare, Trash2, Pencil
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"

interface Review {
  id: string
  rating: number
  content: string | null
  createdAt: string
  user: {
    id: string
    name: string | null
    image: string | null
  }
}

interface Book {
  id: string
  title: string
  author: string
  description: string | null
  coverImage: string | null
  genre: string | null
  publishedYear: number | null
  pageCount: number | null
  available: boolean
  featured: boolean
  borrowedBy: string | null
  borrowedAt: Date | null
  dueDate: Date | null
  createdAt: Date
}

export default function BookDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const bookId = params?.id as string

  const [book, setBook] = useState<Book | null>(null)
  const [loading, setLoading] = useState(true)
  const [borrowing, setBorrowing] = useState(false)
  const [returning, setReturning] = useState(false)
  const [reviews, setReviews] = useState<Review[]>([])
  const [rating, setRating] = useState<number>(0)
  const [hoverRating, setHoverRating] = useState<number>(0)
  const [content, setContent] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [userReview, setUserReview] = useState<Review | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isInReadingList, setIsInReadingList] = useState(false)
  const [addingToList, setAddingToList] = useState(false)

  // Fetch book and reviews only when bookId changes
  useEffect(() => {
    if (bookId) {
      fetchBook()
      fetchReviews()
    }
  }, [bookId])

  // Check reading list when bookId or session changes
  useEffect(() => {
    if (bookId) {
      checkReadingList()
    }
  }, [bookId, session?.user?.id])

  const checkReadingList = async () => {
    if (!session?.user?.id) {
      setIsInReadingList(false)
      return
    }

    try {
      const res = await fetch('/api/reading-list', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!res.ok) {
        // 401 Unauthorized ise session yok demektir
        if (res.status === 401) {
          setIsInReadingList(false)
          return
        }
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      
      const data = await res.json()
      const bookInList = data.some((item: any) => item.book.id === bookId)
      setIsInReadingList(bookInList)
    } catch (error) {
      setIsInReadingList(false)
    }
  }

  const fetchReviews = async () => {
    try {
      const res = await fetch(`/api/books/${bookId}/reviews`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      
      const data = await res.json()
      setReviews(data)
      
      // Check if user has already reviewed
      if (session?.user?.id) {
        const userRev = data.find((r: Review) => r.user.id === session.user.id)
        if (userRev) {
          setUserReview(userRev)
        }
      }
    } catch (error) {
      setReviews([])
    }
  }

  const fetchBook = async () => {
    try {
      const res = await fetch(`/api/books/${bookId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`)
      }
      
      const data = await res.json()
      setBook(data)
    } catch (error) {
      router.push('/library')
    } finally {
      setLoading(false)
    }
  }

  const handleBorrow = async () => {
    if (!session) {
      router.push('/auth/signin')
      return
    }

    setBorrowing(true)
    try {
      const res = await fetch(`/api/books/${bookId}/borrow`, {
        method: 'POST'
      })

      if (res.ok) {
        fetchBook()
      } else {
        const error = await res.json()
        alert(error.error || 'Kitap ödünç alınamadı')
      }
    } catch (error) {
      alert('Bir hata oluştu')
    } finally {
      setBorrowing(false)
    }
  }

  const handleReturn = async () => {
    setReturning(true)
    try {
      const res = await fetch(`/api/books/${bookId}/return`, {
        method: 'POST'
      })

      if (res.ok) {
        fetchBook()
      } else {
        const error = await res.json()
        alert(error.error || 'Kitap iade edilemedi')
      }
    } catch (error) {
      alert('Bir hata oluştu')
    } finally {
      setReturning(false)
    }
  }

  const handleAddToReadingList = async () => {
    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (isInReadingList) {
      return // Already in list
    }

    setAddingToList(true)
    try {
      const res = await fetch('/api/reading-list', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookId })
      })

      if (res.ok) {
        setIsInReadingList(true)
      } else {
        const error = await res.json()
        alert(error.error || 'Kitap listeye eklenemedi')
      }
    } catch (error) {
      alert('Bir hata oluştu')
    } finally {
      setAddingToList(false)
    }
  }

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (rating === 0) {
      alert('Lütfen bir yıldız değerlendirmesi seçin')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/books/${bookId}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating, content: content.trim() || null })
      })

      if (res.ok) {
        setRating(0)
        setContent("")
        setIsEditing(false)
        fetchReviews()
        alert(userReview ? 'Değerlendirmeniz güncellendi!' : 'Değerlendirmeniz eklendi!')
      } else {
        const error = await res.json()
        alert(error.error || 'Değerlendirme eklenemedi')
      }
    } catch (error) {
      alert('Bir hata oluştu')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteReview = async (reviewId: string) => {
    if (!confirm('Değerlendirmeyi silmek istediğinizden emin misiniz?')) return

    try {
      const res = await fetch(`/api/books/${bookId}/reviews?reviewId=${reviewId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        fetchReviews()
        setUserReview(null)
        setRating(0)
        setContent("")
        setIsEditing(false)
      }
    } catch (error) {
    }
  }

  const formatDate = (dateString: Date | null) => {
    if (!dateString) return ''
    return new Intl.DateTimeFormat('tr-TR', { 
      day: 'numeric', 
      month: 'long',
      year: 'numeric'
    }).format(new Date(dateString))
  }

  const getDaysRemaining = (dueDate: Date | null) => {
    if (!dueDate) return 0
    const now = new Date()
    const due = new Date(dueDate)
    const diff = due.getTime() - now.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  if (loading) {
    return (
      <div className="container py-4 sm:py-8 px-3 sm:px-4 max-w-6xl">
        <div className="animate-pulse space-y-3 sm:space-y-4">
          <div className="h-10 sm:h-12 bg-muted rounded w-1/3"></div>
          <div className="grid md:grid-cols-2 gap-4 sm:gap-8">
            <div className="aspect-[3/4] bg-muted rounded"></div>
            <div className="space-y-3 sm:space-y-4">
              <div className="h-6 sm:h-8 bg-muted rounded"></div>
              <div className="h-5 sm:h-6 bg-muted rounded w-2/3"></div>
              <div className="h-24 sm:h-32 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!book) {
    return (
      <div className="container py-4 sm:py-8 px-3 sm:px-4 text-center">
        <h1 className="text-xl sm:text-2xl font-bold mb-4">Kitap bulunamadı</h1>
        <Button asChild size="sm">
          <Link href="/library">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kütüphaneye Dön
          </Link>
        </Button>
      </div>
    )
  }

  const isBorrowedByCurrentUser = session?.user?.id === book.borrowedBy
  const daysRemaining = getDaysRemaining(book.dueDate)
  const isOverdue = daysRemaining < 0
  
  const averageRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0

  return (
    <div className="container py-4 sm:py-8 px-3 sm:px-4 max-w-6xl">
      {/* Back Button */}
      <Button variant="ghost" className="mb-4 sm:mb-6" asChild size="sm">
        <Link href="/library">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kütüphaneye Dön
        </Link>
      </Button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8"
      >
        {/* Book Cover */}
        <div className="relative">
          <div className="aspect-[3/4] relative rounded-2xl overflow-hidden shadow-2xl">
            <Image
              src={book.coverImage || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800"}
              alt={book.title}
              fill
              className="object-cover"
              priority
            />
          </div>
          {book.featured && (
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-amber-500 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-bold flex items-center gap-1.5 sm:gap-2 shadow-lg">
              <Star className="h-3 w-3 sm:h-4 sm:w-4 fill-current" />
              Öne Çıkan
            </div>
          )}
        </div>

        {/* Book Info */}
        <div className="space-y-4 sm:space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3">{book.title}</h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-3 sm:mb-4">{book.author}</p>
            
            {book.genre && (
              <span className="inline-block bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-medium">
                {book.genre}
              </span>
            )}
          </div>

          {/* Status Card */}
          <Card className={`border-2 ${
            book.available 
              ? 'border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950/20' 
              : 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/20'
          }`}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center gap-2 sm:gap-3">
                {book.available ? (
                  <>
                    <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                    <div>
                      <p className="text-base sm:text-lg font-bold text-green-700 dark:text-green-400">Müsait</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">Kitap ödünç alınabilir</p>
                    </div>
                  </>
                ) : (
                  <>
                    <XCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
                    <div>
                      <p className="text-base sm:text-lg font-bold text-red-700 dark:text-red-400">Ödünçte</p>
                      {isBorrowedByCurrentUser ? (
                        <>
                          <p className="text-xs sm:text-sm text-muted-foreground">Sizde ödünçte</p>
                          {book.dueDate && (
                            <p className={`text-xs font-medium mt-1 ${
                              isOverdue ? 'text-red-600' : 'text-amber-600'
                            }`}>
                              <Clock className="h-3 w-3 inline mr-1" />
                              {isOverdue 
                                ? `${Math.abs(daysRemaining)} gün gecikti!` 
                                : `İade tarihi: ${formatDate(book.dueDate)} (${daysRemaining} gün kaldı)`
                              }
                            </p>
                          )}
                        </>
                      ) : (
                        <p className="text-xs sm:text-sm text-muted-foreground">Başka biri tarafından ödünç alındı</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex flex-col gap-2 sm:gap-3">
            {book.available ? (
              <Button 
                size="lg" 
                className="w-full h-11 sm:h-12 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-sm sm:text-base"
                onClick={handleBorrow}
                disabled={borrowing || !session}
              >
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                {borrowing ? 'Ödünç Alınıyor...' : 'Ödünç Al'}
              </Button>
            ) : isBorrowedByCurrentUser ? (
              <Button 
                size="lg" 
                className="w-full h-11 sm:h-12 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-sm sm:text-base"
                onClick={handleReturn}
                disabled={returning}
              >
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                {returning ? 'İade Ediliyor...' : 'İade Et'}
              </Button>
            ) : (
              <Button size="lg" className="w-full h-11 sm:h-12 text-sm sm:text-base" disabled>
                <XCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                Şu An Müsait Değil
              </Button>
            )}

            <Button 
              size="lg" 
              variant={isInReadingList ? "default" : "outline"}
              className={`w-full h-11 sm:h-12 text-sm sm:text-base ${isInReadingList ? 'bg-green-600 hover:bg-green-700 text-white' : ''}`}
              onClick={handleAddToReadingList}
              disabled={!session || isInReadingList || addingToList}
            >
              {isInReadingList ? (
                <>
                  <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  Okuma Listene Eklendi
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                  {addingToList ? 'Ekleniyor...' : 'Okuma Listeme Ekle'}
                </>
              )}
            </Button>

            {!session && (
              <p className="text-xs text-center text-muted-foreground">
                Kitap ödünç almak için <Link href="/auth/signin" className="text-amber-600 hover:underline">giriş yapın</Link>
              </p>
            )}
          </div>

          {/* Book Details */}
          <Card>
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-lg sm:text-xl">Kitap Bilgileri</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-4 sm:p-6 pt-0">
              {book.publishedYear && (
                <div className="flex items-center gap-2 sm:gap-3">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Yayın Yılı</p>
                    <p className="font-medium text-sm sm:text-base">{book.publishedYear}</p>
                  </div>
                </div>
              )}
              {book.pageCount && (
                <div className="flex items-center gap-2 sm:gap-3">
                  <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs sm:text-sm text-muted-foreground">Sayfa Sayısı</p>
                    <p className="font-medium text-sm sm:text-base">{book.pageCount}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-2 sm:gap-3">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground">Yazar</p>
                  <p className="font-medium text-sm sm:text-base">{book.author}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Description */}
          {book.description && (
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-lg sm:text-xl">Açıklama</CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <p className="leading-relaxed whitespace-pre-wrap text-muted-foreground text-sm sm:text-base">
                  {book.description}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Reviews Summary */}
          {reviews.length > 0 && (
            <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="text-center">
                    <div className="text-3xl sm:text-4xl font-bold text-amber-600 dark:text-amber-500 mb-1">
                      {averageRating.toFixed(1)}
                    </div>
                    <div className="flex gap-0.5 sm:gap-1 mb-1">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const difference = averageRating - (star - 1)
                        
                        return (
                          <div key={star} className="relative h-4 w-4 sm:h-5 sm:w-5">
                            {difference >= 1 ? (
                              // Tam yıldız
                              <Star className="h-full w-full fill-amber-400 text-amber-400" />
                            ) : difference > 0 ? (
                              // Kısmi yıldız
                              <>
                                <Star className="h-full w-full text-gray-300 dark:text-gray-600 fill-gray-300 dark:fill-gray-600 absolute" />
                                <div className="overflow-hidden absolute inset-0" style={{ width: `${difference * 100}%` }}>
                                  <Star className="h-full w-full fill-amber-400 text-amber-400" />
                                </div>
                              </>
                            ) : (
                              // Boş yıldız
                              <Star className="h-full w-full text-gray-300 dark:text-gray-600 fill-gray-300 dark:fill-gray-600" />
                            )}
                          </div>
                        )
                      })}
                    </div>
                    <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
                      {reviews.length} değerlendirme
                    </p>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 sm:mb-2">
                      Kullanıcı Değerlendirmeleri
                    </p>
                    <p className="text-[10px] sm:text-xs text-gray-600 dark:text-gray-400">
                      {reviews.length} kişi bu kitabı değerlendirdi
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Add Review Form */}
          {session && (!userReview || isEditing) && (
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                  <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
                  {userReview ? 'Değerlendirmenizi Düzenleyin' : 'Değerlendirme Yapın'}
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <form onSubmit={handleSubmitReview} className="space-y-3 sm:space-y-4">
                  <div>
                    <Label className="mb-2 block text-sm sm:text-base">Yıldız Puanı</Label>
                    <div className="flex gap-1.5 sm:gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="focus:outline-none transition-transform hover:scale-110 active:scale-95"
                        >
                          <Star
                            className={`h-7 w-7 sm:h-8 sm:w-8 ${
                              star <= (hoverRating || rating)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="content" className="mb-2 block text-sm sm:text-base">Yorumunuz (Opsiyonel)</Label>
                    <textarea
                      id="content"
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      placeholder="Kitap hakkındaki düşüncelerinizi paylaşın..."
                      className="w-full min-h-[100px] sm:min-h-[120px] px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-amber-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm sm:text-base"
                      disabled={submitting}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      type="submit" 
                      disabled={submitting || rating === 0}
                      className="bg-amber-600 hover:bg-amber-700 text-white text-sm sm:text-base h-9 sm:h-10"
                    >
                      {submitting ? 'Gönderiliyor...' : userReview ? 'Güncelle' : 'Değerlendirmeyi Gönder'}
                    </Button>
                    {userReview && isEditing && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false)
                          setRating(0)
                          setContent("")
                        }}
                        className="text-sm sm:text-base h-9 sm:h-10"
                      >
                        İptal
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* User's Own Review Display */}
          {session && userReview && !isEditing && (
            <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="flex items-center justify-between flex-wrap gap-2">
                  <span className="flex items-center gap-2 text-base sm:text-lg">
                    <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
                    Sizin Değerlendirmeniz
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setIsEditing(true)
                        setRating(userReview.rating)
                        setContent(userReview.content || "")
                      }}
                      className="bg-white dark:bg-gray-900 text-xs sm:text-sm h-8 sm:h-9"
                    >
                      <Pencil className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      Düzenle
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteReview(userReview.id)}
                      className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 bg-white dark:bg-gray-900 text-xs sm:text-sm h-8 sm:h-9"
                    >
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                      Sil
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="flex gap-0.5 sm:gap-1 mb-2 sm:mb-3">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`h-4 w-4 sm:h-5 sm:w-5 ${
                        star <= userReview.rating
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-gray-300 dark:text-gray-600'
                      }`}
                    />
                  ))}
                </div>
                {userReview.content && (
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap bg-white dark:bg-gray-900 p-3 sm:p-4 rounded-lg text-sm sm:text-base">
                    {userReview.content}
                  </p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 sm:mt-3">
                  {new Date(userReview.createdAt).toLocaleDateString('tr-TR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </CardContent>
            </Card>
          )}

          {!session && (
            <Card className="border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <CardContent className="py-6 sm:py-8 text-center">
                <MessageSquare className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 dark:text-gray-600 mx-auto mb-2 sm:mb-3" />
                <p className="text-gray-600 dark:text-gray-400 mb-3 sm:mb-4 text-sm sm:text-base">
                  Değerlendirme yapmak için giriş yapın
                </p>
                <Button asChild className="bg-amber-600 hover:bg-amber-700 text-white text-sm sm:text-base h-9 sm:h-10">
                  <Link href="/auth/signin">
                    Giriş Yap
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Reviews List */}
          <Card className="border-gray-200 dark:border-gray-700">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
                Kullanıcı Değerlendirmeleri ({reviews.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              {reviews.length === 0 ? (
                <div className="text-center py-6 sm:py-8">
                  <MessageSquare className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 dark:text-gray-600 mx-auto mb-2 sm:mb-3" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">
                    Henüz değerlendirme yapılmamış. İlk değerlendiren siz olun!
                  </p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                  {reviews.filter(review => review.user.id !== session?.user?.id).map((review) => (
                    <div
                      key={review.id}
                      className="p-3 sm:p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2 gap-2">
                        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                          {review.user.image ? (
                            <img
                              src={review.user.image}
                              alt={review.user.name || "User"}
                              className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center flex-shrink-0">
                              <span className="text-amber-700 dark:text-amber-300 font-semibold text-sm sm:text-base">
                                {review.user.name?.[0]?.toUpperCase() || '?'}
                              </span>
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-gray-900 dark:text-gray-100 text-sm sm:text-base truncate">
                              {review.user.name || 'İsimsiz Kullanıcı'}
                            </p>
                            <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                              {new Date(review.createdAt).toLocaleDateString('tr-TR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                        {(session?.user?.id === review.user.id || session?.user?.role === 'ADMIN') && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteReview(review.id)}
                            className="text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 h-8 w-8 sm:h-9 sm:w-9 p-0 flex-shrink-0"
                          >
                            <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                          </Button>
                        )}
                      </div>
                      <div className="flex gap-0.5 sm:gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-3 w-3 sm:h-4 sm:w-4 ${
                              star <= review.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                      {review.content && (
                        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap text-sm sm:text-base">
                          {review.content}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </motion.div>
    </div>
  )
}
