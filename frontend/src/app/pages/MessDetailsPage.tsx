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
    ShieldCheck,
    MapPin,
    AlertCircle
} from 'lucide-react';
import { EmptyState } from '../components/common/EmptyState';
import api, { getImageUrl } from '../api/axiosInstance';
import { useAppSelector } from '../../hooks/redux';
import type { RootState } from '../../store';
import { useFavorites } from '../hooks/useFavorites';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import type { Mess, Menu } from '../types/mess';
import Seo from '../components/common/Seo';
import { LoginPromptModal } from '../components/auth/LoginPromptModal';

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
    const { id, section } = useParams<{ id: string, section?: string }>();
    const navigate = useNavigate();
    const [mess, setMess] = useState<Mess | null>(null);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'menu' | 'reviews' | 'about'>((section as any) || 'menu');
    const [selectedDay, setSelectedDay] = useState(new Date().toLocaleDateString('en-US', { weekday: 'long' }));
    const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
    const [subscribing, setSubscribing] = useState(false);
    const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '', show: false });
    const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
    const { isFavorite, toggleFavorite } = useFavorites();
    const { user } = useAppSelector((state: RootState) => state.auth);

    useEffect(() => {
        const fetchDetails = async () => {
            if (!id) return;
            try {
                const [messRes, notifRes, reviewsRes] = await Promise.all([
                    api.get(`/messes/${id}`),
                    api.get(`/notifications/${id}`),
                    api.get(`/reviews/${id}`)
                ]);
                setMess(messRes.data.data);
                console.log("MESS DATA:", messRes.data.data);
                setNotifications(notifRes.data.data || []);
                setReviews(reviewsRes.data.data || []);

                if (messRes.data.data) {
                    const m = messRes.data.data;
                    const history = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
                    const updated = [
                        { id: m.id, name: m.name, image: getImageUrl(m.displayPhoto || m.imageUrl || m.messImage || (m.images && m.images[0])), rating: m.rating },
                        ...history.filter((item: any) => item.id !== m.id)
                    ].slice(0, 10);
                    localStorage.setItem('recentlyViewed', JSON.stringify(updated));
                }
            } catch (error) {
                console.error('Error fetching details:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [id]);

    useEffect(() => {
        if (section && (section === 'menu' || section === 'reviews' || section === 'about')) {
            setActiveTab(section as any);
        }
    }, [section]);

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

            const rzp = new (window as any).Razorpay(options);
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
        
        if (!user) {
            setIsLoginModalOpen(true);
            return;
        }

        try {
            const { data } = await api.post('/reviews', {
                mess_id: id,
                rating: reviewForm.rating,
                comment: reviewForm.comment
            });
            if (data.success) {
                toast.success('Review submitted successfully!');
                setReviewForm({ rating: 5, comment: '', show: false });
                
                // Re-fetch mess and reviews to update stats instantly
                const [messRes, reviewsRes] = await Promise.all([
                    api.get(`/messes/${id}`),
                    api.get(`/reviews/${id}`)
                ]);
                setMess(messRes.data.data);
                setReviews(reviewsRes.data.data || []);
            }
        } catch (error: any) {
            console.error('Review submission failed', error);
            const msg = error.response?.data?.message || 'Failed to submit review.';
            toast.error(msg);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="container mx-auto px-4 py-24 space-y-8 animate-pulse text-white">
                    <div className="h-64 md:h-96 bg-bg3/30 rounded-[2.5rem]" />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="h-12 w-1/2 bg-bg3/30 rounded-2xl" />
                            <div className="h-6 w-3/4 bg-bg3/30 rounded-2xl" />
                            <div className="h-64 bg-bg3/30 rounded-[2.5rem]" />
                        </div>
                        <div className="h-96 bg-bg3/30 rounded-[2.5rem]" />
                    </div>
                </div>
            </Layout>
        );
    }

    if (!mess) return <Layout><div className="text-center py-20 text-white font-black uppercase text-xl italic pt-40">Mess Not Found</div></Layout>;

    const currentDayMenu = mess.menus?.find((m: Menu) => m.day === selectedDay);
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    return (
        <Layout>
            <Seo 
                title={`${mess.name} | Best Mess Listing`} 
                description={`Check out ${mess.name} on FindMess. Discover their weekly menu, pricing, and student reviews in ${mess.address}.`}
            />
            <div className="container mx-auto px-4 pt-24 md:pt-32 pb-20 max-w-7xl">
                {/* Announcements */}
                {notifications.length > 0 && (
                    <div className="mb-10 space-y-4">
                        {notifications.map((notif) => (
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                key={notif.id}
                                className="bg-primary-500/10 border-2 border-primary-500/40 rounded-[2rem] p-6 md:p-8 flex items-start gap-6 shadow-2xl shadow-primary-500/10 relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4 opacity-20"><AlertCircle size={40} className="text-primary-500" /></div>
                                <div className="p-4 bg-primary-500 rounded-2xl text-white shadow-xl">
                                    <ShieldCheck size={24} />
                                </div>
                                <div className="flex-1">
                                    <h2 className="font-black text-primary-500 uppercase tracking-[0.3em] text-[10px] mb-2 italic">Important Announcement</h2>
                                    <p className="text-white font-bold leading-relaxed text-sm md:text-base italic">
                                        "{notif.message}"
                                    </p>
                                    <p className="text-text-muted text-[9px] font-black uppercase tracking-widest mt-4">
                                        Posted: {new Date(notif.created_at).toLocaleString()}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Photos / Hero Section */}
                <div className="relative h-[400px] md:h-[550px] rounded-[3rem] overflow-hidden mb-12 shadow-2xl group border border-white/5 bg-bg3">
                    {(() => {
                        // ✅ STEP 5 — FRONTEND FIX (LOGIC)
                        const imageUrl = mess.displayPhoto && mess.displayPhoto !== ""
                            ? mess.displayPhoto
                            : "/default-mess.jpg";
                        
                        // ✅ STEP 5 — DEBUG
                        console.log("IMAGE:", mess.displayPhoto);
                        
                        return (
                            <motion.div
                                initial={{ scale: 1.2 }}
                                animate={{ scale: 1 }}
                                transition={{ duration: 1.5, ease: "easeOut" }}
                                className="absolute inset-0 transition-transform duration-[3s] group-hover:scale-110"
                                style={{
                                    backgroundImage: `url(${imageUrl})`,
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                    backgroundRepeat: "no-repeat"
                                }}
                            />
                        );
                    })()}
                    <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent" />

                    <div className="absolute top-6 right-6 flex gap-3">
                        <button
                            onClick={() => {
                                if (navigator.share) {
                                    navigator.share({ title: mess.name, url: window.location.href });
                                } else {
                                    navigator.clipboard.writeText(window.location.href);
                                    toast.success('Link copied to clipboard.');
                                }
                            }}
                            className="p-4 bg-bg3/30 backdrop-blur-3xl rounded-2xl text-white hover:bg-primary-500 transition-all border border-white/10 shadow-2xl group/btn"
                        >
                            <Share2 size={20} className="group-hover/btn:scale-110 transition-transform" />
                        </button>
                        <button
                            onClick={() => id && toggleFavorite(id)}
                            className={`p-4 backdrop-blur-3xl rounded-2xl transition-all border shadow-2xl group/btn ${isFavorite(id || '') ? 'bg-primary-500 border-primary-500 text-white' : 'bg-bg3/30 border-white/10 text-white hover:bg-white/10'}`}
                        >
                            <Heart size={20} fill={isFavorite(id || '') ? 'currentColor' : 'none'} className={`${isFavorite(id || '') ? 'animate-pulse' : 'group-hover/btn:scale-110 transition-transform'}`} />
                        </button>
                    </div>

                    <div className="absolute bottom-8 left-8 right-8 md:bottom-12 md:left-12 md:right-12 space-y-6">
                        <div className="flex flex-wrap items-center gap-3">
                            <span className="bg-primary-500 text-white text-[9px] font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-lg shadow-xl italic">
                                {mess.cuisine || 'Home Kitchen'}
                            </span>
                            <span className="bg-bg2/80 backdrop-blur-xl text-white text-[9px] font-black uppercase tracking-[0.3em] px-4 py-1.5 rounded-lg border border-white/10 flex items-center italic">
                                <ShieldCheck size={14} className="mr-2 text-primary-500" /> Verified Mess
                            </span>
                        </div>
                        <h1 className="text-4xl md:text-8xl font-black tracking-tighter uppercase italic leading-[0.9] text-white">
                            {mess.name}
                        </h1>
                        <div className="flex flex-col md:flex-row md:items-center gap-6 pt-2">
                            <div className="flex items-center gap-3">
                                <div className="flex text-orange-400">
                                    {[1, 2, 3, 4, 5].map((s) => (
                                        <Star key={s} size={18} fill={s <= Math.round(mess.rating || 4) ? 'currentColor' : 'none'} />
                                    ))}
                                </div>
                                <span className="font-black text-2xl text-white italic tracking-tighter">{Number(mess.rating || 4.5).toFixed(1)}</span>
                                <span className="text-text-secondary text-[10px] font-black uppercase tracking-widest ml-1">{mess.reviewCount || 0} Reviews</span>
                            </div>
                            <div className="h-6 w-px bg-white/10 hidden md:block" />
                            <div className="flex items-center gap-3 text-text-secondary font-black uppercase tracking-widest text-[10px] italic">
                                <MapPin size={18} className="text-primary-500" />
                                <span>{mess.address}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    <div className="lg:col-span-8 space-y-12">
                        {/* Responsive Control Switcher (Tabs) */}
                        <div className="flex gap-4 md:gap-10 border-b border-white/5 overflow-x-auto scrollbar-hide">
                            {[
                                { id: 'menu', label: 'Menu', icon: Utensils },
                                { id: 'reviews', label: 'Reviews', icon: MessageSquare },
                                { id: 'about', label: 'About', icon: ShieldCheck },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as 'menu' | 'reviews' | 'about')}
                                    className={`flex items-center gap-3 pb-6 text-[10px] font-black uppercase tracking-[0.3em] transition-all relative shrink-0 italic ${activeTab === tab.id
                                        ? 'text-primary-500'
                                        : 'text-text-muted hover:text-white'
                                        }`}
                                >
                                    <tab.icon size={16} />
                                    {tab.label}
                                    {activeTab === tab.id && (
                                        <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-primary-500 rounded-full shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
                                    )}
                                </button>
                            ))}
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.4 }}
                                className="space-y-12"
                            >
                                {activeTab === 'menu' && (
                                    <>
                                        {mess.description && (
                                            <Card className="p-10 bg-bg2/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
                                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary-500 italic mb-6">About this mess</h3>
                                                <p className="text-text-primary font-medium leading-relaxed italic border-l-4 border-primary-500/30 pl-8 py-2 text-lg">
                                                    "{mess.description}"
                                                </p>
                                            </Card>
                                        )}

                                        {mess.menuImages && mess.menuImages.length > 0 && (
                                            <div className="space-y-6">
                                                <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary-500 italic ml-4">Photos</h3>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {mess.menuImages.map((img, i) => (
                                                        <div key={i} className="rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl aspect-[16/10] group">
                                                            <img
                                                                src={getImageUrl(img)}
                                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s]"
                                                                alt={`Intel ${i}`}
                                                                onError={(e) => {
                                                                    const target = e.target as HTMLImageElement;
                                                                    target.src = 'https://images.unsplash.com/photo-1547523199-467464010617?auto=format&fit=crop&q=80&w=1400';
                                                                }}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        <div className="space-y-8">
                                            <div className="flex gap-3 overflow-x-auto pb-6 scrollbar-hide -mx-2 px-2">
                                                {days.map((day) => (
                                                    <button
                                                        key={day}
                                                        onClick={() => setSelectedDay(day)}
                                                        className={`px-8 py-5 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border-2 shrink-0 ${selectedDay === day
                                                            ? 'bg-primary-500 border-primary-500 text-white shadow-xl shadow-primary-500/20 italic'
                                                            : 'bg-bg2/50 border-white/10 text-text-secondary hover:text-white'
                                                            }`}
                                                    >
                                                        {day}
                                                    </button>
                                                ))}
                                            </div>

                                            <Card className="p-8 md:p-12 bg-bg2/40 backdrop-blur-3xl border border-white/10 rounded-[3rem]">
                                                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mb-12">
                                                    <h3 className="text-2xl font-black italic tracking-tighter uppercase text-white leading-none">
                                                        {selectedDay}'s <span className="text-primary-500">Menu</span>
                                                    </h3>
                                                    <div className="px-6 py-2.5 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-black uppercase tracking-widest italic">
                                                        Verified
                                                    </div>
                                                </div>

                                                {currentDayMenu ? (
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        {currentDayMenu.items.map((item, idx) => (
                                                            <div key={idx} className="bg-bg3/40 p-6 rounded-[2rem] flex items-center gap-6 border border-white/5 hover:border-primary-500/30 transition-all group shadow-xl">
                                                                <div className="w-14 h-14 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500 group-hover:scale-110 transition-transform duration-500 shrink-0">
                                                                    <Utensils size={20} />
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center gap-3 mb-2">
                                                                        <div className={`w-2 h-2 rounded-full shrink-0 ${item.type === 'Non-Veg' ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' : 'bg-green-500 shadow-[0_0_10px_#22c55e]'}`} />
                                                                        <h4 className="font-black text-white text-[13px] uppercase tracking-widest italic truncate">{item.name}</h4>
                                                                    </div>
                                                                    <span className={`text-[9px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-lg border ${item.type === 'Non-Veg' ? 'border-red-500/20 bg-red-500/10 text-red-500' : 'border-green-500/20 bg-green-500/10 text-green-400'}`}>
                                                                        {item.type}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <EmptyState
                                                        icon={Utensils}
                                                        title="No menu available"
                                                        description="No food items have been added for this day yet."
                                                        className="py-16 bg-transparent border-none"
                                                    />
                                                )}
                                            </Card>
                                        </div>
                                    </>
                                )}

                                {activeTab === 'reviews' && (
                                    <div className="space-y-10">
                                        <div className="flex flex-col sm:flex-row justify-between items-center bg-bg2/40 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-white/10 gap-6">
                                            <div className="text-center sm:text-left">
                                                <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter italic text-white leading-none">Student Reviews</h3>
                                                <p className="text-[10px] text-text-secondary font-black uppercase tracking-[0.3em] mt-2 italic">What students are saying</p>
                                            </div>
                                            <Button
                                                variant="outline"
                                                className="rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] py-5 px-10 border-white/10 bg-bg3/50 text-white hover:border-primary-500 italic transition-all w-full sm:w-auto"
                                                onClick={() => {
                                                    if (!user) {
                                                        setIsLoginModalOpen(true);
                                                    } else {
                                                        setReviewForm(prev => ({ ...prev, show: !prev.show }));
                                                    }
                                                }}
                                            >
                                                {reviewForm.show ? 'Cancel' : (user ? 'Write a Review' : 'Sign in to Rate')}
                                            </Button>
                                        </div>

                                        {reviewForm.show && (
                                            <Card className="p-8 md:p-12 border-primary-500/30 bg-primary-500/5 rounded-[3rem] shadow-2xl relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
                                                <form onSubmit={handleReviewSubmit} className="space-y-10 relative z-10">
                                                    <div className="space-y-4">
                                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary ml-4 italic">Your Rating</label>
                                                        <div className="flex flex-wrap gap-4 p-5 bg-bg2/50 rounded-3xl w-fit border border-white/5">
                                                            {[1, 2, 3, 4, 5].map((num) => (
                                                                <button
                                                                    key={num}
                                                                    type="button"
                                                                    onClick={() => setReviewForm({ ...reviewForm, rating: num })}
                                                                    className={`transition-all hover:scale-125 ${reviewForm.rating >= num ? 'text-primary-500' : 'text-text-muted/40'}`}
                                                                >
                                                                    <Star size={32} fill={reviewForm.rating >= num ? 'currentColor' : 'none'} />
                                                                </button>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-4">
                                                        <label className="text-[10px] font-black uppercase tracking-[0.3em] text-text-secondary ml-4 italic">Your Review</label>
                                                        <textarea
                                                            required
                                                            value={reviewForm.comment}
                                                            onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                                                            placeholder="Share your experience about the food..."
                                                            className="w-full bg-bg3/50 border border-white/10 text-white px-8 py-6 rounded-[2rem] focus:ring-2 focus:ring-primary-500/50 outline-none transition-all font-medium text-sm min-h-[160px] leading-relaxed"
                                                        />
                                                    </div>
                                                    <Button type="submit" className="w-full h-20 rounded-3xl font-black uppercase tracking-[0.3em] text-xs shadow-2xl shadow-primary-500/30 bg-primary-500 text-white italic">Submit Review</Button>
                                                </form>
                                            </Card>
                                        )}

                                        <div className="grid grid-cols-1 gap-8">
                                            {reviews.length > 0 ? reviews.map(review => (
                                                <Card key={review.id} className="p-8 md:p-10 bg-bg2/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] group hover:border-primary-500/30 transition-all relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl -mr-16 -mt-16" />
                                                    <div className="flex flex-col sm:flex-row justify-between items-start gap-6 mb-8 relative z-10">
                                                        <div className="flex items-center gap-5">
                                                            <div className="w-14 h-14 rounded-2xl bg-bg3 border border-white/10 flex items-center justify-center text-primary-500 font-black text-xl italic shadow-xl group-hover:scale-110 transition-transform duration-500">
                                                                {review.user_name?.[0] || 'U'}
                                                            </div>
                                                            <div>
                                                                <h4 className="font-black text-white text-[12px] uppercase tracking-widest italic">{review.user_name}</h4>
                                                                <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em] mt-1">
                                                                    {new Date(review.created_at).toLocaleDateString()}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="flex bg-orange-500/10 px-5 py-2.5 rounded-2xl items-center gap-3 border border-orange-500/20">
                                                            <Star size={16} className="text-orange-400 fill-orange-400" />
                                                            <span className="text-sm font-black text-white italic tracking-tighter">{review.rating}.0</span>
                                                        </div>
                                                    </div>
                                                    <p className="text-text-primary font-medium leading-relaxed italic text-lg border-l-4 border-white/10 pl-8 relative z-10">"{review.comment}"</p>
                                                    
                                                    {review.owner_response && (
                                                        <div className="mt-8 p-8 bg-bg3/50 rounded-3xl border-l-4 border-primary-500 space-y-3 relative z-10">
                                                            <h5 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-500 italic">Owner Response</h5>
                                                            <p className="text-sm text-text-secondary italic font-medium leading-relaxed">
                                                                "{review.owner_response}"
                                                            </p>
                                                        </div>
                                                    )}
                                                </Card>
                                            )) : (
                                                <EmptyState
                                                    icon={MessageSquare}
                                                    title="No reviews yet"
                                                    description="Be the first one to share your feedback about this mess!"
                                                    className="py-16 bg-bg2/40 rounded-[3rem] border-white/10 border"
                                                />
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeTab === 'about' && (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <Card className="p-10 bg-bg2/40 backdrop-blur-3xl border border-white/10 rounded-[3rem] space-y-10 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 rounded-full blur-3xl -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-1000" />
                                            <h4 className="font-black uppercase tracking-[0.4em] text-primary-500 italic text-[11px] mb-2">Features</h4>
                                            <div className="space-y-6">
                                                {['Quality Verified', 'Hygiene Standards', 'Unlimited Buffet', 'Student Friendly Price', 'Safe & Secure'].map(f => (
                                                    <div key={f} className="flex items-center gap-5 text-white/70 text-[11px] font-black uppercase tracking-widest italic group/item">
                                                        <CircleCheck size={20} className="text-primary-500 group-hover/item:scale-125 transition-transform" />
                                                        {f}
                                                    </div>
                                                ))}
                                            </div>
                                        </Card>
                                        <Card className="p-10 bg-bg2/40 backdrop-blur-3xl border border-white/10 rounded-[3rem] space-y-10 relative overflow-hidden group">
                                            <div className="absolute top-0 left-0 w-2 h-full bg-primary-500/20" />
                                            <h4 className="font-black uppercase tracking-[0.4em] text-primary-500 italic text-[11px]">Owner Details</h4>
                                            <div className="space-y-8">
                                                <div className="flex items-center gap-6 group/info">
                                                    <div className="w-16 h-16 rounded-2xl bg-bg3 border border-white/10 flex items-center justify-center text-primary-500 shadow-2xl group-hover/info:scale-110 transition-transform">
                                                        <UserIcon size={24} />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-text-muted uppercase tracking-[0.2em] text-[8px] mb-2 italic">Owner Name</p>
                                                        <p className="text-sm font-black text-white uppercase tracking-widest italic">{mess.ownerName || 'Not Available'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-6 group/info">
                                                    <div className="w-16 h-16 rounded-2xl bg-bg3 border border-white/10 flex items-center justify-center text-primary-500 shadow-2xl group-hover/info:scale-110 transition-transform">
                                                        <Phone size={24} />
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-text-muted uppercase tracking-[0.2em] text-[8px] mb-2 italic">Contact Number</p>
                                                        <p className="text-sm font-black text-white uppercase tracking-widest italic">{mess.mobile || mess.contact || 'Not Available'}</p>
                                                    </div>
                                                </div>
                                                <Button
                                                    className="w-full h-18 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] bg-bg3 border border-white/10 hover:border-primary-500 text-white italic"
                                                    onClick={async () => {
                                                        try {
                                                            await api.post('/chats', { ownerId: mess.ownerId });
                                                            navigate('/messages');
                                                        } catch (err) {
                                                            toast.error('Initialization failed.');
                                                        }
                                                    }}
                                                >
                                                    Message Owner
                                                </Button>
                                            </div>
                                        </Card>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Right Column: Sticky Subscription Nexus */}
                    <div className="lg:col-span-4 space-y-10">
                        <Card className="p-8 md:p-12 bg-bg2/40 backdrop-blur-3xl border border-white/10 rounded-[4rem] shadow-3xl lg:sticky lg:top-36 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-1000" />

                            <div className="text-center space-y-4 mb-12">
                                <h3 className="text-3xl font-black italic tracking-tighter uppercase text-white leading-none">Subscription <span className="text-primary-500">Plan</span></h3>
                                <div className="h-1 w-12 bg-primary-500 mx-auto rounded-full shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                                <p className="text-text-secondary text-[10px] font-black uppercase tracking-[0.4em] pt-2">Choose a plan to subscribe</p>
                            </div>

                            <div className="space-y-4 mb-12">
                                {[
                                    { title: 'Monthly Plan', price: `₹${mess.monthlyPrice || 0}`, priceValue: mess.monthlyPrice || 0, type: 'MONTHLY', period: '/month', popular: true, desc: '30 Days Access' },
                                    { title: 'Weekly Plan', price: `₹${mess.weeklyPrice || (Math.round((mess.monthlyPrice || 0) / 4))}`, priceValue: mess.weeklyPrice || (Math.round((mess.monthlyPrice || 0) / 4)), type: 'WEEKLY', period: '/week', desc: '07 Days Access' },
                                    { title: 'Daily Plan', price: `₹${mess.dailyPrice || 0}`, priceValue: mess.dailyPrice || 0, type: 'DAILY', period: '/day', desc: '01 Day Access' },
                                ].map((plan) => (
                                    <button
                                        key={plan.title}
                                        onClick={() => setSelectedPlan(plan)}
                                        className={`w-full p-6 py-8 rounded-[2rem] border-2 text-left transition-all relative group ${selectedPlan?.title === plan.title
                                            ? 'border-primary-500 bg-primary-500/10 shadow-2xl shadow-primary-500/10'
                                            : 'border-white/10 bg-bg3/50 hover:border-primary-500/30'
                                            }`}
                                    >
                                        {plan.popular && (
                                            <div className="absolute -top-3 right-8 bg-primary-500 text-white text-[8px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full shadow-xl shadow-primary-500/20 italic">
                                                Most Popular
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-black text-white text-[12px] uppercase tracking-widest italic">{plan.title}</span>
                                            <div className="flex items-baseline">
                                                <span className="text-xl font-black text-primary-500 italic tracking-tighter">{plan.price}</span>
                                            </div>
                                        </div>
                                        <p className="text-[9px] text-text-secondary font-black uppercase tracking-widest mt-1 opacity-60">
                                            {plan.desc}
                                        </p>
                                    </button>
                                ))}
                            </div>

                            <Button
                                onClick={handleSubscribe}
                                disabled={subscribing}
                                className="w-full h-24 rounded-[2.5rem] text-sm font-black uppercase tracking-[0.4em] shadow-2xl shadow-primary-500/30 hover:scale-[1.03] active:scale-[0.98] transition-all bg-primary-500 text-white italic"
                                size="lg"
                            >
                                {subscribing ? 'PROCESSING...' : 'SUBSCRIBE NOW'}
                            </Button>

                            <div className="mt-8 flex items-center justify-center gap-3 opacity-30">
                                <CircleCheck size={14} className="text-primary-500" />
                                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-white">SECURE PAYMENT BY RAZORPAY</span>
                            </div>
                        </Card>

                        <Card className="p-10 bg-bg2/40 border border-white/10 rounded-[3rem] shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-primary-500/5 rounded-full blur-[80px]" />
                            <div className="flex items-center gap-6 mb-8">
                                <div className="p-5 bg-bg3 rounded-2xl border border-white/10 text-primary-500 shadow-xl group-hover:scale-110 transition-transform">
                                    <Clock size={24} />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-navy-500 italic">Mess Timings</h4>
                                    <p className="text-3xl font-black italic tracking-tighter text-white">LIVE <span className="text-primary-500">NOW</span></p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center bg-bg3/50 p-6 rounded-2xl border border-white/5">
                                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary italic">Working Hours</span>
                                    <span className="text-[11px] font-black uppercase tracking-widest text-white italic">11:30 - 22:30</span>
                                </div>
                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-center text-text-muted italic pt-4">Quality & Hygiene Verified</p>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
            <LoginPromptModal 
                isOpen={isLoginModalOpen} 
                onClose={() => setIsLoginModalOpen(false)} 
            />
        </Layout>
    );
};

export default MessDetailsPage;
