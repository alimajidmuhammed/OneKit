// @ts-nocheck
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        width: '3.5in', // Standard BC size
        height: '2in',
        padding: 0,
        margin: 0,
        display: 'flex',
        flexDirection: 'column',
    },
    card: {
        width: '100%',
        height: '100%',
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        position: 'relative',
    },
    name: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    title: {
        fontSize: 10,
        color: '#666',
        marginBottom: 10,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    contactContainer: {
        marginTop: 10,
    },
    contactItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 3,
    },
    contactText: {
        fontSize: 8,
        color: '#444',
    },
    logo: {
        position: 'absolute',
        top: 20,
        right: 20,
        width: 40,
        height: 40,
    },
    qrCode: {
        position: 'absolute',
        bottom: 20,
        right: 20,
        width: 30,
        height: 30,
    },
});

interface BusinessCardPDFProps {
    card: any;
}

export const BusinessCardPDF = ({ card }: BusinessCardPDFProps) => {
    if (!card) return null;

    return (
        <Document>
            <Page size={[252, 144]} style={styles.page}> {/* 3.5in x 2in at 72dpi */}
                <View style={[styles.card, { backgroundColor: card.background_color || '#ffffff' }]}>
                    <View>
                        <Text style={[styles.name, { color: card.text_color || '#000000' }]}>{card.name || 'Full Name'}</Text>
                        <Text style={styles.title}>{card.title || 'Job Title'}</Text>

                        <View style={styles.contactContainer}>
                            {card.email && (
                                <View style={styles.contactItem}>
                                    <Text style={styles.contactText}>{card.email}</Text>
                                </View>
                            )}
                            {card.phone && (
                                <View style={styles.contactItem}>
                                    <Text style={styles.contactText}>{card.phone}</Text>
                                </View>
                            )}
                            {card.website && (
                                <View style={styles.contactItem}>
                                    <Text style={styles.contactText}>{card.website}</Text>
                                </View>
                            )}
                            {card.location && (
                                <View style={styles.contactItem}>
                                    <Text style={styles.contactText}>{card.location}</Text>
                                </View>
                            )}
                        </View>
                    </View>

                    {card.logo_url && (
                        <Image src={card.logo_url} style={styles.logo} />
                    )}
                </View>
            </Page>
        </Document>
    );
};
