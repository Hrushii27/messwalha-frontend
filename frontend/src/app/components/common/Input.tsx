import React, { useState } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Eye, EyeOff } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    labelClassName?: string;
    labelStyle?: React.CSSProperties;
    error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, label, labelClassName, labelStyle, error, type, ...props }, ref) => {
        const [showPassword, setShowPassword] = useState(false);
        const isPasswordType = type === 'password';
        const inputType = isPasswordType && showPassword ? 'text' : type;

        return (
            <div className="w-full space-y-1.5 relative">
                {label && (
                    <label 
                        htmlFor={props.id} 
                        className={cn("text-sm font-medium transition-colors", labelClassName)}
                        style={{ color: 'var(--color-text-secondary)', ...labelStyle }}
                    >
                        {label}
                    </label>
                )}
                <div className="relative">
                    <input
                        ref={ref}
                        type={inputType}
                        className={cn(
                            'flex h-12 w-full rounded-xl bg-bg3 border border-white/10 px-4 py-2 text-sm text-text-primary ring-offset-bg file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-muted transition-all',
                            isPasswordType && 'pr-10',
                            error && 'border-red-500 focus:ring-red-500',
                            className
                        )}
                        {...props}
                    />
                    {isPasswordType && (
                        <button
                            type="button"
                            onClick={() => setShowPassword(prev => !prev)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary-500 transition-colors"
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    )}
                </div>
                {error && (
                    <p className="font-medium" style={{ color: '#E84B4B', fontSize: '12px', marginTop: '4px' }}>{error}</p>
                )}
            </div>
        );
    }
);

Input.displayName = 'Input';
