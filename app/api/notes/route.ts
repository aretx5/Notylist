import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase-server';

// GET all notes with pagination and filters
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

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = 10;
    const offset = (page - 1) * limit;
    const search = searchParams.get('search') || '';
    const categoryId = searchParams.get('categoryId') || '';
    const isFavorite = searchParams.get('isFavorite') === 'true';
    const isDeleted = searchParams.get('isDeleted') === 'true';
    const sortByParam = searchParams.get('sortBy') || 'updatedAt';
    // Convert camelCase to snake_case for database
    const sortBy = sortByParam === 'updatedAt' ? 'updated_at' : 
                   sortByParam === 'createdAt' ? 'created_at' : 
                   sortByParam;
    const sortOrder = searchParams.get('sortOrder') === 'asc';

    // Build query
    let query = supabase
      .from('notes')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id)
      .eq('is_trashed', isDeleted);

    // Search filter
    if (search) {
      query = query.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    }

    // Category filter
    if (categoryId) {
      query = query.eq('category_id', categoryId);
    }

    // Favorite filter
    if (isFavorite) {
      query = query.eq('is_favorite', true);
    }

    // Sort: favorites first, then by selected field
    query = query
      .order('is_favorite', { ascending: false })
      .order(sortBy, { ascending: sortOrder })
      .range(offset, offset + limit - 1);

    const { data: notes, error, count } = await query;

    if (error) {
      console.error('Get notes error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to get notes' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      notes: notes || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error: any) {
    console.error('Get notes error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to get notes' },
      { status: 500 }
    );
  }
}

// CREATE new note
export async function POST(req: NextRequest) {
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

    const { title, content, category, tags } = await req.json();

    if (!title) {
      return NextResponse.json(
        { success: false, message: 'Title is required' },
        { status: 400 }
      );
    }

    const { data: note, error } = await supabase
      .from('notes')
      .insert({
        user_id: user.id,
        title,
        content: content || '',
        category: category || 'general',
        tags: tags || [],
      })
      .select('*')
      .single();

    if (error) {
      console.error('Create note error:', error);
      return NextResponse.json(
        { success: false, message: 'Failed to create note' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Note created successfully',
      note,
    });
  } catch (error: any) {
    console.error('Create note error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create note' },
      { status: 500 }
    );
  }
}
