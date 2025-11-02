"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { 
  Calendar, MapPin, Clock, Users, ArrowLeft, Star, 
  MessageCircle, Camera, Trash2, Send, Map, Check, X, Upload, Edit2, Trophy 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ImageUpload } from "@/components/image-upload"

interface Event {
  id: string
  title: string
  description: string
  location: string
  locationLat: number | null
  locationLng: number | null
  isOnline: boolean
  startDate: string
  endDate: string | null
  time: string
  eventType: string
  image: string | null
  maxAttendees: number | null
  attendeeCount: number | null
  status: string
  comments: Comment[]
  photos: Photo[]
  averageRating: number | null
  totalRatings: number
  _count: {
    rsvps: number
    comments: number
    photos: number
  }
  rsvps?: {
    userId: string
    user: {
      id: string
      name: string | null
      email: string
      image: string | null
    }
  }[]
}

interface Comment {
  id: string
  content: string
  rating: number | null
  createdAt: string
  user: {
    id: string
    name: string
    image: string | null
    level?: number
    activityScore?: number
  }
}

interface Photo {
  id: string
  url: string
  caption: string | null
  createdAt: string
  user: {
    id: string
    name: string
    image: string | null
  }
}

export default function EventDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [event, setEvent] = useState<Event | null>(null)
  const [loading, setLoading] = useState(true)
  const [commentText, setCommentText] = useState("")
  const [rating, setRating] = useState<number | null>(null)
  const [photoUrl, setPhotoUrl] = useState("")
  const [photoCaption, setPhotoCaption] = useState("")
  const [photoUrls, setPhotoUrls] = useState<string[]>([''])
  const [submitting, setSubmitting] = useState(false)
  const [rsvpLoading, setRsvpLoading] = useState(false)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const [editRating, setEditRating] = useState<number | null>(null)

  useEffect(() => {
    if (params.id) {
      fetchEvent()
    }
  }, [params.id])

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/events?id=${params.id}`)
      const data = await response.json()
      setEvent(data)
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim() || !session) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/events/${params.id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: commentText,
          rating: rating,
        }),
      })

      if (response.ok) {
        setCommentText("")
        setRating(null)
        fetchEvent() // Refresh
      } else {
        const error = await response.json()
        alert(error.error || 'Yorum eklenemedi')
      }
    } catch (error) {
      alert('Bir hata oluştu')
    } finally {
      setSubmitting(false)
    }
  }

  const handlePhotoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session) return

    setSubmitting(true)
    try {
      // ImageUpload component already handles Cloudinary upload and Google Drive conversion
      // photoUrls array contains ready-to-use Cloudinary URLs
      const validUrls = photoUrls.filter(url => url.trim() !== '')

      if (validUrls.length === 0) {
        alert('Lütfen en az bir fotoğraf ekleyin')
        setSubmitting(false)
        return
      }

      // Tüm fotoğrafları API'ye gönder
      const uploadPromises = validUrls.map(url => 
        fetch(`/api/events/${params.id}/photos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            url: url.trim(),
            caption: photoCaption || null,
          }),
        })
      )

      const responses = await Promise.all(uploadPromises)
      const failedUploads: Array<{url: string, error: string}> = []
      
      for (let i = 0; i < responses.length; i++) {
        if (!responses[i].ok) {
          const errorData = await responses[i].json().catch(() => ({ error: 'Bilinmeyen hata' }))
          failedUploads.push({
            url: validUrls[i],
            error: errorData.error || responses[i].statusText
          })
        }
      }

      if (failedUploads.length > 0) {
        console.error('Başarısız yüklemeler:', failedUploads)
        const errorMessages = failedUploads.map(f => `• ${f.error}`).join('\n')
        alert(`${failedUploads.length} fotoğraf eklenemedi:\n\n${errorMessages}`)
      }

      // Başarılı yüklemeler varsa formu temizle ve yenile
      if (failedUploads.length < validUrls.length) {
        setPhotoUrls([''])
        setPhotoCaption("")
        fetchEvent()
      }
    } catch (error) {
      alert('Bir hata oluştu')
    } finally {
      setSubmitting(false)
    }
  }

  const addPhotoUrlField = () => {
    setPhotoUrls([...photoUrls, ''])
  }

  const removePhotoUrlField = (index: number) => {
    if (photoUrls.length > 1) {
      setPhotoUrls(photoUrls.filter((_, i) => i !== index))
    }
  }

  const updatePhotoUrl = (index: number, value: string) => {
    const newUrls = [...photoUrls]
    newUrls[index] = value
    setPhotoUrls(newUrls)
  }

  const handleDeleteComment = async (commentId: string) => {
    if (!confirm('Yorumu silmek istediğinizden emin misiniz?')) return

    try {
      const response = await fetch(`/api/events/${params.id}/comments?commentId=${commentId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchEvent()
      }
    } catch (error) {
    }
  }

  const startEditComment = (comment: Comment) => {
    setEditingCommentId(comment.id)
    setEditContent(comment.content)
    setEditRating(comment.rating)
  }

  const cancelEditComment = () => {
    setEditingCommentId(null)
    setEditContent("")
    setEditRating(null)
  }

  const handleUpdateComment = async (commentId: string) => {
    if (!editContent.trim()) return

    setSubmitting(true)
    try {
      const response = await fetch(`/api/events/${params.id}/comments?commentId=${commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: editContent,
          rating: editRating,
        }),
      })

      if (response.ok) {
        setEditingCommentId(null)
        setEditContent("")
        setEditRating(null)
        fetchEvent()
      } else {
        const error = await response.json()
        alert(error.error || 'Yorum güncellenemedi')
      }
    } catch (error) {
      alert('Bir hata oluştu')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('Fotoğrafı silmek istediğinizden emin misiniz?')) return

    try {
      const response = await fetch(`/api/events/${params.id}/photos?photoId=${photoId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchEvent()
      }
    } catch (error) {
    }
  }

  const handleRSVP = async () => {
    if (!session) {
      alert('Etkinliğe katılmak için giriş yapmalısınız')
      router.push('/auth/signin')
      return
    }

    setRsvpLoading(true)
    try {
      const isUserRSVP = event?.rsvps?.some(rsvp => rsvp.userId === session.user?.id)

      if (isUserRSVP) {
        // Katılımdan çık
        const response = await fetch(`/api/events/rsvp?eventId=${params.id}`, {
          method: 'DELETE',
        })

        if (response.ok) {
          fetchEvent()
        } else {
          const error = await response.json()
          alert(error.error || 'Katılımdan çıkılamadı')
        }
      } else {
        // Katıl
        const response = await fetch('/api/events/rsvp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            eventId: params.id,
            status: 'going',
          }),
        })

        if (response.ok) {
          fetchEvent()
        } else {
          const error = await response.json()
          alert(error.error || 'Katılım sağlanamadı')
        }
      }
    } catch (error) {
      alert('Bir hata oluştu')
    } finally {
      setRsvpLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="container py-20 px-4">
        <div className="animate-pulse space-y-8">
          <div className="h-96 bg-gray-200 dark:bg-gray-700 rounded-2xl"></div>
          <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="container py-20 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Etkinlik bulunamadı</h1>
        <Button asChild>
          <Link href="/events">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Etkinliklere Dön
          </Link>
        </Button>
      </div>
    )
  }

  const eventDate = new Date(event.startDate)
  const day = eventDate.getDate()
  const month = eventDate.getMonth() + 1
  const year = eventDate.getFullYear()
  const formattedDate = `${day}/${month}/${year}`

  const isCompleted = event.status === 'COMPLETED'
  const canAddContent = isCompleted && session
  const isUserRSVP = event.rsvps?.some(rsvp => rsvp.userId === session?.user?.id)
  
  // Etkinlik dolu mu kontrolü - geçmiş etkinlikler için attendeeCount, upcoming için _count.rsvps
  const currentAttendees = event.attendeeCount !== null && event.attendeeCount !== undefined 
    ? event.attendeeCount 
    : event._count.rsvps
  const isEventFull = event.maxAttendees ? currentAttendees >= event.maxAttendees : false
  
  const canJoin = session && event.status === 'UPCOMING' && (!isEventFull || isUserRSVP)
  const hasUserCommented = event.comments.some(comment => comment.user.id === session?.user?.id)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F0E8] to-[#E8DED0] dark:from-gray-900 dark:to-gray-800">
      <div className="container py-4 sm:py-8 px-3 sm:px-4 max-w-6xl">
        {/* Back Button */}
        <Button variant="ghost" className="mb-4 sm:mb-6 -ml-2 sm:ml-0" asChild>
          <Link href="/events">
            <ArrowLeft className="mr-2 h-4 w-4" />
            <span className="hidden sm:inline">Etkinliklere Dön</span>
            <span className="sm:hidden">Geri</span>
          </Link>
        </Button>

        {/* Hero Image */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative aspect-[16/9] sm:aspect-[21/9] w-full rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl mb-4 sm:mb-8"
        >
          <Image
            src={event.image || "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=1200"}
            alt={event.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent">
            <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-6">
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                <span className={`px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold ${
                  event.status === 'COMPLETED' 
                    ? 'bg-blue-500/90 text-white'
                    : event.status === 'ONGOING'
                    ? 'bg-orange-500/90 text-white'
                    : 'bg-green-500/90 text-white'
                }`}>
                  {event.status === 'COMPLETED' ? 'Tamamlandı' : event.status === 'ONGOING' ? 'Devam Ediyor' : 'Yaklaşan'}
                </span>
                {event.eventType && (
                  <span className="px-2 sm:px-3 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-semibold bg-white/20 backdrop-blur-sm text-white">
                    {event.eventType}
                  </span>
                )}
              </div>
              <h1 className="text-lg sm:text-2xl md:text-3xl font-bold text-white mb-1.5 sm:mb-2 leading-tight">
                {event.title}
              </h1>
              {/* Ortalama Rating - Sadece geçmiş etkinlikler için */}
              {isCompleted && event.averageRating !== null && (
                <div className="flex items-center gap-1.5 sm:gap-2 mt-1 sm:mt-2">
                  <div className="flex items-center gap-1 sm:gap-1.5 bg-white/20 backdrop-blur-sm px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3 sm:h-4 w-3 sm:w-4 ${
                            star <= Math.round(event.averageRating!)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'fill-white/40 text-white/40'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-white font-bold text-sm sm:text-base">
                      {event.averageRating.toFixed(1)}
                    </span>
                    <span className="text-white/80 text-[10px] sm:text-xs">
                      ({event.totalRatings})
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
            {/* Event Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Etkinlik Detayları</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="flex items-center gap-2 sm:gap-3 text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                  <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                  <span className="font-medium">{formattedDate}</span>
                </div>
                {event.time && (
                  <div className="flex items-center gap-2 sm:gap-3 text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                    <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                    <span className="font-medium">{event.time}</span>
                  </div>
                )}
                <div className="flex items-start gap-2 sm:gap-3 text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                  <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span className="font-medium break-words">{event.location}</span>
                </div>
                {event.maxAttendees && (
                  <div className="flex items-center gap-2 sm:gap-3 text-gray-700 dark:text-gray-300 text-sm sm:text-base">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                    <span className="font-medium">
                      {event.attendeeCount !== null && event.attendeeCount !== undefined 
                        ? event.attendeeCount 
                        : event._count.rsvps
                      } / {event.maxAttendees} Katılımcı
                    </span>
                  </div>
                )}
                {event.description && (
                  <div className="pt-3 sm:pt-4 border-t">
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed whitespace-pre-wrap break-words">
                      {event.description}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Google Maps */}
            {event.locationLat && event.locationLng && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Map className="h-4 w-4 sm:h-5 sm:w-5" />
                    Konum
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${event.locationLat},${event.locationLng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block group"
                  >
                    <div className="relative aspect-video rounded-lg overflow-hidden border-2 border-primary/20 group-hover:border-primary transition-colors cursor-pointer">
                      <iframe
                        width="100%"
                        height="100%"
                        frameBorder="0"
                        style={{ border: 0, pointerEvents: 'none' }}
                        src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY'}&q=${event.locationLat},${event.locationLng}&zoom=15`}
                        allowFullScreen
                      ></iframe>
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-900 px-4 sm:px-6 py-2 sm:py-3 rounded-full shadow-lg">
                          <span className="flex items-center gap-2 font-semibold text-primary text-sm sm:text-base">
                            <MapPin className="h-4 w-4 sm:h-5 sm:w-5" />
                            <span className="hidden sm:inline">Google Maps&apos;te Aç</span>
                            <span className="sm:hidden">Haritada Aç</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </a>
                  <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs sm:text-sm text-muted-foreground flex items-start gap-2">
                      <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary flex-shrink-0 mt-0.5" />
                      <span className="font-medium break-words">{event.location}</span>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1 ml-5 sm:ml-6">
                      💡 Haritaya tıklayarak Google Maps&apos;te detaylı konum bilgisi alabilirsiniz
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Comments Section */}
            {isCompleted && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <MessageCircle className="h-4 w-4 sm:h-5 sm:w-5" />
                    Yorumlar ({event._count.comments})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  {/* Add Comment Form */}
                  {canAddContent && !hasUserCommented && (
                    <form onSubmit={handleCommentSubmit} className="space-y-3 sm:space-y-4 p-3 sm:p-4 bg-muted/50 rounded-lg">
                      <div>
                        <Label htmlFor="rating" className="text-sm sm:text-base">Puanlama (Opsiyonel)</Label>
                        <div className="flex gap-1.5 sm:gap-2 mt-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setRating(star)}
                              className="focus:outline-none touch-manipulation"
                            >
                              <Star
                                className={`h-7 w-7 sm:h-8 sm:w-8 ${
                                  rating && star <= rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            </button>
                          ))}
                          {rating && (
                            <button
                              type="button"
                              onClick={() => setRating(null)}
                              className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 ml-2 touch-manipulation"
                            >
                              Temizle
                            </button>
                          )}
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="comment" className="text-sm sm:text-base">Yorumunuz</Label>
                        <textarea
                          id="comment"
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder="Etkinlik hakkındaki düşüncelerinizi paylaşın..."
                          className="w-full min-h-[100px] sm:min-h-[120px] px-3 py-2 mt-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
                          disabled={submitting}
                        />
                      </div>
                      <Button type="submit" disabled={submitting || !commentText.trim()} className="w-full sm:w-auto">
                        <Send className="h-4 w-4 mr-2" />
                        {submitting ? 'Gönderiliyor...' : 'Yorum Yap'}
                      </Button>
                    </form>
                  )}

                  {/* Kullanıcı zaten yorum yaptıysa */}
                  {canAddContent && hasUserCommented && (
                    <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <p className="text-xs sm:text-sm text-blue-700 dark:text-blue-300 flex items-start gap-2">
                        <Check className="h-4 w-4 flex-shrink-0 mt-0.5" />
                        <span>Bu etkinliğe zaten yorum yaptınız. Her etkinliğe sadece bir kez yorum yapabilirsiniz.</span>
                      </p>
                    </div>
                  )}

                  {/* Comments List */}
                  <div className="space-y-3 sm:space-y-4">
                    {event.comments.length === 0 ? (
                      <p className="text-center text-muted-foreground py-6 sm:py-8 text-sm sm:text-base">
                        Henüz yorum yapılmamış. İlk yorumu siz yapın!
                      </p>
                    ) : (
                      event.comments.map((comment) => (
                        <div
                          key={comment.id}
                          className="p-3 sm:p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                        >
                          {editingCommentId === comment.id ? (
                            // Düzenleme Modu
                            <div className="space-y-3 sm:space-y-4">
                              <div>
                                <Label className="text-sm sm:text-base">Puanlama</Label>
                                <div className="flex gap-1.5 sm:gap-2 mt-2">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <button
                                      key={star}
                                      type="button"
                                      onClick={() => setEditRating(star)}
                                      className="focus:outline-none touch-manipulation"
                                    >
                                      <Star
                                        className={`h-6 w-6 sm:h-7 sm:w-7 ${
                                          editRating && star <= editRating
                                            ? 'fill-yellow-400 text-yellow-400'
                                            : 'text-gray-300'
                                        }`}
                                      />
                                    </button>
                                  ))}
                                  {editRating && (
                                    <button
                                      type="button"
                                      onClick={() => setEditRating(null)}
                                      className="text-xs sm:text-sm text-gray-500 hover:text-gray-700 ml-2 touch-manipulation"
                                    >
                                      Temizle
                                    </button>
                                  )}
                                </div>
                              </div>
                              <div>
                                <Label className="text-sm sm:text-base">Yorum</Label>
                                <textarea
                                  value={editContent}
                                  onChange={(e) => setEditContent(e.target.value)}
                                  className="w-full min-h-[100px] sm:min-h-[120px] px-3 py-2 mt-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
                                  disabled={submitting}
                                />
                              </div>
                              <div className="flex flex-col sm:flex-row gap-2">
                                <Button
                                  onClick={() => handleUpdateComment(comment.id)}
                                  disabled={submitting || !editContent.trim()}
                                  size="sm"
                                  className="w-full sm:w-auto"
                                >
                                  {submitting ? 'Kaydediliyor...' : 'Kaydet'}
                                </Button>
                                <Button
                                  onClick={cancelEditComment}
                                  variant="outline"
                                  size="sm"
                                  disabled={submitting}
                                  className="w-full sm:w-auto"
                                >
                                  İptal
                                </Button>
                              </div>
                            </div>
                          ) : (
                            // Görüntüleme Modu
                            <>
                              <div className="flex items-start justify-between mb-3 gap-2">
                                <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1">
                                  {/* Avatar with Image */}
                                  <div className="relative flex-shrink-0">
                                    {comment.user.image ? (
                                      <img 
                                        src={comment.user.image} 
                                        alt={comment.user.name || "User"} 
                                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover border-2 border-primary/30"
                                      />
                                    ) : (
                                      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-bold text-lg sm:text-xl border-2 border-primary/30">
                                        {comment.user.name?.charAt(0) || '?'}
                                      </div>
                                    )}
                                    {/* Level Badge */}
                                    {comment.user.level && (
                                      <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-xs font-bold border-2 border-background shadow-lg">
                                        {comment.user.level}
                                      </div>
                                    )}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <p className="font-semibold text-sm sm:text-base truncate">{comment.user.name}</p>
                                      {comment.user.level && (
                                        <div className="flex items-center gap-1 bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 px-2 py-0.5 rounded-full">
                                          <Trophy className="h-3 w-3 text-amber-600 dark:text-amber-400" />
                                          <span className="text-xs font-bold text-amber-700 dark:text-amber-300">Seviye {comment.user.level}</span>
                                        </div>
                                      )}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                      {new Date(comment.createdAt).toLocaleDateString('tr-TR')}
                                    </p>
                                  </div>
                                </div>
                                {session?.user?.id === comment.user.id && (
                                  <div className="flex gap-1 flex-shrink-0">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => startEditComment(comment)}
                                      className="text-primary h-8 w-8 sm:h-9 sm:w-9 p-0"
                                    >
                                      <Edit2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteComment(comment.id)}
                                      className="text-destructive h-8 w-8 sm:h-9 sm:w-9 p-0"
                                    >
                                      <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                    </Button>
                                  </div>
                                )}
                                {session?.user?.role === 'ADMIN' && session?.user?.id !== comment.user.id && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteComment(comment.id)}
                                    className="text-destructive h-8 w-8 sm:h-9 sm:w-9 p-0 flex-shrink-0"
                                  >
                                    <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                  </Button>
                                )}
                              </div>
                              {comment.rating && (
                                <div className="flex gap-0.5 sm:gap-1 mb-2">
                                  {[...Array(5)].map((_, i) => (
                                    <Star
                                      key={i}
                                      className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
                                        i < comment.rating!
                                          ? 'fill-yellow-400 text-yellow-400'
                                          : 'text-gray-300'
                                      }`}
                                    />
                                  ))}
                                </div>
                              )}
                              <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
                                {comment.content}
                              </p>
                            </>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Photos Section */}
            {isCompleted && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Camera className="h-4 w-4 sm:h-5 sm:w-5" />
                    Fotoğraflar ({event._count.photos})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 sm:space-y-6">
                  {/* Add Photo Form */}
                  {canAddContent && (() => {
                    // Kullanıcının yüklediği fotoğraf sayısını hesapla
                    const userPhotoCount = event.photos.filter(p => p.user.id === session?.user?.id).length
                    const remainingPhotos = Math.max(0, 5 - userPhotoCount)
                    const canUploadMore = remainingPhotos > 0

                    return (
                    <form onSubmit={handlePhotoSubmit} className="space-y-3 sm:space-y-4 p-3 sm:p-4 bg-muted/50 rounded-lg">
                      {/* Limit Bilgisi */}
                      <div className="text-sm text-muted-foreground bg-blue-50 dark:bg-blue-950/30 p-3 rounded-lg border border-blue-200 dark:border-blue-800">
                        <p className="font-medium text-blue-700 dark:text-blue-400">
                          📸 {userPhotoCount}/5 fotoğraf yüklediniz
                          {canUploadMore && (
                            <span className="ml-2 text-blue-600 dark:text-blue-300">
                              ({remainingPhotos} fotoğraf daha ekleyebilirsiniz)
                            </span>
                          )}
                          {!canUploadMore && (
                            <span className="ml-2 text-orange-600 dark:text-orange-400">
                              (Maksimum limite ulaştınız)
                            </span>
                          )}
                        </p>
                      </div>

                      {canUploadMore && (
                      <>
                      {/* Photo URLs - ImageUpload Components */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <Label className="text-sm sm:text-base font-semibold">
                            Fotoğraf Ekle
                          </Label>
                          {photoUrls.length < remainingPhotos && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={addPhotoUrlField}
                              disabled={submitting}
                              className="text-xs sm:text-sm"
                            >
                              + Fotoğraf Ekle
                            </Button>
                          )}
                        </div>
                        
                        {photoUrls.map((url, index) => (
                          <div key={index} className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Label className="text-sm">Fotoğraf {index + 1}</Label>
                              {photoUrls.length > 1 && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removePhotoUrlField(index)}
                                  disabled={submitting}
                                  className="text-destructive h-6 px-2"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                            <ImageUpload
                              label=""
                              value={url}
                              onChange={(newUrl) => updatePhotoUrl(index, newUrl)}
                              id={`photo-${index}`}
                            />
                          </div>
                        ))}
                      </div>

                      <div>
                        <Label htmlFor="caption" className="text-sm sm:text-base">Ortak Açıklama (Opsiyonel)</Label>
                        <Input
                          id="caption"
                          value={photoCaption}
                          onChange={(e) => setPhotoCaption(e.target.value)}
                          placeholder="Tüm fotoğraflar için açıklama..."
                          disabled={submitting}
                          className="mt-2 text-sm sm:text-base"
                        />
                      </div>
                      <Button 
                        type="submit" 
                        disabled={submitting || photoUrls.every(url => !url.trim())}
                        className="w-full text-sm sm:text-base"
                      >
                        <Camera className="h-4 w-4 mr-2" />
                        {submitting ? 'Yükleniyor...' : `${photoUrls.filter(u => u.trim()).length} Fotoğraf Ekle`}
                      </Button>
                      </>
                      )}
                    </form>
                    )
                  })()}

                  {/* Photos Grid */}
                  {event.photos.length === 0 ? (
                    <p className="text-center text-muted-foreground py-6 sm:py-8 text-sm sm:text-base">
                      Henüz fotoğraf eklenmemiş.
                    </p>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                      {event.photos.map((photo) => {
                        // HEIC formatını JPG'ye dönüştür
                        const imageUrl = photo.url.replace(/\.heic$/i, '.jpg').replace(/\.HEIC$/i, '.jpg')
                        
                        return (
                        <div
                          key={photo.id}
                          className="group relative aspect-square rounded-lg overflow-hidden shadow-lg bg-gray-100 dark:bg-gray-800"
                        >
                          <Image
                            src={imageUrl}
                            alt={photo.caption || 'Event photo'}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-300"
                            unoptimized={imageUrl.includes('cloudinary')}
                            onError={(e) => {
                              console.error('Fotoğraf yüklenemedi:', imageUrl)
                              const target = e.target as HTMLImageElement
                              target.style.display = 'none'
                            }}
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/60 transition-colors">
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity p-2 sm:p-3 md:p-4 flex flex-col justify-between">
                              <div className="flex justify-end">
                                {(session?.user?.id === photo.user.id || session?.user?.role === 'ADMIN') && (
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeletePhoto(photo.id)}
                                    className="text-white hover:bg-red-500 h-8 w-8 sm:h-9 sm:w-9 p-0"
                                  >
                                    <Trash2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                  </Button>
                                )}
                              </div>
                              {photo.caption && (
                                <p className="text-white text-xs sm:text-sm font-medium line-clamp-2">
                                  {photo.caption}
                                </p>
                              )}
                              <p className="text-white/80 text-xs truncate">
                                {photo.user.name}
                              </p>
                            </div>
                          </div>
                        </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4 sm:space-y-6">
            {/* Katıl Butonu */}
            {canJoin && (
              <Card className="border-primary/50 bg-gradient-to-br from-primary/5 to-primary/10 sticky top-4">
                <CardContent className="pt-4 sm:pt-6">
                  <Button
                    onClick={handleRSVP}
                    disabled={rsvpLoading || (isEventFull && !isUserRSVP)}
                    className={`w-full h-11 sm:h-12 text-base sm:text-lg font-semibold touch-manipulation ${
                      isUserRSVP
                        ? 'bg-red-500 hover:bg-red-600'
                        : 'bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90'
                    }`}
                  >
                    {rsvpLoading ? (
                      'İşleniyor...'
                    ) : isUserRSVP ? (
                      <>
                        <Users className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        Katılımdan Çık
                      </>
                    ) : isEventFull ? (
                      'Etkinlik Dolu'
                    ) : (
                      <>
                        <Users className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                        Etkinliğe Katıl
                      </>
                    )}
                  </Button>
                  {isUserRSVP && (
                    <p className="text-center text-xs sm:text-sm text-green-600 dark:text-green-400 mt-2 sm:mt-3 font-medium">
                      ✓ Bu etkinliğe katılıyorsunuz
                    </p>
                  )}
                  {isEventFull && !isUserRSVP && (
                    <p className="text-center text-xs sm:text-sm text-red-600 dark:text-red-400 mt-2 sm:mt-3">
                      Etkinlik maksimum katılımcı sayısına ulaştı
                    </p>
                  )}
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Hızlı Bilgiler</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Durum</p>
                  <p className="font-semibold text-sm sm:text-base">
                    {event.status === 'COMPLETED' ? 'Tamamlandı' : event.status === 'ONGOING' ? 'Devam Ediyor' : 'Yaklaşan'}
                  </p>
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-muted-foreground mb-1">Katılımcılar</p>
                  <p className="font-semibold text-sm sm:text-base">{event._count.rsvps} kişi</p>
                </div>
                {isCompleted && (
                  <>
                    {event.averageRating !== null && (
                      <div>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-1">Ortalama Değerlendirme</p>
                        <div className="flex items-center gap-2">
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
                                  star <= Math.round(event.averageRating!)
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                          <p className="font-semibold text-sm sm:text-base">
                            {event.averageRating.toFixed(1)} ({event.totalRatings})
                          </p>
                        </div>
                      </div>
                    )}
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">Yorumlar</p>
                      <p className="font-semibold text-sm sm:text-base">{event._count.comments} yorum</p>
                    </div>
                    <div>
                      <p className="text-xs sm:text-sm text-muted-foreground mb-1">Fotoğraflar</p>
                      <p className="font-semibold text-sm sm:text-base">{event._count.photos} fotoğraf</p>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Katılımcı Listesi */}
            {event.rsvps && event.rsvps.length > 0 && (
              <Card className="border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600 dark:text-amber-500" />
                    Katılımcılar ({event.rsvps.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 sm:space-y-3 max-h-80 sm:max-h-96 overflow-y-auto pr-1 sm:pr-2">
                    {event.rsvps.map((rsvp) => (
                      <div 
                        key={rsvp.user.id} 
                        className="flex items-center gap-2 sm:gap-3 bg-white dark:bg-gray-900 rounded-lg p-2 sm:p-3 border border-gray-200 dark:border-gray-700 hover:border-amber-300 dark:hover:border-amber-700 transition-colors"
                      >
                        {rsvp.user.image ? (
                          <img 
                            src={rsvp.user.image} 
                            alt={rsvp.user.name || "User"} 
                            className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover border-2 border-amber-200 dark:border-amber-800 flex-shrink-0"
                          />
                        ) : (
                          <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center border-2 border-amber-200 dark:border-amber-800 flex-shrink-0">
                            <span className="text-amber-700 dark:text-amber-300 font-semibold text-xs sm:text-sm">
                              {rsvp.user.name?.[0]?.toUpperCase() || rsvp.user.email[0].toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm sm:text-base text-gray-900 dark:text-gray-100 truncate">
                            {rsvp.user.name || "İsimsiz Kullanıcı"}
                          </p>
                        </div>
                        <div className="flex-shrink-0">
                          <div className="bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 px-2 py-0.5 sm:py-1 rounded-full text-xs font-medium">
                            ✓
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Henüz Katılımcı Yok */}
            {(!event.rsvps || event.rsvps.length === 0) && (
              <Card className="border-gray-200 dark:border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Users className="h-4 w-4 sm:h-5 sm:w-5" />
                    Katılımcılar
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-center py-6 sm:py-8">
                  <Users className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 dark:text-gray-600 mx-auto mb-2 sm:mb-3" />
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    Henüz katılımcı yok
                  </p>
                  {event.status !== 'COMPLETED' && event.status !== 'CANCELLED' && (
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      İlk katılan siz olun!
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
