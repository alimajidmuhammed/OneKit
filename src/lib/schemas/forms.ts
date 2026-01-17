// @ts-nocheck
/**
 * Zod validation schemas for forms
 * Used with React Hook Form for type-safe form validation
 */

import { z } from 'zod';

// ============== Authentication Schemas ==============

export const loginSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Invalid email address'),
    password: z
        .string()
        .min(1, 'Password is required')
        .min(6, 'Password must be at least 6 characters'),
});

export const registerSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Invalid email address'),
    password: z
        .string()
        .min(1, 'Password is required')
        .min(6, 'Password must be at least 6 characters'),
    confirmPassword: z
        .string()
        .min(1, 'Please confirm your password'),
    fullName: z
        .string()
        .min(1, 'Full name is required')
        .min(2, 'Name must be at least 2 characters'),
    referralCode: z
        .string()
        .optional(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
    password: z
        .string()
        .min(1, 'Password is required')
        .min(6, 'Password must be at least 6 characters'),
    confirmPassword: z
        .string()
        .min(1, 'Please confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

// ============== Profile Schemas ==============

export const profileSchema = z.object({
    full_name: z
        .string()
        .min(1, 'Full name is required')
        .min(2, 'Name must be at least 2 characters'),
    phone: z
        .string()
        .optional()
        .refine((val) => !val || /^[+]?[\d\s-]{7,}$/.test(val), {
            message: 'Invalid phone number format',
        }),
});

export const changePasswordSchema = z.object({
    newPassword: z
        .string()
        .min(1, 'New password is required')
        .min(6, 'Password must be at least 6 characters'),
    confirmPassword: z
        .string()
        .min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
});

// ============== Contact Schema ==============

export const contactSchema = z.object({
    name: z
        .string()
        .min(1, 'Name is required')
        .min(2, 'Name must be at least 2 characters'),
    email: z
        .string()
        .min(1, 'Email is required')
        .email('Invalid email address'),
    subject: z
        .string()
        .min(1, 'Subject is required')
        .min(3, 'Subject must be at least 3 characters'),
    message: z
        .string()
        .min(1, 'Message is required')
        .min(10, 'Message must be at least 10 characters'),
});

// ============== CV Personal Info Schema ==============

export const cvPersonalInfoSchema = z.object({
    fullName: z
        .string()
        .min(1, 'Full name is required'),
    jobTitle: z
        .string()
        .optional(),
    email: z
        .string()
        .email('Invalid email')
        .optional()
        .or(z.literal('')),
    phone: z
        .string()
        .optional(),
    location: z
        .string()
        .optional(),
    linkedin: z
        .string()
        .url('Invalid LinkedIn URL')
        .optional()
        .or(z.literal('')),
    website: z
        .string()
        .url('Invalid website URL')
        .optional()
        .or(z.literal('')),
});

// ============== Type Exports ==============

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
export type ProfileFormData = z.infer<typeof profileSchema>;
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
export type ContactFormData = z.infer<typeof contactSchema>;
export type CVPersonalInfoFormData = z.infer<typeof cvPersonalInfoSchema>;
