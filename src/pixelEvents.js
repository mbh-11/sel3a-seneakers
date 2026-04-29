const generateEventID = () => `evt_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;

async function hashData(data) {
  if (!data) return undefined;
  const msgUint8 = new TextEncoder().encode(String(data).toLowerCase().trim());
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Meta Pixel & Conversions API (CAPI) Tracking Helper
export const trackPixelEvent = async (eventName, params = {}, rawUserData = {}, providedEventID = null) => {
  const eventID = providedEventID || generateEventID();

  const userData = { ...rawUserData };
  try {
    if (userData.email) userData.email = await hashData(userData.email);
    if (userData.phone) userData.phone = await hashData(userData.phone);
  } catch (e) {
    console.warn("Failed to hash user data", e);
  }

  // 1. Client-side Pixel Tracking (Directly via fbq)
  if (typeof window !== 'undefined' && window.fbq) {
    // For standard events, the 4th parameter is for deduplication/eventID
    window.fbq('track', eventName, params, { eventID });
    console.log(`[Pixel Event]: ${eventName} (ID: ${eventID})`, params);
  } else {
    console.warn(`[Pixel Error]: fbq is not defined. Track failed for ${eventName}`);
  }

  // 2. Server-side Conversions API (CAPI) Tracking (via Vercel function)
  try {
    const testCode = process.env.NEXT_PUBLIC_FB_TEST_CODE || null;

    await fetch('/api/meta-capi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventName: eventName,
        eventID: eventID,
        eventData: params,
        userData: userData, // Email, Phone, etc for matching
        testEventCode: testCode
      }),
    });
    console.log(`[CAPI Event]: ${eventName} (ID: ${eventID}) sent to server`);
  } catch (error) {
    console.error(`[CAPI Error]: Failed to send ${eventName} to CAPI`, error);
  }
};

export const trackPageView = (userData = {}) => {
  trackPixelEvent('PageView', {}, userData);
};

export const trackAddToCart = (product, userData = {}) => {
  trackPixelEvent('AddToCart', {
    content_name: product.name,
    content_category: product.category,
    content_ids: [product.id.toString()],
    content_type: 'product',
    value: Number(product.price),
    currency: 'DZD',
    num_items: 1
  }, userData);
};

export const trackPurchase = (orderTotal, items, userData = {}) => {
  const eventID = generateEventID();
  trackPixelEvent('Purchase', {
    value: Number(orderTotal),
    currency: 'DZD',
    content_ids: items.map(item => item.id.toString()),
    content_type: 'product',
    num_items: items.length
  }, userData, eventID);
};

export const trackViewContent = (product, userData = {}) => {
  trackPixelEvent('ViewContent', {
    content_name: product.name,
    content_category: product.category,
    content_ids: [product.id.toString()],
    content_type: 'product',
    value: Number(product.price),
    currency: 'DZD'
  }, userData);
};

export const trackInitiateCheckout = (cartTotal, items, userData = {}) => {
  trackPixelEvent('InitiateCheckout', {
    value: Number(cartTotal),
    currency: 'DZD',
    content_ids: items.map(item => item.id.toString()),
    content_type: 'product',
    num_items: items.length
  }, userData);
};

export const trackAddToWishlist = (product, userData = {}) => {
  trackPixelEvent('AddToWishlist', {
    content_name: product.name,
    content_category: product.category,
    content_ids: [product.id.toString()],
    content_type: 'product',
    value: Number(product.price),
    currency: 'DZD'
  }, userData);
};

export const trackSearch = (searchString, userData = {}) => {
  trackPixelEvent('Search', {
    search_string: searchString,
    content_category: 'shoes'
  }, userData);
};
