-- Seed default services from OneKit constants
-- Run this in Supabase SQL Editor to populate the services table

INSERT INTO public.services (name, slug, description, price_monthly, price_yearly, is_active, features)
VALUES 
    ('CV Maker', 'cv-maker', 'Create professional resumes and CVs with modern templates', 0, 0, true, 
     '["Multiple professional templates", "Export to PDF", "Custom sections", "Real-time preview", "ATS-friendly formats"]'::jsonb),
    
    ('Menu Maker', 'menu-maker', 'Design beautiful restaurant and cafe menus', 15000, 150000, true,
     '["Restaurant menu templates", "Category organization", "Price formatting", "QR code export", "Multi-language support"]'::jsonb),
    
    ('QR Generator', 'qr-generator', 'Generate dynamic QR codes for any purpose', 15000, 150000, true,
     '["URL QR codes", "vCard contacts", "WiFi access", "Custom styling", "Analytics tracking"]'::jsonb),
    
    ('Invoice Maker', 'invoice-maker', 'Create and manage professional invoices', 15000, 150000, false,
     '["Professional templates", "Client management", "Tax calculations", "PDF export", "Payment tracking"]'::jsonb),
    
    ('Logo Maker', 'logo-maker', 'Design stunning logos for your brand', 15000, 150000, false,
     '["Icon library", "Font pairings", "Color palettes", "Multiple formats", "Brand kit export"]'::jsonb),
    
    ('Business Card Maker', 'card-maker', 'Design professional business cards', 15000, 150000, false,
     '["Double-sided designs", "QR code integration", "Print-ready export", "Modern templates", "Custom sizing"]'::jsonb)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    price_monthly = EXCLUDED.price_monthly,
    price_yearly = EXCLUDED.price_yearly,
    features = EXCLUDED.features;
