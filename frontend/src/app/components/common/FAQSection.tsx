import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Helmet } from 'react-helmet-async';

const FAQ_ITEMS = [
    {
        q: 'Is FindMess safe to use?',
        a: 'Yes. FindMess is a platform that helps students and PG residents discover verified mess and tiffin services near their location. Users can compare prices, reviews, and locations before choosing a mess.'
    },
    {
        q: 'What is FindMess?',
        a: 'FindMess is India\'s leading student tiffin and mess discovery platform. We help students find healthy, affordable, and hygienic meal services near colleges and hostels.'
    },
    {
        q: 'How do you find a mess using FindMess?',
        a: 'Simply enter your college name or area in the search bar. You can then filter results by calorie needs, veg/non-veg preferences, and price range to find your perfect match.'
    },
    {
        q: 'Is FindMess free for students?',
        a: 'Yes, FindMess is completely free for students to browse, compare, and discover mess services. We believe every student deserves easy access to quality food.'
    },
    {
        q: 'How does FindMess help students find mess services?',
        a: 'We provide a centralized directory of verified services with real student reviews, daily menus, and location maps, saving students hours of manual searching.'
    },
    {
        q: 'Can I compare mess prices on FindMess?',
        a: 'Absolutely. We list monthly and daily plan prices for every mess, allowing you to find the most affordable option that fits your student budget.'
    },
    {
        q: 'Can mess owners register their mess on FindMess?',
        a: 'Yes! Mess owners can easily register their business to reach thousands of students. We provide owners with tools to manage menus and grow their customer base.'
    },
    {
        q: 'How do I register my mess on FindMess?',
        a: 'Click on the "List Your Mess" button, fill in your service details, and our verification team will review your listing to get you live on the platform.'
    },
    {
        q: 'Does FindMess show mess locations near colleges?',
        a: 'Yes, our smart discovery engine prioritizes mess services within walking distance of major colleges, hostels, and student PG accommodations.'
    },
    {
        q: 'Can I find veg and non-veg mess on FindMess?',
        a: 'Yes. Every listing is clearly labeled as Pure Veg or Veg & Non-Veg, and you can use our filters to see only the options that meet your dietary requirements.'
    }
];

export const FAQSection: React.FC<{ showTitle?: boolean }> = ({ showTitle = true }) => {
    const [openIndex, setOpenIndex] = React.useState<number | null>(null);

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": FAQ_ITEMS.map(item => ({
            "@type": "Question",
            "name": item.q,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": item.a
            }
        }))
    };

    return (
        <>
            <Helmet>
                <script type="application/ld+json">
                    {JSON.stringify(faqSchema)}
                </script>
            </Helmet>
            
            <section className="py-20 bg-white dark:bg-dark-800">
                <div className="container mx-auto px-4 max-w-4xl">
                    {showTitle && (
                        <div className="text-center mb-16 space-y-4">
                            <span className="text-primary-500 text-[10px] font-black uppercase tracking-[0.3em]">Common Questions</span>
                            <h2 className="text-3xl sm:text-4xl md:text-6xl font-black text-text-primary tracking-tighter uppercase italic">
                                People Also <span className="text-primary-500">Ask</span>
                            </h2>
                        </div>
                    )}

                    <div className="space-y-4">
                        {FAQ_ITEMS.map((item, idx) => {
                            const isOpen = openIndex === idx;

                            return (
                                <div
                                    key={idx}
                                    className={`border border-border-color rounded-xl overflow-hidden transition-all ${isOpen ? 'ring-2 ring-primary-500/20 shadow-lg scale-[1.01]' : 'hover:bg-bg-section/50'}`}
                                >
                                    <button
                                        onClick={() => setOpenIndex(isOpen ? null : idx)}
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
            </section>
        </>
    );
};
