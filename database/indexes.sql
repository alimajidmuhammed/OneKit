-- OneKit Performance Optimization: Database Indexes
-- Apply these indexes to improve query performance

-- ============================================
-- Menu Performance Indexes
-- ============================================

-- Index for slug lookup (most common public query)
CREATE INDEX IF NOT EXISTS idx_menus_slug 
ON menus(slug) 
WHERE is_published = true;

-- Index for user's menus listing
CREATE INDEX IF NOT EXISTS idx_menus_user_published 
ON menus(user_id, is_published);

-- Index for menu categories lookup
CREATE INDEX IF NOT EXISTS idx_menu_categories_menu_id 
ON menu_categories(menu_id, sort_order) 
WHERE is_visible = true;

-- Index for menu items by menu
CREATE INDEX IF NOT EXISTS idx_menu_items_menu_id 
ON menu_items(menu_id, sort_order) 
WHERE is_available = true;

-- Index for menu items by category
CREATE INDEX IF NOT EXISTS idx_menu_items_category_id 
ON menu_items(category_id, sort_order) 
WHERE is_available = true;

-- ============================================
-- Auth & User Performance Indexes
-- ============================================

-- Index for profile lookups (profiles table uses 'id' as primary key)
CREATE INDEX IF NOT EXISTS idx_profiles_id 
ON profiles(id);

-- Index for active subscriptions
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_active 
ON subscriptions(user_id, status) 
WHERE status = 'active';

-- ============================================
-- QR Codes Performance Indexes
-- ============================================

-- Index for QR slug lookup
CREATE INDEX IF NOT EXISTS idx_qr_codes_slug 
ON qr_codes(slug) 
WHERE is_active = true;

-- Index for user's QR codes
CREATE INDEX IF NOT EXISTS idx_qr_codes_user_id 
ON qr_codes(user_id, is_active);

-- ============================================
-- CV Maker Performance Indexes
-- ============================================

-- Index for user's CVs
CREATE INDEX IF NOT EXISTS idx_cvs_user_id 
ON cvs(user_id);

-- ============================================
-- Analytics Performance Indexes
-- ============================================

-- Index for page visits analytics
CREATE INDEX IF NOT EXISTS idx_page_visits_service_type 
ON page_visits(service_type, visited_at DESC);

-- Index for page visits by slug
CREATE INDEX IF NOT EXISTS idx_page_visits_page_slug 
ON page_visits(page_slug, visited_at DESC);

-- ============================================
-- Apply All Indexes
-- ============================================

-- Run this script in your Supabase SQL Editor
-- Indexes are created with IF NOT EXISTS, so it's safe to run multiple times

-- Expected improvements:
-- - Menu page load: 40-60% faster
-- - Dashboard queries: 30-50% faster
-- - Admin analytics: 60-80% faster
