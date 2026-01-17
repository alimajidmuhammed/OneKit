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
    Packer,
    Document,
    Paragraph,
    TextRun,
    AlignmentType,
    Table,
    TableRow,
    TableCell,
    WidthType,
    BorderStyle,
    VerticalAlign,
    ImageRun,
    ShadingType,
} from 'docx';
import { InvoicePDF } from '@/components/pdf/InvoicePDF';
import { PDFDownloadButton } from '@/components/ui/PDFDownloadButton';
import {
    Facebook,
    Instagram,
    Phone,
    Mail,
    MapPin,
    Music2,
    Ghost as Snapchat,
    Download,
    FileText,
    ChevronLeft,
    Layout,
    Type
} from 'lucide-react';
import styles from './invoice-editor.module.css';

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
    header_visa: '✈️ Service Title 1',
    header_edu: '🎓 Service Title 2',
    header_law: '⚖️ Service Title 3',
    company_name_en: 'Company Name',
    company_name_ku: 'ناوی کۆمپانیا',
    company_prefix_ku: 'کۆمپانیای',
    label_no_en: 'No.',
    label_no_ku: ':ژمارە',
    label_date_en: 'Date',
    label_date_ku: ':بەروار',
    label_usd_ku: 'USD دۆلار',
    label_iqd_ku: 'IQD دینار',
    label_received_en: 'Received from',
    label_received_ku: ':وەرگیرا لە',
    label_sum_en: 'Sum of',
    label_sum_ku: ':بـڕی',
    label_details_en: 'Details',
    label_details_ku: ':تێبینی',
    label_buyer_ku: 'Buyer / کریار',
    label_accountant_ku: 'Accountant / ژمێریار'
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
                    const el = clonedDoc.querySelector(`.${styles.exportItem}`);
                    if (el) el.style.visibility = 'visible';
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
                    const el = clonedDoc.querySelector(`.${styles.exportItem}`);
                    if (el) el.style.visibility = 'visible';
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
                });
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
                                        logoImage ? new Paragraph({ children: [new ImageRun({ data: logoImage.options.data, transformation: { width: 30, height: 30 } })] }) : space(),
                                    ],
                                    width: { size: 10, type: WidthType.PERCENTAGE }
                                }),
                                new TableCell({
                                    children: [
                                        new Paragraph({ children: [new TextRun({ text: labels.company_name_en, bold: true, size: 24 })] }),
                                    ],
                                    width: { size: 45, type: WidthType.PERCENTAGE }
                                }),
                                new TableCell({
                                    children: [
                                        new Paragraph({ children: [new TextRun({ text: labels.company_name_ku, bold: true, size: 24 })], alignment: AlignmentType.RIGHT }),
                                    ],
                                    width: { size: 45, type: WidthType.PERCENTAGE }
                                })
                            ],
                            shading: { fill: brandColor, type: ShadingType.CLEAR, color: "auto" }
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
                ],
                spacing: { before: 1000 }
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

        <div className={styles.loading}>
            <div className={styles.spinner} />
            <span>Loading Editor...</span>
        </div>
    );
    if (!invoice) return null;

    const { invoice_data: data } = invoice;
    const labels = { ...DEFAULT_LABELS, ...(data.labels || {}) };

    // Shared Content Component for both Preview and Export
    const InvoiceContent = ({ data, labels, template_id, isExport = false, contentRef }) => (
        <div
            className={`${styles.receipt} ${styles[`template-${template_id}`]} ${styles[`size-${data.page_size || 'A4'}`]} ${styles[`orient-${data.orientation || 'portrait'}`]} ${isExport ? styles.exportItem : ''}`}
            style={{
                '--primary-color': data.primary_color || '#1e3a8a',
                ...(isExport ? { transform: 'none', margin: 0 } : {})
            }}
            ref={contentRef}
        >
            {/* Header */}
            <div className={styles.receiptHeader}>
                <div className={styles.headerLeft}>
                    <div className={styles.headerIcons}>
                        <span>{labels.header_visa}</span>
                        <span>{labels.header_edu}</span>
                        <span>{labels.header_law}</span>
                    </div>
                </div>
                <div className={styles.headerCenter}>
                    <div className={styles.logoCircle}>
                        {data.logo_url ? (
                            <img src={data.logo_url} alt="Logo" className={styles.uploadedLogo} />
                        ) : (
                            <div className={styles.logoIcon}>🪁</div>
                        )}
                    </div>
                    <div className={styles.companyNameEn}>{labels.company_name_en}</div>
                </div>
                <div className={styles.headerRight}>
                    <div className={styles.kurdishName}>
                        {labels.company_prefix_ku}
                        <span>{labels.company_name_ku}</span>
                    </div>
                </div>
            </div>

            {/* Top Info Row */}
            <div className={styles.receiptInfoRow}>
                <div className={styles.infoLeft}>
                    <div className={styles.infoField}>
                        <span>{labels.label_no_en}</span>
                        <span className={styles.fieldValue}>{data.receipt_no}</span>
                        <span className={styles.fieldLabelAr}>{labels.label_no_ku}</span>
                    </div>
                    <div className={styles.infoField}>
                        <span>{labels.label_date_en}</span>
                        <span className={styles.fieldValue}>{data.date ? data.date.replace(/-/g, ' / ') : '202  /  / '}</span>
                        <span className={styles.fieldLabelAr}>{labels.label_date_ku}</span>
                    </div>
                </div>
                <div className={styles.infoRight}>
                    <div className={styles.currencyBoxes}>
                        <div className={styles.currencyBox}>
                            <span className={styles.boxValue}>{data.amount_usd}</span>
                            <span className={styles.boxLabel}>{labels.label_usd_ku}</span>
                        </div>
                        <div className={styles.currencyBox}>
                            <span className={styles.boxValue}>{data.amount_iqd}</span>
                            <span className={styles.boxLabel}>{labels.label_iqd_ku}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Body */}
            <div className={styles.receiptBody}>
                <div className={styles.dottedLineGroup}>
                    <span className={styles.lineLabel}>{labels.label_received_en}</span>
                    <div className={styles.dottedLine}>{data.received_from}</div>
                    <span className={styles.lineLabelAr}>{labels.label_received_ku}</span>
                </div>
                <div className={styles.dottedLineGroup}>
                    <span className={styles.lineLabel}>{labels.label_sum_en}</span>
                    <div className={styles.dottedLine}>{data.sum_of}</div>
                    <span className={styles.lineLabelAr}>{labels.label_sum_ku}</span>
                </div>
                {data.details && (
                    <div className={styles.dottedLineGroup}>
                        <span className={styles.lineLabel}>{labels.label_details_en}</span>
                        <div className={styles.dottedLine}>{data.details}</div>
                        <span className={styles.lineLabelAr}>{labels.label_details_ku}</span>
                    </div>
                )}
            </div>

            {/* Signatures */}
            <div className={styles.signatures}>
                <div className={styles.sigBox}>
                    <div className={styles.sigLine}></div>
                    <span>{labels.label_buyer_ku}</span>
                </div>
                <div className={styles.sigBox}>
                    <div className={styles.sigLine}></div>
                    <span>{labels.label_accountant_ku}</span>
                </div>
            </div>

            {/* Social Footer */}
            {(data.social_links?.facebook || data.social_links?.instagram || data.social_links?.snapchat || data.social_links?.tiktok) && (
                <div className={styles.socialFooter}>
                    {data.social_links?.facebook && (
                        <div className={styles.socialItem}>
                            <Facebook size={14} className={styles.socialIcon} />
                            <span>{data.social_links.facebook}</span>
                        </div>
                    )}
                    {data.social_links?.instagram && (
                        <div className={styles.socialItem}>
                            <Instagram size={14} className={styles.socialIcon} />
                            <span>{data.social_links.instagram}</span>
                        </div>
                    )}
                    {data.social_links?.snapchat && (
                        <div className={styles.socialItem}>
                            <Snapchat size={14} className={styles.socialIcon} />
                            <span>{data.social_links.snapchat}</span>
                        </div>
                    )}
                    {data.social_links?.tiktok && (
                        <div className={styles.socialItem}>
                            <Music2 size={14} className={styles.socialIcon} />
                            <span>{data.social_links.tiktok}</span>
                        </div>
                    )}
                </div>
            )}

            {/* Bottom Bar */}
            {(data.contact_info?.phone || data.contact_info?.email || data.contact_info?.address) && (
                <div className={styles.bottomBar}>
                    {data.contact_info?.phone && (
                        <div className={styles.contactItem}>
                            <Phone size={12} /> {data.contact_info.phone}
                        </div>
                    )}
                    {data.contact_info?.email && (
                        <div className={styles.contactItem}>
                            <Mail size={12} /> {data.contact_info.email}
                        </div>
                    )}
                    {data.contact_info?.address && (
                        <div className={styles.contactItem}>
                            <MapPin size={12} /> {data.contact_info.address}
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    return (

        <div className={styles.editor}>
            <div className={styles.topBar}>
                <button onClick={() => router.push('/dashboard/invoice-maker')} className={styles.backBtn}>
                    <ChevronLeft size={18} />
                    Back
                </button>
                <h1>{invoice.name}</h1>
                <div className={styles.actions}>
                    <div className={styles.mobileToggle}>
                        <button
                            className={`${styles.toggleBtn} ${mobileView === 'edit' ? styles.toggleActive : ''}`}
                            onClick={() => setMobileView('edit')}
                        >
                            Edit
                        </button>
                        <button
                            className={`${styles.toggleBtn} ${mobileView === 'preview' ? styles.toggleActive : ''}`}
                            onClick={() => setMobileView('preview')}
                        >
                            Preview
                        </button>
                    </div>
                    <span className={styles.saveStatus}>
                        {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved ✓' : ''}
                    </span>
                    <button onClick={downloadDocx} className={styles.docxBtn}>
                        <FileText size={18} />
                        DOCX
                    </button>
                    <PDFDownloadButton
                        document={<InvoicePDF invoice={invoice} labels={labels} brandColor={brandColor} />}
                        fileName={`invoice-${invoice.invoice_id || 'new'}.pdf`}
                        className={styles.pdfBtn}
                        label="HQ PDF"
                    />
                    <button onClick={downloadInvoice} disabled={downloading} className={styles.downloadBtn}>
                        {downloading ? (
                            'Preparing...'
                        ) : (
                            <>
                                <Download size={18} />
                                PNG
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className={styles.container}>
                {/* Form Side */}
                <div className={`${styles.formSide} ${mobileView !== 'edit' ? styles.mobileHidden : ''}`}>
                    <section className={styles.formSection}>
                        <div className={styles.sectionHeader}>
                            <Layout size={18} />
                            <h3>Layout & Size</h3>
                        </div>
                        <div className={styles.field}>
                            <label>Template Style</label>
                            <div className={styles.templateSwitcher}>
                                {TEMPLATES.map(t => (
                                    <button
                                        key={t.id}
                                        className={`${styles.templateOption} ${invoice.template_id === t.id ? styles.templateActive : ''}`}
                                        onClick={() => {
                                            setInvoice(prev => ({ ...prev, template_id: t.id }));
                                            setHasChanges(true);
                                        }}
                                    >
                                        <span>{t.icon}</span>
                                        {t.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className={styles.field}>
                            <label>Page Size</label>
                            <div className={styles.sizeSwitcher}>
                                {SIZES.map(s => (
                                    <button
                                        key={s.id}
                                        className={`${styles.sizeOption} ${data.page_size === s.id ? styles.sizeActive : ''}`}
                                        onClick={() => updateField('page_size', s.id)}
                                    >
                                        <span className={styles.sizeName}>{s.id}</span>
                                        <span className={styles.sizeDesc}>{s.desc}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className={styles.field}>
                            <label>Orientation</label>
                            <div className={styles.sizeSwitcher}>
                                {ORIENTATIONS.map(orient => (
                                    <div
                                        key={orient.id}
                                        className={`${styles.sizeOption} ${data.orientation === orient.id ? styles.sizeActive : ''}`}
                                        onClick={() => updateField('orientation', orient.id)}
                                    >
                                        <span>{orient.icon}</span>
                                        <span className={styles.sizeName}>{orient.name}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className={styles.field} style={{ marginTop: 'var(--space-4)' }}>
                            <label>Primary Brand Color</label>
                            <div className={styles.colorPickerContainer}>
                                <input
                                    type="color"
                                    value={data.primary_color || '#1e3a8a'}
                                    onChange={e => updateField('primary_color', e.target.value)}
                                    className={styles.colorPicker}
                                />
                                <input
                                    type="text"
                                    value={data.primary_color || '#1e3a8a'}
                                    onChange={e => updateField('primary_color', e.target.value)}
                                    className={styles.colorInput}
                                />
                            </div>
                        </div>
                    </section>

                    <section className={styles.formSection}>
                        <div className={styles.sectionHeader}>
                            <Type size={18} />
                            <h3>Labels & Text</h3>
                        </div>
                        <div className={styles.grid}>
                            <div className={styles.field}>
                                <label>Company Name (EN)</label>
                                <input
                                    type="text"
                                    value={data.labels?.company_name_en ?? ''}
                                    onChange={e => updateField('labels.company_name_en', e.target.value)}
                                    placeholder={DEFAULT_LABELS.company_name_en}
                                />
                            </div>
                            <div className={styles.field}>
                                <label>Company Name (KU)</label>
                                <input
                                    type="text"
                                    value={data.labels?.company_name_ku ?? ''}
                                    onChange={e => updateField('labels.company_name_ku', e.target.value)}
                                    placeholder={DEFAULT_LABELS.company_name_ku}
                                />
                            </div>
                        </div>
                        <div className={styles.grid}>
                            <div className={styles.field}>
                                <label>Header Left 1</label>
                                <input
                                    type="text"
                                    value={data.labels?.header_visa ?? ''}
                                    onChange={e => updateField('labels.header_visa', e.target.value)}
                                    placeholder={DEFAULT_LABELS.header_visa}
                                />
                            </div>
                            <div className={styles.field}>
                                <label>Header Left 2</label>
                                <input
                                    type="text"
                                    value={data.labels?.header_edu ?? ''}
                                    onChange={e => updateField('labels.header_edu', e.target.value)}
                                    placeholder={DEFAULT_LABELS.header_edu}
                                />
                            </div>
                        </div>
                        <div className={styles.grid}>
                            <div className={styles.field}>
                                <label>Header Left 3</label>
                                <input
                                    type="text"
                                    value={data.labels?.header_law ?? ''}
                                    onChange={e => updateField('labels.header_law', e.target.value)}
                                    placeholder={DEFAULT_LABELS.header_law}
                                />
                            </div>
                            <div className={styles.field}>
                                <label>Company Prefix (KU)</label>
                                <input
                                    type="text"
                                    value={data.labels?.company_prefix_ku ?? ''}
                                    onChange={e => updateField('labels.company_prefix_ku', e.target.value)}
                                    placeholder={DEFAULT_LABELS.company_prefix_ku}
                                />
                            </div>
                        </div>

                        <div className={styles.grid}>
                            <div className={styles.field}>
                                <label>USD Label</label>
                                <input
                                    type="text"
                                    value={data.labels?.label_usd_ku ?? ''}
                                    onChange={e => updateField('labels.label_usd_ku', e.target.value)}
                                    placeholder={DEFAULT_LABELS.label_usd_ku}
                                />
                            </div>
                            <div className={styles.field}>
                                <label>IQD Label</label>
                                <input
                                    type="text"
                                    value={data.labels?.label_iqd_ku ?? ''}
                                    onChange={e => updateField('labels.label_iqd_ku', e.target.value)}
                                    placeholder={DEFAULT_LABELS.label_iqd_ku}
                                />
                            </div>
                        </div>

                        <div className={styles.grid}>
                            <div className={styles.field}>
                                <label>Received From Label (EN)</label>
                                <input
                                    type="text"
                                    value={data.labels?.label_received_en ?? ''}
                                    onChange={e => updateField('labels.label_received_en', e.target.value)}
                                    placeholder={DEFAULT_LABELS.label_received_en}
                                />
                            </div>
                            <div className={styles.field}>
                                <label>Received From Label (KU)</label>
                                <input
                                    type="text"
                                    value={data.labels?.label_received_ku ?? ''}
                                    onChange={e => updateField('labels.label_received_ku', e.target.value)}
                                    placeholder={DEFAULT_LABELS.label_received_ku}
                                />
                            </div>
                        </div>

                        <div className={styles.grid}>
                            <div className={styles.field}>
                                <label>Sum Of Label (EN)</label>
                                <input
                                    type="text"
                                    value={data.labels?.label_sum_en ?? ''}
                                    onChange={e => updateField('labels.label_sum_en', e.target.value)}
                                    placeholder={DEFAULT_LABELS.label_sum_en}
                                />
                            </div>
                            <div className={styles.field}>
                                <label>Sum Of Label (KU)</label>
                                <input
                                    type="text"
                                    value={data.labels?.label_sum_ku ?? ''}
                                    onChange={e => updateField('labels.label_sum_ku', e.target.value)}
                                    placeholder={DEFAULT_LABELS.label_sum_ku}
                                />
                            </div>
                        </div>

                        <div className={styles.grid}>
                            <div className={styles.field}>
                                <label>Details Label (EN)</label>
                                <input
                                    type="text"
                                    value={data.labels?.label_details_en ?? ''}
                                    onChange={e => updateField('labels.label_details_en', e.target.value)}
                                    placeholder={DEFAULT_LABELS.label_details_en}
                                />
                            </div>
                            <div className={styles.field}>
                                <label>Details Label (KU)</label>
                                <input
                                    type="text"
                                    value={data.labels?.label_details_ku ?? ''}
                                    onChange={e => updateField('labels.label_details_ku', e.target.value)}
                                    placeholder={DEFAULT_LABELS.label_details_ku}
                                />
                            </div>
                        </div>

                        <div className={styles.grid}>
                            <div className={styles.field}>
                                <label>Buyer Signature Label</label>
                                <input
                                    type="text"
                                    value={data.labels?.label_buyer_ku ?? ''}
                                    onChange={e => updateField('labels.label_buyer_ku', e.target.value)}
                                    placeholder={DEFAULT_LABELS.label_buyer_ku}
                                />
                            </div>
                            <div className={styles.field}>
                                <label>Accountant Signature Label</label>
                                <input
                                    type="text"
                                    value={data.labels?.label_accountant_ku ?? ''}
                                    onChange={e => updateField('labels.label_accountant_ku', e.target.value)}
                                    placeholder={DEFAULT_LABELS.label_accountant_ku}
                                />
                            </div>
                        </div>
                    </section>

                    <section className={styles.formSection}>
                        <h3>Logo & Branding</h3>
                        <div className={styles.field}>
                            <label>Company Logo</label>
                            <input
                                type="file"
                                accept="image/*"
                                onChange={async (e) => {
                                    const file = e.target.files?.[0];
                                    if (!file) return;
                                    try {
                                        const publicUrl = await uploadImage(file, { folder: 'invoice-logos', type: 'logo' });
                                        if (publicUrl) {
                                            updateField('logo_url', publicUrl);
                                        }
                                    } catch (err) {
                                        console.error('Logo upload failed:', err);
                                    }
                                }}
                            />
                        </div>
                    </section>

                    <section className={styles.formSection}>
                        <h3>Basic Info</h3>
                        <div className={styles.grid}>
                            <div className={styles.field}>
                                <label>Receipt No / ژمارە</label>
                                <input
                                    type="text"
                                    value={data.receipt_no || ''}
                                    onChange={e => updateField('receipt_no', e.target.value)}
                                />
                            </div>
                            <div className={styles.field}>
                                <label>Date / بەروار</label>
                                <input
                                    type="date"
                                    value={data.date || ''}
                                    onChange={e => updateField('date', e.target.value)}
                                />
                            </div>
                        </div>
                    </section>

                    <section className={styles.formSection}>
                        <h3>Amounts</h3>
                        <div className={styles.grid}>
                            <div className={styles.field}>
                                <label>USD Amount</label>
                                <input
                                    type="text"
                                    value={data.amount_usd || ''}
                                    onChange={e => updateField('amount_usd', e.target.value)}
                                />
                            </div>
                            <div className={styles.field}>
                                <label>IQD Amount</label>
                                <input
                                    type="text"
                                    value={data.amount_iqd || ''}
                                    onChange={e => updateField('amount_iqd', e.target.value)}
                                />
                            </div>
                        </div>
                    </section>

                    <section className={styles.formSection}>
                        <h3>Content</h3>
                        <div className={styles.field}>
                            <label>Received From / وەرگیرا لە</label>
                            <input
                                type="text"
                                value={data.received_from || ''}
                                onChange={e => updateField('received_from', e.target.value)}
                            />
                        </div>
                        <div className={styles.field}>
                            <label>Sum Of / بڕی</label>
                            <input
                                type="text"
                                value={data.sum_of || ''}
                                onChange={e => updateField('sum_of', e.target.value)}
                            />
                        </div>
                        <div className={styles.field}>
                            <label>Details / تێبینی</label>
                            <textarea
                                value={data.details || ''}
                                onChange={e => updateField('details', e.target.value)}
                                rows={3}
                            />
                        </div>
                    </section>

                    <section className={styles.formSection}>
                        <h3>Contact & Socials</h3>
                        <div className={styles.grid}>
                            <div className={styles.field}>
                                <label>Phone</label>
                                <input
                                    type="text"
                                    value={data.contact_info?.phone || ''}
                                    onChange={e => updateField('contact_info.phone', e.target.value)}
                                />
                            </div>
                            <div className={styles.field}>
                                <label>Email</label>
                                <input
                                    type="text"
                                    value={data.contact_info?.email || ''}
                                    onChange={e => updateField('contact_info.email', e.target.value)}
                                />
                            </div>
                        </div>
                        <div className={styles.field}>
                            <label>Address</label>
                            <input
                                type="text"
                                value={data.contact_info?.address || ''}
                                onChange={e => updateField('contact_info.address', e.target.value)}
                            />
                        </div>
                        <div className={styles.grid}>
                            <div className={styles.field}>
                                <label>Facebook</label>
                                <input
                                    type="text"
                                    value={data.social_links?.facebook || ''}
                                    onChange={e => updateField('social_links.facebook', e.target.value)}
                                    placeholder="@username"
                                />
                            </div>
                            <div className={styles.field}>
                                <label>Instagram</label>
                                <input
                                    type="text"
                                    value={data.social_links?.instagram || ''}
                                    onChange={e => updateField('social_links.instagram', e.target.value)}
                                    placeholder="@username"
                                />
                            </div>
                        </div>
                        <div className={styles.grid}>
                            <div className={styles.field}>
                                <label>Snapchat</label>
                                <input
                                    type="text"
                                    value={data.social_links?.snapchat || ''}
                                    onChange={e => updateField('social_links.snapchat', e.target.value)}
                                    placeholder="@username"
                                />
                            </div>
                            <div className={styles.field}>
                                <label>TikTok</label>
                                <input
                                    type="text"
                                    value={data.social_links?.tiktok || ''}
                                    onChange={e => updateField('social_links.tiktok', e.target.value)}
                                    placeholder="@username"
                                />
                            </div>
                        </div>
                    </section>
                </div>




                {/* Preview Side */}
                <div className={`${styles.previewSide} ${mobileView !== 'preview' ? styles.mobileHidden : ''}`} ref={containerRef}>
                    <div
                        className={styles.previewContainer}
                        style={{
                            transform: `scale(${previewScale})`,
                            transformOrigin: 'top center'
                        }}
                    >
                        <InvoiceContent data={data} labels={labels} template_id={invoice.template_id} contentRef={previewRef} />
                    </div>
                </div>
            </div>

            <div className={styles.exportWrapper}>
                <InvoiceContent data={data} labels={labels} template_id={invoice.template_id} isExport={true} contentRef={exportRef} />
            </div>
        </div>
    );
}
