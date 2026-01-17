// @ts-nocheck
'use client';

import React, { useState, useEffect } from 'react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { Download, Loader2 } from 'lucide-react';

interface PDFDownloadButtonProps {
    document: React.ReactElement;
    fileName: string;
    className?: string;
    label?: string;
}

/**
 * Reusable PDF Download button that handles client-side only rendering 
 * to avoid hydration issues with @react-pdf/renderer
 */
export const PDFDownloadButton = ({ document, fileName, className = '', label = 'Download PDF' }: PDFDownloadButtonProps) => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) {
        return (
            <button disabled className={className} style={{ opacity: 0.7, cursor: 'not-allowed' }}>
                <Loader2 className="animate-spin mr-2" size={16} />
                Preparing...
            </button>
        );
    }

    return (
        <PDFDownloadLink
            document={document}
            fileName={fileName}
            className={className}
        >
            {({ blob, url, loading, error }) =>
                loading ? (
                    <>
                        <Loader2 className="animate-spin mr-2" size={16} />
                        Generating...
                    </>
                ) : (
                    <>
                        <Download size={16} className="mr-2" />
                        {label}
                    </>
                )
            }
        </PDFDownloadLink>
    );
};
