// @ts-nocheck
'use client';

import { useState, useEffect, use, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useInvoice } from '@/lib/hooks/useInvoice';
import { useAuth } from '@/components/auth/AuthProvider';
import { useSubscription } from '@/lib/hooks/useSubscription';
import { useImageUpload } from '@/lib/hooks/useImageUpload';
import { saveAs } from 'file-saver';
import { jsPDF } from 'jspdf';
import {
    Packer, Document, Paragraph, TextRun, AlignmentType,
    Table, TableRow, TableCell, WidthType, BorderStyle,
    VerticalAlign, ImageRun, ShadingType,
} from 'docx';
import { InvoicePDF } from '@/components/pdf/InvoicePDF';
import { PDFDownloadButton } from '@/components/ui/PDFDownloadButton';
import {
    Facebook, Instagram, Phone, Mail, MapPin, Music2,
    Ghost as Snapchat, Download, FileText, ChevronLeft,
    Layout, Type, Check, Loader2, X, Save, Palette,
    Plus, ChevronUp, ChevronDown, Trash2, Sparkles,
    RotateCcw, ExternalLink, ArrowLeft, Globe, User,
    Eye, LayoutPanelLeft, Hash, DollarSign, MessageSquare,
    CheckCircle2, Image as ImageIcon
} from 'lucide-react';

const SECTIONS = [
    { id: 'identity', label: 'Identity Matrix', icon: <User size={18} /> },
    { id: 'content', label: 'Protocol Intel', icon: <FileText size={18} /> },
    { id: 'labels', label: 'Semantic Labels', icon: <Type size={18} /> },
    { id: 'contact', label: 'Channels', icon: <Globe size={18} /> },
    { id: 'visuals', label: 'Visual Matrix', icon: <Palette size={18} /> },
];

const TEMPLATES = [
    { id: 'classic', name: 'Classic', icon: '📄' },
    { id: 'modern', name: 'Modern', icon: '✨' },
    { id: 'minimal', name: 'Minimal', icon: '⬜' },
    { id: 'corporate', name: 'Corporate', icon: '🏢' },
    { id: 'luxury', name: 'Luxury', icon: '💎' },
    { id: 'compact', name: 'Compact', icon: '📏' }
];

const SIZES = [
    { id: 'A4', name: 'A4', desc: 'Standard' },
    { id: 'A5', name: 'A5', desc: 'Half' },
    { id: 'A6', name: 'A6', desc: 'Small' },
    { id: 'Letter', name: 'Letter', desc: 'US' },
    { id: 'Legal', name: 'Legal', desc: 'US' },
    { id: 'DL', name: 'DL', desc: 'Envelope' }
];

const ORIENTATIONS = [
    { id: 'portrait', name: 'Portrait', icon: '📱' },
    { id: 'landscape', name: 'Landscape', icon: '💻' }
];

const DEFAULT_LABELS = {
    company_name_en: 'Antigravity Systems',
    company_name_ku: 'کۆمپانیای ئەنتیگراڤیتی',
    header_visa: 'Global Distribution Protocol',
    header_edu: 'Intelligence Hub',
    header_law: 'Legal Framework',
    label_usd_ku: 'USD',
    label_iqd_ku: 'IQD',
    label_received_en: 'Received From',
    label_received_ku: 'وەرگیرا لە بەڕێز',
    label_sum_en: 'The Sum Of',
    label_sum_ku: 'بڕی پارەی دیاریکراو',
    label_details_en: 'Transaction Status',
    label_details_ku: 'تێبینییەکان دەربارەی مامەڵەکە',
    label_buyer_ku: 'واژووی کڕیار',
    label_accountant_ku: 'واژووی ژمێریار',
    company_prefix_ku: 'کۆمپانیای'
};

export default function InvoiceEditorPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const { id } = resolvedParams;
    const router = useRouter();
    const { user } = useAuth();
    const { fetchInvoice, updateInvoice, saving } = useInvoice();
    const { uploadImage } = useImageUpload();

    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const [downloading, setDownloading] = useState(false);
    const [saveStatus, setSaveStatus] = useState('idle'); // 'idle', 'saving', 'saved'
    const [hasChanges, setHasChanges] = useState(false);
    const [activeSection, setActiveSection] = useState<string>('identity');
    const [previewScale, setPreviewScale] = useState(1);
    const [mobileView, setMobileView] = useState('edit'); // 'edit' or 'preview'
    const previewRef = useRef(null);
    const exportRef = useRef(null);
    const containerRef = useRef(null);

    const updateScale = useCallback(() => {
        if (!containerRef.current || !previewRef.current) return;
        const container = containerRef.current;
        const preview = previewRef.current;

        const padding = 40; // Total padding
        const availableWidth = container.clientWidth - padding;
        const availableHeight = container.clientHeight - padding;

        const scaleW = availableWidth / preview.offsetWidth;
        const scaleH = availableHeight / preview.offsetHeight;

        // Use the smaller scale to ensure it fits both ways, but don't upscale beyond 1
        const newScale = Math.min(scaleW, scaleH, 1);
        setPreviewScale(newScale);
    }, []);

    useEffect(() => {
        updateScale();
        window.addEventListener('resize', updateScale);
        return () => window.removeEventListener('resize', updateScale);
    }, [updateScale, invoice?.invoice_data?.page_size, invoice?.invoice_data?.orientation]);

    useEffect(() => {
        const loadInvoice = async () => {
            const data = await fetchInvoice(id);
            if (data) {
                setInvoice(data);
            } else {
                router.push('/dashboard/invoice-maker');
            }
            setLoading(false);
        };
        loadInvoice();
    }, [id]);

    const handleSave = useCallback(async () => {
        if (!invoice || !hasChanges) return;
        setSaveStatus('saving');
        try {
            const { error } = await updateInvoice(id, {
                invoice_data: invoice.invoice_data,
                template_id: invoice.template_id
            });
            if (!error) {
                setSaveStatus('saved');
                setHasChanges(false);
                setTimeout(() => setSaveStatus('idle'), 3000);
            } else {
                setSaveStatus('idle');
            }
        } catch (error) {
            console.error('Save failed:', error);
            setSaveStatus('idle');
        }
    }, [id, invoice, hasChanges, updateInvoice]);

    // Auto-save
    useEffect(() => {
        if (!hasChanges) return;
        const timer = setTimeout(handleSave, 2000);
        return () => clearTimeout(timer);
    }, [hasChanges, handleSave]);

    const updateField = (path, value) => {
        setInvoice(prev => {
            const newData = { ...prev.invoice_data };
            const keys = path.split('.');
            let current = newData;
            for (let i = 0; i < keys.length - 1; i++) {
                current[keys[i]] = { ...current[keys[i]] };
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
            return { ...prev, invoice_data: newData };
        });
        setHasChanges(true);
    };

    const downloadInvoice = async () => {
        if (!exportRef.current) return;
        setDownloading(true);
        try {
            await document.fonts.ready;
            const html2canvas = (await import('html2canvas')).default;
            const canvas = await html2canvas(exportRef.current, {
                useCORS: true,
                scale: 3,
                backgroundColor: '#ffffff',
                logging: false,
                onclone: (clonedDoc) => {
                    const el = clonedDoc.querySelector('.export-item');
                    if (el) (el as HTMLElement).style.visibility = 'visible';
                }
            });
            const link = document.createElement('a');
            link.download = `receipt-${invoice?.invoice_data?.receipt_no || 'doc'}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            console.error('Download failed:', error);
        } finally {
            setDownloading(false);
        }
    };

    const downloadPdf = async () => {
        if (!exportRef.current) return;
        setDownloading(true);
        try {
            await document.fonts.ready;
            const html2canvas = (await import('html2canvas')).default;
            const canvas = await html2canvas(exportRef.current, {
                useCORS: true,
                scale: 2,
                backgroundColor: '#ffffff',
                logging: false,
                onclone: (clonedDoc) => {
                    const el = clonedDoc.querySelector('.export-item');
                    if (el) (el as HTMLElement).style.visibility = 'visible';
                }
            });
            const imgData = canvas.toDataURL('image/png');

            const orient = invoice.invoice_data.orientation === 'landscape' ? 'l' : 'p';
            const pdf = new jsPDF(orient, 'px', [canvas.width / 2, canvas.height / 2]);

            pdf.addImage(imgData, 'PNG', 0, 0, pdf.internal.pageSize.getWidth(), pdf.internal.pageSize.getHeight());
            pdf.save(`receipt-${invoice?.invoice_data?.receipt_no || 'doc'}.pdf`);
        } catch (error) {
            console.error('PDF download failed:', error);
        } finally {
            setDownloading(false);
        }
    };

    const downloadDocx = async () => {
        const data = invoice.invoice_data;
        const labels = { ...DEFAULT_LABELS, ...(data.labels || {}) };
        const templateId = invoice.template_id;
        const orientation = data.orientation === 'landscape' ? 'landscape' : 'portrait';

        // Page size calculations (twips)
        const SIZES_TWIPS = {
            A4: { width: 11906, height: 16838 },
            A5: { width: 8391, height: 11906 },
            A6: { width: 5953, height: 8391 },
            Letter: { width: 12240, height: 15840 },
            Legal: { width: 12240, height: 20160 },
            DL: { width: 6236, height: 12472 }
        };
        const size = SIZES_TWIPS[data.page_size || 'A4'];
        const pageWidth = orientation === 'landscape' ? size.height : size.width;
        const pageHeight = orientation === 'landscape' ? size.width : size.height;

        let logoImage = null;
        if (data.logo_url) {
            try {
                const response = await fetch(data.logo_url);
                const buffer = await response.arrayBuffer();
                logoImage = new ImageRun({
                    data: buffer,
                    transformation: { width: 60, height: 60 },
                } as any);
            } catch (e) { console.error("Logo fetch failed", e); }
        }

        const borderNone = { style: BorderStyle.NONE, size: 0, color: "auto" };
        const borderThin = { style: BorderStyle.SINGLE, size: 2, color: "e2e8f0" };
        const brandColor = (data.primary_color || "#1e3a8a").replace('#', '');
        const borderThick = { style: BorderStyle.SINGLE, size: 12, color: "1a1a1a" };

        // Helper for empty space
        const space = (size = 12) => new Paragraph({ children: [new TextRun({ text: "", size })] });

        // --- Template Constructors ---
        const createHeader = () => {
            if (templateId === 'modern') {
                return new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({
                                    children: [
                                        new Paragraph({
                                            children: [new TextRun({ text: labels.header_visa, color: "ffffff", size: 18 })],
                                            alignment: AlignmentType.LEFT
                                        }),
                                        new Paragraph({
                                            children: [new TextRun({ text: labels.header_edu, color: "ffffff", size: 18 })],
                                            alignment: AlignmentType.LEFT
                                        }),
                                        new Paragraph({
                                            children: [new TextRun({ text: labels.header_law, color: "ffffff", size: 18 })],
                                            alignment: AlignmentType.LEFT
                                        }),
                                    ],
                                    shading: { fill: brandColor, type: ShadingType.CLEAR, color: "auto" },
                                    verticalAlign: VerticalAlign.CENTER,
                                    margins: { left: 400, top: 400, bottom: 400 },
                                    borders: { top: borderNone, bottom: borderNone, left: borderNone, right: borderNone }
                                }),
                                new TableCell({
                                    children: [
                                        logoImage ? new Paragraph({ children: [logoImage], alignment: AlignmentType.CENTER }) : space(),
                                        new Paragraph({
                                            children: [new TextRun({ text: labels.company_name_en, color: "ffffff", bold: true, size: 24 })],
                                            alignment: AlignmentType.CENTER
                                        })
                                    ],
                                    shading: { fill: brandColor, type: ShadingType.CLEAR, color: "auto" },
                                    borders: { top: borderNone, bottom: borderNone, left: borderThin, right: borderThin }
                                }),
                                new TableCell({
                                    children: [
                                        new Paragraph({
                                            children: [new TextRun({ text: labels.company_prefix_ku, color: "ffffff", size: 20 })],
                                            alignment: AlignmentType.RIGHT
                                        }),
                                        new Paragraph({
                                            children: [new TextRun({ text: labels.company_name_ku, color: "ffffff", bold: true, size: 28 })],
                                            alignment: AlignmentType.RIGHT
                                        })
                                    ],
                                    shading: { fill: brandColor, type: ShadingType.CLEAR, color: "auto" },
                                    verticalAlign: VerticalAlign.CENTER,
                                    margins: { right: 400 },
                                    borders: { top: borderNone, bottom: borderNone, left: borderNone, right: borderNone }
                                })
                            ]
                        })
                    ]
                });
            } else if (templateId === 'minimal') {
                return new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({
                                    children: [
                                        new Paragraph({
                                            children: [new TextRun({ text: labels.company_name_en, bold: true, size: 48, color: "000000" })],
                                        }),
                                        new Paragraph({
                                            children: [
                                                new TextRun({ text: labels.company_prefix_ku + " ", size: 24 }),
                                                new TextRun({ text: labels.company_name_ku, bold: true, size: 24 })
                                            ],
                                        })
                                    ],
                                    borders: { bottom: { style: BorderStyle.SINGLE, size: 24, color: brandColor }, top: borderNone, left: borderNone, right: borderNone },
                                    margins: { bottom: 200 }
                                })
                            ]
                        })
                    ]
                });
            } else if (templateId === 'corporate') {
                return new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({
                                    children: [
                                        new Paragraph({
                                            children: [new TextRun({ text: labels.company_name_en, bold: true, size: 40, color: brandColor })],
                                        }),
                                        new Paragraph({
                                            children: [new TextRun({ text: labels.header_visa + " | " + labels.header_edu, size: 18, color: brandColor })],
                                        })
                                    ],
                                    borders: { top: { style: BorderStyle.SINGLE, size: 60, color: brandColor }, bottom: borderNone, left: borderNone, right: borderNone },
                                    margins: { top: 200 }
                                }),
                                new TableCell({
                                    children: [
                                        new Paragraph({
                                            children: [new TextRun({ text: labels.company_name_ku, bold: true, size: 32, color: brandColor })],
                                            alignment: AlignmentType.RIGHT
                                        }),
                                        new Paragraph({
                                            children: [new TextRun({ text: labels.company_prefix_ku, size: 20, color: "64748b" })],
                                            alignment: AlignmentType.RIGHT
                                        })
                                    ],
                                    borders: { top: { style: BorderStyle.SINGLE, size: 60, color: brandColor }, bottom: borderNone, left: borderNone, right: borderNone },
                                    margins: { top: 200 }
                                })
                            ]
                        })
                    ]
                });
            } else if (templateId === 'luxury') {
                return new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({
                                    children: [
                                        logoImage ? new Paragraph({ children: [logoImage], alignment: AlignmentType.CENTER }) : space(),
                                        new Paragraph({
                                            children: [new TextRun({ text: labels.company_name_en, bold: true, size: 44, color: brandColor })],
                                            alignment: AlignmentType.CENTER
                                        }),
                                        new Paragraph({
                                            children: [new TextRun({ text: labels.company_name_ku, size: 24, color: brandColor, italics: true })],
                                            alignment: AlignmentType.CENTER
                                        })
                                    ],
                                    shading: { fill: "fffcf5", type: ShadingType.CLEAR, color: "auto" },
                                    borders: { bottom: { style: BorderStyle.DOUBLE, size: 12, color: brandColor }, top: borderNone, left: borderNone, right: borderNone },
                                    margins: { bottom: 400, top: 400 }
                                })
                            ]
                        })
                    ]
                });
            } else if (templateId === 'compact') {
                return new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({
                                    children: [
                                        logoImage ? new Paragraph({ children: [new ImageRun({ data: (logoImage as any).options.data, transformation: { width: 30, height: 30 } } as any)] }) : space(),
                                    ],
                                    width: { size: 10, type: WidthType.PERCENTAGE },
                                    shading: { fill: brandColor, type: ShadingType.CLEAR, color: "auto" }
                                }),
                                new TableCell({
                                    children: [
                                        new Paragraph({ children: [new TextRun({ text: labels.company_name_en, bold: true, size: 24 })] }),
                                    ],
                                    width: { size: 45, type: WidthType.PERCENTAGE },
                                    shading: { fill: brandColor, type: ShadingType.CLEAR, color: "auto" }
                                }),
                                new TableCell({
                                    children: [
                                        new Paragraph({ children: [new TextRun({ text: labels.company_name_ku, bold: true, size: 24 })], alignment: AlignmentType.RIGHT }),
                                    ],
                                    width: { size: 45, type: WidthType.PERCENTAGE },
                                    shading: { fill: brandColor, type: ShadingType.CLEAR, color: "auto" }
                                })
                            ],
                        })
                    ]
                });
            } else { // Classic
                return new Table({
                    width: { size: 100, type: WidthType.PERCENTAGE },
                    rows: [
                        new TableRow({
                            children: [
                                new TableCell({
                                    children: [
                                        new Paragraph({ children: [new TextRun({ text: labels.header_visa, color: "ffffff", size: 18 })] }),
                                        new Paragraph({ children: [new TextRun({ text: labels.header_edu, color: "ffffff", size: 18 })] }),
                                        new Paragraph({ children: [new TextRun({ text: labels.header_law, color: "ffffff", size: 18 })] }),
                                    ],
                                    shading: { fill: brandColor, type: ShadingType.CLEAR, color: "auto" },
                                    borders: { bottom: { style: BorderStyle.SINGLE, size: 30, color: "facc15" }, top: borderNone, left: borderNone, right: borderNone },
                                    margins: { left: 400, top: 400, bottom: 400 }
                                }),
                                new TableCell({
                                    children: [
                                        logoImage ? new Paragraph({ children: [logoImage], alignment: AlignmentType.CENTER }) : space(),
                                        new Paragraph({
                                            children: [new TextRun({ text: labels.company_name_en, color: "ffffff", bold: true, size: 28 })],
                                            alignment: AlignmentType.CENTER
                                        })
                                    ],
                                    shading: { fill: brandColor, type: ShadingType.CLEAR, color: "auto" },
                                    borders: { bottom: { style: BorderStyle.SINGLE, size: 30, color: "facc15" }, top: borderNone, left: borderNone, right: borderNone }
                                }),
                                new TableCell({
                                    children: [
                                        new Paragraph({
                                            children: [new TextRun({ text: labels.company_prefix_ku, color: "facc15", size: 20 })],
                                            alignment: AlignmentType.RIGHT
                                        }),
                                        new Paragraph({
                                            children: [new TextRun({ text: labels.company_name_ku, color: "ffffff", bold: true, size: 32 })],
                                            alignment: AlignmentType.RIGHT
                                        })
                                    ],
                                    shading: { fill: brandColor, type: ShadingType.CLEAR, color: "auto" },
                                    borders: { bottom: { style: BorderStyle.SINGLE, size: 30, color: "facc15" }, top: borderNone, left: borderNone, right: borderNone },
                                    margins: { right: 400, top: 400, bottom: 400 }
                                })
                            ]
                        })
                    ]
                });
            }
        };

        const createInfoRow = () => {
            return new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({
                                children: [
                                    new Paragraph({
                                        children: [
                                            new TextRun({ text: labels.label_no_en + " ", bold: true }),
                                            new TextRun({ text: data.receipt_no || '', color: "ef4444" }),
                                            new TextRun({ text: " " + labels.label_no_ku, bold: true })
                                        ],
                                        spacing: { after: 200 }
                                    }),
                                    new Paragraph({
                                        children: [
                                            new TextRun({ text: labels.label_date_en + " ", bold: true }),
                                            new TextRun({ text: (data.date || '').replace(/-/g, ' / '), color: "ef4444" }),
                                            new TextRun({ text: " " + labels.label_date_ku, bold: true })
                                        ]
                                    })
                                ],
                                borders: { top: borderNone, bottom: borderNone, left: borderNone, right: borderNone },
                                margins: { top: 400, bottom: 400 }
                            }),
                            new TableCell({
                                children: [
                                    new Table({
                                        width: { size: 3000, type: WidthType.DXA },
                                        alignment: AlignmentType.RIGHT,
                                        rows: [
                                            new TableRow({
                                                children: [
                                                    new TableCell({
                                                        children: [new Paragraph({ children: [new TextRun({ text: data.amount_usd || '', bold: true, size: 28 })], alignment: AlignmentType.CENTER })],
                                                        borders: { top: borderThick, bottom: borderThick, left: borderThick, right: borderThick },
                                                        width: { size: 2000, type: WidthType.DXA }
                                                    }),
                                                    new TableCell({
                                                        children: [new Paragraph({ children: [new TextRun({ text: labels.label_usd_ku, size: 18, bold: true })], alignment: AlignmentType.CENTER })],
                                                        borders: { top: borderThick, bottom: borderThick, left: borderNone, right: borderThick },
                                                        shading: { fill: "f1f5f9", type: ShadingType.CLEAR, color: "auto" },
                                                        width: { size: 1000, type: WidthType.DXA }
                                                    })
                                                ]
                                            }),
                                            new TableRow({
                                                children: [
                                                    new TableCell({
                                                        children: [new Paragraph({ children: [new TextRun({ text: data.amount_iqd || '', bold: true, size: 28 })], alignment: AlignmentType.CENTER })],
                                                        borders: { top: borderNone, bottom: borderThick, left: borderThick, right: borderThick },
                                                    }),
                                                    new TableCell({
                                                        children: [new Paragraph({ children: [new TextRun({ text: labels.label_iqd_ku, size: 18, bold: true })], alignment: AlignmentType.CENTER })],
                                                        borders: { top: borderNone, bottom: borderThick, left: borderNone, right: borderThick },
                                                        shading: { fill: "f1f5f9", type: ShadingType.CLEAR, color: "auto" },
                                                    })
                                                ]
                                            })
                                        ]
                                    })
                                ],
                                borders: { top: borderNone, bottom: borderNone, left: borderNone, right: borderNone },
                                verticalAlign: VerticalAlign.CENTER
                            })
                        ]
                    })
                ]
            });
        };

        const createBody = () => {
            const lines = [
                { en: labels.label_received_en, val: data.received_from, ku: labels.label_received_ku },
                { en: labels.label_sum_en, val: data.sum_of, ku: labels.label_sum_ku },
                { en: labels.label_details_en, val: data.details, ku: labels.label_details_ku }
            ];

            return lines.map(line => {
                if (line.en === labels.label_details_en && !line.val) return space(0);
                return new Paragraph({
                    children: [
                        new TextRun({ text: line.en + " ", bold: true, size: 24 }),
                        new TextRun({ text: line.val || '', size: 28, italics: true }),
                        new TextRun({ text: " " + line.ku, bold: true, size: 24 })
                    ],
                    spacing: { before: 400, after: 400 },
                    border: { bottom: { style: BorderStyle.DOTTED, size: 12, color: "94a3b8" } }
                });
            });
        };

        const createSignatures = () => {
            return new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                    new TableRow({
                        children: [
                            new TableCell({
                                children: [
                                    new Paragraph({ border: { top: { style: BorderStyle.SINGLE, size: 12, color: "000000" } }, spacing: { before: 400 } }),
                                    new Paragraph({ children: [new TextRun({ text: labels.label_buyer_ku, bold: true })], alignment: AlignmentType.CENTER })
                                ],
                                borders: { top: borderNone, bottom: borderNone, left: borderNone, right: borderNone },
                                width: { size: 45, type: WidthType.PERCENTAGE }
                            }),
                            new TableCell({ children: [], width: { size: 10, type: WidthType.PERCENTAGE }, borders: { top: borderNone, bottom: borderNone, left: borderNone, right: borderNone } }),
                            new TableCell({
                                children: [
                                    new Paragraph({ border: { top: { style: BorderStyle.SINGLE, size: 12, color: "000000" } }, spacing: { before: 400 } }),
                                    new Paragraph({ children: [new TextRun({ text: labels.label_accountant_ku, bold: true })], alignment: AlignmentType.CENTER })
                                ],
                                borders: { top: borderNone, bottom: borderNone, left: borderNone, right: borderNone },
                                width: { size: 45, type: WidthType.PERCENTAGE }
                            })
                        ]
                    })
                ]
            });
        };

        const doc = new Document({
            sections: [
                {
                    properties: {
                        page: {
                            size: {
                                width: pageWidth,
                                height: pageHeight,
                            },
                        },
                    },
                    children: [
                        createHeader(),
                        space(400),
                        createInfoRow(),
                        space(400),
                        ...createBody(),
                        space(1000),
                        createSignatures(),
                        space(1000),
                        space(templateId === 'modern' ? 600 : 1000),
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: (data.contact_info?.phone || "") + (data.contact_info?.email ? " | " + data.contact_info.email : "") + (data.contact_info?.address ? " | " + data.contact_info.address : ""),
                                    size: 18,
                                    color: templateId === 'modern' || templateId === 'classic' ? "ffffff" : "64748b"
                                })
                            ],
                            alignment: AlignmentType.CENTER,
                            shading: {
                                fill: templateId === 'modern' ? "0f172a" : templateId === 'classic' ? "1e3a8a" : "ffffff",
                                color: "auto",
                                type: ShadingType.CLEAR
                            }
                        }),
                        (data.social_links?.facebook || data.social_links?.instagram || data.social_links?.snapchat || data.social_links?.tiktok) ? new Paragraph({
                            children: [
                                new TextRun({
                                    text: [
                                        data.social_links?.facebook ? "FB: " + data.social_links.facebook : null,
                                        data.social_links?.instagram ? "IG: " + data.social_links.instagram : null,
                                        data.social_links?.snapchat ? "SC: " + data.social_links.snapchat : null,
                                        data.social_links?.tiktok ? "TT: " + data.social_links.tiktok : null
                                    ].filter(Boolean).join("  |  "),
                                    size: 16,
                                    color: templateId === 'modern' ? "38bdf8" : "64748b",
                                    bold: true
                                })
                            ],
                            alignment: AlignmentType.CENTER,
                            spacing: { before: 200 }
                        }) : space(0)
                    ],
                },
            ],
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, `receipt-${data.receipt_no || 'doc'}.docx`);
    };

    if (loading) return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-6">
            <div className="w-12 h-12 border-4 border-neutral-100 border-t-blue-500 rounded-full animate-spin" />
            <span className="text-sm font-black text-neutral-400 uppercase tracking-widest animate-pulse">Initializing Protocol...</span>
        </div>
    );
    if (!invoice) return null;

    const { invoice_data: data } = invoice;
    const labels = { ...DEFAULT_LABELS, ...(data.labels || {}) };

    // Shared Content Component for both Preview and Export
    const InvoiceContent = ({ data, labels, template_id, isExport = false, contentRef }) => {
        const primaryColor = data.primary_color || '#1e3a8a';

        // Base Scale mapping
        const scaleMap = {
            'A4': 1,
            'A5': 0.8,
            'A6': 0.65,
            'Letter': 1,
            'Legal': 1,
            'DL': 0.55
        };
        const baseScale = scaleMap[data.page_size || 'A4'] || 1;

        // Size & Orientation mapping
        const sizes = {
            'A4': { p: [794, 1123], l: [1123, 794] },
            'A5': { p: [559, 794], l: [794, 559] },
            'A6': { p: [397, 559], l: [559, 397] },
            'Letter': { p: [816, 1056], l: [1056, 816] },
            'Legal': { p: [816, 1344], l: [1344, 816] },
            'DL': { p: [416, 831], l: [831, 416] }
        };

        const currentSize = sizes[data.page_size || 'A4']?.[data.orientation === 'landscape' ? 'l' : 'p'] || [794, 1123];
        const [width, height] = currentSize;

        // Dynamic spacing based on size/orientation
        const isSmall = data.page_size === 'A5' || data.page_size === 'A6' || data.orientation === 'landscape';
        const isVerySmall = (data.page_size === 'A5' && data.orientation === 'landscape') || data.page_size === 'A6';

        const spacing = {
            headerV: (isVerySmall ? 10 : isSmall ? 15 : 30) * baseScale,
            sectionV: (isVerySmall ? 15 : isSmall ? 20 : 30) * baseScale,
            footerV: (isVerySmall ? 8 : isSmall ? 10 : 20) * baseScale,
            signatureV: (isVerySmall ? 15 : isSmall ? 20 : 40) * baseScale,
            infoRowV: (isVerySmall ? 10 : isSmall ? 15 : 30) * baseScale,
        };

        return (
            <div
                className={`bg-white relative text-neutral-900 overflow-hidden flex flex-col shadow-2xl ${isExport ? 'export-item' : ''}`}
                style={{
                    width: `${width}px`,
                    height: `${height}px`,
                    fontFamily: "'Noto Kufi Arabic', 'Inter', sans-serif",
                    '--primary': primaryColor
                } as any}
                ref={contentRef}
            >
                {/* Header Section */}
                {template_id === 'minimal' ? (
                    <div className="flex flex-col items-start w-full px-10 pt-10 pb-5 mb-8" style={{ borderBottom: `${2 * baseScale}px solid ${primaryColor}` }}>
                        <div className="bg-black text-white p-2 rounded mb-4" style={{ width: `${50 * baseScale}px`, height: `${50 * baseScale}px` }}>
                            {data.logo_url ? <img src={data.logo_url} className="w-full h-full object-contain" /> : <span style={{ fontSize: `${24 * baseScale}px` }}>🪁</span>}
                        </div>
                        <h1 className="font-black text-black" style={{ fontSize: `${28 * baseScale}px` }}>{labels.company_name_en}</h1>
                        <div className="flex justify-between items-baseline w-full mt-2">
                            <div className="flex gap-2 text-black font-black" style={{ fontSize: `${18 * baseScale}px` }}>
                                <span>{labels.company_prefix_ku}</span>
                                <span>{labels.company_name_ku}</span>
                            </div>
                        </div>
                    </div>
                ) : template_id === 'modern' ? (
                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-5 px-10 text-white" style={{ padding: `${40 * baseScale}px`, background: `linear-gradient(135deg, ${primaryColor} 0%, #1e293b 100%)` }}>
                        <div className="opacity-80 leading-tight" style={{ fontSize: `${10 * baseScale}px` }}>
                            <div>{labels.header_visa}</div>
                            <div>{labels.header_edu}</div>
                            <div>{labels.header_law}</div>
                        </div>
                        <div className="flex flex-col items-center px-8 border-x border-white/10">
                            <div className="bg-white rounded-full overflow-hidden border-4 border-white/10 mb-2" style={{ width: `${80 * baseScale}px`, height: `${80 * baseScale}px` }}>
                                {data.logo_url ? <img src={data.logo_url} className="w-full h-full object-contain" /> : <div className="flex items-center justify-center h-full text-black" style={{ fontSize: `${32 * baseScale}px` }}>🪁</div>}
                            </div>
                            <div className="font-bold tracking-widest text-[#38bdf8]" style={{ fontSize: `${18 * baseScale}px` }}>{labels.company_name_en}</div>
                        </div>
                        <div className="text-right font-black" style={{ fontSize: `${20 * baseScale}px` }}>
                            {labels.company_prefix_ku} {labels.company_name_ku}
                        </div>
                    </div>
                ) : template_id === 'corporate' ? (
                    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-8 px-10 border-b-2 border-neutral-100" style={{ paddingTop: `${40 * baseScale}px`, paddingBottom: `${40 * baseScale}px`, borderTop: `${20 * baseScale}px solid ${primaryColor}` }}>
                        <div className="font-bold text-blue-500 leading-tight" style={{ fontSize: `${12 * baseScale}px` }}>
                            <div>{labels.header_visa}</div>
                            <div>{labels.header_edu}</div>
                            <div>{labels.header_law}</div>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="bg-neutral-100 rounded-lg overflow-hidden mb-2" style={{ width: `${60 * baseScale}px`, height: `${60 * baseScale}px` }}>
                                {data.logo_url ? <img src={data.logo_url} className="w-full h-full object-contain" /> : <div className="flex items-center justify-center h-full" style={{ fontSize: `${24 * baseScale}px` }}>🪁</div>}
                            </div>
                            <div className="font-black" style={{ fontSize: `${28 * baseScale}px`, color: primaryColor }}>{labels.company_name_en}</div>
                        </div>
                        <div className="text-right font-black" style={{ fontSize: `${20 * baseScale}px`, color: primaryColor }}>
                            {labels.company_prefix_ku} {labels.company_name_ku}
                        </div>
                    </div>
                ) : template_id === 'luxury' ? (
                    <div className="flex flex-col items-center text-center px-10 mx-14 border-b border-double border-[#d4af37]" style={{ paddingTop: `${60 * baseScale}px`, paddingBottom: `${60 * baseScale}px`, background: '#fffcf5' }}>
                        <div className="bg-white rounded-full border-2 overflow-hidden mb-4" style={{ width: `${90 * baseScale}px`, height: `${90 * baseScale}px`, borderColor: primaryColor }}>
                            {data.logo_url ? <img src={data.logo_url} className="w-full h-full object-contain" /> : <div className="flex items-center justify-center h-full" style={{ fontSize: `${32 * baseScale}px` }}>💎</div>}
                        </div>
                        <h1 className="font-serif uppercase tracking-[6px]" style={{ fontSize: `${42 * baseScale}px`, color: primaryColor }}>{labels.company_name_en}</h1>
                        <div className="font-black mt-2" style={{ fontSize: `${24 * baseScale}px`, color: primaryColor }}>
                            {labels.company_prefix_ku} {labels.company_name_ku}
                        </div>
                    </div>
                ) : (
                    /* Classic & Compact Header */
                    <div
                        className={`flex justify-between items-center px-10 text-white ${template_id === 'compact' ? 'h-[60px]' : ''}`}
                        style={{
                            paddingTop: `${(template_id === 'compact' ? 10 : 30) * baseScale}px`,
                            paddingBottom: `${(template_id === 'compact' ? 10 : 30) * baseScale}px`,
                            background: primaryColor,
                            borderBottom: template_id === 'compact' ? 'none' : `${5 * baseScale}px solid #facc15`
                        }}
                    >
                        <div className="flex flex-col gap-1 leading-tight" style={{ fontSize: `${11 * baseScale}px` }}>
                            <div>{labels.header_visa}</div>
                            <div>{labels.header_edu}</div>
                            <div>{labels.header_law}</div>
                        </div>
                        <div className="flex flex-col items-center">
                            <div className="bg-white rounded-full overflow-hidden flex items-center justify-center" style={{ width: `${(template_id === 'compact' ? 35 : 60) * baseScale}px`, height: `${(template_id === 'compact' ? 35 : 60) * baseScale}px` }}>
                                {data.logo_url ? <img src={data.logo_url} className="w-full h-full object-contain" /> : <span style={{ fontSize: `${(template_id === 'compact' ? 18 : 32) * baseScale}px` }}>🪁</span>}
                            </div>
                            <div className="font-black uppercase mt-1" style={{ fontSize: `${(template_id === 'compact' ? 14 : 20) * baseScale}px` }}>{labels.company_name_en}</div>
                        </div>
                        <div className="text-right text-[#facc15] font-black leading-tight" style={{ fontSize: `${(template_id === 'compact' ? 14 : 24) * baseScale}px` }}>
                            <div style={{ fontSize: `${14 * baseScale}px`, color: '#facc15' }}>{labels.company_prefix_ku}</div>
                            <div className="text-white">{labels.company_name_ku}</div>
                        </div>
                    </div>
                )}

                {/* Info Row (Receipt No, Date, Amounts) */}
                <div className={`flex justify-between w-full px-10 gap-10 mt-5 ${template_id === 'minimal' ? 'px-0 mb-10' : ''}`} style={{ paddingTop: spacing.infoRowV }}>
                    <div className="flex-1 flex flex-col gap-5">
                        <div className="flex items-end gap-3 font-semibold w-full" style={{ fontSize: `${14 * baseScale}px` }}>
                            <span className="text-neutral-500 min-w-fit">{labels.label_no_en}</span>
                            <span className="flex-1 border-b border-neutral-300 text-red-500 font-bold pb-1 px-2" style={{ fontSize: `${16 * baseScale}px` }}>{data.receipt_no}</span>
                            <span className="min-w-fit">{labels.label_no_ku}</span>
                        </div>
                        <div className="flex items-end gap-3 font-semibold w-full" style={{ fontSize: `${14 * baseScale}px` }}>
                            <span className="text-neutral-500 min-w-fit">{labels.label_date_en}</span>
                            <span className="flex-1 border-b border-neutral-300 text-red-500 font-bold pb-1 px-2" style={{ fontSize: `${16 * baseScale}px` }}>{data.date ? data.date.replace(/-/g, ' / ') : '202  /  / '}</span>
                            <span className="min-w-fit">{labels.label_date_ku}</span>
                        </div>
                    </div>
                    <div className="flex flex-col gap-3 flex-shrink-0">
                        <div className={`flex border-2 rounded overflow-hidden ${template_id === 'minimal' ? 'border' : ''}`} style={{ borderColor: primaryColor, width: `${(template_id === 'compact' ? 160 : 240) * baseScale}px` }}>
                            <span className="flex-1 bg-white p-2 font-black text-center" style={{ fontSize: `${(template_id === 'compact' ? 14 : 18) * baseScale}px` }}>{data.amount_usd}</span>
                            <span className="bg-neutral-100 flex items-center justify-center font-black" style={{ width: `${(template_id === 'compact' ? 60 : 100) * baseScale}px`, fontSize: `${(template_id === 'compact' ? 11 : 14) * baseScale}px` }}>{labels.label_usd_ku}</span>
                        </div>
                        <div className={`flex border-2 rounded overflow-hidden ${template_id === 'minimal' ? 'border' : ''}`} style={{ borderColor: primaryColor, width: `${(template_id === 'compact' ? 160 : 240) * baseScale}px` }}>
                            <span className="flex-1 bg-white p-2 font-black text-center" style={{ fontSize: `${(template_id === 'compact' ? 14 : 18) * baseScale}px` }}>{data.amount_iqd}</span>
                            <span className="bg-neutral-100 flex items-center justify-center font-black" style={{ width: `${(template_id === 'compact' ? 60 : 100) * baseScale}px`, fontSize: `${(template_id === 'compact' ? 11 : 14) * baseScale}px` }}>{labels.label_iqd_ku}</span>
                        </div>
                    </div>
                </div>

                {/* Body Content */}
                <div className={`flex flex-col flex-1 w-full px-10 mt-8 gap-8 ${template_id === 'minimal' ? 'px-0' : ''}`} style={{ paddingTop: spacing.sectionV }}>
                    <div className="flex items-end gap-3 w-full">
                        <span className="min-w-fit font-bold" style={{ fontSize: `${14 * baseScale}px` }}>{labels.label_received_en}</span>
                        <div className={`flex-1 font-bold pb-1 px-2 ${template_id === 'minimal' ? 'border-b border-primary-500' : 'border-b-2 border-dotted border-neutral-400'}`} style={{ fontSize: `${18 * baseScale}px` }}>{data.received_from}</div>
                        <span className="min-w-fit font-bold" style={{ fontSize: `${14 * baseScale}px` }}>{labels.label_received_ku}</span>
                    </div>
                    <div className="flex items-end gap-3 w-full">
                        <span className="min-w-fit font-bold" style={{ fontSize: `${14 * baseScale}px` }}>{labels.label_sum_en}</span>
                        <div className={`flex-1 font-bold pb-1 px-2 ${template_id === 'minimal' ? 'border-b border-primary-500' : 'border-b-2 border-dotted border-neutral-400'}`} style={{ fontSize: `${18 * baseScale}px` }}>{data.sum_of}</div>
                        <span className="min-w-fit font-bold" style={{ fontSize: `${14 * baseScale}px` }}>{labels.label_sum_ku}</span>
                    </div>
                    {data.details && (
                        <div className="flex items-end gap-3 w-full">
                            <span className="min-w-fit font-bold" style={{ fontSize: `${14 * baseScale}px` }}>{labels.label_details_en}</span>
                            <div className={`flex-1 font-bold pb-1 px-2 ${template_id === 'minimal' ? 'border-b border-primary-500' : 'border-b-2 border-dotted border-neutral-400'}`} style={{ fontSize: `${18 * baseScale}px` }}>{data.details}</div>
                            <span className="min-w-fit font-bold" style={{ fontSize: `${14 * baseScale}px` }}>{labels.label_details_ku}</span>
                        </div>
                    )}
                </div>

                {/* Signatures */}
                <div className={`flex justify-between w-full px-10 mt-auto ${template_id === 'minimal' ? 'px-0 py-10' : ''}`} style={{ paddingTop: spacing.signatureV, paddingBottom: spacing.signatureV }}>
                    <div className="text-center" style={{ width: `${220 * baseScale}px` }}>
                        <div className="mb-2 border-b-2" style={{ height: `${(isSmall ? 30 : 50) * baseScale}px`, borderBottomColor: primaryColor }}></div>
                        <span className="font-black uppercase tracking-wider" style={{ fontSize: `${13 * baseScale}px` }}>{labels.label_buyer_ku}</span>
                    </div>
                    <div className="text-center" style={{ width: `${220 * baseScale}px` }}>
                        <div className="mb-2 border-b-2" style={{ height: `${(isSmall ? 30 : 50) * baseScale}px`, borderBottomColor: primaryColor }}></div>
                        <span className="font-black uppercase tracking-wider" style={{ fontSize: `${13 * baseScale}px` }}>{labels.label_accountant_ku}</span>
                    </div>
                </div>

                {/* Social Footer */}
                {(data.social_links?.facebook || data.social_links?.instagram || data.social_links?.snapchat || data.social_links?.tiktok) && (
                    <div className={`flex justify-center border-t border-neutral-100 w-full px-10 ${template_id === 'modern' ? 'bg-neutral-50' : ''}`} style={{ paddingTop: spacing.footerV, paddingBottom: spacing.footerV, gap: `${30 * baseScale}px` }}>
                        {data.social_links?.facebook && (
                            <div className="flex items-center gap-2 font-bold text-neutral-600" style={{ fontSize: `${12 * baseScale}px` }}>
                                <Facebook size={14 * baseScale} />
                                <span>{data.social_links.facebook}</span>
                            </div>
                        )}
                        {data.social_links?.instagram && (
                            <div className="flex items-center gap-2 font-bold text-neutral-600" style={{ fontSize: `${12 * baseScale}px` }}>
                                <Instagram size={14 * baseScale} />
                                <span>{data.social_links.instagram}</span>
                            </div>
                        )}
                        {data.social_links?.snapchat && (
                            <div className="flex items-center gap-2 font-bold text-neutral-600" style={{ fontSize: `${12 * baseScale}px` }}>
                                <Snapchat size={14 * baseScale} />
                                <span>{data.social_links.snapchat}</span>
                            </div>
                        )}
                        {data.social_links?.tiktok && (
                            <div className="flex items-center gap-2 font-bold text-neutral-600" style={{ fontSize: `${12 * baseScale}px` }}>
                                <Music2 size={14 * baseScale} />
                                <span>{data.social_links.tiktok}</span>
                            </div>
                        )}
                    </div>
                )}

                {/* Bottom Contact Bar */}
                {(data.contact_info?.phone || data.contact_info?.email || data.contact_info?.address) && (
                    <div
                        className={`flex justify-between items-center px-10 w-full font-bold ${template_id === 'classic' ? 'text-white' : template_id === 'modern' ? 'bg-[#0f172a] text-white' : template_id === 'minimal' ? 'border-t-2 border-black mt-5 py-4 text-black' : ''}`}
                        style={{
                            paddingTop: spacing.footerV,
                            paddingBottom: spacing.footerV,
                            fontSize: `${11 * baseScale}px`,
                            background: template_id === 'classic' ? primaryColor : undefined,
                            borderColor: template_id === 'minimal' ? primaryColor : undefined
                        }}
                    >
                        {data.contact_info?.phone && <div className="flex items-center gap-1.5"><Phone size={12 * baseScale} /> {data.contact_info.phone}</div>}
                        {data.contact_info?.email && <div className="flex items-center gap-1.5"><Mail size={12 * baseScale} /> {data.contact_info.email}</div>}
                        {data.contact_info?.address && <div className="flex items-center gap-1.5"><MapPin size={12 * baseScale} /> {data.contact_info.address}</div>}
                    </div>
                )}
            </div>
        );
    };

    const brandColor = invoice?.invoice_data?.primary_color || '#1e3a8a';

    return (
        <div className="min-h-screen bg-[#f8fafc] flex flex-col font-sans selection:bg-primary-100 selection:text-primary-900 overflow-hidden">
            {/* OneKit 3.0: Workspace Header */}
            <header className="sticky top-0 z-[100] bg-white/80 backdrop-blur-2xl border-b border-neutral-200/50 px-4 lg:px-8 py-3 lg:py-4 flex items-center justify-between shadow-[0_2px_20px_-5px_rgba(0,0,0,0.05)] flex-shrink-0">
                <div className="flex items-center gap-3 lg:gap-6">
                    <button
                        onClick={() => router.push('/dashboard/invoice-maker')}
                        className="group flex items-center justify-center w-10 h-10 lg:w-11 lg:h-11 bg-white border border-neutral-200 rounded-2xl text-neutral-500 hover:text-neutral-900 hover:border-neutral-300 hover:shadow-xl hover:shadow-neutral-200/40 transition-all active:scale-95"
                    >
                        <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div>
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                            <h1 className="text-sm lg:text-base font-black text-neutral-900 uppercase tracking-tight truncate max-w-[150px] lg:max-w-none">
                                {invoice.name}
                            </h1>
                        </div>
                        <p className="hidden lg:block text-[10px] font-black text-neutral-400 uppercase tracking-widest leading-none">Financial Protocol v3.0</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 lg:gap-6">
                    {saveStatus !== 'idle' && (
                        <div className={`flex items-center gap-3 px-4 py-2 rounded-2xl border transition-all duration-500 ${saveStatus === 'saving' ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                            {saveStatus === 'saving' ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                            <span className="text-[10px] font-black uppercase tracking-widest">{saveStatus === 'saving' ? 'Syncing...' : 'Encrypted'}</span>
                        </div>
                    )}

                    <div className="flex gap-2">
                        <button
                            onClick={downloadInvoice}
                            disabled={downloading}
                            className="bg-white border border-neutral-200 p-3 rounded-2xl text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300 transition-all active:scale-95 disabled:opacity-50"
                        >
                            <ImageIcon size={20} />
                        </button>
                        <button
                            onClick={downloadDocx}
                            disabled={downloading}
                            className="bg-white border border-neutral-200 p-3 rounded-2xl text-neutral-600 hover:bg-neutral-50 hover:border-neutral-300 transition-all active:scale-95 disabled:opacity-50"
                        >
                            <FileText size={20} />
                        </button>
                        <button
                            onClick={downloadPdf}
                            disabled={downloading}
                            className="group relative flex items-center gap-3 px-6 lg:px-8 py-3 lg:py-4 bg-neutral-900 hover:bg-black text-white rounded-2xl transition-all font-black text-xs shadow-2xl shadow-neutral-900/20 active:scale-95 disabled:opacity-50"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl" />
                            <div className="relative flex items-center gap-3">
                                {downloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                                <span className="hidden sm:inline">EXPORT PROTOCOL</span>
                            </div>
                        </button>
                    </div>
                </div>
            </header>

            <main className="flex-1 flex overflow-hidden">
                {/* OneKit 3.0: Sidebar Navigation */}
                <aside className="hidden lg:flex flex-col w-80 bg-white border-r border-neutral-200/50 p-8 overflow-y-auto scrollbar-hide">
                    <div className="mb-10">
                        <h2 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-6">Discovery Engine</h2>
                        <nav className="space-y-2">
                            {SECTIONS.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 group ${activeSection === section.id ? 'bg-neutral-900 text-white shadow-xl shadow-neutral-900/20' : 'text-neutral-500 hover:bg-neutral-50 hover:text-neutral-900'}`}
                                >
                                    <div className={`p-2 rounded-xl transition-all duration-300 ${activeSection === section.id ? 'bg-white/10 text-white scale-110' : 'bg-neutral-100 text-neutral-400 group-hover:bg-white group-hover:text-neutral-900'}`}>
                                        {section.icon}
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest">{section.label}</span>
                                    {activeSection === section.id && (
                                        <div className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_10px_#3b82f6]" />
                                    )}
                                </button>
                            ))}
                        </nav>
                    </div>

                    <div className="mt-auto space-y-6">
                        <div className="p-6 bg-neutral-50 rounded-[32px] border border-neutral-200/50 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-12 -mt-12 transition-transform duration-700 group-hover:scale-150" />
                            <h3 className="text-xs font-black text-neutral-900 mb-2 relative">Financial Suite</h3>
                            <p className="text-[10px] text-neutral-500 leading-relaxed mb-4 relative">Calibrate multi-currency protocols and secure logs.</p>
                            <button className="w-full py-3 bg-white border border-neutral-200 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-neutral-300 transition-all active:scale-95">Upgrade</button>
                        </div>
                    </div>
                </aside>

                <div className="flex-1 overflow-y-auto bg-[#f8fafc] p-4 lg:p-10 scrollbar-hide">
                    <div className="max-w-4xl mx-auto space-y-10 pb-20">
                        {/* Mobile Navigation */}
                        <div className="lg:hidden flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
                            {SECTIONS.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`flex items-center gap-3 px-6 py-3 rounded-2xl whitespace-nowrap font-black text-[10px] uppercase tracking-widest transition-all ${activeSection === section.id ? 'bg-neutral-900 text-white shadow-lg' : 'bg-white text-neutral-500 border border-neutral-200'}`}
                                >
                                    {section.icon}
                                    {section.label}
                                </button>
                            ))}
                        </div>

                        {activeSection === 'identity' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <section className="p-8 lg:p-12 bg-white rounded-[40px] border border-neutral-200/50 shadow-premium-layered relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-110" />

                                    <div className="flex items-center gap-4 mb-10 pb-6 border-b border-neutral-100">
                                        <div className="p-3 bg-blue-500 text-white rounded-2xl shadow-lg shadow-blue-500/20">
                                            <User size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg lg:text-xl font-black text-neutral-900 uppercase tracking-tight">Identity Matrix</h3>
                                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Core Branding & Authentication</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Company Entity</label>
                                                <div className="relative group/input">
                                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-neutral-400 group-focus-within/input:text-blue-500 transition-colors">
                                                        <Globe size={18} />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        className="w-full pl-12 pr-6 py-4 bg-neutral-50 border border-neutral-100 rounded-[24px] text-sm font-bold text-neutral-900 placeholder:text-neutral-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
                                                        value={data.labels?.company_name_en ?? ''}
                                                        onChange={e => updateField('labels.company_name_en', e.target.value)}
                                                        placeholder={DEFAULT_LABELS.company_name_en}
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1 text-right block">ناوی قەوارە (کوردی)</label>
                                                <div className="relative group/input">
                                                    <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none text-neutral-400 group-focus-within/input:text-blue-500 transition-colors">
                                                        <Sparkles size={18} />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        className="w-full pr-12 pl-6 py-4 bg-neutral-50 border border-neutral-100 rounded-[24px] text-sm font-bold text-neutral-900 placeholder:text-neutral-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none text-right"
                                                        value={data.labels?.company_name_ku ?? ''}
                                                        onChange={e => updateField('labels.company_name_ku', e.target.value)}
                                                        placeholder={DEFAULT_LABELS.company_name_ku}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Protocol Logo</label>
                                                <div className="relative group/upload h-[134px]">
                                                    {data.logo_url ? (
                                                        <div className="relative h-full rounded-[24px] overflow-hidden border border-neutral-100 bg-neutral-50/50 backdrop-blur-sm p-4">
                                                            <img src={data.logo_url} alt="Logo" className="w-full h-full object-contain" />
                                                            <button
                                                                className="absolute top-3 right-3 p-2.5 bg-red-500 text-white rounded-xl shadow-lg opacity-0 group-hover/upload:opacity-100 transition-all hover:bg-red-600 active:scale-95"
                                                                onClick={() => updateField('logo_url', '')}
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    ) : (
                                                        <div className="relative h-full flex flex-col items-center justify-center gap-3 bg-neutral-50 border-2 border-dashed border-neutral-200 rounded-[24px] hover:bg-white hover:border-blue-500 hover:shadow-xl hover:shadow-blue-500/5 transition-all cursor-pointer overflow-hidden">
                                                            <input
                                                                type="file"
                                                                accept="image/*"
                                                                onChange={async (e) => {
                                                                    const file = e.target.files?.[0];
                                                                    if (!file) return;
                                                                    try {
                                                                        const publicUrl = await uploadImage(file, { folder: 'invoice-logos', type: 'logo' });
                                                                        if (publicUrl) updateField('logo_url', publicUrl);
                                                                    } catch (err) { console.error('Logo upload failed:', err); }
                                                                }}
                                                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                            />
                                                            <div className="p-3 bg-white rounded-2xl shadow-sm text-neutral-400 transition-colors group-hover:text-blue-500">
                                                                <Download size={24} />
                                                            </div>
                                                            <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Inject Brand Asset</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>

                                <section className="p-8 lg:p-12 bg-white rounded-[40px] border border-neutral-200/50 shadow-premium-layered relative overflow-hidden group">
                                    <div className="flex items-center gap-4 mb-10 pb-6 border-b border-neutral-100">
                                        <div className="p-3 bg-blue-500 text-white rounded-2xl shadow-lg shadow-blue-500/20">
                                            <Hash size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg lg:text-xl font-black text-neutral-900 uppercase tracking-tight">System Metadata</h3>
                                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Receipt Indexing & Time-stamping</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Sequence Number</label>
                                            <div className="relative group/input">
                                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-neutral-400 group-focus-within/input:text-blue-500 transition-colors">
                                                    <Hash size={18} />
                                                </div>
                                                <input
                                                    type="text"
                                                    className="w-full pl-12 pr-6 py-4 bg-neutral-50 border border-neutral-100 rounded-[24px] text-sm font-bold text-neutral-900 placeholder:text-neutral-300 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
                                                    value={data.receipt_no || ''}
                                                    onChange={e => updateField('receipt_no', e.target.value)}
                                                    placeholder="001"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Execution Date</label>
                                            <div className="relative group/input">
                                                <input
                                                    type="date"
                                                    className="w-full px-6 py-4 bg-neutral-50 border border-neutral-100 rounded-[24px] text-sm font-bold text-neutral-900 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/5 transition-all outline-none"
                                                    value={data.date || ''}
                                                    onChange={e => updateField('date', e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        )}

                        {activeSection === 'content' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <section className="p-8 lg:p-12 bg-white rounded-[40px] border border-neutral-200/50 shadow-premium-layered relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-110" />

                                    <div className="flex items-center gap-4 mb-10 pb-6 border-b border-neutral-100">
                                        <div className="p-3 bg-emerald-500 text-white rounded-2xl shadow-lg shadow-emerald-500/20">
                                            <LayoutPanelLeft size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg lg:text-xl font-black text-neutral-900 uppercase tracking-tight">Protocol Intel</h3>
                                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Transaction Details & Logging</p>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Received From (Subject)</label>
                                            <div className="relative group/input">
                                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-neutral-400 group-focus-within/input:text-emerald-500 transition-colors">
                                                    <User size={18} />
                                                </div>
                                                <input
                                                    type="text"
                                                    className="w-full pl-12 pr-6 py-4 bg-neutral-50 border border-neutral-100 rounded-[24px] text-sm font-bold text-neutral-900 placeholder:text-neutral-300 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none"
                                                    value={data.received_from || ''}
                                                    onChange={e => updateField('received_from', e.target.value)}
                                                    placeholder="Client or Entity Name"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">USD Allocation</label>
                                                <div className="relative group/input">
                                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-neutral-400 group-focus-within/input:text-emerald-500 transition-colors">
                                                        <DollarSign size={18} />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        className="w-full pl-12 pr-6 py-4 bg-neutral-50 border border-neutral-100 rounded-[24px] text-sm font-bold text-neutral-900 placeholder:text-neutral-300 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none"
                                                        value={data.amount_usd || ''}
                                                        onChange={e => updateField('amount_usd', e.target.value)}
                                                        placeholder="0.00"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1 text-right block">بڕی دینار (IQD)</label>
                                                <div className="relative group/input">
                                                    <div className="absolute inset-y-0 right-0 pr-5 flex items-center pointer-events-none text-neutral-400 group-focus-within/input:text-emerald-500 transition-colors">
                                                        <Hash size={18} />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        className="w-full pr-12 pl-6 py-4 bg-neutral-50 border border-neutral-100 rounded-[24px] text-sm font-bold text-neutral-900 placeholder:text-neutral-300 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none text-right"
                                                        value={data.amount_iqd || ''}
                                                        onChange={e => updateField('amount_iqd', e.target.value)}
                                                        placeholder="0"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Sum of (Literal)</label>
                                            <div className="relative group/input">
                                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-neutral-400 group-focus-within/input:text-emerald-500 transition-colors">
                                                    <MessageSquare size={18} />
                                                </div>
                                                <input
                                                    type="text"
                                                    className="w-full pl-12 pr-6 py-4 bg-neutral-50 border border-neutral-100 rounded-[24px] text-sm font-bold text-neutral-900 placeholder:text-neutral-300 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none"
                                                    value={data.sum_of || ''}
                                                    onChange={e => updateField('sum_of', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1 text-right block">تێبینییەکان (Details)</label>
                                            <div className="relative group/input">
                                                <textarea
                                                    className="w-full px-6 py-4 bg-neutral-50 border border-neutral-100 rounded-[24px] text-sm font-bold text-neutral-900 placeholder:text-neutral-300 focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 transition-all outline-none resize-none text-right min-h-[120px]"
                                                    value={data.details || ''}
                                                    onChange={e => updateField('details', e.target.value)}
                                                    rows={3}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        )}

                        {activeSection === 'labels' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <section className="p-8 lg:p-12 bg-white rounded-[40px] border border-neutral-200/50 shadow-premium-layered relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-110" />

                                    <div className="flex items-center gap-4 mb-10 pb-6 border-b border-neutral-100">
                                        <div className="p-3 bg-amber-500 text-white rounded-2xl shadow-lg shadow-amber-500/20">
                                            <Type size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg lg:text-xl font-black text-neutral-900 uppercase tracking-tight">Semantic Labels</h3>
                                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Interface Translation & Localization</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        {[
                                            { id: 'header_visa', label: 'Header Index 1', placeholder: DEFAULT_LABELS.header_visa },
                                            { id: 'header_edu', label: 'Header Index 2', placeholder: DEFAULT_LABELS.header_edu },
                                            { id: 'header_law', label: 'Header Index 3', placeholder: DEFAULT_LABELS.header_law },
                                            { id: 'label_usd_ku', label: 'Currency Symbol (USD)', placeholder: DEFAULT_LABELS.label_usd_ku },
                                            { id: 'label_iqd_ku', label: 'Currency Symbol (IQD)', placeholder: DEFAULT_LABELS.label_iqd_ku, rtl: true },
                                            { id: 'label_received_en', label: 'Receipt Header (EN)', placeholder: DEFAULT_LABELS.label_received_en },
                                            { id: 'label_received_ku', label: 'Receipt Header (KU)', placeholder: DEFAULT_LABELS.label_received_ku, rtl: true },
                                            { id: 'label_sum_en', label: 'Allocation Label (EN)', placeholder: DEFAULT_LABELS.label_sum_en },
                                            { id: 'label_sum_ku', label: 'Allocation Label (KU)', placeholder: DEFAULT_LABELS.label_sum_ku, rtl: true },
                                            { id: 'label_details_en', label: 'MetaData Label (EN)', placeholder: DEFAULT_LABELS.label_details_en },
                                            { id: 'label_details_ku', label: 'MetaData Label (KU)', placeholder: DEFAULT_LABELS.label_details_ku, rtl: true },
                                            { id: 'label_buyer_ku', label: 'Authentic Signature 1', placeholder: DEFAULT_LABELS.label_buyer_ku, rtl: true },
                                            { id: 'label_accountant_ku', label: 'Authentic Signature 2', placeholder: DEFAULT_LABELS.label_accountant_ku, rtl: true },
                                        ].map((field) => (
                                            <div key={field.id} className="space-y-2">
                                                <label className={`text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1 ${field.rtl ? 'text-right block' : ''}`}>{field.label}</label>
                                                <input
                                                    type="text"
                                                    className={`w-full px-6 py-4 bg-neutral-50 border border-neutral-100 rounded-[24px] text-sm font-bold text-neutral-900 placeholder:text-neutral-300 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 transition-all outline-none ${field.rtl ? 'text-right font-black' : ''}`}
                                                    value={data.labels?.[field.id] ?? ''}
                                                    onChange={e => updateField(`labels.${field.id}`, e.target.value)}
                                                    placeholder={field.placeholder}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            </div>
                        )}

                        {activeSection === 'contact' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <section className="p-8 lg:p-12 bg-white rounded-[40px] border border-neutral-200/50 shadow-premium-layered relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-fuchsia-500/5 rounded-full -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-110" />

                                    <div className="flex items-center gap-4 mb-10 pb-6 border-b border-neutral-100">
                                        <div className="p-3 bg-fuchsia-500 text-white rounded-2xl shadow-lg shadow-fuchsia-500/20">
                                            <Globe size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg lg:text-xl font-black text-neutral-900 uppercase tracking-tight">Channels</h3>
                                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Global Communication Hooks</p>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Phone Protocol</label>
                                                <div className="relative group/input">
                                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-neutral-400 group-focus-within/input:text-fuchsia-500 transition-colors">
                                                        <Phone size={18} />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        className="w-full pl-12 pr-6 py-4 bg-neutral-50 border border-neutral-100 rounded-[24px] text-sm font-bold text-neutral-900 placeholder:text-neutral-300 focus:bg-white focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-500/5 transition-all outline-none"
                                                        value={data.contact_info?.phone || ''}
                                                        onChange={e => updateField('contact_info.phone', e.target.value)}
                                                        placeholder="+964 --- ----"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Email Hash</label>
                                                <div className="relative group/input">
                                                    <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-neutral-400 group-focus-within/input:text-fuchsia-500 transition-colors">
                                                        <Mail size={18} />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        className="w-full pl-12 pr-6 py-4 bg-neutral-50 border border-neutral-100 rounded-[24px] text-sm font-bold text-neutral-900 placeholder:text-neutral-300 focus:bg-white focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-500/5 transition-all outline-none"
                                                        value={data.contact_info?.email || ''}
                                                        onChange={e => updateField('contact_info.email', e.target.value)}
                                                        placeholder="node@onekit.ai"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Geo-Location</label>
                                            <div className="relative group/input">
                                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-neutral-400 group-focus-within/input:text-fuchsia-500 transition-colors">
                                                    <MapPin size={18} />
                                                </div>
                                                <input
                                                    type="text"
                                                    className="w-full pl-12 pr-6 py-4 bg-neutral-50 border border-neutral-100 rounded-[24px] text-sm font-bold text-neutral-900 placeholder:text-neutral-300 focus:bg-white focus:border-fuchsia-500 focus:ring-4 focus:ring-fuchsia-500/5 transition-all outline-none"
                                                    value={data.contact_info?.address || ''}
                                                    onChange={e => updateField('contact_info.address', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
                                            {[
                                                { id: 'facebook', icon: <Facebook size={18} />, color: 'blue' },
                                                { id: 'instagram', icon: <Instagram size={18} />, color: 'pink' },
                                                { id: 'snapchat', icon: <Snapchat size={18} />, color: 'yellow' },
                                                { id: 'tiktok', icon: <Music2 size={18} />, color: 'neutral' },
                                            ].map((social) => (
                                                <div key={social.id} className="space-y-2">
                                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1 capitalize">{social.id}</label>
                                                    <div className="relative group/input">
                                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-400 group-focus-within/input:text-fuchsia-500 transition-colors">
                                                            {social.icon}
                                                        </div>
                                                        <input
                                                            type="text"
                                                            className="w-full pl-10 pr-4 py-3 bg-neutral-50 border border-neutral-100 rounded-2xl text-[10px] font-bold text-neutral-900 placeholder:text-neutral-300 focus:bg-white focus:border-fuchsia-500 transition-all outline-none"
                                                            value={data.social_links?.[social.id] || ''}
                                                            onChange={e => updateField(`social_links.${social.id}`, e.target.value)}
                                                            placeholder="@username"
                                                        />
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </section>
                            </div>
                        )}

                        {activeSection === 'visuals' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <section className="p-8 lg:p-12 bg-white rounded-[40px] border border-neutral-200/50 shadow-premium-layered relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-110" />

                                    <div className="flex items-center gap-4 mb-10 pb-6 border-b border-neutral-100">
                                        <div className="p-3 bg-indigo-500 text-white rounded-2xl shadow-lg shadow-indigo-500/20">
                                            <Palette size={24} />
                                        </div>
                                        <div>
                                            <h3 className="text-lg lg:text-xl font-black text-neutral-900 uppercase tracking-tight">Visual Matrix</h3>
                                            <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest">Aesthetic Calibration & Tokens</p>
                                        </div>
                                    </div>

                                    <div className="space-y-10">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Template Architecture</label>
                                                <div className="grid grid-cols-2 gap-3">
                                                    {['standard', 'premium'].map((t) => (
                                                        <button
                                                            key={t}
                                                            onClick={() => setInvoice({ ...invoice, template_id: t })}
                                                            className={`px-6 py-4 rounded-2xl border transition-all duration-300 text-[10px] font-black uppercase tracking-widest ${invoice.template_id === t ? 'bg-neutral-900 text-white border-neutral-900 shadow-xl' : 'bg-white border-neutral-200 text-neutral-500 hover:bg-neutral-50'}`}
                                                        >
                                                            {t} Blueprint
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1 text-primary-500">Brand Color Token</label>
                                                <div className="flex items-center gap-4 p-4 bg-neutral-50 border border-neutral-100 rounded-3xl group/color hover:border-indigo-500 transition-all">
                                                    <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-white shadow-premium">
                                                        <input
                                                            type="color"
                                                            onChange={e => updateField('primary_color', e.target.value)}
                                                            className="absolute inset-0 w-full h-full cursor-pointer scale-150"
                                                            value={data.primary_color || '#1e3a8a'}
                                                        />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        value={data.primary_color || '#1e3a8a'}
                                                        onChange={e => updateField('primary_color', e.target.value)}
                                                        className="flex-1 bg-transparent border-none text-sm font-black text-neutral-900 focus:ring-0 uppercase font-mono tracking-tighter"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-widest ml-1">Aspect Ratio</label>
                                                <div className="flex gap-3">
                                                    {[
                                                        { id: 'portrait', icon: <LayoutPanelLeft size={16} /> },
                                                        { id: 'landscape', icon: <Layout size={16} /> },
                                                    ].map((o) => (
                                                        <button
                                                            key={o.id}
                                                            onClick={() => updateField('orientation', o.id)}
                                                            className={`flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-2xl border transition-all duration-300 text-[10px] font-black uppercase tracking-widest ${data.orientation === o.id ? 'bg-neutral-900 text-white border-neutral-900 shadow-xl' : 'bg-white border-neutral-200 text-neutral-500 hover:bg-neutral-50'}`}
                                                        >
                                                            {o.icon}
                                                            {o.id}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        )}
                    </div>
                </div>

                {/* Preview Side */}
                <div
                    className={`hidden lg:flex flex-col w-[45%] bg-neutral-100 border-l border-neutral-200/50 p-8 lg:p-12 overflow-y-auto scrollbar-hide items-center justify-start sticky top-0 h-[calc(100vh-80px)] ${mobileView === 'preview' ? '!flex !w-full' : ''}`}
                    ref={containerRef}
                >
                    <div
                        className="bg-white shadow-premium-layered origin-top transition-all duration-500 ease-out rounded-[24px] overflow-hidden"
                        style={{
                            transform: `scale(${previewScale})`,
                        }}
                    >
                        <InvoiceContent data={data} labels={labels} template_id={invoice.template_id} contentRef={previewRef} />
                    </div>
                </div>
            </main>

            <div className="fixed inset-0 pointer-events-none opacity-0 overflow-hidden flex items-start justify-center">
                <div className="bg-white">
                    <InvoiceContent data={data} labels={labels} template_id={invoice.template_id} isExport={true} contentRef={exportRef} />
                </div>
            </div>
        </div>
    );
}
