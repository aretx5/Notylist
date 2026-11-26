import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { url } = await request.json();

    if (!url || !url.includes('instagram.com')) {
      return NextResponse.json({ success: false, message: 'Invalid Instagram URL' }, { status: 400 });
    }

    let targetUrl = url.trim();
    if (!targetUrl.startsWith('http')) targetUrl = 'https://' + targetUrl;

    // Strip query params and ensure clean URL
    const urlObj = new URL(targetUrl);
    const cleanPath = urlObj.pathname.replace(/\/$/, '');
    const cleanUrl = `https://www.instagram.com${cleanPath}/`;

    // Fetch the Instagram page (with mobile user agent for better og:video support)
    const pageRes = await fetch(cleanUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Cache-Control': 'no-cache',
      },
    });

    const html = await pageRes.text();

    let videoUrl = '';
    let imageUrl = '';
    let title = '';

    // og:video
    const ogVideoMatch = html.match(/<meta[^>]+property="og:video"[^>]+content="([^"]+)"/i)
      || html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:video"/i);
    if (ogVideoMatch) videoUrl = ogVideoMatch[1];

    // og:image
    const ogImageMatch = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i)
      || html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:image"/i);
    if (ogImageMatch) imageUrl = ogImageMatch[1];

    // og:title
    const ogTitleMatch = html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i);
    if (ogTitleMatch) title = ogTitleMatch[1];

    // Fallback: JSON data in page
    if (!videoUrl) {
      const vidMatch = html.match(/"video_url":"([^"]+)"/);
      if (vidMatch) videoUrl = vidMatch[1].replace(/\\u0026/g, '&').replace(/\\\//g, '/');
    }

    const mediaUrl = videoUrl || imageUrl;
    const mediaType = videoUrl ? 'video' : 'image';

    if (!mediaUrl) {
      return NextResponse.json({
        success: false,
        message: 'Could not extract media. Instagram may require login for this content.',
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      media: {
        url: mediaUrl,
        type: mediaType,
        thumbnail: imageUrl || undefined,
        title: title || undefined,
      },
    });
  } catch (error: any) {
    console.error('Instagram download error:', error);
    return NextResponse.json({ success: false, message: 'Failed to process request' }, { status: 500 });
  }
}
