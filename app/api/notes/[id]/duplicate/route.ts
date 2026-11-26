import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id } = await params;
    
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

    // Find original note
    const { data: originalNote, error: fetchError } = await supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (fetchError || !originalNote) {
      return NextResponse.json(
        { success: false, message: 'Note not found' },
        { status: 404 }
      );
    }

    // Create duplicate
    const { data: duplicateNote, error: createError } = await supabase
      .from('notes')
      .insert({
        user_id: user.id,
        title: `${originalNote.title} (Copy)`,
        content: originalNote.content,
        category: originalNote.category,
        tags: originalNote.tags,
        is_pinned: false,
        is_favorite: false,
      })
      .select('*')
      .single();

    if (createError || !duplicateNote) {
      return NextResponse.json(
        { success: false, message: 'Failed to duplicate note' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Note duplicated successfully',
      note: duplicateNote,
    });
  } catch (error: any) {
    console.error('Duplicate note error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to duplicate note' },
      { status: 500 }
    );
  }
}
