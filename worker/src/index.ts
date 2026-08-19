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

  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to generate QR code';
    return c.json({ success: false, error: message }, 500);
  }
});

// NOTE: Image/QR decoding is intentionally NOT implemented in this Worker.
// All decoding in RECQR happens client-side with jsQR. A server-side decode
// endpoint would require a WASM decoder and would contradict the project's
// privacy model (camera frames/images must never leave the browser). This is
// deliberately omitted rather than returning misleading mock data.

export default app;
