import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { Utensils } from 'lucide-react';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="flex flex-col min-h-screen bg-bg-main dark:bg-dark-900 transition-colors duration-500">
            <Header />
            <main className="flex-grow pt-24 md:pt-28">
                {children}
            </main>
            <Footer />

            {/* Floating CTA - Improved Responsiveness */}
            <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[90]">
                <button
                    onClick={() => window.location.href = '/owner/add-mess'}
                    className="group relative flex items-center justify-center w-14 h-14 md:w-auto md:h-16 md:px-8 bg-primary-500 text-white rounded-full shadow-3xl shadow-primary-500/40 hover:scale-110 active:scale-95 transition-all duration-500 animate-float overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10 flex items-center gap-2 md:gap-3">
                        <Utensils size={20} className="md:w-6 md:h-6 group-hover:rotate-12 transition-transform" />
                        <span className="hidden md:block font-black uppercase tracking-[0.2em] text-[10px] md:text-xs">Add Your Mess</span>
                    </div>
                </button>
            </div>
        </div>
    );
};
