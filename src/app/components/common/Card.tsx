import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    isHoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({ className, children, isHoverable = false, ...props }) => {
    return (
        <div
            className={cn(
                'card',
                isHoverable && 'hover:shadow-lg hover:-translate-y-1',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};
