// @ts-nocheck
'use client';

import { forwardRef } from 'react';
import { FieldError } from 'react-hook-form';
import { AlertCircle } from 'lucide-react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: FieldError;
    helperText?: string;
}

/**
 * Reusable form input component with React Hook Form integration
 * Migrated to Tailwind CSS for Phase 2b
 */
export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
    ({ label, error, helperText, className = '', ...props }, ref) => {
        return (
            <div className="mb-4">
                <label
                    htmlFor={props.id || props.name}
                    className="block mb-1.5 text-sm font-semibold text-neutral-900"
                >
                    {label}
                    {props.required && <span className="text-red-500 ml-0.5">*</span>}
                </label>
                <div className="relative">
                    <input
                        ref={ref}
                        id={props.id || props.name}
                        className={`w-full px-4 py-3 rounded-xl text-sm bg-white border transition-all outline-none ${error
                                ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                                : 'border-neutral-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100'
                            } ${className}`}
                        {...props}
                    />
                </div>
                {error && (
                    <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1.5 font-medium animate-in fade-in slide-in-from-top-1">
                        <AlertCircle size={14} />
                        {error.message}
                    </p>
                )}
                {helperText && !error && (
                    <p className="mt-1.5 text-xs text-neutral-500">
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

FormInput.displayName = 'FormInput';

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    error?: FieldError;
    helperText?: string;
}

/**
 * Reusable form textarea component with React Hook Form integration
 * Migrated to Tailwind CSS for Phase 2b
 */
export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
    ({ label, error, helperText, className = '', ...props }, ref) => {
        return (
            <div className="mb-4">
                <label
                    htmlFor={props.id || props.name}
                    className="block mb-1.5 text-sm font-semibold text-neutral-900"
                >
                    {label}
                    {props.required && <span className="text-red-500 ml-0.5">*</span>}
                </label>
                <textarea
                    ref={ref}
                    id={props.id || props.name}
                    className={`w-full px-4 py-3 rounded-xl text-sm bg-white border transition-all outline-none resize-vertical min-h-[120px] ${error
                            ? 'border-red-500 focus:border-red-500 focus:ring-4 focus:ring-red-100'
                            : 'border-neutral-200 focus:border-primary-500 focus:ring-4 focus:ring-primary-100'
                        } ${className}`}
                    {...props}
                />
                {error && (
                    <p className="mt-1.5 text-xs text-red-600 flex items-center gap-1.5 font-medium animate-in fade-in slide-in-from-top-1">
                        <AlertCircle size={14} />
                        {error.message}
                    </p>
                )}
                {helperText && !error && (
                    <p className="mt-1.5 text-xs text-neutral-500">
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

FormTextarea.displayName = 'FormTextarea';

export default FormInput;
