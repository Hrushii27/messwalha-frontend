import React from 'react';
import { Layout } from '../components/layout/Layout';
import { motion } from 'framer-motion';
import { Shield, Target, Award, Users, Utensils, Heart, TrendingUp, Zap, Globe } from 'lucide-react';
import { Card } from '../components/common/Card';
import Seo from '../components/common/Seo';

const AboutPage: React.FC = () => {
    return (
        <Layout>
            <Seo
                title="Our Story & Impact | MessWalha"
                description="Learn how MessWalha is transforming the student meal experience through technology, trust, and community."
            />

            {/* Hero Section */}
            <div className="grad-dark py-32 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[120px] -mr-64 -mt-64" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] -ml-64 -mb-64" />

                <div className="container mx-auto px-4 relative z-10">
                    <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="max-w-4xl"
                    >
                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-8">
                            REVOLUTIONIZING <br />
                            <span className="text-primary-500 italic">STUDENT DINING</span>
                        </h1>
                        <p className="text-xl md:text-2xl text-white/60 font-medium leading-relaxed max-w-2xl italic">
                            MessWalha was born from a simple observation: students spend too much time worrying about their next meal and not enough time on their studies. We're here to bridge that gap with technology and trust.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Core Values */}
            <div className="container mx-auto px-4 py-32">
                <div className="text-center mb-24 space-y-4">
                    <h2 className="text-xs font-black uppercase tracking-[0.4em] text-primary-500">Our Core Principles</h2>
                    <h3 className="text-4xl md:text-5xl font-black tracking-tighter dark:text-white uppercase italic">Built on Foundation of Trust</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                    {[
                        { icon: <Target className="text-primary-500" />, title: 'Mission', desc: 'To create a transparent ecosystem where students find quality food effortlessly using data-driven discovery.', color: 'border-primary-500/20' },
                        { icon: <Shield className="text-indigo-500" />, title: 'Verification', desc: 'Every mess listed undergoes a 12-point hygiene and quality check before being certified by MessWalha.', color: 'border-indigo-500/20' },
                        { icon: <Heart className="text-red-500" />, title: 'Impact', desc: 'We don\'t just serve food; we empower local mess owners with tools to scale their passion into a sustainable business.', color: 'border-red-500/20' }
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ y: 30, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Card className={`p-12 bg-white dark:bg-dark-800 border-2 ${item.color} shadow-2xl rounded-[3rem] h-full group hover:-translate-y-4 transition-all duration-500`}>
                                <div className="w-16 h-16 rounded-2xl bg-bg-section dark:bg-dark-700 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                                    {item.icon}
                                </div>
                                <h3 className="text-2xl font-black mb-4 uppercase tracking-tighter dark:text-white">{item.title}</h3>
                                <p className="text-text-muted dark:text-white/50 font-medium leading-relaxed italic">{item.desc}</p>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                {/* Impact Stats Section */}
                <div className="mt-40 space-y-24">
                    <div className="bg-dark-900 rounded-[4rem] p-12 md:p-32 overflow-hidden relative border border-white/5 shadow-3xl">
                        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-[150px] -mr-64 -mt-64" />

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-32 items-center relative z-10">
                            <div className="space-y-12">
                                <div className="space-y-4">
                                    <h2 className="text-xs font-black uppercase tracking-[0.4em] text-primary-500">Our Real-World Impact</h2>
                                    <h3 className="text-4xl md:text-6xl font-black tracking-tighter text-white uppercase italic leading-none">
                                        Scaling <span className="text-primary-500">Nutrition</span> <br />
                                        Across India
                                    </h3>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                                    {[
                                        { icon: <Users size={24} />, label: '8,000+ Students', sub: 'Active monthly users' },
                                        { icon: <Utensils size={24} />, label: '500+ Messes', sub: 'Verified partners' },
                                        { icon: <TrendingUp size={24} />, label: '40% Growth', sub: 'Month over month' },
                                        { icon: <Globe size={24} />, label: '12 Cities', sub: 'And expanding' }
                                    ].map((stat, i) => (
                                        <div key={i} className="space-y-2">
                                            <div className="flex items-center gap-3 text-primary-500">
                                                {stat.icon}
                                                <span className="text-xl font-black text-white">{stat.label}</span>
                                            </div>
                                            <p className="text-[10px] font-black uppercase tracking-widest text-white/30 ml-9">{stat.sub}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="relative group">
                                <div className="absolute -inset-4 bg-primary-500/20 rounded-[4rem] blur-2xl group-hover:bg-primary-500/30 transition-all duration-700" />
                                <div className="bg-white/5 backdrop-blur-3xl p-12 rounded-[4rem] border border-white/10 relative z-10 space-y-8">
                                    <p className="text-2xl text-white/80 italic font-medium leading-relaxed">
                                        "The struggle of finding a decent mess in a new city is real. MessWalha didn't just find me food; it found me a community that cares about my health and time."
                                    </p>
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-500 shadow-xl flex items-center justify-center text-white font-black text-xl">
                                            RS
                                        </div>
                                        <div>
                                            <p className="font-black text-white uppercase tracking-widest">Rahul Sharma</p>
                                            <p className="text-[10px] font-black text-primary-500 uppercase tracking-[0.2em]">Final Year Engineering Student</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* How MessWalha Works */}
                    <div className="py-24 space-y-12">
                        <div className="text-center space-y-4">
                            <h2 className="text-xs font-black uppercase tracking-[0.4em] text-primary-500">Simple Process</h2>
                            <h3 className="text-4xl md:text-5xl font-black tracking-tighter dark:text-white uppercase italic">How MessWalha Works</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {[
                                { step: '1', title: 'Search Area', desc: 'Search your area to find messes near your college or hostel.' },
                                { step: '2', title: 'Compare', desc: 'Compare mess services, menus, and prices to find your fit.' },
                                { step: '3', title: 'Subscribe', desc: 'Subscribe to a monthly meal plan and enjoy healthy food.' }
                            ].map((item, i) => (
                                <div key={i} className="bg-white/5 p-10 rounded-[2.5rem] border border-white/10 relative overflow-hidden group hover:bg-white/10 transition-all">
                                    <span className="absolute top-4 right-8 text-8xl font-black text-white/5 group-hover:text-primary-500/10 transition-colors">{item.step}</span>
                                    <h4 className="text-xl font-black text-white uppercase tracking-tight mb-4">{item.title}</h4>
                                    <p className="text-white/40 text-sm font-medium italic">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="p-12 bg-primary-500 rounded-[3rem] text-white space-y-4 shadow-2xl shadow-primary-500/20">
                            <Zap size={32} className="mb-4" />
                            <h4 className="text-2xl font-black uppercase tracking-tighter italic">Instant Booking</h4>
                            <p className="text-white/80 font-medium italic">Subscribe to your preferred mess in under 60 seconds with digital payments.</p>
                        </div>
                        <div className="p-12 bg-dark-800 rounded-[3rem] text-white space-y-4 border border-white/5 shadow-2xl">
                            <Award size={32} className="text-primary-500 mb-4" />
                            <h4 className="text-2xl font-black uppercase tracking-tighter italic">Certified Quality</h4>
                            <p className="text-white/40 font-medium italic">We perform regular surprise audits to ensure food quality never drops.</p>
                        </div>
                        <div className="p-12 bg-indigo-500 rounded-[3rem] text-white space-y-4 shadow-2xl shadow-indigo-500/20">
                            <Users size={32} className="mb-4" />
                            <h4 className="text-2xl font-black uppercase tracking-tighter italic">Student First</h4>
                            <p className="text-white/80 font-medium italic">Designed by students who understand the struggle of hostel life.</p>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default AboutPage;
