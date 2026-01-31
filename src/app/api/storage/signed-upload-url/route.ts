import { NextRequest, NextResponse } from 'next/server';
import { format } from 'date-fns';
import { env } from '@/lib/env';
import { createClient } from '@supabase/supabase-js';

interface GetSignedUploadUrlResponse {
  error?: string;
  signedUrl?: string;
  token?: string;
  path?: string;
  bucket?: string;
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<GetSignedUploadUrlResponse>> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');
  const isPublicParam = searchParams.get('public');

  if (!filename) {
    return NextResponse.json({ error: 'Missing filename' }, { status: 400 });
  }

  // true unless explicitly 'false'
  const isPublic = isPublicParam !== 'false';

  const supabaseAdmin = createClient(
    env.SUPABASE_URL!,
    env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get authenticated user or fallback to official
  const {
    data: { user },
  } = await supabaseAdmin.auth.getUser();
  const userId = user?.id ?? env.OFFICIAL_USER_ID;

  if (!userId) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 401 });
  }

  // Generate safe filename with timestamp
  const parts = filename.split('.');
  const baseName = parts.slice(0, -1).join('.') || 'image';
  const ext = parts.pop() || '';
  const timestamp = format(new Date(), 'yyyyMMddHHmmss');
  const safeFilename = `${baseName}_${timestamp}${ext ? `.${ext}` : ''}`;
  const bucket = isPublic ? 'public-assets' : 'private-assets';
  const path = `users/${userId}/${safeFilename}`;

  try {
    const { data: signedUploadData, error } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUploadUrl(path, { upsert: false });
    if (error) throw error;

    return NextResponse.json({ ...signedUploadData, bucket });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error)?.message ?? 'Failed to get signed upload URL' },
      { status: 500 }
    );
  }
}
