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

    if (!url || (!url.includes('pinterest.com') && !url.includes('pin.it'))) {
      return NextResponse.json({ success: false, message: 'Invalid Pinterest URL' }, { status: 400 });
    }

    // Normalize URL
    let targetUrl = url.trim();
    if (!targetUrl.startsWith('http')) targetUrl = 'https://' + targetUrl;

    // For pin.it short links, resolve to full pinterest.com URL
    let resolvedUrl = targetUrl;
    if (targetUrl.includes('pin.it')) {
      try {
        const headRes = await fetch(targetUrl, {
          method: 'GET',
          redirect: 'follow',
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          },
        });
        resolvedUrl = headRes.url; // After redirect
      } catch {
        // Keep original
      }
    }

    // Fetch the Pinterest page HTML
    const pageRes = await fetch(resolvedUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
    });

    const html = await pageRes.text();

    // Extract video URL from meta tags / JSON in page
    let videoUrl = '';
    let imageUrl = '';
    let title = '';

    // Try og:video first
    const ogVideoMatch = html.match(/<meta[^>]+property="og:video(?::url)?"[^>]+content="([^"]+)"/i);
    if (ogVideoMatch) videoUrl = ogVideoMatch[1];

    // Try og:image for thumbnail / image pins
    const ogImageMatch = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i);
    if (ogImageMatch) imageUrl = ogImageMatch[1];

    // Try og:title
    const ogTitleMatch = html.match(/<meta[^>]+property="og:title"[^>]+content="([^"]+)"/i);
    if (ogTitleMatch) title = ogTitleMatch[1];

    // Try to find video URL in the page JSON data
    if (!videoUrl) {
      const videoSrcMatch = html.match(/"video_url"\s*:\s*"([^"]+)"/);
      if (videoSrcMatch) videoUrl = decodeURIComponent(videoSrcMatch[1].replace(/\\u002F/g, '/').replace(/\\\//g, '/'));
    }

    // Try m3u8 or mp4 patterns
    if (!videoUrl) {
      const mp4Match = html.match(/https?:\/\/[^"'\s]+\.mp4[^"'\s]*/);
      if (mp4Match) videoUrl = mp4Match[0];
    }

    const mediaUrl = videoUrl || imageUrl;
    const mediaType = videoUrl ? 'video' : 'image';

    if (!mediaUrl) {
      return NextResponse.json({
        success: false,
        message: 'Could not extract media. The pin may be private or region-restricted.',
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
    console.error('Pinterest download error:', error);
    return NextResponse.json({ success: false, message: 'Failed to process request' }, { status: 500 });
  }
}
