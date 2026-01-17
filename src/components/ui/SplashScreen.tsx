// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';
import styles from './SplashScreen.module.css';

export default function SplashScreen() {
    const [progress, setProgress] = useState(0);
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setProgress((prev) => {
                if (prev >= 100) {
                    clearInterval(interval);
                    setTimeout(() => setIsVisible(false), 500);
                    return 100;
                }
                return prev + 2;
            });
        }, 30);

        return () => clearInterval(interval);
    }, []);

    if (!isVisible) return null;

    return (
        <div className={`${styles.splashContainer} ${progress === 100 ? styles.fadeOut : ''}`}>
            {/* Background Decorative Elements */}
            <div className={styles.decorativeLight1}></div>
            <div className={styles.decorativeLight2}></div>

            <div className={styles.logoWrapper}>
                <div className={styles.logoGlow}></div>
                <h1 className={styles.logoText}>One<span>Kit</span></h1>

                <div className={styles.loadingInfo}>
                    <div className={styles.progressContainer}>
                        <div
                            className={styles.progressBar}
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <div className={styles.progressText}>{progress}%</div>
                </div>
            </div>

            <div className={styles.footerBranding}>
                <div className={styles.brandLine}></div>
                <span>PERFECTION IN EVERY DETAIL</span>
            </div>
        </div>
    );
}
