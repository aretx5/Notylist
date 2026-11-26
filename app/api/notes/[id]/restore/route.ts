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

    const { data: note, error } = await supabase
      .from('notes')
      .update({ 
        is_trashed: false, 
        deleted_at: null 
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .eq('is_trashed', true)
      .select('*')
      .single();

    if (error || !note) {
      return NextResponse.json(
        { success: false, message: 'Note not found in trash' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Note restored successfully',
      note,
    });
  } catch (error: any) {
    console.error('Restore note error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to restore note' },
      { status: 500 }
    );
  }
}
