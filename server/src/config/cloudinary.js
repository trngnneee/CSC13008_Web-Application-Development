import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dvxmaiofh',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_SECRET_API,
});

export const cloudinaryStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'SnapBid',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
  },
});

export default cloudinary;
