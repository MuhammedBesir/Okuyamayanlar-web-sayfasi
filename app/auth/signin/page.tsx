"use client"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { BookOpen } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

// Yaygın e-posta sağlayıcıları
const TRUSTED_EMAIL_DOMAINS = [
  'gmail.com', 'googlemail.com',
  'outlook.com', 'hotmail.com', 'live.com', 'msn.com',
  'yahoo.com', 'yahoo.co.uk', 'yahoo.fr', 'yahoo.de',
  'icloud.com', 'me.com', 'mac.com',
  'protonmail.com', 'proton.me',
  'aol.com',
  'zoho.com',
  'mail.com',
  'yandex.com', 'yandex.ru',
  // Türkiye'deki yaygın alan adları
  'yandex.com.tr',
  'hotmail.com.tr',
  // Üniversite alan adları
  'edu.tr', 'edu',
  // Kurumsal alan adları (isteğe bağlı)
  'windowslive.com'
]

const validateEmail = (email: string): { valid: boolean; message?: string } => {
  // Temel email formatı kontrolü
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { valid: false, message: "Geçerli bir e-posta adresi giriniz" }
  }

  // Domain çıkar
  const domain = email.toLowerCase().split('@')[1]
  
  // Geçici/tek kullanımlık e-posta servislerini engelle
  const disposableDomains = ['tempmail.com', '10minutemail.com', 'guerrillamail.com', 'mailinator.com', 'throwaway.email']
  if (disposableDomains.some(d => domain.includes(d))) {
    return { valid: false, message: "Geçici e-posta adresleri kabul edilmemektedir" }
  }

  // Yaygın alan adlarını kontrol et (uyarı ver ama engelleme)
  const isTrustedDomain = TRUSTED_EMAIL_DOMAINS.some(d => domain === d || domain.endsWith('.' + d))
  
  if (!isTrustedDomain) {
    // Kurumsal/özel e-postalar için uyarı göster ama izin ver
  }

  return { valid: true }
}

export default function SignInPage() {
  const router = useRouter()
  const [emailOrUsername, setEmailOrUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  // URL parametrelerinden mesajları kontrol et
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('verified') === 'true') {
      const alreadyVerified = params.get('already') === 'true'
      setSuccess(alreadyVerified 
        ? '✅ E-posta adresiniz zaten onaylanmış! Giriş yapabilirsiniz.' 
        : '✅ E-posta adresiniz başarıyla onaylandı! Artık giriş yapabilirsiniz.'
      )
    } else if (params.get('registered') === 'true') {
      setSuccess('📧 Kayıt başarılı! E-posta adresinize gönderilen linke tıklayarak hesabınızı onaylayın.')
    } else if (params.get('error') === 'invalid_token') {
      setError('❌ Geçersiz veya kullanılmış onay linki.')
    } else if (params.get('error') === 'token_expired') {
      setError('⏰ Onay linki süresi dolmuş. Lütfen yeni bir kayıt yapın.')
    } else if (params.get('error') === 'OAuthAccountNotLinked') {
      // Google ile kayıtlı kullanıcı - mesaj gösterme, sadece normal giriş yapsın
      // Hiçbir şey yapma, kullanıcı zaten giriş yapabilir
    } else if (params.get('error') === 'OAuthCallback') {
      setError('❌ Google ile giriş sırasında bir hata oluştu. Lütfen tekrar deneyin.')
    } else if (params.get('error') === 'Callback') {
      setError('❌ Giriş sırasında bir hata oluştu. Lütfen tekrar deneyin.')
    } else if (params.get('error') === 'verification_failed') {
      setError('❌ E-posta onaylama sırasında bir hata oluştu. Lütfen tekrar deneyin.')
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        emailOrUsername,
        password,
        redirect: false,
      })

      if (result?.error) {
        // E-posta onay hatası
        if (result.error.includes("onaylanmamış")) {
          setError("E-posta adresiniz henüz onaylanmamış. Lütfen e-posta kutunuzu kontrol edin.")
        }
        // Banlı kullanıcı hatası kontrolü
        else if (result.error.includes("yasaklanmıştır")) {
          setError(result.error)
        } else {
          setError("Email veya şifre hatalı")
        }
      } else {
        router.push("/")
        router.refresh()
      }
    } catch (error) {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-4rem)] py-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 text-center">
          <div className="flex justify-center mb-4">
            <BookOpen className="h-12 w-12 text-primary" />
          </div>
          <CardTitle className="text-2xl">Giriş Yap</CardTitle>
          <CardDescription>
            Okuyamayanlar Kitap Kulübü&apos;ne hoş geldiniz
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-md">
                {error}
              </div>
            )}
            
            {success && (
              <div className="p-3 text-sm text-green-600 bg-green-50 dark:bg-green-900/20 rounded-md">
                {success}
              </div>
            )}
            
            {/* Google Sign In Button */}
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => signIn("google", { 
                callbackUrl: "/",
                redirect: true,
              })}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google ile Giriş Yap
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  veya
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="emailOrUsername" className="text-sm font-medium">
                E-posta veya Kullanıcı Adı
              </label>
              <Input
                id="emailOrUsername"
                type="text"
                placeholder="ornek@email.com veya ahmet_yilmaz"
                value={emailOrUsername}
                onChange={(e) => setEmailOrUsername(e.target.value)}
                required
              />
              <p className="text-xs text-muted-foreground">
                📧 E-posta adresiniz veya kullanıcı adınız ile giriş yapabilirsiniz
              </p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium">
                  Şifre
                </label>
                <Link 
                  href="/auth/forgot-password" 
                  className="text-xs text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 hover:underline"
                >
                  Şifremi unuttum
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              Hesabınız yok mu?{" "}
              <Link href="/auth/signup" className="text-primary hover:underline">
                Kayıt Olun
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
