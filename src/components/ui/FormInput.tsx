// @ts-nocheck
'use client';

import { forwardRef } from 'react';
import { FieldError } from 'react-hook-form';
import { AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';


interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: FieldError;
    helperText?: string;
}

/**
 * Reusable form input component with React Hook Form integration
 * Now uses shadcn/ui Input and Label primitives
 */
export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
    ({ label, error, helperText, className = '', ...props }, ref) => {
        return (
            <div className="mb-4 space-y-1.5">
                <Label
                    htmlFor={props.id || props.name}
                    className="text-sm font-semibold text-neutral-900"
                >
                    {label}
                    {props.required && <span className="text-red-500 ml-0.5">*</span>}
                </Label>
                <Input
                    ref={ref}
                    id={props.id || props.name}
                    className={cn(
                        'w-full px-4 py-3 h-auto rounded-xl text-sm bg-white',
                        error
                            ? 'border-red-500 focus-visible:ring-red-100'
                            : 'border-neutral-200 focus-visible:ring-primary-100',
                        className
                    )}
                    {...props}
                />
                {error && (
                    <p className="text-xs text-red-600 flex items-center gap-1.5 font-medium animate-in fade-in slide-in-from-top-1">
                        <AlertCircle size={14} />
                        {error.message}
                    </p>
                )}
                {helperText && !error && (
                    <p className="text-xs text-neutral-500">
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
 * Now uses shadcn/ui Textarea and Label primitives
 */
export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
    ({ label, error, helperText, className = '', ...props }, ref) => {
        return (
            <div className="mb-4 space-y-1.5">
                <Label
                    htmlFor={props.id || props.name}
                    className="text-sm font-semibold text-neutral-900"
                >
                    {label}
                    {props.required && <span className="text-red-500 ml-0.5">*</span>}
                </Label>
                <Textarea
                    ref={ref}
                    id={props.id || props.name}
                    className={cn(
                        'w-full px-4 py-3 rounded-xl text-sm bg-white resize-vertical min-h-[120px]',
                        error
                            ? 'border-red-500 focus-visible:ring-red-100'
                            : 'border-neutral-200 focus-visible:ring-primary-100',
                        className
                    )}
                    {...props}
                />
                {error && (
                    <p className="text-xs text-red-600 flex items-center gap-1.5 font-medium animate-in fade-in slide-in-from-top-1">
                        <AlertCircle size={14} />
                        {error.message}
                    </p>
                )}
                {helperText && !error && (
                    <p className="text-xs text-neutral-500">
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

FormTextarea.displayName = 'FormTextarea';


export default FormInput;
