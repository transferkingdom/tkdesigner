import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const requestHeaders = new Headers(request.headers);
  
  // Forward gerekli header'ları ekle
  const clientIp = request.headers.get('x-real-ip') || request.headers.get('x-forwarded-for') || '';
  requestHeaders.set('x-real-ip', clientIp);
  requestHeaders.set('x-forwarded-for', request.headers.get('x-forwarded-for') || clientIp);
  requestHeaders.set('x-forwarded-proto', request.headers.get('x-forwarded-proto') || 'https');
  requestHeaders.set('x-forwarded-host', request.headers.get('x-forwarded-host') || request.headers.get('host') || '');

  // CORS header'larını ekle
  if (request.headers.get('origin')?.includes('sdk.picsart.io')) {
    requestHeaders.set('Access-Control-Allow-Origin', 'https://sdk.picsart.io');
    requestHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    requestHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    requestHeaders.set('Access-Control-Allow-Credentials', 'true');
  }

  // Response'u yeni header'larla döndür
  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: [
    '/api/:path*',
    '/sdk/:path*',
    '/cdn/:path*'
  ],
}; 