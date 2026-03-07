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
            <main className="flex-grow pt-20">
                {children}
            </main>
            <Footer />

            {/* Floating CTA */}
            <div className="fixed bottom-10 right-10 z-[90]">
                <button
                    onClick={() => window.location.href = '/owner/add-mess'}
                    className="group relative flex items-center justify-center w-16 h-16 md:w-auto md:h-16 md:px-8 bg-primary-500 text-white rounded-full shadow-3xl shadow-primary-500/40 hover:scale-110 transition-all duration-500 animate-float overflow-hidden"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-400 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10 flex items-center gap-3">
                        <Utensils size={24} className="group-hover:rotate-12 transition-transform" />
                        <span className="hidden md:block font-black uppercase tracking-[0.2em] text-xs">Add Your Mess</span>
                    </div>
                </button>
            </div>
        </div>
    );
};
