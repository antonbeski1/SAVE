import { NextRequest, NextResponse } from 'next/server';

// /api/gibs/{layer}/default/{date}/{resolution}/{z}/{y}/{x}.{format}
export async function GET(
  req: NextRequest,
  { params }: { params: { tile: string[] } }
) {
  const apiKey = process.env.NASA_API_KEY;
  if (!apiKey) {
    return new NextResponse('NASA API key is not configured.', { status: 500 });
  }

  const tilePath = params.tile.join('/');
  const gibsUrl = `https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/${tilePath}`;

  try {
    // IMPORTANT: The API key must be sent as a query parameter for GIBS WMTS
    const nasaResponse = await fetch(`${gibsUrl}?api_key=${apiKey}`, {
        next: { revalidate: 3600 * 24 } // Cache tiles for 24 hours
    });

    if (!nasaResponse.ok) {
      return new NextResponse(nasaResponse.statusText, { status: nasaResponse.status });
    }

    const imageBuffer = await nasaResponse.arrayBuffer();
    const contentType = nasaResponse.headers.get('content-type') || 'image/jpeg';
    
    return new NextResponse(Buffer.from(imageBuffer), {
        status: 200,
        headers: { 'Content-Type': contentType },
    });
    
  } catch (error) {
    console.error('Error fetching GIBS tile:', error);
    return new NextResponse('Error fetching GIBS tile.', { status: 500 });
  }
}
