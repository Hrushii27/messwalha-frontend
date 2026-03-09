import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import {
    Shield,
    Users,
    Building,
    Activity,
    CircleCheck,
    Trash2,
    UserPlus,
    Search,
    LayoutDashboard,
    Settings as SettingsIcon,
    RefreshCw,
    Eye
} from 'lucide-react';
import api from '../api/axiosInstance';
import { toast } from 'react-hot-toast';
import type { Mess, User } from '../types/mess';

type AdminTab = 'overview' | 'users' | 'messes' | 'settings';

const AdminDashboardPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<AdminTab>('overview');
    const [stats, setStats] = useState<{
        users: number;
        messes: number;
        activeSubscriptions: number;
        totalRevenue: number;
        totalVisits: number;
        ownerStats: {
            trial: number;
            active: number;
            expired: number;
        };
    } | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [messes, setMesses] = useState<Mess[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [statsRes, usersRes, messesRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/users'),
                api.get('/admin/messes')
            ]);
            setStats(statsRes.data.data);
            setUsers(usersRes.data.data);
            setMesses(messesRes.data.data);
        } catch (error) {
            console.error('Failed to load admin data:', error);
            toast.error('Failed to load admin data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleVerifyMess = async (id: string, currentStatus: boolean) => {
        try {
            await api.put(`/admin/messes/${id}/verify`, { verified: !currentStatus });
            setMesses(prev => prev.map(m => m.id === id ? { ...m, verified: !currentStatus } : m));
            toast.success('Mess verification status updated');
        } catch (error) {
            console.error('Failed to update verification status:', error);
            toast.error('Failed to update verification status');
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;
        try {
            await api.delete(`/admin/users/${id}`);
            setUsers(prev => prev.filter(u => u.id !== id));
            toast.success('User deleted successfully');
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    const renderOverview = () => (
        <div className="space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Users', value: stats?.users || 0, icon: <Users />, color: 'bg-indigo-500' },
                    { label: 'Total Messes', value: stats?.messes || 0, icon: <Building />, color: 'bg-primary' },
                    { label: 'Active Subs', value: stats?.activeSubscriptions || 0, icon: <Activity />, color: 'bg-emerald-500' },
                    { label: 'Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, icon: <Shield />, color: 'bg-amber-500' },
                    { label: 'Total Visits', value: (stats?.totalVisits || 0).toLocaleString(), icon: <Eye />, color: 'bg-rose-500' },
                ].map((item, i) => (
                    <Card key={i} className="p-6 border-none shadow-xl hover:scale-[1.02] transition-transform">
                        <div className="flex items-center space-x-4">
                            <div className={`p-4 rounded-2xl text-white shadow-lg shadow-black/10 ${item.color}`}>
                                {item.icon}
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 font-black uppercase tracking-widest">{item.label}</p>
                                <p className="text-2xl font-black mt-1">{item.value}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <section className="space-y-4">
                <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                    <Activity size={18} className="text-primary" /> Owner Subscriptions
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { label: 'Free Trials', value: stats?.ownerStats?.trial || 0, color: 'text-orange-500', bg: 'bg-orange-50' },
                        { label: 'Active (Paid)', value: stats?.ownerStats?.active || 0, color: 'text-green-500', bg: 'bg-green-50' },
                        { label: 'Expired', value: stats?.ownerStats?.expired || 0, color: 'text-red-500', bg: 'bg-red-50' },
                    ].map((item, i) => (
                        <Card key={i} className="p-6 border-none shadow-lg">
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">{item.label}</p>
                            <div className="flex items-end justify-between">
                                <p className={`text-4xl font-black ${item.color}`}>{item.value}</p>
                                <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${item.bg} ${item.color}`}>
                                    Status
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <section className="space-y-4">
                    <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                        <UserPlus size={18} className="text-primary" /> Recent Users
                    </h3>
                    <Card className="p-0 overflow-hidden">
                        <div className="divide-y divide-gray-100">
                            {users.slice(0, 5).map(u => (
                                <div key={u.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center font-bold">
                                            {u.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">{u.name}</p>
                                            <p className="text-xs text-gray-400">{u.role}</p>
                                        </div>
                                    </div>
                                    <span className="text-[10px] text-gray-400">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </section>

                <section className="space-y-4">
                    <h3 className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                        <Building size={18} className="text-secondary" /> Pending Verifications
                    </h3>
                    <Card className="p-0 overflow-hidden">
                        <div className="divide-y divide-gray-100">
                            {messes.filter(m => !m.verified).slice(0, 5).map(m => (
                                <div key={m.id} className="p-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                    <div>
                                        <p className="font-bold text-sm">{m.name}</p>
                                        <p className="text-xs text-gray-400">Owner: {m.owner?.name || 'N/A'}</p>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        className="text-[10px] font-black uppercase py-1 h-8"
                                        onClick={() => handleVerifyMess(m.id, false)}
                                    >
                                        Verify
                                    </Button>
                                </div>
                            ))}
                            {messes.filter(m => !m.verified).length === 0 && (
                                <div className="p-12 text-center text-gray-400">
                                    <CircleCheck size={32} className="mx-auto mb-2 opacity-20" />
                                    <p className="text-xs font-bold uppercase tracking-widest">All Verified!</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </section>
            </div>
        </div>
    );

    const renderUsers = () => (
        <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-2xl shadow-sm">
                <div className="relative flex-grow max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input type="text" placeholder="Search users by name or email..." className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border-none text-sm font-medium" />
                </div>
            </div>
            <Card className="p-0 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                            <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">User</th>
                            <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Role</th>
                            <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400">Joined</th>
                            <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-gray-400 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.map(u => (
                            <tr key={u.id} className="hover:bg-gray-50/50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-xs">
                                            {u.name[0]}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm">{u.name}</p>
                                            <p className="text-xs text-gray-400">{u.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase ${u.role === 'ADMIN' ? 'bg-indigo-100 text-indigo-600' : u.role === 'OWNER' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-xs font-medium text-gray-500">
                                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-50" onClick={() => handleDeleteUser(u.id)}>
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

    const renderMesses = () => (
        <div className="grid grid-cols-1 gap-4">
            {messes.map(m => (
                <Card key={m.id} className="p-6 flex flex-col md:row items-center justify-between gap-6 hover:border-primary transition-colors group">
                    <div className="flex items-center gap-6 flex-grow">
                        <div className="w-16 h-16 rounded-2xl bg-gray-100 overflow-hidden relative">
                            {m.images?.[0] ? (
                                <img
                                    src={m.images[0]}
                                    alt={m.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300.png?text=Mess+Image';
                                    }}
                                />
                            ) : (
                                <Building className="w-full h-full p-4 text-gray-300" />
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h4 className="font-black text-lg">{m.name}</h4>
                                {m.verified && <CircleCheck size={14} className="text-green-500" />}
                            </div>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-wider">{m.cuisine} • {m.address}</p>
                            <p className="text-[10px] text-gray-500 font-medium mt-1">Owner: {m.owner?.name || 'N/A'} ({m.owner?.email || 'N/A'})</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-12 text-center">
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase">Subs</p>
                            <p className="text-lg font-black">{m._count?.subscriptions || 0}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase">Reviews</p>
                            <p className="text-lg font-black">{m._count?.reviews || 0}</p>
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant={m.verified ? "outline" : "primary"}
                                size="sm"
                                className="rounded-xl px-6 text-[10px] font-black uppercase"
                                onClick={() => handleVerifyMess(m.id, m.verified || false)}
                            >
                                {m.verified ? 'Revoke' : 'Verify'}
                            </Button>
                        </div>
                    </div>
                </Card>
            ))}
        </div>
    );

    return (
        <Layout>
            <div className="bg-dark text-white py-12 relative overflow-hidden">
                <div className="absolute inset-0 bg-primary opacity-5 animate-pulse" />
                <div className="container mx-auto px-4 relative">
                    <div className="flex flex-col md:row items-center justify-between gap-6">
                        <div className="space-y-2">
                            <h1 className="text-4xl font-heading font-black tracking-tighter">ADMIN PANEL</h1>
                            <div className="flex items-center space-x-2 text-primary">
                                <Shield size={16} />
                                <p className="text-sm font-bold uppercase tracking-widest">Platform Infrastructure</p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="rounded-xl border-white/20 text-white hover:bg-white/10"
                            onClick={() => {
                                setRefreshing(true);
                                fetchData().then(() => setRefreshing(false));
                            }}
                        >
                            <RefreshCw size={18} className={`mr-2 ${refreshing ? 'animate-spin' : ''}`} /> Refresh Data
                        </Button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 -mt-10 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-1">
                        <Card className="p-2 space-y-1 sticky top-24 shadow-2xl rounded-2xl dark:bg-dark-card border-none">
                            {[
                                { id: 'overview', icon: <LayoutDashboard size={20} />, label: 'Overview' },
                                { id: 'users', icon: <Users size={20} />, label: 'User Management' },
                                { id: 'messes', icon: <Building size={20} />, label: 'Mess Verification' },
                                { id: 'settings', icon: <SettingsIcon size={20} />, label: 'Platform Stats' },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id as AdminTab)}
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

                    <div className="lg:col-span-3">
                        {loading && !refreshing ? (
                            <div className="space-y-6">
                                <div className="grid grid-cols-4 gap-6">
                                    {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-100 rounded-2xl animate-pulse" />)}
                                </div>
                                <div className="h-96 bg-gray-100 rounded-2xl animate-pulse" />
                            </div>
                        ) : (
                            <>
                                {activeTab === 'overview' && renderOverview()}
                                {activeTab === 'users' && renderUsers()}
                                {activeTab === 'messes' && renderMesses()}
                                {activeTab === 'settings' && (
                                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        <Card className="p-8 border-none shadow-2xl bg-gradient-to-br from-white to-gray-50 dark:from-dark-card dark:to-dark">
                                            <div className="flex flex-col md:row items-center justify-between gap-8">
                                                <div className="space-y-4 text-center md:text-left">
                                                    <h3 className="text-2xl font-black tracking-tight flex items-center gap-3">
                                                        <Activity className="text-primary" /> Platform Performance
                                                    </h3>
                                                    <p className="text-gray-500 font-medium max-w-md">
                                                        Real-time tracking of platform activity and visitor engagement.
                                                    </p>
                                                </div>
                                                <div className="flex gap-4">
                                                    <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 text-center min-w-[160px]">
                                                        <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1">Total Visits</p>
                                                        <p className="text-3xl font-black text-primary">{(stats?.totalVisits || 0).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                            {[
                                                { label: 'New Users Today', value: '0', icon: <Users />, color: 'text-indigo-500' },
                                                { label: 'Server Status', value: 'Online', icon: <Activity />, color: 'text-emerald-500' },
                                                { label: 'Database Status', value: 'Connected', icon: <Shield />, color: 'text-amber-500' },
                                            ].map((item, i) => (
                                                <Card key={i} className="p-6 border-none shadow-xl hover:shadow-2xl transition-all">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`p-3 rounded-xl bg-gray-50 ${item.color}`}>
                                                            {item.icon}
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{item.label}</p>
                                                            <p className="text-lg font-black">{item.value}</p>
                                                        </div>
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default AdminDashboardPage;
