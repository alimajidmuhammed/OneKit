// @ts-nocheck
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';

// Register fonts if needed (e.g., for Kurdish/Arabic support)
// For now, we'll use standard fonts, but high-quality RTL needs extra configuration
/*
Font.register({
  family: 'Roboto',
  src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf'
});
*/

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontSize: 10,
        fontFamily: 'Helvetica',
        color: '#333',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        borderBottom: '2pt solid #eee',
        paddingBottom: 10,
    },
    logoContainer: {
        width: 60,
        height: 60,
    },
    companyInfo: {
        textAlign: 'right',
    },
    companyName: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    invoiceTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000',
        marginBottom: 10,
    },
    detailsSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    detailColumn: {
        width: '45%',
    },
    label: {
        fontSize: 10,
        color: '#666',
        marginBottom: 2,
        fontWeight: 'bold',
    },
    value: {
        fontSize: 12,
        marginBottom: 8,
    },
    table: {
        display: 'table',
        width: 'auto',
        marginBottom: 20,
        borderStyle: 'solid',
        borderColor: '#eee',
        borderWidth: 1,
        borderRightWidth: 0,
        borderBottomWidth: 0,
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomColor: '#eee',
        borderBottomWidth: 1,
        alignItems: 'center',
        height: 24,
        fontStyle: 'bold',
    },
    tableColHeader: {
        width: '25%',
        borderStyle: 'solid',
        borderRightWidth: 1,
        borderColor: '#eee',
        backgroundColor: '#f9f9f9',
        padding: 5,
    },
    tableCol: {
        width: '25%',
        borderStyle: 'solid',
        borderRightWidth: 1,
        borderColor: '#eee',
        padding: 5,
    },
    tableCellHeader: {
        margin: 'auto',
        fontSize: 10,
        fontWeight: 'bold',
    },
    tableCell: {
        margin: 'auto',
        fontSize: 10,
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        borderTop: '1pt solid #eee',
        paddingTop: 10,
        textAlign: 'center',
        color: '#999',
        fontSize: 8,
    },
    totalSection: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 10,
    },
    totalBox: {
        width: 150,
        padding: 10,
        backgroundColor: '#fefefe',
        border: '1pt solid #eee',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 5,
    },
    grandTotal: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#000',
        borderTop: '1pt solid #eee',
        paddingTop: 5,
        marginTop: 5,
    }
});

interface InvoicePDFProps {
    invoice: any;
    labels: any;
    brandColor?: string;
}

export const InvoicePDF = ({ invoice, labels, brandColor = '#3b82f6' }: InvoicePDFProps) => {
    if (!invoice) return null;

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {/* Header */}
                <View style={[styles.header, { borderBottomColor: brandColor }]}>
                    <View>
                        <Text style={[styles.invoiceTitle, { color: brandColor }]}>INVOICE</Text>
                        <Text style={styles.value}>#{invoice.invoice_id || '---'}</Text>
                    </View>
                    <View style={styles.companyInfo}>
                        <Text style={[styles.companyName, { color: brandColor }]}>{labels.company_name_en}</Text>
                        <Text style={styles.value}>{labels.company_name_ku}</Text>
                    </View>
                </View>

                {/* Details Sections */}
                <View style={styles.detailsSection}>
                    <View style={styles.detailColumn}>
                        <Text style={styles.label}>{labels.label_received_en}</Text>
                        <Text style={styles.value}>{invoice.received_from || '---'}</Text>
                        <Text style={styles.label}>{labels.label_received_ku}</Text>
                    </View>
                    <View style={styles.detailColumn}>
                        <Text style={styles.label}>{labels.label_date_en} / {labels.label_date_ku}</Text>
                        <Text style={styles.value}>{invoice.date || '---'}</Text>
                    </View>
                </View>

                {/* Amount Table */}
                <View style={styles.table}>
                    <View style={styles.tableRow}>
                        <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Description</Text></View>
                        <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Currency</Text></View>
                        <View style={styles.tableColHeader}><Text style={styles.tableCellHeader}>Amount</Text></View>
                    </View>
                    <View style={styles.tableRow}>
                        <View style={styles.tableCol}><Text style={styles.tableCell}>{invoice.details || 'Payment'}</Text></View>
                        <View style={styles.tableCol}><Text style={styles.tableCell}>USD</Text></View>
                        <View style={styles.tableCol}><Text style={styles.tableCell}>{invoice.amount_usd || '0.00'}</Text></View>
                    </View>
                    {invoice.amount_iqd > 0 && (
                        <View style={styles.tableRow}>
                            <View style={styles.tableCol}><Text style={styles.tableCell}>{invoice.details || 'Payment'}</Text></View>
                            <View style={styles.tableCol}><Text style={styles.tableCell}>IQD</Text></View>
                            <View style={styles.tableCol}><Text style={styles.tableCell}>{invoice.amount_iqd || '0'}</Text></View>
                        </View>
                    )}
                </View>

                {/* Total Section */}
                <View style={styles.totalSection}>
                    <View style={styles.totalBox}>
                        <View style={styles.totalRow}>
                            <Text style={styles.label}>TOTAL USD:</Text>
                            <Text style={styles.value}>${invoice.amount_usd || '0.00'}</Text>
                        </View>
                        <View style={styles.totalRow}>
                            <Text style={styles.label}>TOTAL IQD:</Text>
                            <Text style={styles.value}>{invoice.amount_iqd || '0'} د.ع</Text>
                        </View>
                    </View>
                </View>

                {/* Footer */}
                <View style={styles.footer}>
                    <Text>Generated by OneKit - Professional Business Tools</Text>
                </View>
            </Page>
        </Document>
    );
};
