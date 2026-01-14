import '@/app/globals.css';
import '@/styles/components.css';
import { AuthProvider } from '@/components/auth/AuthProvider';
import SplashScreen from '@/components/ui/SplashScreen';
import { Analytics } from '@vercel/analytics/next';

export const metadata = {
  title: {
    default: 'OneKit - All Your Professional Tools in One Place',
    template: '%s | OneKit',
  },
  description: 'Create professional CVs, menus, QR codes, invoices, and more with OneKit. All-in-one platform for creators and businesses.',
  keywords: ['CV maker', 'menu maker', 'QR code generator', 'invoice maker', 'professional tools', 'online tools'],
  authors: [{ name: 'OneKit' }],
  creator: 'OneKit',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://onekit.app',
    siteName: 'OneKit',
    title: 'OneKit - All Your Professional Tools in One Place',
    description: 'Create professional CVs, menus, QR codes, invoices, and more with OneKit.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'OneKit - Professional Tools Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OneKit - All Your Professional Tools in One Place',
    description: 'Create professional CVs, menus, QR codes, invoices, and more with OneKit.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon-16x16.png',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/site.webmanifest',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#ffffff',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <SplashScreen />
          {children}
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
