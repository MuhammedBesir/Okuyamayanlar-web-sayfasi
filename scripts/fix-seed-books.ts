import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const seedPath = join(process.cwd(), 'prisma', 'seed.ts')
let content = readFileSync(seedPath, 'utf-8')

// publisher, category, tags alanlarını temizle
content = content.replace(/, publisher: "[^"]*"/g, '')
content = content.replace(/, category: "[^"]*"/g, '')
content = content.replace(/, tags: \[[^\]]*\]/g, '')

writeFileSync(seedPath, content)
console.log('✅ Seed dosyası düzeltildi!')
