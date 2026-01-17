// @ts-nocheck
'use client';

import { forwardRef } from 'react';
import { FieldError } from 'react-hook-form';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label: string;
    error?: FieldError;
    helperText?: string;
}

/**
 * Reusable form input component with React Hook Form integration
 */
export const FormInput = forwardRef<HTMLInputElement, FormInputProps>(
    ({ label, error, helperText, className = '', ...props }, ref) => {
        return (
            <div style={{ marginBottom: '16px' }}>
                <label
                    htmlFor={props.id || props.name}
                    style={{
                        display: 'block',
                        marginBottom: '6px',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                    }}
                >
                    {label}
                    {props.required && <span style={{ color: 'var(--error-500)', marginLeft: '2px' }}>*</span>}
                </label>
                <input
                    ref={ref}
                    id={props.id || props.name}
                    className={className}
                    style={{
                        width: '100%',
                        padding: '12px 14px',
                        border: `1px solid ${error ? 'var(--error-500)' : 'var(--border-light)'}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        backgroundColor: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                        outline: 'none',
                    }}
                    onFocus={(e) => {
                        e.target.style.borderColor = error ? 'var(--error-500)' : 'var(--primary-500)';
                        e.target.style.boxShadow = `0 0 0 3px ${error ? 'var(--error-100)' : 'var(--primary-100)'}`;
                    }}
                    onBlur={(e) => {
                        e.target.style.borderColor = error ? 'var(--error-500)' : 'var(--border-light)';
                        e.target.style.boxShadow = 'none';
                    }}
                    {...props}
                />
                {error && (
                    <p style={{
                        marginTop: '6px',
                        fontSize: '13px',
                        color: 'var(--error-600)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                    }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 8v4M12 16h.01" />
                        </svg>
                        {error.message}
                    </p>
                )}
                {helperText && !error && (
                    <p style={{
                        marginTop: '6px',
                        fontSize: '12px',
                        color: 'var(--text-tertiary)',
                    }}>
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
 */
export const FormTextarea = forwardRef<HTMLTextAreaElement, FormTextareaProps>(
    ({ label, error, helperText, className = '', ...props }, ref) => {
        return (
            <div style={{ marginBottom: '16px' }}>
                <label
                    htmlFor={props.id || props.name}
                    style={{
                        display: 'block',
                        marginBottom: '6px',
                        fontSize: '14px',
                        fontWeight: '600',
                        color: 'var(--text-primary)',
                    }}
                >
                    {label}
                    {props.required && <span style={{ color: 'var(--error-500)', marginLeft: '2px' }}>*</span>}
                </label>
                <textarea
                    ref={ref}
                    id={props.id || props.name}
                    className={className}
                    style={{
                        width: '100%',
                        padding: '12px 14px',
                        border: `1px solid ${error ? 'var(--error-500)' : 'var(--border-light)'}`,
                        borderRadius: '8px',
                        fontSize: '14px',
                        backgroundColor: 'var(--bg-primary)',
                        color: 'var(--text-primary)',
                        transition: 'border-color 0.2s, box-shadow 0.2s',
                        outline: 'none',
                        resize: 'vertical',
                        minHeight: '100px',
                    }}
                    {...props}
                />
                {error && (
                    <p style={{
                        marginTop: '6px',
                        fontSize: '13px',
                        color: 'var(--error-600)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                    }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 8v4M12 16h.01" />
                        </svg>
                        {error.message}
                    </p>
                )}
                {helperText && !error && (
                    <p style={{
                        marginTop: '6px',
                        fontSize: '12px',
                        color: 'var(--text-tertiary)',
                    }}>
                        {helperText}
                    </p>
                )}
            </div>
        );
    }
);

FormTextarea.displayName = 'FormTextarea';

export default FormInput;
