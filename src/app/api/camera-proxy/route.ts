import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const streamUrl = searchParams.get('url');

  if (!streamUrl) {
    return new NextResponse('Missing stream URL parameter', { status: 400 });
  }

  try {
    const response = await fetch(streamUrl, {
        headers: {
            // Mimic a standard browser request header
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        },
        cache: 'no-store' // Ensure we get the latest frame
    });

    if (!response.ok) {
      return new NextResponse(`Failed to fetch stream: ${response.statusText}`, { status: response.status });
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

  } catch (error) {
    console.error('Proxy error:', error);
    return new NextResponse('Error fetching stream from proxy.', { status: 500 });
  }
}

    