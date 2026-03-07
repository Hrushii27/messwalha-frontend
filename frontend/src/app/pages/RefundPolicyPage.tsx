import React from 'react';
import { Layout } from '../components/layout/Layout';
import { motion } from 'framer-motion';

const RefundPolicyPage: React.FC = () => {
    return (
        <Layout>
            <div className="grad-dark py-32">
                <div className="container mx-auto px-4">
                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-5xl md:text-7xl font-black text-white tracking-tighter uppercase italic"
                    >
                        Refund <span className="text-primary-500">Policy</span>
                    </motion.h1>
                </div>
            </div>
            <div className="container mx-auto px-4 py-20">
                <div className="max-w-4xl space-y-12 dark:text-white/70 font-medium leading-relaxed italic">
                    <section className="space-y-6">
                        <h2 className="text-2xl font-black uppercase tracking-widest text-primary-500">1. Subscription Cancellation</h2>
                        <p>Users can cancel their meal subscription at any time. However, refunds for the current month will be processed on a pro-rata basis, subject to a 10% administrative fee.</p>
                    </section>
                    <section className="space-y-6">
                        <h2 className="text-2xl font-black uppercase tracking-widest text-primary-500">2. Eligibility for Refund</h2>
                        <p>Refunds are applicable if the mess service fails to deliver food for more than 3 consecutive days without prior notice or in cases of documented hygiene violations certified by our audit team.</p>
                    </section>
                    <section className="space-y-6">
                        <h2 className="text-2xl font-black uppercase tracking-widest text-primary-500">3. Processing Time</h2>
                        <p>Approved refunds will be processed back to the original payment method within 7-10 working days.</p>
                    </section>
                </div>
            </div>
        </Layout>
    );
};

export default RefundPolicyPage;
