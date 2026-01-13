-- ============================================
-- OneKit Migration: Add Business Cards & Invoices
-- ============================================

-- 1. Business Cards Table
CREATE TABLE IF NOT EXISTS public.business_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    template_id TEXT DEFAULT 'modern',
    content JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Invoices Table
CREATE TABLE IF NOT EXISTS public.invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE,
    template_id TEXT DEFAULT 'classic',
    invoice_data JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Row Level Security (RLS) Policies
-- Enable RLS
ALTER TABLE public.business_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Business Cards Policies
DO $$ BEGIN
    CREATE POLICY "Users can manage own business cards" 
    ON public.business_cards FOR ALL 
    USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- Invoices Policies
DO $$ BEGIN
    CREATE POLICY "Users can manage own invoices" 
    ON public.invoices FOR ALL 
    USING (auth.uid() = user_id);
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

-- 4. Indexes for performance
CREATE INDEX IF NOT EXISTS idx_business_cards_user ON public.business_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user ON public.invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_slug ON public.invoices(slug);
