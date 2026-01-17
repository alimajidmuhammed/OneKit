// Core type definitions for OneKit app

export interface PersonalInfo {
    fullName?: string;
    jobTitle?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    website?: string;
    photo?: string | null;
    photoZoom?: number;
    photoRotation?: number;
    photoPosition?: { x: number; y: number };
    nested_data?: {
        summary?: string;
        custom_colors?: CustomColors;
    };
}

export interface CustomColors {
    primary: string;
    accent: string;
}

export interface Experience {
    id?: number | string;
    company: string;
    position: string;
    location?: string;
    startDate: string;
    endDate?: string;
    description?: string;
}

export interface Education {
    id?: number | string;
    institution: string;
    degree: string;
    field: string;
    endDate: string;
}

export interface Skill {
    name: string;
    level?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface Language {
    name: string;
    level?: 'basic' | 'intermediate' | 'fluent' | 'native';
}

export interface Certification {
    id?: number | string;
    name: string;
    issuer: string;
    date: string;
    credentialId?: string;
}

export interface Organization {
    id?: number | string;
    name: string;
    role: string;
    startDate: string;
    endDate?: string;
}

export interface CVDocument {
    id: string;
    user_id: string;
    name: string;
    template_id: string;
    slug: string;
    personal_info: PersonalInfo;
    summary?: string;
    experience: Experience[];
    education: Education[];
    skills: Skill[];
    languages: Language[];
    certifications: Certification[];
    organizations: Organization[];
    projects?: any[];
    custom_colors?: CustomColors;
    section_order?: string[];
    created_at?: string;
    updated_at?: string;
}

export interface CVTemplate {
    id: string;
    name: string;
    description: string;
    preview: string;
    hasPhoto: boolean;
    baseTemplate: 'professional' | 'milano' | 'sydney' | 'london' | 'tokyo' | 'dubai';
    colors: CustomColors;
    rtl?: boolean;
}

export interface UploadImageOptions {
    folder?: string;
    type?: 'photo' | 'logo' | 'background' | 'thumbnail';
    skipOptimization?: boolean;
    maxSizeMB?: number;
}

export interface ImageUploadResult {
    url: string;
    originalSize: number;
    optimizedSize: number;
    compressionRatio: number;
    bypassed: boolean;
}

export interface User {
    id: string;
    email: string;
    role?: string;
}
