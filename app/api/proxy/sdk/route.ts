import { NextRequest } from 'next/server';

const SDK_URL = 'https://sdk.picsart.io/cdn/1.12.4/sdk.js';

export async function GET(request: NextRequest) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': '*',
  };

  try {
    const response = await fetch(SDK_URL, {
      headers: {
        'User-Agent': request.headers.get('user-agent') || 'Next.js API Route',
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
      },
    });

    if (!response.ok) {
      throw new Error(`SDK fetch failed: ${response.status} ${response.statusText}`);
    }

    const sdkContent = await response.text();

    return new Response(sdkContent, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/javascript; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('SDK proxy error:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Failed to fetch SDK',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
}

export async function OPTIONS() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': '*',
    },
  });
} 