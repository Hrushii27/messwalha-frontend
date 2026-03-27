// v1.0.1 - Flat Stats & Rating Fix
import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import {
    LayoutDashboard,
    Utensils,
    Users,
    TrendingUp,
    Settings,
    Save,
    Trash2,
    CircleCheck,
    Image as ImageIcon,
    Clock,
    CreditCard,
    Calendar,
    MessageSquare,
    Star,
    ChevronRight
} from 'lucide-react';
import { useAppSelector } from '../../hooks/redux';
import type { RootState } from '../../store';
import api from '../api/axiosInstance';
import { toast } from 'react-hot-toast';
import { BillingHistoryModal } from '../components/dashboard/BillingHistoryModal';
import { useNavigate } from 'react-router-dom';
import type { Mess, Subscription, Menu, MenuItem } from '../types/mess';
import { Input } from '../components/common/Input';
import { EmptyState } from '../components/common/EmptyState';
import { motion, AnimatePresence } from 'framer-motion';

type Tab = 'overview' | 'menu' | 'subscribers' | 'settings' | 'reviews';

const OwnerDashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAppSelector((state: RootState) => state.auth);
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [mess, setMess] = useState<Mess | null>(null);
    const [subscribers, setSubscribers] = useState<Subscription[]>([]);
    const [menus, setMenus] = useState<Menu[]>([]);
    const [revenue, setRevenue] = useState<number>(0);
    const [activeStudentsCount, setActiveStudentsCount] = useState<number>(0);
    const [avgRating, setAvgRating] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [savingMenu, setSavingMenu] = useState(false);
    const [selectedDay, setSelectedDay] = useState('Monday');
    const [isBillingModalOpen, setIsBillingModalOpen] = useState(false);
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [announcement, setAnnouncement] = useState('');
    const [sendingAnnouncement, setSendingAnnouncement] = useState(false);
    const [ownerReviews, setOwnerReviews] = useState<any[]>([]);
    const [respondingTo, setRespondingTo] = useState<string | null>(null);
    const [responseText, setResponseText] = useState('');

    // Form states
    const [messForm, setMessForm] = useState({
        name: '',
        description: '',
        address: '',
        cuisine: '',
        contactNumber: '',
        city: '',
        veg_nonveg: 'Veg',
        college_tags: '',
        images: [] as string[]
    });

    useEffect(() => {
        const fetchOwnerData = async () => {
            try {
                setLoading(true);
                
                // Fetch mess details first
                try {
                    const messRes = await api.get('/messes/my');
                    const messData = messRes.data.data;
                    setMess(messData);
                    setMenus(messData?.menus || []);
                    setAvgRating(messData?.avgRating || 0);
                    
                    if (messData?.id) {
                        const reviewsRes = await api.get(`/reviews/${messData.id}`);
                        setOwnerReviews(reviewsRes.data.data || []);
                        
                        setMessForm({
                            name: messData.name || '',
                            description: messData.description || '',
                            address: messData.address || '',
                            cuisine: messData.cuisine || '',
                            contactNumber: messData.contactNumber || messData.mobile || messData.contact || '',
                            city: messData.city || '',
                            veg_nonveg: messData.vegNonVeg || 'Veg',
                            college_tags: messData.collegeTags || '',
                            images: messData.images || []
                        });
                    }
                } catch (err) {
                    console.error('Error fetching mess profile:', err);
                }

                // Fetch subscribers separately
                try {
                    const subsRes = await api.get('/subscriptions/subscribers');
                    setSubscribers(subsRes.data.data || []);
                    setRevenue(subsRes.data.totalRevenue || 0);
                    setActiveStudentsCount(subsRes.data.data?.length || 0);
                } catch (err) {
                    console.error('Error fetching subscribers:', err);
                }

                // Fetch subscription status separately
                try {
                    const subStatusRes = await api.get('/subscriptions/status');
                    setSubscription(subStatusRes.data.data);
                } catch (err) {
                    console.error('Error fetching subscription status:', err);
                }

            } catch (error) {
                console.error('General error fetching owner data:', error);
                toast.error('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        const pollDashboardStats = async () => {
            try {
                const response = await api.get('/dashboard/owner/stats');
                if (response.data.success) {
                    const stats = response.data.data;
                    console.log("DASHBOARD POLLING [FLATTENED]:", stats);
                    
                    setAvgRating(stats.avgRating);
                    setRevenue(stats.totalRevenue);
                    setActiveStudentsCount(stats.activeStudents);
                    
                    // Also sync back to mess if it exists
                    setMess(prev => prev ? { 
                        ...prev, 
                        avgRating: stats.avgRating, 
                        reviewCount: stats.reviewCount 
                    } : prev);
                    
                    setRevenue(stats.totalRevenue);
                    setActiveStudentsCount(stats.activeStudents);
                }
            } catch (err) {
                console.error('Polling error:', err);
            }
        };

        if (user && user.role === 'OWNER') {
            fetchOwnerData();
            const interval = setInterval(pollDashboardStats, 5000);
            return () => clearInterval(interval);
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);

        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, [user, navigate]);


    const handleUpdateMess = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setUpdating(true);
            const response = await api.put('/messes/my', messForm);
            setMess(response.data.data);
            toast.success('Mess profile updated successfully');
        } catch (error) {
            console.error('Failed to update mess profile:', error);
            toast.error('Failed to update mess profile');
        } finally {
            setUpdating(false);
        }
    };

    const handleSendAnnouncement = async () => {
        if (!mess?.id || !announcement.trim()) {
            toast.error('Please enter an announcement message');
            return;
        }

        try {
            setSendingAnnouncement(true);
            await api.post('/notifications', {
                mess_id: mess.id,
                message: announcement
            });
            toast.success('Announcement sent to all students!');
            setAnnouncement('');
        } catch (error) {
            console.error('Failed to send announcement:', error);
            toast.error('Failed to send announcement');
        } finally {
            setSendingAnnouncement(false);
        }
    };

    const handleMenuSave = async () => {
        try {
            setSavingMenu(true);
            await api.put('/messes/my/menu', { menus });
            toast.success('Weekly menu updated successfully!');
        } catch (error) {
            console.error('Error saving menu:', error);
            toast.error('Failed to save menu.');
        } finally {
            setSavingMenu(false);
        }
    };

    const handleItemChange = (day: string, itemIndex: number, field: string, value: string) => {
        setMenus(prevMenus => {
            const newMenus = [...prevMenus];
            const dayMenuIndex = newMenus.findIndex(m => m.day === day);

            if (dayMenuIndex !== -1) {
                const newItems = [...newMenus[dayMenuIndex].items];
                newItems[itemIndex] = { ...newItems[itemIndex], [field]: value };
                newMenus[dayMenuIndex] = { ...newMenus[dayMenuIndex], items: newItems };
            } else {
                newMenus.push({
                    day,
                    items: [{ name: '', type: 'Veg', [field]: value }] as MenuItem[]
                });
            }
            return newMenus;
        });
    };

    const handleAddItem = (day: string) => {
        setMenus(prevMenus => {
            const newMenus = [...prevMenus];
            const dayMenuIndex = newMenus.findIndex(m => m.day === day);

            if (dayMenuIndex !== -1) {
                newMenus[dayMenuIndex] = {
                    ...newMenus[dayMenuIndex],
                    items: [...newMenus[dayMenuIndex].items, { name: '', type: 'Veg' }]
                };
            } else {
                newMenus.push({
                    day,
                    items: [{ name: '', type: 'Veg' }]
                });
            }
            return newMenus;
        });
    };

    const handleRemoveItem = (day: string, itemIndex: number) => {
        setMenus(prevMenus => {
            const newMenus = [...prevMenus];
            const dayMenuIndex = newMenus.findIndex(m => m.day === day);

            if (dayMenuIndex !== -1) {
                const newItems = newMenus[dayMenuIndex].items.filter((_: MenuItem, idx: number) => idx !== itemIndex);
                newMenus[dayMenuIndex] = { ...newMenus[dayMenuIndex], items: newItems };
            }
            return newMenus;
        });
    };

    const isSubscriptionActive = (subscription as any)?.isActive || subscription?.status === 'trial' || subscription?.status === 'active';

    const renderInactiveBlock = (featureName: string) => (
        <Card className="p-8 md:p-16 text-center space-y-6 flex flex-col items-center justify-center border-orange-500/20 bg-orange-500/5 backdrop-blur-3xl rounded-[2.5rem] md:rounded-[3rem]">
            <div className="p-6 bg-orange-500/20 text-orange-500 rounded-2xl mb-4 shadow-2xl shadow-orange-500/10">
                <CreditCard size={48} />
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-white italic tracking-tighter uppercase">{featureName} Locked</h3>
            <p className="text-text-muted max-w-md mx-auto text-sm md:text-base font-medium italic">
                Your subscription has expired or is inactive. Please renew your plan to keep your mess visible to students.
            </p>
            <Button onClick={() => navigate('/owner/subscribe')} size="lg" className="rounded-2xl px-12 py-6 text-xs font-black uppercase tracking-widest shadow-2xl shadow-primary-500/20">
                Renew Subscription for ₹499/mo
            </Button>
        </Card>
    );

    const renderOverview = () => (
        <div className="space-y-8 md:space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                {[
                    { label: 'Total Revenue', value: `₹${revenue.toLocaleString()}`, trend: '+12%', icon: <TrendingUp className="text-primary-500" /> },
                    { label: 'Active Students', value: activeStudentsCount.toString(), trend: '+5', icon: <Users className="text-indigo-400" /> },
                    { label: 'Avg Rating', value: avgRating ? Number(avgRating).toFixed(1) : '0.0', trend: 'Global', icon: <Star className="text-orange-400" /> },
                ].map((stat, i) => (
                    <Card key={i} className="p-8 bg-bg2/40 backdrop-blur-3xl border-white/10 rounded-[2.5rem] hover:border-primary-500/30 transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 rounded-full blur-3xl -mr-8 -mt-8" />
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-4 bg-bg3/50 rounded-2xl group-hover:scale-110 transition-transform duration-500">{stat.icon}</div>
                            <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${stat.trend.startsWith('+') ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-bg3 text-text-muted'}`}>
                                {stat.trend}
                            </span>
                        </div>
                        <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.2em] italic">{stat.label}</p>
                        <p className="text-3xl md:text-4xl font-black mt-2 text-white italic tracking-tighter">{stat.value}</p>
                    </Card>
                ))}
            </div>

            {!mess && (
                <Card className="p-12 md:p-20 text-center space-y-8 bg-primary-500/5 border-2 border-dashed border-primary-500/20 rounded-[3rem] relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="p-8 bg-primary-500/10 text-primary-500 rounded-3xl mx-auto w-fit shadow-2xl shadow-primary-500/10">
                        <Utensils size={64} />
                    </div>
                    <div className="space-y-4 max-w-2xl mx-auto">
                        <h2 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white uppercase">Add Your Mess</h2>
                        <p className="text-text-muted text-sm md:text-base font-medium italic">
                            You haven't listed your mess yet. Create a listing to start finding students near you.
                        </p>
                    </div>
                    <Button 
                        onClick={() => {
                            if (mess) {
                                navigate('/owner-dashboard/edit-mess');
                            } else {
                                navigate('/owner-dashboard/add-mess');
                            }
                        }}
                        type="button"
                        size="lg"
                        className="rounded-2xl px-16 py-8 font-black uppercase tracking-widest text-sm shadow-3xl shadow-primary-500/30 hover:scale-[1.05] transition-all"
                    >
                        Create Listing
                    </Button>
                </Card>
            )}

            <section className="space-y-6">
                <h2 className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] ml-2 italic">Your Status</h2>
                <Card className="p-8 md:p-10 overflow-hidden border-2 border-primary-500/10 bg-bg2/40 backdrop-blur-3xl rounded-[2.5rem] relative">
                    <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-[100px] -mr-32 -mb-32 pointer-events-none" />
                    <div className="flex flex-col xl:flex-row items-center justify-between gap-10 relative z-10">
                        <div className="flex flex-col sm:flex-row items-center space-y-6 sm:space-y-0 sm:space-x-8 text-center sm:text-left">
                            <div className={`p-6 rounded-3xl shadow-2xl shrink-0 ${subscription?.status === 'trial' ? 'bg-orange-500/10 text-orange-500 shadow-orange-500/10' :
                                subscription?.status === 'active' ? 'bg-primary-500/10 text-primary-500 shadow-primary-500/10' :
                                    'bg-red-500/10 text-red-500 shadow-red-500/10'
                                }`}>
                                <CreditCard size={40} />
                            </div>
                            <div>
                                <div className="flex flex-col sm:flex-row items-center sm:space-x-4 mb-4 space-y-3 sm:space-y-0">
                                    <h3 className="text-2xl md:text-3xl font-black text-white italic tracking-tighter uppercase leading-none">
                                        {subscription?.status === 'trial' ? 'Free Trial' : 'Owner Plan'}
                                    </h3>
                                    <span className={`text-[9px] font-black px-4 py-1.5 rounded-lg uppercase tracking-widest ${subscription?.status === 'trial' ? 'bg-orange-500 text-white' :
                                        (subscription?.status as string) === 'active' ? 'bg-primary-500 text-white' :
                                            'bg-red-500 text-white'
                                        }`}>
                                        {subscription?.status === 'expired' ? 'Plan Expired' : subscription?.status || 'No Active Plan'}
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-5 text-[10px] md:text-[11px] font-black uppercase tracking-widest text-text-secondary">
                                    {subscription?.status === 'trial' && subscription?.trial_end && (
                                        <div className="flex items-center text-orange-400 bg-orange-400/10 px-4 py-2 rounded-xl">
                                            <Clock size={14} className="mr-2" />
                                            <span>
                                                {(() => {
                                                    const end = new Date(subscription.trial_end!);
                                                    const now = new Date();
                                                    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                                                    return `${Math.max(0, diff)} Days`;
                                                })()}
                                            </span>
                                        </div>
                                    )}
                                    {subscription?.subscription_end && (
                                        <div className="flex items-center text-text-muted">
                                            <Calendar size={14} className="mr-2" />
                                            <span>Expire: {new Date(subscription.subscription_end).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                    <div className={`flex items-center ${isSubscriptionActive ? 'text-green-400' : 'text-red-400'}`}>
                                        <CircleCheck size={14} className="mr-2" />
                                        <span>{isSubscriptionActive ? 'Active' : 'Offline'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 w-full xl:w-auto">
                            {subscription?.status !== 'active' && (
                                <Button
                                    className="rounded-2xl px-12 py-6 text-xs font-black uppercase tracking-widest shadow-2xl shadow-primary-500/20 w-full"
                                    onClick={() => navigate('/owner/subscribe')}
                                    isLoading={updating}
                                >
                                    Renew (₹499)
                                </Button>
                            )}
                            <Button
                                variant="outline"
                                className="rounded-2xl px-12 py-6 text-xs font-black uppercase tracking-widest border-white/10 text-white hover:bg-bg3 transition-all w-full italic"
                                onClick={() => setIsBillingModalOpen(true)}
                            >
                                Transaction History
                            </Button>
                        </div>
                    </div>
                </Card>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
                <section className="space-y-6">
                    <h2 className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] ml-2 italic">Announcements</h2>
                    <Card className="p-8 border-2 border-primary-500/10 bg-bg2/40 backdrop-blur-3xl rounded-[2.5rem] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                        <div className="space-y-6 relative z-10">
                            <p className="text-[11px] text-text-muted font-medium italic leading-relaxed">Send a message to all students who have subscribed to your mess.</p>
                            <textarea
                                value={announcement}
                                onChange={(e) => setAnnouncement(e.target.value)}
                                className="w-full bg-bg3/30 p-6 rounded-2xl border border-white/10 outline-none focus:ring-2 focus:ring-primary-500/50 text-white text-sm min-h-[140px] font-black uppercase tracking-widest italic placeholder:text-text-muted/50"
                                placeholder="E.g., Closed for holiday tomorrow..."
                            />
                            <div className="flex justify-end">
                                <Button
                                    onClick={handleSendAnnouncement}
                                    isLoading={sendingAnnouncement}
                                    className="rounded-xl px-10 py-5 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary-500/10"
                                >
                                    Send Message
                                </Button>
                            </div>
                        </div>
                    </Card>
                </section>

                <section className="space-y-6">
                    <h2 className="text-[10px] font-black text-text-muted uppercase tracking-[0.4em] ml-2 italic">Recent Activity</h2>
                    <Card className="p-8 bg-bg2/40 backdrop-blur-3xl border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center min-h-[300px]">
                        <EmptyState
                            icon={Clock}
                            title="No Activity"
                            description="No recent activity found in this cycle."
                            className="bg-transparent border-none shadow-none text-center"
                        />
                    </Card>
                </section>
            </div>
        </div>
    );

    const renderMenuManagement = () => {
        if (!isSubscriptionActive) return renderInactiveBlock('Menu Management');
        return (
            <div className="space-y-10">
                <div className="flex flex-col md:flex-row justify-between items-center gap-8 bg-bg2/40 backdrop-blur-3xl p-8 md:p-10 rounded-[2.5rem] border border-white/10">
                    <div className="space-y-2 text-center md:text-left">
                        <h2 className="text-3xl md:text-4xl font-black text-white italic tracking-tighter uppercase leading-none">Your Menu</h2>
                        <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.3em] italic">Manage your weekly food list</p>
                    </div>
                    <Button
                        onClick={handleMenuSave}
                        isLoading={savingMenu}
                        className="bg-primary-500 hover:bg-primary-400 px-12 py-6 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-primary-500/20 w-full md:w-auto"
                    >
                        Save Changes
                    </Button>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide -mx-2 px-2">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                        <button
                            key={day}
                            onClick={() => setSelectedDay(day)}
                            className={`px-8 py-4 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-500 whitespace-nowrap border-2 shrink-0 ${selectedDay === day
                                ? 'bg-primary-500 text-white border-primary-500 shadow-xl shadow-primary-500/20 italic'
                                : 'bg-bg2/40 text-text-muted border-white/10 hover:border-white/20'
                                }`}
                        >
                            {day}
                        </button>
                    ))}
                </div>

                <div className="space-y-8">
                    {menus.find(m => m.day === selectedDay)?.items.length ? menus.find(m => m.day === selectedDay)?.items.map((item: MenuItem, idx: number) => (
                        <div key={idx} className="bg-bg2/40 backdrop-blur-3xl p-8 md:p-10 rounded-[2.5rem] flex flex-col lg:flex-row gap-6 lg:gap-8 items-end group transition-all border border-white/10 hover:border-white/20 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                            <div className="flex-1 w-full space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-2">Slot {idx + 1}</label>
                                <input
                                    type="text"
                                    value={item.name}
                                    onChange={(e) => handleItemChange(selectedDay, idx, 'name', e.target.value)}
                                    className="w-full h-14 md:h-16 bg-bg3/30 border border-white/10 p-6 rounded-2xl text-white outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-black uppercase tracking-widest text-[10px] italic placeholder:text-text-muted/50"
                                    placeholder="Enter dish name..."
                                />
                            </div>
                            <div className="w-full lg:w-64 space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-2">Food Type</label>
                                <div className="relative">
                                    <select
                                        value={item.type}
                                        onChange={(e) => handleItemChange(selectedDay, idx, 'type', e.target.value)}
                                        className="w-full h-14 md:h-16 bg-bg3/30 border border-white/10 pl-6 pr-12 rounded-2xl text-white outline-none focus:ring-2 focus:ring-primary-500/50 transition-all appearance-none font-black uppercase tracking-widest text-[10px] italic"
                                    >
                                        <option value="Veg" className="bg-bg2">VEG</option>
                                        <option value="Non-Veg" className="bg-bg2">VEG & NON-VEG</option>
                                    </select>
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-navy-500">
                                        <Clock size={16} />
                                    </div>
                                </div>
                            </div>
                            <div className="w-full lg:w-auto">
                                <button
                                    onClick={() => handleRemoveItem(selectedDay, idx)}
                                    className="w-full lg:w-auto p-5 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    )) : (
                        <Card className="min-h-[400px] bg-navy-900/40 backdrop-blur-3xl border-navy-800 rounded-[2.5rem] flex items-center justify-center">
                            <EmptyState
                                icon={Utensils}
                                title="No Data Yet"
                                description={`Add your menu items for ${selectedDay} to show them to students.`}
                                actionLabel="Add Item"
                                onAction={() => handleAddItem(selectedDay)}
                            />
                        </Card>
                    )}

                    <button
                        onClick={() => handleAddItem(selectedDay)}
                        className="w-full border-2 border-dashed border-white/10 py-16 rounded-[2.5rem] text-[10px] font-black uppercase tracking-[0.4em] text-text-muted hover:border-primary-500/50 hover:text-primary-500 hover:bg-primary-500/5 transition-all group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="group-hover:scale-110 transition-transform inline-block relative z-10 font-black italic">+ Add New Item</span>
                    </button>
                </div>
            </div>
        );
    };

    const renderSubscribers = () => {
        if (!isSubscriptionActive) return renderInactiveBlock('Subscribers List');
        return (
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-center bg-bg2/40 backdrop-blur-3xl p-8 md:p-10 rounded-[2.5rem] border border-white/10 gap-8">
                    <div className="space-y-2 text-center md:text-left">
                        <h2 className="text-3xl md:text-4xl font-black text-white italic tracking-tighter uppercase leading-none">Your Students</h2>
                        <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.3em] italic">Active Subscribers</p>
                    </div>
                    <div className="px-10 py-5 bg-bg3/50 rounded-2xl border border-white/10 flex items-center gap-4">
                        <span className="text-primary-500 font-black text-3xl italic tracking-tighter">{activeStudentsCount}</span>
                        <span className="text-text-muted text-[10px] font-black uppercase tracking-widest">Active Students</span>
                    </div>
                </div>

                {subscribers.length > 0 ? (
                    <Card className="bg-bg2/40 backdrop-blur-3xl border-white/10 rounded-[2.5rem] overflow-hidden shadow-3xl">
                        <div className="overflow-x-auto scrollbar-hide">
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="bg-bg3/50">
                                        <th className="px-10 py-6 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Student</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Plan</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Joined Date</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Status</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-text-muted uppercase tracking-[0.2em]">Remove</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {subscribers.map(sub => (
                                        <tr key={sub.id} className="hover:bg-bg3/30 transition-colors group">
                                            <td className="px-10 py-8">
                                                <div className="flex items-center space-x-5">
                                                    <div className="w-14 h-14 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500 font-black italic text-xl shadow-lg group-hover:scale-110 transition-transform duration-500">
                                                        {sub.user?.name.charAt(0) || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-white uppercase tracking-widest text-[11px] mb-1">{sub.user?.name || 'Anonymous'}</p>
                                                        <p className="text-[10px] text-text-muted font-medium italic">{sub.user?.email || 'Encrypted'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="px-4 py-2 bg-bg3/50 rounded-xl border border-white/10 inline-block">
                                                    <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest italic">{sub.plan_type}</p>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8 text-[11px] font-black text-text-muted uppercase tracking-widest italic">
                                                {sub.created_at ? new Date(sub.created_at).toLocaleDateString() : '—'}
                                            </td>
                                            <td className="px-10 py-8">
                                                <span className="text-[9px] font-black px-4 py-1.5 bg-green-500/10 text-green-400 rounded-lg uppercase tracking-widest border border-green-500/20 italic">Active</span>
                                            </td>
                                            <td className="px-10 py-8">
                                                <button className="p-4 bg-bg3/50 text-text-muted rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-all border border-white/10 hover:border-red-500/20">
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                ) : (
                    <Card className="min-h-[400px] bg-bg2/40 backdrop-blur-3xl border-white/10 rounded-[2.5rem] flex items-center justify-center">
                        <EmptyState
                            icon={Users}
                            title="No Students"
                            description="No students have subscribed yet. Complete your profile to attract more students."
                        />
                    </Card>
                )}
            </div>
        );
    };

    const renderReviews = () => {
        if (!isSubscriptionActive) return renderInactiveBlock('Student Reviews');
        return (
            <div className="space-y-10">
                <div className="flex flex-col md:flex-row justify-between items-center bg-bg2/40 backdrop-blur-3xl p-8 md:p-10 rounded-[2.5rem] border border-white/10 gap-8">
                    <div className="space-y-2 text-center md:text-left">
                        <h2 className="text-3xl md:text-4xl font-black text-white italic tracking-tighter uppercase leading-none">Reviews</h2>
                        <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.3em] italic">What students are saying</p>
                    </div>
                    <div className="flex items-center gap-5 px-8 py-5 bg-bg3/50 rounded-2xl border border-white/10">
                        <Star size={24} className="text-orange-400 fill-orange-400" />
                        <span className="text-white font-black text-2xl md:text-3xl italic tracking-tighter">{avgRating ? Number(avgRating).toFixed(1) : '0.0'}</span>
                        <div className="h-8 w-px bg-white/10 mx-2" />
                        <span className="text-text-muted text-[10px] font-black uppercase tracking-widest">Overall</span>
                    </div>
                </div>

                <div className="space-y-8">
                    {ownerReviews.length > 0 ? ownerReviews.map(review => (
                        <Card key={review.id} className="p-8 md:p-12 bg-bg2/40 backdrop-blur-3xl border-white/10 rounded-[2.5rem] space-y-8 relative overflow-hidden group hover:border-white/20 transition-all">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 relative z-10">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-bg3/50 border border-white/10 flex items-center justify-center text-primary-500 font-black italic shadow-xl group-hover:scale-110 transition-transform duration-500 text-2xl">
                                        {review.user_name?.[0] || 'U'}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-white uppercase tracking-widest text-[11px] mb-1 italic">{review.user_name}</h4>
                                        <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em] italic">{new Date(review.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-orange-500/10 px-6 py-3 rounded-2xl border border-orange-500/20">
                                    <Star size={18} className="text-orange-400 fill-orange-400" />
                                    <span className="text-lg font-black text-white italic tracking-tighter">{review.rating}.0</span>
                                </div>
                            </div>
                            <p className="text-text-primary italic leading-relaxed text-xl border-l-4 border-white/10 pl-8 font-black uppercase tracking-wider relative z-10">"{review.comment}"</p>
                            
                            {review.owner_response ? (
                                <div className="p-8 bg-bg3/30 rounded-3xl border-l-4 border-primary-500/40 space-y-4 relative z-10">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em] text-primary-500 italic">
                                        <span>Your Reply</span>
                                        <MessageSquare size={16} />
                                    </div>
                                    <p className="text-text-muted italic font-black uppercase tracking-widest leading-relaxed">"{review.owner_response}"</p>
                                </div>
                            ) : (
                                <div className="pt-4 relative z-10">
                                    {respondingTo === review.id ? (
                                        <div className="space-y-6">
                                            <textarea
                                                value={responseText}
                                                onChange={(e) => setResponseText(e.target.value)}
                                                placeholder="Write your reply..."
                                                className="w-full h-16 lg:h-18 bg-bg3/30 p-8 rounded-3xl border border-white/10 outline-none focus:ring-2 focus:ring-primary-500/50 text-white text-sm min-h-[140px] font-black uppercase tracking-widest italic leading-relaxed placeholder:text-text-muted/50"
                                            />
                                            <div className="flex flex-wrap gap-4">
                                                <Button
                                                    size="lg"
                                                    onClick={async () => {
                                                        try {
                                                            await api.post(`/reviews/${review.id}/respond`, { response: responseText });
                                                            toast.success('Reply Sent');
                                                            const res = await api.get(`/reviews/${mess?.id}`);
                                                            setOwnerReviews(res.data.data);
                                                            setRespondingTo(null);
                                                            setResponseText('');
                                                        } catch (err) {
                                                            toast.error('Failed to send reply');
                                                        }
                                                    }}
                                                    className="rounded-2xl px-12 py-5 font-black uppercase tracking-widest text-[10px] grow md:grow-0"
                                                >
                                                    Send Reply
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="lg"
                                                    onClick={() => setRespondingTo(null)}
                                                    className="rounded-2xl px-12 py-5 font-black uppercase tracking-widest text-[10px] text-text-muted border border-white/10 hover:bg-bg3 grow md:grow-0 italic"
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setRespondingTo(review.id)}
                                            className="rounded-2xl font-black uppercase tracking-widest text-[10px] px-10 py-5 bg-bg3 text-white border border-white/10 hover:border-primary-500 hover:text-primary-500 transition-all flex items-center gap-4 italic"
                                        >
                                            <MessageSquare size={18} className="text-primary-500" />
                                            Reply to Review
                                        </button>
                                    )}
                                </div>
                            )}
                        </Card>
                    )) : (
                        <Card className="min-h-[400px] bg-bg2/40 backdrop-blur-3xl border-white/10 rounded-[2.5rem] flex items-center justify-center">
                            <EmptyState
                                icon={MessageSquare}
                                title="No Reviews"
                                description="Student reviews will appear here."
                            />
                        </Card>
                    )}
                </div>
            </div>
        );
    };

    const renderSettings = () => {
        if (!isSubscriptionActive) return renderInactiveBlock('Profile Settings');
        return (
            <div className="space-y-10">
                <Card className="bg-bg2/40 backdrop-blur-3xl p-8 md:p-12 rounded-[2.5rem] border border-white/10">
                    <div className="space-y-2 mb-10 text-center md:text-left">
                        <h2 className="text-3xl md:text-4xl font-black text-white italic tracking-tighter uppercase leading-none">Settings</h2>
                        <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.3em] italic">Manage your mess details</p>
                    </div>
                    <form onSubmit={handleUpdateMess} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Input
                                label="Mess Name"
                                value={messForm.name}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessForm({ ...messForm, name: e.target.value })}
                                placeholder="Public name of your mess"
                                className="h-14 md:h-16"
                                id="mess-name-input"
                            />
                            <Input
                                label="Cuisine"
                                value={messForm.cuisine}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessForm({ ...messForm, cuisine: e.target.value })}
                                placeholder="E.g. Maharashtrian, South Indian"
                                className="h-14 md:h-16"
                                id="mess-cuisine-input"
                            />
                            <div className="md:col-span-2 space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-2 italic">Description</label>
                                <textarea
                                    rows={4}
                                    value={messForm.description}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessForm({ ...messForm, description: e.target.value })}
                                    className="w-full bg-bg3/30 border border-white/10 p-8 rounded-[2rem] text-white outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-black uppercase tracking-widest leading-relaxed text-sm italic placeholder:text-text-muted/50"
                                    placeholder="Tell students about your food..."
                                />
                            </div>
                            <Input
                                label="Address"
                                value={messForm.address}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessForm({ ...messForm, address: e.target.value })}
                                placeholder="Full address"
                                className="h-14 md:h-16"
                                id="mess-address-input"
                            />
                            <Input
                                label="Phone Number"
                                value={messForm.contactNumber}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessForm({ ...messForm, contactNumber: e.target.value })}
                                placeholder="+91 XXXX"
                                className="h-14 md:h-16"
                                id="mess-contact-input"
                            />
                            <Input
                                label="City"
                                value={messForm.city}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessForm({ ...messForm, city: e.target.value })}
                                placeholder="E.g. Pune"
                                className="h-14 md:h-16"
                                id="mess-city-input"
                            />
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-2 italic">Food Category</label>
                                <div className="relative">
                                    <select
                                        value={messForm.veg_nonveg}
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setMessForm({ ...messForm, veg_nonveg: e.target.value })}
                                        className="w-full h-14 md:h-16 bg-bg3/30 border border-white/10 pl-6 pr-12 rounded-2xl text-white outline-none focus:ring-2 focus:ring-primary-500/50 transition-all appearance-none font-black uppercase tracking-widest text-[10px] italic"
                                    >
                                        <option value="Veg" className="bg-bg2 uppercase">Pure Veg</option>
                                        <option value="Non-Veg" className="bg-bg2 uppercase">Veg & Non-Veg</option>
                                    </select>
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-text-muted">
                                        <ChevronRight size={18} className="rotate-90" />
                                    </div>
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <Input
                                    label="Nearby Colleges"
                                    value={messForm.college_tags}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessForm({ ...messForm, college_tags: e.target.value })}
                                    placeholder="Enter nearby college names..."
                                    className="h-14 md:h-16"
                                    id="mess-tags-input"
                                />
                            </div>
                        </div>

                        <div className="pt-12 border-t border-white/10 flex justify-end">
                            <Button 
                                type="submit" 
                                isLoading={updating} 
                                className="w-full md:w-auto rounded-2xl px-16 py-6 font-black uppercase tracking-[0.2em] italic text-xs shadow-2xl shadow-primary-500/20"
                            >
                                <Save size={18} className="mr-3" /> Save Changes
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        );
    };

    if (loading) {
        return (
            <Layout>
                <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 sm:p-12 lg:p-24 relative z-10 w-full">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500 mb-4"></div>
                    <p className="text-text-muted font-black uppercase tracking-[0.2em] text-xs">Loading Dashboard...</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="min-h-screen bg-bg flex flex-col">
                <div className="bg-bg text-white pt-24 md:pt-36 pb-20 relative overflow-hidden shrink-0">
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[150px] -mr-32 -mt-32 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[120px] -ml-32 -mb-32 pointer-events-none" />
                    
                    <div className="container mx-auto px-6 relative z-10">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                            <div className="space-y-4 text-center md:text-left">
                                <div className="flex items-center justify-center md:justify-start space-x-3 text-primary-500 mb-2">
                                    <div className="h-[2px] w-8 bg-primary-500 rounded-full" />
                                    <span className="text-[10px] font-black uppercase tracking-[0.4em] italic">{mess?.name || 'Inbound'}</span>
                                </div>
                                <h1 className="text-5xl md:text-8xl font-black italic tracking-tighter leading-none">
                                    OWNER <br /> <span className="text-primary-500">DASHBOARD</span>
                                </h1>
                            </div>
                            <div className="flex flex-wrap justify-center gap-4">
                                    <Button 
                                    onClick={() => navigate('/owner-dashboard/edit-mess')}
                                    variant="primary" 
                                    type="button"
                                    size="lg" 
                                    className="rounded-2xl bg-primary-500 text-white hover:bg-primary-400 px-10 py-6 font-black uppercase tracking-widest text-[10px] shadow-3xl shadow-primary-500/20"
                                >
                                    <Utensils size={18} className="mr-3" /> Edit Profile
                                </Button>
                                <Button 
                                    onClick={() => navigate('/owner-dashboard/photos')}
                                    variant="outline" 
                                    type="button"
                                    size="lg" 
                                    className="rounded-2xl border-white/10 bg-bg3/30 backdrop-blur-xl text-white hover:bg-bg3 px-10 py-6 font-black uppercase tracking-widest text-[10px] shadow-3xl"
                                >
                                    <ImageIcon size={18} className="mr-3 text-primary-500" /> Manage Photos
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 md:px-6 -mt-10 pb-32 relative z-20 flex flex-col lg:flex-row gap-10">
                    {/* Navigation Sidebar */}
                    <aside className="w-full lg:w-[320px] shrink-0">
                        <div className="lg:sticky lg:top-32 flex lg:flex-col overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 gap-3 scrollbar-hide">
                            {[
                                { id: 'overview', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
                                { id: 'menu', icon: <Utensils size={20} />, label: 'Menu' },
                                { id: 'subscribers', icon: <Users size={20} />, label: 'Students' },
                                { id: 'reviews', icon: <MessageSquare size={20} />, label: 'Reviews' },
                                { id: 'settings', icon: <Settings size={20} />, label: 'Settings' },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id as Tab)}
                                    className={`flex items-center space-x-5 px-8 py-5 rounded-2xl transition-all duration-500 font-black uppercase tracking-widest text-[10px] relative group shrink-0 lg:w-full border-2 ${activeTab === item.id
                                        ? 'bg-primary-500 text-white border-primary-500 shadow-xl shadow-primary-500/10 italic'
                                        : 'bg-navy-900/50 text-navy-400 border-navy-800/50 hover:border-primary-500/30 hover:text-white backdrop-blur-3xl'
                                        }`}
                                >
                                    <div className="shrink-0">{item.icon}</div>
                                    <span className="whitespace-nowrap">{item.label}</span>
                                    {activeTab === item.id && (
                                        <div className="hidden lg:block absolute right-4 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_white]" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </aside>

                    {/* Main Content Area */}
                    <main className="flex-1 min-w-0">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeTab}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.4 }}
                            >
                                {activeTab === 'overview' && renderOverview()}
                                {activeTab === 'menu' && renderMenuManagement()}
                                {activeTab === 'subscribers' && renderSubscribers()}
                                {activeTab === 'reviews' && renderReviews()}
                                {activeTab === 'settings' && renderSettings()}
                            </motion.div>
                        </AnimatePresence>
                    </main>
                </div>

                <BillingHistoryModal
                    isOpen={isBillingModalOpen}
                    onClose={() => setIsBillingModalOpen(false)}
                />
            </div>
        </Layout>
    );
};

export default OwnerDashboardPage;
