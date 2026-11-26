import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get counts
    const [
      { count: totalNotes },
      { count: favoritesCount },
      { count: trashedCount },
      { count: sharedCount },
    ] = await Promise.all([
      supabase.from('notes').select('*', { count: 'exact', head: true })
        .eq('user_id', user.id).eq('is_trashed', false),
      supabase.from('notes').select('*', { count: 'exact', head: true })
        .eq('user_id', user.id).eq('is_trashed', false).eq('is_favorite', true),
      supabase.from('notes').select('*', { count: 'exact', head: true })
        .eq('user_id', user.id).eq('is_trashed', true),
      supabase.from('notes').select('*', { count: 'exact', head: true })
        .eq('user_id', user.id).eq('is_trashed', false).eq('is_public', true),
    ]);

    // Get recently updated notes
    const { data: recentNotes } = await supabase
      .from('notes')
      .select('id, title, updated_at, tags')
      .eq('user_id', user.id)
      .eq('is_trashed', false)
      .order('updated_at', { ascending: false })
      .limit(5);

    return NextResponse.json({
      success: true,
      stats: {
        totalNotes: totalNotes || 0,
        favoritesCount: favoritesCount || 0,
        trashedCount: trashedCount || 0,
        sharedCount: sharedCount || 0,
        recentNotes: recentNotes || [],
      },
    });
  } catch (error: any) {
    console.error('Get stats error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to get stats' },
      { status: 500 }
    );
  }
}
