"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Search, Ban, CheckCircle, Shield, User as UserIcon, Mail, Calendar, Crown, Trash2, ExternalLink } from "lucide-react"
import Link from "next/link"
import GrantBadgeDialog from "@/components/grant-badge-dialog"

const SUPER_ADMIN_EMAIL = "wastedtr34@gmail.com"

interface User {
  id: string
  name: string | null
  username: string | null
  email: string
  role: string
  banned: boolean
  bannedAt: string | null
  bannedReason: string | null
  createdAt: string
  _count: {
    forumTopics: number
    forumReplies: number
  }
  userBadges?: Array<{
    badge: {
      id: string
      name: string
      icon: string
      color: string
    }
  }>
}

const isSuperAdmin = (email: string) => {
  return email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()
}

export default function AdminUsersPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [banningUserId, setBanningUserId] = useState<string | null>(null)
  const [banReason, setBanReason] = useState("")
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin")
    } else if (session?.user?.role !== "ADMIN") {
      router.push("/")
    } else {
      fetchUsers()
    }
  }, [session, status, router])

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users")
      if (res.ok) {
        const data = await res.json()
        setUsers(data.users)
      }
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  const handleBanToggle = async (userId: string, currentBanStatus: boolean) => {
    if (!currentBanStatus && !banReason.trim()) {
      console.log("Lütfen banlama nedeni girin")
      return
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}/ban`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          banned: !currentBanStatus,
          reason: !currentBanStatus ? banReason : null
        })
      })

      if (res.ok) {
        setBanningUserId(null)
        setBanReason("")
        fetchUsers()
      }
    } catch (error) {
    }
  }

  const handleDeleteUser = async (userId: string, userName: string | null) => {
    const confirmMessage = `${userName || "Bu kullanıcıyı"} kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz!`
    
    if (!confirm(confirmMessage)) {
      setDeletingUserId(null)
      return
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}/delete`, {
        method: "DELETE"
      })

      const data = await res.json()

      if (res.ok) {
        alert(data.message || "Kullanıcı başarıyla silindi")
        setDeletingUserId(null)
        fetchUsers()
      } else {
        alert(data.error || "Kullanıcı silinirken bir hata oluştu")
        setDeletingUserId(null)
      }
    } catch (error) {
      console.log("Kullanıcı silinirken bir hata oluştu")
      setDeletingUserId(null)
    }
  }

  const filteredUsers = users.filter(user =>
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading || status === "loading") {
    return (
      <div className="container py-8 px-4 max-w-7xl">
        <div className="animate-pulse space-y-4">
          <div className="h-12 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-8 px-4 max-w-7xl">
      <div className="mb-6">
        <Button variant="ghost" asChild className="mb-4">
          <Link href="/admin">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Admin Panele Dön
          </Link>
        </Button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Kullanıcı Yönetimi
            </h1>
            <p className="text-muted-foreground">
              Toplam {users.length} kullanıcı
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Kullanıcı ara (isim veya email)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-4">
        {filteredUsers.map((user) => (
          <Card key={user.id} className={`${user.banned ? 'border-red-300 bg-red-50/50 dark:bg-red-950/20' : ''}`}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {user.name?.charAt(0) || 'U'}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="font-semibold text-lg">{user.name || "İsimsiz"}</h3>
                      {user.username && (
                        <span className="text-sm text-muted-foreground">@{user.username}</span>
                      )}
                      {isSuperAdmin(user.email) && (
                        <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 border-0">
                          <Crown className="h-3 w-3 mr-1" />
                          Süper Admin
                        </Badge>
                      )}
                      {user.role === "ADMIN" && !isSuperAdmin(user.email) && (
                        <Badge className="bg-gradient-to-r from-amber-500 to-orange-500">
                          <Shield className="h-3 w-3 mr-1" />
                          Admin
                        </Badge>
                      )}
                      {user.banned && (
                        <Badge variant="destructive">
                          <Ban className="h-3 w-3 mr-1" />
                          Banlandı
                        </Badge>
                      )}
                    </div>

                    <div className="space-y-1 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {user.email}
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        Kayıt: {new Date(user.createdAt).toLocaleDateString("tr-TR")}
                      </div>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1">
                          <UserIcon className="h-4 w-4" />
                          {user._count.forumTopics} başlık
                        </span>
                        <span className="flex items-center gap-1">
                          💬 {user._count.forumReplies} yorum
                        </span>
                      </div>
                      {user.userBadges && user.userBadges.length > 0 && (
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className="text-xs font-medium">Rozetler:</span>
                          {user.userBadges.slice(0, 5).map((userBadge) => (
                            <span
                              key={userBadge.badge.id}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
                              style={{
                                backgroundColor: `${userBadge.badge.color}15`,
                                color: userBadge.badge.color,
                                border: `1px solid ${userBadge.badge.color}30`
                              }}
                              title={userBadge.badge.name}
                            >
                              <span>{userBadge.badge.icon}</span>
                              <span className="hidden sm:inline">{userBadge.badge.name}</span>
                            </span>
                          ))}
                          {user.userBadges.length > 5 && (
                            <span className="text-xs text-muted-foreground">
                              +{user.userBadges.length - 5} daha
                            </span>
                          )}
                        </div>
                      )}
                      {user.banned && user.bannedReason && (
                        <div className="mt-2 p-2 bg-red-100 dark:bg-red-900/30 rounded text-red-700 dark:text-red-400 text-xs">
                          <strong>Ban Nedeni:</strong> {user.bannedReason}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {/* Profil görüntüleme butonu - tüm kullanıcılar için */}
                  {user.username && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="gap-1 hover:bg-blue-50 hover:border-blue-300 dark:hover:bg-blue-950/20"
                      asChild
                    >
                      <Link href={`/profile?username=${user.username}`} target="_blank">
                        <ExternalLink className="h-4 w-4" />
                        Profili Gör
                      </Link>
                    </Button>
                  )}

                  {/* Süper admin'e hiçbir işlem yapılamaz */}
                  {isSuperAdmin(user.email) ? (
                    <Badge variant="outline" className="text-xs border-purple-500 text-purple-600 dark:text-purple-400">
                      <Crown className="h-3 w-3 mr-1" />
                      Korumalı Hesap
                    </Badge>
                  ) : user.role !== "ADMIN" ? (
                    <>
                      {banningUserId === user.id && !user.banned ? (
                        <div className="space-y-2">
                          <Input
                            placeholder="Ban nedeni..."
                            value={banReason}
                            onChange={(e) => setBanReason(e.target.value)}
                            className="w-64"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleBanToggle(user.id, user.banned)}
                            >
                              <Ban className="h-4 w-4 mr-1" />
                              Banla
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setBanningUserId(null)
                                setBanReason("")
                              }}
                            >
                              İptal
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={user.banned ? "default" : "destructive"}
                            onClick={() => {
                              if (user.banned) {
                                handleBanToggle(user.id, user.banned)
                              } else {
                                setBanningUserId(user.id)
                              }
                            }}
                          >
                            {user.banned ? (
                              <>
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Banı Kaldır
                              </>
                            ) : (
                              <>
                                <Ban className="h-4 w-4 mr-1" />
                                Banla
                              </>
                            )}
                          </Button>
                          
                          <GrantBadgeDialog
                            userId={user.id}
                            userName={user.name || user.email}
                            onSuccess={fetchUsers}
                          />
                          
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                            onClick={() => handleDeleteUser(user.id, user.name)}
                            disabled={deletingUserId === user.id}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            {deletingUserId === user.id ? "Siliniyor..." : "Sil"}
                          </Button>
                        </div>
                      )}
                    </>
                  ) : (
                    // Admin kendi hesabı - Sadece rozet verme göster
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        <Shield className="h-3 w-3 mr-1" />
                        Admin Hesabı
                      </Badge>
                      <GrantBadgeDialog
                        userId={user.id}
                        userName={user.name || user.email}
                        onSuccess={fetchUsers}
                      />
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredUsers.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <UserIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">Kullanıcı bulunamadı</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
