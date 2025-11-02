import nodemailer from 'nodemailer'

// Test modu kontrolü
const isTestMode = process.env.EMAIL_TEST_MODE === 'true'

// Base URL'i dinamik olarak al
function getBaseUrl() {
  // Server-side'da NEXTAUTH_URL kullan
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL
  }
  // Fallback
  return 'http://localhost:3000'
}

// E-posta transport yapılandırması
let transporter: nodemailer.Transporter | null = null

function getTransporter() {
  if (isTestMode) {
    // Test modu için console'a yazdıran mock transporter
    return {
      sendMail: async (options: any) => {
        console.log('\n📧 [TEST MODE] Email gönderilmedi - Console\'a yazdırıldı:')
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
        console.log('📨 Kime:', options.to)
        console.log('📌 Konu:', options.subject)
        console.log('👤 Gönderen:', options.from)
        if (options.text) {
          console.log('\n📄 Metin İçerik:')
          console.log(options.text)
        }
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
        return { messageId: 'test-' + Date.now() }
      }
    }
  }

  // Gerçek SMTP transporter
  if (!transporter) {
    const emailConfig = {
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: process.env.EMAIL_USER && process.env.EMAIL_PASSWORD ? {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      } : undefined,
    }

    // Email yapılandırması eksikse uyar
    if (!emailConfig.auth) {
      console.warn('⚠️ Email yapılandırması eksik! EMAIL_USER ve EMAIL_PASSWORD environment variables ayarlanmalı.')
      console.warn('⚠️ Test modu aktif değilse emailler gönderilemeyecek.')
    }

    transporter = nodemailer.createTransport(emailConfig)
  }

  return transporter
}

interface EmailOptions {
  to: string
  subject: string
  html: string
  text?: string
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  try {
    const emailTransporter = getTransporter()
    
    const info = await emailTransporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || 'Okuyamayanlar Kitap Kulübü'}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER || 'noreply@okuyamayanlar.com'}>`,
      to,
      subject,
      text,
      html,
    })

    if (!isTestMode) {
      console.log('✅ E-posta gönderildi:', info.messageId)
    }
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error('❌ E-posta gönderim hatası:', error)
    
    // Detaylı hata mesajı
    if (error instanceof Error) {
      console.error('Hata detayı:', error.message)
    }
    
    // Test modunda bile hata olursa bildirimi göster
    if (isTestMode) {
      console.log('⚠️ Test modunda hata oluştu ama işlem devam ediyor')
      return { success: true, messageId: 'test-error-' + Date.now() }
    }
    
    return { success: false, error }
  }
}

// E-posta onaylama maili
export async function sendVerificationEmail(email: string, token: string, name: string) {
  const baseUrl = getBaseUrl()
  const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${token}`
  
  console.log('📧 Verification email URL:', verificationUrl)
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background: linear-gradient(135deg, #FFF3ED 0%, #FFE5D9 100%);
          padding: 40px 20px;
          line-height: 1.6;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(230, 115, 80, 0.15);
        }
        .header {
          background: linear-gradient(135deg, #E67350 0%, #D96544 100%);
          color: white;
          padding: 50px 30px;
          text-align: center;
          position: relative;
        }
        .header::after {
          content: '';
          position: absolute;
          bottom: -20px;
          left: 0;
          right: 0;
          height: 40px;
          background: #ffffff;
          border-radius: 50% 50% 0 0 / 100% 100% 0 0;
        }
        .logo {
          font-size: 60px;
          margin-bottom: 10px;
          display: inline-block;
          animation: float 3s ease-in-out infinite;
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        .header h1 {
          margin: 10px 0 0 0;
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.5px;
        }
        .content {
          padding: 60px 40px 40px;
          color: #333;
        }
        .welcome-text {
          font-size: 24px;
          color: #E67350;
          font-weight: 700;
          margin-bottom: 20px;
        }
        .description {
          font-size: 16px;
          color: #555;
          margin-bottom: 15px;
        }
        .button-container {
          text-align: center;
          margin: 40px 0;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #E67350 0%, #D96544 100%);
          color: white !important;
          text-decoration: none;
          padding: 18px 45px;
          border-radius: 50px;
          font-weight: 700;
          font-size: 16px;
          box-shadow: 0 8px 20px rgba(230, 115, 80, 0.3);
          transition: all 0.3s ease;
          letter-spacing: 0.5px;
        }
        .button:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 25px rgba(230, 115, 80, 0.4);
        }
        .info-box {
          background: linear-gradient(135deg, #FFF3ED 0%, #FFE5D9 100%);
          border-left: 4px solid #E67350;
          padding: 20px;
          border-radius: 10px;
          margin: 30px 0;
        }
        .info-box p {
          margin: 0;
          font-size: 14px;
          color: #666;
        }
        .divider {
          height: 2px;
          background: linear-gradient(90deg, transparent, #E67350, transparent);
          margin: 30px 0;
          opacity: 0.3;
        }
        .link-text {
          font-size: 12px;
          color: #999;
          word-break: break-all;
          background-color: #f9f9f9;
          padding: 15px;
          border-radius: 8px;
          border: 1px dashed #ddd;
          margin-top: 15px;
        }
        .footer {
          background: linear-gradient(180deg, #ffffff 0%, #f9f9f9 100%);
          padding: 30px;
          text-align: center;
          border-top: 1px solid #f0f0f0;
        }
        .footer-text {
          color: #999;
          font-size: 14px;
          margin: 5px 0;
        }
        .footer-tagline {
          color: #E67350;
          font-size: 13px;
          font-weight: 600;
          margin-top: 10px;
        }
        .social-icons {
          margin-top: 15px;
        }
        .social-icon {
          display: inline-block;
          margin: 0 5px;
          font-size: 20px;
        }
        @media only screen and (max-width: 600px) {
          body {
            padding: 20px 10px;
          }
          .content {
            padding: 40px 25px 25px;
          }
          .header h1 {
            font-size: 24px;
          }
          .welcome-text {
            font-size: 20px;
          }
          .button {
            padding: 16px 35px;
            font-size: 15px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">📚</div>
          <h1>Okuyamayanlar Kitap Kulübü</h1>
        </div>
        <div class="content">
          <div class="welcome-text">Merhaba @${name}! 👋</div>
          <p class="description">
            Okuyamayanlar Kitap Kulübü'ne hoş geldiniz! Aramıza katıldığınız için çok mutluyuz. 
            Kitaplarla dolu bu yolculuğa başlamak için sadece bir adım kaldı! ✨
          </p>
          <p class="description">
            E-posta adresinizi onaylamak için aşağıdaki butona tıklayın:
          </p>
          <div class="button-container">
            <a href="${verificationUrl}" class="button">✓ E-posta Adresimi Onayla</a>
          </div>
          <div class="info-box">
            <p>
              <strong>💡 İpucu:</strong> Eğer buton çalışmıyorsa, aşağıdaki linki kopyalayıp tarayıcınıza yapıştırabilirsiniz.
            </p>
          </div>
          <div class="link-text">
            ${verificationUrl}
          </div>
          <div class="divider"></div>
          <p style="font-size: 13px; color: #999; text-align: center;">
            🔒 <strong>Güvenlik:</strong> Bu link 24 saat geçerlidir. Eğer siz bu hesabı oluşturmadıysanız, bu e-postayı güvenle silebilirsiniz.
          </p>
        </div>
        <div class="footer">
          <p class="footer-text">© 2025 Okuyamayanlar Kitap Kulübü</p>
          <p class="footer-tagline">📖 Kitaplarla büyüyen bir topluluk</p>
          <div class="social-icons">
            <span class="social-icon">📚</span>
            <span class="social-icon">💬</span>
            <span class="social-icon">🌟</span>
          </div>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
    Merhaba ${name || 'Değerli Okuyucumuz'},
    
    Okuyamayanlar Kitap Kulübü'ne hoş geldiniz!
    
    E-posta adresinizi onaylamak için lütfen aşağıdaki linki ziyaret edin:
    ${verificationUrl}
    
    Bu link 24 saat geçerlidir.
    
    İyi okumalar!
    Okuyamayanlar Kitap Kulübü
  `

  return sendEmail({
    to: email,
    subject: '📚 E-posta Adresinizi Onaylayın - Okuyamayanlar',
    html,
    text,
  })
}

// Şifre sıfırlama maili
export async function sendPasswordResetEmail(email: string, token: string, name: string) {
  const baseUrl = getBaseUrl()
  const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`
  
  console.log('📧 Password reset email URL:', resetUrl)
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background: linear-gradient(135deg, #2C2416 0%, #3D3226 100%);
          padding: 40px 20px;
          line-height: 1.6;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        }
        .header {
          background: linear-gradient(135deg, #6B5544 0%, #5a4638 100%);
          color: white;
          padding: 50px 30px;
          text-align: center;
          position: relative;
        }
        .header::after {
          content: '';
          position: absolute;
          bottom: -20px;
          left: 0;
          right: 0;
          height: 40px;
          background: #ffffff;
          border-radius: 50% 50% 0 0 / 100% 100% 0 0;
        }
        .lock-icon {
          font-size: 60px;
          margin-bottom: 10px;
          display: inline-block;
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        .header h1 {
          margin: 10px 0 0 0;
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.5px;
        }
        .content {
          padding: 60px 40px 40px;
          color: #333;
        }
        .title-text {
          font-size: 24px;
          color: #6B5544;
          font-weight: 700;
          margin-bottom: 20px;
        }
        .description {
          font-size: 16px;
          color: #555;
          margin-bottom: 15px;
        }
        .button-container {
          text-align: center;
          margin: 40px 0;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #6B5544 0%, #5a4638 100%);
          color: white !important;
          text-decoration: none;
          padding: 18px 45px;
          border-radius: 50px;
          font-weight: 700;
          font-size: 16px;
          box-shadow: 0 8px 20px rgba(107, 85, 68, 0.3);
          transition: all 0.3s ease;
          letter-spacing: 0.5px;
        }
        .button:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 25px rgba(107, 85, 68, 0.4);
        }
        .warning-box {
          background: linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%);
          border-left: 4px solid #FF9800;
          padding: 20px;
          border-radius: 10px;
          margin: 30px 0;
        }
        .warning-box p {
          margin: 0;
          font-size: 14px;
          color: #E65100;
          line-height: 1.8;
        }
        .warning-icon {
          font-size: 24px;
          margin-right: 8px;
          vertical-align: middle;
        }
        .security-box {
          background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%);
          border-left: 4px solid #4CAF50;
          padding: 20px;
          border-radius: 10px;
          margin: 30px 0;
        }
        .security-box p {
          margin: 0;
          font-size: 14px;
          color: #2E7D32;
        }
        .divider {
          height: 2px;
          background: linear-gradient(90deg, transparent, #6B5544, transparent);
          margin: 30px 0;
          opacity: 0.3;
        }
        .link-text {
          font-size: 12px;
          color: #999;
          word-break: break-all;
          background-color: #f9f9f9;
          padding: 15px;
          border-radius: 8px;
          border: 1px dashed #ddd;
          margin-top: 15px;
        }
        .timer-info {
          background: #f5f5f5;
          padding: 15px;
          border-radius: 10px;
          text-align: center;
          margin: 20px 0;
        }
        .timer-text {
          font-size: 14px;
          color: #666;
          font-weight: 600;
        }
        .timer-icon {
          font-size: 20px;
          margin-right: 8px;
        }
        .footer {
          background: linear-gradient(180deg, #ffffff 0%, #f9f9f9 100%);
          padding: 30px;
          text-align: center;
          border-top: 1px solid #f0f0f0;
        }
        .footer-text {
          color: #999;
          font-size: 14px;
          margin: 5px 0;
        }
        .footer-tagline {
          color: #6B5544;
          font-size: 13px;
          font-weight: 600;
          margin-top: 10px;
        }
        .shield-icon {
          font-size: 24px;
          margin-top: 10px;
        }
        @media only screen and (max-width: 600px) {
          body {
            padding: 20px 10px;
          }
          .content {
            padding: 40px 25px 25px;
          }
          .header h1 {
            font-size: 24px;
          }
          .title-text {
            font-size: 20px;
          }
          .button {
            padding: 16px 35px;
            font-size: 15px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="lock-icon">🔒</div>
          <h1>Şifre Sıfırlama Talebi</h1>
        </div>
        <div class="content">
          <div class="title-text">Merhaba @${name}!</div>
          <p class="description">
            Hesabınız için bir şifre sıfırlama talebinde bulundunuz. Yeni şifrenizi belirlemek için aşağıdaki butona tıklayın.
          </p>
          <div class="button-container">
            <a href="${resetUrl}" class="button">🔑 Şifremi Sıfırla</a>
          </div>
          <div class="timer-info">
            <span class="timer-icon">⏱️</span>
            <span class="timer-text">Bu link 1 saat geçerlidir ve sadece bir kez kullanılabilir</span>
          </div>
          <div class="warning-box">
            <p>
              <span class="warning-icon">⚠️</span>
              <strong>Güvenlik Uyarısı:</strong> Bu linki sadece siz talep ettiyseniz kullanın. 
              Eğer bu talebi siz yapmadıysanız, hesabınıza yetkisiz erişim girişimi olabilir. 
              Bu durumda bu e-postayı görmezden gelebilir ve şifrenizi değiştirmeyi düşünebilirsiniz.
            </p>
          </div>
          <div class="security-box">
            <p>
              <strong>💡 İpucu:</strong> Eğer buton çalışmıyorsa, aşağıdaki linki kopyalayıp tarayıcınıza yapıştırabilirsiniz.
            </p>
          </div>
          <div class="link-text">
            ${resetUrl}
          </div>
          <div class="divider"></div>
          <p style="font-size: 13px; color: #999; text-align: center;">
            <strong>Güvenli bir şifre için:</strong> En az 8 karakter, büyük-küçük harf, rakam ve özel karakter kullanın.
          </p>
        </div>
        <div class="footer">
          <p class="footer-text">© 2025 Okuyamayanlar Kitap Kulübü</p>
          <p class="footer-tagline">🛡️ Hesap güvenliğiniz bizim önceliğimiz</p>
          <div class="shield-icon">🔐</div>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
    Merhaba ${name || 'Değerli Okuyucumuz'},
    
    Hesabınız için şifre sıfırlama talebinde bulundunuz.
    
    Yeni şifrenizi belirlemek için lütfen aşağıdaki linki ziyaret edin:
    ${resetUrl}
    
    Bu link 1 saat geçerlidir ve sadece bir kez kullanılabilir.
    
    Eğer bu talebi siz yapmadıysanız, bu e-postayı görmezden gelebilirsiniz.
    
    Okuyamayanlar Kitap Kulübü
  `

  return sendEmail({
    to: email,
    subject: '🔒 Şifre Sıfırlama Talebi - Okuyamayanlar',
    html,
    text,
  })
}

// E-posta onaylandı bildirimi ve yeni kullanıcı hoşgeldin maili
export async function sendWelcomeEmail(email: string, name: string) {
  const baseUrl = getBaseUrl()
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background: linear-gradient(135deg, #FFF3ED 0%, #FFE5D9 100%);
          padding: 40px 20px;
          line-height: 1.6;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(230, 115, 80, 0.15);
        }
        .header {
          background: linear-gradient(135deg, #E67350 0%, #D96544 100%);
          color: white;
          padding: 50px 30px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        .header::before {
          content: '🎉';
          position: absolute;
          font-size: 100px;
          opacity: 0.1;
          top: -20px;
          right: -20px;
          animation: rotate 10s linear infinite;
        }
        .header::after {
          content: '';
          position: absolute;
          bottom: -20px;
          left: 0;
          right: 0;
          height: 40px;
          background: #ffffff;
          border-radius: 50% 50% 0 0 / 100% 100% 0 0;
        }
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .celebration-icon {
          font-size: 70px;
          margin-bottom: 15px;
          display: inline-block;
          animation: bounce 1s ease-in-out infinite;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        .header h1 {
          margin: 10px 0 0 0;
          font-size: 32px;
          font-weight: 700;
          letter-spacing: -0.5px;
          position: relative;
          z-index: 1;
        }
        .content {
          padding: 60px 40px 40px;
          color: #333;
        }
        .congrats-text {
          font-size: 28px;
          color: #E67350;
          font-weight: 700;
          margin-bottom: 25px;
          text-align: center;
        }
        .success-badge {
          background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
          color: white;
          padding: 12px 25px;
          border-radius: 50px;
          display: inline-block;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 25px;
        }
        .description {
          font-size: 16px;
          color: #555;
          margin-bottom: 30px;
          text-align: center;
        }
        .features-title {
          font-size: 20px;
          color: #333;
          font-weight: 700;
          margin: 30px 0 20px;
          text-align: center;
        }
        .feature-grid {
          display: table;
          width: 100%;
          margin: 30px 0;
        }
        .feature-item {
          display: table-row;
        }
        .feature-icon {
          display: table-cell;
          width: 50px;
          font-size: 32px;
          padding: 15px 10px;
          vertical-align: top;
        }
        .feature-content {
          display: table-cell;
          padding: 15px 10px;
          vertical-align: top;
        }
        .feature-title {
          font-weight: 700;
          color: #333;
          margin-bottom: 5px;
          font-size: 16px;
        }
        .feature-desc {
          color: #666;
          font-size: 14px;
        }
        .button-container {
          text-align: center;
          margin: 40px 0;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #E67350 0%, #D96544 100%);
          color: white !important;
          text-decoration: none;
          padding: 18px 50px;
          border-radius: 50px;
          font-weight: 700;
          font-size: 16px;
          box-shadow: 0 8px 20px rgba(230, 115, 80, 0.3);
          transition: all 0.3s ease;
          letter-spacing: 0.5px;
        }
        .button:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 25px rgba(230, 115, 80, 0.4);
        }
        .quote-box {
          background: linear-gradient(135deg, #FFF3ED 0%, #FFE5D9 100%);
          border-left: 4px solid #E67350;
          padding: 25px;
          border-radius: 10px;
          margin: 40px 0;
          text-align: center;
          font-style: italic;
        }
        .quote-text {
          font-size: 16px;
          color: #666;
          line-height: 1.8;
        }
        .quote-author {
          font-size: 14px;
          color: #999;
          margin-top: 10px;
          font-weight: 600;
        }
        .footer {
          background: linear-gradient(180deg, #ffffff 0%, #f9f9f9 100%);
          padding: 40px;
          text-align: center;
          border-top: 1px solid #f0f0f0;
        }
        .footer-text {
          color: #999;
          font-size: 14px;
          margin: 5px 0;
        }
        .footer-tagline {
          color: #E67350;
          font-size: 13px;
          font-weight: 600;
          margin-top: 15px;
        }
        .social-icons {
          margin-top: 20px;
        }
        .social-icon {
          display: inline-block;
          margin: 0 8px;
          font-size: 28px;
        }
        @media only screen and (max-width: 600px) {
          body {
            padding: 20px 10px;
          }
          .content {
            padding: 40px 25px 25px;
          }
          .header h1 {
            font-size: 26px;
          }
          .congrats-text {
            font-size: 22px;
          }
          .button {
            padding: 16px 40px;
            font-size: 15px;
          }
          .feature-icon {
            font-size: 28px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="celebration-icon">🎉</div>
          <h1>Hoş Geldiniz!</h1>
        </div>
        <div class="content">
          <div style="text-align: center;">
            <div class="success-badge">✓ E-posta Onaylandı</div>
          </div>
          <div class="congrats-text">Tebrikler @${name}! 🎊</div>
          <p class="description">
            E-posta adresiniz başarıyla onaylandı! Artık <strong>@${name}</strong> kullanıcı adı ile Okuyamayanlar Kitap Kulübü'nün 
            tüm özelliklerinden yararlanabilir ve kitapseverlerin harika dünyasına adım atabilirsiniz.
          </p>
          
          <div class="features-title">🌟 Size Neler Sunuyoruz?</div>
          
          <div class="feature-grid">
            <div class="feature-item">
              <div class="feature-icon">📚</div>
              <div class="feature-content">
                <div class="feature-title">Zengin Kütüphane</div>
                <div class="feature-desc">Binlerce kitabı keşfedin, favorilerinize ekleyin ve okuma listenizi oluşturun</div>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">💬</div>
              <div class="feature-content">
                <div class="feature-title">Aktif Forum</div>
                <div class="feature-desc">Diğer okuyucularla kitaplar hakkında fikir paylaşın ve tartışmalara katılın</div>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">📅</div>
              <div class="feature-content">
                <div class="feature-title">Etkinlikler</div>
                <div class="feature-desc">Kitap okuma etkinlikleri, yazar söyleşileri ve buluşmalara katılın</div>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">⭐</div>
              <div class="feature-content">
                <div class="feature-title">Değerlendirme Sistemi</div>
                <div class="feature-desc">Okuduğunuz kitapları değerlendirin ve diğerlerinin yorumlarını keşfedin</div>
              </div>
            </div>
            <div class="feature-item">
              <div class="feature-icon">🎯</div>
              <div class="feature-content">
                <div class="feature-title">Kişisel Profil</div>
                <div class="feature-desc">Okuma istatistiklerinizi takip edin ve kitap maceranızı kaydedin</div>
              </div>
            </div>
          </div>

          <div class="button-container">
            <a href="${baseUrl}" class="button">🚀 Keşfetmeye Başla</a>
          </div>

          <div class="quote-box">
            <div class="quote-text">
              "Kitap okumak, başka bir hayat yaşamak gibidir. 
              Her sayfa yeni bir dünya, her satır yeni bir macera..."
            </div>
            <div class="quote-author">— Okuyamayanlar Topluluğu</div>
          </div>

          <p style="text-align: center; color: #E67350; font-size: 18px; font-weight: 600; margin-top: 30px;">
            İyi okumalar dileriz! 📖✨
          </p>
        </div>
        <div class="footer">
          <div class="social-icons">
            <span class="social-icon">📚</span>
            <span class="social-icon">💬</span>
            <span class="social-icon">🌟</span>
            <span class="social-icon">📖</span>
          </div>
          <p class="footer-text" style="margin-top: 20px;">© 2025 Okuyamayanlar Kitap Kulübü</p>
          <p class="footer-tagline">📖 Kitaplarla büyüyen bir topluluk • Her gün yeni bir sayfa</p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: '🎉 Hoş Geldiniz - Okuyamayanlar Kitap Kulübü',
    html,
  })
}

// Etkinlik iptali bildirimi
export async function sendEventCancellationEmail(
  email: string, 
  username: string, 
  eventTitle: string,
  eventDate: string,
  cancellationReason?: string
) {
  const baseUrl = getBaseUrl()
  
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background: linear-gradient(135deg, #2C2416 0%, #3D3226 100%);
          padding: 40px 20px;
          line-height: 1.6;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background-color: #ffffff;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
        }
        .header {
          background: linear-gradient(135deg, #EF5350 0%, #E53935 100%);
          color: white;
          padding: 50px 30px;
          text-align: center;
          position: relative;
        }
        .header::after {
          content: '';
          position: absolute;
          bottom: -20px;
          left: 0;
          right: 0;
          height: 40px;
          background: #ffffff;
          border-radius: 50% 50% 0 0 / 100% 100% 0 0;
        }
        .cancel-icon {
          font-size: 60px;
          margin-bottom: 10px;
          display: inline-block;
          animation: shake 0.5s ease-in-out;
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-10px); }
          75% { transform: translateX(10px); }
        }
        .header h1 {
          margin: 10px 0 0 0;
          font-size: 28px;
          font-weight: 700;
          letter-spacing: -0.5px;
          position: relative;
          z-index: 1;
        }
        .content {
          padding: 60px 40px 40px;
          color: #333;
        }
        .alert-box {
          background: linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%);
          border-left: 4px solid #EF5350;
          padding: 20px;
          border-radius: 10px;
          margin: 30px 0;
        }
        .alert-box p {
          margin: 0;
          font-size: 16px;
          color: #C62828;
          font-weight: 600;
        }
        .event-details {
          background: #F5F5F5;
          padding: 25px;
          border-radius: 10px;
          margin: 30px 0;
        }
        .event-row {
          display: table;
          width: 100%;
          margin-bottom: 15px;
        }
        .event-row:last-child {
          margin-bottom: 0;
        }
        .event-label {
          display: table-cell;
          font-weight: 700;
          color: #666;
          width: 120px;
          padding-right: 15px;
        }
        .event-value {
          display: table-cell;
          color: #333;
        }
        .reason-box {
          background: linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%);
          border-left: 4px solid #FF9800;
          padding: 20px;
          border-radius: 10px;
          margin: 30px 0;
        }
        .reason-title {
          font-weight: 700;
          color: #E65100;
          margin-bottom: 10px;
          font-size: 16px;
        }
        .reason-text {
          color: #BF360C;
          font-size: 14px;
          line-height: 1.8;
        }
        .button-container {
          text-align: center;
          margin: 40px 0;
        }
        .button {
          display: inline-block;
          background: linear-gradient(135deg, #6B5544 0%, #5a4638 100%);
          color: white !important;
          text-decoration: none;
          padding: 18px 45px;
          border-radius: 50px;
          font-weight: 700;
          font-size: 16px;
          box-shadow: 0 8px 20px rgba(107, 85, 68, 0.3);
          transition: all 0.3s ease;
          letter-spacing: 0.5px;
        }
        .button:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 25px rgba(107, 85, 68, 0.4);
        }
        .info-box {
          background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%);
          border-left: 4px solid #4CAF50;
          padding: 20px;
          border-radius: 10px;
          margin: 30px 0;
        }
        .info-box p {
          margin: 0;
          font-size: 14px;
          color: #2E7D32;
        }
        .footer {
          background: linear-gradient(180deg, #ffffff 0%, #f9f9f9 100%);
          padding: 30px;
          text-align: center;
          border-top: 1px solid #f0f0f0;
        }
        .footer-text {
          color: #999;
          font-size: 14px;
          margin: 5px 0;
        }
        .footer-tagline {
          color: #EF5350;
          font-size: 13px;
          font-weight: 600;
          margin-top: 10px;
        }
        @media only screen and (max-width: 600px) {
          body {
            padding: 20px 10px;
          }
          .content {
            padding: 40px 25px 25px;
          }
          .header h1 {
            font-size: 24px;
          }
          .button {
            padding: 16px 35px;
            font-size: 15px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="cancel-icon">❌</div>
          <h1>Etkinlik İptal Edildi</h1>
        </div>
        <div class="content">
          <h2 style="color: #333; margin-bottom: 20px;">Merhaba @${username},</h2>
          
          <div class="alert-box">
            <p>⚠️ Kayıt olduğunuz etkinlik iptal edilmiştir.</p>
          </div>

          <p style="color: #666; font-size: 16px; line-height: 1.8; margin: 20px 0;">
            Üzülerek bildiririz ki, kayıt olduğunuz <strong>"${eventTitle}"</strong> etkinliği iptal edilmiştir.
          </p>

          <div class="event-details">
            <h3 style="color: #333; margin-bottom: 20px; font-size: 18px;">📅 Etkinlik Detayları</h3>
            <div class="event-row">
              <div class="event-label">Etkinlik:</div>
              <div class="event-value">${eventTitle}</div>
            </div>
            <div class="event-row">
              <div class="event-label">Tarih:</div>
              <div class="event-value">${eventDate}</div>
            </div>
          </div>

          ${cancellationReason ? `
          <div class="reason-box">
            <div class="reason-title">İptal Nedeni:</div>
            <div class="reason-text">${cancellationReason}</div>
          </div>
          ` : ''}

          <div class="info-box">
            <p>
              <strong>💡 Bilgi:</strong> Gelecek etkinliklerimizden haberdar olmak için etkinlikler sayfamızı düzenli olarak ziyaret edebilirsiniz.
            </p>
          </div>

          <div class="button-container">
            <a href="${baseUrl}/events" class="button">📅 Diğer Etkinlikleri Gör</a>
          </div>

          <p style="text-align: center; color: #999; font-size: 14px; margin-top: 30px;">
            Anlayışınız için teşekkür ederiz. Bir sonraki etkinlikte görüşmek dileğiyle! 🙏
          </p>
        </div>
        <div class="footer">
          <p class="footer-text">© 2025 Okuyamayanlar Kitap Kulübü</p>
          <p class="footer-tagline">📚 Her zaman sizin için buradayız</p>
        </div>
      </div>
    </body>
    </html>
  `

  const text = `
    Merhaba @${username},

    Üzülerek bildiririz ki, kayıt olduğunuz "${eventTitle}" etkinliği iptal edilmiştir.
    
    Etkinlik Tarihi: ${eventDate}
    ${cancellationReason ? `\nİptal Nedeni: ${cancellationReason}` : ''}
    
    Gelecek etkinliklerimizden haberdar olmak için: ${baseUrl}/events
    
    Anlayışınız için teşekkür ederiz.
    
    Okuyamayanlar Kitap Kulübü
  `

  return sendEmail({
    to: email,
    subject: `❌ Etkinlik İptal Edildi: ${eventTitle}`,
    html,
    text,
  })
}

// Rozet kazanma emaili
export async function sendBadgeEarnedEmail(
  email: string,
  username: string,
  badgeName: string,
  badgeIcon: string,
  badgeDescription: string
) {
  const baseUrl = getBaseUrl()
  
  const text = `
    Tebrikler @${username}!
    
    Yeni bir rozet kazandın: ${badgeIcon} ${badgeName}
    
    ${badgeDescription}
    
    Rozetlerini görmek için: ${baseUrl}/profile
    
    © 2025 Okuyamayanlar Kitap Kulübü
  `

  const html = `
    <!DOCTYPE html>
    <html lang="tr">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Yeni Rozet Kazandın!</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
        }

        .container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 40px 30px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }

        .header::before {
          content: '';
          position: absolute;
          top: -50%;
          left: -50%;
          width: 200%;
          height: 200%;
          background: repeating-linear-gradient(
            45deg,
            transparent,
            transparent 10px,
            rgba(255, 255, 255, 0.05) 10px,
            rgba(255, 255, 255, 0.05) 20px
          );
          animation: slide 20s linear infinite;
        }

        @keyframes slide {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50%, 50%); }
        }

        .badge-icon {
          font-size: 80px;
          margin-bottom: 15px;
          display: inline-block;
          animation: bounce 2s ease-in-out infinite;
          position: relative;
          z-index: 1;
        }

        @keyframes bounce {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-20px) scale(1.1);
          }
        }

        .header h1 {
          color: white;
          font-size: 28px;
          font-weight: 700;
          text-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
          position: relative;
          z-index: 1;
          margin-bottom: 10px;
        }

        .header-subtitle {
          color: rgba(255, 255, 255, 0.9);
          font-size: 16px;
          position: relative;
          z-index: 1;
        }

        .content {
          padding: 40px 30px;
        }

        .congrats-box {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 15px;
          padding: 25px;
          text-align: center;
          margin-bottom: 30px;
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.3);
        }

        .congrats-box h2 {
          color: white;
          font-size: 24px;
          margin-bottom: 10px;
        }

        .congrats-box p {
          color: rgba(255, 255, 255, 0.9);
          font-size: 16px;
        }

        .badge-details {
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
          border-radius: 15px;
          padding: 30px;
          margin-bottom: 30px;
          text-align: center;
        }

        .badge-name {
          font-size: 28px;
          color: #333;
          font-weight: bold;
          margin-bottom: 15px;
        }

        .badge-description {
          font-size: 16px;
          color: #666;
          line-height: 1.6;
        }

        .celebration {
          text-align: center;
          font-size: 40px;
          margin: 20px 0;
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.2);
            opacity: 0.8;
          }
        }

        .button-container {
          text-align: center;
          margin: 30px 0;
        }

        .button {
          display: inline-block;
          padding: 15px 40px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white !important;
          text-decoration: none;
          border-radius: 50px;
          font-weight: bold;
          font-size: 16px;
          box-shadow: 0 10px 30px rgba(102, 126, 234, 0.4);
          transition: all 0.3s ease;
        }

        .button:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 40px rgba(102, 126, 234, 0.5);
        }

        .footer {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          padding: 20px;
          text-align: center;
        }

        .footer-text {
          color: white;
          font-size: 14px;
          margin-bottom: 5px;
        }

        .footer-tagline {
          color: rgba(255, 255, 255, 0.8);
          font-size: 12px;
        }

        @media (max-width: 600px) {
          body {
            padding: 10px;
          }

          .content {
            padding: 30px 20px;
          }

          .header h1 {
            font-size: 24px;
          }

          .badge-icon {
            font-size: 60px;
          }
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="badge-icon">${badgeIcon}</div>
          <h1>Yeni Rozet Kazandın!</h1>
          <div class="header-subtitle">Tebrikler! Başarın ödüllendirildi 🎊</div>
        </div>
        <div class="content">
          <h2 style="color: #333; margin-bottom: 20px;">Merhaba @${username},</h2>
          
          <div class="congrats-box">
            <h2>🎉 Tebrikler! 🎉</h2>
            <p>Harika bir başarı elde ettin ve yeni bir rozet kazandın!</p>
          </div>

          <div class="badge-details">
            <div class="badge-name">${badgeIcon} ${badgeName}</div>
            <div class="badge-description">${badgeDescription}</div>
          </div>

          <div class="celebration">🌟 ✨ 🎊 ⭐ 🏆</div>

          <p style="color: #666; font-size: 16px; line-height: 1.8; text-align: center; margin: 20px 0;">
            Bu rozet, topluluğumuza olan katkılarınızın ve başarılarınızın bir göstergesidir. 
            Devam ettikçe daha fazla rozet kazanabilir ve profilini zenginleştirebilirsin!
          </p>

          <div class="button-container">
            <a href="${baseUrl}/profile" class="button">🏆 Rozetlerimi Gör</a>
          </div>

          <p style="text-align: center; color: #999; font-size: 14px; margin-top: 30px;">
            Başarılarının devamını dileriz! 💪
          </p>
        </div>
        <div class="footer">
          <p class="footer-text">© 2025 Okuyamayanlar Kitap Kulübü</p>
          <p class="footer-tagline">🎖️ Her başarının ödülünü al!</p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendEmail({
    to: email,
    subject: `🎉 Yeni Rozet Kazandın: ${badgeName}`,
    html,
    text,
  })
}
