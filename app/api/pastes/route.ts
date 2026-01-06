import { NextRequest } from 'next/server';
import { getStorage } from '@/lib/storage';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const { content, ttl_seconds, max_views } = body;
    
    if (!content || typeof content !== 'string' || content.trim() === '') {
      return Response.json(
        { error: 'content is required and must be a non-empty string' },
        { status: 400 }
      );
    }
    
    if (ttl_seconds !== undefined) {
      if (!Number.isInteger(ttl_seconds) || ttl_seconds < 1) {
        return Response.json(
          { error: 'ttl_seconds must be an integer >= 1' },
          { status: 400 }
        );
      }
    }
    
    if (max_views !== undefined) {
      if (!Number.isInteger(max_views) || max_views < 1) {
        return Response.json(
          { error: 'max_views must be an integer >= 1' },
          { status: 400 }
        );
      }
    }
    
    const storage = getStorage();
    const paste = await storage.createPaste({
      content,
      ttlSeconds: ttl_seconds,
      maxViews: max_views,
    });
    
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}`
      : `http://localhost:${process.env.PORT || 3000}`;
    
    return Response.json({
      id: paste.id,
      url: `${baseUrl}/p/${paste.id}`,
    });
  } catch (error) {
    return Response.json(
      { error: 'Invalid request body' },
      { status: 400 }
    );
  }
}
