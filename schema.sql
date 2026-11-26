-- ============================================================================
-- NOTYLIST - Complete Database Schema (Updated)
-- OAuth-Only Authentication (Google + Discord)
-- Includes: Users, Notes, Categories, Tags, Todos, Shared Notes, Comments, etc.
-- ============================================================================

-- Create public schema if it doesn't exist
CREATE SCHEMA IF NOT EXISTS public;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Grant usage on public schema
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON SCHEMA public TO postgres, anon, authenticated, service_role;

-- ============================================================================
-- 1. USERS TABLE (OAuth Authentication)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- OAuth Fields
    oauth_provider TEXT NOT NULL CHECK (oauth_provider IN ('google', 'discord')),
    oauth_id TEXT NOT NULL,
    
    -- User Profile
    username TEXT NOT NULL,
    email TEXT,
    avatar_url TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_oauth_provider_id UNIQUE (oauth_provider, oauth_id)
);

-- Indexes for users
CREATE INDEX IF NOT EXISTS idx_users_oauth_provider ON public.users(oauth_provider);
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON public.users(username);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at DESC);

-- ============================================================================
-- 2. NOTES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Note Content
    title TEXT NOT NULL,
    content TEXT,
    
    -- Organization
    category TEXT DEFAULT 'general',
    tags TEXT[] DEFAULT '{}',
    
    -- State
    is_favorite BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    is_trashed BOOLEAN DEFAULT FALSE,
    
    -- Sharing
    is_public BOOLEAN DEFAULT FALSE,
    public_slug TEXT UNIQUE,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT valid_title_length CHECK (LENGTH(title) > 0 AND LENGTH(title) <= 500),
    CONSTRAINT valid_category_length CHECK (LENGTH(category) <= 100)
);

-- Indexes for notes
CREATE INDEX IF NOT EXISTS idx_notes_user_id ON public.notes(user_id);
CREATE INDEX IF NOT EXISTS idx_notes_category ON public.notes(category);
CREATE INDEX IF NOT EXISTS idx_notes_is_favorite ON public.notes(is_favorite) WHERE is_favorite = TRUE;
CREATE INDEX IF NOT EXISTS idx_notes_is_archived ON public.notes(is_archived) WHERE is_archived = TRUE;
CREATE INDEX IF NOT EXISTS idx_notes_is_trashed ON public.notes(is_trashed) WHERE is_trashed = TRUE;
CREATE INDEX IF NOT EXISTS idx_notes_is_public ON public.notes(is_public) WHERE is_public = TRUE;
CREATE INDEX IF NOT EXISTS idx_notes_public_slug ON public.notes(public_slug) WHERE public_slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_notes_created_at ON public.notes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_updated_at ON public.notes(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_notes_tags ON public.notes USING GIN(tags);

-- Full-text search index on notes
CREATE INDEX IF NOT EXISTS idx_notes_search ON public.notes USING GIN(
    to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(content, ''))
);

-- ============================================================================
-- 3. CATEGORIES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Category Details
    name TEXT NOT NULL,
    color TEXT DEFAULT '#6366f1',
    icon TEXT DEFAULT 'FiFolder',
    description TEXT,
    
    -- Display Order
    sort_order INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_user_category_name UNIQUE (user_id, name),
    CONSTRAINT valid_category_name_length CHECK (LENGTH(name) > 0 AND LENGTH(name) <= 100),
    CONSTRAINT valid_color_format CHECK (color ~ '^#[0-9A-Fa-f]{6}$')
);

-- Indexes for categories
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON public.categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_sort_order ON public.categories(sort_order);

-- ============================================================================
-- 4. TAGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Tag Details
    name TEXT NOT NULL,
    color TEXT DEFAULT '#8b5cf6',
    
    -- Usage Count
    usage_count INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    CONSTRAINT unique_user_tag_name UNIQUE (user_id, name),
    CONSTRAINT valid_tag_name_length CHECK (LENGTH(name) > 0 AND LENGTH(name) <= 50),
    CONSTRAINT valid_tag_color_format CHECK (color ~ '^#[0-9A-Fa-f]{6}$')
);

-- Indexes for tags
CREATE INDEX IF NOT EXISTS idx_tags_user_id ON public.tags(user_id);
CREATE INDEX IF NOT EXISTS idx_tags_name ON public.tags(name);
CREATE INDEX IF NOT EXISTS idx_tags_usage_count ON public.tags(usage_count DESC);

-- ============================================================================
-- 5. TODOS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.todos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Todo Content
    title TEXT NOT NULL,
    description TEXT,
    
    -- Status
    is_completed BOOLEAN DEFAULT FALSE,
    
    -- Priority
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    
    -- Organization
    category TEXT,
    due_date TIMESTAMPTZ,
    
    -- Display Order
    order_index INTEGER DEFAULT 0,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT valid_title_length CHECK (LENGTH(title) > 0 AND LENGTH(title) <= 500)
);

-- Indexes for todos
CREATE INDEX IF NOT EXISTS idx_todos_user_id ON public.todos(user_id);
CREATE INDEX IF NOT EXISTS idx_todos_is_completed ON public.todos(is_completed);
CREATE INDEX IF NOT EXISTS idx_todos_priority ON public.todos(priority);
CREATE INDEX IF NOT EXISTS idx_todos_category ON public.todos(category);
CREATE INDEX IF NOT EXISTS idx_todos_due_date ON public.todos(due_date);
CREATE INDEX IF NOT EXISTS idx_todos_order_index ON public.todos(order_index);
CREATE INDEX IF NOT EXISTS idx_todos_created_at ON public.todos(created_at DESC);

-- ============================================================================
-- 6. SHARED_NOTES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.shared_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
    shared_with_user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    shared_by_user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Sharing Details
    share_link TEXT UNIQUE,
    permission TEXT DEFAULT 'view' CHECK (permission IN ('view', 'edit')),
    
    -- Link Options
    expires_at TIMESTAMPTZ,
    password_hash TEXT,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    accessed_count INTEGER DEFAULT 0,
    last_accessed_at TIMESTAMPTZ,
    
    -- Constraints
    CONSTRAINT different_users CHECK (shared_with_user_id != shared_by_user_id OR shared_with_user_id IS NULL)
);

-- Indexes for shared_notes
CREATE INDEX IF NOT EXISTS idx_shared_notes_note_id ON public.shared_notes(note_id);
CREATE INDEX IF NOT EXISTS idx_shared_notes_shared_with ON public.shared_notes(shared_with_user_id);
CREATE INDEX IF NOT EXISTS idx_shared_notes_shared_by ON public.shared_notes(shared_by_user_id);
CREATE INDEX IF NOT EXISTS idx_shared_notes_share_link ON public.shared_notes(share_link);
CREATE INDEX IF NOT EXISTS idx_shared_notes_expires_at ON public.shared_notes(expires_at) WHERE expires_at IS NOT NULL;

-- ============================================================================
-- 7. NOTE_VERSIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.note_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
    
    -- Version Content
    title TEXT NOT NULL,
    content TEXT,
    
    -- Version Metadata
    version_number INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
    
    -- Constraints
    CONSTRAINT unique_note_version UNIQUE (note_id, version_number)
);

-- Indexes for note_versions
CREATE INDEX IF NOT EXISTS idx_note_versions_note_id ON public.note_versions(note_id);
CREATE INDEX IF NOT EXISTS idx_note_versions_created_at ON public.note_versions(created_at DESC);

-- ============================================================================
-- 8. NOTE_COMMENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.note_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    note_id UUID NOT NULL REFERENCES public.notes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Comment Content
    content TEXT NOT NULL,
    
    -- Threading
    parent_comment_id UUID REFERENCES public.note_comments(id) ON DELETE CASCADE,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    is_edited BOOLEAN DEFAULT FALSE,
    
    -- Constraints
    CONSTRAINT valid_comment_length CHECK (LENGTH(content) > 0 AND LENGTH(content) <= 2000)
);

-- Indexes for note_comments
CREATE INDEX IF NOT EXISTS idx_note_comments_note_id ON public.note_comments(note_id);
CREATE INDEX IF NOT EXISTS idx_note_comments_user_id ON public.note_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_note_comments_parent ON public.note_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_note_comments_created_at ON public.note_comments(created_at DESC);

-- ============================================================================
-- 9. USER_SETTINGS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.user_settings (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Appearance
    theme TEXT DEFAULT 'system' CHECK (theme IN ('light', 'dark', 'system')),
    
    -- Editor Preferences
    default_category TEXT DEFAULT 'general',
    font_family TEXT DEFAULT 'system',
    font_size TEXT DEFAULT 'medium' CHECK (font_size IN ('small', 'medium', 'large')),
    
    -- Privacy
    allow_public_notes BOOLEAN DEFAULT TRUE,
    show_profile BOOLEAN DEFAULT FALSE,
    
    -- Notifications
    email_notifications BOOLEAN DEFAULT TRUE,
    
    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- 10. ACTIVITY_LOG TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    
    -- Activity Details
    action TEXT NOT NULL,
    entity_type TEXT NOT NULL,
    entity_id UUID,
    
    -- Additional Data
    metadata JSONB DEFAULT '{}',
    ip_address INET,
    user_agent TEXT,
    
    -- Timestamp
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for activity_log
CREATE INDEX IF NOT EXISTS idx_activity_log_user_id ON public.activity_log(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_entity ON public.activity_log(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_at ON public.activity_log(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_log_action ON public.activity_log(action);

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all relevant tables
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_notes_updated_at ON public.notes;
CREATE TRIGGER update_notes_updated_at
    BEFORE UPDATE ON public.notes
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_categories_updated_at ON public.categories;
CREATE TRIGGER update_categories_updated_at
    BEFORE UPDATE ON public.categories
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_tags_updated_at ON public.tags;
CREATE TRIGGER update_tags_updated_at
    BEFORE UPDATE ON public.tags
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_todos_updated_at ON public.todos;
CREATE TRIGGER update_todos_updated_at
    BEFORE UPDATE ON public.todos
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_note_comments_updated_at ON public.note_comments;
CREATE TRIGGER update_note_comments_updated_at
    BEFORE UPDATE ON public.note_comments
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON public.user_settings;
CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON public.user_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.note_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- Users: Can only read/update their own profile
DROP POLICY IF EXISTS users_select_own ON public.users;
CREATE POLICY users_select_own ON public.users
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS users_update_own ON public.users;
CREATE POLICY users_update_own ON public.users
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS users_insert_own ON public.users;
CREATE POLICY users_insert_own ON public.users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Notes: Users can only access their own notes (or shared notes)
DROP POLICY IF EXISTS notes_select_own ON public.notes;
CREATE POLICY notes_select_own ON public.notes
    FOR SELECT USING (
        auth.uid() = user_id OR
        is_public = TRUE OR
        id IN (SELECT note_id FROM public.shared_notes WHERE shared_with_user_id = auth.uid())
    );

DROP POLICY IF EXISTS notes_insert_own ON public.notes;
CREATE POLICY notes_insert_own ON public.notes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS notes_update_own ON public.notes;
CREATE POLICY notes_update_own ON public.notes
    FOR UPDATE USING (
        auth.uid() = user_id OR
        id IN (SELECT note_id FROM public.shared_notes WHERE shared_with_user_id = auth.uid() AND permission = 'edit')
    );

DROP POLICY IF EXISTS notes_delete_own ON public.notes;
CREATE POLICY notes_delete_own ON public.notes
    FOR DELETE USING (auth.uid() = user_id);

-- Categories: Users can only access their own categories
DROP POLICY IF EXISTS categories_all_own ON public.categories;
CREATE POLICY categories_all_own ON public.categories
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Tags: Users can only access their own tags
DROP POLICY IF EXISTS tags_all_own ON public.tags;
CREATE POLICY tags_all_own ON public.tags
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Todos: Users can only access their own todos
DROP POLICY IF EXISTS todos_select_own ON public.todos;
CREATE POLICY todos_select_own ON public.todos
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS todos_insert_own ON public.todos;
CREATE POLICY todos_insert_own ON public.todos
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS todos_update_own ON public.todos;
CREATE POLICY todos_update_own ON public.todos
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS todos_delete_own ON public.todos;
CREATE POLICY todos_delete_own ON public.todos
    FOR DELETE USING (auth.uid() = user_id);

-- Shared Notes: Users can see notes shared with them or by them
DROP POLICY IF EXISTS shared_notes_access ON public.shared_notes;
CREATE POLICY shared_notes_access ON public.shared_notes
    FOR SELECT USING (
        auth.uid() = shared_with_user_id OR
        auth.uid() = shared_by_user_id
    );

DROP POLICY IF EXISTS shared_notes_create ON public.shared_notes;
CREATE POLICY shared_notes_create ON public.shared_notes
    FOR INSERT WITH CHECK (auth.uid() = shared_by_user_id);

DROP POLICY IF EXISTS shared_notes_delete ON public.shared_notes;
CREATE POLICY shared_notes_delete ON public.shared_notes
    FOR DELETE USING (auth.uid() = shared_by_user_id);

-- Note Versions: Users can access versions of notes they own or have shared access to
DROP POLICY IF EXISTS note_versions_access ON public.note_versions;
CREATE POLICY note_versions_access ON public.note_versions
    FOR SELECT USING (
        note_id IN (SELECT id FROM public.notes WHERE user_id = auth.uid()) OR
        note_id IN (SELECT note_id FROM public.shared_notes WHERE shared_with_user_id = auth.uid())
    );

-- Note Comments: Users can access comments on notes they own or have shared access to
DROP POLICY IF EXISTS note_comments_access ON public.note_comments;
CREATE POLICY note_comments_access ON public.note_comments
    FOR SELECT USING (
        note_id IN (SELECT id FROM public.notes WHERE user_id = auth.uid()) OR
        note_id IN (SELECT note_id FROM public.shared_notes WHERE shared_with_user_id = auth.uid())
    );

DROP POLICY IF EXISTS note_comments_create ON public.note_comments;
CREATE POLICY note_comments_create ON public.note_comments
    FOR INSERT WITH CHECK (
        auth.uid() = user_id AND (
            note_id IN (SELECT id FROM public.notes WHERE user_id = auth.uid()) OR
            note_id IN (SELECT note_id FROM public.shared_notes WHERE shared_with_user_id = auth.uid())
        )
    );

DROP POLICY IF EXISTS note_comments_update_own ON public.note_comments;
CREATE POLICY note_comments_update_own ON public.note_comments
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS note_comments_delete_own ON public.note_comments;
CREATE POLICY note_comments_delete_own ON public.note_comments
    FOR DELETE USING (auth.uid() = user_id);

-- User Settings: Users can only access their own settings
DROP POLICY IF EXISTS user_settings_all_own ON public.user_settings;
CREATE POLICY user_settings_all_own ON public.user_settings
    FOR ALL USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Activity Log: Users can only read their own activity
DROP POLICY IF EXISTS activity_log_select_own ON public.activity_log;
CREATE POLICY activity_log_select_own ON public.activity_log
    FOR SELECT USING (auth.uid() = user_id);

-- ============================================================================
-- UTILITY FUNCTIONS
-- ============================================================================

-- Function to get user's note count
CREATE OR REPLACE FUNCTION public.get_user_note_count(p_user_id UUID)
RETURNS INTEGER AS $$
    SELECT COUNT(*)::INTEGER
    FROM public.notes
    WHERE user_id = p_user_id AND is_trashed = FALSE;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Function to get user's category count
CREATE OR REPLACE FUNCTION public.get_user_category_count(p_user_id UUID)
RETURNS INTEGER AS $$
    SELECT COUNT(*)::INTEGER
    FROM public.categories
    WHERE user_id = p_user_id;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Function to soft delete a note
CREATE OR REPLACE FUNCTION public.soft_delete_note(p_note_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.notes
    SET is_trashed = TRUE, deleted_at = NOW()
    WHERE id = p_note_id AND user_id = p_user_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to restore a note from trash
CREATE OR REPLACE FUNCTION public.restore_note(p_note_id UUID, p_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE public.notes
    SET is_trashed = FALSE, deleted_at = NULL
    WHERE id = p_note_id AND user_id = p_user_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to permanently delete old trashed notes
CREATE OR REPLACE FUNCTION public.cleanup_old_trashed_notes(p_days_old INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.notes
    WHERE is_trashed = TRUE
    AND deleted_at < NOW() - (p_days_old || ' days')::INTERVAL;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create default categories for new users
CREATE OR REPLACE FUNCTION public.create_default_categories(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
    INSERT INTO public.categories (user_id, name, color, icon, sort_order) VALUES
        (p_user_id, 'Personal', '#3b82f6', 'FiUser', 1),
        (p_user_id, 'Work', '#8b5cf6', 'FiBriefcase', 2),
        (p_user_id, 'Ideas', '#f59e0b', 'FiLightbulb', 3),
        (p_user_id, 'To-Do', '#10b981', 'FiCheckSquare', 4)
    ON CONFLICT (user_id, name) DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- GRANTS
-- ============================================================================

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;

-- Grant table permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;

-- Grant sequence permissions
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO postgres, anon, authenticated, service_role;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================
DO $$
BEGIN
    RAISE NOTICE '✅ Database schema created successfully!';
    RAISE NOTICE '📝 Tables: users, notes, categories, tags, todos, shared_notes, note_versions, note_comments, user_settings, activity_log';
    RAISE NOTICE '🔒 Row Level Security enabled on all tables';
    RAISE NOTICE '🚀 Ready for OAuth authentication (Google + Discord)';
END $$;
