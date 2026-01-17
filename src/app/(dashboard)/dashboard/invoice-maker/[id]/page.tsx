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
    Type,
    Check,
    Loader2,
    X,
    Save
} from 'lucide-react';

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
                className={`bg-white relative text-neutral-900 overflow-hidden flex flex-col shadow-2xl ${isExport ? '' : ''}`}
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

    return (

        <div className="min-h-screen bg-neutral-50 flex flex-col">
            {/* Top Bar */}
            <div className="sticky top-0 z-[100] flex items-center justify-between gap-4 px-4 py-3 bg-white border-b border-neutral-200">
                <button
                    onClick={() => router.push('/dashboard/invoice-maker')}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-neutral-600 hover:bg-neutral-50 rounded-xl border border-neutral-200 transition-all active:scale-95"
                >
                    <ChevronLeft size={18} />
                    Back
                </button>
                <h1 className="flex-1 text-lg font-black text-neutral-900 truncate">
                    {invoice.name}
                </h1>
                <div className="flex items-center gap-4">
                    {/* Mobile View Toggle */}
                    <div className="lg:hidden flex bg-neutral-100 p-1 rounded-xl border border-neutral-200">
                        <button
                            className={`px-4 py-1.5 text-xs font-black rounded-lg transition-all ${mobileView === 'edit' ? 'bg-white text-primary-600 shadow-sm' : 'text-neutral-500'}`}
                            onClick={() => setMobileView('edit')}
                        >
                            Edit
                        </button>
                        <button
                            className={`px-4 py-1.5 text-xs font-black rounded-lg transition-all ${mobileView === 'preview' ? 'bg-white text-primary-600 shadow-sm' : 'text-neutral-500'}`}
                            onClick={() => setMobileView('preview')}
                        >
                            Preview
                        </button>
                    </div>

                    <span className="text-xs font-black text-primary-600">
                        {saveStatus === 'saving' ? (
                            <span className="flex items-center gap-2">
                                <Loader2 size={12} className="animate-spin" />
                                Saving...
                            </span>
                        ) : saveStatus === 'saved' ? (
                            <span className="flex items-center gap- gap-1">
                                <Check size={12} />
                                Saved
                            </span>
                        ) : ''}
                    </span>

                    <button
                        onClick={downloadDocx}
                        className="hidden sm:flex items-center gap-2 px-6 py-2 bg-white text-neutral-900 border border-neutral-200 rounded-xl text-sm font-black hover:bg-neutral-50 hover:border-primary-500 transition-all active:scale-95"
                    >
                        <FileText size={18} />
                        DOCX
                    </button>
                    <PDFDownloadButton
                        document={<InvoicePDF invoice={invoice} labels={labels} brandColor={brandColor} />}
                        fileName={`invoice-${invoice.invoice_id || 'new'}.pdf`}
                        className="hidden md:flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-xl text-sm font-black hover:bg-red-700 shadow-lg shadow-red-600/20 transition-all active:scale-95"
                        label="HQ PDF"
                    />
                    <button
                        onClick={downloadInvoice}
                        disabled={downloading}
                        className="flex items-center gap-2 px-6 py-2 bg-primary-600 text-white rounded-xl text-sm font-black hover:bg-primary-700 shadow-lg shadow-primary-600/20 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {downloading ? (
                            <Loader2 size={18} className="animate-spin" />
                        ) : (
                            <>
                                <Download size={18} />
                                PNG
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 max-w-[1800px] flex-1 grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-8">
                {/* Form Side */}
                <div className={`flex flex-col gap-6 h-[calc(100vh-160px)] overflow-y-auto pr-2 custom-scrollbar ${mobileView !== 'edit' ? 'hidden lg:flex' : 'flex'}`}>
                    {/* Layout & Size */}
                    <section className="bg-white p-6 rounded-[2rem] border border-neutral-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 text-neutral-900">
                            <Layout size={20} className="text-primary-500" />
                            <h3 className="text-sm font-black uppercase tracking-wider">Layout & Size</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="flex flex-col gap-3">
                                <label className="text-xs font-black text-neutral-500 uppercase tracking-tight">Template Style</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {TEMPLATES.map(t => (
                                        <button
                                            key={t.id}
                                            className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${invoice.template_id === t.id ? 'bg-primary-50 border-primary-500 text-primary-700 shadow-sm' : 'bg-neutral-50 border-neutral-100 text-neutral-500 hover:border-neutral-300'}`}
                                            onClick={() => {
                                                setInvoice(prev => ({ ...prev, template_id: t.id }));
                                                setHasChanges(true);
                                            }}
                                        >
                                            <span className="text-2xl">{t.icon}</span>
                                            <span className="text-[11px] font-black">{t.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <label className="text-xs font-black text-neutral-500 uppercase tracking-tight">Page Size</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {SIZES.map(s => (
                                        <button
                                            key={s.id}
                                            className={`flex flex-col items-center gap-1 p-3 rounded-2xl border transition-all ${data.page_size === s.id ? 'bg-primary-50 border-primary-500 text-primary-700 shadow-sm' : 'bg-neutral-50 border-neutral-100 text-neutral-500 hover:border-neutral-300'}`}
                                            onClick={() => updateField('page_size', s.id)}
                                        >
                                            <span className="text-sm font-black">{s.id}</span>
                                            <span className="text-[10px] font-bold opacity-60 uppercase">{s.desc}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <label className="text-xs font-black text-neutral-500 uppercase tracking-tight">Orientation</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {ORIENTATIONS.map(orient => (
                                        <button
                                            key={orient.id}
                                            className={`flex flex-col items-center gap-1 p-3 rounded-2xl border transition-all ${data.orientation === orient.id ? 'bg-primary-50 border-primary-500 text-primary-700 shadow-sm' : 'bg-neutral-50 border-neutral-100 text-neutral-500 hover:border-neutral-300'}`}
                                            onClick={() => updateField('orientation', orient.id)}
                                        >
                                            <span className="text-xl">{orient.icon}</span>
                                            <span className="text-sm font-black">{orient.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <label className="text-xs font-black text-neutral-500 uppercase tracking-tight">Primary Brand Color</label>
                                <div className="flex items-center gap-3 p-3 bg-neutral-50 border border-neutral-100 rounded-2xl group hover:border-primary-300 transition-all">
                                    <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-neutral-200">
                                        <input
                                            type="color"
                                            value={data.primary_color || '#1e3a8a'}
                                            onChange={e => updateField('primary_color', e.target.value)}
                                            className="absolute inset-0 w-full h-full cursor-pointer scale-150"
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        value={data.primary_color || '#1e3a8a'}
                                        onChange={e => updateField('primary_color', e.target.value)}
                                        className="flex-1 bg-transparent border-none text-sm font-black text-neutral-900 focus:ring-0 uppercase font-mono"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Labels & Text */}
                    <section className="bg-white p-6 rounded-[2rem] border border-neutral-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 text-neutral-900">
                            <Type size={20} className="text-primary-500" />
                            <h3 className="text-sm font-black uppercase tracking-wider">Labels & Text</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider">Company Name (EN)</label>
                                    <input
                                        type="text"
                                        className="w-full p-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold placeholder:text-neutral-300 focus:bg-white focus:border-primary-500 transition-all outline-none"
                                        value={data.labels?.company_name_en ?? ''}
                                        onChange={e => updateField('labels.company_name_en', e.target.value)}
                                        placeholder={DEFAULT_LABELS.company_name_en}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider">Company Name (KU)</label>
                                    <input
                                        type="text"
                                        className="w-full p-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold placeholder:text-neutral-300 focus:bg-white focus:border-primary-500 transition-all outline-none text-right"
                                        value={data.labels?.company_name_ku ?? ''}
                                        onChange={e => updateField('labels.company_name_ku', e.target.value)}
                                        placeholder={DEFAULT_LABELS.company_name_ku}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider">Header Left 1</label>
                                    <input
                                        type="text"
                                        className="w-full p-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-primary-500 transition-all outline-none"
                                        value={data.labels?.header_visa ?? ''}
                                        onChange={e => updateField('labels.header_visa', e.target.value)}
                                        placeholder={DEFAULT_LABELS.header_visa}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider">Header Left 2</label>
                                    <input
                                        type="text"
                                        className="w-full p-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-primary-500 transition-all outline-none"
                                        value={data.labels?.header_edu ?? ''}
                                        onChange={e => updateField('labels.header_edu', e.target.value)}
                                        placeholder={DEFAULT_LABELS.header_edu}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider">Header Left 3</label>
                                    <input
                                        type="text"
                                        className="w-full p-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-primary-500 transition-all outline-none"
                                        value={data.labels?.header_law ?? ''}
                                        onChange={e => updateField('labels.header_law', e.target.value)}
                                        placeholder={DEFAULT_LABELS.header_law}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider">Company Prefix (KU)</label>
                                    <input
                                        type="text"
                                        className="w-full p-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-primary-500 transition-all outline-none text-right"
                                        value={data.labels?.company_prefix_ku ?? ''}
                                        onChange={e => updateField('labels.company_prefix_ku', e.target.value)}
                                        placeholder={DEFAULT_LABELS.company_prefix_ku}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider">USD Label</label>
                                    <input
                                        type="text"
                                        className="w-full p-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-primary-500 transition-all outline-none"
                                        value={data.labels?.label_usd_ku ?? ''}
                                        onChange={e => updateField('labels.label_usd_ku', e.target.value)}
                                        placeholder={DEFAULT_LABELS.label_usd_ku}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider">IQD Label</label>
                                    <input
                                        type="text"
                                        className="w-full p-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-primary-500 transition-all outline-none text-right"
                                        value={data.labels?.label_iqd_ku ?? ''}
                                        onChange={e => updateField('labels.label_iqd_ku', e.target.value)}
                                        placeholder={DEFAULT_LABELS.label_iqd_ku}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider">Received From (EN)</label>
                                    <input
                                        type="text"
                                        className="w-full p-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-primary-500 transition-all outline-none"
                                        value={data.labels?.label_received_en ?? ''}
                                        onChange={e => updateField('labels.label_received_en', e.target.value)}
                                        placeholder={DEFAULT_LABELS.label_received_en}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider">Received From (KU)</label>
                                    <input
                                        type="text"
                                        className="w-full p-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-primary-500 transition-all outline-none text-right"
                                        value={data.labels?.label_received_ku ?? ''}
                                        onChange={e => updateField('labels.label_received_ku', e.target.value)}
                                        placeholder={DEFAULT_LABELS.label_received_ku}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider">Sum Of Label (EN)</label>
                                    <input
                                        type="text"
                                        className="w-full p-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-primary-500 transition-all outline-none"
                                        value={data.labels?.label_sum_en ?? ''}
                                        onChange={e => updateField('labels.label_sum_en', e.target.value)}
                                        placeholder={DEFAULT_LABELS.label_sum_en}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider">Sum Of Label (KU)</label>
                                    <input
                                        type="text"
                                        className="w-full p-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-primary-500 transition-all outline-none text-right"
                                        value={data.labels?.label_sum_ku ?? ''}
                                        onChange={e => updateField('labels.label_sum_ku', e.target.value)}
                                        placeholder={DEFAULT_LABELS.label_sum_ku}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider">Details Label (EN)</label>
                                    <input
                                        type="text"
                                        className="w-full p-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-primary-500 transition-all outline-none"
                                        value={data.labels?.label_details_en ?? ''}
                                        onChange={e => updateField('labels.label_details_en', e.target.value)}
                                        placeholder={DEFAULT_LABELS.label_details_en}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider">Details Label (KU)</label>
                                    <input
                                        type="text"
                                        className="w-full p-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-primary-500 transition-all outline-none text-right"
                                        value={data.labels?.label_details_ku ?? ''}
                                        onChange={e => updateField('labels.label_details_ku', e.target.value)}
                                        placeholder={DEFAULT_LABELS.label_details_ku}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider">Buyer Signature Label</label>
                                    <input
                                        type="text"
                                        className="w-full p-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-primary-500 transition-all outline-none text-right"
                                        value={data.labels?.label_buyer_ku ?? ''}
                                        onChange={e => updateField('labels.label_buyer_ku', e.target.value)}
                                        placeholder={DEFAULT_LABELS.label_buyer_ku}
                                    />
                                </div>
                                <div className="flex flex-col gap-2 uppercase tracking-wider">
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider">Accountant Signature Label</label>
                                    <input
                                        type="text"
                                        className="w-full p-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-primary-500 transition-all outline-none text-right"
                                        value={data.labels?.label_accountant_ku ?? ''}
                                        onChange={e => updateField('labels.label_accountant_ku', e.target.value)}
                                        placeholder={DEFAULT_LABELS.label_accountant_ku}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Logo & Branding */}
                    <section className="bg-white p-6 rounded-[2rem] border border-neutral-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 text-neutral-900">
                            <Plus size={20} className="text-primary-500" />
                            <h3 className="text-sm font-black uppercase tracking-wider">Logo & Branding</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider">Company Logo</label>
                                <div className="relative group">
                                    {data.logo_url ? (
                                        <div className="relative h-32 rounded-2xl overflow-hidden border border-neutral-200 bg-neutral-50">
                                            <img src={data.logo_url} alt="Logo" className="w-full h-full object-contain p-4" />
                                            <button
                                                className="absolute top-2 right-2 p-2 bg-red-600 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity active:scale-95"
                                                onClick={() => updateField('logo_url', '')}
                                            >
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="relative flex flex-col items-center justify-center gap-3 p-8 bg-neutral-50 border-2 border-dashed border-neutral-200 rounded-2xl hover:bg-neutral-100 hover:border-primary-300 transition-all cursor-pointer">
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
                                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                            />
                                            <Download className="text-neutral-300 group-hover:text-primary-500 transition-colors" size={32} />
                                            <span className="text-xs font-bold text-neutral-500">Upload Logo</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Basic Info */}
                    <section className="bg-white p-6 rounded-[2rem] border border-neutral-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 text-neutral-900">
                            <FileText size={20} className="text-primary-500" />
                            <h3 className="text-sm font-black uppercase tracking-wider">Basic Info</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider">Receipt No / ژمارە</label>
                                    <input
                                        type="text"
                                        className="w-full p-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-primary-500 transition-all outline-none"
                                        value={data.receipt_no || ''}
                                        onChange={e => updateField('receipt_no', e.target.value)}
                                        placeholder="001"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider">Date / بەروار</label>
                                    <input
                                        type="date"
                                        className="w-full p-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-primary-500 transition-all outline-none"
                                        value={data.date || ''}
                                        onChange={e => updateField('date', e.target.value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Amounts */}
                    <section className="bg-white p-6 rounded-[2rem] border border-neutral-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 text-neutral-900">
                            <span className="text-xl">💰</span>
                            <h3 className="text-sm font-black uppercase tracking-wider">Amounts</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider">USD Amount</label>
                                    <input
                                        type="text"
                                        className="w-full p-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-primary-500 transition-all outline-none"
                                        value={data.amount_usd || ''}
                                        onChange={e => updateField('amount_usd', e.target.value)}
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider">IQD Amount</label>
                                    <input
                                        type="text"
                                        className="w-full p-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-primary-500 transition-all outline-none text-right"
                                        value={data.amount_iqd || ''}
                                        onChange={e => updateField('amount_iqd', e.target.value)}
                                        placeholder="0"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Content */}
                    <section className="bg-white p-6 rounded-[2rem] border border-neutral-200 shadow-sm">
                        <div className="flex items-center gap-2 mb-6 text-neutral-900">
                            <Type size={20} className="text-primary-500" />
                            <h3 className="text-sm font-black uppercase tracking-wider">Content</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="flex flex-col gap-2 text-right">
                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider">Received From / وەرگیرا لە</label>
                                <input
                                    type="text"
                                    className="w-full p-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-primary-500 transition-all outline-none text-right"
                                    value={data.received_from || ''}
                                    onChange={e => updateField('received_from', e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-2 text-right">
                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider">Sum Of / بڕی</label>
                                <input
                                    type="text"
                                    className="w-full p-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-primary-500 transition-all outline-none text-right"
                                    value={data.sum_of || ''}
                                    onChange={e => updateField('sum_of', e.target.value)}
                                />
                            </div>
                            <div className="flex flex-col gap-2 text-right">
                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider">Details / تێبینی</label>
                                <textarea
                                    className="w-full p-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-primary-500 transition-all outline-none resize-none text-right"
                                    value={data.details || ''}
                                    onChange={e => updateField('details', e.target.value)}
                                    rows={3}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Contact & Socials */}
                    <section className="bg-white p-6 rounded-[2rem] border border-neutral-200 shadow-sm mb-8">
                        <div className="flex items-center gap-2 mb-6 text-neutral-900">
                            <Phone size={20} className="text-primary-500" />
                            <h3 className="text-sm font-black uppercase tracking-wider">Contact & Socials</h3>
                        </div>

                        <div className="space-y-4">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider">Phone</label>
                                    <input
                                        type="text"
                                        className="w-full p-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-primary-500 transition-all outline-none"
                                        value={data.contact_info?.phone || ''}
                                        onChange={e => updateField('contact_info.phone', e.target.value)}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider">Email</label>
                                    <input
                                        type="text"
                                        className="w-full p-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-primary-500 transition-all outline-none"
                                        value={data.contact_info?.email || ''}
                                        onChange={e => updateField('contact_info.email', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider">Address</label>
                                <input
                                    type="text"
                                    className="w-full p-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-primary-500 transition-all outline-none"
                                    value={data.contact_info?.address || ''}
                                    onChange={e => updateField('contact_info.address', e.target.value)}
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider">Facebook</label>
                                    <input
                                        type="text"
                                        className="w-full p-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-primary-500 transition-all outline-none"
                                        value={data.social_links?.facebook || ''}
                                        onChange={e => updateField('social_links.facebook', e.target.value)}
                                        placeholder="@username"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider">Instagram</label>
                                    <input
                                        type="text"
                                        className="w-full p-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-primary-500 transition-all outline-none"
                                        value={data.social_links?.instagram || ''}
                                        onChange={e => updateField('social_links.instagram', e.target.value)}
                                        placeholder="@username"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider">Snapchat</label>
                                    <input
                                        type="text"
                                        className="w-full p-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-primary-500 transition-all outline-none"
                                        value={data.social_links?.snapchat || ''}
                                        onChange={e => updateField('social_links.snapchat', e.target.value)}
                                        placeholder="@username"
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black text-neutral-400 uppercase tracking-wider">TikTok</label>
                                    <input
                                        type="text"
                                        className="w-full p-4 bg-neutral-50 border border-neutral-100 rounded-2xl text-sm font-bold focus:bg-white focus:border-primary-500 transition-all outline-none"
                                        value={data.social_links?.tiktok || ''}
                                        onChange={e => updateField('social_links.tiktok', e.target.value)}
                                        placeholder="@username"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Preview Side */}
                <div
                    className={`bg-neutral-100 rounded-[2.5rem] border border-neutral-200 shadow-inner overflow-hidden flex flex-col items-center justify-start p-4 sm:p-8 min-h-[600px] lg:h-[calc(100vh-160px)] sticky top-32 ${mobileView !== 'preview' ? 'hidden lg:flex' : 'flex'}`}
                    ref={containerRef}
                >
                    <div
                        className="bg-white shadow-2xl origin-top transition-transform duration-300 ease-out"
                        style={{
                            transform: `scale(${previewScale})`,
                        }}
                    >
                        <InvoiceContent data={data} labels={labels} template_id={invoice.template_id} contentRef={previewRef} />
                    </div>
                </div>
            </div>

            <div className="fixed inset-0 pointer-events-none opacity-0 overflow-hidden flex items-start justify-center">
                <div className="bg-white">
                    <InvoiceContent data={data} labels={labels} template_id={invoice.template_id} isExport={true} contentRef={exportRef} />
                </div>
            </div>
        </div>
    );
}
