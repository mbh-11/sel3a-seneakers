/**
 * Helper utility to ensure all images use Cloudinary's auto-optimization
 * @param {string} url The original image URL
 * @returns {string} The optimized Cloudinary URL
 */
export const getOptimizedImageUrl = (url) => {
  if (!url) return '';

  // If it's a local static asset (starts with /), just return it
  if (url.startsWith('/')) return url;

  // If it's an already optimized Cloudinary URL
  if (url.includes('res.cloudinary.com') && url.includes('f_auto')) {
    return url;
  }

  // If it's a direct Cloudinary URL but lacks optimization params
  if (url.includes('res.cloudinary.com') && url.includes('/upload/')) {
    const parts = url.split('/upload/');
    return `${parts[0]}/upload/f_auto,q_auto,w_800/${parts[1]}`;
  }

  // If it's an external URL (like Supabase storage), use Cloudinary Fetch API
  const cloudName = 'dp9idtrth';
  // Example fetch URL: https://res.cloudinary.com/demo/image/fetch/f_auto,q_auto/https://upload.wikimedia.org/wikipedia/commons/1/13/Benedict_Cumberbatch_2011.png
  return `https://res.cloudinary.com/${cloudName}/image/fetch/f_auto,q_auto,w_800/${url}`;
};
