import { v2 as cloudinary } from 'cloudinary'

// Cloudinary yapılandırmasını kontrol et
if (!process.env.CLOUDINARY_CLOUD_NAME) {
  console.error('❌ CLOUDINARY_CLOUD_NAME environment variable is not set')
}
if (!process.env.CLOUDINARY_API_KEY) {
  console.error('❌ CLOUDINARY_API_KEY environment variable is not set')
}
if (!process.env.CLOUDINARY_API_SECRET) {
  console.error('❌ CLOUDINARY_API_SECRET environment variable is not set')
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

console.log('☁️ Cloudinary configured with cloud:', process.env.CLOUDINARY_CLOUD_NAME)

export default cloudinary
