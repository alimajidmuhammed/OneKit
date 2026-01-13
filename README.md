# OneKit - Multi-Service Web Platform

A professional multi-service web platform built with Next.js 14 and Supabase, featuring secure authentication, role-based access control, and service-based subscriptions.

## 🚀 Features

- **Professional Homepage** - Modern, branded landing page with service cards
- **Secure Authentication** - Email/password auth with Supabase
- **Role-Based Access Control** - Admin, Super Admin, and User roles
- **Service Subscriptions** - Per-service subscription management
- **Admin Dashboard** - Manage users, subscriptions, and payments
- **Manual Payments** - WhatsApp-based payment proof submission
- **Modular Architecture** - Ready for future payment gateway integration

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Styling | Custom CSS with design tokens |
| Auth/Backend | Supabase (PostgreSQL, Auth, RLS) |
| Deployment | Vercel-ready |

## 📦 Available Services

1. **CV Maker** - Professional resume builder
2. **Menu Maker** - Restaurant menu designer
3. **QR Generator** - Dynamic QR code creation
4. **Invoice Maker** - Professional invoice management
5. **Logo Maker** - Brand logo designer
6. **Business Card Maker** - Professional business cards

## 🏁 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up Supabase:**
   - Create a new project at [supabase.com](https://supabase.com)
   - Go to SQL Editor and run the following files in order:
     1. `supabase/schema.sql` - Creates tables and functions
     2. `supabase/policies.sql` - Sets up Row Level Security
     3. `supabase/seed.sql` - Adds initial services and permissions

3. **Configure environment variables:**
   
   Create a `.env.local` file in the project root:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   
   # Optional
   NEXT_PUBLIC_WHATSAPP_NUMBER=+964XXXXXXXXXX
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)**

### Creating Your First Admin User

1. Register a new account through the app
2. In Supabase Dashboard, go to **Table Editor** → **profiles**
3. Find your user and change the `role` to `super_admin`
4. Refresh the app and access `/admin`

## 📁 Project Structure

```
OneKit/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── (auth)/             # Auth pages (login, register, etc.)
│   │   ├── (dashboard)/        # User dashboard pages
│   │   ├── admin/              # Admin panel pages
│   │   ├── globals.css         # Design system & utilities
│   │   ├── layout.js           # Root layout with AuthProvider
│   │   └── page.js             # Homepage
│   ├── components/
│   │   ├── auth/               # Auth components & context
│   │   ├── layout/             # Header, Footer, Sidebar
│   │   └── services/           # Service card components
│   ├── lib/
│   │   ├── hooks/              # Custom React hooks
│   │   ├── supabase/           # Supabase client config
│   │   └── utils/              # Constants & helpers
│   └── styles/
│       └── components.css      # Component styles
├── supabase/
│   ├── schema.sql              # Database schema
│   ├── policies.sql            # RLS policies
│   └── seed.sql                # Initial data
└── public/                     # Static assets
```

## 🔐 Security Features

- **Row Level Security (RLS)** - Database-level access control
- **Protected Routes** - Middleware-based route protection
- **Role-Based Access** - Admin, Super Admin, User roles
- **Session Management** - Secure cookie-based sessions
- **Audit Logging** - Track admin actions

## 💳 Payment Flow (Phase 1)

1. User selects a service and plan
2. User sends payment via WhatsApp
3. User uploads payment proof
4. Admin reviews and approves/rejects
5. Subscription is activated upon approval

## 🔄 Future Enhancements

- [ ] FIB payment integration
- [ ] FastPay integration
- [ ] ZainCash integration
- [ ] Automated subscription renewals
- [ ] Email notifications
- [ ] Analytics dashboard

## 📝 Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 🎨 Design System

The project uses a comprehensive CSS custom properties system:

- **Colors**: Primary (purple/blue), Accent (orange), Semantic colors
- **Typography**: Inter font family with size/weight tokens
- **Spacing**: Consistent spacing scale (space-1 to space-24)
- **Shadows**: Multiple depth levels + glow effects
- **Dark Mode**: Ready for dark theme implementation

## 📄 License

This project is private and proprietary.

---

Built with ❤️ using Next.js, Supabase, and modern web technologies.
