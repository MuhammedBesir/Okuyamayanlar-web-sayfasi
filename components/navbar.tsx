"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Bell, BookOpen, Calendar, Home, Menu, MessageSquare, User, X, Trash2, Check, Search } from "lucide-react"
import { useSession, signOut } from "next-auth/react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { ThemeToggle } from "@/components/theme-toggle"
import { ScrollArea } from "@/components/ui/scroll-area"
import { generateCartoonAvatar } from "@/lib/avatars"

const navItems = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/events", label: "Etkinlikler" },
  { href: "/forum", label: "Forum" },
  { href: "/library", label: "Kütüphane" },
  { href: "/about", label: "Hakkımızda" },
]

interface Notification {
  id: string
  title: string
  message: string
  read: boolean
  link: string | null
  createdAt: string
}

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState("")
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      // Kütüphane sayfasına yönlendir ve arama parametresini ekle
      router.push(`/library?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  const fetchNotifications = async () => {
    if (!session?.user) return
    
    try {
      const response = await fetch("/api/notifications", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      setNotifications(data.notifications || [])
      setUnreadCount(data.unreadCount || 0)
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
      // Hata durumunda boş array set et
      setNotifications([])
      setUnreadCount(0)
    }
  }

  const checkBanStatus = async () => {
    if (!session?.user) return
    
    try {
      const response = await fetch("/api/auth/check-ban", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
      })
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      
      const data = await response.json()
      if (data.banned) {
        // Kullanıcı banlandıysa çıkış yap
        await signOut({ redirect: true, callbackUrl: "/auth/signin" })
        console.log(`Hesabınız yasaklanmıştır. Sebep: ${data.reason}`)
      }
    } catch (error) {
      console.error("Failed to check ban status:", error)
    }
  }

  const markAsRead = async (id: string) => {
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: "PUT",
      })
      if (response.ok) {
        // Listeyi güncelle
        setNotifications(notifications.map(n => 
          n.id === id ? { ...n, read: true } : n
        ))
        setUnreadCount(Math.max(0, unreadCount - 1))
      }
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const response = await fetch("/api/notifications/mark-all-read", {
        method: "POST",
      })
      if (response.ok) {
        setNotifications(notifications.map(n => ({ ...n, read: true })))
        setUnreadCount(0)
      }
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error)
    }
  }

  const deleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation() // Bildirimin tıklanmasını engelle
    
    try {
      const response = await fetch(`/api/notifications/${id}`, {
        method: "DELETE",
      })
      if (response.ok) {
        // Bildirimi listeden çıkar
        const deletedNotification = notifications.find(n => n.id === id)
        setNotifications(notifications.filter(n => n.id !== id))
        
        // Eğer silinene okunmamışsa, unreadCount'u azalt
        if (deletedNotification && !deletedNotification.read) {
          setUnreadCount(Math.max(0, unreadCount - 1))
        }
      }
    } catch (error) {
      console.error("Failed to delete notification:", error)
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id)
    }
    if (notification.link) {
      router.push(notification.link)
      setNotificationOpen(false)
    }
  }

  useEffect(() => {
    if (session?.user?.email) {
      // İlk yüklemede biraz bekle
      const timeout = setTimeout(() => {
        fetchNotifications()
        checkBanStatus()
      }, 500)
      
      // Her 30 saniyede bir bildirimleri ve ban durumunu güncelle
      const interval = setInterval(() => {
        fetchNotifications()
        checkBanStatus()
      }, 30000)
      
      return () => {
        clearTimeout(timeout)
        clearInterval(interval)
      }
    }
  }, [session?.user?.email])

  useEffect(() => {
    if (notificationOpen && session?.user?.email) {
      fetchNotifications()
    }
  }, [notificationOpen])

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 min-h-[4rem]">
      <div className="container flex h-16 items-center px-4">
        {/* Mobile Menu Button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden mr-2"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>

        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2 mr-4 md:mr-8">
          <BookOpen className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg md:text-xl">Okuyamayanlar</span>
        </Link>

        {/* Desktop Nav Items */}
        <div className="hidden md:flex items-center space-x-6 mr-auto">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === item.href
                  ? "text-foreground"
                  : "text-foreground/60"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-2 md:space-x-4 ml-auto">
          {/* Search */}
          <div className="hidden lg:flex items-center">
            <form onSubmit={handleSearch} className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Kitap ara..."
                className="pl-8 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </div>

          {/* Theme Toggle */}
          <ThemeToggle />

          {session ? (
            <>
              {/* Notifications */}
              <DropdownMenu open={notificationOpen} onOpenChange={setNotificationOpen}>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-amber-600 text-[10px] font-bold text-white flex items-center justify-center">
                        {unreadCount > 9 ? "9+" : unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <DropdownMenuLabel className="flex items-center justify-between">
                    <span>Bildirimler</span>
                    {unreadCount > 0 && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-auto p-1 text-xs"
                        onClick={markAllAsRead}
                      >
                        <Check className="h-3 w-3 mr-1" />
                        Tümünü okundu işaretle
                      </Button>
                    )}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      Henüz bildirim yok
                    </div>
                  ) : (
                    <ScrollArea className="h-96">
                      {notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className={`p-3 cursor-pointer hover:bg-accent transition-colors border-b last:border-b-0 relative group ${
                            !notification.read ? "bg-amber-50/50 dark:bg-amber-950/20" : ""
                          }`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 space-y-1 pr-16">
                              <p className="text-sm font-medium leading-none">
                                {notification.title}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {notification.message}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {new Date(notification.createdAt).toLocaleDateString('tr-TR', {
                                  day: 'numeric',
                                  month: 'long',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </p>
                            </div>
                            <div className="flex items-center gap-1">
                              {!notification.read && (
                                <div className="h-2 w-2 rounded-full bg-amber-600 flex-shrink-0" />
                              )}
                              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                {!notification.read && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 hover:bg-green-100 dark:hover:bg-green-950 hover:text-green-600"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      markAsRead(notification.id)
                                    }}
                                    title="Okundu olarak işaretle"
                                  >
                                    <Check className="h-3 w-3" />
                                  </Button>
                                )}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 hover:bg-red-100 dark:hover:bg-red-950 hover:text-red-600"
                                  onClick={(e) => deleteNotification(notification.id, e)}
                                  title="Sil"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </ScrollArea>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar>
                      <AvatarImage 
                        src={session.user?.image || generateCartoonAvatar(session.user?.email || session.user?.name || 'user', 'avataaars')} 
                        alt={session.user?.name || ""} 
                      />
                      <AvatarFallback>
                        {session.user?.name?.charAt(0) || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {session.user?.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {session.user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profilim</Link>
                  </DropdownMenuItem>
                  {session.user?.role === "ADMIN" && (
                    <DropdownMenuItem asChild>
                      <Link href="/admin">Admin Panel</Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut({ callbackUrl: "/auth/signin", redirect: true })}>
                    Çıkış Yap
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Button asChild>
              <Link href="/auth/signin">Giriş Yap</Link>
            </Button>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t">
          <div className="container px-4 py-4 space-y-3">
            {/* Mobile Search */}
            <form onSubmit={(e) => { handleSearch(e); setMobileMenuOpen(false); }} className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Kitap ara..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>

            {/* Mobile Nav Items */}
            <div className="flex flex-col space-y-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    pathname === item.href
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* Admin Panel Link for Mobile */}
              {session?.user?.role === "ADMIN" && (
                <Link
                  href="/admin"
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium hover:bg-accent transition-colors border-t pt-4 mt-2"
                >
                  Admin Panel
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}
