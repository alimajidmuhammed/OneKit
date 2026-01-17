// @ts-nocheck
import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        padding: 40,
        fontSize: 10,
        fontFamily: 'Helvetica',
        color: '#333',
    },
    header: {
        marginBottom: 20,
        borderBottom: '1pt solid #eee',
        paddingBottom: 20,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#1a1f36',
        marginBottom: 4,
    },
    jobTitle: {
        fontSize: 14,
        color: '#4f566b',
        marginBottom: 10,
    },
    contactInfo: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        fontSize: 9,
        color: '#697386',
    },
    section: {
        marginTop: 15,
        marginBottom: 10,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#1a1f36',
        textTransform: 'uppercase',
        borderBottom: '0.5pt solid #e3e8ee',
        paddingBottom: 3,
        marginBottom: 8,
    },
    item: {
        marginBottom: 10,
    },
    itemHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    itemTitle: {
        fontWeight: 'bold',
        fontSize: 11,
    },
    itemDate: {
        fontSize: 9,
        color: '#697386',
    },
    itemSubtitle: {
        fontSize: 10,
        color: '#4f566b',
        marginBottom: 4,
    },
    itemDescription: {
        fontSize: 9,
        lineHeight: 1.4,
    },
    skillContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 5,
    },
    skillTag: {
        padding: '3 6',
        backgroundColor: '#f7f8f9',
        borderRadius: 3,
        fontSize: 8,
    },
    sidebar: {
        width: '30%',
        paddingRight: 15,
    },
    main: {
        width: '70%',
    },
    container: {
        flexDirection: 'row',
    }
});

interface CVPDFProps {
    cv: any;
}

export const CVPDF = ({ cv }: CVPDFProps) => {
    if (!cv) return null;

    const order = cv.section_order || ['personal', 'summary', 'experience', 'education', 'skills', 'certifications', 'organizations', 'languages'];

    const renderSection = (id: string) => {
        switch (id) {
            case 'personal':
                return (
                    <View style={styles.header} key="personal">
                        <Text style={styles.name}>{cv.personalInfo?.fullName || 'Your Name'}</Text>
                        <Text style={styles.jobTitle}>{cv.personalInfo?.jobTitle || 'Professional Title'}</Text>
                        <View style={styles.contactInfo}>
                            {cv.personalInfo?.email && <Text>{cv.personalInfo.email}</Text>}
                            {cv.personalInfo?.phone && <Text>{cv.personalInfo.phone}</Text>}
                            {cv.personalInfo?.location && <Text>{cv.personalInfo.location}</Text>}
                            {cv.personalInfo?.linkedin && <Text>{cv.personalInfo.linkedin}</Text>}
                        </View>
                    </View>
                );
            case 'summary':
                return cv.summary && (
                    <View style={styles.section} key="summary">
                        <Text style={styles.sectionTitle}>Summary</Text>
                        <Text style={styles.itemDescription}>{cv.summary}</Text>
                    </View>
                );
            case 'experience':
                return cv.experience?.length > 0 && (
                    <View style={styles.section} key="experience">
                        <Text style={styles.sectionTitle}>Experience</Text>
                        {cv.experience.map((exp: any, i: number) => (
                            <View key={i} style={styles.item}>
                                <View style={styles.itemHeader}>
                                    <Text style={styles.itemTitle}>{exp.position || 'Position'}</Text>
                                    <Text style={styles.itemDate}>{exp.startDate} - {exp.endDate || 'Present'}</Text>
                                </View>
                                <Text style={styles.itemSubtitle}>{exp.company}</Text>
                                {exp.description && <Text style={styles.itemDescription}>{exp.description}</Text>}
                            </View>
                        ))}
                    </View>
                );
            case 'education':
                return cv.education?.length > 0 && (
                    <View style={styles.section} key="education">
                        <Text style={styles.sectionTitle}>Education</Text>
                        {cv.education.map((edu: any, i: number) => (
                            <View key={i} style={styles.item}>
                                <View style={styles.itemHeader}>
                                    <Text style={styles.itemTitle}>{edu.degree} in {edu.field}</Text>
                                    <Text style={styles.itemDate}>{edu.endDate}</Text>
                                </View>
                                <Text style={styles.itemSubtitle}>{edu.institution}</Text>
                            </View>
                        ))}
                    </View>
                );
            case 'skills':
                return cv.skills?.length > 0 && (
                    <View style={styles.section} key="skills">
                        <Text style={styles.sectionTitle}>Skills</Text>
                        <View style={styles.skillContainer}>
                            {cv.skills.map((skill: any, i: number) => (
                                <Text key={i} style={styles.skillTag}>{skill.name}</Text>
                            ))}
                        </View>
                    </View>
                );
            default:
                return null;
        }
    };

    return (
        <Document>
            <Page size="A4" style={styles.page}>
                {renderSection('personal')}
                {order.filter(id => id !== 'personal').map(id => renderSection(id))}
            </Page>
        </Document>
    );
};
