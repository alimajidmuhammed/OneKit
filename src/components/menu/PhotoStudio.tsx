// @ts-nocheck
'use client';

import { useState, useRef, useEffect } from 'react';
import { X, ZoomIn, ZoomOut, RotateCw, Move, Check, Loader2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
    DialogClose,
} from '@/components/ui/dialog';

interface PhotoStudioProps {
    imageUrl: string;
    onSave: (editedImageUrl: string) => void;
    onClose: () => void;
}

/**
 * PhotoStudio component for editing menu item images
 * Uses shadcn/ui Dialog for accessibility and consistent UX
 */
export default function PhotoStudio({ imageUrl, onSave, onClose }: PhotoStudioProps) {
    const [zoom, setZoom] = useState(1);
    const [rotation, setRotation] = useState(0);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [saving, setSaving] = useState(false);
    const dragStartRef = useRef({ x: 0, y: 0, posX: 0, posY: 0 });
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const handleMouseDown = (e: React.MouseEvent) => {
        setIsDragging(true);
        dragStartRef.current = {
            x: e.clientX,
            y: e.clientY,
            posX: position.x,
            posY: position.y,
        };
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        const dx = e.clientX - dragStartRef.current.x;
        const dy = e.clientY - dragStartRef.current.y;
        setPosition({
            x: dragStartRef.current.posX + dx,
            y: dragStartRef.current.posY + dy,
        });
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        const touch = e.touches[0];
        setIsDragging(true);
        dragStartRef.current = {
            x: touch.clientX,
            y: touch.clientY,
            posX: position.x,
            posY: position.y,
        };
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging) return;
        const touch = e.touches[0];
        const dx = touch.clientX - dragStartRef.current.x;
        const dy = touch.clientY - dragStartRef.current.y;
        setPosition({
            x: dragStartRef.current.posX + dx,
            y: dragStartRef.current.posY + dy,
        });
    };

    const handleTouchEnd = () => {
        setIsDragging(false);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const ctx = canvas.getContext('2d');
            if (!ctx) return;

            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.src = imageUrl;

            await new Promise((resolve) => {
                img.onload = resolve;
            });

            const size = 400;
            canvas.width = size;
            canvas.height = size;

            ctx.save();
            ctx.translate(size / 2, size / 2);
            ctx.rotate((rotation * Math.PI) / 180);
            ctx.scale(zoom, zoom);
            ctx.translate(-size / 2 + position.x, -size / 2 + position.y);
            ctx.drawImage(img, 0, 0, size, size);
            ctx.restore();

            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
            onSave(dataUrl);
        } catch (err) {
            console.error('Failed to save image:', err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-lg rounded-[2rem] p-0 overflow-hidden">
                <DialogHeader className="px-8 pt-8 pb-4 text-center">
                    <DialogTitle className="text-2xl font-black text-neutral-900">Magic Photo Studio</DialogTitle>
                    <DialogDescription className="text-sm text-neutral-500 font-medium">
                        Adjust, zoom, and rotate your image for the perfect look
                    </DialogDescription>
                </DialogHeader>

                <div className="px-8 pb-6">
                    {/* Preview Area */}
                    <div
                        className={`relative w-64 h-64 mx-auto rounded-2xl overflow-hidden border-4 border-neutral-100 shadow-xl cursor-grab ${isDragging ? 'cursor-grabbing' : ''}`}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onTouchStart={handleTouchStart}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleTouchEnd}
                    >
                        <img
                            src={imageUrl}
                            alt="Edit preview"
                            className="absolute w-full h-full object-cover pointer-events-none select-none"
                            style={{
                                transform: `translate(${position.x}px, ${position.y}px) scale(${zoom}) rotate(${rotation}deg)`,
                            }}
                            crossOrigin="anonymous"
                        />
                        <div className="absolute inset-0 border border-white/20 pointer-events-none" />
                    </div>

                    {/* Drag Hint */}
                    <div className="flex items-center justify-center gap-2 mt-4 text-xs text-neutral-400 font-bold">
                        <Move size={14} />
                        <span>Drag to reposition</span>
                    </div>

                    {/* Controls */}
                    <div className="mt-6 space-y-4">
                        {/* Zoom Control */}
                        <div className="flex items-center gap-4">
                            <button
                                className="p-2 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors"
                                onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                            >
                                <ZoomOut size={18} />
                            </button>
                            <input
                                type="range"
                                min="0.5"
                                max="3"
                                step="0.1"
                                value={zoom}
                                onChange={(e) => setZoom(parseFloat(e.target.value))}
                                className="flex-1 h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-primary-600"
                            />
                            <button
                                className="p-2 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors"
                                onClick={() => setZoom(Math.min(3, zoom + 0.1))}
                            >
                                <ZoomIn size={18} />
                            </button>
                            <span className="w-12 text-right text-sm font-black text-primary-600">
                                {Math.round(zoom * 100)}%
                            </span>
                        </div>

                        {/* Rotation Control */}
                        <div className="flex justify-center gap-3">
                            <button
                                className="flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-xl text-sm font-bold transition-colors"
                                onClick={() => setRotation((r) => r - 90)}
                            >
                                <RotateCw size={16} className="rotate-180" />
                                Left
                            </button>
                            <button
                                className="flex items-center gap-2 px-4 py-2 bg-neutral-100 hover:bg-neutral-200 rounded-xl text-sm font-bold transition-colors"
                                onClick={() => setRotation((r) => r + 90)}
                            >
                                Right
                                <RotateCw size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                <DialogFooter className="flex gap-3 p-6 bg-neutral-50 border-t border-neutral-100">
                    <DialogClose asChild>
                        <button className="flex-1 py-3 px-6 bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-600 rounded-xl font-bold text-sm transition-colors">
                            Cancel
                        </button>
                    </DialogClose>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 py-3 px-6 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold text-sm shadow-lg shadow-primary-600/20 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {saving ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Check size={16} />
                                Apply Changes
                            </>
                        )}
                    </button>
                </DialogFooter>

                {/* Hidden Canvas for Export */}
                <canvas ref={canvasRef} className="hidden" />
            </DialogContent>
        </Dialog>
    );
}
