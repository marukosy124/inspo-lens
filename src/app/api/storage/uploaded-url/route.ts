import { NextRequest, NextResponse } from 'next/server';
import { env } from '@/lib/env';
import { createClient } from '@supabase/supabase-js';

interface GetUploadedUrlResponse {
  error?: string;
  url?: string;
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<GetUploadedUrlResponse>> {
  const { searchParams } = new URL(request.url);
  const path = searchParams.get('path');
  const bucket = searchParams.get('bucket');
  const isPublicParam = searchParams.get('public');
  const isPublic = isPublicParam !== 'false'; // true unless explicitly 'false'

  if (!path || !bucket) {
    return NextResponse.json(
      { error: 'Missing bucket or path' },
      { status: 400 }
    );
  }

  const supabaseAdmin = createClient(
    env.SUPABASE_URL!,
    env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Check if authorized
  const {
    data: { user },
  } = await supabaseAdmin.auth.getUser();
  const userId = user?.id ?? env.OFFICIAL_USER_ID;

  if (!userId) {
    return NextResponse.json({ error: 'Permission denied' }, { status: 401 });
  }

  try {
    let url: string;

    // Get public URL for public
    if (isPublic) {
      const { data: publicUrl } = supabaseAdmin.storage
        .from(bucket)
        .getPublicUrl(path);
      url = publicUrl.publicUrl;
    } else {
      // Generate signed URL for private
      const { data: signed, error } = await supabaseAdmin.storage
        .from(bucket)
        .createSignedUrl(path, 60 * 60 * 24 * 7); // 7 days
      if (!signed) throw error;
      url = signed.signedUrl;
    }

    return NextResponse.json({ url });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error)?.message ?? 'Failed to get uploaded URL' },
      { status: 500 }
    );
  }
}
