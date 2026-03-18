import React, { useEffect, useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useAppSelector } from '../../hooks/redux';
import { 
    User as UserIcon, 
    Calendar, 
    MapPin, 
    Clock, 
    Settings, 
    Utensils,
    Star,
    ArrowRight
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api, { getImageUrl } from '../api/axiosInstance';
import Seo from '../components/common/Seo';

interface Subscription {
    id: string;
    mess_name: string;
    plan_name: string;
    expires_at: string;
    status: string;
}

type Tab = 'overview' | 'favorites' | 'reviews' | 'settings';

const UserDashboard: React.FC = () => {
    const { user } = useAppSelector((state) => state.auth);
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [favorites, setFavorites] = useState<any[]>([]);
    const [userReviews, setUserReviews] = useState<any[]>([]);
    const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const [subRes, favRes, reviewRes] = await Promise.all([
                    api.get('/subscriptions/my-subscriptions'),
                    api.get('/favorites'),
                    api.get('/reviews/my')
                ]);
                setSubscriptions(subRes.data);
                setFavorites(favRes.data.data || []);
                setUserReviews(reviewRes.data.data || []);
            } catch (err) {
                console.error('Failed to fetch dashboard data:', err);
            } finally {
                setIsLoading(false);
            }
        };

        const loadRecentlyViewed = () => {
            const saved = localStorage.getItem('recentlyViewed');
            if (saved) {
                try {
                    setRecentlyViewed(JSON.parse(saved).slice(0, 5));
                } catch (e) {
                    console.error('Failed to parse recently viewed', e);
                }
            }
        };

        if (user) {
            fetchDashboardData();
            loadRecentlyViewed();
        }
    }, [user]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    const renderOverview = () => (
        <div className="space-y-12">
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black tracking-tight flex items-center">
                        <Calendar className="mr-3 text-primary" /> Active Subscriptions
                    </h2>
                    <Link to="/find-mess" className="text-primary text-sm font-bold hover:underline flex items-center">
                        Explore More <ArrowRight size={16} className="ml-1" />
                    </Link>
                </div>

                {subscriptions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {subscriptions.map((sub) => (
                            <Card key={sub.id} className="p-8 hover:shadow-2xl transition-all border-none bg-white dark:bg-white/5 group overflow-hidden rounded-[2rem] border-l-4 border-primary shadow-lg">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center gap-5">
                                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                            <Utensils size={28} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black tracking-tight">{sub.mess_name}</h3>
                                            <p className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-widest">{sub.plan_name}</p>
                                        </div>
                                    </div>
                                    <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${sub.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                                        {sub.status}
                                    </span>
                                </div>
                                <div className="mt-6 pt-6 border-t border-gray-100 dark:border-white/5 flex items-center justify-between">
                                    <div className="flex items-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                                        <Clock size={14} className="mr-2" />
                                        Exps: {new Date(sub.expires_at).toLocaleDateString()}
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-primary font-black uppercase tracking-widest text-[9px]">Manage</Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-gray-50 dark:bg-white/5 rounded-[3rem] border-2 border-dashed border-gray-200 dark:border-white/10">
                        <div className="w-20 h-20 bg-white dark:bg-white/10 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                            <Utensils size={32} className="text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">No active meal protocols</h3>
                        <p className="text-gray-500 mb-8 max-w-xs mx-auto text-sm">You haven't subscribed to any mess yet.</p>
                        <Button onClick={() => navigate('/find-mess')} size="lg" className="rounded-full px-10 shadow-xl shadow-primary/20">Find Your Mess</Button>
                    </div>
                )}
            </div>

            {recentlyViewed.length > 0 && (
                <div className="space-y-6">
                    <h2 className="text-2xl font-black tracking-tight flex items-center">
                        <Clock className="mr-3 text-primary" /> Recently Viewed
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {recentlyViewed.map((m) => (
                            <Link key={m.id} to={`/mess/${m.id}`}>
                                <Card className="p-4 hover:scale-[1.05] transition-transform overflow-hidden rounded-2xl group border-none bg-white dark:bg-white/5 shadow-md">
                                    <div className="aspect-square rounded-xl overflow-hidden mb-3">
                                        <img src={m.image} alt={m.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                    </div>
                                    <h4 className="font-black text-[11px] uppercase tracking-tight line-clamp-1">{m.name}</h4>
                                    <div className="flex items-center mt-1">
                                        <Star size={10} className="text-yellow-400 fill-yellow-400 mr-1" />
                                        <span className="text-[10px] font-black">{m.rating || '0.0'}</span>
                                    </div>
                                </Card>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    const renderFavorites = () => (
        <div className="space-y-8">
            <h2 className="text-2xl font-black tracking-tight flex items-center">
                <Heart className="mr-3 text-red-500" /> Saved Messes
            </h2>
            {favorites.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {favorites.map((m) => (
                        <Card key={m.id} className="p-0 overflow-hidden rounded-[2rem] border-none shadow-xl hover:shadow-2xl transition-all group bg-white dark:bg-white/5">
                            <div className="flex flex-col sm:flex-row h-full">
                                <div className="sm:w-1/3 relative h-48 sm:h-auto">
                                    <img src={getImageUrl(m.image_url) || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={m.name} />
                                    <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md p-2 rounded-full text-white cursor-pointer" onClick={() => navigate(`/mess/${m.id}`)}>
                                        <Heart size={16} fill="white" />
                                    </div>
                                </div>
                                <div className="p-8 flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-xl font-black uppercase tracking-tight italic line-clamp-1">{m.name}</h3>
                                        <p className="text-gray-500 text-xs flex items-center mt-2 group-hover:text-primary transition-colors">
                                            <MapPin size={12} className="mr-1" /> {m.city || 'Pune'}
                                        </p>
                                    </div>
                                    <div className="mt-6 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="bg-yellow-400/10 text-yellow-600 px-3 py-1 rounded-lg text-xs font-black flex items-center">
                                                <Star size={12} className="fill-yellow-600 mr-1" /> {m.rating || '4.0'}
                                            </div>
                                        </div>
                                        <Link to={`/mess/${m.id}`} className="p-3 bg-primary/10 text-primary rounded-xl hover:bg-primary hover:text-white transition-all">
                                            <ArrowRight size={20} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-24 bg-gray-50 dark:bg-white/5 rounded-[3rem]">
                    <Heart size={64} className="mx-auto mb-6 text-gray-200" />
                    <p className="font-black uppercase tracking-widest text-sm text-gray-400">No saved food outposts yet</p>
                </div>
            )}
        </div>
    );

    const renderReviews = () => (
        <div className="space-y-8">
            <h2 className="text-2xl font-black tracking-tight flex items-center">
                <MessageSquare className="mr-3 text-primary" /> Your Signal Logs (Reviews)
            </h2>
            {userReviews.length > 0 ? (
                <div className="grid grid-cols-1 gap-6">
                    {userReviews.map((r) => (
                        <Card key={r.id} className="p-8 bg-white dark:bg-white/5 rounded-[2rem] border-none shadow-lg">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h4 className="font-black text-lg uppercase tracking-tight italic text-primary">{r.mess_name}</h4>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-1">{new Date(r.created_at).toLocaleDateString()}</p>
                                </div>
                                <div className="bg-yellow-400/10 px-3 py-1 rounded-full text-yellow-600 font-black flex items-center text-xs">
                                    <Star size={12} className="fill-yellow-600 mr-1" /> {r.rating}.0
                                </div>
                            </div>
                            <p className="text-gray-600 dark:text-gray-300 italic font-medium">"{r.comment}"</p>
                            {r.owner_response && (
                                <div className="mt-6 p-6 bg-primary/5 rounded-2xl border-l-4 border-primary">
                                    <p className="text-[11px] font-black uppercase text-primary mb-2 italic">Owner Response</p>
                                    <p className="text-xs font-bold italic">"{r.owner_response}"</p>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            ) : (
                <div className="text-center py-24 bg-gray-50 dark:bg-white/5 rounded-[3rem]">
                    <MessageSquare size={64} className="mx-auto mb-6 text-gray-200" />
                    <p className="font-black uppercase tracking-widest text-sm text-gray-400">You haven't posted any reviews yet</p>
                </div>
            )}
        </div>
    );

    const renderSettings = () => (
        <div className="space-y-8">
            <h2 className="text-2xl font-black tracking-tight flex items-center">
                <Settings className="mr-3 text-primary" /> Account Settings
            </h2>
            <Card className="p-10 bg-white dark:bg-white/5 rounded-[3rem] border-none shadow-xl">
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Display Name</label>
                            <Input value={user.name} readOnly className="bg-gray-50 dark:bg-white/5 font-bold" />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 ml-2">Email Identity</label>
                            <Input value={user.email} readOnly className="bg-gray-50 dark:bg-white/5 font-bold" />
                        </div>
                    </div>
                    <div className="pt-8 border-t border-gray-100 dark:border-white/5 flex flex-col sm:flex-row gap-4">
                        <Button className="rounded-2xl px-8 font-black uppercase tracking-widest text-[10px] py-6 shadow-xl shadow-primary/20">Update Security Key</Button>
                        <Button variant="outline" className="rounded-2xl px-8 font-black uppercase tracking-widest text-[10px] py-6" onClick={handleLogout}>Force Logout</Button>
                    </div>
                </div>
            </Card>
        </div>
    );

    return (
        <Layout>
            <Seo title="My Dashboard" description="Manage your FindMess account and subscriptions." />
            <div className="container mx-auto px-4 py-8 max-w-6xl text-text-primary dark:text-text-inverse">
                {/* Profile Header */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-10 p-8 bg-white dark:bg-dark-800 rounded-3xl border border-gray-100 dark:border-white/5 shadow-sm">
                    <div className="flex flex-col md:flex-row items-center gap-6">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center border-4 border-white dark:border-dark-900 shadow-lg overflow-hidden">
                                {(user as any).profile_image || (user as any).avatar ? (
                                    <img src={(user as any).profile_image || (user as any).avatar} alt={user.name} className="w-full h-full object-cover" />
                                ) : (
                                    <UserIcon size={40} className="text-primary" />
                                )}
                            </div>
                            <div className="absolute bottom-0 right-0 w-8 h-8 bg-green-500 border-4 border-white dark:border-dark-900 rounded-full"></div>
                        </div>
                        <div className="text-center md:text-left">
                            <h1 className="text-3xl font-heading font-black tracking-tight italic uppercase">{user.name}</h1>
                            <p className="text-gray-500 dark:text-gray-400 font-medium">{user.email}</p>
                            <div className="flex flex-wrap justify-center md:justify-start gap-2 mt-3">
                                <span className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-black rounded-full uppercase tracking-widest">
                                    {user.role}
                                </span>
                                {(user as any).google_id && (
                                    <span className="px-3 py-1 bg-blue-50 dark:bg-blue-900/20 text-blue-500 text-[10px] font-black rounded-full uppercase tracking-widest flex items-center gap-1">
                                        <ShieldCheck size={12} /> Google Verified
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <Button 
                            variant="outline" 
                            size="sm" 
                            className={`rounded-full shadow-sm transition-all border-2 font-black uppercase tracking-widest text-[9px] ${activeTab === 'settings' ? 'bg-primary text-white border-primary' : ''}`}
                            onClick={() => setActiveTab('settings')}
                        >
                            <Settings size={18} className="mr-2" /> Command Center
                        </Button>
                    </div>
                </div>

                <div className="flex overflow-x-auto pb-4 mb-8 gap-4 scrollbar-hide">
                    {[
                        { id: 'overview', label: 'Protocol Overview', icon: Calendar },
                        { id: 'favorites', label: 'Pinned Outposts', icon: Heart },
                        { id: 'reviews', label: 'Signal Logs', icon: MessageSquare },
                        { id: 'settings', label: 'Core Command', icon: Settings },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as Tab)}
                            className={`flex items-center gap-3 px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap shadow-sm border-2 ${activeTab === tab.id
                                ? 'bg-primary border-primary text-white shadow-xl shadow-primary/30'
                                : 'bg-white dark:bg-white/5 border-transparent text-gray-400 hover:border-primary/30'
                                }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="min-h-[400px]">
                    {isLoading ? (
                        <div className="flex flex-col gap-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-40 bg-gray-100 dark:bg-white/5 animate-pulse rounded-[2rem]"></div>
                            ))}
                        </div>
                    ) : (
                        <>
                            {activeTab === 'overview' && renderOverview()}
                            {activeTab === 'favorites' && renderFavorites()}
                            {activeTab === 'reviews' && renderReviews()}
                            {activeTab === 'settings' && renderSettings()}
                        </>
                    )}
                </div>
            </div>
        </Layout>
    );
};

const Heart = ({ size, className, fill }: { size?: number, className?: string, fill?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill={fill || "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
);

const MessageSquare = ({ size, className }: { size?: number, className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
);

const ShieldCheck = ({ size, className }: { size?: number, className?: string }) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size || 24} 
        height={size || 24} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
        <path d="m9 12 2 2 4-4" />
    </svg>
);

export default UserDashboard;
