import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { format } from 'date-fns';
import { env } from '@/lib/env';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB in bytes

export async function POST(request: NextRequest): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get('filename');

  if (!filename) {
    return NextResponse.json(
      { error: 'Missing filename query parameter' },
      { status: 400 }
    );
  }

  // Public defaults to true
  const isPublicParam = searchParams.get('public');
  const isPublic = isPublicParam !== 'false'; // true unless explicitly 'false'

  // Get authenticated user or fallback to official
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const userId = user?.id ?? env.OFFICIAL_USER_ID;

  if (!userId) {
    return NextResponse.json(
      { error: 'No authenticated user and OFFICIAL_USER_ID not set' },
      { status: 500 }
    );
  }

  // Generate safe filename with timestamp
  const parts = filename.split('.');
  const baseName = parts.slice(0, -1).join('.') || 'image';
  const ext = parts.pop() || '';

  const timestamp = format(new Date(), 'yyyyMMddHHmmss');
  const safeFilename = `${baseName}_${timestamp}${ext ? `.${ext}` : ''}`;

  // Build upload path
  const bucket = isPublic ? 'public-assets' : 'private-assets';
  const uploadPath = `users/${userId}/${safeFilename}`;

  // Read request body (file)
  if (!request.body) {
    return NextResponse.json(
      { error: 'No file provided in request body' },
      { status: 400 }
    );
  }

  // Check file size (client can send Content-Length header)
  const contentLength = request.headers.get('content-length');
  if (contentLength && Number(contentLength) > MAX_FILE_SIZE) {
    return NextResponse.json(
      { error: 'File too large (max 10 MB)' },
      { status: 413 }
    );
  }

  // if not set content type -> supabase will set to text/plain by default
  const contentType = request.headers.get('content-type') ?? 'image/jpeg';

  try {
    // Upload to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(uploadPath, request.body, {
        cacheControl: '3600', // 1 hour cache
        upsert: false, // don't overwrite existing
        contentType,
      });

    if (uploadError) {
      console.error('Supabase Storage upload error:', uploadError);
      return NextResponse.json(
        { error: uploadError.message || 'Failed to upload image' },
        { status: 500 }
      );
    }

    // Get public URL (for public bucket) or signed URL (for private)
    let finalUrl: string;
    if (isPublic) {
      const { data: publicUrl } = supabase.storage
        .from(bucket)
        .getPublicUrl(uploadPath);
      finalUrl = publicUrl.publicUrl;
    } else {
      // For private: generate signed URL (e.g. 7 days expiry)
      const { data: signed } = await supabase.storage
        .from(bucket)
        .createSignedUrl(uploadPath, 60 * 60 * 24 * 7); // 7 days
      if (!signed) throw new Error('Failed to generate signed URL');
      finalUrl = signed.signedUrl;
    }

    // Return success response
    return NextResponse.json({
      success: true,
      url: finalUrl,
      path: uploadPath,
      bucket,
      isPublic,
      userId,
      filename: safeFilename,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 }
    );
  }
}
