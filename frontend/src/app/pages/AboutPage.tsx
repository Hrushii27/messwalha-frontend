import React from 'react';
import { Layout } from '../components/layout/Layout';
import { motion } from 'framer-motion';
import { Shield, Target, Award, Users, Utensils, Heart } from 'lucide-react';
import { Card } from '../components/common/Card';

const AboutPage: React.FC = () => {
    return (
        <Layout>
            <div className="bg-dark text-white py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-primary opacity-5 animate-pulse" />
                <div className="container mx-auto px-4 relative">
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="max-w-3xl"
                    >
                        <h1 className="text-6xl font-heading font-black tracking-tighter mb-6">
                            OUR <span className="text-primary italic">STORY</span>
                        </h1>
                        <p className="text-xl text-gray-400 font-medium leading-relaxed">
                            MessWalha was born from a simple observation: students spend too much time worrying about their next meal and not enough time on their studies. We're here to bridge that gap with technology and trust.
                        </p>
                    </motion.div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-24">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                    {[
                        { icon: <Target className="text-primary" />, title: 'Mission', desc: 'To create a transparent ecosystem where students find quality food effortlessly.' },
                        { icon: <Shield className="text-secondary" />, title: 'Trust', desc: 'Every mess listed on our platform undergoes a rigorous verification process.' },
                        { icon: <Heart className="text-red-500" />, title: 'Care', desc: 'Working closely with mess owners to ensure they thrive while serving students.' }
                    ].map((item, i) => (
                        <motion.div
                            key={i}
                            initial={{ y: 20, opacity: 0 }}
                            whileInView={{ y: 0, opacity: 1 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                        >
                            <Card className="p-10 border-none shadow-2xl hover:scale-105 transition-transform h-full">
                                <div className="p-4 rounded-2xl bg-gray-50 inline-block mb-6">
                                    {item.icon}
                                </div>
                                <h3 className="text-2xl font-black mb-4 uppercase tracking-tighter">{item.title}</h3>
                                <p className="text-gray-500 font-medium leading-relaxed">{item.desc}</p>
                            </Card>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-32 bg-gray-50 rounded-[4rem] p-12 md:p-24 overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px] -mr-48 -mt-48" />
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
                        <div className="space-y-8">
                            <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">
                                Why We <span className="text-primary italic">Exist</span>
                            </h2>
                            <div className="space-y-6">
                                {[
                                    { icon: <Users size={20} />, label: '8,000+ Students connected' },
                                    { icon: <Utensils size={20} />, label: '500+ Verified messes' },
                                    { icon: <Award size={20} />, label: '99% Satisfaction rate' }
                                ].map((stat, i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-full bg-white shadow-lg flex items-center justify-center text-primary">
                                            {stat.icon}
                                        </div>
                                        <span className="font-black text-sm uppercase tracking-widest text-gray-600">{stat.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-white p-10 rounded-[3rem] shadow-2xl border border-gray-100">
                            <p className="text-lg text-gray-500 italic font-medium leading-relaxed mb-8">
                                "The struggle of finding a decent mess in a new city is real. MessWalha didn't just find me food; it found me a community that cares about my health."
                            </p>
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-indigo-500" />
                                <div>
                                    <p className="font-black text-sm uppercase">Rahul Sharma</p>
                                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Engineering Student</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default AboutPage;
