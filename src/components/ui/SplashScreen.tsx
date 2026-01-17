// @ts-nocheck
'use client';

import { useState, useEffect } from 'react';

/**
 * SplashScreen - Migrated to Tailwind CSS for Phase 2b
 * High-end entrance animation with brand-gradient progress bar.
 */
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
        <div className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center overflow-hidden transition-opacity duration-700 ease-in-out bg-[radial-gradient(circle_at_center,#0a0a0a_0%,#000000_100%)] ${progress === 100 ? 'opacity-0 pointer-events-none' : 'opacity-100'
            }`}>
            {/* Background Decorative Elements */}
            <div className="absolute -top-[10%] -right-[10%] w-[40%] h-[40%] bg-[radial-gradient(circle,rgba(10,36,114,0.15)_0%,transparent_70%)] blur-[60px] animate-float-orb"></div>
            <div className="absolute -bottom-[10%] -left-[10%] w-[30%] h-[30%] bg-[radial-gradient(circle,rgba(20,184,166,0.1)_0%,transparent_70%)] blur-[60px] animate-float-orb-reverse"></div>

            <div className="relative flex flex-col items-center gap-5 z-20">
                <div className="absolute w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(20,184,166,0.2)_0%,transparent_70%)] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 blur-[40px] animate-pulse-glow"></div>

                <h1 className="font-display text-5xl md:text-6xl font-extrabold text-white tracking-tighter opacity-90 animate-logo-pop">
                    One<span className="bg-brand-gradient bg-clip-text text-transparent">Kit</span>
                </h1>

                <div className="mt-10 flex flex-col items-center gap-3">
                    <div className="w-[200px] h-[2px] bg-white/5 rounded-full overflow-hidden relative">
                        <div
                            className="h-full bg-gradient-to-r from-primary-900 via-accent-500 to-primary-900 bg-[length:200%_100%] transition-all duration-300 shadow-[0_0_10px_rgba(20,184,166,0.5)] animate-shimmer"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                    <div className="text-[12px] font-bold text-white/40 font-mono tracking-wider">{progress}%</div>
                </div>
            </div>

            <div className="absolute bottom-[60px] flex flex-col items-center gap-3">
                <div className="w-10 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
                <span className="font-display text-[10px] font-bold text-white/30 tracking-[0.3em] uppercase">
                    PERFECTION IN EVERY DETAIL
                </span>
            </div>
        </div>
    );
}
