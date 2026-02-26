import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Star, MapPin, Clock, Utensils, Info, CircleCheck, MessageSquare, ChevronRight, Share2, Heart, User as UserIcon, Phone } from 'lucide-react';
import api from '../api/axiosInstance';
import { useAppSelector } from '../../hooks/redux';
import type { RootState } from '../../store';
import { useFavorites } from '../context/FavoritesContext';

const MessDetailsPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [mess, setMess] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState<'menu' | 'reviews' | 'about'>('menu');
    const [selectedDay, setSelectedDay] = useState(new Date().toLocaleDateString('en-US', { weekday: 'long' }));
    const [selectedPlan, setSelectedPlan] = useState<any>(null);
    const [subscribing, setSubscribing] = useState(false);
    const { isFavorite, toggleFavorite } = useFavorites();

    useEffect(() => {
        const fetchDetails = async () => {
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

            // Development Bypass: If in test mode, immediately verify the mock payment
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
                        window.location.href = '/subscriptions';
                    }
                    return;
                } catch (verifyErr) {
                    console.error('Test verification failed', verifyErr);
                    alert('Mock payment failed');
                    return;
                }
            }

            const options = {
                key: (import.meta as any).env.VITE_RAZORPAY_KEY_ID,
                amount: data.amount,
                currency: data.currency,
                name: 'MessWalha',
                description: `Subscription for ${mess.name}`,
                order_id: data.orderId,
                handler: async (response: any) => {
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
                            window.location.href = '/subscriptions';
                        }
                    } catch (err) {
                        console.error('Verification failed', err);
                        alert('Payment verification failed. Please contact support.');
                    }
                },
                prefill: {
                    name: (user as any)?.name,
                    email: (user as any)?.email,
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

    const { user } = useAppSelector((state: RootState) => state.auth);

    if (loading) {
        return (
            <Layout>
                <div className="container mx-auto px-4 py-12 space-y-8 animate-pulse">
                    <div className="h-64 bg-bg-section dark:bg-dark-800 rounded-xl" />
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            <div className="h-10 w-1/2 bg-bg-section dark:bg-dark-800 rounded-md" />
                            <div className="h-4 w-3/4 bg-bg-section dark:bg-dark-800 rounded-md" />
                            <div className="h-48 bg-bg-section dark:bg-dark-800 rounded-xl" />
                        </div>
                        <div className="h-96 bg-bg-section dark:bg-dark-800 rounded-xl" />
                    </div>
                </div>
            </Layout>
        );
    }

    if (!mess) return <Layout><div className="text-center py-20">Mess not found</div></Layout>;

    const currentDayMenu = mess.menus?.find((m: any) => m.day === selectedDay);
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Hero Section */}
                <div className="relative h-[300px] md:h-[450px] rounded-[2.5rem] overflow-hidden mb-12 shadow-2xl group">
                    <img
                        src={mess.images?.[0] || 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&q=80&w=1200'}
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
                                        text: `Check out ${mess.name} on MessWalha! ${window.location.origin}/mess/${mess.id}`,
                                        url: window.location.origin + `/mess/${mess.id}`,
                                    }).catch(console.error);
                                } else {
                                    navigator.clipboard.writeText(window.location.origin + `/mess/${mess.id}`);
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
                                {mess.verified && (
                                    <span className="bg-success-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md shadow-sm flex items-center">
                                        <CircleCheck size={12} className="mr-1" /> Verified
                                    </span>
                                )}
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black">{mess.name}</h1>
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="flex text-rating-color">
                                        {[1, 2, 3, 4, 5].map((s) => (
                                            <Star key={s} size={16} fill={s <= Math.round(mess.rating) ? 'currentColor' : 'none'} />
                                        ))}
                                    </div>
                                    <span className="font-black text-white">{mess.rating.toFixed(1)}</span>
                                    <span className="text-white/60 text-sm font-medium">({mess.reviews?.length || 0} Reviews)</span>
                                </div>
                                <div className="flex items-center gap-2 text-white/80 font-medium">
                                    <MapPin size={18} className="text-primary-500" />
                                    <span className="text-sm">{mess.address}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    {/* Left Column: Content */}
                    <div className="lg:col-span-8 space-y-12">
                        {/* Custom Tabs */}
                        <div className="flex gap-8 border-b border-gray-100 dark:border-dark-lighter">
                            {[
                                { id: 'menu', label: 'Daily Menu', icon: Utensils },
                                { id: 'reviews', label: 'Reviews', icon: MessageSquare },
                                { id: 'about', label: 'Information', icon: Info },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`flex items-center gap-2 pb-6 text-sm font-black uppercase tracking-widest transition-all relative ${activeTab === tab.id
                                        ? 'text-primary-500'
                                        : 'text-text-muted hover:text-text-primary'
                                        }`}
                                >
                                    <tab.icon size={18} />
                                    {tab.label}
                                    {activeTab === tab.id && (
                                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary-500 rounded-full" />
                                    )}
                                </button>
                            ))}
                        </div>

                        {activeTab === 'menu' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                                    {days.map((day) => (
                                        <button
                                            key={day}
                                            onClick={() => setSelectedDay(day)}
                                            className={`px-6 py-3 rounded-md text-xs font-black uppercase tracking-widest transition-all ${selectedDay === day
                                                ? 'bg-primary-500 text-white shadow-md scale-105'
                                                : 'bg-bg-section dark:bg-dark-700 text-text-muted hover:bg-white/10'
                                                }`}
                                        >
                                            {day.substring(0, 3)}
                                        </button>
                                    ))}
                                </div>

                                <Card className="p-8 bg-bg-section dark:bg-dark-800 rounded-xl border border-border-color shadow-sm">
                                    <div className="flex items-center justify-between mb-8">
                                        <h3 className="text-2xl font-black text-text-primary dark:text-text-inverse">{selectedDay}'s Specials</h3>
                                        <div className="flex gap-2">
                                            <span className="bg-success-500/10 text-success-500 px-3 py-1 rounded-md text-[10px] font-black uppercase">Pure Veg Available</span>
                                        </div>
                                    </div>

                                    {currentDayMenu ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {(currentDayMenu.items as any[]).map((item, idx) => (
                                                <div key={idx} className="bg-white dark:bg-dark-900 p-5 rounded-md flex items-center gap-4 shadow-sm border border-border-color hover:shadow-md transition-all group">
                                                    <div className="w-16 h-16 rounded-md bg-bg-section dark:bg-dark-700 flex items-center justify-center text-primary-500 group-hover:scale-110 transition-transform">
                                                        <Utensils size={24} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="font-bold text-text-primary dark:text-text-inverse">{item.name}</h4>
                                                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${item.type === 'Non-Veg' ? 'bg-error-500/10 text-error-500' : 'bg-success-500/10 text-success-500'
                                                            }`}>
                                                            {item.type}
                                                        </span>
                                                    </div>
                                                    <ChevronRight className="text-text-muted" size={18} />
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-gray-200">
                                            <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">No menu uploaded for this day</p>
                                        </div>
                                    )}
                                </Card>
                            </div>
                        )}

                        {activeTab === 'reviews' && (
                            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div className="flex justify-between items-center">
                                    <h3 className="text-2xl font-black">Customer Reviews</h3>
                                    <Button variant="outline" className="rounded-xl font-black uppercase tracking-widest text-xs py-3 px-6">Write a Review</Button>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    {mess.reviews?.length > 0 ? mess.reviews.map((review: any) => (
                                        <Card key={review.id} className="p-6 border-gray-100 shadow-sm hover:shadow-md transition-all rounded-3xl">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-full bg-[#FF6B35]/10 flex items-center justify-center text-[#FF6B35] font-black text-lg">
                                                        {review.user?.name?.[0] || 'U'}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-gray-900">{review.user?.name}</h4>
                                                        <p className="text-xs text-gray-400 font-medium">{new Date(review.createdAt).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                                <div className="flex bg-warning-500/10 px-3 py-1 rounded-full items-center gap-1 border border-warning-500/20">
                                                    <Star size={14} className="text-rating-color fill-rating-color" />
                                                    <span className="text-sm font-black text-warning-500">{review.rating}</span>
                                                </div>
                                            </div>
                                            <p className="text-gray-600 font-medium leading-relaxed">{review.comment}</p>
                                        </Card>
                                    )) : (
                                        <div className="text-center py-20 opacity-50 text-text-muted">
                                            <MessageSquare size={48} className="mx-auto mb-4" />
                                            <p className="font-black uppercase tracking-widest text-sm">No reviews yet. Be the first!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {activeTab === 'about' && (
                            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                <div>
                                    <h3 className="text-2xl font-black mb-4">About this Mess</h3>
                                    <p className="text-gray-600 font-medium leading-loose text-lg">{mess.description}</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <Card className="p-6 bg-bg-section dark:bg-dark-800 border border-border-color rounded-xl shadow-sm">
                                        <h4 className="font-black uppercase tracking-widest text-xs text-primary-500 mb-4">Features & Amenities</h4>
                                        <div className="grid grid-cols-1 gap-3">
                                            {['Fresh Ingredients', 'Unlimited Food', 'Clean Dining Area', 'Purified Water', 'Wifi Available'].map(f => (
                                                <div key={f} className="flex items-center gap-3 text-text-secondary dark:text-text-inverse font-bold">
                                                    <CircleCheck size={18} className="text-success-500" />
                                                    {f}
                                                </div>
                                            ))}
                                        </div>
                                    </Card>
                                    <Card className="p-6 bg-bg-section dark:bg-dark-800 border border-border-color rounded-xl shadow-sm">
                                        <h4 className="font-black uppercase tracking-widest text-xs text-primary-500 mb-4">Owner Info</h4>
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-md bg-white dark:bg-dark-700 flex items-center justify-center text-primary-500 shadow-sm border border-border-color">
                                                    <UserIcon size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-black text-text-muted uppercase tracking-wider text-[10px]">Owner Name</p>
                                                    <p className="text-lg font-black text-text-primary dark:text-text-inverse">{mess.owner?.name}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-md bg-white dark:bg-dark-700 flex items-center justify-center text-primary-500 shadow-sm border border-border-color">
                                                    <Phone size={20} />
                                                </div>
                                                <div>
                                                    <p className="font-black text-text-muted uppercase tracking-wider text-[10px]">Contact Number</p>
                                                    <p className="text-lg font-black text-text-primary dark:text-text-inverse">{mess.contact}</p>
                                                </div>
                                            </div>
                                            <Button
                                                variant="outline"
                                                className="w-full rounded-xl text-xs font-black py-4"
                                                onClick={async () => {
                                                    try {
                                                        await api.post('/chats', { ownerId: mess.ownerId });
                                                        window.location.href = `/messages`;
                                                    } catch (err) {
                                                        alert('Failed to start chat');
                                                    }
                                                }}
                                            >
                                                Contact Owner
                                            </Button>
                                        </div>
                                    </Card>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Sticky Sidebar */}
                    <div className="lg:col-span-4 lg:sticky lg:top-12 h-fit space-y-8">
                        <Card className="p-10 bg-white dark:bg-dark-800 border border-border-color rounded-xl shadow-lg ring-1 ring-border-color/10">
                            <h3 className="text-2xl font-black mb-2 text-center text-text-primary dark:text-text-inverse">Subscription</h3>
                            <p className="text-center text-text-muted text-xs font-black uppercase tracking-widest mb-10">Select your ideal plan</p>

                            <div className="space-y-4 mb-10">
                                {[
                                    { title: 'Weekly Sprint', price: `₹${Math.round((mess.monthlyPrice || 2500) / 4)}`, priceValue: Math.round((mess.monthlyPrice || 2500) / 4), type: 'WEEKLY', period: '/week', desc: '7 days of unlimited meals' },
                                    { title: 'Full Month', price: `₹${mess.monthlyPrice || 2500}`, priceValue: mess.monthlyPrice || 2500, type: 'MONTHLY', period: '/month', popular: true, desc: '30 days + Free trial day' },
                                    { title: 'Trial Day', price: '₹80', priceValue: 80, type: 'DAILY', period: '/day', desc: 'Try once before you commit' },
                                ].map((plan) => (
                                    <button
                                        key={plan.title}
                                        onClick={() => setSelectedPlan(plan)}
                                        className={`w-full p-6 rounded-md border-2 text-left transition-all relative group ${selectedPlan?.title === plan.title
                                            ? 'border-primary-500 bg-primary-500/5 ring-4 ring-primary-500/5 shadow-sm'
                                            : plan.popular && !selectedPlan
                                                ? 'border-border-color bg-white dark:bg-dark-900'
                                                : 'border-bg-section bg-bg-section dark:bg-dark-700 dark:border-dark-600 hover:border-primary-500/30'
                                            }`}
                                    >
                                        {plan.popular && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary-500 text-white text-[9px] font-black uppercase tracking-tighter px-4 py-1.5 rounded-full shadow-md">
                                                Recommended
                                            </div>
                                        )}
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="font-black text-text-primary dark:text-text-inverse">{plan.title}</span>
                                            <div className="flex items-baseline">
                                                <span className="text-xl font-black text-primary-500">{plan.price}</span>
                                                <span className="text-[10px] text-text-muted ml-1 font-bold uppercase">{plan.period}</span>
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-text-muted font-bold uppercase tracking-widest">{plan.desc}</p>
                                    </button>
                                ))}
                            </div>

                            <Button
                                onClick={handleSubscribe}
                                isLoading={subscribing}
                                className="w-full rounded-md py-8 text-xl font-black shadow-lg shadow-primary-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                                size="lg"
                            >
                                Subscribe Now
                            </Button>

                            <div className="mt-8 flex items-center justify-center gap-2 opacity-70">
                                <CircleCheck size={14} className="text-success-500" />
                                <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Fast Checkout with Razorpay</span>
                            </div>
                        </Card>

                        <Card className="p-8 bg-dark-900 text-white border-none rounded-xl shadow-lg">
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-white/10 rounded-md">
                                    <Clock size={24} className="text-primary-500" />
                                </div>
                                <div>
                                    <h4 className="font-black uppercase tracking-widest text-xs text-white/60">Business Hours</h4>
                                    <p className="text-xl font-black">Open Now</p>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center bg-white/5 p-4 rounded-md">
                                    <span className="text-sm font-bold text-white/70">Weekdays</span>
                                    <span className="text-sm font-black">11 AM - 10 PM</span>
                                </div>
                                <div className="flex justify-between items-center bg-white/5 p-4 rounded-md">
                                    <span className="text-sm font-bold text-white/70">Weekends</span>
                                    <span className="text-sm font-black">12 PM - 09 PM</span>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default MessDetailsPage;
