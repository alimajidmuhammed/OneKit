import Link from 'next/link';
import ServerAuthHeader from '@/components/layout/ServerAuthHeader';
import Footer from '@/components/layout/Footer';
import ServicesSection from '@/components/services/ServicesSection';
import { APP_CONFIG } from '@/lib/utils/constants';
import { getWhatsAppLink } from '@/lib/utils/helpers';
import styles from './page.module.css';

export default function HomePage() {
  return (
    <>
      <ServerAuthHeader />

      <main className={styles.main}>
        {/* Light Mode Professional Hero */}
        <section className={styles.heroLight}>
          <div className={styles.heroSoftGlow1}></div>
          <div className={styles.heroSoftGlow2}></div>
          <div className={styles.container}>
            <div className={styles.heroContent}>
              <h1 className={styles.heroTitle}>
                Craft Your Professional <span className={styles.gradientText}>Identity.</span>
              </h1>
              <p className={styles.heroSubtitle}>
                The premium all-in-one suite for Iraqi professionals. Build high-end CVs, Menus, and Invoices with a platform designed for perfection.
              </p>
              <div className={styles.heroActions}>
                <Link href="/register" className={styles.heroPrimaryBtn}>
                  Get Started Free
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M5 12h14m-7-7l7 7-7 7" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </Link>
                <a href="#services" className={styles.heroSecondaryBtn}>Explore Services</a>
              </div>
            </div>
            <div className={styles.heroVisualLight}>
              <div className={styles.mainMockup}>
                <img src="/images/platform-showcase.png" alt="OneKit Platform Showcase" />
                <div className={styles.mockupShadow}></div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Section */}
        <ServicesSection />

        {/* Professionals Section - Light Refined */}
        <section className={styles.professionalsLight}>
          <div className={styles.container}>
            <div className={styles.sectionHeaderCentered}>
              <h2 className={styles.titlePremium}>Engineered for Professionals</h2>
              <p className={styles.subtitlePremium}>Sophisticated tools tailored for the Iraqi business ecosystem.</p>
            </div>
            <div className={styles.expertGrid}>
              <div className={styles.expertCard}>
                <div className={styles.iconCircle}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3>Enterprise Quality</h3>
                <p>High-resolution outputs that command respect from clients and employers.</p>
              </div>
              <div className={styles.expertCard}>
                <div className={styles.iconCircle}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3>Max Efficiency</h3>
                <p>Eliminate repetitive tasks with our high-speed automated editor engine.</p>
              </div>
              <div className={styles.expertCard}>
                <div className={styles.iconCircle}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="9" cy="7" r="4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3>24/7 Support</h3>
                <p>Localized help whenever you need it via WhatsApp and live chat.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className={styles.pricing}>
          <div className={styles.container}>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionLabel}>Pricing</span>
              <h2 className={styles.sectionTitle}>Simple, Per-Service Pricing</h2>
              <p className={styles.sectionDescription}>
                Pay only for what you need. One-time yearly subscriptions with no hidden fees.
              </p>
            </div>

            <div className={styles.pricingGrid}>
              {/* Free Forever Group */}
              <div className={styles.pricingGroup}>
                <h3 className={styles.groupTitle}>Free Forever</h3>
                <div className={styles.groupGrid}>
                  <Link href="/services/cv-maker" className={styles.pricingCardMinimal}>
                    <div className={styles.minimalHeader}>
                      <h4>CV Maker</h4>
                      <span className={styles.freeBadge}>FREE</span>
                    </div>
                    <p>Professional templates for your career.</p>
                  </Link>
                  <Link href="/services/invoice-maker" className={styles.pricingCardMinimal}>
                    <div className={styles.minimalHeader}>
                      <h4>Invoice Maker</h4>
                      <span className={styles.freeBadge}>FREE</span>
                    </div>
                    <p>Expert billing for small businesses.</p>
                  </Link>
                </div>
              </div>

              {/* Premium Tools Group */}
              <div className={styles.pricingGroup}>
                <h3 className={styles.groupTitle}>Premium Tools</h3>
                <div className={styles.groupGrid}>
                  <Link href="/services/menu-maker" className={styles.pricingCardPremium}>
                    <div className={styles.premiumHeader}>
                      <div className={styles.premiumTitle}>
                        <h4>Menu Maker</h4>
                        <span className={styles.popularBadge}>Most Popular</span>
                      </div>
                      <div className={styles.premiumPrice}>
                        <span className={styles.priceAmount}>25,000</span>
                        <span className={styles.pricePeriod}>/ Year</span>
                        <span className={styles.priceCurrency}>IQD</span>
                      </div>
                    </div>
                    <ul className={styles.premiumFeatures}>
                      <li>Unlimited Digital Menus</li>
                      <li>QR Code Integration</li>
                      <li>Multi-language Support</li>
                    </ul>
                    <div className={styles.premiumBtn}>Select Menu Maker</div>
                  </Link>

                  <Link href="/services/qr-generator" className={styles.pricingCardPremium}>
                    <div className={styles.premiumHeader}>
                      <div className={styles.premiumTitle}>
                        <h4>QR Generator</h4>
                      </div>
                      <div className={styles.premiumPrice}>
                        <span className={styles.priceAmount}>10,000</span>
                        <span className={styles.pricePeriod}>/ Year</span>
                        <span className={styles.priceCurrency}>IQD</span>
                      </div>
                    </div>
                    <ul className={styles.premiumFeatures}>
                      <li>Dynamic QR Tracking</li>
                      <li>Scan Analytics Dashboard</li>
                      <li>Custom Branding & Colors</li>
                    </ul>
                    <div className={styles.premiumBtnSecondary}>Select QR Generator</div>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section id="contact" className={styles.cta}>
          <div className={styles.container}>
            <div className={styles.ctaContent}>
              <h2>Ready to Get Started?</h2>
              <p>Join thousands of professionals using OneKit to create amazing things.</p>
              <div className={styles.ctaActions}>
                <a href="/register" className={styles.ctaPrimaryBtn}>
                  Create Free Account
                </a>
                <a
                  href={getWhatsAppLink(APP_CONFIG.whatsapp.number, APP_CONFIG.whatsapp.defaultMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.ctaSecondaryBtn}
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                  Contact on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
