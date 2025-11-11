import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const imageUrl = searchParams.get('url');

  if (!imageUrl || !imageUrl.startsWith('https://')) {
    return NextResponse.json(
      { error: 'Invalid or non-HTTPS URL' },
      { status: 400 }
    );
  }

  try {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error('Failed to fetch image');

    const buffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/jpeg';

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch (error) {
    console.error({ error });
    return NextResponse.json(
      { error: 'Failed to load image' },
      { status: 500 }
    );
  }
}
