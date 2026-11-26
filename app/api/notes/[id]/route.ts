import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

// GET single note
export async function GET(
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

    const { data: note, error } = await supabase
      .from('notes')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error || !note) {
      return NextResponse.json(
        { success: false, message: 'Note not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      note,
    });
  } catch (error: any) {
    console.error('Get note error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to get note' },
      { status: 500 }
    );
  }
}

// UPDATE note
export async function PUT(
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

    const updates = await req.json();

    // Convert camelCase to snake_case for database
    const dbUpdates: any = {};
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.content !== undefined) dbUpdates.content = updates.content;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.tags !== undefined) dbUpdates.tags = updates.tags;
    if (updates.isFavorite !== undefined) dbUpdates.is_favorite = updates.isFavorite;

    const { data: note, error } = await supabase
      .from('notes')
      .update(dbUpdates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select('*')
      .single();

    if (error || !note) {
      return NextResponse.json(
        { success: false, message: 'Note not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Note updated successfully',
      note,
    });
  } catch (error: any) {
    console.error('Update note error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update note' },
      { status: 500 }
    );
  }
}

// DELETE note (soft delete or permanent)
export async function DELETE(
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

    const { searchParams } = new URL(req.url);
    const permanent = searchParams.get('permanent') === 'true';

    if (permanent) {
      // Permanent delete
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        return NextResponse.json(
          { success: false, message: 'Note not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Note permanently deleted',
      });
    } else {
      // Soft delete
      const { data: note, error } = await supabase
        .from('notes')
        .update({ 
          is_trashed: true, 
          deleted_at: new Date().toISOString() 
        })
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error || !note) {
        return NextResponse.json(
          { success: false, message: 'Note not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'Note moved to trash',
        note,
      });
    }
  } catch (error: any) {
    console.error('Delete note error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to delete note' },
      { status: 500 }
    );
  }
}
