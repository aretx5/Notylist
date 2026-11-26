-- ============================================================================
-- ADD TODOS TABLE TO EXISTING SCHEMA
-- Run this AFTER running database.sql
-- ============================================================================

-- Create todos table
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

-- Enable RLS
ALTER TABLE public.todos ENABLE ROW LEVEL SECURITY;

-- RLS Policies
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

-- Auto-update trigger
DROP TRIGGER IF EXISTS update_todos_updated_at ON public.todos;
CREATE TRIGGER update_todos_updated_at
    BEFORE UPDATE ON public.todos
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Grant permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.todos TO authenticated;
