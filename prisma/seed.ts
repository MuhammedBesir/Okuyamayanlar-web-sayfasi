import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // Admin kullanıcı oluştur (Süper Admin)
  const adminPassword = await bcrypt.hash("admin123", 10)
  const admin = await prisma.user.upsert({
    where: { email: "wastedtr34@gmail.com" },
    update: { role: "ADMIN", emailVerified: new Date() },
    create: {
      email: "wastedtr34@gmail.com",
      name: "Süper Admin",
      username: "superadmin",
      password: adminPassword,
      role: "ADMIN",
      emailVerified: new Date(),
    },
  })

  console.log("✅ Super Admin created/updated:", admin.email)

  // Örnek kullanıcılar oluştur
  const userPassword = await bcrypt.hash("user123", 10)
  const users = await Promise.all([
    prisma.user.upsert({
      where: { email: "mehmet@example.com" },
      update: {},
      create: {
        email: "mehmet@example.com",
        name: "Mehmet Yılmaz",
        username: "mehmet",
        password: userPassword,
      },
    }),
    prisma.user.upsert({
      where: { email: "ayse@example.com" },
      update: {},
      create: {
        email: "ayse@example.com",
        name: "Ayşe Demir",
        username: "ayse",
        password: userPassword,
      },
    }),
    prisma.user.upsert({
      where: { email: "ali@example.com" },
      update: {},
      create: {
        email: "ali@example.com",
        name: "Ali Kaya",
        username: "ali",
        password: userPassword,
      },
    }),
  ])

  console.log("✅ Users created")

  // Rozetleri oluştur (sadece yoksa ekle - unique name)
  const badgeNames = [
    "İlk Adım", "Kitap Kurdu", "Kütüphane Ustası", "Edebiyat Profesörü",
    "İlk Yorum", "Tartışmacı", "Forum Kahramanı",
    "İlk Etkinlik", "Etkinlik Bağımlısı", "Topluluk Yıldızı",
    "Hoş Geldin", "Profil Tamamlayıcı",
    "Kurucu Üye", "Yönetici", "Değerli Katkı"
  ]
  
  const existingBadges = await prisma.badge.findMany()
  const existingBadgeNames = existingBadges.map(b => b.name)
  
  if (existingBadgeNames.length === 0) {
    console.log("📛 Creating badges...")
    await prisma.badge.createMany({
      data: [
        { name: "İlk Adım", description: "İlk kitabını okuma listesine ekle", icon: "📖", color: "#3b82f6", category: "READING", requirement: 1, order: 1, isImportant: false },
        { name: "Kitap Kurdu", description: "10 kitap oku", icon: "🐛", color: "#10b981", category: "READING", requirement: 10, order: 2, isImportant: true },
        { name: "Kütüphane Ustası", description: "50 kitap oku", icon: "📚", color: "#f59e0b", category: "READING", requirement: 50, order: 3, isImportant: true },
        { name: "Edebiyat Profesörü", description: "100 kitap oku", icon: "🎓", color: "#8b5cf6", category: "READING", requirement: 100, order: 4, isImportant: true },
        { name: "İlk Yorum", description: "Forum'da ilk yorumunu yap", icon: "💬", color: "#06b6d4", category: "FORUM", requirement: 1, order: 5, isImportant: false },
        { name: "Tartışmacı", description: "50 forum yorumu yap", icon: "🗣️", color: "#ec4899", category: "FORUM", requirement: 50, order: 6, isImportant: true },
        { name: "Forum Kahramanı", description: "100 forum yorumu yap", icon: "🦸", color: "#ef4444", category: "FORUM", requirement: 100, order: 7, isImportant: true },
        { name: "İlk Etkinlik", description: "İlk etkinliğine katıl", icon: "🎉", color: "#14b8a6", category: "EVENT", requirement: 1, order: 8, isImportant: false },
        { name: "Etkinlik Bağımlısı", description: "10 etkinliğe katıl", icon: "🎊", color: "#a855f7", category: "EVENT", requirement: 10, order: 9, isImportant: true },
        { name: "Topluluk Yıldızı", description: "25 etkinliğe katıl", icon: "⭐", color: "#f59e0b", category: "EVENT", requirement: 25, order: 10, isImportant: true },
        { name: "Hoş Geldin", description: "Hesabını oluştur", icon: "👋", color: "#6366f1", category: "PROFILE", requirement: 1, order: 11, isImportant: false },
        { name: "Profil Tamamlayıcı", description: "Profilini tamamen doldur", icon: "✅", color: "#22c55e", category: "PROFILE", requirement: 1, order: 12, isImportant: false },
        { name: "Kurucu Üye", description: "Kulübün ilk üyelerinden biri", icon: "👑", color: "#fbbf24", category: "SPECIAL", isSpecial: true, order: 13, isImportant: true },
        { name: "Yönetici", description: "Kulüp yönetim ekibi", icon: "🛡️", color: "#dc2626", category: "SPECIAL", isSpecial: true, order: 14, isImportant: true },
        { name: "Değerli Katkı", description: "Kulübe özel katkıları için", icon: "🏆", color: "#f97316", category: "SPECIAL", isSpecial: true, order: 15, isImportant: true },
      ],
      skipDuplicates: true,
    })
  }
  
  const badges = await prisma.badge.findMany({ orderBy: { order: 'asc' } })
  console.log(`✅ Badges ready (${badges.length} total)`)

  // Kitaplar - sadece yoksa ekle
  const bookCount = await prisma.book.count()
  if (bookCount < 78) {
    console.log("📚 Creating books...")
    
    const booksToAdd = [
      { title: "İki Şehrin Hikayesi", author: "Charles Dickens", description: "Fransız Devrimi döneminde Londra ve Paris'te geçen, aşk, fedakarlık ve adalet temalı klasik bir eser.", isbn: "9786257711609", publishedYear: 1859, publisher: "İş Bankası Kültür Yayınları", pageCount: 464, language: "Türkçe", genre: "Klasik", category: "Roman", tags: ["Klasik", "Tarih", "Fransız Devrimi"], coverImage: "https://via.placeholder.com/400x600?text=İki+Şehrin+Hikayesi" },
      { title: "Mahalle Kahvesi", author: "Sevinç Çokum", description: "Mahalle kültürünün sıcaklığını anlatan samimi bir roman.", isbn: "9786050959437", publishedYear: 2018, publisher: "Doğan Kitap", pageCount: 216, language: "Türkçe", genre: "Çağdaş Türk Edebiyatı", category: "Roman", tags: ["Mahalle", "Dostluk"], coverImage: "https://via.placeholder.com/400x600?text=Mahalle+Kahvesi" },
      { title: "Rahel Tanrı'yla Hesaplaşıyor", author: "Stefan Zweig", description: "Eski Ahit'in önemli figürlerinden Rahel'in hikayesi.", isbn: "9786053606239", publishedYear: 1929, publisher: "İş Bankası Kültür Yayınları", pageCount: 96, language: "Türkçe", genre: "Klasik", category: "Roman", tags: ["Stefan Zweig", "İnanç"], coverImage: "https://via.placeholder.com/400x600?text=Rahel" },
      { title: "Gezgin", author: "Kahlil Gibran", description: "Yaşamın anlamını arayan bir gezginin felsefi yolculuğu.", isbn: "9789944824750", publishedYear: 1923, publisher: "Can Yayınları", pageCount: 112, language: "Türkçe", genre: "Felsefe", category: "Felsefe", tags: ["Felsefe", "Şiir"], coverImage: "https://via.placeholder.com/400x600?text=Gezgin" },
      { title: "Vadideki Zambak", author: "Honoré de Balzac", description: "Aşkın ve tutkun sınırlarını zorlayan bir kadının trajedisi.", isbn: "9789750738586", publishedYear: 1835, publisher: "İletişim Yayınları", pageCount: 312, language: "Türkçe", genre: "Klasik", category: "Roman", tags: ["Klasik", "Aşk", "Trajedi"], coverImage: "https://via.placeholder.com/400x600?text=Vadideki+Zambak" },
      { title: "Bir Yeniçeri Masalı", author: "Konstantin Mihailović", description: "Osmanlı döneminde bir yeniçerinin yaşadıklarını anlatan tarihi belge.", isbn: "9786053607984", publishedYear: 1497, publisher: "Türkiye İş Bankası Kültür Yayınları", pageCount: 168, language: "Türkçe", genre: "Tarih", category: "Tarih", tags: ["Osmanlı", "Yeniçeri", "Tarih"], coverImage: "https://via.placeholder.com/400x600?text=Bir+Yeniçeri+Masalı" },
      { title: "Kuyucaklı Yusuf", author: "Sabahattin Ali", description: "Aşk, namus ve toplumsal baskı temalı Türk edebiyatının başyapıtlarından.", isbn: "9789750738579", publishedYear: 1937, publisher: "Yapı Kredi Yayınları", pageCount: 200, language: "Türkçe", genre: "Türk Klasikleri", category: "Roman", tags: ["Türk Klasikleri", "Aşk", "Trajedi"], coverImage: "https://via.placeholder.com/400x600?text=Kuyucaklı+Yusuf" },
      { title: "Notre Dame'ın Kamburu", author: "Victor Hugo", description: "Quasimodo ve Esmeralda'nın trajik hikayesi.", isbn: "9789750738593", publishedYear: 1831, publisher: "İş Bankası Kültür Yayınları", pageCount: 624, language: "Türkçe", genre: "Klasik", category: "Roman", tags: ["Klasik", "Victor Hugo", "Aşk"], coverImage: "https://via.placeholder.com/400x600?text=Notre+Dame" },
      { title: "Sokratesin Savunması", author: "Platon", description: "Sokrates'in mahkemede yaptığı savunma konuşması.", isbn: "9789750738609", publishedYear: -399, publisher: "Türkiye İş Bankası Kültür Yayınları", pageCount: 96, language: "Türkçe", genre: "Felsefe", category: "Felsefe", tags: ["Felsefe", "Sokrates", "Platon"], coverImage: "https://via.placeholder.com/400x600?text=Sokratesin+Savunması" },
      { title: "Putların Alacakaranlığı", author: "Friedrich Nietzsche", description: "Nietzsche'nin felsefe tarihine eleştirel yaklaşımı.", isbn: "9789750738616", publishedYear: 1889, publisher: "Say Yayınları", pageCount: 144, language: "Türkçe", genre: "Felsefe", category: "Felsefe", tags: ["Felsefe", "Nietzsche"], coverImage: "https://via.placeholder.com/400x600?text=Putların+Alacakaranlığı" },
      { title: "İçimizdeki Şeytan", author: "Sabahattin Ali", description: "İnsanın iç dünyasındaki karanlık yönleri ele alan psikolojik öykü.", isbn: "9789750738623", publishedYear: 1940, publisher: "Yapı Kredi Yayınları", pageCount: 104, language: "Türkçe", genre: "Türk Klasikleri", category: "Öykü", tags: ["Türk Klasikleri", "Psikolojik"], coverImage: "https://via.placeholder.com/400x600?text=İçimizdeki+Şeytan" },
      { title: "Uçurtma Avcısı", author: "Khaled Hosseini", description: "Afganistan'da geçen dostluk, ihanet ve bağışlama hikayesi.", isbn: "9786053607991", publishedYear: 2003, publisher: "Everest Yayınları", pageCount: 392, language: "Türkçe", genre: "Çağdaş Dünya Edebiyatı", category: "Roman", tags: ["Çağdaş", "Dostluk", "Dram"], coverImage: "https://via.placeholder.com/400x600?text=Uçurtma+Avcısı" },
      { title: "Troleybüs Problemi", author: "Hakan Günday", description: "Modern dünyada yaşanan etik ikilemleri sorgulayan roman.", isbn: "9786050959444", publishedYear: 2019, publisher: "Doğan Kitap", pageCount: 248, language: "Türkçe", genre: "Çağdaş Türk Edebiyatı", category: "Roman", tags: ["Çağdaş", "Felsefe", "Etik"], coverImage: "https://via.placeholder.com/400x600?text=Troleybüs+Problemi" },
      { title: "Kırık Çete", author: "Peyami Safa", description: "İstanbul'un kenar mahallelerinde yaşayan insanların hikayesi.", isbn: "9789750738630", publishedYear: 1935, publisher: "Ötüken Neşriyat", pageCount: 176, language: "Türkçe", genre: "Türk Klasikleri", category: "Roman", tags: ["Türk Klasikleri", "Sosyal"], coverImage: "https://via.placeholder.com/400x600?text=Kırık+Çete" },
      { title: "Simyacı", author: "Paulo Coelho", description: "Hayallerini gerçekleştirmek için yola çıkan çobanın alegorik yolculuğu.", isbn: "9789750738647", publishedYear: 1988, publisher: "Can Yayınları", pageCount: 176, language: "Türkçe", genre: "Çağdaş Dünya Edebiyatı", category: "Roman", tags: ["Çağdaş", "Alegorik", "Ruhsal"], coverImage: "https://via.placeholder.com/400x600?text=Simyacı" },
      { title: "Sol Ayağım", author: "Christy Brown", description: "Serebral palsi hastası yazarın ilham verici otobiyografisi.", isbn: "9789750738654", publishedYear: 1954, publisher: "Türkiye İş Bankası Kültür Yayınları", pageCount: 208, language: "Türkçe", genre: "Biyografi", category: "Biyografi", tags: ["Biyografi", "İlham Verici"], coverImage: "https://via.placeholder.com/400x600?text=Sol+Ayağım" },
      { title: "Amok Koşucusu", author: "Stefan Zweig", description: "Tutkuların insanı sürüklediği yıkıcı güç üzerine psikolojik novella.", isbn: "9789750738661", publishedYear: 1922, publisher: "Türkiye İş Bankası Kültür Yayınları", pageCount: 112, language: "Türkçe", genre: "Klasik", category: "Novella", tags: ["Stefan Zweig", "Psikolojik"], coverImage: "https://via.placeholder.com/400x600?text=Amok+Koşucusu" },
      { title: "Genç Werther'in Acıları", author: "Johann Wolfgang von Goethe", description: "Romantizm akımının başyapıtlarından biri.", isbn: "9789750738678", publishedYear: 1774, publisher: "İş Bankası Kültür Yayınları", pageCount: 144, language: "Türkçe", genre: "Klasik", category: "Roman", tags: ["Klasik", "Romantizm", "Aşk"], coverImage: "https://via.placeholder.com/400x600?text=Genç+Werther" },
      { title: "Ben Bir Gürgen Dalıyım, Seçme Şiirler", author: "Cemal Süreya", description: "Cemal Süreya'nın seçme şiirleri.", isbn: "9789750738685", publishedYear: 1990, publisher: "Yapı Kredi Yayınları", pageCount: 240, language: "Türkçe", genre: "Şiir", category: "Şiir", tags: ["Şiir", "Türk Edebiyatı"], coverImage: "https://via.placeholder.com/400x600?text=Ben+Bir+Gürgen+Dalıyım" },
      { title: "Taaşuk-ı Talat ve Fitnat", author: "Şemseddin Sami", description: "Osmanlı döneminin ilk romanlarından.", isbn: "9789750738692", publishedYear: 1872, publisher: "Özgür Yayınları", pageCount: 168, language: "Türkçe", genre: "Türk Klasikleri", category: "Roman", tags: ["Türk Klasikleri", "Osmanlı"], coverImage: "https://via.placeholder.com/400x600?text=Taaşuk-ı+Talat" },
      { title: "Kavim", author: "Müge İplikçi", description: "Toplumsal kimlik ve aidiyet temaları üzerine çağdaş roman.", isbn: "9786050959451", publishedYear: 2020, publisher: "Doğan Kitap", pageCount: 296, language: "Türkçe", genre: "Çağdaş Türk Edebiyatı", category: "Roman", tags: ["Çağdaş", "Kimlik"], coverImage: "https://via.placeholder.com/400x600?text=Kavim" },
      { title: "İvan İlyiç'in Ölümü", author: "Lev Tolstoy", description: "Ölüm ve yaşamın anlamı üzerine felsefi novella.", isbn: "9789750738708", publishedYear: 1886, publisher: "İş Bankası Kültür Yayınları", pageCount: 320, language: "Türkçe", genre: "Klasik", category: "Novella", tags: ["Klasik", "Felsefe", "Tolstoy"], coverImage: "https://via.placeholder.com/400x600?text=İvan+İlyiç" },
      { title: "Satranç", author: "Stefan Zweig", description: "İki satranç ustasının karşılaşması üzerinden insan psikolojisi.", isbn: "9789750738715", publishedYear: 1942, publisher: "Türkiye İş Bankası Kültür Yayınları", pageCount: 96, language: "Türkçe", genre: "Klasik", category: "Novella", tags: ["Stefan Zweig", "Psikolojik"], coverImage: "https://via.placeholder.com/400x600?text=Satranç" },
      { title: "Charlie'nin Büyük Cam Asansörü", author: "Roald Dahl", description: "Charlie ve Çikolata Fabrikası'nın devamı.", isbn: "9789750738722", publishedYear: 1972, publisher: "Can Çocuk Yayınları", pageCount: 192, language: "Türkçe", genre: "Çocuk Kitapları", category: "Çocuk", tags: ["Çocuk", "Macera"], coverImage: "https://via.placeholder.com/400x600?text=Charlie+Asansör" },
      { title: "Korku", author: "Stefan Zweig", description: "Bir kadının yaşadığı korku ve psikolojik gerilim.", isbn: "9789750738739", publishedYear: 1920, publisher: "Türkiye İş Bankası Kültür Yayınları", pageCount: 112, language: "Türkçe", genre: "Klasik", category: "Novella", tags: ["Stefan Zweig", "Gerilim"], coverImage: "https://via.placeholder.com/400x600?text=Korku" },
      { title: "Kendine Ait Bir Oda", author: "Virginia Woolf", description: "Kadın yazarlar ve yaratıcılık üzerine feminist deneme.", isbn: "9789750738746", publishedYear: 1929, publisher: "İletişim Yayınları", pageCount: 144, language: "Türkçe", genre: "Deneme", category: "Deneme", tags: ["Feminizm", "Virginia Woolf"], coverImage: "https://via.placeholder.com/400x600?text=Kendine+Ait+Bir+Oda" },
      { title: "Kumarbaz", author: "Fyodor Dostoyevski", description: "Kumar tutkusunun insanı esir alması üzerine psikolojik roman.", isbn: "9789750738753", publishedYear: 1867, publisher: "İş Bankası Kültür Yayınları", pageCount: 232, language: "Türkçe", genre: "Klasik", category: "Roman", tags: ["Klasik", "Dostoyevski"], coverImage: "https://via.placeholder.com/400x600?text=Kumarbaz" },
      { title: "Hafıza Defteri", author: "Ahmet Ümit", description: "Geçmiş, hafıza ve kimlik üzerine polisiye roman.", isbn: "9786050959468", publishedYear: 2010, publisher: "Everest Yayınları", pageCount: 384, language: "Türkçe", genre: "Polisiye", category: "Polisiye", tags: ["Polisiye", "Ahmet Ümit"], coverImage: "https://via.placeholder.com/400x600?text=Hafıza+Defteri" },
      { title: "Şeytan İşi", author: "Daron Acemoğlu & James A. Robinson", description: "Ekonomik eşitsizlik ve siyaset üzerine analitik inceleme.", isbn: "9789750738760", publishedYear: 2019, publisher: "Doğan Kitap", pageCount: 528, language: "Türkçe", genre: "Araştırma", category: "Bilim", tags: ["Ekonomi", "Siyaset"], coverImage: "https://via.placeholder.com/400x600?text=Şeytan+İşi" },
      { title: "Derinliğine Kimse Sevgili Olamadı", author: "Sezen Aksu", description: "Sezen Aksu'nun şarkı sözlerinden derleme.", isbn: "9786050959475", publishedYear: 2018, publisher: "Doğan Kitap", pageCount: 200, language: "Türkçe", genre: "Şiir", category: "Şiir", tags: ["Şiir", "Şarkı Sözleri"], coverImage: "https://via.placeholder.com/400x600?text=Derinliğine" },
      { title: "Geniş Zamanlar", author: "Zülfü Livaneli", description: "Türkiye'nin yakın tarihindeki toplumsal dönüşümler.", isbn: "9786050959482", publishedYear: 2013, publisher: "Doğan Kitap", pageCount: 528, language: "Türkçe", genre: "Çağdaş Türk Edebiyatı", category: "Roman", tags: ["Çağdaş", "Tarih"], coverImage: "https://via.placeholder.com/400x600?text=Geniş+Zamanlar" },
      { title: "Ejderha Dövmeli Kız", author: "Stieg Larsson", description: "Millennium serisinin ilk kitabı.", isbn: "9789750738777", publishedYear: 2005, publisher: "Pegasus Yayınları", pageCount: 576, language: "Türkçe", genre: "Polisiye", category: "Polisiye", tags: ["Polisiye", "Gerilim"], coverImage: "https://via.placeholder.com/400x600?text=Ejderha+Dövmeli+Kız" },
      { title: "Küçüğe Bir Dondurma", author: "Ercan Kesal", description: "Çocukluk, masumiyet ve kayıp üzerine öykü koleksiyonu.", isbn: "9786050959499", publishedYear: 2014, publisher: "Everest Yayınları", pageCount: 168, language: "Türkçe", genre: "Öykü", category: "Öykü", tags: ["Öykü", "Çocukluk"], coverImage: "https://via.placeholder.com/400x600?text=Küçüğe+Bir+Dondurma" },
      { title: "Annelik Oyunu Bitti", author: "Gonca Özmen", description: "Anne-çocuk ilişkisi ve toplumsal baskılar üzerine.", isbn: "9786050959505", publishedYear: 2019, publisher: "Doğan Kitap", pageCount: 264, language: "Türkçe", genre: "Çağdaş Türk Edebiyatı", category: "Roman", tags: ["Çağdaş", "Annelik"], coverImage: "https://via.placeholder.com/400x600?text=Annelik+Oyunu" },
      { title: "Ölürsem Beni Seninle Ararlar Şimdi", author: "Zülfü Livaneli", description: "Aşk, kayıp ve hafıza üzerine duygusal roman.", isbn: "9786050959512", publishedYear: 2020, publisher: "Doğan Kitap", pageCount: 312, language: "Türkçe", genre: "Çağdaş Türk Edebiyatı", category: "Roman", tags: ["Çağdaş", "Aşk"], coverImage: "https://via.placeholder.com/400x600?text=Ölürsem+Beni" },
      { title: "Hayallerini Yak Evi Isıt", author: "Barış Bıçakçı", description: "Modern yaşamın absürtlüğü üzerine eleştiri.", isbn: "9786050959529", publishedYear: 2018, publisher: "İletişim Yayınları", pageCount: 192, language: "Türkçe", genre: "Çağdaş Türk Edebiyatı", category: "Roman", tags: ["Çağdaş", "Absürt"], coverImage: "https://via.placeholder.com/400x600?text=Hayallerini+Yak" },
      { title: "Unutkan Aşk", author: "Turgut Uyar", description: "Turgut Uyar'ın aşk temalı şiirleri.", isbn: "9789750738784", publishedYear: 1972, publisher: "Yapı Kredi Yayınları", pageCount: 128, language: "Türkçe", genre: "Şiir", category: "Şiir", tags: ["Şiir", "Aşk"], coverImage: "https://via.placeholder.com/400x600?text=Unutkan+Aşk" },
      { title: "Yarim Haziran", author: "İnci Aral", description: "Aşk ve özlem üzerine romantik roman.", isbn: "9786050959536", publishedYear: 2016, publisher: "Everest Yayınları", pageCount: 224, language: "Türkçe", genre: "Çağdaş Türk Edebiyatı", category: "Roman", tags: ["Çağdaş", "Romantik"], coverImage: "https://via.placeholder.com/400x600?text=Yarim+Haziran" },
      { title: "Bir Matematikçinin Savunması", author: "G. H. Hardy", description: "Matematiğin güzelliği ve estetik değeri üzerine.", isbn: "9789750738791", publishedYear: 1940, publisher: "Tübitak Yayınları", pageCount: 152, language: "Türkçe", genre: "Bilim", category: "Bilim", tags: ["Matematik", "Bilim"], coverImage: "https://via.placeholder.com/400x600?text=Matematikçinin+Savunması" },
      { title: "Demir Ökçe", author: "Jack London", description: "Distopik gelecekte faşizm üzerine politik roman.", isbn: "9789750738807", publishedYear: 1908, publisher: "İş Bankası Kültür Yayınları", pageCount: 352, language: "Türkçe", genre: "Bilimkurgu", category: "Bilimkurgu", tags: ["Distopya", "Politik"], coverImage: "https://via.placeholder.com/400x600?text=Demir+Ökçe" },
      { title: "Eroinle Dans", author: "Zülfü Livaneli", description: "Türkiye'nin karanlık yüzü üzerine polisiye roman.", isbn: "9786050959543", publishedYear: 2011, publisher: "Doğan Kitap", pageCount: 288, language: "Türkçe", genre: "Polisiye", category: "Polisiye", tags: ["Polisiye", "Sosyal"], coverImage: "https://via.placeholder.com/400x600?text=Eroinle+Dans" },
      { title: "Ateşle Oynayan Kız", author: "Stieg Larsson", description: "Millennium serisinin ikinci kitabı.", isbn: "9789750738814", publishedYear: 2006, publisher: "Pegasus Yayınları", pageCount: 624, language: "Türkçe", genre: "Polisiye", category: "Polisiye", tags: ["Polisiye", "Gerilim"], coverImage: "https://via.placeholder.com/400x600?text=Ateşle+Oynayan+Kız" },
      { title: "Arı Kovanına Çomak Sokan Kız", author: "Stieg Larsson", description: "Millennium serisinin üçüncü kitabı.", isbn: "9789750738821", publishedYear: 2007, publisher: "Pegasus Yayınları", pageCount: 752, language: "Türkçe", genre: "Polisiye", category: "Polisiye", tags: ["Polisiye", "Final"], coverImage: "https://via.placeholder.com/400x600?text=Arı+Kovanına" },
      { title: "Boşlukta Yaşam", author: "Gwendoline Riley", description: "Modern ilişkiler ve yalnızlık üzerine minimalist roman.", isbn: "9786050959550", publishedYear: 2018, publisher: "Sel Yayıncılık", pageCount: 168, language: "Türkçe", genre: "Çağdaş Dünya Edebiyatı", category: "Roman", tags: ["Çağdaş", "Yalnızlık"], coverImage: "https://via.placeholder.com/400x600?text=Boşlukta+Yaşam" },
      { title: "Haritanın Yırtılan Yeri", author: "Hakan Günday", description: "Göç, kimlik ve sınırlar üzerine çarpıcı roman.", isbn: "9786050959567", publishedYear: 2015, publisher: "Doğan Kitap", pageCount: 296, language: "Türkçe", genre: "Çağdaş Türk Edebiyatı", category: "Roman", tags: ["Çağdaş", "Göç"], coverImage: "https://via.placeholder.com/400x600?text=Haritanın+Yırtılan+Yeri" },
      { title: "Kanadı Kırık Melek'in Kanadına Takılanlar", author: "Gülsüm Cengiz", description: "Kadın ve toplumsal baskılar üzerine şiirsel roman.", isbn: "9786050959574", publishedYear: 2017, publisher: "Kırmızı Kedi Yayınları", pageCount: 208, language: "Türkçe", genre: "Çağdaş Türk Edebiyatı", category: "Roman", tags: ["Çağdaş", "Kadın"], coverImage: "https://via.placeholder.com/400x600?text=Kanadı+Kırık+Melek" },
      { title: "Piraye", author: "Ayşe Kulin", description: "Nazım Hikmet ve Piraye'nin gerçek aşk hikayesi.", isbn: "9786050959581", publishedYear: 2001, publisher: "Everest Yayınları", pageCount: 336, language: "Türkçe", genre: "Biyografi", category: "Biyografi", tags: ["Biyografi", "Aşk"], coverImage: "https://via.placeholder.com/400x600?text=Piraye" },
      { title: "Yöntem Üzerine Konuşma", author: "René Descartes", description: "Düşünüyorum öyleyse varım önermesini içeren temel eser.", isbn: "9789750738838", publishedYear: 1637, publisher: "Say Yayınları", pageCount: 96, language: "Türkçe", genre: "Felsefe", category: "Felsefe", tags: ["Felsefe", "Descartes"], coverImage: "https://via.placeholder.com/400x600?text=Yöntem+Üzerine" },
      { title: "Ruhun Tutkuları", author: "René Descartes", description: "İnsan duyguları ve tutkuları üzerine felsefi inceleme.", isbn: "9789750738845", publishedYear: 1649, publisher: "Say Yayınları", pageCount: 192, language: "Türkçe", genre: "Felsefe", category: "Felsefe", tags: ["Felsefe", "Psikoloji"], coverImage: "https://via.placeholder.com/400x600?text=Ruhun+Tutkuları" },
      { title: "Gazap Üzümleri", author: "John Steinbeck", description: "Büyük Buhran döneminde hayatta kalma mücadelesi. Nobel ödüllü eser.", isbn: "9789750738852", publishedYear: 1939, publisher: "İş Bankası Kültür Yayınları", pageCount: 624, language: "Türkçe", genre: "Klasik", category: "Roman", tags: ["Klasik", "Nobel"], coverImage: "https://via.placeholder.com/400x600?text=Gazap+Üzümleri" },
      { title: "Tutunamayanlar", author: "Oğuz Atay", description: "Türk edebiyatının en önemli romanlarından. Modern bireyin yabancılaşması.", isbn: "9789750738869", publishedYear: 1971, publisher: "İletişim Yayınları", pageCount: 724, language: "Türkçe", genre: "Türk Klasikleri", category: "Roman", tags: ["Türk Klasikleri", "Varoluş"], coverImage: "https://via.placeholder.com/400x600?text=Tutunamayanlar" },
      { title: "Hayvan Çiftliği", author: "George Orwell", description: "Totalitarizm üzerine alegorik fabl.", isbn: "9789750738876", publishedYear: 1945, publisher: "Can Yayınları", pageCount: 144, language: "Türkçe", genre: "Klasik", category: "Roman", tags: ["Klasik", "Distopya"], coverImage: "https://via.placeholder.com/400x600?text=Hayvan+Çiftliği" },
      { title: "Palto", author: "Nikolay Gogol", description: "Küçük bir memurun trajedisi. Rus edebiyatının başyapıtı.", isbn: "9789750738883", publishedYear: 1842, publisher: "İş Bankası Kültür Yayınları", pageCount: 96, language: "Türkçe", genre: "Klasik", category: "Novella", tags: ["Klasik", "Gogol"], coverImage: "https://via.placeholder.com/400x600?text=Palto" },
      { title: "Kürk Mantolu Madonna", author: "Sabahattin Ali", description: "Türk edebiyatının en çok okunan aşk romanı.", isbn: "9789750738890", publishedYear: 1943, publisher: "Yapı Kredi Yayınları", pageCount: 176, language: "Türkçe", genre: "Türk Klasikleri", category: "Roman", tags: ["Türk Klasikleri", "Aşk"], coverImage: "https://via.placeholder.com/400x600?text=Kürk+Mantolu+Madonna" },
      { title: "Ezilenler", author: "Fyodor Dostoyevski", description: "Yoksulluk, aşk ve insanın değeri üzerine.", isbn: "9789750738906", publishedYear: 1861, publisher: "İş Bankası Kültür Yayınları", pageCount: 496, language: "Türkçe", genre: "Klasik", category: "Roman", tags: ["Klasik", "Dostoyevski"], coverImage: "https://via.placeholder.com/400x600?text=Ezilenler" },
      { title: "Savaş ve Barış 1", author: "Lev Tolstoy", description: "Dünya edebiyatının en büyük romanlarından. İlk cilt.", isbn: "9789750738913", publishedYear: 1869, publisher: "İş Bankası Kültür Yayınları", pageCount: 624, language: "Türkçe", genre: "Klasik", category: "Roman", tags: ["Klasik", "Epik", "Tolstoy"], coverImage: "https://via.placeholder.com/400x600?text=Savaş+ve+Barış+1" },
      { title: "Savaş ve Barış 2", author: "Lev Tolstoy", description: "Savaş ve Barış'ın devamı. İkinci cilt.", isbn: "9789750738920", publishedYear: 1869, publisher: "İş Bankası Kültür Yayınları", pageCount: 688, language: "Türkçe", genre: "Klasik", category: "Roman", tags: ["Klasik", "Epik", "Tolstoy"], coverImage: "https://via.placeholder.com/400x600?text=Savaş+ve+Barış+2" },
      { title: "Ahmet Haşimin Bütün Şiirleri", author: "Ahmet Haşim", description: "Sembol şairlerinden Ahmet Haşim'in tüm şiirleri.", isbn: "9789750738937", publishedYear: 2005, publisher: "Dergah Yayınları", pageCount: 352, language: "Türkçe", genre: "Şiir", category: "Şiir", tags: ["Şiir", "Sembolizm"], coverImage: "https://via.placeholder.com/400x600?text=Ahmet+Haşim" },
      { title: "Odunpazarından Öyküler", author: "Hüseyin Rahmi Gürpınar", description: "Eski İstanbul'un mahalle hayatını anlatan öyküler.", isbn: "9789750738944", publishedYear: 1934, publisher: "Özgür Yayınları", pageCount: 216, language: "Türkçe", genre: "Türk Klasikleri", category: "Öykü", tags: ["Türk Klasikleri", "İstanbul"], coverImage: "https://via.placeholder.com/400x600?text=Odunpazarından" },
      { title: "Şiir Dünyasına Yolculuk", author: "Behçet Necatigil", description: "Şiir sanatı üzerine yazılar.", isbn: "9789750738951", publishedYear: 1970, publisher: "Yapı Kredi Yayınları", pageCount: 192, language: "Türkçe", genre: "Deneme", category: "Deneme", tags: ["Şiir", "Deneme"], coverImage: "https://via.placeholder.com/400x600?text=Şiir+Dünyası" },
      { title: "Geçmişe Yolculuk", author: "Stefan Zweig", description: "Avrupa'nın kayıp zamanları üzerine nostaljik anı.", isbn: "9789750738968", publishedYear: 1942, publisher: "Türkiye İş Bankası Kültür Yayınları", pageCount: 432, language: "Türkçe", genre: "Biyografi", category: "Biyografi", tags: ["Stefan Zweig", "Anı"], coverImage: "https://via.placeholder.com/400x600?text=Geçmişe+Yolculuk" },
      { title: "Buzullar Arasında Bir Kış", author: "Cemil Kavukçu", description: "Doğa ve insan ilişkisi üzerine şiirsel roman.", isbn: "9786050959598", publishedYear: 2016, publisher: "Yapı Kredi Yayınları", pageCount: 184, language: "Türkçe", genre: "Çağdaş Türk Edebiyatı", category: "Roman", tags: ["Çağdaş", "Doğa"], coverImage: "https://via.placeholder.com/400x600?text=Buzullar+Arasında" },
      { title: "Menekşe Kokulu Hikayeler", author: "Sait Faik Abasıyanık", description: "Sait Faik'in İstanbul ve denizi anlattığı öyküler.", isbn: "9789750738975", publishedYear: 1954, publisher: "Yapı Kredi Yayınları", pageCount: 168, language: "Türkçe", genre: "Türk Klasikleri", category: "Öykü", tags: ["Türk Klasikleri", "İstanbul"], coverImage: "https://via.placeholder.com/400x600?text=Menekşe+Kokulu" },
      { title: "Çalıkuşu", author: "Reşat Nuri Güntekin", description: "Feride'nin hayat mücadelesi ve aşk hikayesi.", isbn: "9789750738982", publishedYear: 1922, publisher: "İnkılap Kitabevi", pageCount: 392, language: "Türkçe", genre: "Türk Klasikleri", category: "Roman", tags: ["Türk Klasikleri", "Aşk"], coverImage: "https://via.placeholder.com/400x600?text=Çalıkuşu" },
      { title: "Dr. Ecco'nun Şaşırtıcı Serüvenleri", author: "Dennis Shasha", description: "Matematik ve mantık bulmacalarıyla dolu bilim-kurgu.", isbn: "9789750738999", publishedYear: 1998, publisher: "Tübitak Yayınları", pageCount: 256, language: "Türkçe", genre: "Bilimkurgu", category: "Bilimkurgu", tags: ["Bilimkurgu", "Matematik"], coverImage: "https://via.placeholder.com/400x600?text=Dr+Ecco" },
      { title: "Son Ada", author: "Zülfü Livaneli", description: "Geçmiş, hafıza ve unutma üzerine güçlü roman.", isbn: "9786050959604", publishedYear: 2008, publisher: "Doğan Kitap", pageCount: 448, language: "Türkçe", genre: "Çağdaş Türk Edebiyatı", category: "Roman", tags: ["Çağdaş", "Hafıza"], coverImage: "https://via.placeholder.com/400x600?text=Son+Ada" },
      { title: "Yüreğim Seni Çok Sevdi", author: "Zülfü Livaneli", description: "Aşk ve yaşamın acı tatlı anıları üzerine.", isbn: "9786050959611", publishedYear: 2001, publisher: "Doğan Kitap", pageCount: 264, language: "Türkçe", genre: "Çağdaş Türk Edebiyatı", category: "Roman", tags: ["Çağdaş", "Aşk"], coverImage: "https://via.placeholder.com/400x600?text=Yüreğim+Seni" },
      { title: "Kayıp Gül", author: "Serdar Özkan", description: "Gizemli aşk hikayesi ve kaybolmuş geçmiş.", isbn: "9786050959628", publishedYear: 2019, publisher: "Doğan Kitap", pageCount: 296, language: "Türkçe", genre: "Çağdaş Türk Edebiyatı", category: "Roman", tags: ["Çağdaş", "Gizem"], coverImage: "https://via.placeholder.com/400x600?text=Kayıp+Gül" },
      { title: "Bir İdam Mahkumunun Son Günü", author: "Victor Hugo", description: "İdam cezası üzerine güçlü eleştiri.", isbn: "9789750739002", publishedYear: 1829, publisher: "İş Bankası Kültür Yayınları", pageCount: 128, language: "Türkçe", genre: "Klasik", category: "Novella", tags: ["Klasik", "Victor Hugo"], coverImage: "https://via.placeholder.com/400x600?text=İdam+Mahkumu" },
      { title: "Charlie'nin Çikolata Fabrikası", author: "Roald Dahl", description: "Willy Wonka'nın büyülü fabrikası. Çocuk edebiyatının klasiği.", isbn: "9789750739019", publishedYear: 1964, publisher: "Can Çocuk Yayınları", pageCount: 176, language: "Türkçe", genre: "Çocuk Kitapları", category: "Çocuk", tags: ["Çocuk", "Klasik"], coverImage: "https://via.placeholder.com/400x600?text=Çikolata+Fabrikası" },
      { title: "Silahlara Veda", author: "Ernest Hemingway", description: "Birinci Dünya Savaşı'nda aşk ve savaş. Hemingway'in başyapıtı.", isbn: "9789750739026", publishedYear: 1929, publisher: "İş Bankası Kültür Yayınları", pageCount: 352, language: "Türkçe", genre: "Klasik", category: "Roman", tags: ["Klasik", "Savaş", "Hemingway"], coverImage: "https://via.placeholder.com/400x600?text=Silahlara+Veda" },
      { title: "Yabancı", author: "Albert Camus", description: "Varoluşçuluğun en önemli eseri. Meursault'nun absürt dünyası.", isbn: "9789750739033", publishedYear: 1942, publisher: "Can Yayınları", pageCount: 120, language: "Türkçe", genre: "Klasik", category: "Roman", tags: ["Klasik", "Varoluşçuluk", "Camus"], coverImage: "https://via.placeholder.com/400x600?text=Yabancı" },
      { title: "Sultanı Öldürmek", author: "Ahmet Ümit", description: "Osmanlı tarihinde geçen polisiye gerilim.", isbn: "9786050959635", publishedYear: 2012, publisher: "Everest Yayınları", pageCount: 416, language: "Türkçe", genre: "Polisiye", category: "Polisiye", tags: ["Polisiye", "Osmanlı"], coverImage: "https://via.placeholder.com/400x600?text=Sultanı+Öldürmek" },
      { title: "Nutuk", author: "Mustafa Kemal Atatürk", description: "Türkiye Cumhuriyeti'nin kuruluşunu anlatan tarihi belge.", isbn: "9789750739040", publishedYear: 1927, publisher: "Türk Tarih Kurumu", pageCount: 624, language: "Türkçe", genre: "Tarih", category: "Tarih", tags: ["Tarih", "Atatürk", "Cumhuriyet"], coverImage: "https://via.placeholder.com/400x600?text=Nutuk" },
      { title: "Adem ile Havva'nın Güncesi", author: "Mark Twain", description: "Adem ve Havva'nın Cennet'teki hayatlarını mizahi anlatım.", isbn: "9789750739057", publishedYear: 1904, publisher: "İş Bankası Kültür Yayınları", pageCount: 96, language: "Türkçe", genre: "Mizah", category: "Mizah", tags: ["Mizah", "Mark Twain"], coverImage: "https://via.placeholder.com/400x600?text=Adem+ile+Havva" },
    ]
    
    // Zaten var olanları atla
    const existingBooks = await prisma.book.findMany({
      select: { title: true, isbn: true }
    })
    
    const existingTitles = new Set(existingBooks.map(b => b.title))
    const existingIsbns = new Set(existingBooks.filter(b => b.isbn).map(b => b.isbn))
    
    const newBooks = booksToAdd.filter(book => 
      !existingTitles.has(book.title) && 
      (!book.isbn || !existingIsbns.has(book.isbn))
    )
    
    if (newBooks.length > 0) {
      await prisma.book.createMany({
        data: newBooks,
        skipDuplicates: true,
      })
      console.log(`✅ ${newBooks.length} new books added`)
    } else {
      console.log("✅ All books already exist")
    }
  } else {
    console.log(`✅ Books already exist (${bookCount} books)`)
  }

  // Etkinlikler - sadece yoksa ekle
  const eventCount = await prisma.event.count()
  if (eventCount === 0) {
    console.log("🎉 Creating events...")
    await prisma.event.createMany({
      data: [
        { title: "Söyleşi: Edebiyatta Kadın Kahramanlar", description: "Edebiyat tarihindeki güçlü kadın karakterleri ve yazarları inceliyoruz.", location: "Merkez Kütüphane", isOnline: false, startDate: new Date("2025-11-15T14:00:00"), time: "14:00 - 16:00", eventType: "Söyleşi", image: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=800", maxAttendees: 50, status: "UPCOMING" },
        { title: "Kitap Ortağım: Suç ve Ceza", description: "Dostoyevski'nin ünlü eseri Suç ve Ceza'yı birlikte okuyup tartışacağız.", location: "Okuyamayanlar Kulüp Evi", isOnline: false, startDate: new Date("2025-11-20T18:00:00"), time: "18:00 - 20:00", eventType: "Kitap Ortağım", image: "https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800", maxAttendees: 20, status: "UPCOMING" },
        { title: "Online Tartışma: Distopya Edebiyatı", description: "Distopik edebiyat üzerine online tartışma.", location: "Online (Zoom)", isOnline: true, startDate: new Date("2025-11-25T20:00:00"), time: "20:00 - 22:00", eventType: "Kafamda Deli Sorular", image: "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=800", maxAttendees: 100, status: "UPCOMING" },
      ],
    })
    console.log("✅ Events created")
  } else {
    console.log(`✅ Events already exist (${eventCount} events)`)
  }

  // Forum konuları - sadece yoksa ekle
  const topicCount = await prisma.forumTopic.count()
  if (topicCount === 0 && users.length > 0) {
    console.log("💬 Creating forum topics...")
    const topic1 = await prisma.forumTopic.create({
      data: {
        title: "Bu ay hangi kitapları okudunuz?",
        content: "Merhaba arkadaşlar! Bu ay okuma serüvenlerinizi paylaşalım.",
        userId: users[0].id,
        pinned: true,
      },
    })
    
    await prisma.forumReply.create({
      data: {
        content: "Ben Suç ve Ceza'yı bitirdim. Raskolnikov'un psikolojik değişimi inanılmazdı!",
        userId: users[1]?.id || users[0].id,
        topicId: topic1.id,
      },
    })
    console.log("✅ Forum topics created")
  } else {
    console.log(`✅ Forum topics already exist (${topicCount} topics)`)
  }

  console.log("\n🎉 Seeding completed successfully!")
  console.log("\n📧 Test hesapları:")
  console.log("🔒 Admin: wastedtr34@gmail.com / admin123")
  console.log("👤 User: mehmet@example.com / user123")
  console.log("\n⚠️  Admin şifresini ilk girişten sonra mutlaka değiştirin!")
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
