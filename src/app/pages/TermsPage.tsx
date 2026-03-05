import React from 'react';
import { Layout } from '../components/layout/Layout';
import { motion } from 'framer-motion';

const TermsPage: React.FC = () => {
    return (
        <Layout>
            <div className="grad-dark py-32">
                <div className="container mx-auto px-4">
                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic"
                    >
                        Terms & <span className="text-primary-500">Conditions</span>
                    </motion.h1>
                </div>
            </div>
            <div className="container mx-auto px-4 py-20">
                <div className="max-w-4xl space-y-12 dark:text-white/70 font-medium leading-relaxed italic">
                    <section className="space-y-6">
                        <h2 className="text-2xl font-black uppercase tracking-widest text-primary-500">1. Introduction</h2>
                        <p>Welcome to MessWalha. By using our services, you agree to comply with and be bound by the following terms and conditions. Please review them carefully.</p>
                    </section>
                    <section className="space-y-6">
                        <h2 className="text-2xl font-black uppercase tracking-widest text-primary-500">2. Service Description</h2>
                        <p>MessWalha provides a platform to discover, compare, and subscribe to mess services. We facilitate the connection between students and mess owners but are not responsible for the food quality directly.</p>
                    </section>
                    <section className="space-y-6">
                        <h2 className="text-2xl font-black uppercase tracking-widest text-primary-500">3. User Responsibilities</h2>
                        <p>Users must provide accurate information during registration and payment. Misuse of the platform may lead to account suspension.</p>
                    </section>
                </div>
            </div>
        </Layout>
    );
};

export default TermsPage;
