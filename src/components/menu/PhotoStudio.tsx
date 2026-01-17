// @ts-nocheck
'use client';

import { useState, useRef, useEffect } from 'react';
import {
    X,
    Shield,
    Wand2,
    Settings2,
    Maximize2,
    RotateCw,
    Undo2,
    Check
} from 'lucide-react';

const FILTERS = [
    { id: 'none', name: 'Original', filter: '' },
    { id: 'vibrant', name: 'Vibrant', filter: 'saturate(1.5) contrast(1.1)' },
    { id: 'warm', name: 'Warm', filter: 'sepia(0.2) saturate(1.2) hue-rotate(-10deg)' },
    { id: 'cool', name: 'Cool', filter: 'saturate(1.1) hue-rotate(10deg) brightness(1.1)' },
    { id: 'b&w', name: 'Black & White', filter: 'grayscale(1) contrast(1.2)' },
    { id: 'fade', name: 'Fade', filter: 'brightness(1.1) contrast(0.9) saturate(0.8)' },
];

/**
 * PhotoStudio - Migrated to Tailwind CSS for Phase 2b
 * Advanced photo editing interface for Menu Maker and other services.
 */
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

            canvas.width = img.naturalWidth;
            canvas.height = img.naturalHeight;

            ctx.filter = getFilterString();

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.save();

            ctx.translate(canvas.width / 2, canvas.height / 2);
            ctx.rotate((settings.rotate * Math.PI) / 180);
            ctx.scale(settings.zoom, settings.zoom);
            ctx.translate(settings.x, settings.y);
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
        setSettings(prev => ({
            ...prev,
            brightness: 105,
            contrast: 110,
            saturation: 120,
            activeFilter: 'vibrant'
        }));
    };

    return (
        <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in" onClick={onClose}>
            <div className="w-full max-w-[1000px] h-[85vh] bg-[#1a1a1a] rounded-[32px] flex flex-col overflow-hidden shadow-2xl border border-white/5 animate-in slide-in-from-bottom-10" onClick={e => e.stopPropagation()}>
                {/* Header */}
                <header className="px-6 py-4 bg-[#252525] border-b border-white/5 flex justify-between items-center shrink-0">
                    <h2 className="text-white text-lg font-bold flex items-center gap-2.5">
                        <Shield className="text-primary-500" size={20} />
                        Advanced Photo Studio
                    </h2>
                    <button
                        className="text-neutral-400 hover:text-white transition-colors p-1"
                        onClick={onClose}
                        aria-label="Close studio"
                    >
                        <X size={24} />
                    </button>
                </header>

                {/* Main */}
                <main className="flex-1 flex flex-col md:grid md:grid-cols-[1fr_300px] overflow-hidden">
                    <div className="bg-[#0f0f0f] flex items-center justify-center p-8 relative overflow-hidden flex-1">
                        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
                            <img
                                ref={imageRef}
                                src={imageUrl}
                                alt="Preview"
                                className="max-w-full max-h-full object-contain shadow-2xl rounded-2xl transition-all duration-300 ease-out border border-white/5"
                                style={{
                                    filter: getFilterString(),
                                    transform: `translate(${settings.x}px, ${settings.y}px) rotate(${settings.rotate}deg) scale(${settings.zoom})`
                                }}
                                crossOrigin="anonymous"
                            />
                        </div>
                        <canvas ref={canvasRef} className="hidden" />
                    </div>

                    <aside className="bg-[#252525] border-l border-white/5 flex flex-col overflow-y-auto w-full md:w-[300px] shrink-0">
                        <div className="grid grid-cols-2 bg-[#2a2a2a] border-b border-white/5 sticky top-0 z-10">
                            <button
                                className={`py-4 text-sm font-bold transition-all border-b-2 ${activeSection === 'adjust'
                                        ? 'text-white border-primary-500 bg-white/5'
                                        : 'text-neutral-500 border-transparent hover:text-neutral-300'
                                    }`}
                                onClick={() => setActiveSection('adjust')}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <Settings2 size={16} />
                                    Adjust
                                </div>
                            </button>
                            <button
                                className={`py-4 text-sm font-bold transition-all border-b-2 ${activeSection === 'transform'
                                        ? 'text-white border-primary-500 bg-white/5'
                                        : 'text-neutral-500 border-transparent hover:text-neutral-300'
                                    }`}
                                onClick={() => setActiveSection('transform')}
                            >
                                <div className="flex items-center justify-center gap-2">
                                    <Maximize2 size={16} />
                                    Transform
                                </div>
                            </button>
                        </div>

                        <div className="p-5 flex flex-col gap-8">
                            {activeSection === 'adjust' ? (
                                <>
                                    <div className="space-y-4 rounded-2xl bg-gradient-to-br from-primary-900/10 to-purple-900/10 p-4 border border-white/5">
                                        <h3 className="text-white/40 text-[10px] uppercase font-bold tracking-[0.2em]">AI Lab</h3>
                                        <button
                                            className="w-full py-3 bg-gradient-to-r from-primary-600 to-purple-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-primary-900/40 hover:scale-[1.02] active:scale-95 transition-all"
                                            onClick={handleAIEnhance}
                                        >
                                            <Wand2 size={18} />
                                            AI Enhance
                                        </button>
                                    </div>

                                    <div className="space-y-6">
                                        <h3 className="text-white/40 text-[10px] uppercase font-bold tracking-[0.2em]">Adjustments</h3>

                                        {[
                                            { label: 'Brightness', key: 'brightness', min: 0, max: 200, unit: '%' },
                                            { label: 'Contrast', key: 'contrast', min: 0, max: 200, unit: '%' },
                                            { label: 'Saturation', key: 'saturation', min: 0, max: 200, unit: '%' },
                                            { label: 'Background Blur', key: 'blur', min: 0, max: 20, unit: 'px' }
                                        ].map((ctrl) => (
                                            <div key={ctrl.key} className="space-y-3">
                                                <div className="flex justify-between text-xs text-neutral-400 font-bold">
                                                    <span>{ctrl.label}</span>
                                                    <span className="text-white">{settings[ctrl.key]}{ctrl.unit}</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min={ctrl.min} max={ctrl.max}
                                                    value={settings[ctrl.key]}
                                                    onChange={e => setSettings({ ...settings, [ctrl.key]: e.target.value })}
                                                    className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-primary-500"
                                                />
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-white/40 text-[10px] uppercase font-bold tracking-[0.2em]">Creative Filters</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {FILTERS.map(f => (
                                                <button
                                                    key={f.id}
                                                    className={`flex flex-col items-center gap-2 p-3 bg-[#333] border rounded-2xl transition-all ${settings.activeFilter === f.id
                                                            ? 'bg-primary-900/30 border-primary-500 text-white shadow-lg'
                                                            : 'border-white/5 text-neutral-400 hover:bg-[#444] hover:border-white/10'
                                                        }`}
                                                    onClick={() => setSettings({ ...settings, activeFilter: f.id })}
                                                >
                                                    <div className="w-10 h-10 rounded-full border border-white/10 overflow-hidden shadow-inner grayscale-[0.5]" style={{ filter: f.filter, background: 'linear-gradient(135deg, #12c2e9, #c471ed, #f64f59)' }}></div>
                                                    <span className="text-[10px] font-bold uppercase tracking-wider">{f.name}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-8 animate-in fade-in duration-300">
                                    <h3 className="text-white/40 text-[10px] uppercase font-bold tracking-[0.2em]">Transforms</h3>

                                    {[
                                        { label: 'Rotation', key: 'rotate', min: -180, max: 180, unit: '°' },
                                        { label: 'Zoom', key: 'zoom', min: 0.5, max: 3, unit: 'x', step: 0.1 },
                                        { label: 'Horizontal Offset', key: 'x', min: -200, max: 200, unit: 'px' },
                                        { label: 'Vertical Offset', key: 'y', min: -200, max: 200, unit: 'px' }
                                    ].map((ctrl) => (
                                        <div key={ctrl.key} className="space-y-3">
                                            <div className="flex justify-between text-xs text-neutral-400 font-bold">
                                                <span>{ctrl.label}</span>
                                                <span className="text-white">
                                                    {ctrl.key === 'zoom' ? parseFloat(settings[ctrl.key]).toFixed(1) : settings[ctrl.key]}
                                                    {ctrl.unit}
                                                </span>
                                            </div>
                                            <input
                                                type="range"
                                                min={ctrl.min} max={ctrl.max} step={ctrl.step || 1}
                                                value={settings[ctrl.key]}
                                                onChange={e => setSettings({ ...settings, [ctrl.key]: e.target.value })}
                                                className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-primary-500"
                                            />
                                        </div>
                                    ))}

                                    <button
                                        className="w-full py-2.5 bg-[#333] text-neutral-400 border border-white/5 rounded-xl text-xs font-bold hover:bg-[#444] hover:text-white transition-all flex items-center justify-center gap-2"
                                        onClick={() => setSettings({ ...settings, rotate: 0, zoom: 1, x: 0, y: 0 })}
                                    >
                                        <Undo2 size={14} />
                                        Reset Transforms
                                    </button>
                                </div>
                            )}
                        </div>
                    </aside>
                </main>

                {/* Footer */}
                <footer className="px-6 py-4 bg-[#252525] border-t border-white/5 flex justify-end gap-3 shrink-0">
                    <button
                        className="px-6 py-2.5 bg-neutral-800 text-white rounded-xl text-sm font-bold hover:bg-neutral-700 transition-all"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        className="px-8 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-primary-900/30 hover:bg-primary-500 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                        onClick={handleSave}
                        disabled={loading}
                    >
                        {loading && <Loader2 className="animate-spin" size={18} />}
                        {loading ? 'Processing...' : (
                            <>
                                <Check size={18} />
                                Apply Changes
                            </>
                        )}
                    </button>
                </footer>
            </div>
        </div>
    );
}

const Loader2 = ({ className, size }) => (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
);
