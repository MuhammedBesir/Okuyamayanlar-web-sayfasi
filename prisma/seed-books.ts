import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding books...')

  const books = [
    { title: "İki Şehrin Hikayesi", author: "Charles Dickens", description: "Fransız Devrimi döneminde Londra ve Paris'te geçen, aşk, fedakarlık ve adalet temalı klasik bir eser.", isbn: "9786257711609", publishedYear: 1859, pageCount: 464, language: "Turkish", genre: "Klasik", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Mahalle Kahvesi", author: "Sevinç Çokum", description: "Mahalle kültürünün sıcaklığını anlatan samimi bir roman.", isbn: "9786050959437", publishedYear: 2018, pageCount: 216, language: "Turkish", genre: "Çağdaş Türk Edebiyatı", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Rahel Tanrı'yla Hesaplaşıyor", author: "Stefan Zweig", description: "Eski Ahit'in önemli figürlerinden Rahel'in hikayesi.", isbn: "9786053606239", publishedYear: 1929, pageCount: 96, language: "Turkish", genre: "Klasik", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Gezgin", author: "Kahlil Gibran", description: "Yaşamın anlamını arayan bir gezginin felsefi yolculuğu.", isbn: "9789944824750", publishedYear: 1923, pageCount: 112, language: "Turkish", genre: "Felsefe", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Vadideki Zambak", author: "Honoré de Balzac", description: "Aşkın ve tutkun sınırlarını zorlayan bir kadının trajedisi.", isbn: "9789750738586", publishedYear: 1835, pageCount: 312, language: "Turkish", genre: "Klasik", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Bir Yeniçeri Masalı", author: "Konstantin Mihailović", description: "Osmanlı döneminde bir yeniçerinin yaşadıklarını anlatan tarihi belge.", isbn: "9786053607984", publishedYear: 1497, pageCount: 168, language: "Turkish", genre: "Tarih", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Kuyucaklı Yusuf", author: "Sabahattin Ali", description: "Aşk, namus ve toplumsal baskı temalı Türk edebiyatının başyapıtlarından.", isbn: "9789750738579", publishedYear: 1937, pageCount: 200, language: "Turkish", genre: "Türk Klasikleri", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Notre Dame'ın Kamburu", author: "Victor Hugo", description: "Quasimodo ve Esmeralda'nın trajik hikayesi.", isbn: "9789750738593", publishedYear: 1831, pageCount: 624, language: "Turkish", genre: "Klasik", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Sokratesin Savunması", author: "Platon", description: "Sokrates'in mahkemede yaptığı savunma konuşması.", isbn: "9789750738609", publishedYear: -399, pageCount: 96, language: "Turkish", genre: "Felsefe", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Putların Alacakaranlığı", author: "Friedrich Nietzsche", description: "Nietzsche'nin felsefe tarihine eleştirel yaklaşımı.", isbn: "9789750738616", publishedYear: 1889, pageCount: 144, language: "Turkish", genre: "Felsefe", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "İçimizdeki Şeytan", author: "Sabahattin Ali", description: "İnsanın iç dünyasındaki karanlık yönleri ele alan psikolojik öykü.", isbn: "9789750738623", publishedYear: 1940, pageCount: 104, language: "Turkish", genre: "Türk Klasikleri", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Uçurtma Avcısı", author: "Khaled Hosseini", description: "Afganistan'da geçen dostluk, ihanet ve bağışlama hikayesi.", isbn: "9786053607991", publishedYear: 2003, pageCount: 392, language: "Turkish", genre: "Çağdaş Dünya Edebiyatı", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Troleybüs Problemi", author: "Hakan Günday", description: "Modern dünyada yaşanan etik ikilemleri sorgulayan roman.", isbn: "9786050959444", publishedYear: 2019, pageCount: 248, language: "Turkish", genre: "Çağdaş Türk Edebiyatı", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Kırık Çete", author: "Peyami Safa", description: "İstanbul'un kenar mahallelerinde yaşayan insanların hikayesi.", isbn: "9789750738630", publishedYear: 1935, pageCount: 176, language: "Turkish", genre: "Türk Klasikleri", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Simyacı", author: "Paulo Coelho", description: "Hayallerini gerçekleştirmek için yola çıkan çobanın alegorik yolculuğu.", isbn: "9789750738647", publishedYear: 1988, pageCount: 176, language: "Turkish", genre: "Çağdaş Dünya Edebiyatı", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Sol Ayağım", author: "Christy Brown", description: "Serebral palsi hastası yazarın ilham verici otobiyografisi.", isbn: "9789750738654", publishedYear: 1954, pageCount: 208, language: "Turkish", genre: "Biyografi", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Amok Koşucusu", author: "Stefan Zweig", description: "Tutkuların insanı sürüklediği yıkıcı güç üzerine psikolojik novella.", isbn: "9789750738661", publishedYear: 1922, pageCount: 112, language: "Turkish", genre: "Klasik", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Genç Werther'in Acıları", author: "Johann Wolfgang von Goethe", description: "Romantizm akımının başyapıtlarından biri.", isbn: "9789750738678", publishedYear: 1774, pageCount: 144, language: "Turkish", genre: "Klasik", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Ben Bir Gürgen Dalıyım, Seçme Şiirler", author: "Cemal Süreya", description: "Cemal Süreya'nın seçme şiirleri.", isbn: "9789750738685", publishedYear: 1990, pageCount: 240, language: "Turkish", genre: "Şiir", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Taaşuk-ı Talat ve Fitnat", author: "Şemseddin Sami", description: "Osmanlı döneminin ilk romanlarından.", isbn: "9789750738692", publishedYear: 1872, pageCount: 168, language: "Turkish", genre: "Türk Klasikleri", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Kavim", author: "Müge İplikçi", description: "Toplumsal kimlik ve aidiyet temaları üzerine çağdaş roman.", isbn: "9786050959451", publishedYear: 2020, pageCount: 296, language: "Turkish", genre: "Çağdaş Türk Edebiyatı", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "İvan İlyiç'in Ölümü", author: "Lev Tolstoy", description: "Ölüm ve yaşamın anlamı üzerine felsefi novella.", isbn: "9789750738708", publishedYear: 1886, pageCount: 320, language: "Turkish", genre: "Klasik", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Satranç", author: "Stefan Zweig", description: "İki satranç ustasının karşılaşması üzerinden insan psikolojisi.", isbn: "9789750738715", publishedYear: 1942, pageCount: 96, language: "Turkish", genre: "Klasik", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Charlie'nin Büyük Cam Asansörü", author: "Roald Dahl", description: "Charlie ve Çikolata Fabrikası'nın devamı.", isbn: "9789750738722", publishedYear: 1972, pageCount: 192, language: "Turkish", genre: "Çocuk Kitapları", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Korku", author: "Stefan Zweig", description: "Bir kadının yaşadığı korku ve psikolojik gerilim.", isbn: "9789750738739", publishedYear: 1920, pageCount: 112, language: "Turkish", genre: "Klasik", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Kendine Ait Bir Oda", author: "Virginia Woolf", description: "Kadın yazarlar ve yaratıcılık üzerine feminist deneme.", isbn: "9789750738746", publishedYear: 1929, pageCount: 144, language: "Turkish", genre: "Deneme", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Kumarbaz", author: "Fyodor Dostoyevski", description: "Kumar tutkusunun insanı esir alması üzerine psikolojik roman.", isbn: "9789750738753", publishedYear: 1867, pageCount: 232, language: "Turkish", genre: "Klasik", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Hafıza Defteri", author: "Ahmet Ümit", description: "Geçmiş, hafıza ve kimlik üzerine polisiye roman.", isbn: "9786050959468", publishedYear: 2010, pageCount: 384, language: "Turkish", genre: "Polisiye", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Şeytan İşi", author: "Daron Acemoğlu & James A. Robinson", description: "Ekonomik eşitsizlik ve siyaset üzerine analitik inceleme.", isbn: "9789750738760", publishedYear: 2019, pageCount: 528, language: "Turkish", genre: "Araştırma", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Derinliğine Kimse Sevgili Olamadı", author: "Sezen Aksu", description: "Sezen Aksu'nun şarkı sözlerinden derleme.", isbn: "9786050959475", publishedYear: 2018, pageCount: 200, language: "Turkish", genre: "Şiir", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Geniş Zamanlar", author: "Zülfü Livaneli", description: "Türkiye'nin yakın tarihindeki toplumsal dönüşümler.", isbn: "9786050959482", publishedYear: 2013, pageCount: 528, language: "Turkish", genre: "Çağdaş Türk Edebiyatı", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Ejderha Dövmeli Kız", author: "Stieg Larsson", description: "Millennium serisinin ilk kitabı.", isbn: "9789750738777", publishedYear: 2005, pageCount: 576, language: "Turkish", genre: "Polisiye", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Küçüğe Bir Dondurma", author: "Ercan Kesal", description: "Çocukluk, masumiyet ve kayıp üzerine öykü koleksiyonu.", isbn: "9786050959499", publishedYear: 2014, pageCount: 168, language: "Turkish", genre: "Öykü", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Böyle Buyurdu Zerdüşt", author: "Friedrich Nietzsche", description: "Nietzsche'nin en önemli felsefi eseri.", isbn: "9789750738784", publishedYear: 1883, pageCount: 352, language: "Turkish", genre: "Felsefe", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Suç ve Ceza", author: "Fyodor Dostoyevski", description: "Suçluluk, vicdan ve adalet üzerine psikolojik başyapıt.", isbn: "9789750738791", publishedYear: 1866, pageCount: 704, language: "Turkish", genre: "Klasik", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Veba", author: "Albert Camus", description: "Salgın hastalık metaforu üzerinden varoluşçu felsefe.", isbn: "9789750738807", publishedYear: 1947, pageCount: 312, language: "Turkish", genre: "Klasik", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "1984", author: "George Orwell", description: "Totaliter rejim ve gözetim toplumu distopyası.", isbn: "9789750738814", publishedYear: 1949, pageCount: 368, language: "Turkish", genre: "Distopya", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Hayvan Çiftliği", author: "George Orwell", description: "Siyasi sistemi eleştiren alegorik roman.", isbn: "9789750738821", publishedYear: 1945, pageCount: 144, language: "Turkish", genre: "Alegorik", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Dönüşüm", author: "Franz Kafka", description: "Gregor Samsa'nın böceğe dönüşmesi.", isbn: "9789750738838", publishedYear: 1915, pageCount: 96, language: "Turkish", genre: "Klasik", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Budala", author: "Fyodor Dostoyevski", description: "Saf ve iyi bir insanın toplumla çatışması.", isbn: "9789750738845", publishedYear: 1869, pageCount: 656, language: "Turkish", genre: "Klasik", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Anna Karenina", author: "Lev Tolstoy", description: "Aşk, evlilik ve toplumsal baskı üzerine klasik.", isbn: "9789750738852", publishedYear: 1877, pageCount: 864, language: "Turkish", genre: "Klasik", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Savaş ve Barış", author: "Lev Tolstoy", description: "Napoleon savaşları döneminde Rus aristokrasisi.", isbn: "9789750738869", publishedYear: 1869, pageCount: 1296, language: "Turkish", genre: "Klasik", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Yeraltından Notlar", author: "Fyodor Dostoyevski", description: "Varoluşçu düşüncenin öncü eseri.", isbn: "9789750738876", publishedYear: 1864, pageCount: 136, language: "Turkish", genre: "Klasik", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Karamazov Kardeşler", author: "Fyodor Dostoyevski", description: "İnanç, ahlak ve aile ilişkileri üzerine başyapıt.", isbn: "9789750738883", publishedYear: 1880, pageCount: 1040, language: "Turkish", genre: "Klasik", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Beyaz Geceler", author: "Fyodor Dostoyevski", description: "Yalnız bir adamın romantik hayalleri.", isbn: "9789750738890", publishedYear: 1848, pageCount: 96, language: "Turkish", genre: "Klasik", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Ölü Canlar", author: "Nikolay Gogol", description: "Çarlık Rusyası'nın toplumsal yapısını hicveden roman.", isbn: "9789750738906", publishedYear: 1842, pageCount: 352, language: "Turkish", genre: "Klasik", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Palto", author: "Nikolay Gogol", description: "Küçük memurların trajik hayatı.", isbn: "9789750738913", publishedYear: 1842, pageCount: 80, language: "Turkish", genre: "Klasik", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Otello", author: "William Shakespeare", description: "Kıskançlık ve ihanet trajedisi.", isbn: "9789750738920", publishedYear: 1603, pageCount: 192, language: "Turkish", genre: "Tiyatro", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Hamlet", author: "William Shakespeare", description: "İntikam ve delilik üzerine ünlü trajedi.", isbn: "9789750738937", publishedYear: 1603, pageCount: 224, language: "Turkish", genre: "Tiyatro", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Macbeth", author: "William Shakespeare", description: "İktidar hırsı ve suçluluk trajedisi.", isbn: "9789750738944", publishedYear: 1606, pageCount: 160, language: "Turkish", genre: "Tiyatro", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Romeo ve Juliet", author: "William Shakespeare", description: "Tarihin en ünlü aşk trajedisi.", isbn: "9789750738951", publishedYear: 1597, pageCount: 176, language: "Turkish", genre: "Tiyatro", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Kral Lear", author: "William Shakespeare", description: "Yaşlılık, aile ve güç üzerine trajedi.", isbn: "9789750738968", publishedYear: 1606, pageCount: 240, language: "Turkish", genre: "Tiyatro", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Bir Yaz Gecesi Rüyası", author: "William Shakespeare", description: "Büyülü orman ve aşk komedisi.", isbn: "9789750738975", publishedYear: 1595, pageCount: 144, language: "Turkish", genre: "Tiyatro", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Venedik Taciri", author: "William Shakespeare", description: "Adalet, merhamet ve önyargı üzerine oyun.", isbn: "9789750738982", publishedYear: 1596, pageCount: 176, language: "Turkish", genre: "Tiyatro", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Yabancı", author: "Albert Camus", description: "Absürd ve yabancılaşma üzerine varoluşçu roman.", isbn: "9789750738999", publishedYear: 1942, pageCount: 128, language: "Turkish", genre: "Klasik", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Sisifos Söyleni", author: "Albert Camus", description: "Absürd felsefesi ve yaşamın anlamı.", isbn: "9789750739002", publishedYear: 1942, pageCount: 192, language: "Turkish", genre: "Felsefe", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Küçük Prens", author: "Antoine de Saint-Exupéry", description: "Çocuklar ve yetişkinler için felsefi masal.", isbn: "9789750739019", publishedYear: 1943, pageCount: 96, language: "Turkish", genre: "Masal", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Bülbülü Öldürmek", author: "Harper Lee", description: "Irkçılık ve adalet üzerine Amerikan klasiği.", isbn: "9789750739026", publishedYear: 1960, pageCount: 384, language: "Turkish", genre: "Klasik", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Büyük Gatsby", author: "F. Scott Fitzgerald", description: "Amerikan rüyası ve aşk trajedisi.", isbn: "9789750739033", publishedYear: 1925, pageCount: 192, language: "Turkish", genre: "Klasik", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Moby Dick", author: "Herman Melville", description: "Beyaz balinayı avlama obsesyonu.", isbn: "9789750739040", publishedYear: 1851, pageCount: 720, language: "Turkish", genre: "Klasik", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Yaşlı Adam ve Deniz", author: "Ernest Hemingway", description: "Yaşlı balıkçının mücadelesi.", isbn: "9789750739057", publishedYear: 1952, pageCount: 128, language: "Turkish", genre: "Klasik", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Kırmızı Pazartesi", author: "Gabriel García Márquez", description: "Cinayet öncesi kasaba hayatı.", isbn: "9789750739064", publishedYear: 1981, pageCount: 120, language: "Turkish", genre: "Çağdaş Dünya Edebiyatı", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Yüzyıllık Yalnızlık", author: "Gabriel García Márquez", description: "Büyülü gerçekçilik başyapıtı.", isbn: "9789750739071", publishedYear: 1967, pageCount: 528, language: "Turkish", genre: "Klasik", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Aşk ve Gurur", author: "Jane Austen", description: "İngiliz aristokrasisinde romantik roman.", isbn: "9789750739088", publishedYear: 1813, pageCount: 432, language: "Turkish", genre: "Klasik", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Jane Eyre", author: "Charlotte Brontë", description: "Yetim bir kızın yaşam mücadelesi ve aşkı.", isbn: "9789750739095", publishedYear: 1847, pageCount: 576, language: "Turkish", genre: "Klasik", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Uğultulu Tepeler", author: "Emily Brontë", description: "Tutkulu ve intikam dolu aşk hikayesi.", isbn: "9789750739101", publishedYear: 1847, pageCount: 416, language: "Turkish", genre: "Klasik", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Dracula", author: "Bram Stoker", description: "Vampir Kont Dracula'nın korku hikayesi.", isbn: "9789750739118", publishedYear: 1897, pageCount: 448, language: "Turkish", genre: "Korku", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Frankenstein", author: "Mary Shelley", description: "Bilim kurgu ve gotik korku klasiği.", isbn: "9789750739125", publishedYear: 1818, pageCount: 280, language: "Turkish", genre: "Korku", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Dorian Gray'in Portresi", author: "Oscar Wilde", description: "Güzellik, ahlak ve yozlaşma üzerine.", isbn: "9789750739132", publishedYear: 1890, pageCount: 272, language: "Turkish", genre: "Klasik", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Madame Bovary", author: "Gustave Flaubert", description: "Burjuva hayatına karşı romantik isyan.", isbn: "9789750739149", publishedYear: 1856, pageCount: 416, language: "Turkish", genre: "Klasik", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Sefiller", author: "Victor Hugo", description: "Adalet, merhamet ve kurtuluş destanı.", isbn: "9789750739156", publishedYear: 1862, pageCount: 1488, language: "Turkish", genre: "Klasik", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Monte Kristo Kontu", author: "Alexandre Dumas", description: "İntikam ve adalet macerası.", isbn: "9789750739163", publishedYear: 1844, pageCount: 1312, language: "Turkish", genre: "Klasik", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Üç Silahşörler", author: "Alexandre Dumas", description: "Macera dolu şövalye hikayesi.", isbn: "9789750739170", publishedYear: 1844, pageCount: 736, language: "Turkish", genre: "Klasik", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Denizler Altında Yirmi Bin Fersah", author: "Jules Verne", description: "Kaptan Nemo'nun denizaltı macerası.", isbn: "9789750739187", publishedYear: 1870, pageCount: 464, language: "Turkish", genre: "Bilim Kurgu", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
    { title: "Dünya'nın Merkezine Yolculuk", author: "Jules Verne", description: "Yeraltı keşif macerası.", isbn: "9789750739194", publishedYear: 1864, pageCount: 352, language: "Turkish", genre: "Bilim Kurgu", coverImage: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400" },
  ]

  let added = 0
  let skipped = 0

  for (const book of books) {
    try {
      // ISBN kontrolü
      const existing = book.isbn 
        ? await prisma.book.findUnique({ where: { isbn: book.isbn } })
        : await prisma.book.findFirst({ where: { title: book.title, author: book.author } })
      
      if (existing) {
        console.log(`⏭️  Atlandı: ${book.title}`)
        skipped++
        continue
      }

      await prisma.book.create({
        data: {
          ...book,
          available: true,
          featured: false,
        }
      })
      
      console.log(`✅ Eklendi: ${book.title}`)
      added++
    } catch (error) {
      console.error(`❌ Hata (${book.title}):`, error)
    }
  }

  console.log(`\n🎉 Tamamlandı! ${added} kitap eklendi, ${skipped} atlandı`)
}

main()
  .catch((e) => {
    console.error('❌ Seed hatası:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
