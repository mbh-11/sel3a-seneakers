// Meta Pixel Tracking Helper
export const trackPixelEvent = (eventName, params = {}) => {
  if (window.fbq) {
    window.fbq('track', eventName, params);
    console.log(`[Pixel Event]: ${eventName}`, params);
  } else {
    console.warn(`[Pixel Error]: fbq is not defined. Track failed for ${eventName}`);
  }
};

// Common Events
export const trackAddToCart = (product) => {
  trackPixelEvent('AddToCart', {
    content_name: product.name,
    content_category: product.category,
    content_ids: [product.id],
    content_type: 'product',
    value: product.price,
    currency: 'DZD'
  });
};

export const trackPurchase = (orderTotal, items) => {
  trackPixelEvent('Purchase', {
    value: orderTotal,
    currency: 'DZD',
    content_ids: items.map(item => item.id),
    content_type: 'product'
  });
};

export const trackViewContent = (product) => {
  trackPixelEvent('ViewContent', {
    content_name: product.name,
    content_category: product.category,
    content_ids: [product.id],
    content_type: 'product',
    value: product.price,
    currency: 'DZD'
  });
};

export const trackInitiateCheckout = (cartTotal, items) => {
  trackPixelEvent('InitiateCheckout', {
    value: cartTotal,
    currency: 'DZD',
    content_ids: items.map(item => item.id),
    content_type: 'product',
    num_items: items.length
  });
};

export const trackAddToWishlist = (product) => {
  trackPixelEvent('AddToWishlist', {
    content_name: product.name,
    content_category: product.category,
    content_ids: [product.id],
    content_type: 'product',
    value: product.price,
    currency: 'DZD'
  });
};
