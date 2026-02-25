import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { env } from '@/lib/env';
import { createClient } from '@supabase/supabase-js';
import { ErrorResponse } from '@/lib/types';

const querySchema = z.object({
  path: z.string().min(1, 'Path is required'),
  bucket: z.enum(['public-assets', 'private-assets'], {
    message: 'Invalid bucket name',
  }),
  public: z.enum(['true', 'false']).optional().default('true'),
});

export interface GetUploadedUrlResponse {
  url: string;
  bucket: string;
  path: string;
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<GetUploadedUrlResponse | ErrorResponse>> {
  // Validate query params
  const searchParams = request.nextUrl.searchParams;
  const parseResult = querySchema.safeParse({
    path: searchParams.get('path'),
    bucket: searchParams.get('bucket'),
    public: searchParams.get('public'),
  });
  if (!parseResult.success) {
    return NextResponse.json(
      { error: parseResult.error.issues[0].message },
      { status: 400 }
    );
  }

  const { path, bucket, public: isPublicStr } = parseResult.data;
  const isPublic = isPublicStr === 'true';
  const supabaseAdmin = createClient(
    env.SUPABASE_URL!,
    env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get user ID (authenticated or fallback to official)
  const {
    data: { user },
  } = await supabaseAdmin.auth.getUser();
  const userId = user?.id ?? env.OFFICIAL_USER_ID;
  if (!userId) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }
  if (!path.startsWith(`users/${userId}/`)) {
    return NextResponse.json(
      { error: 'Unauthorized access to this location' },
      { status: 403 }
    );
  }

  // Generate appropriate URL
  try {
    let url: string;

    if (isPublic) {
      // Public URL (permanent)
      const { data } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
      if (!data.publicUrl) throw new Error('Failed to generate public URL');
      url = data.publicUrl;
    } else {
      // Signed URL (temporary, 7 days)
      const { data, error } = await supabaseAdmin.storage
        .from(bucket)
        .createSignedUrl(path, 60 * 60 * 24 * 7); // 7 days

      if (error || !data?.signedUrl) {
        console.error('Signed URL error:', error);
        throw new Error('Failed to generate signed URL');
      }
      url = data.signedUrl;
    }

    return NextResponse.json<GetUploadedUrlResponse>({
      url,
      bucket,
      path,
    });
  } catch (err) {
    console.error('Error generating uploaded URL:', err);
    return NextResponse.json(
      { error: 'Failed to retrieve URL' },
      { status: 500 }
    );
  }
}
