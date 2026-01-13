# OneKit Environment Variables

Copy this file to `.env.local` and fill in your values:

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

# WhatsApp Configuration
NEXT_PUBLIC_WHATSAPP_NUMBER=+964XXXXXXXXXX
NEXT_PUBLIC_WHATSAPP_MESSAGE=Hello! I want to subscribe to OneKit services.

# App Configuration
NEXT_PUBLIC_APP_NAME=OneKit
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Cloudflare R2 Storage (Server-side only - no NEXT_PUBLIC_ prefix)
R2_ACCOUNT_ID=your-cloudflare-account-id
R2_ACCESS_KEY_ID=your-r2-access-key-id
R2_SECRET_ACCESS_KEY=your-r2-secret-access-key
R2_BUCKET_NAME=onekit-assets
R2_PUBLIC_URL=https://your-bucket.your-account-id.r2.dev
```

## Cloudflare R2 Setup Instructions

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com) → R2
2. Create a new bucket (e.g., `onekit-assets`)
3. Enable public access:
   - Go to bucket Settings → Public access
   - Enable "Allow Access"
   - Copy the public URL (e.g., `https://pub-xxx.r2.dev`)
4. Create API credentials:
   - Go to R2 → Overview → Manage R2 API tokens
   - Create a new API token with "Object Read & Write" permissions
   - Copy the Access Key ID and Secret Access Key
5. Add all values to your `.env.local` file
