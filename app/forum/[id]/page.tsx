"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { 
  ArrowLeft, User, Clock, Eye, MessageSquare, Send, 
  Pin, Lock, Image as ImageIcon, Edit, Trash2, Save, X, Heart,
  Share2, Facebook, Twitter, Linkedin, Link2, Copy
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ImageUpload } from "@/components/image-upload"
import { isSuperAdmin } from "@/lib/admin"
import { UserLevelBadge } from "@/components/user-level-badge"

interface Badge {
  id: string
  name: string
  icon: string
  color: string
  isSpecial: boolean
}

interface ForumTopic {
  id: string
  title: string
  content: string
  category: string | null
  image: string | null
  views: number
  pinned: boolean
  locked: boolean
  edited: boolean
  createdAt: string
  user: {
    id: string
    name: string | null
    image: string | null
    userBadges: Array<{
      badge: Badge
    }>
    userLevel?: {
      level: number
      activityScore: number
      levelTitle: string
      levelIcon: string
      levelColor: string
    }
  }
  replies: ForumReply[]
  _count: {
    likes: number
  }
}

interface ForumReply {
  id: string
  content: string
  image: string | null
  link: string | null
  edited: boolean
  createdAt: string
  user: {
    id: string
    name: string | null
    image: string | null
    userBadges: Array<{
      badge: Badge
    }>
    userLevel?: {
      level: number
      activityScore: number
      levelTitle: string
      levelIcon: string
      levelColor: string
    }
  }
  parentReply?: {
    id: string
    content: string
    user: {
      id: string
      name: string | null
    }
  } | null
  _count: {
    likes: number
  }
}

const convertDriveLink = (url: string): string => {
  if (!url) return url
  if (url.includes('drive.google.com/uc?') || url.includes('drive.google.com/thumbnail')) return url
  const fileIdMatch = url.match(/\/d\/([^\/\?]+)/)
  if (fileIdMatch && fileIdMatch[1]) {
    return `https://drive.google.com/thumbnail?id=${fileIdMatch[1]}&sz=w1000`
  }
  return url
}

export default function ForumTopicPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const topicId = params?.id as string

  const [topic, setTopic] = useState<ForumTopic | null>(null)
  const [loading, setLoading] = useState(true)
  const [replyContent, setReplyContent] = useState("")
  const [replyImage, setReplyImage] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState("")
  const [editImage, setEditImage] = useState("")
  const [likedTopics, setLikedTopics] = useState<Set<string>>(new Set())
  const [likedReplies, setLikedReplies] = useState<Set<string>>(new Set())
  const [editingTopic, setEditingTopic] = useState(false)
  const [editTopicTitle, setEditTopicTitle] = useState("")
  const [editTopicContent, setEditTopicContent] = useState("")
  const [editTopicCategory, setEditTopicCategory] = useState("")
  const [editTopicImage, setEditTopicImage] = useState("")
  const [replyingToId, setReplyingToId] = useState<string | null>(null)
  const [replyingToUser, setReplyingToUser] = useState<string | null>(null)
  const [viewIncremented, setViewIncremented] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [copySuccess, setCopySuccess] = useState(false)

  useEffect(() => {
    if (topicId) {
      fetchTopic(true) // İlk yüklemede görüntülenmeyi artır
    }
  }, [topicId])

  // Paylaşım menüsünü dışarı tıklayınca kapat
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showShareMenu) {
        const target = event.target as HTMLElement
        if (!target.closest('.share-menu-container')) {
          setShowShareMenu(false)
        }
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [showShareMenu])

  const fetchTopic = async (incrementView = false) => {
    try {
      // İlk yükleme ve henüz görüntülenme artırılmadıysa, artır
      const shouldIncrementView = !viewIncremented && incrementView
      const url = shouldIncrementView 
        ? `/api/forum/${topicId}?incrementView=true`
        : `/api/forum/${topicId}`
      
      const res = await fetch(url)
      if (res.ok) {
        const data = await res.json()
        setTopic(data)
        
        // İlk yüklemede görüntülenme artırıldı olarak işaretle
        if (shouldIncrementView) {
          setViewIncremented(true)
        }
      } else {
        router.push('/forum')
      }
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (topic?.locked) {
      alert('Bu konu kilitli, yeni yorum eklenemez')
      return
    }

    setSubmitting(true)
    try {
      const res = await fetch(`/api/forum/${topicId}/replies`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: replyContent,
          image: convertDriveLink(replyImage) || null,
          parentReplyId: replyingToId
        })
      })

      if (res.ok) {
        setReplyContent("")
        setReplyImage("")
        setReplyingToId(null)
        setReplyingToUser(null)
        fetchTopic()
      }
    } catch (error) {
    } finally {
      setSubmitting(false)
    }
  }

  const handleEditReply = (reply: ForumReply) => {
    setEditingReplyId(reply.id)
    setEditContent(reply.content)
    setEditImage(reply.image || "")
  }

  const handleSaveEdit = async (replyId: string) => {
    try {
      const res = await fetch(`/api/forum/reply/${replyId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: editContent,
          image: convertDriveLink(editImage) || null
        })
      })

      if (res.ok) {
        setEditingReplyId(null)
        setEditContent("")
        setEditImage("")
        fetchTopic()
      }
    } catch (error) {
    }
  }

  const handleDeleteReply = async (replyId: string) => {
    if (!confirm('Bu yorumu silmek istediğinizden emin misiniz?')) {
      return
    }

    try {
      const res = await fetch(`/api/forum/reply/${replyId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        fetchTopic()
      }
    } catch (error) {
    }
  }

  const handleLikeTopic = async () => {
    if (!session) {
      router.push('/auth/signin')
      return
    }

    try {
      const res = await fetch(`/api/forum/topic/${topicId}/like`, {
        method: 'POST'
      })
      const data = await res.json()
      
      if (data.liked) {
        setLikedTopics(prev => new Set(prev).add(topicId))
      } else {
        setLikedTopics(prev => {
          const newSet = new Set(prev)
          newSet.delete(topicId)
          return newSet
        })
      }
      
      fetchTopic()
    } catch (error) {
    }
  }

  const handleLikeReply = async (replyId: string) => {
    if (!session) {
      router.push('/auth/signin')
      return
    }

    try {
      const res = await fetch(`/api/forum/reply/${replyId}/like`, {
        method: 'POST'
      })
      const data = await res.json()
      
      if (data.liked) {
        setLikedReplies(prev => new Set(prev).add(replyId))
      } else {
        setLikedReplies(prev => {
          const newSet = new Set(prev)
          newSet.delete(replyId)
          return newSet
        })
      }
      
      fetchTopic()
    } catch (error) {
    }
  }

  const handleEditTopic = () => {
    if (!topic) return
    setEditingTopic(true)
    setEditTopicTitle(topic.title)
    setEditTopicContent(topic.content)
    setEditTopicCategory(topic.category || "Tartışma")
    setEditTopicImage(topic.image || "")
  }

  const handleSaveTopicEdit = async () => {
    try {
      const res = await fetch(`/api/forum/${topicId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: editTopicTitle,
          content: editTopicContent,
          category: editTopicCategory,
          image: convertDriveLink(editTopicImage) || null
        })
      })

      if (res.ok) {
        setEditingTopic(false)
        fetchTopic()
      }
    } catch (error) {
    }
  }

  const handleDeleteTopic = async () => {
    if (!confirm('Bu konuyu silmek istediğinizden emin misiniz? Tüm yanıtlar da silinecektir.')) {
      return
    }

    try {
      const res = await fetch(`/api/forum/${topicId}`, {
        method: 'DELETE'
      })

      if (res.ok) {
        router.push('/forum')
      }
    } catch (error) {
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 60) return `${minutes} dakika önce`
    if (hours < 24) return `${hours} saat önce`
    if (days < 7) return `${days} gün önce`
    return new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long' }).format(date)
  }

  const getShareUrl = () => {
    if (typeof window === 'undefined') return ''
    return window.location.href
  }

  const getShareText = () => {
    if (!topic) return ''
    return `${topic.title}\n\n${topic.content.slice(0, 150)}${topic.content.length > 150 ? '...' : ''}\n\nOkuyamayanlar Kitap Kulübü`
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(getShareUrl())
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    } catch (err) {
      console.error('Link kopyalanamadı:', err)
    }
  }

  const handleShareTwitter = () => {
    const url = getShareUrl()
    const text = topic?.title || ''
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank')
  }

  const handleShareFacebook = () => {
    const url = getShareUrl()
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank')
  }

  const handleShareLinkedIn = () => {
    const url = getShareUrl()
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`, '_blank')
  }

  const handleShareWhatsApp = () => {
    const text = getShareText()
    const url = getShareUrl()
    window.open(`https://wa.me/?text=${encodeURIComponent(text + '\n' + url)}`, '_blank')
  }

  const handleNativeShare = async () => {
    // @ts-ignore - Navigator.share mobil cihazlarda var
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        // @ts-ignore
        await navigator.share({
          title: topic?.title || '',
          text: getShareText(),
          url: getShareUrl(),
        })
      } catch (err) {
        console.error('Paylaşım başarısız:', err)
      }
    }
  }

  const getCategoryColor = (category: string | null) => {
    const colors: Record<string, string> = {
      "Tartışma": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
      "Kitap Önerisi": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
      "Soru": "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
      "Duyuru": "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
      "İnceleme": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
    }
    return colors[category || ""] || "bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-400"
  }

  if (loading) {
    return (
      <div className="container py-4 sm:py-6 md:py-8 px-3 sm:px-4 max-w-4xl">
        <div className="animate-pulse space-y-4">
          <div className="h-10 sm:h-12 bg-muted rounded w-1/3"></div>
          <div className="h-48 sm:h-64 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  if (!topic) {
    return (
      <div className="container py-4 sm:py-6 md:py-8 px-3 sm:px-4 max-w-4xl text-center">
        <h1 className="text-xl sm:text-2xl font-bold mb-4">Konu bulunamadı</h1>
        <Button asChild>
          <Link href="/forum">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Foruma Dön
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container py-4 sm:py-6 md:py-8 px-3 sm:px-4 max-w-4xl">
      {/* Back Button */}
      <Button variant="ghost" className="mb-4 sm:mb-6 h-9 sm:h-10 text-sm sm:text-base" asChild>
        <Link href="/forum">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Foruma Dön
        </Link>
      </Button>

      {/* Topic Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <Card className="mb-4 sm:mb-6">
          <CardHeader className="space-y-3 sm:space-y-4 p-4 sm:p-6">
            <div className="flex items-center gap-2 flex-wrap">
              {topic.pinned && (
                <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-bold rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                  <Pin className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  <span className="hidden xs:inline">Sabitlenmiş</span>
                  <span className="xs:hidden">Sabit</span>
                </span>
              )}
              {topic.locked && (
                <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-bold rounded-full bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">
                  <Lock className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                  Kilitli
                </span>
              )}
              {topic.category && (
                <span className={`px-2 sm:px-3 py-1 text-[10px] sm:text-xs font-bold rounded-full ${getCategoryColor(topic.category)}`}>
                  {topic.category}
                </span>
              )}
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold leading-tight">{topic.title}</h1>
              <div className="flex gap-2 w-full sm:w-auto">
                {/* Paylaşım Butonu */}
                <div className="relative share-menu-container">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      // @ts-ignore - Navigator.share mobil cihazlarda var
                      if (typeof navigator !== 'undefined' && navigator.share) {
                        handleNativeShare()
                      } else {
                        setShowShareMenu(!showShareMenu)
                      }
                    }}
                    className="h-8 sm:h-9 text-xs sm:text-sm flex-1 sm:flex-none"
                  >
                    <Share2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    Paylaş
                  </Button>
                  
                  {/* Paylaşım Menüsü */}
                  {showShareMenu && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 overflow-hidden">
                      <button
                        onClick={handleCopyLink}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                      >
                        {copySuccess ? (
                          <>
                            <Copy className="h-4 w-4 text-green-600" />
                            <span className="text-sm text-green-600">Kopyalandı!</span>
                          </>
                        ) : (
                          <>
                            <Link2 className="h-4 w-4" />
                            <span className="text-sm">Linki Kopyala</span>
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleShareWhatsApp}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                      >
                        <svg className="h-4 w-4 fill-green-600" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.890-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                        <span className="text-sm">WhatsApp</span>
                      </button>
                      <button
                        onClick={handleShareTwitter}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                      >
                        <Twitter className="h-4 w-4 fill-blue-400" />
                        <span className="text-sm">Twitter</span>
                      </button>
                      <button
                        onClick={handleShareFacebook}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                      >
                        <Facebook className="h-4 w-4 fill-blue-600" />
                        <span className="text-sm">Facebook</span>
                      </button>
                      <button
                        onClick={handleShareLinkedIn}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                      >
                        <Linkedin className="h-4 w-4 fill-blue-700" />
                        <span className="text-sm">LinkedIn</span>
                      </button>
                    </div>
                  )}
                </div>
                
                {session?.user?.id && (session.user.id === topic.user.id || isSuperAdmin(session.user.email)) && (
                  <>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleEditTopic}
                      className="h-8 sm:h-9 text-xs sm:text-sm flex-1 sm:flex-none"
                    >
                      <Edit className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      <span className="hidden xs:inline">Düzenle</span>
                      <span className="xs:hidden">Düzenle</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleDeleteTopic}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30 h-8 sm:h-9 text-xs sm:text-sm flex-1 sm:flex-none"
                    >
                      <Trash2 className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                      <span className="hidden xs:inline">Sil</span>
                      <span className="xs:hidden">Sil</span>
                    </Button>
                  </>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs sm:text-sm text-muted-foreground">
              <div className="flex flex-col xs:flex-row items-start xs:items-center gap-2 xs:gap-3 sm:gap-4 w-full sm:w-auto">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {topic.user.image ? (
                      <img src={topic.user.image} alt={topic.user.name || "User"} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      topic.user.name?.charAt(0) || "?"
                    )}
                  </div>
                  <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2">
                    <span className="font-medium text-xs sm:text-sm truncate max-w-[120px] xs:max-w-none">{topic.user.name}</span>
                    {topic.user.userLevel && (
                      <UserLevelBadge activityScore={topic.user.userLevel.activityScore} size="sm" />
                    )}
                    {topic.user.userBadges?.[0]?.badge && (
                      <span 
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium"
                        style={{ 
                          backgroundColor: `${topic.user.userBadges[0].badge.color}15`,
                          color: topic.user.userBadges[0].badge.color,
                          border: `1px solid ${topic.user.userBadges[0].badge.color}30`
                        }}
                        title={topic.user.userBadges[0].badge.name}
                      >
                        <span>{topic.user.userBadges[0].badge.icon}</span>
                        <span className="hidden sm:inline">{topic.user.userBadges[0].badge.name}</span>
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 xs:gap-3 flex-wrap">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="text-[10px] xs:text-xs sm:text-sm">{formatDate(topic.createdAt)}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="text-[10px] xs:text-xs sm:text-sm">{topic.views}</span>
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4 flex-shrink-0" />
                    <span className="text-[10px] xs:text-xs sm:text-sm">{topic.replies.length}</span>
                  </span>
                  {topic.edited && (
                    <span className="text-[10px] xs:text-xs italic text-gray-400 dark:text-gray-500">
                      (düzenlendi)
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={handleLikeTopic}
                className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <Heart 
                  className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
                    likedTopics.has(topicId) 
                      ? "fill-red-500 text-red-500" 
                      : "text-gray-500 dark:text-gray-400"
                  }`}
                />
                <span className={`text-xs sm:text-sm font-medium ${
                  likedTopics.has(topicId)
                    ? "text-red-500"
                    : "text-gray-600 dark:text-gray-400"
                }`}>
                  {topic._count.likes}
                </span>
              </button>
            </div>
          </CardHeader>

          <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6">
            <p className="text-sm sm:text-base md:text-lg leading-relaxed whitespace-pre-wrap">{topic.content}</p>
            
            {topic.image && (
              <div className="rounded-lg overflow-hidden">
                <img 
                  src={topic.image} 
                  alt="Topic" 
                  className="w-full max-h-64 sm:max-h-80 md:max-h-96 object-contain"
                />
              </div>
            )}
          </CardContent>
        </Card>

        {/* Replies */}
        <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold px-1">
            Yanıtlar ({topic.replies.length})
          </h2>

          {topic.replies.map((reply) => {
            const isOwner = session?.user?.id === reply.user.id
            const isAdmin = isSuperAdmin(session?.user?.email)
            const canModify = isOwner || isAdmin
            const isEditing = editingReplyId === reply.id

            return (
              <Card key={reply.id} id={`reply-${reply.id}`} className="scroll-mt-20 sm:scroll-mt-24">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                      {reply.user.image ? (
                        <img src={reply.user.image} alt={reply.user.name || "User"} className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <span className="text-xs sm:text-base">{reply.user.name?.charAt(0) || "?"}</span>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col xs:flex-row xs:items-center justify-between mb-2 gap-2">
                        <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-2 min-w-0">
                          <span className="font-medium text-xs sm:text-sm truncate">{reply.user.name}</span>
                          {reply.user.userLevel && (
                            <UserLevelBadge activityScore={reply.user.userLevel.activityScore} size="sm" />
                          )}
                          {reply.user.userBadges?.[0]?.badge && (
                            <span 
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium self-start xs:self-auto"
                              style={{ 
                                backgroundColor: `${reply.user.userBadges[0].badge.color}15`,
                                color: reply.user.userBadges[0].badge.color,
                                border: `1px solid ${reply.user.userBadges[0].badge.color}30`
                              }}
                              title={reply.user.userBadges[0].badge.name}
                            >
                              <span className="text-xs">{reply.user.userBadges[0].badge.icon}</span>
                              <span className="hidden sm:inline text-[10px]">{reply.user.userBadges[0].badge.name}</span>
                            </span>
                          )}
                          <span className="text-[10px] xs:text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
                            {formatDate(reply.createdAt)}
                          </span>
                          {reply.edited && (
                            <span className="text-[10px] xs:text-xs italic text-gray-400 dark:text-gray-500">
                              (düzenlendi)
                            </span>
                          )}
                        </div>
                        {canModify && !isEditing && (
                          <div className="flex gap-1 self-end xs:self-auto">
                            {isOwner && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleEditReply(reply)}
                                className="h-7 sm:h-8 px-1.5 sm:px-2"
                              >
                                <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                              </Button>
                            )}
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteReply(reply.id)}
                              className="h-7 sm:h-8 px-1.5 sm:px-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
                            >
                              <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </div>
                        )}
                      </div>

                      {isEditing ? (
                        <div className="space-y-3">
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                          />
                          <div>
                            <label className="text-xs font-medium mb-1 block">Görsel (Opsiyonel)</label>
                            <Input
                              value={editImage}
                              onChange={(e) => setEditImage(e.target.value)}
                              placeholder="Google Drive link veya URL..."
                              className="h-8 sm:h-9 text-sm"
                            />
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleSaveEdit(reply.id)}
                              className="bg-indigo-600 hover:bg-indigo-700 h-8 sm:h-9 text-xs sm:text-sm"
                            >
                              <Save className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                              Kaydet
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingReplyId(null)
                                setEditContent("")
                                setEditImage("")
                              }}
                              className="h-8 sm:h-9 text-xs sm:text-sm"
                            >
                              <X className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                              İptal
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {reply.parentReply && (
                            <div 
                              className="mb-2 sm:mb-3 p-2 sm:p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border-l-4 border-indigo-500 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                              onClick={() => {
                                const parentElement = document.getElementById(`reply-${reply.parentReply?.id}`)
                                if (parentElement) {
                                  parentElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
                                  // Highlight effect
                                  parentElement.classList.add('ring-2', 'ring-indigo-500', 'ring-offset-2', 'dark:ring-offset-gray-900')
                                  setTimeout(() => {
                                    parentElement.classList.remove('ring-2', 'ring-indigo-500', 'ring-offset-2', 'dark:ring-offset-gray-900')
                                  }, 2000)
                                }
                              }}
                              title="Alıntılanan yoruma git"
                            >
                              <div className="text-[10px] sm:text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-1 flex items-center gap-1">
                                <MessageSquare className="h-2.5 w-2.5 sm:h-3 sm:w-3 flex-shrink-0" />
                                @{reply.parentReply.user.name} kullanıcısına yanıt
                              </div>
                              <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                                {reply.parentReply.content}
                              </div>
                            </div>
                          )}

                          <p className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base">{reply.content}</p>
                          
                          {reply.image && (
                            <div className="mt-2 sm:mt-3 rounded-lg overflow-hidden max-w-full sm:max-w-md">
                              <img 
                                src={reply.image} 
                                alt="Reply" 
                                className="w-full max-h-40 sm:max-h-48 object-contain"
                              />
                            </div>
                          )}

                          {reply.link && (
                            <a 
                              href={reply.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-xs sm:text-sm text-indigo-600 hover:underline mt-2 inline-block break-all"
                            >
                              🔗 {reply.link}
                            </a>
                          )}

                          <div className="flex items-center gap-1 sm:gap-2 mt-2 sm:mt-3">
                            <button
                              onClick={() => handleLikeReply(reply.id)}
                              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                            >
                              <Heart 
                                className={`h-3 w-3 sm:h-4 sm:w-4 ${
                                  likedReplies.has(reply.id) 
                                    ? "fill-red-500 text-red-500" 
                                    : "text-gray-500 dark:text-gray-400"
                                }`}
                              />
                              <span className={`text-xs sm:text-sm font-medium ${
                                likedReplies.has(reply.id)
                                  ? "text-red-500"
                                  : "text-gray-600 dark:text-gray-400"
                              }`}>
                                {reply._count.likes}
                              </span>
                            </button>
                            <button
                              onClick={() => {
                                if (!session) {
                                  router.push('/auth/signin')
                                  return
                                }
                                setReplyingToId(reply.id)
                                setReplyingToUser(reply.user.name || "Kullanıcı")
                                // Scroll to reply form
                                document.getElementById('reply-form')?.scrollIntoView({ behavior: 'smooth' })
                              }}
                              className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
                            >
                              <MessageSquare className="h-3 w-3 sm:h-4 sm:w-4" />
                              <span className="text-xs sm:text-sm font-medium">Yanıtla</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}

          {topic.replies.length === 0 && (
            <Card>
              <CardContent className="p-6 sm:p-8 text-center text-muted-foreground">
                <MessageSquare className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm sm:text-base">Henüz yanıt yok. İlk yanıtı siz verin!</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Reply Form */}
        {!topic.locked && (
          <Card id="reply-form">
            <CardHeader className="p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-bold">Yanıt Yaz</h3>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              {session ? (
                <form onSubmit={handleReply} className="space-y-3 sm:space-y-4">
                  {replyingToId && replyingToUser && (
                    <div className="flex items-center justify-between p-2 sm:p-3 bg-indigo-50 dark:bg-indigo-950/30 rounded-lg gap-2">
                      <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
                        <MessageSquare className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                        <span className="text-xs sm:text-sm font-medium text-indigo-600 dark:text-indigo-400 truncate">
                          @{replyingToUser} kullanıcısına yanıt veriyorsunuz
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setReplyingToId(null)
                          setReplyingToUser(null)
                        }}
                        className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex-shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  <div>
                    <textarea
                      placeholder="Yanıtınızı yazın..."
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      required
                      className="w-full min-h-[100px] sm:min-h-[120px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                    />
                  </div>

                  <ImageUpload
                    label="Görsel (Opsiyonel)"
                    value={replyImage}
                    onChange={(url) => setReplyImage(convertDriveLink(url))}
                    id="replyImage"
                    placeholder="URL girin veya bilgisayar/telefonunuzdan dosya yükleyin"
                    helperText="📱 Telefondan veya bilgisayardan resim yükleyebilir, URL girebilir veya Google Drive linki ekleyebilirsiniz"
                  />

                  <Button 
                    type="submit" 
                    disabled={submitting}
                    className="bg-indigo-600 hover:bg-indigo-700 h-9 sm:h-10 text-sm sm:text-base w-full sm:w-auto"
                  >
                    <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-2" />
                    {submitting ? "Gönderiliyor..." : "Yanıtı Gönder"}
                  </Button>
                </form>
              ) : (
                <div className="text-center py-4 sm:py-6">
                  <p className="text-muted-foreground mb-3 sm:mb-4 text-sm sm:text-base">Yanıt yazmak için giriş yapmalısınız</p>
                  <Button asChild className="h-9 sm:h-10 text-sm sm:text-base">
                    <Link href="/auth/signin">Giriş Yap</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Edit Topic Modal */}
        {editingTopic && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-4"
            onClick={() => setEditingTopic(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-200 dark:border-gray-800"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Konuyu Düzenle</h2>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setEditingTopic(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Başlık</label>
                  <Input
                    value={editTopicTitle}
                    onChange={(e) => setEditTopicTitle(e.target.value)}
                    placeholder="Konu başlığı"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Kategori</label>
                  <select
                    value={editTopicCategory}
                    onChange={(e) => setEditTopicCategory(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2"
                  >
                    <option value="Tartışma">Tartışma</option>
                    <option value="Kitap Önerisi">Kitap Önerisi</option>
                    <option value="Soru">Soru</option>
                    <option value="İnceleme">İnceleme</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">İçerik</label>
                  <textarea
                    value={editTopicContent}
                    onChange={(e) => setEditTopicContent(e.target.value)}
                    className="w-full min-h-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                    placeholder="Konu içeriği"
                  />
                </div>

                <ImageUpload
                  label="Görsel (Opsiyonel)"
                  value={editTopicImage}
                  onChange={(url) => setEditTopicImage(url)}
                  id="editTopicImage"
                  placeholder="Görsel URL'si"
                  helperText="Görsel eklemek için URL girin"
                />

                <div className="flex gap-3 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setEditingTopic(false)}
                  >
                    İptal
                  </Button>
                  <Button
                    onClick={handleSaveTopicEdit}
                    className="bg-indigo-600 hover:bg-indigo-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Kaydet
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
