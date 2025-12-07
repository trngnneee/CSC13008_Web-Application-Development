import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import multer from "multer";

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables. Please set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
}

const supabase = createClient(supabaseUrl, supabaseKey);


const storage = multer.memoryStorage();     
export const uploadImages = multer({ storage });

/**
 * Upload ảnh lên Supabase Storage bucket product-imgs
 * @param {File|Buffer} file - File object hoặc Buffer
 * @param {string} fileName - Tên file (unique)
 * @returns {Promise<string|null>} - Public URL của ảnh hoặc null nếu lỗi
 */
export const uploadImageToSupabase = async (file, fileName) => {
  try {
    console.log('Starting upload for:', fileName);
    
    // If fileName already has timestamp, use it directly
    const uniqueFileName = fileName.includes('-') ? fileName : `${Date.now()}-${fileName}`;
    const bucketName = 'product-imgs';

    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(uniqueFileName, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw new Error(`Upload failed: ${error.message}`);
    }
    // Lấy public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucketName)
      .getPublicUrl(uniqueFileName);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading to Supabase:', error);
    throw error;
  }
};

/**
 * Upload multiple images lên Supabase Storage
 * @param {Array} files - Array của Files hoặc Buffers
 * @returns {Promise<Array>} - Array của public URLs
 */
export const uploadImagesToSupabase = async (files) => {
  try {
    const uploadPromises = files.map((file) => {
      // Create fileName with timestamp for uniqueness
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substr(2, 9);
      const fileName = file.originalname || file.name || `image-${timestamp}-${randomStr}.jpg`;
      return uploadImageToSupabase(file.buffer || file, fileName);
    });

    const urls = await Promise.all(uploadPromises);
    return urls.filter(url => url !== null);
  } catch (error) {
    console.error('Error uploading multiple images:', error);
    throw error;
  }
};

/**
 * Delete ảnh từ Supabase Storage
 * @param {string} publicUrl - Public URL của ảnh
 */
export const deleteImageFromSupabase = async (publicUrl) => {
  try {
    const bucketName = 'product-imgs';
    // Extract filename from URL
    const fileName = publicUrl.split(`/object/public/${bucketName}/`)[1];
    console.log('Deleting image:', fileName);

    const { error } = await supabase.storage
      .from(bucketName)
      .remove([fileName]);

    if (error) {
      console.error('Supabase delete error:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error deleting image from Supabase:', error);
    throw error;
  }
};
