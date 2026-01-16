-- Fix RLS Policies for Create Operations
-- Run this in your Supabase SQL Editor to allow authenticated users to create documents

-- ============================================
-- CV Documents Table
-- ============================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can insert their own CV documents" ON cv_documents;
DROP POLICY IF EXISTS "Users can view their own CV documents" ON cv_documents;
DROP POLICY IF EXISTS "Users can update their own CV documents" ON cv_documents;
DROP POLICY IF EXISTS "Users can delete their own CV documents" ON cv_documents;

-- Enable RLS
ALTER TABLE cv_documents ENABLE ROW LEVEL SECURITY;

-- Create new policies
CREATE POLICY "Users can insert their own CV documents"
ON cv_documents FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own CV documents"
ON cv_documents FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own CV documents"
ON cv_documents FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own CV documents"
ON cv_documents FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================
-- Menus Table
-- ============================================

DROP POLICY IF EXISTS "Users can insert their own menus" ON menus;
DROP POLICY IF EXISTS "Users can view their own menus" ON menus;
DROP POLICY IF EXISTS "Users can update their own menus" ON menus;
DROP POLICY IF EXISTS "Users can delete their own menus" ON menus;
DROP POLICY IF EXISTS "Public can view published menus" ON menus;

ALTER TABLE menus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own menus"
ON menus FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own menus"
ON menus FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Public can view published menus"
ON menus FOR SELECT
TO anon, authenticated
USING (is_published = true);

CREATE POLICY "Users can update their own menus"
ON menus FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own menus"
ON menus FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================
-- QR Codes Table
-- ============================================

DROP POLICY IF EXISTS "Users can insert their own QR codes" ON qr_codes;
DROP POLICY IF EXISTS "Users can view their own QR codes" ON qr_codes;
DROP POLICY IF EXISTS "Users can update their own QR codes" ON qr_codes;
DROP POLICY IF EXISTS "Users can delete their own QR codes" ON qr_codes;
DROP POLICY IF EXISTS "Public can view published QR codes" ON qr_codes;

ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own QR codes"
ON qr_codes FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own QR codes"
ON qr_codes FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Public can view published QR codes"
ON qr_codes FOR SELECT
TO anon, authenticated
USING (is_active = true);

CREATE POLICY "Users can update their own QR codes"
ON qr_codes FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own QR codes"
ON qr_codes FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================
-- Invoices Table
-- ============================================

DROP POLICY IF EXISTS "Users can insert their own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can view their own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can update their own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can delete their own invoices" ON invoices;

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own invoices"
ON invoices FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own invoices"
ON invoices FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own invoices"
ON invoices FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own invoices"
ON invoices FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================
-- Business Cards Table
-- ============================================

DROP POLICY IF EXISTS "Users can insert their own business cards" ON business_cards;
DROP POLICY IF EXISTS "Users can view their own business cards" ON business_cards;
DROP POLICY IF EXISTS "Users can update their own business cards" ON business_cards;
DROP POLICY IF EXISTS "Users can delete their own business cards" ON business_cards;

ALTER TABLE business_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own business cards"
ON business_cards FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own business cards"
ON business_cards FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own business cards"
ON business_cards FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own business cards"
ON business_cards FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
