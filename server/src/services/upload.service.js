import supabase from '../config/supabase.js';

const BUCKET_NAME = 'product-imgs';

export const uploadImageToSupabase = async (file, fileName) => {
  const uniqueFileName = fileName.includes('-') ? fileName : `${Date.now()}-${fileName}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(uniqueFileName, file, { cacheControl: '3600', upsert: false });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const { data: { publicUrl } } = supabase.storage.from(BUCKET_NAME).getPublicUrl(uniqueFileName);
  return publicUrl;
};

export const uploadImagesToSupabase = async (files) => {
  const uploadPromises = files.map((file) => {
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substr(2, 9);
    const fileName = file.originalname || file.name || `image-${timestamp}-${randomStr}.jpg`;
    return uploadImageToSupabase(file.buffer || file, fileName);
  });

  const urls = await Promise.all(uploadPromises);
  return urls.filter((url) => url !== null);
};

export const deleteImageFromSupabase = async (publicUrl) => {
  const fileName = publicUrl.split(`/object/public/${BUCKET_NAME}/`)[1];
  if (!fileName) return;

  const { error } = await supabase.storage.from(BUCKET_NAME).remove([fileName]);
  if (error) {
    console.error('Supabase delete error:', error);
    throw error;
  }
};
