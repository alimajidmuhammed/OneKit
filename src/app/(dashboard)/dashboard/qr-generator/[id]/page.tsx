// @ts-nocheck
'use client';

import { useState, useEffect, use, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQRCode } from '@/lib/hooks/useQRCode';
import { useTrial } from '@/lib/hooks/useTrial';
import { useImageUpload } from '@/lib/hooks/useImageUpload';
import { APP_CONFIG } from '@/lib/utils/constants';
import styles from './editor.module.css';


// Preset Icons with SVG
const PRESET_ICONS = {
    instagram: { name: 'Instagram', color: '#E4405F', svg: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg> },
    facebook: { name: 'Facebook', color: '#1877F2', svg: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg> },
    whatsapp: { name: 'WhatsApp', color: '#25D366', svg: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg> },
    telegram: { name: 'Telegram', color: '#26A5E4', svg: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" /></svg> },
    youtube: { name: 'YouTube', color: '#FF0000', svg: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg> },
    tiktok: { name: 'TikTok', color: '#000000', svg: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z" /></svg> },
    twitter: { name: 'X (Twitter)', color: '#000000', svg: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg> },
    linkedin: { name: 'LinkedIn', color: '#0A66C2', svg: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg> },
    snapchat: { name: 'Snapchat', color: '#FFFC00', svg: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.206.793c.99 0 4.347.276 5.93 3.821.529 1.193.403 3.219.299 4.847l-.003.06c-.012.18-.022.345-.03.51.075.045.203.09.401.09.3-.016.659-.12 1.033-.301a.603.603 0 01.272-.052c.223 0 .463.067.686.183.262.135.475.346.56.676a.628.628 0 01-.027.468c-.137.323-.449.475-.626.536-.08.027-.169.054-.255.082a6.59 6.59 0 00-.627.222c-.16.067-.27.135-.313.195a.324.324 0 00-.029.179c.005.074.003.146-.007.22l.002.003c.08.28.127.567.127.855 0 .251-.022.494-.065.73l.001.003c-.3 1.662-1.406 3.032-2.85 3.861-.586.335-1.226.595-1.905.773a6.8 6.8 0 01-1.696.21c-.527 0-1.046-.064-1.544-.187-1.08-.267-2.069-.77-2.893-1.463a5.732 5.732 0 01-1.516-2.06 5.08 5.08 0 01-.41-1.986 4.95 4.95 0 01.128-.855c-.011-.074-.012-.147-.006-.22a.328.328 0 00-.03-.18c-.042-.06-.152-.128-.313-.195a6.497 6.497 0 00-.627-.222 2.79 2.79 0 01-.255-.082c-.177-.06-.489-.213-.626-.536a.628.628 0 01-.027-.468c.085-.33.299-.54.56-.676.223-.116.463-.183.686-.183a.603.603 0 01.272.052c.374.18.732.317 1.032.3.199 0 .327-.044.402-.09a6.88 6.88 0 01-.03-.51l-.002-.06c-.105-1.628-.231-3.654.298-4.847C7.86 1.069 11.217.793 12.206.793z" /></svg> },
    spotify: { name: 'Spotify', color: '#1DB954', svg: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" /></svg> },
    email: { name: 'Email', color: '#EA4335', svg: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" /><path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" /></svg> },
    phone: { name: 'Phone', color: '#34B7F1', svg: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" /></svg> },
    website: { name: 'Website', color: '#5B6EF2', svg: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" /></svg> },
    googlemaps: { name: 'Google Maps', color: '#EA4335', svg: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" /></svg> },
    github: { name: 'GitHub', color: '#181717', svg: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" /></svg> },
    discord: { name: 'Discord', color: '#5865F2', svg: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" /></svg> },
    pinterest: { name: 'Pinterest', color: '#BD081C', svg: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" /></svg> },
    custom: { name: 'Custom', color: '#6B7280', svg: <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 11h-4v4h-2v-4H7v-2h4V7h2v4h4v2z" /></svg> },
};

// Themes - 20 Options
const THEMES = [
    // Gradient Themes
    { id: 'aurora', name: 'Aurora', colors: ['#667eea', '#764ba2'], textColor: '#ffffff' },
    { id: 'sunset', name: 'Sunset', colors: ['#f093fb', '#f5576c'], textColor: '#ffffff' },
    { id: 'ocean', name: 'Ocean', colors: ['#4facfe', '#00f2fe'], textColor: '#ffffff' },
    { id: 'forest', name: 'Forest', colors: ['#11998e', '#38ef7d'], textColor: '#ffffff' },
    { id: 'candy', name: 'Candy', colors: ['#ff9a9e', '#fecfef'], textColor: '#1a1a2e' },
    { id: 'peach', name: 'Peach', colors: ['#ffecd2', '#fcb69f'], textColor: '#1a1a2e' },
    { id: 'lavender', name: 'Lavender', colors: ['#a18cd1', '#fbc2eb'], textColor: '#ffffff' },
    { id: 'mint', name: 'Mint', colors: ['#d4fc79', '#96e6a1'], textColor: '#1a1a2e' },
    { id: 'fire', name: 'Fire', colors: ['#f12711', '#f5af19'], textColor: '#ffffff' },
    { id: 'royal', name: 'Royal', colors: ['#141E30', '#243B55'], textColor: '#ffffff' },
    // Dark Themes
    { id: 'midnight', name: 'Midnight', colors: ['#0f0c29', '#302b63'], textColor: '#ffffff' },
    { id: 'dark', name: 'Dark', colors: ['#1a1a2e', '#16213e'], textColor: '#ffffff' },
    { id: 'neon', name: 'Neon', colors: ['#0d0d0d', '#1a0033'], textColor: '#00ff88' },
    { id: 'gold', name: 'Gold', colors: ['#1a1a2e', '#2d2d44'], textColor: '#d4af37' },
    { id: 'cyber', name: 'Cyber', colors: ['#0a0a0f', '#1a0a2e'], textColor: '#ff00ff' },
    // Light Themes
    { id: 'minimal', name: 'Minimal', colors: ['#ffffff', '#f8f9fa'], textColor: '#1a1a2e' },
    { id: 'cream', name: 'Cream', colors: ['#fdf6e3', '#f5e6d3'], textColor: '#5d4e37' },
    { id: 'sky', name: 'Sky', colors: ['#e0f7fa', '#b2ebf2'], textColor: '#00695c' },
    { id: 'rose', name: 'Rose', colors: ['#fce4ec', '#f8bbd9'], textColor: '#880e4f' },
    { id: 'snow', name: 'Snow', colors: ['#f5f7fa', '#c3cfe2'], textColor: '#2c3e50' },
];

// Button Styles - 8 Options
const BUTTON_STYLES = [
    { id: 'filled', name: 'Filled', style: 'filled' },
    { id: 'outline', name: 'Outline', style: 'outline' },
    { id: 'shadow', name: 'Shadow', style: 'shadow' },
    { id: 'glass', name: 'Glass', style: 'glass' },
    { id: 'rounded', name: 'Rounded', style: 'rounded' },
    { id: 'pill', name: 'Pill', style: 'pill' },
    { id: 'gradient', name: 'Gradient', style: 'gradient' },
    { id: 'neon', name: 'Neon', style: 'neon' },
];

export default function QREditorPage({ params }) {
    const resolvedParams = use(params);
    const { id } = resolvedParams;
    const router = useRouter();
    const { fetchQRCode, updateQRCode, saving } = useQRCode();
    const { isTrialActive, isTrialExpired } = useTrial('qr-generator');
    const { uploadImage } = useImageUpload();
    const fileInputRef = useRef(null);
    const customIconInputRef = useRef(null);

    const [qr, setQR] = useState(null);
    const [loading, setLoading] = useState(true);
    const [hasChanges, setHasChanges] = useState(false);
    const [activeTab, setActiveTab] = useState('profile');
    const [editingLinkIcon, setEditingLinkIcon] = useState(null);
    const [downloading, setDownloading] = useState(false);
    const [isLogoStudioOpen, setIsLogoStudioOpen] = useState(false);
    const [saveStatus, setSaveStatus] = useState('idle'); // 'idle', 'saving', 'saved'
    const [logoSettings, setLogoSettings] = useState({
        zoom: 1,
        x: 0,
        y: 0
    });

    const isMounted = useRef(true);
    const lastSavedStateRef = useRef(null);

    useEffect(() => {
        isMounted.current = true;
        const loadQR = async () => {
            const data = await fetchQRCode(id);
            if (data) {
                if (!data.links) data.links = [];
                if (!data.bio) data.bio = '';
                if (!data.display_name) data.display_name = data.name;
                if (!data.button_style) data.button_style = 'filled';
                if (data.theme?.logo_settings) {
                    setLogoSettings(data.theme.logo_settings);
                }
                setQR(data);
            } else {
                router.push('/dashboard/qr-generator');
            }
            setLoading(false);
        };
        loadQR();

        return () => {
            isMounted.current = false;
        };
    }, [id]);

    const handleSave = useCallback(async () => {
        if (!qr || saveStatus === 'saving') return;

        const stateToSave = {
            name: qr.name,
            display_name: qr.display_name,
            bio: qr.bio,
            logo_url: qr.logo_url,
            template_id: qr.template_id,
            links: qr.links,
            button_style: qr.button_style,
            theme: {
                ...(qr.theme || {}),
                logo_settings: logoSettings
            },
        };

        const stateToSaveStr = JSON.stringify(stateToSave);
        setSaveStatus('saving');

        try {
            const { error } = await updateQRCode(id, stateToSave);

            if (!isMounted.current) return;

            if (error) {
                if (error.name === 'AbortError') return;
                console.error('Save error:', error);
                setSaveStatus('idle');
                return;
            }

            lastSavedStateRef.current = stateToSaveStr;

            const currentStateStr = JSON.stringify({
                name: qr.name,
                display_name: qr.display_name,
                bio: qr.bio,
                logo_url: qr.logo_url,
                template_id: qr.template_id,
                links: qr.links,
                button_style: qr.button_style,
                theme: {
                    ...(qr.theme || {}),
                    logo_settings: logoSettings
                },
            });

            if (currentStateStr === stateToSaveStr) {
                setHasChanges(false);
            }

            setSaveStatus('saved');
            const statusTimer = setTimeout(() => {
                if (isMounted.current) setSaveStatus('idle');
            }, 3000);

            return () => clearTimeout(statusTimer);
        } catch (error) {
            if (!isMounted.current) return;
            if (error.name === 'AbortError') return;
            console.error('Save error:', error);
            setSaveStatus('idle');
        }
    }, [id, qr, logoSettings, saveStatus, updateQRCode]);

    // Auto-save effect
    useEffect(() => {
        if (!hasChanges || !qr) return;

        const timer = setTimeout(() => {
            handleSave();
        }, 2000);

        return () => clearTimeout(timer);
    }, [hasChanges, qr, handleSave]);

    const updateField = (field, value) => {
        setQR(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
    };

    const updateTheme = (themeId) => {
        const theme = THEMES.find(t => t.id === themeId);
        setQR(prev => ({
            ...prev,
            template_id: themeId,
            theme: {
                ...(prev.theme || {}),
                primaryColor: theme?.colors[0] || '#667eea',
                secondaryColor: theme?.colors[1] || '#764ba2',
                textColor: theme?.textColor || '#ffffff',
            }
        }));
        setHasChanges(true);
    };

    const updateTextColor = (color) => {
        setQR(prev => ({
            ...prev,
            theme: {
                ...(prev.theme || {}),
                textColor: color,
            }
        }));
        setHasChanges(true);
    };

    const handleLogoSettingChange = (field, value) => {
        setLogoSettings(prev => ({ ...prev, [field]: value }));
        setHasChanges(true);
    };

    // Links Management
    const addLink = () => {
        setQR(prev => ({
            ...prev,
            links: [...(prev.links || []), {
                id: Date.now(),
                title: '',
                url: '',
                icon: 'website',
                customIcon: null,
            }]
        }));
        setHasChanges(true);
    };

    const updateLink = (index, field, value) => {
        setQR(prev => {
            const links = [...(prev.links || [])];
            links[index] = { ...links[index], [field]: value };
            return { ...prev, links };
        });
        setHasChanges(true);
    };

    const removeLink = (index) => {
        setQR(prev => ({
            ...prev,
            links: prev.links.filter((_, i) => i !== index)
        }));
        setHasChanges(true);
    };

    const moveLink = (index, direction) => {
        setQR(prev => {
            const links = [...(prev.links || [])];
            const newIndex = index + direction;
            if (newIndex < 0 || newIndex >= links.length) return prev;
            [links[index], links[newIndex]] = [links[newIndex], links[index]];
            return { ...prev, links };
        });
        setHasChanges(true);
    };

    // Logo Upload
    const handleLogoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Show immediate preview
        const reader = new FileReader();
        reader.onload = (event) => {
            updateField('logo_url', event.target.result);
        };
        reader.readAsDataURL(file);

        // Upload to R2 for persistent storage
        const publicUrl = await uploadImage(file, { folder: 'qr-logos', type: 'logo' });
        if (publicUrl) {
            updateField('logo_url', publicUrl);
        }
    };

    // Custom Icon Upload
    const handleCustomIconUpload = async (e, linkIndex) => {
        const file = e.target.files[0];
        if (!file) return;

        // Show immediate preview
        const reader = new FileReader();
        reader.onload = (event) => {
            updateLink(linkIndex, 'customIcon', event.target.result);
            updateLink(linkIndex, 'icon', 'custom');
            setEditingLinkIcon(null);
        };
        reader.readAsDataURL(file);

        // Upload to R2 for persistent storage
        const publicUrl = await uploadImage(file, { folder: 'qr-logos', type: 'logo' });
        if (publicUrl) {
            updateLink(linkIndex, 'customIcon', publicUrl);
        }
    };

    // Get QR URL
    const getQRCodeUrl = () => {
        const pageUrl = `${APP_CONFIG.url}/qr/${qr?.slug}`;
        return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(pageUrl)}`;
    };

    // Download QR as PNG
    const downloadQRCodeAsPNG = async () => {
        if (!qr) return;
        setDownloading(true);
        try {
            const response = await fetch(getQRCodeUrl());
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${qr.slug}-qr.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        } catch (error) {
            console.error('Failed to download QR code:', error);
            alert('Failed to download QR code. Please try again.');
        } finally {
            setDownloading(false);
        }
    };

    // Get theme styles
    const getThemeStyles = () => {
        const theme = THEMES.find(t => t.id === qr?.template_id) || THEMES[0];
        return {
            background: `linear-gradient(135deg, ${theme.colors[0]}, ${theme.colors[1]})`,
            color: theme.textColor,
        };
    };

    if (loading) {
        return (
            <div className={styles.loading}>
                <div className={styles.spinner}></div>
                <span>Loading...</span>
            </div>
        );
    }

    if (!qr) return null;

    const canEdit = isTrialActive || !isTrialExpired;
    const themeStyles = getThemeStyles();

    const logoStyle = {
        transform: `scale(${logoSettings.zoom}) translate(${logoSettings.x}%, ${logoSettings.y}%)`,
        transition: 'transform 0.1s ease-out'
    };

    return (
        <div className={styles.editor}>
            <header className={styles.header}>
                <button className={styles.backBtn} onClick={() => router.push('/dashboard/qr-generator')}>
                    <span>←</span>
                    <span>Back</span>
                </button>
                <h1>{qr.name}</h1>
                <div className={styles.headerActions}>
                    {saveStatus === 'saving' && <span className={styles.saving}>Saving...</span>}
                    {saveStatus === 'saved' && <span className={styles.saved}>Saved</span>}
                </div>
            </header>

            {isTrialExpired && (
                <div className={styles.expiredNotice}>
                    Your trial has expired. <a href="/dashboard/subscriptions">Upgrade now</a> to continue editing.
                </div>
            )}

            {/* Tabs */}
            <div className={styles.tabs}>
                {['profile', 'links', 'design'].map(tab => (
                    <button
                        key={tab}
                        className={`${styles.tab} ${activeTab === tab ? styles.tabActive : ''}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab === 'profile' && '👤'}
                        {tab === 'links' && '🔗'}
                        {tab === 'design' && '🎨'}
                        <span>{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
                    </button>
                ))}
            </div>

            <div className={styles.content}>
                {/* Form */}
                <div className={styles.form}>
                    {/* Profile Tab */}
                    {activeTab === 'profile' && (
                        <div className={styles.section}>
                            <h3>Profile</h3>
                            <p className={styles.sectionDesc}>Set up your profile information</p>

                            {/* Logo Upload */}
                            <div className={styles.logoUpload}>
                                <label>Logo / Profile Photo</label>
                                <div className={styles.logoContainer}>
                                    {qr.logo_url ? (
                                        <div className={styles.logoPreview}>
                                            <img
                                                src={qr.logo_url}
                                                alt="Logo"
                                                style={logoStyle}
                                            />
                                            <button className={styles.removeLogo} onClick={() => updateField('logo_url', null)}>×</button>
                                        </div>
                                    ) : (
                                        <div className={styles.logoPlaceholder} onClick={() => fileInputRef.current?.click()}>
                                            <span>📷</span>
                                            <span>Upload Logo</span>
                                        </div>
                                    )}
                                    {qr.logo_url && (
                                        <button
                                            className={styles.studioBtn}
                                            onClick={() => setIsLogoStudioOpen(!isLogoStudioOpen)}
                                        >
                                            ✨ Logo Studio
                                        </button>
                                    )}
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleLogoUpload}
                                    style={{ display: 'none' }}
                                    accept="image/*"
                                />
                            </div>

                            {isLogoStudioOpen && qr.logo_url && (
                                <div className={styles.logoStudio}>
                                    <div className={styles.studioHeader}>
                                        <h4>Logo Studio</h4>
                                        <button onClick={() => setIsLogoStudioOpen(false)}>×</button>
                                    </div>
                                    <div className={styles.studioBody}>
                                        <div className={styles.studioGroup}>
                                            <label>Zoom</label>
                                            <input
                                                type="range"
                                                min="1"
                                                max="3"
                                                step="0.01"
                                                value={logoSettings.zoom}
                                                onChange={(e) => handleLogoSettingChange('zoom', parseFloat(e.target.value))}
                                            />
                                        </div>
                                        <div className={styles.studioGroup}>
                                            <label>X Position</label>
                                            <input
                                                type="range"
                                                min="-50"
                                                max="50"
                                                step="1"
                                                value={logoSettings.x}
                                                onChange={(e) => handleLogoSettingChange('x', parseInt(e.target.value))}
                                            />
                                        </div>
                                        <div className={styles.studioGroup}>
                                            <label>Y Position</label>
                                            <input
                                                type="range"
                                                min="-50"
                                                max="50"
                                                step="1"
                                                value={logoSettings.y}
                                                onChange={(e) => handleLogoSettingChange('y', parseInt(e.target.value))}
                                            />
                                        </div>
                                        <button
                                            className={styles.resetBtn}
                                            onClick={() => setLogoSettings({ zoom: 1, x: 0, y: 0 })}
                                        >
                                            Reset Studio
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Display Name */}
                            <div className={styles.formGroup}>
                                <label>Display Name</label>
                                <input
                                    type="text"
                                    value={qr.display_name || ''}
                                    onChange={(e) => updateField('display_name', e.target.value)}
                                    placeholder="Your name or brand"
                                    disabled={!canEdit}
                                />
                            </div>

                            {/* Bio */}
                            <div className={styles.formGroup}>
                                <label>Short Description</label>
                                <textarea
                                    value={qr.bio || ''}
                                    onChange={(e) => updateField('bio', e.target.value.slice(0, 150))}
                                    placeholder="Brief description about you or your business"
                                    rows={3}
                                    disabled={!canEdit}
                                />
                                <span className={styles.charCount}>{(qr.bio || '').length}/150</span>
                            </div>
                        </div>
                    )}

                    {/* Links Tab */}
                    {activeTab === 'links' && (
                        <div className={styles.section}>
                            <div className={styles.sectionHeader}>
                                <div>
                                    <h3>Your Links</h3>
                                    <p className={styles.sectionDesc}>Add links with icons</p>
                                </div>
                                <button className={styles.addBtn} onClick={addLink} disabled={!canEdit}>
                                    + Add Link
                                </button>
                            </div>

                            <div className={styles.linksList}>
                                {(!qr.links || qr.links.length === 0) ? (
                                    <div className={styles.emptyLinks}>
                                        <span className={styles.emptyIcon}>🔗</span>
                                        <p>No links yet</p>
                                        <span>Add your first link to get started</span>
                                    </div>
                                ) : (
                                    qr.links.map((link, index) => (
                                        <div key={link.id} className={styles.linkCard}>
                                            {/* Move Buttons */}
                                            <div className={styles.linkMove}>
                                                <button onClick={() => moveLink(index, -1)} disabled={index === 0}>↑</button>
                                                <button onClick={() => moveLink(index, 1)} disabled={index === qr.links.length - 1}>↓</button>
                                            </div>

                                            {/* Icon Selector */}
                                            <div className={styles.iconSelector}>
                                                <button
                                                    className={styles.iconBtn}
                                                    style={{ background: PRESET_ICONS[link.icon]?.color || '#6B7280' }}
                                                    onClick={() => setEditingLinkIcon(editingLinkIcon === index ? null : index)}
                                                >
                                                    {link.customIcon ? (
                                                        <img src={link.customIcon} alt="icon" />
                                                    ) : (
                                                        PRESET_ICONS[link.icon]?.svg || PRESET_ICONS.website.svg
                                                    )}
                                                </button>

                                                {/* Icon Picker Dropdown */}
                                                {editingLinkIcon === index && (
                                                    <div className={styles.iconPicker}>
                                                        <div className={styles.iconGrid}>
                                                            {Object.entries(PRESET_ICONS).map(([key, icon]) => (
                                                                <button
                                                                    key={key}
                                                                    className={styles.iconOption}
                                                                    style={{ background: icon.color }}
                                                                    onClick={() => {
                                                                        updateLink(index, 'icon', key);
                                                                        updateLink(index, 'customIcon', null);
                                                                        setEditingLinkIcon(null);
                                                                    }}
                                                                    title={icon.name}
                                                                >
                                                                    {icon.svg}
                                                                </button>
                                                            ))}
                                                        </div>
                                                        <div className={styles.uploadCustom}>
                                                            <label>
                                                                📁 Upload Custom Icon
                                                                <input
                                                                    type="file"
                                                                    accept="image/*"
                                                                    onChange={(e) => handleCustomIconUpload(e, index)}
                                                                    style={{ display: 'none' }}
                                                                />
                                                            </label>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Link Fields */}
                                            <div className={styles.linkFields}>
                                                <input
                                                    type="text"
                                                    value={link.title}
                                                    onChange={(e) => updateLink(index, 'title', e.target.value)}
                                                    placeholder="Link Title (e.g. My Instagram)"
                                                    disabled={!canEdit}
                                                />
                                                <input
                                                    type="url"
                                                    value={link.url}
                                                    onChange={(e) => updateLink(index, 'url', e.target.value)}
                                                    placeholder="https://..."
                                                    disabled={!canEdit}
                                                />
                                            </div>

                                            {/* Remove Button */}
                                            <button
                                                className={styles.removeLink}
                                                onClick={() => removeLink(index)}
                                                disabled={!canEdit}
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}

                    {/* Design Tab */}
                    {activeTab === 'design' && (
                        <div className={styles.section}>
                            <h3>Design</h3>
                            <p className={styles.sectionDesc}>Customize appearance</p>

                            {/* Theme */}
                            <div className={styles.formGroup}>
                                <label>Theme</label>
                                <div className={styles.themeGrid}>
                                    {THEMES.map(theme => (
                                        <button
                                            key={theme.id}
                                            className={`${styles.themeCard} ${qr.template_id === theme.id ? styles.themeActive : ''}`}
                                            onClick={() => updateTheme(theme.id)}
                                            disabled={!canEdit}
                                        >
                                            <div
                                                className={styles.themePreview}
                                                style={{ background: `linear-gradient(135deg, ${theme.colors[0]}, ${theme.colors[1]})` }}
                                            />
                                            <span>{theme.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Button Style */}
                            <div className={styles.formGroup}>
                                <label>Button Style</label>
                                <div className={styles.buttonStyleGrid}>
                                    {BUTTON_STYLES.map(style => (
                                        <button
                                            key={style.id}
                                            className={`${styles.styleCard} ${qr.button_style === style.id ? styles.styleActive : ''}`}
                                            onClick={() => updateField('button_style', style.id)}
                                            disabled={!canEdit}
                                        >
                                            <div className={`${styles.stylePreview} ${styles[style.style]}`}>
                                                Button
                                            </div>
                                            <span>{style.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Text Color */}
                            <div className={styles.formGroup}>
                                <label>Text Color</label>
                                <p className={styles.sectionDesc}>Customize name and description color</p>
                                <div className={styles.colorPickerGroup}>
                                    <input
                                        type="color"
                                        value={qr.theme?.textColor || '#ffffff'}
                                        onChange={(e) => updateTextColor(e.target.value)}
                                        disabled={!canEdit}
                                        className={styles.colorPicker}
                                    />
                                    <input
                                        type="text"
                                        value={qr.theme?.textColor || '#ffffff'}
                                        onChange={(e) => updateTextColor(e.target.value)}
                                        disabled={!canEdit}
                                        className={styles.colorInput}
                                        placeholder="#ffffff"
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Preview */}
                <div className={styles.preview}>
                    <div className={styles.previewHeader}>
                        <span>Preview</span>
                        <a href={`/qr/${qr.slug}`} target="_blank" className={styles.previewLink}>
                            Open Page →
                        </a>
                    </div>

                    <div className={styles.previewFrame}>
                        <div className={styles.phoneFrame}>
                            <div className={styles.phoneSpeaker}></div>
                            <div className={styles.phoneScreen} style={themeStyles}>
                                <div className={styles.linkPage}>
                                    {/* Logo */}
                                    {qr.logo_url ? (
                                        <div className={styles.lpLogo}>
                                            <img
                                                src={qr.logo_url}
                                                alt={qr.display_name}
                                                style={logoStyle}
                                            />
                                        </div>
                                    ) : (
                                        <div className={styles.lpLogoPlaceholder}>
                                            {(qr.display_name || qr.name || 'A').charAt(0).toUpperCase()}
                                        </div>
                                    )}


                                    {/* Name */}
                                    <h2 className={styles.lpName} style={{ color: qr.theme?.textColor || '#ffffff' }}>{qr.display_name || 'Your Name'}</h2>

                                    {/* Bio */}
                                    {qr.bio && <p className={styles.lpBio} style={{ color: qr.theme?.textColor || '#ffffff' }}>{qr.bio}</p>}

                                    {/* Links */}
                                    <div className={styles.lpLinks}>
                                        {(qr.links || []).filter(l => l.title && l.url).map((link, i) => (
                                            <div
                                                key={i}
                                                className={`${styles.lpLink} ${styles[qr.button_style || 'filled']}`}
                                            >
                                                <span className={styles.lpLinkIcon} style={{ background: PRESET_ICONS[link.icon]?.color }}>
                                                    {link.customIcon ? (
                                                        <img src={link.customIcon} alt="" />
                                                    ) : (
                                                        PRESET_ICONS[link.icon]?.svg || PRESET_ICONS.website.svg
                                                    )}
                                                </span>
                                                <span className={styles.lpLinkTitle}>{link.title}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>

                    {/* QR Code */}
                    <div className={styles.qrSection}>
                        <div className={styles.qrCode}>
                            <img src={getQRCodeUrl()} alt="QR Code" />
                        </div>
                        <div className={styles.qrInfo}>
                            <p>Scan to view your page</p>
                            <button
                                onClick={downloadQRCodeAsPNG}
                                className={styles.downloadQR}
                                disabled={downloading}
                            >
                                {downloading ? 'Downloading...' : 'Download QR'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
