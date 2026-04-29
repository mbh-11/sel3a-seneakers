import sharp from 'sharp';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(chunk);
    }
    const inputBuffer = Buffer.concat(chunks);

    if (!inputBuffer || inputBuffer.length === 0) {
      return res.status(400).json({ error: 'No data provided' });
    }

    // Convert HEIC to WebP using Sharp (High Speed)
    // Sharp automatically handles various HEIF/HEIC sub-formats
    const outputBuffer = await sharp(inputBuffer)
      .webp({ quality: 80 })
      .toBuffer();

    res.setHeader('Content-Type', 'image/webp');
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    return res.status(200).send(outputBuffer);

  } catch (err) {
    console.error('[Cloud Sharp Error]:', err.message);
    return res.status(500).json({ 
        error: 'Conversion failed', 
        details: err.message 
    });
  }
}
