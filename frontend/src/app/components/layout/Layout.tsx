import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { ChatUI } from '../common/ChatUI';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow">
                {children}
            </main>
            <Footer />
            <ChatUI />
        </div>
    );
};
