// @ts-nocheck
'use client';

import { useState, useRef, useEffect } from 'react';
import styles from './photo-studio.module.css';

const FILTERS = [
    { id: 'none', name: 'Original', filter: '' },
    { id: 'vibrant', name: 'Vibrant', filter: 'saturate(1.5) contrast(1.1)' },
    { id: 'warm', name: 'Warm', filter: 'sepia(0.2) saturate(1.2) hue-rotate(-10deg)' },
    { id: 'cool', name: 'Cool', filter: 'saturate(1.1) hue-rotate(10deg) brightness(1.1)' },
    { id: 'b&w', name: 'Black & White', filter: 'grayscale(1) contrast(1.2)' },
    { id: 'fade', name: 'Fade', filter: 'brightness(1.1) contrast(0.9) saturate(0.8)' },
];

export default function PhotoStudio({ imageUrl, onSave, onClose }) {
    const [activeSection, setActiveSection] = useState('adjust');
    const [settings, setSettings] = useState({
        brightness: 100,
        contrast: 100,
        saturation: 100,
        blur: 0,
        activeFilter: 'none',
        rotate: 0,
        zoom: 1,
        x: 0,
        y: 0
    });

    const [loading, setLoading] = useState(false);
    const canvasRef = useRef(null);
    const imageRef = useRef(null);

    const handleReset = () => {
        setSettings({
            brightness: 100,
            contrast: 100,
            saturation: 100,
            blur: 0,
            activeFilter: 'none',
            rotate: 0,
            zoom: 1,
            x: 0,
            y: 0
        });
    };

    const getFilterString = () => {
        const baseFilter = FILTERS.find(f => f.id === settings.activeFilter)?.filter || '';
        return `${baseFilter} brightness(${settings.brightness}%) contrast(${settings.contrast}%) saturate(${settings.saturation}%) blur(${settings.blur}px)`.trim();
    };

    const handleSave = async () => {
        if (!imageRef.current) return;
        setLoading(true);

        try {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const img = imageRef.current;

            // Set canvas size to image size
            // Note: For zoom/crop, we keep the original aspect ratio but 
            // the canvas content will represent the zoomed/moved portion.
            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;

            // Apply filters
            ctx.filter = getFilterString();

            // Clear and apply transformations
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();

            // 1. Move to center to rotate/zoom around center
            ctx.translate(canvas.width / 2, canvas.height / 2);

            // 2. Rotate
            ctx.rotate((settings.rotate * Math.PI) / 180);

            // 3. Zoom
            ctx.scale(settings.zoom, settings.zoom);

            // 4. Translate by offset (adjusted for zoom)
            ctx.translate(settings.x, settings.y);

            // 5. Draw image centered
            ctx.drawImage(img, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);

            ctx.restore();

            canvas.toBlob((blob) => {
                const file = new File([blob], 'edited-image.png', { type: 'image/png' });
                onSave(file);
                setLoading(false);
            }, 'image/png', 0.9);
        } catch (error) {
            console.error('Failed to process image:', error);
            alert('Failed to save edited image.');
            setLoading(false);
        }
    };

    const handleAIEnhance = () => {
        // Simulated AI Enhancement
        setSettings(prev => ({
            ...prev,
            brightness: 105,
            contrast: 110,
            saturation: 120,
            activeFilter: 'vibrant'
        }));
    };

    return (
        <div className={styles.studioOverlay} onClick={onClose}>
            <div className={styles.studioContainer} onClick={e => e.stopPropagation()}>
                {/* Header */}
                <header className={styles.studioHeader}>
                    <h2>
                        <svg viewBox="0 0 24 24" fill="none" width="20" height="20">
                            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="currentColor" strokeWidth="2" />
                            <circle cx="12" cy="11" r="3" stroke="currentColor" strokeWidth="2" />
                        </svg>
                        Advanced Photo Studio
                    </h2>
                    <button className={styles.closeBtn} onClick={onClose}>×</button>
                </header>

                {/* Main */}
                <main className={styles.studioMain}>
                    <div className={styles.canvasArea}>
                        <div className={styles.previewContainer}>
                            <img
                                ref={imageRef}
                                src={imageUrl}
                                alt="Preview"
                                className={styles.previewImage}
                                style={{
                                    filter: getFilterString(),
                                    transform: `translate(${settings.x}px, ${settings.y}px) rotate(${settings.rotate}deg) scale(${settings.zoom})`
                                }}
                                crossOrigin="anonymous"
                            />
                        </div>
                        <canvas ref={canvasRef} style={{ display: 'none' }} />
                    </div>

                    <aside className={styles.studioSidebar}>
                        <div className={styles.sidebarTabs}>
                            <button
                                className={activeSection === 'adjust' ? styles.tabActive : ''}
                                onClick={() => setActiveSection('adjust')}
                            >
                                Adjust
                            </button>
                            <button
                                className={activeSection === 'transform' ? styles.tabActive : ''}
                                onClick={() => setActiveSection('transform')}
                            >
                                Transform
                            </button>
                        </div>

                        {activeSection === 'adjust' ? (
                            <>
                                <div className={`${styles.sidebarSection} ${styles.aiSection}`}>
                                    <h3>AI Magic</h3>
                                    <button className={styles.aiBtn} onClick={handleAIEnhance}>
                                        <svg viewBox="0 0 24 24" fill="none">
                                            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                            <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z" stroke="currentColor" strokeWidth="2" />
                                        </svg>
                                        AI Enhance
                                    </button>
                                </div>

                                <div className={styles.sidebarSection}>
                                    <h3>Adjustments</h3>

                                    <div className={styles.controlGroup}>
                                        <label>
                                            <span>Brightness</span>
                                            <span>{settings.brightness}%</span>
                                        </label>
                                        <input
                                            type="range"
                                            min="0" max="200"
                                            value={settings.brightness}
                                            onChange={e => setSettings({ ...settings, brightness: e.target.value })}
                                        />
                                    </div>

                                    <div className={styles.controlGroup}>
                                        <label>
                                            <span>Contrast</span>
                                            <span>{settings.contrast}%</span>
                                        </label>
                                        <input
                                            type="range"
                                            min="0" max="200"
                                            value={settings.contrast}
                                            onChange={e => setSettings({ ...settings, contrast: e.target.value })}
                                        />
                                    </div>

                                    <div className={styles.controlGroup}>
                                        <label>
                                            <span>Saturation</span>
                                            <span>{settings.saturation}%</span>
                                        </label>
                                        <input
                                            type="range"
                                            min="0" max="200"
                                            value={settings.saturation}
                                            onChange={e => setSettings({ ...settings, saturation: e.target.value })}
                                        />
                                    </div>

                                    <div className={styles.controlGroup}>
                                        <label>
                                            <span>Background Blur</span>
                                            <span>{settings.blur}px</span>
                                        </label>
                                        <input
                                            type="range"
                                            min="0" max="20"
                                            value={settings.blur}
                                            onChange={e => setSettings({ ...settings, blur: e.target.value })}
                                        />
                                    </div>
                                </div>

                                <div className={styles.sidebarSection}>
                                    <h3>Creative Filters</h3>
                                    <div className={styles.filterGrid}>
                                        {FILTERS.map(f => (
                                            <button
                                                key={f.id}
                                                className={`${styles.filterBtn} ${settings.activeFilter === f.id ? styles.filterActive : ''}`}
                                                onClick={() => setSettings({ ...settings, activeFilter: f.id })}
                                            >
                                                <div className={styles.filterPreview} style={{ filter: f.filter }}></div>
                                                <span>{f.name}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className={styles.sidebarSection}>
                                <h3>Transforms</h3>

                                <div className={styles.controlGroup}>
                                    <label>
                                        <span>Rotation</span>
                                        <span>{settings.rotate}°</span>
                                    </label>
                                    <input
                                        type="range"
                                        min="-180" max="180"
                                        value={settings.rotate}
                                        onChange={e => setSettings({ ...settings, rotate: e.target.value })}
                                    />
                                </div>

                                <div className={styles.controlGroup}>
                                    <label>
                                        <span>Zoom</span>
                                        <span>{parseFloat(settings.zoom).toFixed(1)}x</span>
                                    </label>
                                    <input
                                        type="range"
                                        min="0.5" max="3" step="0.1"
                                        value={settings.zoom}
                                        onChange={e => setSettings({ ...settings, zoom: e.target.value })}
                                    />
                                </div>

                                <div className={styles.controlGroup}>
                                    <label>
                                        <span>Move Horizontal</span>
                                        <span>{settings.x}px</span>
                                    </label>
                                    <input
                                        type="range"
                                        min="-200" max="200"
                                        value={settings.x}
                                        onChange={e => setSettings({ ...settings, x: parseInt(e.target.value) })}
                                    />
                                </div>

                                <div className={styles.controlGroup}>
                                    <label>
                                        <span>Move Vertical</span>
                                        <span>{settings.y}px</span>
                                    </label>
                                    <input
                                        type="range"
                                        min="-200" max="200"
                                        value={settings.y}
                                        onChange={e => setSettings({ ...settings, y: parseInt(e.target.value) })}
                                    />
                                </div>

                                <button
                                    className={styles.resetBtn}
                                    onClick={() => setSettings({ ...settings, rotate: 0, zoom: 1, x: 0, y: 0 })}
                                >
                                    Reset Transforms
                                </button>
                            </div>
                        )}
                    </aside>
                </main>

                {/* Footer */}
                <footer className={styles.studioFooter}>
                    <button className={styles.cancelBtn} onClick={onClose} disabled={loading}>
                        Cancel
                    </button>
                    <button className={styles.saveBtn} onClick={handleSave} disabled={loading}>
                        {loading ? 'Processing...' : 'Apply Changes'}
                    </button>
                </footer>
            </div>
        </div>
    );
}
