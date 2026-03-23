import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { CreditCard, History, User, Settings, Utensils, Star, Bell, Heart } from 'lucide-react';
import { EmptyState } from '../components/common/EmptyState';
import { useAppSelector } from '../../hooks/redux';
import type { RootState } from '../../store';
import api from '../api/axiosInstance';
import type { Mess, Subscription, Activity } from '../types/mess';
import Seo from '../components/common/Seo';
import { getImageUrl } from '../api/axiosInstance';

const DashboardSkeleton = () => (
    <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-bg3/50 rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 space-y-8">
                <div className="h-64 bg-bg3/50 rounded-2xl" />
                <div className="h-64 bg-bg3/50 rounded-2xl" />
            </div>
            <div className="h-96 bg-bg3/50 rounded-2xl" />
        </div>
    </div>
);

const StudentDashboardPage: React.FC = () => {
    const { user } = useAppSelector((state: RootState) => state.auth);
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [recommendedMesses, setRecommendedMesses] = useState<Mess[]>([]);
    const [recentActivity, setRecentActivity] = useState<Activity[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [subRes, messRes, activityRes] = await Promise.all([
                    api.get('/subscriptions/my-subscriptions').catch(() => ({ data: { data: [] } })),
                    api.get('/messes?verified=true&minRating=4'),
                    api.get('/activity/user').catch(() => ({ data: { data: [] } }))
                ]);

                setSubscriptions(subRes.data.data || []);
                setRecommendedMesses(messRes.data.data ? messRes.data.data.slice(0, 3) : []);
                setRecentActivity(activityRes.data.data || []);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchDashboardData();
    }, [user]);

    const getDaysRemaining = (sub: Subscription) => {
        if (!sub.end_date) return '30 Days';
        const diff = new Date(sub.end_date).getTime() - new Date().getTime();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24))) + ' Days';
    };

    return (
        <Layout>
            <Seo
                title="Student Dashboard | FindMess"
                description="Manage your elite mess subscriptions and track your meal history."
                robots="noindex, nofollow"
            />
            <div className="bg-bg/50 py-12 border-b border-white/5 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none" />
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center space-x-6">
                            <div className="w-20 h-20 rounded-2xl bg-primary-500 flex items-center justify-center text-white text-3xl font-black italic shadow-2xl shadow-primary-500/20">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <div>
                                <h1 className="text-4xl font-black italic tracking-tighter text-text-primary uppercase leading-tight">Hello, <br /> <span className="text-primary-500">{user?.name || 'Student'}!</span></h1>
                                <p className="text-text-muted mt-2 font-black uppercase tracking-widest text-[10px] italic">Welcome back 👋</p>
                            </div>
                        </div>
                        <div className="flex space-x-4">
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-2xl border-white/10 bg-bg3/30 text-white px-8 py-5 font-black uppercase tracking-widest text-[10px] italic hover:bg-bg3"
                                onClick={() => window.location.href = '/profile/settings'}
                            >
                                <Settings size={18} className="mr-3 text-primary-500" /> Settings
                            </Button>
                            <Button
                                size="sm"
                                className="rounded-2xl px-8 py-5 font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-primary-500/10 italic"
                                onClick={() => window.location.href = '/menu/today'}
                            >
                                <Utensils size={18} className="mr-3" /> Menu
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                    {/* Sidebar Nav */}
                    <div className="lg:col-span-1">
                        <div className="space-y-4">
                            {[
                                { id: 'overview', icon: <User size={20} />, label: 'Overview', path: '/dashboard', active: true },
                                { id: 'subscriptions', icon: <CreditCard size={20} />, label: 'Subscriptions', path: '/subscriptions' },
                                { id: 'orders', icon: <History size={20} />, label: 'Order History', path: '/orders' },
                                { id: 'security', icon: <Settings size={20} />, label: 'Security', path: '/security' },
                            ].map((item) => (
                                <button
                                    key={item.label}
                                    aria-current={item.active ? 'page' : undefined}
                                    aria-busy={loading}
                                    aria-live="polite"
                                    className={`w-full flex items-center space-x-4 px-6 py-4 rounded-2xl transition-all font-black uppercase tracking-widest text-[10px] ${item.active
                                        ? 'bg-primary-500 text-white shadow-2xl shadow-primary-500/20 italic'
                                        : 'text-text-muted hover:bg-bg3/50 hover:text-white border border-transparent hover:border-white/5'
                                        }`}
                                >
                                    <span className={item.active ? 'text-white' : 'text-primary-500'}>{item.icon}</span>
                                    <span>{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-8">
                        {loading ? <DashboardSkeleton /> : (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <Card className="p-8 bg-primary-500 text-white border-none shadow-2xl shadow-primary-500/20 rounded-[2.5rem] relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -mr-8 -mt-8" />
                                        <p className="text-white/60 text-[10px] font-black uppercase tracking-[0.4em] italic">Active Plans</p>
                                        <p className="text-5xl font-black mt-4 tracking-tighter italic">{subscriptions.length}</p>
                                    </Card>
                                    <Card className="p-8 bg-bg2/40 backdrop-blur-3xl border border-white/10 shadow-3xl rounded-[2.5rem] group hover:border-primary-500/30 transition-all">
                                        <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.4em] italic">Days Left</p>
                                        <p className="text-5xl font-black mt-4 tracking-tighter text-text-primary italic">
                                            {subscriptions.length > 0 ? getDaysRemaining(subscriptions[0]).split(' ')[0] : '0'}<span className="text-xl ml-2 uppercase tracking-wide">Days</span>
                                        </p>
                                    </Card>
                                    <Card className="p-8 bg-bg2/40 backdrop-blur-3xl border border-white/10 shadow-3xl rounded-[2.5rem] group hover:border-green-500/30 transition-all">
                                        <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.4em] italic">Total Savings</p>
                                        <p className="text-5xl font-black mt-4 tracking-tighter text-green-500 italic">₹{subscriptions.length * 1500}</p>
                                    </Card>
                                </div>

                                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                                    <div className="xl:col-span-2 space-y-8">
                                        <section className="space-y-6">
                                            <div className="flex justify-between items-center px-2">
                                                <h2 className="text-3xl font-black tracking-tighter text-text-primary flex items-center italic uppercase">
                                                    <CreditCard className="mr-4 text-primary-500" size={32} />
                                                    My <span className="text-primary-500 ml-3">Subscriptions</span>
                                                </h2>
                                                <Button variant="ghost" size="sm" className="font-black text-text-muted hover:text-primary-500 hover:bg-primary-500/5 uppercase tracking-[0.3em] text-[9px] italic border border-white/5 rounded-xl px-6" onClick={() => window.location.href = '/subscriptions'}>View All</Button>
                                            </div>
                                            {subscriptions.length > 0 ? (
                                                <div className="space-y-6">
                                                    {subscriptions.map((sub: Subscription) => (
                                                        <Card key={sub.id} className="p-8 flex flex-col md:flex-row justify-between items-center gap-8 hover:border-primary-500/30 transition-all border-white/5 shadow-3xl bg-bg2/40 backdrop-blur-3xl rounded-[2.5rem] relative overflow-hidden group">
                                                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                                                            <div className="flex items-center space-x-6 relative z-10">
                                                                <div className="p-5 bg-bg3/50 text-primary-500 rounded-[1.5rem] group-hover:scale-110 transition-transform duration-500 border border-white/5">
                                                                    <Utensils size={28} />
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-black text-xl text-white tracking-tight italic uppercase">{sub.mess?.name || 'Mess Name'}</h4>
                                                                    <div className="flex items-center mt-2 space-x-3">
                                                                        <span className="text-[9px] font-black uppercase tracking-widest text-green-400 bg-green-400/10 px-4 py-1.5 rounded-lg border border-green-400/20 italic">
                                                                            {sub.status || 'ACTIVE'}
                                                                        </span>
                                                                        <span className="text-[9px] font-black uppercase tracking-widest text-text-muted italic">ID: {sub.id.substring(0, 8)}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center space-x-8 relative z-10">
                                                                <div className="text-right hidden md:block">
                                                                    <p className="text-[9px] text-text-muted font-black uppercase tracking-widest italic">Plan Type</p>
                                                                    <p className="font-black text-primary-500 mt-1 uppercase italic tracking-tighter text-lg">{sub.plan_type || 'Monthly'}</p>
                                                                </div>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="rounded-2xl border-white/10 bg-bg3/30 text-white px-10 h-14 font-black uppercase tracking-widest text-[10px] italic hover:bg-bg3"
                                                                    onClick={() => window.location.href = '/subscriptions'}
                                                                >
                                                                    Manage
                                                                </Button>
                                                            </div>
                                                        </Card>
                                                    ))}
                                                </div>
                                            ) : (
                                                <Card className="min-h-[300px] bg-bg2/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] flex items-center justify-center">
                                                    <EmptyState
                                                        icon={Utensils}
                                                        title="No Subscriptions"
                                                        description="You haven't subscribed to any mess yet. Find the best mess near you."
                                                        actionLabel="Browse Messes"
                                                        onAction={() => window.location.href = '/find-mess'}
                                                        className="py-12"
                                                    />
                                                </Card>
                                            )}
                                        </section>

                                        <section className="space-y-6">
                                            <div className="flex justify-between items-center px-2">
                                                <h2 className="text-3xl font-black tracking-tighter text-text-primary flex items-center italic uppercase">
                                                    <Heart className="mr-4 text-red-500" size={32} />
                                                    Favorite <span className="text-primary-500 ml-3">Messes</span>
                                                </h2>
                                                <Button variant="ghost" size="sm" className="font-black text-text-muted hover:text-primary-500 hover:bg-primary-500/5 uppercase tracking-[0.3em] text-[9px] italic border border-white/5 rounded-xl px-6" onClick={() => window.location.href = '/find-mess'}>Manage Likes</Button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                <div className="col-span-full">
                                                    <Card className="min-h-[300px] bg-bg2/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] flex items-center justify-center">
                                                        <EmptyState
                                                            icon={Heart}
                                                            title="No Favorites Yet"
                                                            description="Save your favorite messes for quick access and real-time updates."
                                                            actionLabel="Discover Messes"
                                                            onAction={() => window.location.href = '/find-mess'}
                                                            className="py-12"
                                                        />
                                                    </Card>
                                                </div>
                                            </div>
                                        </section>

                                        <section className="space-y-6">
                                            <div className="flex justify-between items-center px-2">
                                                <h2 className="text-3xl font-black tracking-tighter text-text-primary flex items-center italic uppercase">
                                                    <Star className="mr-4 text-yellow-500" size={32} />
                                                    Recommended <span className="text-primary-500 ml-3">Messes</span>
                                                </h2>
                                                <Button variant="ghost" size="sm" className="font-black text-text-muted hover:text-primary-500 hover:bg-primary-500/5 uppercase tracking-[0.3em] text-[9px] italic border border-white/5 rounded-xl px-6" onClick={() => window.location.href = '/find-mess'}>View All</Button>
                                            </div>
                                            {recommendedMesses.length > 0 ? (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    {recommendedMesses.map((mess: Mess) => (
                                                        <Card key={mess.id} className="overflow-hidden group border-white/5 shadow-3xl bg-bg2/40 backdrop-blur-3xl hover:border-primary-500/30 transition-all duration-500 rounded-[2.5rem]">
                                                            <div className="h-48 bg-bg3/50 relative overflow-hidden">
                                                                {mess.imageUrl || mess.messImage || (mess.images && mess.images[0]) ? (
                                                                    <img
                                                                        src={getImageUrl(mess.imageUrl || mess.messImage || (mess.images && mess.images[0]))}
                                                                        alt={mess.name}
                                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80"
                                                                    />
                                                                ) : (
                                                                    <div className="w-full h-full flex items-center justify-center text-text-muted uppercase font-black text-[10px] tracking-widest italic">Core Module Image</div>
                                                                )}
                                                                <div className="absolute top-6 right-6 bg-black/60 backdrop-blur-xl px-4 py-2 rounded-2xl flex items-center space-x-2 border border-white/10 shadow-2xl">
                                                                    <Star size={16} className="text-yellow-500 fill-yellow-500" />
                                                                    <span className="text-sm font-black text-white italic tracking-tighter">{Number(mess.rating).toFixed(1)}</span>
                                                                </div>
                                                            </div>
                                                            <div className="p-8">
                                                                <h4 className="font-black text-xl text-white tracking-tight truncate uppercase italic">{mess.name}</h4>
                                                                <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mb-6 mt-1 italic">{mess.cuisine || 'Cuisine'} • {mess.address?.split(',')[0] || 'Address'}</p>
                                                                <Button variant="primary" size="sm" className="w-full rounded-[1.25rem] h-14 font-black uppercase tracking-widest text-[10px] italic shadow-2xl shadow-primary-500/20" onClick={() => window.location.href = `/mess/${mess.id}`}>View Details</Button>
                                                            </div>
                                                        </Card>
                                                    ))}
                                                </div>
                                            ) : (
                                                <Card className="min-h-[300px] bg-bg2/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] flex items-center justify-center">
                                                    <EmptyState
                                                        icon={Star}
                                                        title="No Recommendations"
                                                        description="Browse more messes to help us personalize your experience."
                                                        actionLabel="Explore Now"
                                                        onAction={() => window.location.href = '/find-mess'}
                                                        className="py-12"
                                                    />
                                                </Card>
                                            )}
                                        </section>
                                    </div>

                                    <div className="space-y-8">
                                        <section className="space-y-6">
                                            <h2 className="text-3xl font-black tracking-tighter text-text-primary flex items-center italic uppercase px-2">
                                                <Bell className="mr-4 text-primary-500" size={32} />
                                                Recent <span className="text-primary-500 ml-3">Activity</span>
                                            </h2>
                                            <Card className="p-0 overflow-hidden border border-white/10 shadow-3xl bg-bg2/40 backdrop-blur-3xl rounded-[2.5rem]">
                                                <div className="divide-y divide-white/10">
                                                    {recentActivity.length > 0 ? (
                                                        recentActivity.map((activity: Activity) => (
                                                            <div key={activity.id} className="p-8 hover:bg-white/5 transition-all group cursor-pointer">
                                                                <div className="flex justify-between items-start mb-3">
                                                                    <p className="text-sm font-black text-white uppercase tracking-wider group-hover:text-primary-500 transition-colors italic">{activity.title}</p>
                                                                    <span className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] italic">{activity.time}</span>
                                                                </div>
                                                                <p className="text-[11px] text-text-muted font-black uppercase tracking-widest leading-relaxed italic">"{activity.desc}"</p>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="py-20">
                                                            <EmptyState
                                                                icon={Bell}
                                                                title="No activity yet"
                                                                description="Start exploring to see your recent visits here."
                                                                className="border-none shadow-none bg-transparent"
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            </Card>
                                        </section>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default StudentDashboardPage;
