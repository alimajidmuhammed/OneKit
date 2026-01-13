-- ========================================================
-- OneKit: Bulletproof Business Cards & Invoices Setup
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard/project/_/sql
-- ========================================================

-- 0. Ensure UUID extension is enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Create Business Cards Table
CREATE TABLE IF NOT EXISTS public.business_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    template_id TEXT DEFAULT 'modern',
    content JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create Invoices Table
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

-- 3. Enable RLS
ALTER TABLE public.business_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- 4. Create Policies (using DROP first to ensure they are updated)
DROP POLICY IF EXISTS "Users can manage own business cards" ON public.business_cards;
CREATE POLICY "Users can manage own business cards" 
ON public.business_cards FOR ALL 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own invoices" ON public.invoices;
CREATE POLICY "Users can manage own invoices" 
ON public.invoices FOR ALL 
USING (auth.uid() = user_id);

-- 5. Add performance indexes
CREATE INDEX IF NOT EXISTS idx_business_cards_user ON public.business_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_user ON public.invoices(user_id);

-- 6. Verify Tables Existence (Run this to check)
-- SELECT count(*) FROM public.business_cards;
-- SELECT count(*) FROM public.invoices;
