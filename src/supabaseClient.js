import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

// Singleton pattern for Supabase clients to prevent GoTrueClient multiple instance warnings
let supabaseInstance = null;
let supabaseAdminInstance = null;

export const supabase = (() => {
  if (!supabaseInstance) {
    if (!supabaseUrl || !supabaseAnonKey) {
        console.warn("Supabase credentials missing, check .env");
        return null;
    }
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey);
  }
  return supabaseInstance;
})();

export const supabaseAdmin = (() => {
  if (!supabaseServiceKey) return supabase;
  if (!supabaseAdminInstance) {
    supabaseAdminInstance = createClient(supabaseUrl, supabaseServiceKey);
  }
  return supabaseAdminInstance;
})();

export const uploadToCloudinary = async (file) => {
  if (!file) return null;

  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dp9idtrth';
  const uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'sneakers';
  const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;

  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);

  try {
    const response = await fetch(url, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
        throw new Error('Cloudinary upload failed');
    }

    const data = await response.json();
    
    // Auto-optimize to webp and apply best quality on the fly
    // We add f_auto,q_auto:best to the URL returned by Cloudinary
    // Cloudinary secure_url looks like: https://res.cloudinary.com/cloud_name/image/upload/v1234567/public_id.ext
    // We can inject transformations after /upload/
    const urlParts = data.secure_url.split('/upload/');
    const optimizedUrl = `${urlParts[0]}/upload/f_auto,q_auto:best/${urlParts[1]}`;

    return optimizedUrl;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

export const uploadImagesToCloudinary = async (files) => {
  if (!files || files.length === 0) return [];
  const uploadPromises = Array.from(files).map(file => uploadToCloudinary(file));
  return Promise.all(uploadPromises);
};

// Aliased to old function names for seamless integration if needed elsewhere
export const uploadImage = uploadToCloudinary;
export const uploadImages = uploadImagesToCloudinary;

// Process Image and Generate Preview are essentially obsolete since Cloudinary handles it,
// but we keep dummy methods to avoid breaking imports in Admin.jsx before we update it.
export const processImage = async (file) => file;
export const generatePreview = async (file) => URL.createObjectURL(file);

