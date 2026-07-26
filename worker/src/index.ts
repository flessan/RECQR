import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { renderSVG } from 'uqr';

const app = new Hono();

// Enable CORS for all routes
app.use('/*', cors());

// Health check endpoint
app.get('/', (c) => c.json({
  success: true,
  message: 'RECQR API is running',
  version: '1.0.0',
}));

app.get('/health', (c) => c.json({ status: 'ok' }));

// 1. Generate QR Code Endpoint
app.get('/v1/qr/generate', (c) => {
  const text = c.req.query('text');
  
  if (!text) {
    return c.json({ success: false, error: 'Missing required parameter: text' }, 400);
  }

  try {
    const margin = parseInt(c.req.query('margin') || '2', 10);
    const darkColor = c.req.query('fg') || '#000000';
    const lightColor = c.req.query('bg') || '#ffffff';
    
    const svg = renderSVG(text, {
      border: margin,
      blackColor: darkColor,
      whiteColor: lightColor,
    });

    const format = c.req.query('format') || 'svg';

    if (format === 'json') {
      return c.json({
        success: true,
        data: {
          text,
          svg,
        }
      });
    }

    // Default to returning the raw SVG
    c.header('Content-Type', 'image/svg+xml');
    c.header('Cache-Control', 'public, max-age=31536000, immutable');
    return c.body(svg);

  } catch (error: any) {
    return c.json({ success: false, error: error.message || 'Failed to generate QR code' }, 500);
  }
});

// 2. Mock Decode Endpoint (Note: actual image decoding in a Worker is complex, 
// so we provide a mock API to simulate the behavior for developers testing our API)
app.post('/v1/qr/decode', async (c) => {
  try {
    const body = await c.req.json();
    const { image } = body;

    if (!image) {
      return c.json({ success: false, error: 'Missing required field: image' }, 400);
    }

    // Since decoding an image inside a lightweight worker usually requires WASM
    // or heavier JS libraries, we return a mock response for API demonstration purposes.
    return c.json({
      success: true,
      data: {
        text: 'https://example.com/mock-decoded',
        type: 'url',
        timestamp: new Date().toISOString()
      },
      message: 'Note: This is a mock response from the Cloudflare Worker.'
    });

  } catch (error) {
    return c.json({ success: false, error: 'Invalid JSON payload' }, 400);
  }
});

export default app;
