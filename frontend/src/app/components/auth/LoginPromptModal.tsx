import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, LogIn } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../common/Button';

interface LoginPromptModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    message?: string;
}

export const LoginPromptModal: React.FC<LoginPromptModalProps> = ({
    isOpen,
    onClose,
    title = "Sign in Required",
    message = "Please sign in to rate and review this mess."
}) => {
    const navigate = useNavigate();

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-bg/80 backdrop-blur-md"
                    />
                    
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-md bg-bg2/90 border border-white/10 rounded-[2.5rem] p-8 md:p-12 shadow-3xl overflow-hidden"
                    >
                        {/* Decorative background element */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                        
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 p-2 text-text-muted hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>

                        <div className="text-center space-y-8 relative z-10">
                            <div className="w-20 h-20 bg-primary-500/20 rounded-3xl flex items-center justify-center mx-auto shadow-2xl shadow-primary-500/10">
                                <LogIn size={32} className="text-primary-500" />
                            </div>

                            <div className="space-y-3">
                                <h3 className="text-3xl font-black text-white italic tracking-tighter uppercase leading-tight">
                                    {title}
                                </h3>
                                <p className="text-text-muted font-medium italic text-sm px-4">
                                    {message}
                                </p>
                            </div>

                            <div className="flex flex-col gap-4">
                                <Button
                                    onClick={() => navigate('/login')}
                                    className="rounded-2xl py-6 font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary-500/20 w-full italic"
                                >
                                    Login to Account
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => navigate('/register')}
                                    className="rounded-2xl py-6 font-black uppercase tracking-widest text-xs border-white/10 text-white hover:bg-bg3 transition-all w-full italic"
                                >
                                    Create New Account
                                </Button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
