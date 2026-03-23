import multer from 'multer';
import { cloudinaryStorage } from '../config/cloudinary.js';

export const uploadCloudinary = multer({ storage: cloudinaryStorage });

const memoryStorage = multer.memoryStorage();
export const uploadMemory = multer({ storage: memoryStorage });
