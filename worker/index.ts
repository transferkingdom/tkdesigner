import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { cache } from 'hono/cache';
import type { Context } from 'hono';

const app = new Hono();

// CORS middleware
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['*'],
  credentials: true,
}));

// Cache middleware for SDK
app.use('/sdk/*', cache({
  cacheName: 'picsart-sdk',
  cacheControl: 'public, max-age=3600',
}));

// Proxy SDK requests
app.get('/sdk/*', async (c: Context) => {
  const url = new URL(c.req.url);
  const sdkUrl = `https://sdk.picsart.io${url.pathname}`;

  try {
    const response = await fetch(sdkUrl, {
      headers: {
        'User-Agent': c.req.header('user-agent') || 'Cloudflare Worker',
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
      },
    });

    if (!response.ok) {
      throw new Error(`SDK fetch failed: ${response.status} ${response.statusText}`);
    }

    const headers = new Headers(response.headers);
    headers.set('Access-Control-Allow-Origin', '*');
    headers.set('Cache-Control', 'public, max-age=3600');

    return new Response(response.body, {
      status: response.status,
      headers,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Failed to fetch SDK',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});

// Handle API requests
app.all('/api/*', async (c: Context) => {
  const url = new URL(c.req.url);
  const apiUrl = `https://api.picsart.io${url.pathname}`;

  try {
    const response = await fetch(apiUrl, {
      method: c.req.method,
      headers: c.req.headers,
      body: c.req.method !== 'GET' ? await c.req.blob() : undefined,
    });

    const headers = new Headers(response.headers);
    headers.set('Access-Control-Allow-Origin', '*');

    return new Response(response.body, {
      status: response.status,
      headers,
    });
  } catch (error) {
    return new Response(
      JSON.stringify({
        error: 'Failed to proxy API request',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      {
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }
});

// Serve static files from Pages
app.get('*', async (c: Context) => {
  const url = new URL(c.req.url);
  const path = url.pathname === '/' ? '/index.html' : url.pathname;
  
  try {
    const response = await fetch(`https://tkdesigner.pages.dev${path}`);
    return response;
  } catch {
    return c.notFound();
  }
});

export default app; 