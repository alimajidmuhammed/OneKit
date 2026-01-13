-- ============================================
-- OneKit Service Tools Schema
-- Additional tables for Menu Maker, QR Generator, CV Maker
-- ============================================

-- ============================================
-- User Trials Table
-- Tracks free trial periods for services
-- ============================================
CREATE TABLE IF NOT EXISTS public.user_trials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    service_slug TEXT NOT NULL,
    starts_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, service_slug)
);

CREATE INDEX IF NOT EXISTS idx_user_trials_user ON public.user_trials(user_id);
CREATE INDEX IF NOT EXISTS idx_user_trials_service ON public.user_trials(service_slug);

-- ============================================
-- Menus Table
-- Restaurant/cafe menus created by users
-- ============================================
CREATE TABLE IF NOT EXISTS public.menus (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    logo_url TEXT,
    template_id TEXT DEFAULT 'classic',
    theme JSONB DEFAULT '{"primaryColor": "#5B6EF2", "backgroundColor": "#FFFFFF"}'::jsonb,
    currency TEXT DEFAULT 'IQD',
    is_published BOOLEAN DEFAULT false,
    slug TEXT UNIQUE,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_menus_user ON public.menus(user_id);
CREATE INDEX IF NOT EXISTS idx_menus_slug ON public.menus(slug);

-- ============================================
-- Menu Categories Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.menu_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_id UUID REFERENCES public.menus(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_menu_categories_menu ON public.menu_categories(menu_id);

-- ============================================
-- Menu Items Table
-- ============================================
CREATE TABLE IF NOT EXISTS public.menu_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    menu_id UUID REFERENCES public.menus(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.menu_categories(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2),
    image_url TEXT,
    options JSONB DEFAULT '[]'::jsonb,
    tags TEXT[] DEFAULT '{}',
    is_available BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_menu_items_menu ON public.menu_items(menu_id);
CREATE INDEX IF NOT EXISTS idx_menu_items_category ON public.menu_items(category_id);

-- ============================================
-- QR Codes Table
-- Social media link QR codes
-- ============================================
CREATE TABLE IF NOT EXISTS public.qr_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    logo_url TEXT,
    template_id TEXT DEFAULT 'modern',
    theme JSONB DEFAULT '{"primaryColor": "#5B6EF2", "backgroundColor": "#FFFFFF"}'::jsonb,
    social_links JSONB DEFAULT '{}'::jsonb,
    slug TEXT UNIQUE,
    is_active BOOLEAN DEFAULT true,
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_qr_codes_user ON public.qr_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_slug ON public.qr_codes(slug);

-- ============================================
-- CV Documents Table
-- Resume/CV documents created by users
-- ============================================
CREATE TABLE IF NOT EXISTS public.cv_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    template_id TEXT DEFAULT 'professional',
    personal_info JSONB DEFAULT '{}'::jsonb,
    experience JSONB DEFAULT '[]'::jsonb,
    education JSONB DEFAULT '[]'::jsonb,
    skills JSONB DEFAULT '[]'::jsonb,
    languages JSONB DEFAULT '[]'::jsonb,
    certifications JSONB DEFAULT '[]'::jsonb,
    projects JSONB DEFAULT '[]'::jsonb,
    summary TEXT,
    is_public BOOLEAN DEFAULT false,
    slug TEXT UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cv_documents_user ON public.cv_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_cv_documents_slug ON public.cv_documents(slug);

-- ============================================
-- Function to create trial on user signup
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_user_trial()
RETURNS TRIGGER AS $$
BEGIN
    -- Create 2-day trial for Menu Maker
    INSERT INTO public.user_trials (user_id, service_slug, expires_at)
    VALUES (NEW.id, 'menu-maker', NOW() + INTERVAL '2 days');
    
    -- Create 2-day trial for QR Generator
    INSERT INTO public.user_trials (user_id, service_slug, expires_at)
    VALUES (NEW.id, 'qr-generator', NOW() + INTERVAL '2 days');
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create trials on profile creation
DROP TRIGGER IF EXISTS on_profile_created_trial ON public.profiles;
CREATE TRIGGER on_profile_created_trial
    AFTER INSERT ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_trial();

-- ============================================
-- Function to generate unique slug
-- ============================================
CREATE OR REPLACE FUNCTION public.generate_unique_slug(base_text TEXT, table_name TEXT)
RETURNS TEXT AS $$
DECLARE
    slug TEXT;
    counter INTEGER := 0;
    slug_exists BOOLEAN;
BEGIN
    -- Create base slug
    slug := lower(regexp_replace(base_text, '[^a-zA-Z0-9]+', '-', 'g'));
    slug := trim(both '-' from slug);
    
    -- Check if exists and add counter if needed
    LOOP
        IF counter > 0 THEN
            slug := slug || '-' || counter::text;
        END IF;
        
        EXECUTE format('SELECT EXISTS(SELECT 1 FROM %I WHERE slug = $1)', table_name)
        INTO slug_exists
        USING slug;
        
        EXIT WHEN NOT slug_exists;
        counter := counter + 1;
    END LOOP;
    
    RETURN slug;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- RLS Policies for new tables
-- ============================================

-- User Trials RLS
ALTER TABLE public.user_trials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own trials"
    ON public.user_trials FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all trials"
    ON public.user_trials FOR ALL
    USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'super_admin'))
    );

-- Menus RLS
ALTER TABLE public.menus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own menus"
    ON public.menus FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view published menus"
    ON public.menus FOR SELECT
    USING (is_published = true);

-- Menu Categories RLS
ALTER TABLE public.menu_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage categories for own menus"
    ON public.menu_categories FOR ALL
    USING (
        EXISTS (SELECT 1 FROM public.menus WHERE id = menu_id AND user_id = auth.uid())
    );

CREATE POLICY "Anyone can view categories of published menus"
    ON public.menu_categories FOR SELECT
    USING (
        EXISTS (SELECT 1 FROM public.menus WHERE id = menu_id AND is_published = true)
    );

-- Menu Items RLS
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage items for own menus"
    ON public.menu_items FOR ALL
    USING (
        EXISTS (SELECT 1 FROM public.menus WHERE id = menu_id AND user_id = auth.uid())
    );

CREATE POLICY "Anyone can view items of published menus"
    ON public.menu_items FOR SELECT
    USING (
        EXISTS (SELECT 1 FROM public.menus WHERE id = menu_id AND is_published = true)
    );

-- QR Codes RLS
ALTER TABLE public.qr_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own QR codes"
    ON public.qr_codes FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view active QR codes"
    ON public.qr_codes FOR SELECT
    USING (is_active = true);

-- CV Documents RLS
ALTER TABLE public.cv_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own CVs"
    ON public.cv_documents FOR ALL
    USING (auth.uid() = user_id);

CREATE POLICY "Anyone can view public CVs"
    ON public.cv_documents FOR SELECT
    USING (is_public = true);
