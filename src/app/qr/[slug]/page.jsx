import { notFound } from 'next/navigation';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import styles from './qr-page.module.css';

// Preset Icons (same as editor)
const PRESET_ICONS = {
    instagram: { name: 'Instagram', color: '#E4405F' },
    facebook: { name: 'Facebook', color: '#1877F2' },
    whatsapp: { name: 'WhatsApp', color: '#25D366' },
    telegram: { name: 'Telegram', color: '#26A5E4' },
    youtube: { name: 'YouTube', color: '#FF0000' },
    tiktok: { name: 'TikTok', color: '#000000' },
    twitter: { name: 'X (Twitter)', color: '#000000' },
    linkedin: { name: 'LinkedIn', color: '#0A66C2' },
    snapchat: { name: 'Snapchat', color: '#FFFC00' },
    spotify: { name: 'Spotify', color: '#1DB954' },
    email: { name: 'Email', color: '#EA4335' },
    phone: { name: 'Phone', color: '#34B7F1' },
    website: { name: 'Website', color: '#5B6EF2' },
    googlemaps: { name: 'Google Maps', color: '#EA4335' },
    github: { name: 'GitHub', color: '#181717' },
    discord: { name: 'Discord', color: '#5865F2' },
    pinterest: { name: 'Pinterest', color: '#BD081C' },
    custom: { name: 'Custom', color: '#6B7280' },
};

async function getQRCode(slug) {
    const cookieStore = await cookies();

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
            },
        }
    );

    const { data: qr } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('slug', slug)
        .eq('is_active', true)
        .single();

    if (!qr) return null;

    // Increment view count
    await supabase
        .from('qr_codes')
        .update({ view_count: (qr.view_count || 0) + 1 })
        .eq('id', qr.id);

    // Track page visit for analytics
    await supabase
        .from('page_visits')
        .insert({
            service_type: 'qr',
            page_slug: slug,
        });

    return qr;

}

export async function generateMetadata({ params }) {
    const { slug } = await params;
    const qr = await getQRCode(slug);

    if (!qr) {
        return { title: 'Link Not Found' };
    }

    return {
        title: `${qr.display_name || qr.name} - Links`,
        description: qr.bio || `Connect with ${qr.display_name || qr.name}`,
    };
}

export default async function QRLandingPage({ params }) {
    const { slug } = await params;
    const qr = await getQRCode(slug);

    if (!qr) {
        notFound();
    }

    // Get links
    const links = (qr.links || []).filter(link => link.title && link.url);

    const themeColors = qr.theme || { primaryColor: '#667eea', secondaryColor: '#764ba2', textColor: '#ffffff' };
    const buttonStyle = qr.button_style || 'filled';

    // Determine background style
    const bgStyle = `linear-gradient(135deg, ${themeColors.primaryColor}, ${themeColors.secondaryColor})`;

    return (
        <div
            className={styles.page}
            style={{
                '--bg': bgStyle,
                '--text': themeColors.textColor || '#ffffff',
                '--primary': themeColors.primaryColor,
            }}
        >
            <div className={styles.container}>
                {/* Profile */}
                <div className={styles.profile}>
                    {qr.logo_url ? (
                        <div className={styles.avatar}>
                            <img
                                src={qr.logo_url}
                                alt={qr.display_name || qr.name}
                                style={{
                                    transform: `scale(${qr.theme?.logo_settings?.zoom || 1}) translate(${qr.theme?.logo_settings?.x || 0}%, ${qr.theme?.logo_settings?.y || 0}%)`,
                                    transition: 'transform 0.1s ease-out',
                                    objectFit: 'cover'
                                }}
                            />
                        </div>
                    ) : (
                        <div className={styles.avatarPlaceholder}>
                            {(qr.display_name || qr.name || 'A').charAt(0).toUpperCase()}
                        </div>
                    )}
                    <h1 className={styles.name}>{qr.display_name || qr.name}</h1>
                    {qr.bio && <p className={styles.bio}>{qr.bio}</p>}
                </div>

                {/* Links */}
                <div className={styles.links}>
                    {links.map((link, i) => (
                        <a
                            key={link.id || i}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`${styles.linkCard} ${styles[buttonStyle]}`}
                            style={{ animationDelay: `${i * 0.08}s` }}
                        >
                            {/* Icon */}
                            <span
                                className={styles.linkIcon}
                                style={{ background: PRESET_ICONS[link.icon]?.color || '#6B7280' }}
                            >
                                {link.customIcon ? (
                                    <img src={link.customIcon} alt="" />
                                ) : (
                                    <span className={styles.iconText}>{PRESET_ICONS[link.icon]?.name?.charAt(0) || '🔗'}</span>
                                )}
                            </span>
                            <span className={styles.linkTitle}>{link.title}</span>
                            <svg viewBox="0 0 24 24" fill="none" className={styles.arrow}>
                                <path d="M9 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                            </svg>
                        </a>
                    ))}

                    {links.length === 0 && (
                        <div className={styles.empty}>
                            <p>No links available yet.</p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <footer className={styles.footer}>
                    <p>Powered by <strong>OneKit</strong></p>
                </footer>
            </div>
        </div>
    );
}
