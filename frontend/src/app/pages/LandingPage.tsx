import React from 'react';
import { Button } from '../components/common/Button';
import { Layout } from '../components/layout/Layout';
import { Search, Star, Clock, Shield, ArrowRight, Utensils, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Seo from '../components/common/Seo';
import CloudServices from '../components/home/CloudServices';

const LandingPage: React.FC = () => {
    const { t } = useTranslation();
    const [stats, setStats] = React.useState({ students: 500, rating: 4.9 });

    React.useEffect(() => {
        // Simulate real-time activity
        const interval = setInterval(() => {
            setStats(prev => ({
                students: prev.students + Math.floor(Math.random() * 2),
                rating: prev.rating
            }));
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.2 }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    };

    return (
        <Layout>
            <Seo
                title="Home"
                description="MessWalha - The #1 Mess Discovery Platform for Students. Find healthy, verified meal plans near your hostel or college."
            />
            {/* Hero Section */}
            <section className="relative py-20 overflow-hidden hero">
                <div className="container mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={containerVariants}
                        className="space-y-8"
                    >
                        <motion.div variants={itemVariants} className="inline-block px-4 py-2 bg-primary-500/10 text-primary-500 rounded-full text-sm font-black uppercase tracking-widest">
                            #1 Mess Discovery Platform for Students
                        </motion.div>
                        <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-heading font-black leading-[1.1] tracking-tighter text-text-inverse">
                            {t('landing.hero_title')}
                        </motion.h1>
                        <motion.p variants={itemVariants} className="text-xl text-text-inverse opacity-80 max-w-lg font-medium leading-relaxed">
                            {t('landing.hero_subtitle')}
                        </motion.p>
                        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row gap-4">
                            <Link to="/find-mess">
                                <Button size="lg" className="rounded-xl px-8 h-16 shadow-lg shadow-black/20 hover:scale-105 transition-transform active:scale-95">
                                    {t('common.find_mess')} <ArrowRight className="ml-2" size={20} />
                                </Button>
                            </Link>
                            <Link to="/register">
                                <Button variant="outline" size="lg" className="rounded-xl px-8 h-16 border-white/20 text-white hover:bg-white/10 transition-all">
                                    List Your Mess
                                </Button>
                            </Link>
                        </motion.div>

                        <motion.div variants={itemVariants} className="flex items-center space-x-4 pt-4">
                            <div className="flex -space-x-3">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="w-12 h-12 rounded-full border-4 border-white bg-bg-section shadow-sm overflow-hidden">
                                        <img
                                            src={`https://i.pravatar.cc/150?u=${i}`}
                                            alt="Student"
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/150?text=S';
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                            <p className="text-sm font-bold text-text-inverse opacity-70">
                                <span className="text-white font-black">{stats.students}+</span> Students joined this month
                            </p>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="relative"
                    >
                        <div className="w-full aspect-square bg-gradient-to-br from-primary-500/20 via-primary-500/5 to-primary-600/20 rounded-[3rem] overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white/50 backdrop-blur-sm group">
                            <div className="absolute inset-0 flex items-center justify-center text-primary-500/10 group-hover:scale-110 transition-transform duration-700">
                                <Utensils size={240} />
                            </div>
                        </div>

                        {/* Stats Overlay */}
                        <motion.div
                            initial={{ x: 20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.6 }}
                            className="absolute -bottom-8 -left-8 bg-white dark:bg-dark-800 p-8 rounded-xl shadow-lg border border-border-color"
                        >
                            <div className="flex items-center space-x-4">
                                <div className="p-4 bg-primary-500 text-white rounded-md shadow-md shadow-primary-500/30">
                                    <Star fill="currentColor" size={28} />
                                </div>
                                <div>
                                    <p className="text-3xl font-black tracking-tighter text-text-primary dark:text-text-inverse">{stats.rating}/5</p>
                                    <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">Global Rating</p>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-24 bg-bg-section dark:bg-dark-900 relative">
                <div className="container mx-auto px-4 text-center mb-16 relative z-10">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-heading font-black tracking-tight mb-4 text-text-primary dark:text-text-inverse"
                    >
                        Why Choose MessWalha?
                    </motion.h2>
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="text-text-muted max-w-2xl mx-auto font-medium"
                    >
                        We simplify your daily meal management so you can focus on what matters most—your studies.
                    </motion.p>
                </div>

                <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                        { icon: <Search />, title: 'Easy Discovery', desc: 'Find messes filtered by location, price, and cuisine.', color: 'hover:bg-blue-500' },
                        { icon: <Clock />, title: 'Flexible Subs', desc: 'Choose weekly or monthly plans that suit your schedule.', color: 'hover:bg-primary-500' },
                        { icon: <Shield />, title: 'Verified Only', desc: 'Every mess on our platform is hand-picked and verified.', color: 'hover:bg-indigo-500' },
                        { icon: <Utensils />, title: 'Real-time Menus', desc: 'Check today\'s menu before you even leave your room.', color: 'hover:bg-amber-500' },
                    ].map((feature, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white dark:bg-dark-800 p-10 rounded-xl text-center shadow-md border border-border-color hover:shadow-lg hover:-translate-y-2 transition-all group"
                        >
                            <div className={`w-16 h-16 bg-bg-section dark:bg-dark-700 text-text-muted rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:text-white transition-all duration-300 ${feature.color}`}>
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-black mb-3 text-text-primary dark:text-text-inverse group-hover:text-primary-500 transition-colors uppercase tracking-tight">{feature.title}</h3>
                            <p className="text-text-muted text-sm font-bold leading-relaxed">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-24 bg-white dark:bg-dark-800">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-heading font-black tracking-tighter uppercase italic mb-4">How It Works</h2>
                        <div className="w-24 h-1 bg-primary-500 mx-auto rounded-full" />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gray-100 dark:bg-dark-700 -translate-y-1/2 z-0" />

                        {[
                            { step: '01', title: 'Search', desc: 'Browse verified messes near your location.', icon: Search },
                            { step: '02', title: 'Subscribe', desc: 'Pick a weekly or monthly plan that fits your budget.', icon: CreditCard },
                            { step: '03', title: 'Enjoy', desc: 'Simply show your QR code and enjoy your healthy meal!', icon: Utensils },
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.2 }}
                                className="relative z-10 bg-white dark:bg-dark-900 p-8 rounded-xl border border-border-color shadow-sm text-center"
                            >
                                <div className="w-16 h-16 bg-primary-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 text-xl font-black shadow-lg shadow-primary-500/20">
                                    {item.step}
                                </div>
                                <h3 className="text-xl font-black mb-2 uppercase tracking-tight">{item.title}</h3>
                                <p className="text-text-muted text-sm font-bold">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Cloud Services Section */}
            <CloudServices />

            {/* CTA Section */}
            <section className="py-24">
                <div className="container mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="bg-dark-900 rounded-xl p-16 overflow-hidden relative shadow-lg"
                    >
                        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500 opacity-20 rounded-full -mr-32 -mt-32 blur-[100px]" />

                        <div className="relative z-10 text-center text-white space-y-8">
                            <h2 className="text-4xl md:text-6xl font-heading font-black tracking-tighter uppercase italic">{t('Ready to Simplify Your Meals?')}</h2>
                            <p className="text-white/70 max-w-xl mx-auto text-lg font-medium leading-relaxed italic">
                                Join thousands of students who have already found their perfect mess through MessWalha.
                            </p>
                            <div className="pt-4">
                                <Link to="/register">
                                    <Button size="lg" className="rounded-xl px-12 h-20 bg-primary-500 text-white hover:bg-white hover:text-primary-500 border-none transition-all font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-primary-500/40">
                                        Get Started for Free
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>
        </Layout>
    );
};

export default LandingPage;
