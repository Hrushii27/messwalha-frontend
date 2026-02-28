import React from 'react';
import { Layout } from '../components/layout/Layout';
import { ChevronDown, HelpCircle, MessageCircle, Utensils, CreditCard, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../components/common/Button';
import Seo from '../components/common/Seo';

const FAQ_DATA = [
    {
        category: 'For Students',
        icon: Utensils,
        questions: [
            {
                q: 'How does MessWalha help me find a mess?',
                a: 'MessWalha allows you to search for verified messes near your location, filter by cuisine, price, and ratings. You can check daily menus and subscribe to plans directly through the platform.'
            },
            {
                q: 'Are the messes verified?',
                a: 'Yes! Every mess listed on our platform goes through a verification process to ensure quality standards and hygiene.'
            },
            {
                q: 'Can I cancel my subscription?',
                a: 'Subscriptions can be cancelled or paused depending on the mess owner\'s policy. You can manage all your active plans from your Student Dashboard.'
            }
        ]
    },
    {
        category: 'Payments & Subscriptions',
        icon: CreditCard,
        questions: [
            {
                q: 'What payment methods are supported?',
                a: 'We support all major payment methods through Razorpay, including UPI, Credit/Debit cards, and Net Banking.'
            },
            {
                q: 'How do I download my invoice?',
                a: 'Go to "My Subscriptions", find your active plan, and click the "Download Invoice" button to get a printable PDF.'
            }
        ]
    },
    {
        category: 'For Mess Owners',
        icon: Shield,
        questions: [
            {
                q: 'How can I list my mess on MessWalha?',
                a: 'Simply click "List Your Mess" on the landing page, register as an owner, and fill in your mess details for verification.'
            },
            {
                q: 'How do I receive payments?',
                a: 'Payments are collected via the platform and settled to your linked bank account after verification of service.'
            }
        ]
    }
];

const FAQPage: React.FC = () => {
    const [openIndex, setOpenIndex] = React.useState<string | null>(null);

    return (
        <Layout>
            <Seo
                title="FAQ"
                description="Frequently Asked Questions about MessWalha. Find answers about finding messes, subscriptions, payments, and more."
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
                            Everything you need to know about MessWalha. Can't find the answer you're looking for? Reach out to our support team.
                        </p>
                    </motion.div>
                </div>
            </section>

            <section className="py-20 bg-white dark:bg-dark-800">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="space-y-16">
                        {FAQ_DATA.map((category, catIdx) => (
                            <div key={catIdx} className="space-y-8">
                                <div className="flex items-center space-x-4">
                                    <div className="p-3 bg-primary-500 text-white rounded-lg shadow-md shadow-primary-500/20">
                                        <category.icon size={20} />
                                    </div>
                                    <h2 className="text-2xl font-black tracking-tight uppercase italic">{category.category}</h2>
                                </div>

                                <div className="space-y-4">
                                    {category.questions.map((item, qIdx) => {
                                        const id = `${catIdx}-${qIdx}`;
                                        const isOpen = openIndex === id;

                                        return (
                                            <div
                                                key={qIdx}
                                                className={`border border-border-color rounded-xl overflow-hidden transition-all ${isOpen ? 'ring-2 ring-primary-500/20 shadow-lg scale-[1.01]' : 'hover:bg-bg-section/50'}`}
                                            >
                                                <button
                                                    onClick={() => setOpenIndex(isOpen ? null : id)}
                                                    className="w-full px-8 py-6 flex items-center justify-between text-left group"
                                                >
                                                    <span className={`font-bold transition-colors ${isOpen ? 'text-primary-500' : 'text-text-primary dark:text-text-inverse'}`}>
                                                        {item.q}
                                                    </span>
                                                    <ChevronDown
                                                        size={20}
                                                        className={`text-text-muted transition-transform duration-300 ${isOpen ? 'rotate-180 text-primary-500' : 'group-hover:text-primary-500'}`}
                                                    />
                                                </button>
                                                <AnimatePresence>
                                                    {isOpen && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            transition={{ duration: 0.3 }}
                                                        >
                                                            <div className="px-8 pb-6 text-text-muted font-medium leading-relaxed border-t border-border-color pt-4 bg-bg-section/10">
                                                                {item.a}
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-20 p-12 bg-dark-900 rounded-2xl text-center shadow-xl relative overflow-hidden">
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
