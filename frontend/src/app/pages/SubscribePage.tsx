import React, { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Check, Zap, Shield, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/axiosInstance';
import Seo from '../components/common/Seo';

interface RazorpayResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}

const SubscribePage: React.FC = () => {
    const [loading, setLoading] = useState(false);

    const handleSubscribe = async () => {
        setLoading(true);
        try {
            const res = await api.post('/payments/create-order', {
                amount: 499,
                planType: 'monthly'
            });

            const { orderId, amount, currency } = res.data;

            // Razorpay Integration
            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount,
                currency,
                name: 'MessWalha',
                description: 'Mess Listing Subscription',
                order_id: orderId,
                handler: async (response: RazorpayResponse) => {
                    try {
                        await api.post('/payments/verify', {
                            ...response,
                            planType: 'monthly'
                        });
                        window.location.href = '/owner/dashboard';
                    } catch (error) {
                        console.error('Payment verification failed:', error);
                        alert('Payment verification failed');
                    }
                },
                theme: { color: '#F59E0B' }
            };

            const Razorpay = window.Razorpay;
            const rzp = new Razorpay(options);
            rzp.open();
        } catch (err) {
            console.error('Subscription failed:', err);
            alert('Failed to initiate subscription');
        } finally {
            setLoading(false);
        }
    };

    const features = [
        "Publish your mess to thousands of students",
        "Full Owner Dashboard access",
        "Manage menus and pricing in real-time",
        "Priority support from MessWalha team",
        "Detailed performance analytics",
        "Verified badge on your listing"
    ];

    return (
        <Layout>
            <Seo
                title="Subscribe | messWalha Business"
                description="Subscribe to messWalha elite listing plan and grow your mess business."
            />

            <div className="grad-dark py-32 relative overflow-hidden">
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-6xl md:text-8xl font-black tracking-tighter text-white italic"
                    >
                        UNLEASH YOUR <span className="text-primary-500">POTENTIAL</span>
                    </motion.h1>
                    <p className="text-white/40 font-black uppercase tracking-[0.4em] text-[10px] md:text-xs">MessWalha Elite Listing Plan</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-24">
                <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    {/* Left: Content */}
                    <div className="space-y-12">
                        <div className="space-y-6">
                            <h2 className="text-4xl font-black tracking-tight text-white italic uppercase">
                                Why Upgrade to <span className="text-primary-500 underline decoration-4 underline-offset-8">Elite?</span>
                            </h2>
                            <p className="text-white/60 text-lg leading-relaxed font-medium">
                                Join the ranks of successful mess owners who are transforming their business through MessWalha's digital ecosystem.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            {features.map((f, i) => (
                                <motion.div
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: i * 0.1 }}
                                    key={i}
                                    className="flex items-center gap-4 group"
                                >
                                    <div className="w-8 h-8 rounded-full bg-primary-500/10 border border-primary-500/20 flex items-center justify-center text-primary-500 group-hover:bg-primary-500 group-hover:text-white transition-all">
                                        <Check size={16} />
                                    </div>
                                    <span className="text-white/80 font-bold uppercase tracking-widest text-[10px]">{f}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>

                    {/* Right: Card */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                    >
                        <Card className="p-1 w-full bg-gradient-to-br from-primary-500 to-primary-700 rounded-[3rem] shadow-3xl shadow-primary-500/20">
                            <div className="bg-dark-900 rounded-[2.8rem] p-12 space-y-10">
                                <div className="space-y-4">
                                    <span className="bg-primary-500/10 text-primary-500 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border border-primary-500/20">Elite Listing Plan</span>
                                    <div className="flex items-baseline gap-2">
                                        <span className="text-6xl font-black text-white italic">₹499</span>
                                        <span className="text-white/40 font-bold uppercase tracking-widest text-sm">/ Month</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-primary-500">
                                        <Zap size={16} />
                                        <span className="text-[10px] font-black uppercase tracking-widest italic">First 2 Months Completely FREE</span>
                                    </div>
                                </div>

                                <div className="space-y-6 pt-6 border-t border-white/5">
                                    <Button
                                        onClick={handleSubscribe}
                                        disabled={loading}
                                        className="w-full h-20 bg-primary-500 hover:bg-primary-600 text-white font-black uppercase tracking-[0.3em] text-xs rounded-2xl flex items-center justify-center gap-4 transition-all hover:scale-[1.02] active:scale-95 shadow-2xl shadow-primary-500/40"
                                    >
                                        {loading ? <Loader2 className="animate-spin" /> : <>Subcribe Now <ArrowRight size={18} /></>}
                                    </Button>
                                    <div className="flex items-center justify-center gap-3 text-white/20">
                                        <Shield size={14} />
                                        <span className="text-[10px] font-bold uppercase tracking-widest">Secure Payment via Razorpay</span>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </Layout>
    );
};

export default SubscribePage;
