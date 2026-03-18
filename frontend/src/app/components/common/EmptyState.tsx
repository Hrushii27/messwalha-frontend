import React from 'react';
import { motion } from 'framer-motion';
import { Button } from './Button';
import type { LucideIcon as LucideIconType } from 'lucide-react';

interface EmptyStateProps {
    icon: LucideIconType;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
    icon: Icon,
    title,
    description,
    actionLabel,
    onAction,
    className = ""
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-center py-20 px-6 space-y-8 bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/10 shadow-3xl relative overflow-hidden ${className}`}
        >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
            
            <div className="relative z-10 space-y-8">
                <div className="w-32 h-32 bg-white/5 rounded-[2.5rem] shadow-3xl flex items-center justify-center mx-auto text-primary-500 border border-white/10 relative group bg-navy-900">
                    <Icon size={56} strokeWidth={1.5} className="group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-primary-500/10 rounded-[2.5rem] blur-2xl animate-pulse -z-10" />
                </div>

                <div className="space-y-4 max-w-lg mx-auto">
                    <h3 className="text-3xl font-black italic tracking-tighter text-white uppercase">
                        {title}
                    </h3>
                    <p className="text-white/60 font-black uppercase tracking-[0.2em] text-[10px] leading-relaxed italic">
                        {description}
                    </p>
                </div>

                {actionLabel && onAction && (
                    <div className="pt-4">
                        <Button
                            onClick={onAction}
                            className="h-16 rounded-full px-12 bg-primary-500 text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-3xl shadow-primary-500/20 hover:scale-[1.05] transition-all"
                        >
                            {actionLabel}
                        </Button>
                    </div>
                )}
            </div>
        </motion.div>
    );
};
