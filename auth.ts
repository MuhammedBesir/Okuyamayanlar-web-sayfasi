export const runtime = "nodejs";
import NextAuth from "next-auth"
import { PrismaAdapter } from "@auth/prisma-adapter"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"
import type { User } from "next-auth"

export const { handlers, signIn, signOut, auth } = NextAuth({
  debug: process.env.NODE_ENV === 'development', // Development'ta debug logları
  adapter: PrismaAdapter(prisma) as any,
  session: { strategy: "jwt" },
  trustHost: true, // Vercel ve production ortamlar için gerekli
  cookies: {
    // Multi-domain desteği için cookie ayarları
    pkceCodeVerifier: {
      name: "next-auth.pkce.code_verifier",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        // Domain ayarı: .okuyamayanlar.com.tr (hem www hem www'suz çalışır)
        domain: process.env.NODE_ENV === "production" 
          ? ".okuyamayanlar.com.tr" 
          : undefined,
      },
    },
    sessionToken: {
      name: "next-auth.session-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain: process.env.NODE_ENV === "production" 
          ? ".okuyamayanlar.com.tr" 
          : undefined,
      },
    },
    callbackUrl: {
      name: "next-auth.callback-url",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain: process.env.NODE_ENV === "production" 
          ? ".okuyamayanlar.com.tr" 
          : undefined,
      },
    },
    csrfToken: {
      name: "next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
        domain: process.env.NODE_ENV === "production" 
          ? ".okuyamayanlar.com.tr" 
          : undefined,
      },
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "select_account", // Her seferinde hesap seçimi ekranını göster
        },
      },
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        emailOrUsername: { label: "Email or Username", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials: Record<string, any> | undefined) {
        if (!credentials?.emailOrUsername || !credentials?.password) {
          return null
        }

        const emailOrUsername = credentials.emailOrUsername as string

        // Email mi yoksa username mi kontrol et
        const isEmail = emailOrUsername.includes('@')
        
        const user = await prisma.user.findFirst({
          where: isEmail 
            ? { email: emailOrUsername }
            : { username: emailOrUsername },
          select: {
            id: true,
            email: true,
            name: true,
            username: true,
            password: true,
            role: true,
            image: true,
            banned: true,
            bannedReason: true,
            emailVerified: true,
          },
        })

        if (!user || !user.password) {
          return null
        }

        // Banlı kullanıcılar giriş yapamaz
        if (user.banned) {
          throw new Error(`Bu hesap yasaklanmıştır. Sebep: ${user.bannedReason || 'Belirtilmemiş'}`)
        }

        // E-posta onayı yapılmamış kullanıcılar giriş yapamaz
        if (!user.emailVerified) {
          throw new Error('E-posta adresiniz henüz onaylanmamış. Lütfen e-posta kutunuzu kontrol edin.')
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          image: user.image,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }: any) {
      // Kullanıcı banlı mı kontrol et (hem Google hem Credentials için)
      if (user?.email) {
        try {
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email },
            select: { banned: true, bannedReason: true, username: true, id: true },
          })

          if (existingUser?.banned) {
            console.log('Banned user attempted to sign in:', user.email)
            return false // Giriş engellenir
          }

          // Google ile giriş yapan kullanıcı için username oluştur
          if (account?.provider === 'google') {
            // Eğer kullanıcı varsa ve username'i yoksa
            if (existingUser && !existingUser.username) {
              const baseUsername = user.email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
              let username = baseUsername;
              let counter = 1;

              // Unique username bul
              while (await prisma.user.findUnique({ where: { username } })) {
                username = `${baseUsername}${counter}`;
                counter++;
              }

              await prisma.user.update({
                where: { id: existingUser.id },
                data: { 
                  username: username,
                  emailVerified: new Date(), // Google hesabı zaten doğrulanmış
                },
              });
            }
          }
        } catch (error) {
          console.error('Error checking user ban status:', error)
          return false
        }
      }
      return true
    },
    async jwt({ token, user, account, trigger, session }: any) {
      // İlk giriş veya yeni hesap ile giriş yapıldığında
      if (user) {
        // Veritabanından kullanıcı bilgilerini al
        const dbUser = await prisma.user.findUnique({
          where: { email: user.email! },
          select: { 
            id: true, 
            email: true,
            name: true,
            role: true, 
            banned: true,
            image: true,
            bio: true,
          },
        })

        if (dbUser) {
          token.id = dbUser.id
          token.email = dbUser.email
          token.name = dbUser.name
          token.role = dbUser.role
          token.banned = dbUser.banned
          token.picture = dbUser.image
          token.bio = dbUser.bio
        }
      }

      // Profil güncellendiğinde session'ı güncelle
      if (trigger === "update") {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { 
            name: true,
            image: true,
            bio: true,
          },
        })

        if (dbUser) {
          token.name = dbUser.name
          token.picture = dbUser.image
          token.bio = dbUser.bio
        }
      }

      return token
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user && token) {
        session.user.id = token.id as string
        session.user.email = token.email as string
        session.user.name = token.name as string
        session.user.role = token.role as string
        session.user.image = token.picture as string
        session.user.bio = token.bio as string
      }
      return session
    },
  },
})
