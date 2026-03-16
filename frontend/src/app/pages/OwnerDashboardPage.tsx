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
    MapPin,
    Phone,
    Image as ImageIcon,
    Clock,
    CreditCard,
    Calendar
} from 'lucide-react';
import { useAppSelector } from '../../hooks/redux';
import type { RootState } from '../../store';
import api from '../api/axiosInstance';
import { toast } from 'react-hot-toast';
import { BillingHistoryModal } from '../components/dashboard/BillingHistoryModal';
import { useNavigate } from 'react-router-dom';
import type { Mess, Subscription, Menu, MenuItem } from '../types/mess';

type Tab = 'overview' | 'menu' | 'subscribers' | 'settings';

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


    // Form states
    const [messForm, setMessForm] = useState({
        name: '',
        description: '',
        address: '',
        cuisine: '',
        contact: '',
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
                setMessForm({
                    name: messRes.data.data?.name || '',
                    description: messRes.data.data?.description || '',
                    address: messRes.data.data?.address || '',
                    cuisine: messRes.data.data?.cuisine || '',
                    contact: messRes.data.data?.contact || '',
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

        // Load Razorpay Script
        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.async = true;
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, [user]);

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
                // If day doesn't exist, create it and add the item
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


    const renderOverview = () => (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Revenue', value: `₹${revenue.toLocaleString()}`, trend: '+12%', icon: <TrendingUp className="text-secondary" /> },
                    { label: 'Active Subscribers', value: subscribers.length.toString(), trend: '+5', icon: <Users className="text-primary" /> },
                    { label: 'Avg Rating', value: mess?.rating?.toFixed(1) || '0.0', trend: 'Global', icon: <Utensils className="text-accent" /> },
                ].map((stat, i) => (
                    <Card key={i} className="p-6">
                        <div className="flex justify-between items-start mb-4">
                            <div className="p-3 bg-gray-50 rounded-xl">{stat.icon}</div>
                            <span className={`text-xs font-bold px-2 py-1 rounded-full ${stat.trend.startsWith('+') ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                                {stat.trend}
                            </span>
                        </div>
                        <p className="text-gray-400 text-sm font-medium">{stat.label}</p>
                        <p className="text-3xl font-black mt-1">{stat.value}</p>
                    </Card>
                ))}
            </div>

            {/* Subscription Status Card */}
            <section className="space-y-4">
                <h2 className="text-xl font-bold">Subscription Status</h2>
                <Card className="p-6 overflow-hidden border-2 border-primary/20 bg-primary/5">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="flex items-center space-x-6">
                            <div className={`p-4 rounded-2xl ${subscription?.status === 'trial' ? 'bg-orange-100 text-orange-600' :
                                subscription?.status === 'active' ? 'bg-green-100 text-green-600' :
                                    'bg-red-100 text-red-600'
                                }`}>
                                <CreditCard size={32} />
                            </div>
                            <div>
                                <div className="flex items-center space-x-3 mb-1">
                                    <h3 className="text-lg font-black uppercase tracking-tight">
                                        {subscription?.status === 'trial' ? '90-Day Free Trial' : 'Elite Listing Plan'}
                                    </h3>
                                    <span className={`text-[10px] font-black px-2 py-1 rounded-lg uppercase ${subscription?.status === 'trial' ? 'bg-orange-500 text-white' :
                                        subscription?.status === 'active' ? 'bg-green-500 text-white' :
                                            'bg-red-500 text-white'
                                        }`}>
                                        {subscription?.status || 'No Plan'}
                                    </span>
                                </div>
                                <div className="flex items-center space-x-4 text-sm font-bold text-gray-500">
                                    {subscription?.status === 'trial' && (
                                        <div className="flex items-center text-orange-600">
                                            <Clock size={16} className="mr-1" />
                                            <span>
                                                {(() => {
                                                    if (!subscription?.trial_end) return '90 days remaining';
                                                    const end = new Date(subscription.trial_end);
                                                    const now = new Date();
                                                    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                                                    return `${Math.max(0, diff)} days remaining`;
                                                })()}
                                            </span>
                                        </div>
                                    )}
                                    {subscription?.subscription_end && (
                                        <div className="flex items-center">
                                            <Calendar size={16} className="mr-1" />
                                            <span>Next billing: {new Date(subscription.subscription_end).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                    <div className="flex items-center">
                                        <CircleCheck size={16} className="mr-1 text-green-500" />
                                        <span>Status: {subscription?.status?.toUpperCase() || 'INACTIVE'}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex space-x-3">
                            {subscription?.status !== 'active' && (
                                <>
                                    <Button
                                        className="rounded-xl px-8 shadow-lg shadow-primary/20"
                                        onClick={() => navigate('/owner/subscribe')}
                                        isLoading={updating}
                                    >
                                        Subscribe (₹499/mo)
                                    </Button>
                                </>
                            )}
                            <Button
                                variant="outline"
                                className="rounded-xl border-gray-200"
                                onClick={() => setIsBillingModalOpen(true)}
                            >
                                Billing History
                            </Button>
                        </div>
                    </div>
                </Card>
            </section>

            <section className="space-y-4">
                <h2 className="text-xl font-bold">Quick Activity</h2>
                <Card className="p-0 overflow-hidden">
                    <div className="divide-y divide-gray-100">
                        {subscribers.slice(0, 5).map(sub => (
                            <div key={sub.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                                        {sub.user?.name.charAt(0) || '?'}
                                    </div>
                                    <div>
                                        <p className="font-bold text-sm">{sub.user?.name || 'Unknown Student'}</p>
                                        <p className="text-xs text-gray-400">{sub.plan_type} Plan • {sub.created_at ? new Date(sub.created_at).toLocaleDateString() : 'N/A'}</p>
                                    </div>
                                </div>
                                <span className="text-[10px] font-black uppercase text-green-500 bg-green-50 px-2 py-1 rounded-lg">Active</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </section>
        </div>
    );

    const renderMenuManagement = () => (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-10">
                <div className="space-y-1">
                    <h2 className="text-3xl font-black text-dark-900">Menu Schedule</h2>
                    <p className="text-gray-500 text-sm font-medium uppercase tracking-widest">Manage your weekly specials</p>
                </div>
                <Button
                    onClick={handleMenuSave}
                    isLoading={savingMenu}
                    className="bg-primary hover:bg-primary/90 px-10 py-6 rounded-2xl font-black uppercase tracking-widest"
                >
                    Save Weekly Menu
                </Button>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-6 mb-10 scrollbar-hide">
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
                    <button
                        key={day}
                        onClick={() => setSelectedDay(day)}
                        className={`px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 ${selectedDay === day
                            ? 'bg-primary text-white border-primary shadow-[0_0_30px_rgba(255,69,0,0.2)]'
                            : 'bg-gray-50 text-gray-500 border-transparent hover:bg-gray-100 hover:text-gray-700'
                            }`}
                    >
                        {day}
                    </button>
                ))}
            </div>

            <div className="space-y-6">
                {menus.find(m => m.day === selectedDay)?.items.map((item: MenuItem, idx: number) => (
                    <div key={idx} className="bg-white p-8 rounded-3xl flex flex-col md:flex-row gap-6 items-center group transition-all hover:bg-gray-50 relative border border-gray-100">
                        <div className="flex-1 w-full space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Item Name</label>
                            <input
                                type="text"
                                value={item.name}
                                onChange={(e) => handleItemChange(selectedDay, idx, 'name', e.target.value)}
                                className="w-full bg-gray-50 border border-gray-100 p-6 rounded-2xl text-dark-900 outline-none focus:ring-2 focus:ring-primary transition-all"
                                placeholder="Enter item name..."
                            />
                        </div>
                        <div className="w-full md:w-64 space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400">Category</label>
                            <select
                                value={item.type}
                                onChange={(e) => handleItemChange(selectedDay, idx, 'type', e.target.value)}
                                className="w-full bg-gray-50 border border-gray-100 p-6 rounded-2xl text-dark-900 outline-none focus:ring-2 focus:ring-primary transition-all appearance-none"
                            >
                                <option value="Veg" className="bg-white">Veg</option>
                                <option value="Non-Veg" className="bg-white">Non-Veg</option>
                            </select>
                        </div>
                        <div className="pt-6 md:pt-8 w-full md:w-auto">
                            <button
                                onClick={() => handleRemoveItem(selectedDay, idx)}
                                className="w-full md:w-auto p-6 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-500 hover:text-white transition-all border border-red-500/20"
                            >
                                Remove
                            </button>
                        </div>
                    </div>
                ))}

                <button
                    onClick={() => handleAddItem(selectedDay)}
                    className="w-full border-2 border-dashed border-gray-200 p-10 rounded-3xl text-sm font-black uppercase tracking-widest text-gray-400 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all group"
                >
                    <span className="group-hover:scale-110 transition-transform inline-block">+ Add Item to {selectedDay}</span>
                </button>
            </div>
        </div>
    );

    const renderSubscribers = () => (
        <div className="space-y-6">
            <h2 className="text-xl font-bold">Active Subscribers ({subscribers.length})</h2>
            <Card className="p-0 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Student</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Plan</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Started</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Status</th>
                            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {subscribers.map(sub => (
                            <tr key={sub.id} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 rounded-full bg-gray-200" />
                                        <div>
                                            <p className="font-bold text-sm">{sub.user?.name || 'Unknown'}</p>
                                            <p className="text-xs text-gray-400">{sub.user?.email || 'N/A'}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <p className="text-sm font-medium">{sub.plan_type}</p>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {sub.created_at ? new Date(sub.created_at).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="text-[10px] font-bold px-2 py-1 bg-green-100 text-green-600 rounded-lg uppercase">Active</span>
                                </td>
                                <td className="px-6 py-4">
                                    <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50">
                                        <Trash2 size={16} />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        </div>
    );

    const renderSettings = () => (
        <div className="space-y-6">
            <h2 className="text-xl font-bold">Mess Profile Settings</h2>
            <Card className="p-8">
                <form onSubmit={handleUpdateMess} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-600">Mess Name</label>
                            <input
                                type="text"
                                value={messForm.name}
                                onChange={e => setMessForm({ ...messForm, name: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                placeholder="Business Name"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-600">Cuisine Types</label>
                            <input
                                type="text"
                                value={messForm.cuisine}
                                onChange={e => setMessForm({ ...messForm, cuisine: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                placeholder="e.g. Maharashtrian, North Indian"
                            />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                            <label className="text-sm font-bold text-gray-600">Description</label>
                            <textarea
                                rows={3}
                                value={messForm.description}
                                onChange={e => setMessForm({ ...messForm, description: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                placeholder="Tell students about your kitchen and services..."
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-600">Address</label>
                            <div className="relative">
                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    value={messForm.address}
                                    onChange={e => setMessForm({ ...messForm, address: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                    placeholder="Full location"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-600">Contact Number</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input
                                    type="text"
                                    value={messForm.contact}
                                    onChange={e => setMessForm({ ...messForm, contact: e.target.value })}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                                    placeholder="Business phone"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex justify-end">
                        <Button type="submit" isLoading={updating} className="rounded-xl px-12">
                            <Save size={18} className="mr-2" /> Save Changes
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );

    return (
        <Layout>
            <div className="bg-dark text-white py-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-primary opacity-5 animate-pulse" />
                <div className="container mx-auto px-4 relative">
                    <div className="flex flex-col md:row items-center justify-between gap-6">
                        <div className="space-y-2">
                            <h1 className="text-4xl font-heading font-black tracking-tighter">OWNER DASHBOARD</h1>
                            <div className="flex items-center space-x-2 text-primary">
                                <CircleCheck size={16} />
                                <p className="text-sm font-bold uppercase tracking-widest">{mess?.name || 'Loading...'}</p>
                            </div>
                        </div>
                        <div className="flex space-x-3">
                            <Button variant="outline" size="sm" className="rounded-xl border-white/20 text-white hover:bg-white/10 backdrop-blur-sm">
                                <ImageIcon size={18} className="mr-2" /> Manage Gallery
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-10 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Navigation */}
                    <div className="lg:col-span-1">
                        <Card className="p-2 space-y-1 sticky top-24 shadow-2xl shadow-primary/5 dark:bg-dark-card rounded-2xl">
                            {[
                                { id: 'overview', icon: <LayoutDashboard size={20} />, label: 'Overview' },
                                { id: 'menu', icon: <Utensils size={20} />, label: 'Menu Schedule' },
                                { id: 'subscribers', icon: <Users size={20} />, label: 'Subscribers' },
                                { id: 'settings', icon: <Settings size={20} />, label: 'Profile Settings' },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id as Tab)}
                                    className={`w-full flex items-center space-x-3 px-5 py-4 rounded-xl transition-all font-bold text-sm ${activeTab === item.id
                                        ? 'bg-primary text-white shadow-xl shadow-primary/30'
                                        : 'text-gray-500 hover:bg-gray-50'
                                        }`}
                                >
                                    {item.icon}
                                    <span>{item.label}</span>
                                </button>
                            ))}
                        </Card>
                    </div>

                    {/* Content Area */}
                    <div className="lg:col-span-3">
                        {loading ? (
                            <div className="space-y-6">
                                <div className="h-40 bg-gray-50 rounded-2xl animate-pulse" />
                                <div className="h-80 bg-gray-50 rounded-2xl animate-pulse" />
                            </div>
                        ) : (
                            <>
                                {activeTab === 'overview' && renderOverview()}
                                {activeTab === 'menu' && renderMenuManagement()}
                                {activeTab === 'subscribers' && renderSubscribers()}
                                {activeTab === 'settings' && renderSettings()}
                            </>
                        )}
                    </div>
                </div>
            </div>

            <BillingHistoryModal
                isOpen={isBillingModalOpen}
                onClose={() => setIsBillingModalOpen(false)}
            />
        </Layout>
    );
};

export default OwnerDashboardPage;
