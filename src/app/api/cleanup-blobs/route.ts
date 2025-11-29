import { del, list } from '@vercel/blob';
import { format, subDays, parse } from 'date-fns';
import { NextResponse } from 'next/server';

const EXPIRY_DAYS = 7;

export async function GET() {
  try {
    const cutoffDate = subDays(new Date(), EXPIRY_DAYS);
    const cutoffFolder = format(cutoffDate, 'yyyyMMdd');

    // Step 1: List top-level folders (efficient discovery)
    const { folders: allFolders } = await list({ mode: 'folded' });

    // Step 2: Filter expired folders (YYYYMMDD < cutoff)
    const expiredFolders: string[] = [];
    for (const folder of allFolders) {
      const folderName = folder.replace(/\/$/, ''); // Strip trailing slash
      const folderDate = parse(folderName, 'yyyyMMdd', new Date());
      const folderStr = format(folderDate, 'yyyyMMdd');
      if (folderStr < cutoffFolder) {
        expiredFolders.push(folder);
      }
    }

    if (expiredFolders.length === 0) {
      return NextResponse.json({
        success: true,
        deletedCount: 0,
        message: 'No expired folders',
      });
    }

    // Step 3: Batch delete per folder (using prefix + del array)
    let totalDeleted = 0;
    for (const folder of expiredFolders) {
      let cursor: string | undefined;
      const allPathsInFolder: string[] = [];

      // Paginate to collect all pathnames in this folder
      do {
        const { blobs, cursor: nextCursor } = await list({
          prefix: folder,
          limit: 1000,
          cursor,
        });

        allPathsInFolder.push(...blobs.map((b) => b.pathname));
        cursor = nextCursor;
      } while (cursor);

      // Batch delete the entire folder's paths
      if (allPathsInFolder.length > 0) {
        await del(allPathsInFolder, {
          token: process.env.BLOB_READ_WRITE_TOKEN,
        });
        totalDeleted += allPathsInFolder.length;
      }
    }

    return NextResponse.json({
      success: true,
      deletedCount: totalDeleted,
      deletedFolders: expiredFolders,
      cutoffFolder,
    });
  } catch (error) {
    console.error('Cleanup failed:', error);
    return NextResponse.json(
      {
        error: 'Cleanup failed',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
