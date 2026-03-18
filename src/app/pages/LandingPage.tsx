import React from 'react';
import { Button } from '../components/common/Button';
import { Layout } from '../components/layout/Layout';
import {
    Search as SearchIcon,
    Star,
    Utensils,
    CreditCard,
    CircleCheck,
    MapPin,
    ClipboardList
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import Seo from '../components/common/Seo';

const LandingPage: React.FC = () => {
    useTranslation();
    const navigate = useNavigate();

    return (
        <Layout>
            <div className="bg-bg-main">
                <Seo
                    title="Find Your Perfect Mess in Seconds | MessWalha"
                    description="Discover verified mess services near your college. Compare menus, prices, and subscribe easily. Affordable and healthy meal plans for students."
                />

                {/* Hero Section */}
                <section className="relative min-h-[95vh] flex items-center overflow-hidden grad-dark pt-28">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none">
                        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                            <defs>
                                <pattern id="food-dots" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
                                    <circle cx="1" cy="1" r="0.5" fill="currentColor" className="text-primary-500" />
                                </pattern>
                            </defs>
                            <rect width="100" height="100" fill="url(#food-dots)" />
                        </svg>
                    </div>

                    <div className="container mx-auto px-4 relative z-10 py-20 lg:py-32">
                        <div className="max-w-5xl mx-auto text-center space-y-12">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                className="space-y-6"
                            >
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="inline-block px-6 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4"
                                >
                                    Elite Mess Discovery Engine
                                </motion.div>
                                <h1 className="text-6xl md:text-9xl font-black text-white leading-[0.85] tracking-tighter">
                                    Find Your Perfect <br />
                                    <span className="text-primary-500 italic">Mess in Seconds</span>
                                </h1>
                                <p className="text-xl md:text-2xl text-white/50 font-medium max-w-3xl mx-auto leading-relaxed italic">
                                    Discover verified mess services near your college terminal. <br className="hidden md:block" />
                                    Compare menus, prices, and subscribe with professional ease.
                                </p>
                            </motion.div>

                            {/* Modern Search UI - Improved */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ duration: 0.8, delay: 0.2 }}
                                className="bg-white/5 backdrop-blur-3xl p-4 rounded-[3rem] md:rounded-full border border-white/10 shadow-[0_32px_100px_-20px_rgba(0,0,0,0.5)] max-w-4xl mx-auto group hover:border-primary-500/30 transition-all duration-700"
                            >
                                <div className="flex flex-col md:flex-row items-center gap-3">
                                    <div className="flex-1 w-full relative group/input">
                                        <MapPin className="absolute left-8 top-1/2 -translate-y-1/2 text-primary-500 z-10 group-hover/input:scale-110 transition-transform" size={20} />
                                        <input
                                            type="text"
                                            placeholder="📍 Enter College / Area..."
                                            className="w-full bg-white/[0.03] border-none text-white pl-18 pr-8 py-7 rounded-full focus:ring-2 focus:ring-primary-500/50 transition-all font-black uppercase tracking-widest text-[11px] outline-none"
                                        />
                                    </div>
                                    <div className="flex-1 w-full relative group/select">
                                        <Utensils className="absolute left-8 top-1/2 -translate-y-1/2 text-primary-500 z-10 group-hover/select:scale-110 transition-transform" size={20} />
                                        <select className="w-full bg-white/[0.03] border-none text-white pl-18 pr-12 py-7 rounded-full focus:ring-2 focus:ring-primary-500/50 transition-all font-black uppercase tracking-widest text-[11px] appearance-none cursor-pointer outline-none">
                                            <option value="" className="bg-dark-900">🍛 Veg / Non-Veg</option>
                                            <option value="veg" className="bg-dark-900">Pure Veg</option>
                                            <option value="non-veg" className="bg-dark-900">Veg + Non-Veg</option>
                                        </select>
                                    </div>
                                    <Button
                                        size="lg"
                                        onClick={() => navigate('/find-mess')}
                                        className="w-full md:w-auto md:px-16 h-20 rounded-full shadow-2xl shadow-primary-500/40 font-black uppercase tracking-[0.3em] text-[11px] hover:scale-105 transition-all duration-500 flex items-center justify-center gap-3"
                                    >
                                        <SearchIcon size={20} />
                                        Find Mess
                                    </Button>
                                </div>
                            </motion.div>

                            {/* Features Under Search - With Checkmarks as requested */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8, duration: 1 }}
                                className="flex flex-wrap justify-center gap-10 pt-6"
                            >
                                {[
                                    { icon: CircleCheck, text: 'Verified Mess Owners' },
                                    { icon: CircleCheck, text: 'Affordable Monthly Plans' },
                                    { icon: CircleCheck, text: 'Healthy & Hygienic Food' }
                                ].map((feature, i) => (
                                    <div key={i} className="flex items-center space-x-3 text-white/40 group hover:text-white transition-colors cursor-default">
                                        <feature.icon size={18} className="text-primary-500 group-hover:scale-125 transition-transform" />
                                        <span className="text-[11px] font-black uppercase tracking-[0.2em] italic">✓ {feature.text}</span>
                                    </div>
                                ))}
                            </motion.div>
                        </div>
                    </div>

                    {/* Decorative Elements */}
                    <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute top-24 -right-24 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl animate-pulse delay-700"></div>
                </section>

                {/* Impact Section */}
                <section className="py-24 bg-bg-main border-y border-border-color/50">
                    <div className="container mx-auto px-4">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-12">
                            {[
                                { label: 'Students Connected', value: '8,000+' },
                                { label: 'Mess Partners', value: '150+' },
                                { label: 'Cities Covered', value: '12+' },
                                { label: 'Satisfaction Rate', value: '98%' }
                            ].map((stat, i) => (
                                <div key={i} className="text-center group">
                                    <div className="text-4xl md:text-5xl font-black text-text-primary mb-2 group-hover:text-primary-500 transition-colors">
                                        {stat.value}
                                    </div>
                                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">
                                        {stat.label}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* How It Works Section */}
                <section className="py-32 bg-white dark:bg-dark-900 overflow-hidden">
                    <div className="container mx-auto px-4">
                        <div className="text-center mb-24 max-w-3xl mx-auto space-y-4">
                            <span className="text-primary-500 text-[10px] font-black uppercase tracking-[0.3em]">Easy 3 Step Process</span>
                            <h2 className="text-4xl md:text-6xl font-black text-text-primary tracking-tighter">
                                How It <span className="text-primary-500 italic">Works</span>
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
                            {/* Connecting Line */}
                            <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-border-color -translate-y-1/2 z-0 opacity-50"></div>

                            {[
                                {
                                    title: 'Search Area',
                                    desc: 'Find verified mess services near your college or area.',
                                    icon: SearchIcon,
                                    step: '01'
                                },
                                {
                                    title: 'Compare Plans',
                                    desc: 'Check menus, monthly pricing, and genuine student reviews.',
                                    icon: ClipboardList,
                                    step: '02'
                                },
                                {
                                    title: 'Subscribe',
                                    desc: 'Book your plan digitally and enjoy healthy meals instantly.',
                                    icon: CreditCard,
                                    step: '03'
                                }
                            ].map((item, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ y: -10 }}
                                    className="relative z-10 bg-bg-main p-12 rounded-2xl border border-border-color text-center hover:border-primary-500/30 transition-all hover:shadow-2xl"
                                >
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-16 h-16 bg-primary-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary-500/40 rotate-12 group-hover:rotate-0 transition-transform">
                                        <item.icon size={32} />
                                    </div>
                                    <div className="text-[60px] font-black text-border-color/20 absolute -top-4 right-10 leading-none">
                                        {item.step}
                                    </div>
                                    <h3 className="text-2xl font-black text-text-primary mb-4 mt-8 uppercase tracking-tighter italic">{item.title}</h3>
                                    <p className="text-text-muted leading-relaxed font-medium capitalize italic">"{item.desc}"</p>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Testimonials Section */}
                <section className="py-32 grad-dark text-white overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-1/3 h-full bg-primary-500/5 blur-3xl rounded-full"></div>

                    <div className="container mx-auto px-4">
                        <div className="flex flex-col md:flex-row justify-between items-end mb-24 gap-8">
                            <div className="space-y-4">
                                <span className="text-primary-500 text-[10px] font-black uppercase tracking-[0.3em]">Student Voice</span>
                                <h2 className="text-4xl md:text-6xl font-black tracking-tighter">
                                    Thousands of Students <br />
                                    <span className="text-primary-500 italic">Love Us</span>
                                </h2>
                            </div>
                            <Button variant="outline" className="text-white border-white/20 hover:bg-white/10 px-10 rounded-full font-black uppercase tracking-widest text-xs h-16">
                                Read All Stories
                            </Button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { name: 'Rahul S.', role: 'Engineering Student', text: 'MessWalha saved me from eating bad food. The verification system works!' },
                                { name: 'Priya K.', role: 'Medical Student', text: 'Managing subscriptions is so easy now. I can skip meals and save money too.' },
                                { name: 'Amit J.', role: 'Management Student', text: 'Literally found my mess in 2 minutes after arriving in Pune. Lifesaver!' }
                            ].map((testi, i) => (
                                <motion.div
                                    key={i}
                                    whileHover={{ scale: 1.02 }}
                                    className="bg-white/5 backdrop-blur border border-white/10 p-10 rounded-3xl space-y-6"
                                >
                                    <div className="flex text-primary-500 gap-1">
                                        {[1, 2, 3, 4, 5].map(star => <Star key={star} size={14} fill="currentColor" />)}
                                    </div>
                                    <p className="text-xl italic font-medium leading-relaxed opacity-80">"{testi.text}"</p>
                                    <div className="pt-6 border-t border-white/5 flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-primary-500/30"></div>
                                        <div>
                                            <p className="font-black uppercase tracking-widest text-xs">{testi.name}</p>
                                            <p className="text-[10px] uppercase tracking-widest opacity-40">{testi.role}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section className="py-24 bg-bg-main">
                    <div className="container mx-auto px-4">
                        <div className="bg-primary-500 rounded-[3rem] p-12 md:p-24 text-center text-white relative overflow-hidden group">
                            <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-white/10 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-[2s]"></div>
                            <div className="relative z-10 space-y-10 max-w-3xl mx-auto">
                                <h2 className="text-4xl md:text-7xl font-black leading-none tracking-tighter">
                                    Ready to find your <br />
                                    <span className="italic text-white/80">Next Meal?</span>
                                </h2>
                                <p className="text-xl font-medium opacity-80">
                                    Join thousands of students getting healthy meals every day.
                                </p>
                                <div className="flex flex-col sm:flex-row justify-center gap-4 pt-6">
                                    <Button
                                        size="lg"
                                        onClick={() => navigate('/register')}
                                        className="bg-white text-primary-500 hover:bg-gray-100 px-12 py-6 rounded-full font-black uppercase tracking-[0.2em] text-xs h-20 shadow-2xl"
                                    >
                                        Get Started For Free
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        onClick={() => navigate('/find-mess')}
                                        className="border-white/40 text-white hover:bg-white/10 px-12 py-6 rounded-full font-black uppercase tracking-[0.2em] text-xs h-20"
                                    >
                                        Browse Messes
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </Layout>
    );
};

export default LandingPage;
