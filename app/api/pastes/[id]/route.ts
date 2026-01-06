import { NextRequest } from 'next/server';
import { getStorage } from '@/lib/storage';
import { getCurrentTimeMs } from '@/lib/time';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const storage = getStorage();
  const currentTime = getCurrentTimeMs(request.headers);
  
  const paste = await storage.getPaste(id, currentTime);
  
  if (!paste) {
    return Response.json(
      { error: 'Paste not found' },
      { status: 404 }
    );
  }
  
  await storage.updatePaste(id, {
    currentViews: paste.currentViews + 1,
  });
  
  const expiresAt = paste.ttlSeconds
    ? new Date(paste.createdAt + paste.ttlSeconds * 1000).toISOString()
    : null;
  
  const remainingViews = paste.maxViews
    ? paste.maxViews - paste.currentViews - 1
    : null;
  
  return Response.json({
    content: paste.content,
    remaining_views: remainingViews,
    expires_at: expiresAt,
  });
}
