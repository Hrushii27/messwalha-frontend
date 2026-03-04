import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { CreditCard, History, User, Settings, Calendar, Utensils, Star, Bell, LogOut } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import type { RootState } from '../../store';
import { logout } from '../../store/slices/authSlice';
import api from '../api/axiosInstance';

const StudentDashboardPage: React.FC = () => {
    const { user } = useAppSelector((state: RootState) => state.auth);
    const [subscriptions, setSubscriptions] = useState<any[]>([]);
    const [recommendedMesses, setRecommendedMesses] = useState<any[]>([]);
    const [recentActivity, setRecentActivity] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const dispatch = useAppDispatch();

    const handleLogout = () => {
        dispatch(logout());
        window.location.href = '/login';
    };

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [subRes, messRes, activityRes] = await Promise.all([
                    api.get('/subscriptions/my-subscriptions'),
                    api.get('/messes?verified=true&minRating=4'),
                    // Assuming an endpoint for activity or just mocking for now
                    Promise.resolve({
                        data: {
                            data: [
                                { id: 1, type: 'PAYMENT', title: 'Payment Successful', desc: '₹2500 for Monthly Plan at Annapurna Mess', time: '2 hours ago' },
                                { id: 2, type: 'SUBSCRIPTION', title: 'Plan Renewed', desc: 'Your subscription for Krishna Mess has been renewed', time: '昨天' }
                            ]
                        }
                    })
                ]);

                setSubscriptions(subRes.data.data);
                setRecommendedMesses(messRes.data.data.slice(0, 3));
                setRecentActivity(activityRes.data.data);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchDashboardData();
    }, [user]);

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
                            <Button variant="outline" size="sm" className="rounded-full bg-white">
                                <Settings size={18} className="mr-2" /> Settings
                            </Button>
                            <Button size="sm" className="rounded-full">
                                <Calendar size={18} className="mr-2" /> Today's Menu
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
                                { icon: <User size={20} />, label: 'Overview', active: true },
                                { icon: <CreditCard size={20} />, label: 'Subscriptions' },
                                { icon: <History size={20} />, label: 'Order History' },
                                { icon: <Settings size={20} />, label: 'Security' },
                                { icon: <LogOut size={20} />, label: 'Logout', onClick: handleLogout },
                            ].map((item) => (
                                <button
                                    key={item.label}
                                    onClick={item.onClick}
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
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <Card className="p-6 bg-gradient-to-br from-primary to-primary-dark text-white border-none">
                                <p className="text-white/70 text-sm font-medium uppercase tracking-wider">Active Plans</p>
                                <p className="text-4xl font-black mt-1">{subscriptions.length}</p>
                            </Card>
                            <Card className="p-6 border-gray-100 dark:border-dark-lighter">
                                <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Plan Progress</p>
                                <p className="text-4xl font-black mt-1">
                                    {subscriptions.length > 0 ? 'Active' : 'None'}
                                </p>
                            </Card>
                            <Card className="p-6 border-gray-100 dark:border-dark-lighter">
                                <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Total Saving</p>
                                <p className="text-4xl font-black mt-1">₹0</p>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                            <div className="xl:col-span-2 space-y-8">
                                <section className="space-y-4">
                                    <h2 className="text-xl font-bold flex items-center">
                                        <CreditCard className="mr-2 text-primary" size={24} />
                                        Your Subscriptions
                                    </h2>
                                    {loading ? (
                                        <div className="space-y-4">
                                            {[1, 2].map(i => <div key={i} className="h-24 bg-gray-50 rounded-2xl animate-pulse" />)}
                                        </div>
                                    ) : subscriptions.length > 0 ? (
                                        <div className="space-y-4">
                                            {subscriptions.map((sub: any) => (
                                                <Card key={sub.id} className="p-6 flex flex-col md:flex-row justify-between items-center gap-6 hover:shadow-lg transition-shadow">
                                                    <div className="flex items-center space-x-4">
                                                        <div className="p-3 bg-primary/10 text-primary rounded-xl">
                                                            <Utensils size={28} />
                                                        </div>
                                                        <div>
                                                            <h4 className="font-bold text-lg">{sub.mess.name}</h4>
                                                            <p className="text-sm text-gray-500">
                                                                Status: <span className="text-green-500 font-bold uppercase text-[10px] tracking-widest">{sub.status}</span>
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center space-x-6">
                                                        <div className="text-right hidden md:block">
                                                            <p className="text-xs text-gray-400 font-bold uppercase tracking-tighter">Plan Type</p>
                                                            <p className="font-black text-primary">{sub.planType}</p>
                                                        </div>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="rounded-full"
                                                            onClick={() => window.location.href = '/subscriptions'}
                                                        >
                                                            Manage
                                                        </Button>
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    ) : (
                                        <Card className="p-12 text-center space-y-4 border-dashed border-2">
                                            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
                                                <Utensils size={32} />
                                            </div>
                                            <h3 className="text-lg font-bold">No active subscriptions</h3>
                                            <p className="text-sm text-gray-400 max-w-xs mx-auto">
                                                You haven't subscribed to any mess yet. Explore our top rated messes to get started!
                                            </p>
                                            <Button size="sm" className="rounded-full">Browse Messes</Button>
                                        </Card>
                                    )}
                                </section>

                                <section className="space-y-4">
                                    <h2 className="text-xl font-bold flex items-center">
                                        <Star className="mr-2 text-yellow-500" size={24} />
                                        Recommended Messes
                                    </h2>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {loading ? (
                                            [1, 2].map(i => <div key={i} className="h-48 bg-gray-50 rounded-2xl animate-pulse" />)
                                        ) : recommendedMesses.map((mess: any) => (
                                            <Card key={mess.id} className="overflow-hidden group">
                                                <div className="h-32 bg-gray-200 relative">
                                                    {mess.images?.[0] ? (
                                                        <img
                                                            src={mess.images[0]}
                                                            alt={mess.name}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                            onError={(e) => {
                                                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300.png?text=Mess+Image';
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center text-gray-400 uppercase font-black text-xs tracking-widest">No Image</div>
                                                    )}
                                                    <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-2 py-1 rounded-lg flex items-center space-x-1 shadow-sm">
                                                        <Star size={12} className="text-yellow-500 fill-yellow-500" />
                                                        <span className="text-xs font-bold">{Number(mess.rating).toFixed(1)}</span>
                                                    </div>
                                                </div>
                                                <div className="p-4 bg-white dark:bg-dark-card">
                                                    <h4 className="font-bold truncate">{mess.name}</h4>
                                                    <p className="text-xs text-gray-400 font-medium mb-3">{mess.cuisine} • {mess.address.split(',')[0]}</p>
                                                    <Button variant="primary" size="sm" className="w-full rounded-lg">View Details</Button>
                                                </div>
                                            </Card>
                                        ))}
                                    </div>
                                </section>
                            </div>

                            <div className="space-y-8">
                                <section className="space-y-4">
                                    <h2 className="text-xl font-bold flex items-center">
                                        <Bell className="mr-2 text-primary" size={24} />
                                        Recent Activity
                                    </h2>
                                    <Card className="p-0 overflow-hidden border-gray-100 dark:border-dark-lighter">
                                        <div className="divide-y divide-gray-100 dark:divide-dark-lighter">
                                            {recentActivity.length > 0 ? (
                                                recentActivity.map((activity: any) => (
                                                    <div key={activity.id} className="p-4 hover:bg-gray-50 dark:hover:bg-dark-lighter transition-colors">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <p className="text-sm font-bold text-gray-900 dark:text-gray-100">{activity.title}</p>
                                                            <span className="text-[10px] font-medium text-gray-400">{activity.time}</span>
                                                        </div>
                                                        <p className="text-xs text-gray-500 leading-relaxed">{activity.desc}</p>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="p-8 text-center text-gray-400">
                                                    <p className="text-xs font-bold uppercase tracking-widest">No recent activity</p>
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                </section>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default StudentDashboardPage;
