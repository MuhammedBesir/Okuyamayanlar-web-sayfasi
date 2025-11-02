"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import Image from "next/image"
import Link from "next/link"
import { Search, Star, BookOpen, TrendingUp, Calendar, User, ChevronDown, ChevronUp } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

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
  borrower?: {
    id: string
    name: string | null
    email: string
  } | null
  _count?: {
    reviews: number
    readingLists: number
  }
  averageRating?: number
}

function LibraryContent() {
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedGenre, setSelectedGenre] = useState<string>("all")
  const [availabilityFilter, setAvailabilityFilter] = useState<string>("all") // "all", "available", "borrowed"
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryExpanded, setCategoryExpanded] = useState(true)
  const [statusExpanded, setStatusExpanded] = useState(true)
  const isAdmin = session?.user?.role === "ADMIN"

  useEffect(() => {
    fetchBooks()
    // URL'deki search parametresini al
    const urlSearch = searchParams.get('search')
    if (urlSearch) {
      setSearchQuery(urlSearch)
    }
  }, [searchParams])

  const fetchBooks = async () => {
    try {
      const res = await fetch("/api/books")
      if (res.ok) {
        const data = await res.json()
        console.log('Is Array?', Array.isArray(data))
        // API returns { books: [...] } format
        const booksArray = Array.isArray(data) ? data : data.books || []
        setBooks(booksArray)
      }
    } catch (error) {
      setBooks([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  const genres = Array.isArray(books) && books.length > 0 
    ? ["all", ...Array.from(new Set(books.filter(b => b.genre).map(b => b.genre!)))]
    : ["all"]

  const filteredBooks = Array.isArray(books) ? books.filter((book: Book) => {
    const searchLower = searchQuery.toLocaleLowerCase('tr-TR')
    const matchesSearch = book.title.toLocaleLowerCase('tr-TR').includes(searchLower) ||
                         book.author.toLocaleLowerCase('tr-TR').includes(searchLower)
    const matchesGenre = selectedGenre === "all" || book.genre === selectedGenre
    const matchesAvailability = availabilityFilter === "all" || 
                                (availabilityFilter === "available" && book.available) ||
                                (availabilityFilter === "borrowed" && !book.available)
    return matchesSearch && matchesGenre && matchesAvailability
  }) : []

  if (loading) {
    return (
      <div className="container py-4 sm:py-8 px-3 sm:px-4 max-w-7xl">
        <div className="animate-pulse space-y-4">
          <div className="h-10 sm:h-12 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-80 sm:h-96 bg-gray-200 dark:bg-gray-800 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="container py-4 sm:py-8 px-3 sm:px-4 max-w-7xl">
      <div className="mb-4 sm:mb-6 md:mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 md:mb-4 bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
          Kütüphane
        </h1>
        <p className="text-muted-foreground text-xs sm:text-sm md:text-base lg:text-lg">
          Kitap koleksiyonumuzu keşfedin
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4 mt-3 sm:mt-4 md:mt-6">
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 p-2.5 sm:p-3 md:p-4 rounded-lg border border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
              <div>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-amber-700 dark:text-amber-400">{books.length}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Toplam</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 p-2.5 sm:p-3 md:p-4 rounded-lg border border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Star className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
              <div>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-blue-700 dark:text-blue-400">{books.filter(b => b.featured).length}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Öne Çıkan</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 p-2.5 sm:p-3 md:p-4 rounded-lg border border-green-200 dark:border-green-800">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
              <div>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-green-700 dark:text-green-400">{books.filter(b => b.available).length}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Müsait</p>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 p-2.5 sm:p-3 md:p-4 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600" />
              <div>
                <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-purple-700 dark:text-purple-400">{Math.max(0, genres.length - 1)}</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Kategori</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
        <div className="relative">
          <Search className="absolute left-2.5 sm:left-3 top-2 sm:top-2.5 md:top-3 h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
          <Input
            placeholder="Kitap veya yazar ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 sm:pl-9 md:pl-10 h-9 sm:h-10 md:h-11 text-sm md:text-base"
          />
        </div>
        
        {/* Kompakt Filtre Kartları */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Kategori */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/20 dark:to-orange-950/20 rounded-lg border border-amber-200 dark:border-amber-800/50 overflow-hidden">
            <button 
              onClick={() => setCategoryExpanded(!categoryExpanded)}
              className="w-full flex items-center justify-between p-3 sm:p-4 hover:bg-amber-100/50 dark:hover:bg-amber-900/20 transition-colors"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-amber-600" />
                <h3 className="text-xs sm:text-sm font-bold text-amber-900 dark:text-amber-100">Kategori</h3>
                <span className="text-xs text-amber-600 dark:text-amber-400 bg-amber-200 dark:bg-amber-900/50 px-2 py-0.5 rounded-full">
                  {selectedGenre === "all" ? "Tümü" : selectedGenre}
                </span>
              </div>
              {categoryExpanded ? (
                <ChevronUp className="h-4 w-4 text-amber-600" />
              ) : (
                <ChevronDown className="h-4 w-4 text-amber-600" />
              )}
            </button>
            
            {categoryExpanded && (
              <div className="p-3 sm:p-4 pt-0 border-t border-amber-200 dark:border-amber-800/30">
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {genres.map((genre) => (
                    <Button
                      key={genre}
                      variant={selectedGenre === genre ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedGenre(genre)}
                      className={`text-xs h-7 px-2.5 rounded-md font-medium transition-all ${
                        selectedGenre === genre
                          ? "bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white shadow-sm"
                          : "bg-white dark:bg-gray-800 border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/30"
                      }`}
                    >
                      {genre === "all" ? "Tümü" : genre}
                    </Button>
                  ))}
                </div>
                <div className="mt-3 pt-3 border-t border-amber-200 dark:border-amber-800/30">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white dark:bg-gray-800/50 p-2 rounded">
                      <div className="text-amber-600 font-semibold">{books.filter(b => selectedGenre === "all" || b.genre === selectedGenre).length}</div>
                      <div className="text-gray-600 dark:text-gray-400">Kitap</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800/50 p-2 rounded">
                      <div className="text-amber-600 font-semibold">{Math.max(0, genres.length - 1)}</div>
                      <div className="text-gray-600 dark:text-gray-400">Kategori</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Durum */}
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/20 dark:to-cyan-950/20 rounded-lg border border-blue-200 dark:border-blue-800/50 overflow-hidden">
            <button 
              onClick={() => setStatusExpanded(!statusExpanded)}
              className="w-full flex items-center justify-between p-3 sm:p-4 hover:bg-blue-100/50 dark:hover:bg-blue-900/20 transition-colors"
            >
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <h3 className="text-xs sm:text-sm font-bold text-blue-900 dark:text-blue-100">Durum</h3>
                <span className="text-xs text-blue-600 dark:text-blue-400 bg-blue-200 dark:bg-blue-900/50 px-2 py-0.5 rounded-full">
                  {availabilityFilter === "all" ? "Tümü" : availabilityFilter === "available" ? "Müsait" : "Ödünçte"}
                </span>
              </div>
              {statusExpanded ? (
                <ChevronUp className="h-4 w-4 text-blue-600" />
              ) : (
                <ChevronDown className="h-4 w-4 text-blue-600" />
              )}
            </button>
            
            {statusExpanded && (
              <div className="p-3 sm:p-4 pt-0 border-t border-blue-200 dark:border-blue-800/30">
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <Button
                    variant={availabilityFilter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAvailabilityFilter("all")}
                    className={`text-xs h-7 px-2.5 rounded-md font-medium transition-all ${
                      availabilityFilter === "all"
                        ? "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-sm"
                        : "bg-white dark:bg-gray-800 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30"
                    }`}
                  >
                    Tümü
                  </Button>
                  <Button
                    variant={availabilityFilter === "available" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAvailabilityFilter("available")}
                    className={`text-xs h-7 px-2.5 rounded-md font-medium transition-all ${
                      availabilityFilter === "available" 
                        ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-sm" 
                        : "bg-white dark:bg-gray-800 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300 hover:bg-green-100 dark:hover:bg-green-900/30"
                    }`}
                  >
                    Müsait
                  </Button>
                  <Button
                    variant={availabilityFilter === "borrowed" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setAvailabilityFilter("borrowed")}
                    className={`text-xs h-7 px-2.5 rounded-md font-medium transition-all ${
                      availabilityFilter === "borrowed" 
                        ? "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white shadow-sm" 
                        : "bg-white dark:bg-gray-800 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/30"
                    }`}
                  >
                    Ödünçte
                  </Button>
                </div>
                <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800/30">
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-white dark:bg-gray-800/50 p-2 rounded">
                      <div className="text-blue-600 font-semibold">{books.length}</div>
                      <div className="text-gray-600 dark:text-gray-400">Toplam</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800/50 p-2 rounded">
                      <div className="text-green-600 font-semibold">{books.filter(b => b.available).length}</div>
                      <div className="text-gray-600 dark:text-gray-400">Müsait</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800/50 p-2 rounded">
                      <div className="text-red-600 font-semibold">{books.filter(b => !b.available).length}</div>
                      <div className="text-gray-600 dark:text-gray-400">Ödünçte</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
        {filteredBooks.map((book: Book) => (
          <Link key={book.id} href={`/library/${book.id}`} className="block">
            <Card className="group overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer h-full flex flex-col">
              <div className="aspect-[3/4] relative overflow-hidden">
                <Image
                  src={book.coverImage || "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400"}
                  alt={book.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              
              <CardHeader className="p-2 sm:p-3 md:p-4 pb-1.5 sm:pb-2 md:pb-3 flex-shrink-0">
                <CardTitle className="line-clamp-2 text-xs sm:text-sm md:text-base lg:text-lg break-words group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">{book.title}</CardTitle>
                <CardDescription className="text-[10px] sm:text-xs md:text-sm truncate">{book.author}</CardDescription>
              </CardHeader>
            
            <CardContent className="p-2 sm:p-3 md:p-4 pb-2 sm:pb-3 md:pb-4 space-y-1 sm:space-y-1.5 md:space-y-2">
              {book.genre && (
                <span className="text-[10px] sm:text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full inline-block">
                  {book.genre}
                </span>
              )}
              {book.featured && (
                <div className="text-[10px] sm:text-xs font-semibold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 inline-flex items-center gap-0.5 sm:gap-1">
                  <Star className="h-2.5 sm:h-3 w-2.5 sm:w-3 fill-current" />
                  <span className="hidden sm:inline">Öne Çıkan</span>
                </div>
              )}
              
              {/* Rating Display */}
              {book._count?.reviews && book._count.reviews > 0 && book.averageRating && book.averageRating > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    {/* 5 Yıldızlı Gösterim */}
                    {[1, 2, 3, 4, 5].map((star) => {
                      const rating = book.averageRating || 0
                      const isFilled = star <= Math.floor(rating)
                      const isHalf = star === Math.ceil(rating) && rating % 1 >= 0.25 && rating % 1 < 0.75
                      const isEmpty = star > Math.ceil(rating)
                      
                      return (
                        <div key={star} className="relative h-3 w-3 sm:h-3.5 sm:w-3.5 md:h-4 md:w-4">
                          {isFilled ? (
                            <Star className="h-full w-full fill-amber-400 text-amber-400" />
                          ) : isHalf ? (
                            <>
                              <Star className="h-full w-full text-amber-400 fill-none absolute" />
                              <div className="overflow-hidden absolute inset-0" style={{ width: '50%' }}>
                                <Star className="h-full w-full fill-amber-400 text-amber-400" />
                              </div>
                            </>
                          ) : (
                            <Star className="h-full w-full text-gray-300 dark:text-gray-600 fill-none" />
                          )}
                        </div>
                      )
                    })}
                    <span className="text-[10px] sm:text-xs font-semibold text-gray-900 dark:text-gray-100 ml-1">
                      {book.averageRating.toFixed(1)}
                    </span>
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-gray-500 dark:text-gray-400">
                    {book._count.reviews} değerlendirme
                  </div>
                </div>
              )}
              
              <div className={`text-[10px] sm:text-xs font-semibold px-2 sm:px-2.5 md:px-3 py-1 sm:py-1.5 rounded-lg flex items-center gap-1 sm:gap-1.5 md:gap-2 ${
                book.available ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 'bg-red-100 text-red-700 dark:bg-red-900/30'
              }`}>
                <div className={`h-1.5 sm:h-2 w-1.5 sm:w-2 rounded-full ${book.available ? 'bg-green-500' : 'bg-red-500'}`} />
                {book.available ? 'Müsait' : 'Ödünçte'}
              </div>
              
              {!book.available && isAdmin && book.borrower && (
                <div className="text-[10px] sm:text-xs bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-300 px-2 sm:px-2.5 md:px-3 py-1.5 sm:py-2 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-1 sm:gap-1.5 mb-0.5 sm:mb-1">
                    <User className="h-2.5 sm:h-3 w-2.5 sm:w-3" />
                    <span className="font-semibold">Ödünç Alan:</span>
                  </div>
                  <div className="pl-3 sm:pl-3.5 md:pl-4">
                    <div className="font-medium truncate">{book.borrower.name || "İsimsiz"}</div>
                    <div className="text-[9px] sm:text-[10px] opacity-75 truncate">{book.borrower.email}</div>
                  </div>
                </div>
              )}
            </CardContent>
            
            <CardFooter className="p-2 sm:p-3 md:p-4 mt-auto">
              <Button className="w-full h-7 sm:h-8 md:h-9 text-xs sm:text-sm bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700" size="sm">
                Detayları Gör
              </Button>
            </CardFooter>
            </Card>
          </Link>
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <div className="text-center py-12 sm:py-16 md:py-20">
          <h3 className="text-xl sm:text-2xl font-bold mb-2">Sonuç bulunamadı</h3>
          <p className="text-muted-foreground text-sm sm:text-base">Farklı bir arama terimi deneyin.</p>
        </div>
      )}
    </div>
  )
}

export default function LibraryPage() {
  return (
    <Suspense fallback={
      <div className="container py-4 sm:py-8 px-3 sm:px-4 max-w-7xl">
        <div className="animate-pulse space-y-4">
          <div className="h-10 sm:h-12 bg-gray-200 dark:bg-gray-800 rounded w-1/3"></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-80 sm:h-96 bg-gray-200 dark:bg-gray-800 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    }>
      <LibraryContent />
    </Suspense>
  )
}
