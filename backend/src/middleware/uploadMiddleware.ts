import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';

// Configuration would usually come from .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME || 'demo',
  api_key: process.env.CLOUDINARY_API_KEY || 'demo',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'demo'
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'just-us-memories',
    allowed_formats: ['jpg', 'png', 'jpeg'],
  } as any,
});

export const upload = multer({ storage: storage });
