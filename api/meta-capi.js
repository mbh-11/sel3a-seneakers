import crypto from 'crypto';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { eventName, eventData, userData, testEventCode, eventID } = req.body;
  const PIXEL_ID = process.env.VITE_META_PIXEL_ID || process.env.META_PIXEL_ID;
const ACCESS_TOKEN = process.env.VITE_META_ACCESS_TOKEN || process.env.META_ACCESS_TOKEN;

  if (!PIXEL_ID || !ACCESS_TOKEN) {
    console.error('Meta CAPI Error: Missing Pixel ID or Access Token in Environment Variables');
    return res.status(500).json({ error: 'Configuration Error' });
  }

  // Helper function to hash data (SHA256)
  const hash = (data) => {
    if (!data) return null;
    const str = String(data).trim().toLowerCase();
    if (str.length === 64 && /^[0-9a-f]{64}$/.test(str)) return str;
    return crypto.createHash('sha256').update(str).digest('hex');
  };

  const payload = {
    data: [
      {
        event_name: eventName,
        event_time: Math.floor(Date.now() / 1000),
        action_source: 'website',
        event_id: eventID,
        event_source_url: req.headers.referer || '',
        user_data: {
          client_ip_address: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
          client_user_agent: req.headers['user-agent'],
          em: userData?.email ? [hash(userData.email)] : undefined,
          ph: userData?.phone ? [hash(userData.phone)] : undefined,
          fn: userData?.firstName ? [hash(userData.firstName)] : undefined,
          ln: userData?.lastName ? [hash(userData.lastName)] : undefined,
          ct: userData?.city ? [hash(userData.city)] : undefined,
          st: userData?.state ? [hash(userData.state)] : undefined,
          fbc: req.cookies?.fbc || null,
          fbp: req.cookies?.fbp || null,
        },
        custom_data: {
          value: eventData?.value || 0,
          currency: eventData?.currency || 'DZD',
          content_ids: eventData?.content_ids || [],
          content_type: 'product',
          num_items: eventData?.num_items || 1,
          ...eventData // Spread to include custom fields like smart_interest
        },
        test_event_code: testEventCode || undefined,
      },
    ],
  };

  try {
    const response = await fetch(`https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${ACCESS_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const result = await response.json();
    console.log('[Meta CAPI Result]:', result);
    return res.status(200).json(result);
  } catch (error) {
    console.error('[Meta CAPI Error]:', error);
    return res.status(500).json({ error: 'Failed to send event to Meta' });
  }
}
