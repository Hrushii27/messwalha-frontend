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
<<<<<<< HEAD
    MessageSquare,
    Star,
    ChevronRight,
    ArrowRight
=======
    AlertTriangle
>>>>>>> 3188c9a67539e26bc98942bbe963b9995a127f3a
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
        contact: '',
        city: '',
        veg_nonveg: 'Veg',
        college_tags: '',
        images: [] as string[]
    });

    useEffect(() => {
        const fetchOwnerData = async () => {
            try {
                setLoading(true);
                const [messRes, subsRes, subStatusRes] = await Promise.all([
                    api.get('/messes/my'),
                    api.get('/subscriptions/subscribers'),
                    api.get('/subscriptions/status')
                ]);

                setMess(messRes.data.data);
                setMenus(messRes.data.data.menus || []);
                setSubscribers(subsRes.data.data);
                setRevenue(subsRes.data.totalRevenue || 0);
                setSubscription(subStatusRes.data.data);
                
                if (messRes.data.data?.id) {
                    const reviewsRes = await api.get(`/reviews/${messRes.data.data.id}`);
                    setOwnerReviews(reviewsRes.data.data || []);
                }
                setMessForm({
                    name: messRes.data.data?.name || '',
                    description: messRes.data.data?.description || '',
                    address: messRes.data.data?.address || '',
                    cuisine: messRes.data.data?.cuisine || '',
                    contact: messRes.data.data?.contact || '',
                    city: messRes.data.data?.city || '',
                    veg_nonveg: messRes.data.data?.veg_nonveg || 'Veg',
                    college_tags: messRes.data.data?.college_tags || '',
                    images: messRes.data.data?.images || []
                });
            } catch (error) {
                console.error('Error fetching owner data:', error);
                toast.error('Failed to load dashboard data');
            } finally {
                setLoading(false);
            }
        };

        if (user && user.role === 'OWNER') fetchOwnerData();

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
                    items: [{ name: '', type: 'Veg', [field]: value }]
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
            <h3 className="text-2xl md:text-3xl font-black text-white italic tracking-tighter uppercase">Subscription Required</h3>
            <p className="text-navy-300 max-w-md mx-auto text-sm md:text-base font-medium">
                Your subscription has expired or is inactive. You must renew your Elite Listing Plan to access {featureName} and continue finding students.
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
                    { label: 'Active Students', value: subscribers.length.toString(), trend: '+5', icon: <Users className="text-indigo-400" /> },
                    { label: 'Avg Rating', value: mess?.rating?.toFixed(1) || '0.0', trend: 'Global', icon: <Star className="text-orange-400" /> },
                ].map((stat, i) => (
                    <Card key={i} className="p-8 bg-navy-900/40 backdrop-blur-3xl border-navy-800 rounded-[2.5rem] hover:border-primary-500/30 transition-all group overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/5 rounded-full blur-3xl -mr-8 -mt-8" />
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-4 bg-navy-800 rounded-2xl group-hover:scale-110 transition-transform duration-500">{stat.icon}</div>
                            <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${stat.trend.startsWith('+') ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-navy-800 text-navy-400'}`}>
                                {stat.trend}
                            </span>
                        </div>
                        <p className="text-navy-400 text-[10px] font-black uppercase tracking-[0.2em]">{stat.label}</p>
                        <p className="text-3xl md:text-4xl font-black mt-2 text-white italic tracking-tighter">{stat.value}</p>
                    </Card>
                ))}
            </div>

            <section className="space-y-6">
                <h2 className="text-[10px] font-black text-navy-400 uppercase tracking-[0.4em] ml-2 italic">Operational Status</h2>
                <Card className="p-8 md:p-10 overflow-hidden border-2 border-primary-500/10 bg-navy-900/40 backdrop-blur-3xl rounded-[2.5rem] relative">
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
                                        {subscription?.status === 'trial' ? 'Free Protocol' : 'Elite Plan'}
                                    </h3>
                                    <span className={`text-[9px] font-black px-4 py-1.5 rounded-lg uppercase tracking-widest ${subscription?.status === 'trial' ? 'bg-orange-500 text-white' :
                                        (subscription?.status as string) === 'active' ? 'bg-primary-500 text-white' :
                                            'bg-red-500 text-white'
                                        }`}>
                                        {subscription?.status === 'expired' ? 'Plan Expired' : subscription?.status || 'No Active Plan'}
                                    </span>
                                </div>
                                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-5 text-[10px] md:text-[11px] font-black uppercase tracking-widest text-navy-300">
                                    {subscription?.status === 'trial' && subscription?.trial_end && (
                                        <div className="flex items-center text-orange-400 bg-orange-400/10 px-4 py-2 rounded-xl">
                                            <Clock size={14} className="mr-2" />
                                            <span>
                                                {(() => {
<<<<<<< HEAD
=======
                                                    if (!subscription?.trial_end) return '90 days remaining';
>>>>>>> 3188c9a67539e26bc98942bbe963b9995a127f3a
                                                    const end = new Date(subscription.trial_end);
                                                    const now = new Date();
                                                    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                                                    return `${Math.max(0, diff)} Cycles`;
                                                })()}
                                            </span>
                                        </div>
                                    )}
                                    {subscription?.subscription_end && (
                                        <div className="flex items-center text-navy-400">
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
                                className="rounded-2xl px-12 py-6 text-xs font-black uppercase tracking-widest border-navy-700 text-white hover:bg-navy-800 transition-all w-full"
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
                    <h2 className="text-[10px] font-black text-navy-400 uppercase tracking-[0.4em] ml-2 italic">Broadcast System</h2>
                    <Card className="p-8 border-2 border-primary-500/10 bg-navy-900/40 backdrop-blur-3xl rounded-[2.5rem] relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                        <div className="space-y-6 relative z-10">
                            <p className="text-[11px] text-navy-300 font-medium italic leading-relaxed">Broadcast a priority transmission to all student units connected to your node.</p>
                            <textarea
                                value={announcement}
                                onChange={(e) => setAnnouncement(e.target.value)}
                                className="w-full bg-navy-800/50 p-6 rounded-2xl border border-navy-700 outline-none focus:ring-2 focus:ring-primary-500/50 text-white text-sm min-h-[140px] font-medium placeholder:text-navy-500"
                                placeholder="E.g., Closed for maintenance today..."
                            />
                            <div className="flex justify-end">
                                <Button
                                    onClick={handleSendAnnouncement}
                                    isLoading={sendingAnnouncement}
                                    className="rounded-xl px-10 py-5 text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary-500/10"
                                >
                                    Deploy Signal
                                </Button>
                            </div>
                        </div>
                    </Card>
                </section>

                <section className="space-y-6">
                    <h2 className="text-[10px] font-black text-navy-400 uppercase tracking-[0.4em] ml-2 italic">Recent Log</h2>
                    <Card className="p-8 bg-navy-900/40 backdrop-blur-3xl border-navy-800 rounded-[2.5rem] flex flex-col items-center justify-center min-h-[300px]">
                        <EmptyState
                            icon={Clock}
                            title="Log Empty"
                            description="No incoming transmissions detected in this cycle."
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
                <div className="flex flex-col md:flex-row justify-between items-center gap-8 bg-navy-900/40 backdrop-blur-3xl p-8 md:p-10 rounded-[2.5rem] border border-navy-800">
                    <div className="space-y-2 text-center md:text-left">
                        <h2 className="text-3xl md:text-4xl font-black text-white italic tracking-tighter uppercase leading-none">Menu Console</h2>
                        <p className="text-navy-400 text-[10px] font-black uppercase tracking-[0.3em] italic">Configuring Weekly Signals</p>
                    </div>
                    <Button
                        onClick={handleMenuSave}
                        isLoading={savingMenu}
                        className="bg-primary-500 hover:bg-primary-400 px-12 py-6 rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-primary-500/20 w-full md:w-auto"
                    >
                        Save Configuration
                    </Button>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide -mx-2 px-2">
                    {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                        <button
                            key={day}
                            onClick={() => setSelectedDay(day)}
                            className={`px-8 py-4 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] transition-all duration-500 whitespace-nowrap border-2 shrink-0 ${selectedDay === day
                                ? 'bg-primary-500 text-white border-primary-500 shadow-xl shadow-primary-500/20 italic'
                                : 'bg-navy-900/40 text-navy-400 border-navy-800 hover:border-navy-700'
                                }`}
                        >
                            {day}
                        </button>
                    ))}
                </div>

                <div className="space-y-8">
                    {menus.find(m => m.day === selectedDay)?.items.length ? menus.find(m => m.day === selectedDay)?.items.map((item: MenuItem, idx: number) => (
                        <div key={idx} className="bg-navy-900/40 backdrop-blur-3xl p-8 md:p-10 rounded-[2.5rem] flex flex-col lg:flex-row gap-6 lg:gap-8 items-end group transition-all border border-navy-800 hover:border-navy-700 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                            <div className="flex-1 w-full space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-navy-400 ml-2">Slot {idx + 1}</label>
                                <input
                                    type="text"
                                    value={item.name}
                                    onChange={(e) => handleItemChange(selectedDay, idx, 'name', e.target.value)}
                                    className="w-full h-14 md:h-16 bg-navy-800/50 border border-navy-700 p-6 rounded-2xl text-white outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-medium placeholder:text-navy-600"
                                    placeholder="Enter dish designation..."
                                />
                            </div>
                            <div className="w-full lg:w-64 space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-navy-400 ml-2">Node Type</label>
                                <div className="relative">
                                    <select
                                        value={item.type}
                                        onChange={(e) => handleItemChange(selectedDay, idx, 'type', e.target.value)}
                                        className="w-full h-14 md:h-16 bg-navy-800/50 border border-navy-700 pl-6 pr-12 rounded-2xl text-white outline-none focus:ring-2 focus:ring-primary-500/50 transition-all appearance-none font-black uppercase tracking-widest text-[10px]"
                                    >
                                        <option value="Veg" className="bg-navy-900">VEG PROTOCOL</option>
                                        <option value="Non-Veg" className="bg-navy-900">NON-VEG SIGNAL</option>
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
                                title="Console Offline"
                                description={`Deploy signals for ${selectedDay} to update student feeds.`}
                                actionLabel="Add Entry"
                                onAction={() => handleAddItem(selectedDay)}
                            />
                        </Card>
                    )}

                    <button
                        onClick={() => handleAddItem(selectedDay)}
                        className="w-full border-2 border-dashed border-navy-800 py-16 rounded-[2.5rem] text-[10px] font-black uppercase tracking-[0.4em] text-navy-500 hover:border-primary-500/50 hover:text-primary-500 hover:bg-primary-500/5 transition-all group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="group-hover:scale-110 transition-transform inline-block relative z-10 font-black italic">+ Initialize New Signal</span>
                    </button>
                </div>
            </div>
        );
    };

    const renderSubscribers = () => {
        if (!isSubscriptionActive) return renderInactiveBlock('Subscribers List');
        return (
            <div className="space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-center bg-navy-900/40 backdrop-blur-3xl p-8 md:p-10 rounded-[2.5rem] border border-navy-800 gap-8">
                    <div className="space-y-2 text-center md:text-left">
                        <h2 className="text-3xl md:text-4xl font-black text-white italic tracking-tighter uppercase leading-none">Student Units</h2>
                        <p className="text-navy-400 text-[10px] font-black uppercase tracking-[0.3em] italic">Active Node Subscribers</p>
                    </div>
                    <div className="px-10 py-5 bg-navy-800 rounded-2xl border border-navy-700 flex items-center gap-4">
                        <span className="text-primary-500 font-black text-3xl italic tracking-tighter">{subscribers.length}</span>
                        <span className="text-navy-400 text-[10px] font-black uppercase tracking-widest">Units Connected</span>
                    </div>
                </div>

                {subscribers.length > 0 ? (
                    <Card className="bg-navy-900/40 backdrop-blur-3xl border-navy-800 rounded-[2.5rem] overflow-hidden shadow-2xl">
                        <div className="overflow-x-auto scrollbar-hide">
                            <table className="w-full text-left border-collapse min-w-[800px]">
                                <thead>
                                    <tr className="bg-navy-800/50">
                                        <th className="px-10 py-6 text-[10px] font-black text-navy-400 uppercase tracking-[0.2em]">Identification</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-navy-400 uppercase tracking-[0.2em]">Node Protocol</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-navy-400 uppercase tracking-[0.2em]">Timestamp</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-navy-400 uppercase tracking-[0.2em]">Status</th>
                                        <th className="px-10 py-6 text-[10px] font-black text-navy-400 uppercase tracking-[0.2em]">Command</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-navy-800/30">
                                    {subscribers.map(sub => (
                                        <tr key={sub.id} className="hover:bg-navy-800/30 transition-colors group">
                                            <td className="px-10 py-8">
                                                <div className="flex items-center space-x-5">
                                                    <div className="w-14 h-14 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500 font-black italic text-xl shadow-lg group-hover:scale-110 transition-transform duration-500">
                                                        {sub.user?.name.charAt(0) || '?'}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-white uppercase tracking-widest text-[11px] mb-1">{sub.user?.name || 'Anonymous'}</p>
                                                        <p className="text-[10px] text-navy-500 font-medium italic">{sub.user?.email || 'Encrypted'}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8">
                                                <div className="px-4 py-2 bg-navy-800 rounded-xl border border-navy-700 inline-block">
                                                    <p className="text-[10px] font-black text-navy-300 uppercase tracking-widest">{sub.plan_type}</p>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8 text-[11px] font-black text-navy-400 uppercase tracking-widest italic">
                                                {sub.created_at ? new Date(sub.created_at).toLocaleDateString() : '—'}
                                            </td>
                                            <td className="px-10 py-8">
                                                <span className="text-[9px] font-black px-4 py-1.5 bg-green-500/10 text-green-400 rounded-lg uppercase tracking-widest border border-green-500/20 italic">Node Active</span>
                                            </td>
                                            <td className="px-10 py-8">
                                                <button className="p-4 bg-navy-800 text-navy-500 rounded-xl hover:bg-red-500/10 hover:text-red-500 transition-all border border-navy-700 hover:border-red-500/20">
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
                    <Card className="min-h-[400px] bg-navy-900/40 backdrop-blur-3xl border-navy-800 rounded-[2.5rem] flex items-center justify-center">
                        <EmptyState
                            icon={Users}
                            title="Zero Units"
                            description="No student signals detected yet. Optimize your node to attract units."
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
                <div className="flex flex-col md:flex-row justify-between items-center bg-navy-900/40 backdrop-blur-3xl p-8 md:p-10 rounded-[2.5rem] border border-navy-800 gap-8">
                    <div className="space-y-2 text-center md:text-left">
                        <h2 className="text-3xl md:text-4xl font-black text-white italic tracking-tighter uppercase leading-none">Feedback Matrix</h2>
                        <p className="text-navy-400 text-[10px] font-black uppercase tracking-[0.3em] italic">Analyzing Unit Transmissions</p>
                    </div>
                    <div className="flex items-center gap-5 px-8 py-5 bg-navy-800 rounded-2xl border border-navy-700">
                        <Star size={24} className="text-orange-400 fill-orange-400" />
                        <span className="text-white font-black text-2xl md:text-3xl italic tracking-tighter">{mess?.rating?.toFixed(1) || '0.0'}</span>
                        <div className="h-8 w-px bg-navy-700 mx-2" />
                        <span className="text-navy-400 text-[10px] font-black uppercase tracking-widest">Overall</span>
                    </div>
                </div>

                <div className="space-y-8">
                    {ownerReviews.length > 0 ? ownerReviews.map(review => (
                        <Card key={review.id} className="p-8 md:p-12 bg-navy-900/40 backdrop-blur-3xl border-navy-800 rounded-[2.5rem] space-y-8 relative overflow-hidden group hover:border-navy-700 transition-all">
                            <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 rounded-full blur-[80px] -mr-20 -mt-20 pointer-events-none" />
                            <div className="flex flex-col sm:flex-row justify-between items-start gap-6 relative z-10">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-2xl bg-navy-800 border border-navy-700 flex items-center justify-center text-primary-500 font-black italic shadow-xl group-hover:scale-110 transition-transform duration-500 text-2xl">
                                        {review.user_name?.[0] || 'U'}
                                    </div>
                                    <div>
                                        <h4 className="font-black text-white uppercase tracking-widest text-[11px] mb-1 italic">{review.user_name}</h4>
                                        <p className="text-[10px] text-navy-500 font-black uppercase tracking-[0.2em]">{new Date(review.created_at).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-orange-500/10 px-6 py-3 rounded-2xl border border-orange-500/20">
                                    <Star size={18} className="text-orange-400 fill-orange-400" />
                                    <span className="text-lg font-black text-white italic tracking-tighter">{review.rating}.0</span>
                                </div>
                            </div>
                            <p className="text-navy-100 italic leading-relaxed text-xl border-l-4 border-navy-800 pl-8 font-medium relative z-10">"{review.comment}"</p>
                            
                            {review.owner_response ? (
                                <div className="p-8 bg-navy-800/50 rounded-3xl border-l-4 border-primary-500/40 space-y-4 relative z-10">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.3em] text-primary-500 italic">
                                        <span>Merchant Transmission</span>
                                        <MessageSquare size={16} />
                                    </div>
                                    <p className="text-navy-300 italic font-medium leading-relaxed">"{review.owner_response}"</p>
                                </div>
                            ) : (
                                <div className="pt-4 relative z-10">
                                    {respondingTo === review.id ? (
                                        <div className="space-y-6">
                                            <textarea
                                                value={responseText}
                                                onChange={(e) => setResponseText(e.target.value)}
                                                placeholder="Compose signal response..."
                                                className="w-full h-16 lg:h-18 bg-navy-800/50 p-8 rounded-3xl border border-navy-700 outline-none focus:ring-2 focus:ring-primary-500/50 text-white text-sm min-h-[140px] font-medium leading-relaxed"
                                            />
                                            <div className="flex flex-wrap gap-4">
                                                <Button
                                                    size="lg"
                                                    onClick={async () => {
                                                        try {
                                                            await api.post(`/reviews/${review.id}/respond`, { response: responseText });
                                                            toast.success('Response Deployed');
                                                            const res = await api.get(`/reviews/${mess?.id}`);
                                                            setOwnerReviews(res.data.data);
                                                            setRespondingTo(null);
                                                            setResponseText('');
                                                        } catch (err) {
                                                            toast.error('Deployment Failed');
                                                        }
                                                    }}
                                                    className="rounded-2xl px-12 py-5 font-black uppercase tracking-widest text-[10px] grow md:grow-0"
                                                >
                                                    Transmit Signal
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="lg"
                                                    onClick={() => setRespondingTo(null)}
                                                    className="rounded-2xl px-12 py-5 font-black uppercase tracking-widest text-[10px] text-navy-400 border border-navy-800 hover:bg-navy-800 grow md:grow-0"
                                                >
                                                    Cancel Transmit
                                                </Button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => setRespondingTo(review.id)}
                                            className="rounded-2xl font-black uppercase tracking-widest text-[10px] px-10 py-5 bg-navy-800 text-white border border-navy-700 hover:border-primary-500 hover:text-primary-500 transition-all flex items-center gap-4 italic"
                                        >
                                            <MessageSquare size={18} className="text-primary-500" />
                                            Respond to Signal
                                        </button>
                                    )}
                                </div>
                            )}
                        </Card>
                    )) : (
                        <Card className="min-h-[400px] bg-navy-900/40 backdrop-blur-3xl border-navy-800 rounded-[2.5rem] flex items-center justify-center">
                            <EmptyState
                                icon={MessageSquare}
                                title="No Signals"
                                description="Inbound student feedback will appear here."
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
                <Card className="bg-navy-900/40 backdrop-blur-3xl p-8 md:p-12 rounded-[2.5rem] border border-navy-800">
                    <div className="space-y-2 mb-10 text-center md:text-left">
                        <h2 className="text-3xl md:text-4xl font-black text-white italic tracking-tighter uppercase leading-none">Node Settings</h2>
                        <p className="text-navy-400 text-[10px] font-black uppercase tracking-[0.3em] italic">Configuring Metadata Relays</p>
                    </div>
                    <form onSubmit={handleUpdateMess} className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <Input
                                label="Operational Name"
                                value={messForm.name}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessForm({ ...messForm, name: e.target.value })}
                                placeholder="Designation"
                                className="h-14 md:h-16"
                            />
                            <Input
                                label="Cuisine Type"
                                value={messForm.cuisine}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessForm({ ...messForm, cuisine: e.target.value })}
                                placeholder="Signals (e.g. Maharashtrian)"
                                className="h-14 md:h-16"
                            />
                            <div className="md:col-span-2 space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-navy-400 ml-2 italic">Broadcast Description</label>
                                <textarea
                                    rows={4}
                                    value={messForm.description}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setMessForm({ ...messForm, description: e.target.value })}
                                    className="w-full bg-navy-800/50 border border-navy-700 p-8 rounded-[2rem] text-white outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-medium placeholder:text-navy-600 leading-relaxed text-sm"
                                    placeholder="Briefly describe your culinary node..."
                                />
                            </div>
                            <Input
                                label="Physical Location"
                                value={messForm.address}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessForm({ ...messForm, address: e.target.value })}
                                placeholder="Coordinates"
                                className="h-14 md:h-16"
                            />
                            <Input
                                label="Signal Frequency (Phone)"
                                value={messForm.contact}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessForm({ ...messForm, contact: e.target.value })}
                                placeholder="+91 XXXX"
                                className="h-14 md:h-16"
                            />
                            <Input
                                label="Metropolitan Sector (City)"
                                value={messForm.city}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessForm({ ...messForm, city: e.target.value })}
                                placeholder="E.g. Pune"
                                className="h-14 md:h-16"
                            />
                            <div className="space-y-4">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-navy-400 ml-2 italic">Dietary Matrix</label>
                                <div className="relative">
                                    <select
                                        value={messForm.veg_nonveg}
                                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setMessForm({ ...messForm, veg_nonveg: e.target.value })}
                                        className="w-full h-14 md:h-16 bg-navy-800/50 border border-navy-700 pl-6 pr-12 rounded-2xl text-white outline-none focus:ring-2 focus:ring-primary-500/50 transition-all appearance-none font-black uppercase tracking-widest text-[10px]"
                                    >
                                        <option value="Veg" className="bg-navy-900 uppercase">Pure Veg</option>
                                        <option value="Non-Veg" className="bg-navy-900 uppercase">Hybrid (Veg + Non-Veg)</option>
                                    </select>
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-navy-500">
                                        <ChevronRight size={18} className="rotate-90" />
                                    </div>
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <Input
                                    label="Target College Nodes"
                                    value={messForm.college_tags}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setMessForm({ ...messForm, college_tags: e.target.value })}
                                    placeholder="Comma separatedInstitution tags..."
                                    className="h-14 md:h-16"
                                />
                            </div>
                        </div>

                        <div className="pt-12 border-t border-navy-800 flex justify-end">
                            <Button 
                                type="submit" 
                                isLoading={updating} 
                                className="w-full md:w-auto rounded-2xl px-16 py-6 font-black uppercase tracking-[0.2em] italic text-xs shadow-2xl shadow-primary-500/20"
                            >
                                <Save size={18} className="mr-3" /> Transmit Signal
                            </Button>
                        </div>
                    </form>
                </Card>
            </div>
        );
    };

    return (
        <Layout>
            <div className="min-h-screen bg-navy-950 flex flex-col">
                <div className="bg-navy-950 text-white pt-24 md:pt-36 pb-20 relative overflow-hidden shrink-0">
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
                                    CONTROL <br /> <span className="text-primary-500">CENTER</span>
                                </h1>
                            </div>
                            <div className="flex flex-wrap justify-center gap-4">
                                <Button 
                                    variant="outline" 
                                    size="lg" 
                                    className="rounded-2xl border-navy-800 bg-navy-900/50 backdrop-blur-xl text-white hover:bg-navy-800 px-10 py-6 font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-black/20"
                                >
                                    <ImageIcon size={18} className="mr-3 text-primary-500" /> Manage Hub Photos
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

<<<<<<< HEAD
                <div className="container mx-auto px-4 md:px-6 -mt-10 pb-32 relative z-20 flex flex-col lg:flex-row gap-10">
                    {/* Navigation Sidebar - Horizontal scroll on mobile */}
                    <aside className="w-full lg:w-[320px] shrink-0">
                        <div className="lg:sticky lg:top-32 flex lg:flex-col overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 gap-3 scrollbar-hide">
=======
            {/* Subscription Top Banner */}
            {!loading && subscription && (() => {
                const status = subscription.status;
                const trialEnd = subscription.trial_end ? new Date(subscription.trial_end) : null;
                const trialEndDate = subscription.trial_end_date ? new Date(subscription.trial_end_date) : trialEnd;
                const now = new Date();
                const daysLeft = trialEndDate ? Math.max(0, Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))) : 0;

                if (status === 'trial') {
                    return (
                        <div className="container mx-auto px-4 mt-4">
                            <div className="bg-orange-500/10 border border-orange-500/30 rounded-2xl p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Clock size={20} className="text-orange-500" />
                                    <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                                        ⏳ Free trial: <strong>{daysLeft} days remaining</strong>
                                    </span>
                                </div>
                                <Button size="sm" className="rounded-xl" onClick={() => navigate('/owner/subscribe')}>
                                    Subscribe ₹499/mo
                                </Button>
                            </div>
                        </div>
                    );
                } else if (status === 'expired') {
                    return (
                        <div className="container mx-auto px-4 mt-4">
                            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <AlertTriangle size={20} className="text-red-500" />
                                    <span className="text-sm font-bold text-red-600 dark:text-red-400">
                                        ⚠️ Trial ended — Subscribe to keep your mess visible
                                    </span>
                                </div>
                                <Button size="sm" className="rounded-xl bg-red-500 hover:bg-red-600" onClick={() => navigate('/owner/subscribe')}>
                                    Subscribe ₹499/mo
                                </Button>
                            </div>
                        </div>
                    );
                } else if (status === 'active') {
                    return (
                        <div className="container mx-auto px-4 mt-4">
                            <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 flex items-center gap-3">
                                <CircleCheck size={20} className="text-green-500" />
                                <span className="text-sm font-bold text-green-600 dark:text-green-400">
                                    ✅ Subscription active
                                </span>
                            </div>
                        </div>
                    );
                }
                return null;
            })()}

            <div className="container mx-auto px-4 -mt-10 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Navigation */}
                    <div className="lg:col-span-1">
                        <Card className="p-2 space-y-1 sticky top-24 shadow-2xl shadow-primary/5 dark:bg-dark-card rounded-2xl">
>>>>>>> 3188c9a67539e26bc98942bbe963b9995a127f3a
                            {[
                                { id: 'overview', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
                                { id: 'menu', icon: <Utensils size={20} />, label: 'Menu Logic' },
                                { id: 'subscribers', icon: <Users size={20} />, label: 'Connected Units' },
                                { id: 'reviews', icon: <MessageSquare size={20} />, label: 'Signal Feedback' },
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
