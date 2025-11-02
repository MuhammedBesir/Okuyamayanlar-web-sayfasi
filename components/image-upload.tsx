"use client"

import { useState, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Upload, X, Image as ImageIcon } from "lucide-react"

interface ImageUploadProps {
  label: string
  value: string
  onChange: (url: string) => void
  id?: string
  placeholder?: string
  helperText?: string
}

export function ImageUpload({ 
  label, 
  value, 
  onChange, 
  id = "image",
  placeholder = "Görsel URL'si",
  helperText
}: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Dosya türü kontrolü - daha esnek
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/heic', 'image/heif']
    const isImage = file.type.startsWith('image/') || validImageTypes.some(type => file.name.toLowerCase().endsWith(type.split('/')[1]))
    
    if (!isImage) {
      setError("Lütfen bir resim dosyası seçin (JPG, PNG, GIF, WebP, HEIC)")
      return
    }

    // Dosya boyutu kontrolü (10MB - mobil için artırıldı)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      setError(`Dosya boyutu ${(file.size / (1024 * 1024)).toFixed(1)}MB. Maksimum 10MB yüklenebilir.`)
      return
    }

    setError(null)
    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        onChange(data.url)
        setError(null)
      } else {
        const errorMessage = data.error || 'Yükleme başarısız'
        const details = data.details ? ` (${data.details})` : ''
        setError(errorMessage + details)
        console.error('Upload failed:', data)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Bilinmeyen hata'
      setError(`Yükleme sırasında bir hata oluştu: ${errorMessage}`)
      console.error('Upload error:', err)
    } finally {
      setUploading(false)
    }
  }

  const handleClearImage = () => {
    onChange('')
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="space-y-3">
      <Label htmlFor={id}>{label}</Label>
      
      {/* URL Input - Sadece görüntüleme için */}
      {value && (
        <div className="flex gap-2">
          <Input
            id={id}
            type="text"
            value={value}
            readOnly
            className="flex-1 bg-muted"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={handleClearImage}
            title="Görseli temizle"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* File Upload Button */}
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,image/heic,image/heif"
          onChange={handleFileUpload}
          className="hidden"
          id={`${id}-file`}
        />
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="gap-2"
        >
          {uploading ? (
            <>
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Yükleniyor...
            </>
          ) : (
            <>
              <Upload className="h-4 w-4" />
              {value ? 'Değiştir' : 'Fotoğraf Yükle'}
            </>
          )}
        </Button>
        <span className="text-xs text-muted-foreground">
          Galeriden seç
        </span>
      </div>

      {/* Helper Text */}
      {helperText && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}
      
      {!helperText && (
        <p className="text-xs text-muted-foreground">
          Maksimum 10MB (JPG, PNG, GIF, WebP, HEIC)
        </p>
      )}

      {/* Error/Success Message */}
      {error && (
        <p className="text-xs font-medium text-red-600 dark:text-red-400">
          {error}
        </p>
      )}

      {/* Image Preview */}
      {value && (
        <div className="relative mt-3 inline-block">
          <div className="relative rounded-lg border overflow-hidden bg-gray-100 dark:bg-gray-800">
            <img
              src={value}
              alt="Preview"
              className="max-h-48 max-w-full object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400"
                setError("⚠️ Önizleme yüklenemedi")
              }}
            />
          </div>
          <div className="mt-2 flex items-center gap-2 text-xs text-green-600 dark:text-green-400">
            <ImageIcon className="h-3 w-3" />
            <span>Görsel yüklendi</span>
          </div>
        </div>
      )}
    </div>
  )
}
