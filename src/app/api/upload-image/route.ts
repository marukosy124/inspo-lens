import { put } from '@vercel/blob';
import { format } from 'date-fns';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  if (!filename)
    return NextResponse.json({ error: 'Missing filename' }, { status: 400 });

  if (!request.body)
    return NextResponse.json({ error: 'Missing file' }, { status: 500 });

  const folderName = format(new Date(), 'yyyyMMdd');

  const blob = await put(`${folderName}/${filename}`, request.body, {
    access: 'public',
    addRandomSuffix: true,
  });

  return NextResponse.json(blob);
}
