import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { CreditCard, History, User, Settings, Utensils, Star, Bell } from 'lucide-react';
import { useAppSelector } from '../../hooks/redux';
import type { RootState } from '../../store';
import api from '../api/axiosInstance';
import type { Mess, Subscription, Activity } from '../types/mess';

const DashboardSkeleton = () => (
    <div className="space-y-8 animate-pulse">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => <div key={i} className="h-32 bg-gray-100 dark:bg-dark-card rounded-2xl" />)}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            <div className="xl:col-span-2 space-y-8">
                <div className="h-64 bg-gray-100 dark:bg-dark-card rounded-2xl" />
                <div className="h-64 bg-gray-100 dark:bg-dark-card rounded-2xl" />
            </div>
            <div className="h-96 bg-gray-100 dark:bg-dark-card rounded-2xl" />
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
            <div className="bg-primary/5 py-12 border-b border-primary/10">
                <div className="container mx-auto px-4">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center space-x-4">
                            <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-primary/20">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                            <div>
                                <h1 className="text-3xl font-heading font-bold font-outline">Hello, {user?.name || 'Student'}! <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full">v2.1</span></h1>
                                <p className="text-gray-500">Manage your meals and subscriptions here.</p>
                            </div>
                        </div>
                        <div className="flex space-x-3">
                            <Button
                                variant="outline"
                                size="sm"
                                className="rounded-full bg-white text-text-primary"
                                onClick={() => window.location.href = '/profile/settings'}
                            >
                                <Settings size={18} className="mr-2" /> Settings
                            </Button>
                            <Button
                                size="sm"
                                className="rounded-full"
                                onClick={() => window.location.href = '/menu/today'}
                            >
                                <Utensils size={18} className="mr-2" /> Today's Menu
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar Nav */}
                    <div className="lg:col-span-1">
                        <div className="space-y-1">
                            {[
                                { icon: <User size={20} />, label: 'Overview', path: '/dashboard', active: true },
                                { icon: <CreditCard size={20} />, label: 'Subscriptions', path: '/subscriptions' },
                                { icon: <History size={20} />, label: 'Order History', path: '/orders' },
                                { icon: <Settings size={20} />, label: 'Security', path: '/security' },
                            ].map((item) => (
                                <button
                                    key={item.label}
                                    onClick={() => window.location.href = item.path}
                                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all font-medium ${item.active
                                        ? 'bg-primary text-white shadow-md shadow-primary/20'
                                        : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-lighter'
                                        }`}
                                >
                                    {item.icon}
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
                                    <Card className="p-6 bg-gradient-to-br from-primary to-primary-dark text-white border-none shadow-xl shadow-primary/20">
                                        <p className="text-white/70 text-[10px] font-black uppercase tracking-[2px]">Active Plans</p>
                                        <p className="text-5xl font-black mt-2 tracking-tighter">{subscriptions.length}</p>
                                    </Card>
                                    <Card className="p-6 bg-card dark:bg-dark-card border-border-color shadow-xl">
                                        <p className="text-text-muted text-[10px] font-black uppercase tracking-[2px]">Plan Progress</p>
                                        <p className="text-5xl font-black mt-2 tracking-tighter text-text-primary">
                                            {subscriptions.length > 0 ? getDaysRemaining(subscriptions[0]) : '0'}
                                        </p>
                                    </Card>
                                    <Card className="p-6 bg-card dark:bg-dark-card border-border-color shadow-xl">
                                        <p className="text-text-muted text-[10px] font-black uppercase tracking-[2px]">Total saving</p>
                                        <p className="text-5xl font-black mt-2 tracking-tighter text-green-500">₹{subscriptions.length * 1500}</p>
                                    </Card>
                                </div>

                                <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                                    <div className="xl:col-span-2 space-y-8">
                                        <section className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <h2 className="text-2xl font-black tracking-tighter text-text-primary flex items-center">
                                                    <CreditCard className="mr-3 text-primary" size={28} />
                                                    Your <span className="text-primary-500 ml-2">Subscriptions</span>
                                                </h2>
                                                <Button variant="ghost" size="sm" className="font-bold text-primary-500 uppercase tracking-widest text-[10px]" onClick={() => window.location.href = '/subscriptions'}>View All</Button>
                                            </div>
                                            {subscriptions.length > 0 ? (
                                                <div className="space-y-4">
                                                    {subscriptions.map((sub: Subscription) => (
                                                        <Card key={sub.id} className="p-6 flex flex-col md:flex-row justify-between items-center gap-6 hover:shadow-lg transition-shadow border-border-color shadow-xl bg-card dark:bg-dark-card">
                                                            <div className="flex items-center space-x-4">
                                                                <div className="p-4 bg-primary/10 text-primary rounded-2xl">
                                                                    <Utensils size={24} />
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-black text-lg text-text-primary tracking-tight">{sub.mess?.name || 'Mess Name'}</h4>
                                                                    <p className="text-[10px] font-black uppercase tracking-widest text-green-500 bg-green-500/10 px-2 py-1 rounded-full inline-block mt-1">
                                                                        {sub.status || 'ACTIVE'}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <div className="flex items-center space-x-6">
                                                                <div className="text-right hidden md:block">
                                                                    <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">Plan Type</p>
                                                                    <p className="font-black text-primary-500">{sub.plan_type || 'Monthly'}</p>
                                                                </div>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    className="rounded-xl px-6 h-12 font-black uppercase tracking-widest text-[10px]"
                                                                    onClick={() => window.location.href = '/subscriptions'}
                                                                >
                                                                    Manage
                                                                </Button>
                                                            </div>
                                                        </Card>
                                                    ))}
                                                </div>
                                            ) : (
                                                <Card className="p-12 text-center space-y-6 border-dashed border-4 border-border-color/50 bg-bg-section/50 rounded-3xl">
                                                    <div className="w-20 h-20 bg-card rounded-full flex items-center justify-center mx-auto text-text-muted shadow-inner">
                                                        <Utensils size={36} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <h3 className="text-2xl font-black tracking-tighter text-text-primary">No active subscriptions</h3>
                                                        <p className="text-sm text-text-muted max-w-xs mx-auto font-bold leading-relaxed">
                                                            You haven't subscribed to any mess yet. Explore our top rated messes to get started!
                                                        </p>
                                                    </div>
                                                    <Button size="sm" className="rounded-xl px-8 h-12 font-black uppercase tracking-widest text-[10px]" onClick={() => window.location.href = '/find-mess'}>Browse Messes</Button>
                                                </Card>
                                            )}
                                        </section>

                                        <section className="space-y-4">
                                            <div className="flex justify-between items-center">
                                                <h2 className="text-2xl font-black tracking-tighter text-text-primary flex items-center">
                                                    <Star className="mr-3 text-yellow-500" size={28} />
                                                    Recommended <span className="text-primary-500 ml-2">Messes</span>
                                                </h2>
                                                <Button variant="ghost" size="sm" className="font-bold text-primary-500 uppercase tracking-widest text-[10px]" onClick={() => window.location.href = '/find-mess'}>View All</Button>
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {recommendedMesses.map((mess: Mess) => (
                                                    <Card key={mess.id} className="overflow-hidden group border-border-color shadow-xl bg-card dark:bg-dark-card hover:shadow-2xl transition-all duration-500 rounded-3xl">
                                                        <div className="h-40 bg-bg-section relative overflow-hidden">
                                                            {mess.imageUrl ? (
                                                                <img
                                                                    src={mess.imageUrl}
                                                                    alt={mess.name}
                                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                                                />
                                                            ) : (
                                                                <div className="w-full h-full flex items-center justify-center text-text-muted uppercase font-black text-[10px] tracking-widest">Premium Mess</div>
                                                            )}
                                                            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1.5 rounded-xl flex items-center space-x-1 shadow-lg">
                                                                <Star size={14} className="text-yellow-500 fill-yellow-500" />
                                                                <span className="text-xs font-black">{Number(mess.rating).toFixed(1)}</span>
                                                            </div>
                                                        </div>
                                                        <div className="p-6">
                                                            <h4 className="font-black text-lg text-text-primary tracking-tight truncate">{mess.name}</h4>
                                                            <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mb-4">{mess.cuisine || 'Cuisine'} • {mess.address?.split(',')[0] || 'Address'}</p>
                                                            <Button variant="primary" size="sm" className="w-full rounded-xl h-12 font-black uppercase tracking-widest text-[10px]" onClick={() => window.location.href = `/mess/${mess.id}`}>View Details</Button>
                                                        </div>
                                                    </Card>
                                                ))}
                                            </div>
                                        </section>
                                    </div>

                                    <div className="space-y-8">
                                        <section className="space-y-4">
                                            <h2 className="text-2xl font-black tracking-tighter text-text-primary flex items-center">
                                                <Bell className="mr-3 text-primary" size={28} />
                                                Recent <span className="text-primary-500 ml-2">Activity</span>
                                            </h2>
                                            <Card className="p-0 overflow-hidden border-border-color shadow-xl bg-card dark:bg-dark-card rounded-3xl">
                                                <div className="divide-y divide-border-color">
                                                    {recentActivity.length > 0 ? (
                                                        recentActivity.map((activity: Activity) => (
                                                            <div key={activity.id} className="p-6 hover:bg-bg-section transition-colors group">
                                                                <div className="flex justify-between items-start mb-2">
                                                                    <p className="text-sm font-black text-text-primary uppercase tracking-tight group-hover:text-primary-500 transition-colors">{activity.title}</p>
                                                                    <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">{activity.time}</span>
                                                                </div>
                                                                <p className="text-xs text-text-muted font-bold leading-relaxed">{activity.desc}</p>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="p-12 text-center">
                                                            <div className="w-12 h-12 bg-bg-section rounded-full flex items-center justify-center mx-auto mb-4 text-text-muted">
                                                                <Bell size={24} />
                                                            </div>
                                                            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">No recent activity</p>
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
