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
            const [statsRes, pendingRes] = await Promise.all([
                api.get('/admin/stats'),
                api.get('/admin/pending-listings')
            ]);
            setStats(statsRes.data.data);
            setMesses(pendingRes.data.data);
            
            // Optionally fetch all messes if needed, but primary focus is pending
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

    const handleApproveMess = async (id: string) => {
        try {
            await api.post(`/admin/approve-listing/${id}`);
            setMesses(prev => prev.filter(m => m.id !== id));
            toast.success('Mess listing approved!');
        } catch (error) {
            console.error('Failed to approve mess:', error);
            toast.error('Failed to approve mess');
        }
    };

    const handleRejectMess = async (id: string) => {
        const reason = window.prompt('Enter rejection reason:');
        if (reason === null) return;
        try {
            await api.post(`/admin/reject-listing/${id}`, { reason });
            setMesses(prev => prev.filter(m => m.id !== id));
            toast.success('Mess listing rejected');
        } catch (error) {
            console.error('Failed to reject mess:', error);
            toast.error('Failed to reject mess');
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                {[
                    { label: 'Total Users', value: stats?.users || 0, icon: <Users />, color: 'text-indigo-500' },
                    { label: 'Total Messes', value: stats?.messes || 0, icon: <Building />, color: 'text-primary-500' },
                    { label: 'Active Subs', value: stats?.activeSubscriptions || 0, icon: <Activity />, color: 'text-emerald-500' },
                    { label: 'Revenue', value: `₹${(stats?.totalRevenue || 0).toLocaleString()}`, icon: <Shield />, color: 'text-amber-500' },
                    { label: 'Total Visits', value: (stats?.totalVisits || 0).toLocaleString(), icon: <Eye />, color: 'text-rose-500' },
                ].map((item, i) => (
                    <Card key={i} className="p-6 border-white/5 bg-bg2/40 backdrop-blur-3xl shadow-3xl hover:border-primary-500/30 transition-all rounded-[1.5rem] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-2xl -mr-8 -mt-8" />
                        <div className="flex flex-col items-start relative z-10">
                            <div className={`p-4 rounded-xl bg-bg3/50 mb-4 border border-white/5 group-hover:scale-110 transition-transform duration-500 ${item.color}`}>
                                {item.icon}
                            </div>
                            <div>
                                <p className="text-[9px] text-text-muted font-black uppercase tracking-[0.2em] italic mb-1">{item.label}</p>
                                <p className="text-2xl font-black text-white italic tracking-tighter">{item.value}</p>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <section className="space-y-6">
                <h3 className="text-lg font-black uppercase tracking-[0.3em] flex items-center gap-3 text-text-primary px-2 italic">
                    <Activity size={20} className="text-primary-500" /> Subscription <span className="text-primary-500">Stats</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { label: 'Free Trials', value: stats?.ownerStats?.trial || 0, color: 'text-orange-500', bg: 'bg-orange-500/10' },
                        { label: 'Active (Paid)', value: stats?.ownerStats?.active || 0, color: 'text-green-500', bg: 'bg-green-500/10' },
                        { label: 'Expired', value: stats?.ownerStats?.expired || 0, color: 'text-red-500', bg: 'bg-red-500/10' },
                    ].map((item, i) => (
                        <Card key={i} className="p-8 border-white/5 bg-bg2/40 backdrop-blur-3xl shadow-3xl rounded-[2rem] group hover:border-white/20 transition-all">
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-4 italic">{item.label}</p>
                            <div className="flex items-end justify-between">
                                <p className={`text-5xl font-black tracking-tighter italic ${item.color}`}>{item.value}</p>
                                <div className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border border-white/5 italic ${item.bg} ${item.color}`}>
                                    LNK-ACT
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <section className="space-y-6">
                    <h3 className="text-lg font-black uppercase tracking-[0.3em] flex items-center gap-3 text-text-primary px-2 italic">
                        <UserPlus size={20} className="text-indigo-500" /> Recent <span className="text-indigo-500">Signups</span>
                    </h3>
                    <Card className="p-0 overflow-hidden border-white/5 bg-bg2/40 backdrop-blur-3xl shadow-3xl rounded-[2rem]">
                        <div className="divide-y divide-white/5">
                            {users.slice(0, 5).map(u => (
                                <div key={u.id} className="p-6 flex items-center justify-between hover:bg-white/5 transition-all group">
                                    <div className="flex items-center gap-5">
                                        <div className="w-12 h-12 rounded-xl bg-bg3/50 text-indigo-400 flex items-center justify-center font-black border border-white/5 shadow-2xl">
                                            {u.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-black text-white italic uppercase tracking-tight">{u.name}</p>
                                            <p className="text-[10px] text-text-muted font-black uppercase tracking-widest">{u.role}</p>
                                        </div>
                                    </div>
                                    <span className="text-[9px] text-text-muted font-black uppercase tracking-widest italic">{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </section>

                <section className="space-y-6">
                    <h3 className="text-lg font-black uppercase tracking-[0.3em] flex items-center gap-3 text-text-primary px-2 italic">
                        <Building size={20} className="text-secondary" /> Pending <span className="text-primary-500">Approvals</span>
                    </h3>
                    <Card className="p-0 overflow-hidden border-white/5 bg-bg2/40 backdrop-blur-3xl shadow-3xl rounded-[2rem]">
                        <div className="divide-y divide-white/5">
                            {messes.length > 0 ? messes.slice(0, 5).map(m => (
                                <div key={m.id} className="p-6 flex flex-col sm:flex-row items-center justify-between gap-6 hover:bg-white/5 transition-all group">
                                    <div className="text-center sm:text-left">
                                        <p className="font-black text-white italic uppercase tracking-tight text-lg">{m.name}</p>
                                        <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em] mt-1">Owner: {m.ownerName || 'N/A'}</p>
                                    </div>
                                    <div className="flex gap-4 w-full sm:w-auto">
                                        <Button
                                            size="sm"
                                            className="flex-1 sm:flex-none text-[9px] font-black uppercase tracking-[0.2em] py-3 h-10 px-8 rounded-xl italic shadow-2xl shadow-primary-500/20"
                                            onClick={() => handleApproveMess(m.id)}
                                        >
                                            Approve
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            className="flex-1 sm:flex-none text-[9px] font-black uppercase tracking-[0.2em] py-3 h-10 px-8 rounded-xl italic border-white/10 text-red-500 hover:bg-red-500/5 hover:border-red-500/30"
                                            onClick={() => handleRejectMess(m.id)}
                                        >
                                            Decline
                                        </Button>
                                    </div>
                                </div>
                            )) : (
                                <div className="p-20 text-center">
                                    <CircleCheck size={48} className="mx-auto mb-4 opacity-20 text-green-500 animate-pulse" />
                                    <p className="text-[11px] font-black text-text-muted uppercase tracking-[0.3em] italic leading-relaxed">Everything is up to date. No pending approvals.</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </section>
            </div>
        </div>
    );

    const renderUsers = () => (
        <div className="p-0 overflow-hidden border-white/5 bg-bg2/40 backdrop-blur-3xl shadow-3xl rounded-[2rem]">
            <div className="p-8 border-b border-white/5 flex flex-col sm:flex-row justify-between items-center gap-6">
                <div className="relative w-full sm:max-w-md">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
                    <input type="text" placeholder="Search for users (name/email)..." className="w-full pl-14 pr-6 h-14 rounded-2xl bg-bg3/50 border-white/10 text-sm font-black text-white italic placeholder:text-text-muted/50 focus:border-primary-500/50 transition-all outline-none" />
                </div>
                <div className="flex gap-4 w-full sm:w-auto">
                    <Button variant="outline" className="flex-1 sm:flex-none h-14 px-8 rounded-2xl border-white/10 text-[10px] font-black uppercase tracking-widest italic hover:bg-white/5">Export Registry</Button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="border-b border-white/5 bg-bg3/30">
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted italic">User</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted italic">Role</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted italic">Joined On</th>
                            <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] text-text-muted italic text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {users.map(u => (
                            <tr key={u.id} className="hover:bg-white/5 transition-all group">
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-bg3/50 flex items-center justify-center font-black text-xs text-indigo-400 border border-white/5 shadow-xl">
                                            {u.name[0]}
                                        </div>
                                        <div>
                                            <p className="font-black text-white text-sm italic uppercase tracking-tight">{u.name}</p>
                                            <p className="text-[10px] text-text-muted font-black uppercase tracking-widest mt-0.5">{u.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest italic border ${u.role === 'ADMIN' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' : u.role === 'OWNER' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                                        {u.role}
                                    </span>
                                </td>
                                <td className="px-8 py-6 text-[10px] font-black text-text-muted uppercase italic tracking-widest">
                                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <Button variant="ghost" size="sm" className="text-red-500 hover:bg-red-500/5 rounded-xl h-10 w-10 flex items-center justify-center" onClick={() => handleDeleteUser(u.id)}>
                                        <Trash2 size={16} />
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    const renderMesses = () => (
        <div className="space-y-8">
            <h2 className="text-3xl font-black uppercase tracking-tighter italic text-text-primary px-2">Verification <span className="text-primary-500">Queue ({messes.length})</span></h2>
            {messes.map(m => (
                <Card key={m.id} className="p-8 flex flex-col md:flex-row items-center justify-between gap-8 hover:border-primary-500/30 transition-all group border-white/5 bg-bg2/40 backdrop-blur-3xl rounded-[2.5rem] shadow-3xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                    <div className="flex items-center gap-8 flex-grow relative z-10">
                        <div className="w-20 h-20 rounded-[1.5rem] bg-bg3/50 overflow-hidden relative flex items-center justify-center border border-white/5 shadow-2xl group-hover:scale-110 transition-transform duration-500">
                             <Building className="w-10 h-10 text-primary-500 opacity-50" />
                        </div>
                        <div>
                            <div className="flex items-center gap-4 mb-2">
                                <h4 className="font-black text-2xl tracking-tighter italic text-white uppercase">{m.name}</h4>
                                <span className="bg-orange-500/10 text-orange-400 px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border border-orange-500/20 italic">Verification Pending</span>
                            </div>
                            <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em] italic mb-2">{m.cuisine} • {m.city}</p>
                            <p className="text-[11px] text-text-muted font-black uppercase tracking-widest opacity-60 italic">Central ID: {m.id.substring(0,12)} • Owner: {m.ownerName || 'N/A'}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 relative z-10 w-full md:w-auto">
                        <Button
                            size="sm"
                            className="flex-1 md:flex-none rounded-2xl px-10 text-[10px] font-black uppercase tracking-widest h-14 italic shadow-2xl shadow-primary-500/20"
                            onClick={() => handleApproveMess(m.id)}
                        >
                            Approve Listing
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 md:flex-none rounded-2xl px-10 text-[10px] font-black uppercase tracking-widest h-14 italic border-white/10 text-red-500 hover:bg-red-500/5 hover:border-red-500/30"
                            onClick={() => handleRejectMess(m.id)}
                        >
                            Decline
                        </Button>
                    </div>
                </Card>
            ))}
            {messes.length === 0 && (
                <Card className="p-24 text-center bg-bg2/40 backdrop-blur-3xl rounded-[3rem] border border-white/5 shadow-3xl">
                    <CircleCheck size={64} className="mx-auto text-green-500 mb-8 opacity-20 animate-pulse" />
                    <h3 className="text-2xl font-black uppercase tracking-[0.3em] text-white italic">All Clear</h3>
                    <p className="text-text-muted text-[11px] font-black uppercase tracking-widest mt-4 italic opacity-60">All mess approvals have been handled.</p>
                </Card>
            )}
        </div>
    );

    return (
        <Layout>
            <div className="bg-bg text-white py-20 relative overflow-hidden border-b border-white/5">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-500/50 to-transparent opacity-30" />
                <div className="absolute inset-0 bg-primary-500/10 mix-blend-overlay" />
                <div className="container mx-auto px-6 relative z-10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                        <div className="space-y-4 text-center md:text-left">
                            <h1 className="text-6xl font-heading font-black tracking-tighter italic uppercase text-white leading-none">ADMIN <span className="text-primary-500">PANEL</span></h1>
                            <div className="flex items-center justify-center md:justify-start space-x-3 text-primary-500">
                                <Shield size={20} className="animate-pulse" />
                                <p className="text-[11px] font-black uppercase tracking-[0.4em] italic leading-none">Authorized Admin Access</p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            size="lg"
                            className="rounded-2xl border-white/10 text-white hover:bg-white/5 h-16 px-10 font-black uppercase tracking-widest text-[10px] italic shadow-2xl"
                            onClick={() => {
                                setRefreshing(true);
                                fetchData().then(() => setRefreshing(false));
                            }}
                        >
                            <RefreshCw size={20} className={`mr-3 ${refreshing ? 'animate-spin' : ''}`} /> Refresh Stats
                        </Button>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 -mt-12 pb-24 relative z-20">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                    <div className="lg:col-span-1">
                        <Card className="p-3 space-y-2 sticky top-28 shadow-3xl rounded-[2rem] bg-bg2/80 backdrop-blur-3xl border border-white/10">
                            {[
                                { id: 'overview', icon: <LayoutDashboard size={22} />, label: 'DASHBOARD' },
                                { id: 'users', icon: <Users size={22} />, label: 'USER REGISTRY' },
                                { id: 'messes', icon: <Building size={22} />, label: 'MESS VERIFICATION' },
                                { id: 'settings', icon: <SettingsIcon size={22} />, label: 'SYSTEM STATS' },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id as AdminTab)}
                                    className={`w-full flex items-center space-x-4 px-6 py-5 rounded-2xl transition-all font-black text-[10px] uppercase tracking-[0.2em] italic ${activeTab === item.id
                                        ? 'bg-primary-500 text-white shadow-2xl shadow-primary-500/40 -translate-y-1'
                                        : 'text-text-muted hover:bg-white/5 border border-transparent'
                                        }`}
                                >
                                    <div className={`${activeTab === item.id ? 'text-white' : 'text-primary-500'}`}>
                                        {item.icon}
                                    </div>
                                    <span>{item.label}</span>
                                </button>
                            ))}
                        </Card>
                    </div>

                    <div className="lg:col-span-3">
                        {loading && !refreshing ? (
                            <div className="space-y-8">
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                                    {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-bg2/40 backdrop-blur-3xl rounded-[2rem] border border-white/5 animate-pulse shadow-3xl" />)}
                                </div>
                                <div className="h-[600px] bg-bg2/40 backdrop-blur-3xl rounded-[3rem] border border-white/5 animate-pulse shadow-3xl" />
                            </div>
                        ) : (
                            <>
                                {activeTab === 'overview' && renderOverview()}
                                {activeTab === 'users' && renderUsers()}
                                {activeTab === 'messes' && renderMesses()}
                                {activeTab === 'settings' && (
                                    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-700">
                                        <Card className="p-12 border-white/5 shadow-3xl bg-bg2/40 backdrop-blur-3xl rounded-[3rem] relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
                                            <div className="flex flex-col lg:flex-row items-center justify-between gap-12 relative z-10">
                                                <div className="space-y-4 text-center lg:text-left">
                                                    <h3 className="text-3xl font-black tracking-tighter flex items-center justify-center lg:justify-start gap-4 italic uppercase text-white">
                                                        <Activity className="text-primary-500 animate-pulse" size={32} /> Platform <span className="text-primary-500">Status</span>
                                                    </h3>
                                                    <p className="text-text-muted font-black uppercase tracking-widest text-[11px] max-w-md italic leading-relaxed">
                                                        View real-time platform activity, visitor engagement metrics, and system performance.
                                                    </p>
                                                </div>
                                                <div className="flex gap-6">
                                                    <div className="p-10 rounded-[2.5rem] bg-bg3/50 border border-white/10 text-center min-w-[220px] shadow-2xl group-hover:border-primary-500/30 transition-all duration-500">
                                                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] mb-3 italic">Total Visitors</p>
                                                        <p className="text-5xl font-black text-primary-500 italic tracking-tighter">{(stats?.totalVisits || 0).toLocaleString()}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </Card>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                            {[
                                                { label: 'New Signups (Daily)', value: '18', icon: <Users />, color: 'text-indigo-500' },
                                                { label: 'Server Status', value: 'ACTIVE', icon: <Activity />, color: 'text-emerald-500' },
                                                { label: 'Secure Data', value: 'ENCRYPTED', icon: <Shield />, color: 'text-amber-500' },
                                            ].map((item, i) => (
                                                <Card key={i} className="p-8 border-white/5 bg-bg2/40 backdrop-blur-3xl shadow-3xl hover:border-white/20 transition-all rounded-[2rem] group h-full">
                                                    <div className="flex flex-col items-center text-center gap-6">
                                                        <div className={`p-5 rounded-2xl bg-bg3/50 border border-white/5 group-hover:scale-110 transition-transform duration-500 ${item.color} shadow-2xl`}>
                                                            {item.icon}
                                                        </div>
                                                        <div>
                                                            <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em] italic mb-2">{item.label}</p>
                                                            <p className="text-xl font-black text-white italic tracking-[0.1em]">{item.value}</p>
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
