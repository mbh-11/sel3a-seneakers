/**
 * Helper utility to ensure all images use Cloudinary's auto-optimization
 * @param {string} url The original image URL
 * @param {number|string} width Optional width parameter (default 600)
 * @returns {string} The optimized Cloudinary URL
 */
export const getOptimizedImageUrl = (url, width = 600) => {
  if (!url) return '';

  // If it's a local static asset (starts with /), just return it
  if (url.startsWith('/')) return url;

  const optParams = `f_auto,q_auto,w_${width},c_fill`;

  // If it's a Cloudinary URL
  if (url.includes('res.cloudinary.com')) {
    if (url.includes('/upload/')) {
      // If it already has some optimization params (e.g. f_auto), let's replace that segment
      if (url.includes('/upload/f_auto') || url.match(/\/upload\/.*w_/)) {
        return url.replace(/\/upload\/[^/]+\//, `/upload/${optParams}/`);
      }
      // Otherwise inject them
      const parts = url.split('/upload/');
      return `${parts[0]}/upload/${optParams}/${parts[1]}`;
    }
  }

  // If it's an external URL (like Supabase storage), use Cloudinary Fetch API
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'dp9idtrth';
  // Example fetch URL: https://res.cloudinary.com/demo/image/fetch/f_auto,q_auto/https://upload.wikimedia.org/wikipedia/commons/1/13/Benedict_Cumberbatch_2011.png
  return `https://res.cloudinary.com/${cloudName}/image/fetch/${optParams}/${url}`;
};
