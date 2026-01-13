-- Add missing columns to qr_codes table for QR Generator features
ALTER TABLE public.qr_codes
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS links JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS button_style TEXT DEFAULT 'filled';

-- Update existing records to have default values
UPDATE public.qr_codes
SET 
    display_name = COALESCE(display_name, name),
    bio = COALESCE(bio, ''),
    links = COALESCE(links, '[]'::jsonb),
    button_style = COALESCE(button_style, 'filled')
WHERE display_name IS NULL OR bio IS NULL OR links IS NULL OR button_style IS NULL;
