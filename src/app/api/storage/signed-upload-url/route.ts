import { NextRequest, NextResponse } from 'next/server';
import { format } from 'date-fns';
import { z } from 'zod';
import { env } from '@/lib/env';
import { createClient } from '@supabase/supabase-js';
import { ErrorResponse } from '@/lib/types';

const querySchema = z.object({
  filename: z.string().min(1, 'Filename is required'),
  public: z.enum(['true', 'false']).optional().default('true'),
});

export interface GetSignedUploadUrlResponse {
  signedUrl: string;
  token: string;
  path: string;
  bucket: string;
}

export async function GET(
  request: NextRequest
): Promise<NextResponse<GetSignedUploadUrlResponse | ErrorResponse>> {
  // Validate query params
  const searchParams = request.nextUrl.searchParams;
  const parseResult = querySchema.safeParse({
    filename: searchParams.get('filename'),
    public: searchParams.get('public'),
  });
  if (!parseResult.success) {
    return NextResponse.json(
      { error: parseResult.error.issues[0].message },
      { status: 400 }
    );
  }

  const { filename, public: isPublicStr } = parseResult.data;
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

  // Generate safe, unique path
  const ext = filename.split('.').pop() || 'png';
  const baseName = filename.replace(/\.[^/.]+$/, '') || 'image';
  const timestamp = format(new Date(), 'yyyyMMddHHmmss');
  const safeFilename = `${baseName}_${timestamp}.${ext}`;

  const bucket = isPublic ? 'public-assets' : 'private-assets';
  const path = `users/${userId}/${safeFilename}`;

  // Create signed upload URL
  try {
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUploadUrl(path, { upsert: false });

    if (error) {
      console.error('Supabase signed upload error:', error);
      return NextResponse.json(
        { error: 'Failed to generate upload URL' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'No upload data returned' },
        { status: 500 }
      );
    }

    return NextResponse.json<GetSignedUploadUrlResponse>({
      signedUrl: data.signedUrl,
      token: data.token,
      path: data.path,
      bucket,
    });
  } catch (err) {
    console.error('Unexpected error generating signed URL:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
