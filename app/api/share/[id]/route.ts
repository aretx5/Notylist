import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';
import { supabase as supabaseClient } from '@/lib/supabase';

// Get shared note (public access)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const password = searchParams.get('password');

    const { data: note, error } = await supabaseClient
      .from('notes')
      .select('*')
      .eq('public_slug', id)
      .eq('is_public', true)
      .single();

    if (error || !note) {
      return NextResponse.json(
        { success: false, message: 'Note not found or not shared' },
        { status: 404 }
      );
    }

    // Check if password protected via tags
    const shareTag = (note.tags || []).find((t: string) => t.startsWith('share:'));
    const shareType = shareTag ? shareTag.split(':')[1] : 'public';

    if (shareType === 'password') {
      if (!password) {
        return NextResponse.json(
          { success: false, message: 'Password required', requiresPassword: true },
          { status: 403 }
        );
      }
      const storedPassword = shareTag?.split(':')[2];
      if (password !== storedPassword) {
        return NextResponse.json(
          { success: false, message: 'Invalid password', requiresPassword: true },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ success: true, note });
  } catch (error: any) {
    console.error('Get shared note error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to get shared note' },
      { status: 500 }
    );
  }
}

// Update share settings (authenticated)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { shareType, password } = await req.json();

    const { data: note, error: fetchError } = await supabase
      .from('notes')
      .select('id, public_slug, tags')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !note) {
      return NextResponse.json(
        { success: false, message: 'Note not found' },
        { status: 404 }
      );
    }

    // Generate short public slug if needed (8 chars)
    let publicSlug = note.public_slug;
    if (!publicSlug && shareType !== 'private') {
      publicSlug = Math.random().toString(36).substring(2, 10);
    }

    // Update tags: preserve color tag, replace share tag
    const otherTags = (note.tags || []).filter(
      (t: string) => !t.startsWith('share:') && !t.startsWith('color:')
    );
    const colorTag = (note.tags || []).find((t: string) => t.startsWith('color:'));
    const shareTag = `share:${shareType}${shareType === 'password' && password ? ':' + password : ''}`;
    const newTags = [...otherTags, shareTag, ...(colorTag ? [colorTag] : [])];

    const { error: updateError } = await supabase
      .from('notes')
      .update({
        is_public: shareType !== 'private',
        public_slug: shareType !== 'private' ? publicSlug : null,
        tags: newTags,
      })
      .eq('id', id)
      .eq('user_id', user.id);

    if (updateError) {
      console.error('Update share settings error:', updateError);
      return NextResponse.json(
        { success: false, message: 'Failed to update share settings' },
        { status: 500 }
      );
    }

    const origin = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001';
    const fullShareUrl = shareType !== 'private' && publicSlug
      ? `${origin}/sharenote/${publicSlug}`
      : null;

    return NextResponse.json({
      success: true,
      message: 'Share settings updated',
      shareUrl: fullShareUrl,
    });
  } catch (error: any) {
    console.error('Update share settings error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update share settings' },
      { status: 500 }
    );
  }
}
