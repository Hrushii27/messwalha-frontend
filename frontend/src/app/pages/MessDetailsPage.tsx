import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import {
    Star,
    Clock,
    Utensils,
    CircleCheck,
    MessageSquare,
    Share2,
    Heart,
    User as UserIcon,
    Phone,
    Navigation,
    ShieldCheck
} from 'lucide-react';
import api, { getImageUrl } from '../api/axiosInstance';
import { useAppSelector } from '../../hooks/redux';
import type { RootState } from '../../store';
import { useFavorites } from '../hooks/useFavorites';
import { motion } from 'framer-motion';
import type { Mess, Menu } from '../types/mess';

// Razorpay is now globally declared in global.d.ts

interface Plan {
    title: string;
    price: string;
    priceValue: number;
    type: string;
    period: string;
    desc: string;
    popular?: boolean;
}

interface RazorpayResponse {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
}

const MessDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [mess, setMess] = useState<Mess | null>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'menu' | 'reviews' | 'about'>('menu');
    const [selectedDay, setSelectedDay] = useState(new Date().toLocaleDateString('en-US', { weekday: 'long' }));
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [subscribing, setSubscribing] = useState(false);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', show: false });
    const { isFavorite, toggleFavorite } = useFavorites();
    const { user } = useAppSelector((state: RootState) => state.auth);

    useEffect(() => {
        const fetchDetails = async () => {
            if (!id) return;
            try {
                const response = await api.get(`/messes/${id}`);
                setMess(response.data.data);
            } catch (error) {
                console.error('Error fetching details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [id]);

    const handleSubscribe = async () => {
        if (!selectedPlan) {
            alert('Please select a plan first');
            return;
        }

        try {
            setSubscribing(true);
            const { data } = await api.post('/payments/create-order', {
                messId: id,
                planType: selectedPlan.type,
                amount: selectedPlan.priceValue
            });

            if (data.isTestMode) {
                try {
                    const verifyRes = await api.post('/payments/verify', {
                        razorpay_order_id: data.orderId,
                        razorpay_payment_id: 'mock_pay_' + Date.now(),
                        razorpay_signature: 'mock_sig',
                        messId: id,
                        planType: selectedPlan.type
                    });
                    if (verifyRes.data.success) {
                        alert('Subscription successful (Test Mode)');
                        navigate('/subscriptions');
                    }
                    return;
                } catch (verifyErr) {
                    console.error('Test verification failed', verifyErr);
                    alert('Mock payment failed');
                    return;
                }
            }

            const options = {
                key: import.meta.env.VITE_RAZORPAY_KEY_ID,
                amount: data.amount,
                currency: data.currency,
                name: 'MessWalha',
                description: `Subscription for ${mess?.name}`,
                order_id: data.orderId,
                handler: async (response: RazorpayResponse) => {
                    try {
                        const verifyRes = await api.post('/payments/verify', {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            messId: id,
                            planType: selectedPlan.type
                        });
                        if (verifyRes.data.success) {
                            alert('Subscription successful!');
                            navigate('/subscriptions');
                        }
                    } catch (err) {
                        console.error('Verification failed', err);
                        alert('Payment verification failed. Please contact support.');
                    }
                },
                prefill: {
                    name: user?.name || undefined,
                    email: user?.email || undefined,
                },
                theme: { color: '#F97316' }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (error) {
            console.error('Checkout error', error);
            alert('Failed to initiate checkout');
        } finally {
            setSubscribing(false);
        }
    };

    const handleReviewSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const { data } = await api.post('/reviews', {
                messId: id,
                rating: reviewForm.rating,
                comment: reviewForm.comment
            });
            if (data.success) {
                alert('Review submitted successfully!');
                setReviewForm({ rating: 5, comment: '', show: false });
                const response = await api.get(`/messes/${id}`);
                setMess(response.data.data);
            }
        } catch (error) {
            console.error('Review submission failed', error);
            alert('Failed to submit review. Make sure you are logged in.');
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="container mx-auto px-4 py-12 space-y-8 animate-pulse text-white">
                    <div className="h-64 bg-white/5 rounded-xl" />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="h-10 w-1/2 bg-white/5 rounded-md" />
                            <div className="h-4 w-3/4 bg-white/5 rounded-md" />
                            <div className="h-48 bg-white/5 rounded-xl" />
                        </div>
                        <div className="h-96 bg-white/5 rounded-xl" />
                    </div>
                </div>
            </Layout>
        );
    }

    if (!mess) return <Layout><div className="text-center py-20 text-white">Mess not found</div></Layout>;

    const currentDayMenu = mess.menus?.find((m: Menu) => m.day === selectedDay);
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Hero Section */}
                <div className="relative h-[300px] md:h-[450px] rounded-[2.5rem] overflow-hidden mb-12 shadow-2xl group">
                    <img
                        src={getImageUrl(mess.messImage || mess.images?.[0]) || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1200'}
                        className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                        alt={mess.name}
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/1200x800.png?text=Mess+Image';
                        }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                    <div className="absolute top-6 right-6 flex gap-3">
                        <button
                            onClick={() => {
                                if (!mess) return;
                                if (navigator.share) {
                                    navigator.share({
                                        title: mess.name,
                                        text: `Check out ${mess.name} on MessWalha!`,
                                        url: window.location.href,
                                    }).catch(console.error);
                                } else {
                                    navigator.clipboard.writeText(window.location.href);
                                    alert('Link copied to clipboard!');
                                }
                            }}
                            className="p-3 bg-white/10 backdrop-blur-md rounded-2xl text-white hover:bg-white/20 transition-all border border-white/20"
                        >
                            <Share2 size={20} />
                        </button>
                        <button
                            onClick={() => {
                                if (id) toggleFavorite(id);
                            }}
                            className={`p-3 backdrop-blur-md rounded-2xl transition-all border ${isFavorite(id || '') ? 'bg-red-500 border-red-500 text-white' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'}`}
                        >
                            <Heart size={20} fill={isFavorite(id || '') ? 'currentColor' : 'none'} className={isFavorite(id || '') ? 'animate-pulse' : ''} />
                        </button>
                    </div>

                    <div className="absolute bottom-10 left-10 right-10 flex flex-col md:flex-row justify-between items-end gap-6 text-white">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <span className="bg-primary-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md shadow-sm">
                                    {mess.cuisine || 'Multi-Cuisine'}
                                </span>
                                <span className="bg-success-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md shadow-sm flex items-center">
                                    <CircleCheck size={12} className="mr-1" /> Shield Protocol Active
                                </span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black italic tracking-tighter uppercase">{mess.name}</h1>
                            <div className="flex flex-wrap items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="flex text-rating-color">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <Star key={s} size={16} fill={s <= Math.round(mess.rating || 4) ? 'currentColor' : 'none'} />
                                        ))}
                                    </div>
                                    <span className="font-black text-white">{(mess.rating || 4.5).toFixed(1)}</span>
                                    <span className="text-white/60 text-xs font-bold uppercase tracking-widest">({mess.reviews?.length || 0} Signal Logs)</span>
                                </div>
                                <div className="flex items-center gap-2 text-white/80 font-bold uppercase tracking-widest text-xs">
                                    <Navigation size={18} className="text-primary-500" />
                                    <span>{mess.location?.address || mess.address}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-8 space-y-12">
                        {/* Custom Tabs */}
                        <div className="flex gap-8 border-b border-white/5">
                            {[
                                { id: 'menu', label: 'Menu Protocol', icon: Utensils },
                                { id: 'reviews', label: 'Public Feed', icon: MessageSquare },
                                { id: 'about', label: 'Asset Details', icon: ShieldCheck },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as 'menu' | 'reviews' | 'about')}
                                    className={`flex items-center gap-2 pb-6 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative ${activeTab === tab.id
                                        ? 'text-primary-500'
                                        : 'text-white/30 hover:text-white'
                                        }`}
                                >
                                    <tab.icon size={16} />
                                    {tab.label}
                                    {activeTab === tab.id && (
                                        <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-primary-500 rounded-full" />
                                    )}
                                </button>
                            ))}
                        </div>

                        {activeTab === 'menu' && (
                            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {mess.description && (
                                    <Card className="p-10 bg-white/5 backdrop-blur-3xl border-white/10 rounded-[3rem] space-y-6">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary-500 italic">Menu Description</h3>
                                        <p className="text-white/60 font-medium leading-relaxed italic border-l-4 border-primary-500/20 pl-6 py-2">
                                            "{mess.description}"
                                        </p>
                                    </Card>
                                )}

                                {mess.menuImages && mess.menuImages.length > 0 && (
                                    <div className="space-y-6">
                                        <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary-500 italic">Menu Gallery</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {mess.menuImages.map((img: string, i: number) => (
                                                <div key={i} className="rounded-[2rem] overflow-hidden border border-white/10 shadow-3xl aspect-[4/3] group">
                                                    <img
                                                        src={getImageUrl(img)}
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]"
                                                        alt={`Menu ${i}`}
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-8">
                                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                        {days.map((day) => (
                                            <button
                                                key={day}
                                                onClick={() => setSelectedDay(day)}
                                                className={`px-6 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border ${selectedDay === day
                                                    ? 'bg-primary-500 border-primary-500 text-white shadow-xl shadow-primary-500/20'
                                                    : 'bg-white/5 border-white/5 text-white/30 hover:bg-white/10'
                                                    }`}
                                            >
                                                {day}
                                            </button>
                                        ))}
                                    </div>

                                    <Card className="p-10 bg-white/5 backdrop-blur-3xl border-white/10 rounded-[3rem]">
                                        <div className="flex items-center justify-between mb-10">
                                            <h3 className="text-lg font-black uppercase tracking-widest italic text-white">{selectedDay}'s Protocol</h3>
                                            <span className="bg-success-500/10 text-success-500 px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-widest border border-success-500/20 italic">Fresh Logistics Verified</span>
                                        </div>

                                        {currentDayMenu ? (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {currentDayMenu.items.map((item, idx) => (
                                                    <div key={idx} className="bg-white/5 p-6 rounded-2xl flex items-center gap-6 border border-white/5 hover:border-primary-500/30 transition-all group">
                                                        <div className="w-14 h-14 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-500 group-hover:scale-110 transition-transform">
                                                            <Utensils size={20} />
                                                        </div>
                                                        <div className="flex-1">
                                                            <h4 className="font-black text-white text-[11px] uppercase tracking-widest mb-1">{item.name}</h4>
                                                            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${item.type === 'Non-Veg' ? 'border-red-500/20 bg-red-500/10 text-red-500' : 'border-success-500/20 bg-success-500/10 text-success-500'}`}>
                                                                {item.type}
                                                            </span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-center py-20 bg-white/5 rounded-[2.5rem] border-2 border-dashed border-white/5">
                                                <p className="text-white/20 font-black uppercase tracking-[0.2em] text-[10px] italic">No digital menu log detected for this day</p>
                                            </div>
                                        )}
                                    </Card>
                                </div>
                            </div>
                        )}

                        {activeTab === 'reviews' && (
                            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex justify-between items-center px-4">
                                    <h3 className="text-xl font-black uppercase tracking-widest italic text-white">Public Feed</h3>
                                    <Button
                                        variant="outline"
                                        className="rounded-full font-black uppercase tracking-widest text-[9px] py-4 px-8 bg-white/5 border-white/10 hover:bg-white/10 text-white/60 hover:text-white"
                                        onClick={() => setReviewForm(prev => ({ ...prev, show: !prev.show }))}
                                    >
                                        {reviewForm.show ? 'Cancel Log' : 'Post Signal Log'}
                                    </Button>
                                </div>

                                {reviewForm.show && (
                                    <Card className="p-10 border-primary-500/20 bg-primary-500/5 rounded-[3rem] animate-in slide-in-from-top-4 duration-300">
                                        <form onSubmit={handleReviewSubmit} className="space-y-8">
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 ml-2">Signal Intensity (Rating)</label>
                                                <div className="flex gap-4 p-4 bg-white/5 rounded-3xl w-fit">
                                                    {[1, 2, 3, 4, 5].map((num) => (
                                                        <button
                                                            key={num}
                                                            type="button"
                                                            onClick={() => setReviewForm({ ...reviewForm, rating: num })}
                                                            className={`p-2 transition-all hover:scale-125 ${reviewForm.rating >= num ? 'text-primary-500' : 'text-white/10'}`}
                                                        >
                                                            <Star size={32} fill={reviewForm.rating >= num ? 'currentColor' : 'none'} />
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40 ml-2">Logic Description (Comment)</label>
                                                <textarea
                                                    required
                                                    value={reviewForm.comment}
                                                    onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                                    placeholder="Enter your experience metrics..."
                                                    className="w-full bg-white/[0.03] border border-white/10 text-white px-8 py-6 rounded-3xl focus:ring-2 focus:ring-primary-500/50 outline-none transition-all font-bold tracking-widest text-xs min-h-[150px]"
                                                />
                                            </div>
                                            <Button type="submit" className="w-full h-20 rounded-[1.5rem] font-black uppercase tracking-[0.3em] text-xs shadow-3xl shadow-primary-500/40">Transmit Log</Button>
                                        </form>
                                    </Card>
                                )}

                                <div className="grid grid-cols-1 gap-8">
                                    {mess.reviews && mess.reviews.length > 0 ? (
                                        mess.reviews.map((review) => (
                                            <Card key={review.id} className="p-8 bg-white/5 backdrop-blur-3xl border-white/10 rounded-[2.5rem] group hover:border-primary-500/30 transition-all">
                                                <div className="flex justify-between items-start mb-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center text-white font-black text-xs shadow-2xl">
                                                            {review.user?.name?.[0] || review.user_name?.[0] || 'U'}
                                                        </div>
                                                        <div>
                                                            <h4 className="font-black text-white text-[11px] uppercase tracking-widest">{review.user?.name || review.user_name}</h4>
                                                            <p className="text-[9px] text-white/30 font-black uppercase tracking-[0.2em]">
                                                                {review.createdAt ? new Date(review.createdAt).toLocaleDateString() : review.created_at ? new Date(review.created_at).toLocaleDateString() : 'Unknown Date'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex bg-primary-500/10 px-4 py-2 rounded-full items-center gap-2 border border-primary-500/20">
                                                        <Star size={14} className="text-primary-500 fill-primary-500" />
                                                        <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest">{review.rating}.0</span>
                                                    </div>
                                                </div>
                                                <p className="text-white/60 font-medium leading-relaxed italic pr-12">"{review.comment}"</p>
                                            </Card>
                                        ))
                                    ) : (
                                        <div className="text-center py-24 opacity-20 text-white">
                                            <MessageSquare size={80} strokeWidth={1} className="mx-auto mb-6" />
                                            <p className="font-black uppercase tracking-[0.4em] text-[10px] italic">No signal logs detected in this sector</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'about' && (
                            <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <Card className="p-10 bg-white/5 backdrop-blur-3xl border-white/10 rounded-[3rem] space-y-8">
                                        <h4 className="font-black uppercase tracking-[0.4em] text-primary-500 italic text-[10px]">Shield Protocol</h4>
                                        <div className="space-y-4">
                                            {['Supply Chain Integrity', 'Hygiene Protocol', 'Unlimited Meal Access', 'Student Subsidies', 'Digital Payments'].map(f => (
                                                <div key={f} className="flex items-center gap-4 text-white/50 text-[10px] font-black uppercase tracking-widest italic group">
                                                    <CircleCheck size={18} className="text-primary-500 group-hover:scale-125 transition-transform" />
                                                    {f}
                                                </div>
                                            ))}
                                        </div>
                                    </Card>
                                    <Card className="p-10 bg-white/5 backdrop-blur-3xl border-white/10 rounded-[3rem] space-y-8">
                                        <h4 className="font-black uppercase tracking-[0.4em] text-primary-500 italic text-[10px]">Asset Operator</h4>
                                        <div className="space-y-6">
                                            <div className="flex items-center gap-5 group">
                                                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-primary-500 border border-white/10 group-hover:scale-110 transition-transform shadow-2xl">
                                                    <UserIcon size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-black text-white/20 uppercase tracking-[0.2em] text-[8px] mb-1">Operator Name</p>
                                                    <p className="text-xs font-black text-white uppercase tracking-widest">{mess.ownerName || mess.owner?.name}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-5 group">
                                                <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-primary-500 border border-white/10 group-hover:scale-110 transition-transform shadow-2xl">
                                                    <Phone size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-black text-white/20 uppercase tracking-[0.2em] text-[8px] mb-1">Contact Signal</p>
                                                    <p className="text-xs font-black text-white uppercase tracking-widest">{mess.contact || mess.mobile}</p>
                                                </div>
                                            </div>
                                            <Button
                                                className="w-full h-16 rounded-2xl text-[9px] font-black uppercase tracking-[0.3em] bg-white/5 border border-white/10 hover:bg-white/10 text-white"
                                                onClick={async () => {
                                                    try {
                                                        await api.post('/chats', { ownerId: mess.ownerId });
                                                        navigate('/messages');
                                                    } catch (err) {
                                                        console.error('Chat error:', err);
                                                        alert('Shield error: Failed to initialize encrypted comms');
                                                    }
                                                }}
                                            >
                                                Initialize Comms
                                            </Button>
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Sticky Sidebar */}
                    <div className="lg:col-span-4 lg:sticky lg:top-32 h-fit space-y-10">
                        <Card className="p-12 bg-white/5 backdrop-blur-3xl border-white/10 rounded-[4rem] shadow-3xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />

                            <div className="text-center space-y-4 mb-12">
                                <h3 className="text-2xl font-black italic tracking-tighter uppercase text-white">Subscription</h3>
                                <div className="h-1 w-12 bg-primary-500 mx-auto rounded-full" />
                                <p className="text-white/20 text-[9px] font-black uppercase tracking-[0.3em]">Select Protocol Level</p>
                            </div>

                            <div className="space-y-4 mb-12">
                                {[
                                    { title: 'Elite Access', price: `₹${mess.monthlyPrice || 2500}`, priceValue: mess.monthlyPrice || 2500, type: 'MONTHLY', period: '/month', popular: true, desc: '30 Cycle Supply + Shield' },
                                    { title: 'Sector Sprint', price: `₹${mess.weeklyPrice || (Math.round((mess.monthlyPrice || 2500) / 4))}`, priceValue: mess.weeklyPrice || (Math.round((mess.monthlyPrice || 2500) / 4)), type: 'WEEKLY', period: '/week', desc: '7 Cycle Deployment' },
                                    { title: 'Single Pulse', price: `₹${mess.dailyPrice || 80}`, priceValue: mess.dailyPrice || 80, type: 'DAILY', period: '/day', desc: '1 Cycle Trial Logic' },
                                ].map((plan) => (
                                    <button
                                        key={plan.title}
                                        onClick={() => setSelectedPlan(plan)}
                                        className={`w-full p-6 py-8 rounded-[1.5rem] border-2 text-left transition-all relative group ${selectedPlan?.title === plan.title
                                            ? 'border-primary-500 bg-primary-500/10 shadow-xl shadow-primary-500/20'
                                            : 'border-white/5 bg-white/[0.03] hover:border-white/20'
                                            }`}
                                    >
                                        {plan.popular && (
                                            <div className="absolute -top-3 right-6 bg-primary-500 text-white text-[8px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-lg italic">
                                                Elite Choice
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-black text-white text-[11px] uppercase tracking-widest italic">{plan.title}</span>
                                            <div className="flex items-baseline">
                                                <span className="text-lg font-black text-primary-500 italic">{plan.price}</span>
                                            </div>
                                        </div>
                                        <p className="text-[8px] text-white/30 font-black uppercase tracking-widest">{plan.desc}</p>
                                    </button>
                                ))}
                            </div>

                            <Button
                                onClick={handleSubscribe}
                                disabled={subscribing}
                                className="w-full h-24 rounded-[2rem] text-sm font-black uppercase tracking-[0.4em] shadow-3xl shadow-primary-500/40 hover:scale-[1.05] transition-all bg-primary-500 text-white italic"
                                size="lg"
                            >
                                {subscribing ? 'Transmitting...' : 'Initiate Access'}
                            </Button>

                            <div className="mt-8 flex items-center justify-center gap-3 opacity-30">
                                <CircleCheck size={14} className="text-primary-500" />
                                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white">Razorpay Secure Protocol Active</span>
                            </div>
                        </Card>

                        <Card className="p-10 bg-[#0f172a] border border-white/10 rounded-[3rem] shadow-3xl text-white relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-2 h-full bg-primary-500" />
                            <div className="flex items-center gap-6 mb-8">
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-primary-500 shadow-2xl">
                                    <Clock size={24} />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-white/40 italic">Operational Status</h4>
                                    <p className="text-2xl font-black italic tracking-tighter">SEC <span className="text-primary-500">ACTIVE</span></p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center bg-white/5 p-5 rounded-2xl border border-white/5">
                                    <span className="text-[9px] font-black uppercase tracking-widest text-white/40 italic">Logistics Cycle</span>
                                    <span className="text-[10px] font-black uppercase tracking-widest">Daily 11:00 - 22:00</span>
                                </div>
                                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-center text-white/20 italic pt-2">Zero Latency Meal Supply Guaranteed</p>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default MessDetailsPage;
