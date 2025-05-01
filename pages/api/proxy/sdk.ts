import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const SDK_SOURCE_URL = 'https://sdk.picsart.io/cdn/1.12.4/sdk.js';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log('Proxy request received:', {
    method: req.method,
    headers: req.headers,
    url: SDK_SOURCE_URL
  });

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('Fetching SDK from:', SDK_SOURCE_URL);
    
    const response = await axios.get(SDK_SOURCE_URL, {
      responseType: 'text',
      timeout: 10000,
      headers: {
        'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
        'Accept': '*/*',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Origin': req.headers.origin || '',
        'Referer': req.headers.referer || '',
      },
      validateStatus: (status) => status === 200
    });

    if (!response.data || typeof response.data !== 'string') {
      console.error('Invalid SDK response:', response.data);
      return res.status(500).json({ error: 'Invalid SDK response' });
    }

    console.log('SDK fetched successfully, content length:', response.data.length);

    res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.status(200).send(response.data);
  } catch (error: any) {
    console.error('Proxy error details:', {
      message: error.message,
      code: error.code,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers
    });

    if (axios.isAxiosError(error)) {
      if (error.response) {
        // Sunucu yanıt verdi ama hata kodu döndü
        return res.status(error.response.status).json({
          error: 'SDK server error',
          details: error.response.data
        });
      } else if (error.request) {
        // İstek yapıldı ama yanıt alınamadı
        return res.status(503).json({
          error: 'SDK server not responding',
          details: error.message
        });
      }
    }

    res.status(500).json({
      error: 'Failed to fetch SDK',
      details: error.message
    });
  }
} 