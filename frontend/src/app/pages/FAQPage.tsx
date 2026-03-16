import React from 'react';
import { Layout } from '../components/layout/Layout';
import { HelpCircle, MessageCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../components/common/Button';
import Seo from '../components/common/Seo';
import { FAQSection } from '../components/common/FAQSection';

const FAQPage: React.FC = () => {
    return (
        <Layout>
            <Seo
                title="FAQ | Student Tiffin & Mess Support"
                description="Frequently Asked Questions about FindMess. Find answers about finding messes near colleges, subscriptions, payments, and veg/non-veg options."
            />

            <section className="py-20 bg-bg-section dark:bg-dark-900 border-b border-border-color">
                <div className="container mx-auto px-4 text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-6"
                    >
                        <div className="w-16 h-16 bg-primary-500/10 text-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <HelpCircle size={32} />
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-text-primary dark:text-text-inverse uppercase italic">
                            How Can We <span className="text-primary-500">Help</span>?
                        </h1>
                        <p className="text-text-muted max-w-2xl mx-auto font-medium">
                            Everything you need to know about FindMess. Can't find the answer you're looking for? Reach out to our support team.
                        </p>
                    </motion.div>
                </div>
            </section>

            <FAQSection showTitle={false} />

            <section className="pb-20 bg-white dark:bg-dark-800">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="p-12 bg-dark-900 rounded-2xl text-center shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500 opacity-20 rounded-full blur-[100px] -mr-32 -mt-32" />
                        <div className="relative z-10 space-y-8">
                            <h3 className="text-3xl font-black text-white italic uppercase tracking-tighter">Still have questions?</h3>
                            <p className="text-white/70 font-medium max-w-lg mx-auto leading-relaxed">
                                Our team is always here to help you. Whether you are a student or a mess owner, we've got you covered.
                            </p>
                            <Button size="lg" className="rounded-xl px-12 h-16 shadow-2xl shadow-primary-500/30 font-black uppercase tracking-widest text-xs flex items-center mx-auto gap-3">
                                <MessageCircle size={20} />
                                Chat with Support
                            </Button>
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    );
};

export default FAQPage;
