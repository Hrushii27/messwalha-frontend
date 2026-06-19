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
    const { user, isLoading: authLoading } = useAppSelector((state) => state.auth);
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [favorites, setFavorites] = useState<any[]>([]);
    const [userReviews, setUserReviews] = useState<any[]>([]);
    const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState<Tab>('overview');
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!authLoading && !user) {
            navigate('/login');
        }
    }, [user, authLoading, navigate]);

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

    if (authLoading || !user) {
        return (
            <Layout>
                <div className="min-h-screen bg-bg flex items-center justify-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary-500"></div>
                </div>
            </Layout>
        );
    }

    const handleLogout = () => {
        localStorage.removeItem('token');
        window.location.href = '/login';
    };

    const renderOverview = () => (
        <div className="space-y-12">
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h2 className="text-3xl font-black tracking-tighter flex items-center italic uppercase text-text-primary">
                        <Calendar className="mr-4 text-primary-500" size={32} /> My <span className="text-primary-500 ml-3">Subscriptions</span>
                    </h2>
                    <Link to="/find-mess" className="text-primary-500 text-[10px] font-black uppercase tracking-[0.3em] hover:text-white transition-colors italic border border-white/5 rounded-xl px-6 py-2">
                        Find a Mess <ArrowRight size={14} className="ml-2 inline" />
                    </Link>
                </div>

                {subscriptions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {subscriptions.map((sub) => (
                            <Card key={sub.id} className="p-8 hover:border-primary-500/30 transition-all border-white/5 bg-bg2/40 backdrop-blur-3xl group overflow-hidden rounded-[2.5rem] relative shadow-3xl">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                                <div className="flex justify-between items-start relative z-10">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-bg3/50 rounded-2xl flex items-center justify-center text-primary-500 group-hover:scale-110 transition-transform duration-500 border border-white/5">
                                            <Utensils size={28} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-black tracking-tight italic uppercase text-white">{sub.mess_name}</h3>
                                            <p className="text-text-muted text-[9px] font-black uppercase tracking-[0.2em] mt-1 italic">{sub.plan_name}</p>
                                        </div>
                                    </div>
                                    <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest italic border ${sub.status === 'active' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>
                                        {sub.status}
                                    </span>
                                </div>
                                <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between relative z-10">
                                    <div className="flex items-center text-[9px] font-black uppercase tracking-[0.2em] text-text-muted italic">
                                        <Clock size={14} className="mr-2 text-primary-500" />
                                        Expires on: {new Date(sub.expires_at).toLocaleDateString()}
                                    </div>
                                    <Button variant="ghost" size="sm" className="text-primary-500 font-black uppercase tracking-widest text-[9px] italic hover:bg-primary-500/5 rounded-xl px-6">Manage</Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                <Card className="min-h-[350px] bg-bg2/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center text-center p-12">
                    <div className="w-24 h-24 bg-bg3/50 rounded-full flex items-center justify-center mb-8 shadow-2xl border border-white/5 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-primary-500/10 blur-xl group-hover:bg-primary-500/20 transition-all" />
                        <Utensils size={36} className="text-text-muted relative z-10" />
                    </div>
                    <h3 className="text-2xl font-black mb-3 italic uppercase text-white tracking-tighter">No Active Subscriptions</h3>
                    <p className="text-text-muted mb-10 max-w-xs mx-auto text-[11px] font-black uppercase tracking-widest italic leading-relaxed">No active meal plans found in your account.</p>
                    <Button onClick={() => navigate('/find-mess')} size="lg" className="rounded-2xl px-12 py-6 shadow-2xl shadow-primary-500/20 font-black uppercase tracking-widest text-xs italic">Find a Mess</Button>
                </Card>
                )}
            </div>

            {recentlyViewed.length > 0 && (
                <div className="space-y-8">
                    <h2 className="text-3xl font-black tracking-tighter flex items-center italic uppercase text-text-primary px-2">
                        <Clock className="mr-4 text-primary-500" size={32} /> Recently <span className="text-primary-500 ml-3">Viewed</span>
                    </h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                        {recentlyViewed.map((m) => (
                            <Link key={m.id} to={`/mess/${m.id}`}>
                                <Card className="p-4 hover:border-primary-500/30 transition-all overflow-hidden rounded-[1.5rem] group border-white/5 bg-bg2/40 backdrop-blur-3xl shadow-3xl">
                                    <div className="aspect-square rounded-xl overflow-hidden mb-4 relative">
                                        <img src={getImageUrl(m.image)} alt={m.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80" />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                    <h4 className="font-black text-[10px] uppercase tracking-widest line-clamp-1 italic text-white group-hover:text-primary-500 transition-colors">{m.name}</h4>
                                    <div className="flex items-center mt-2 bg-black/40 w-fit px-3 py-1 rounded-lg border border-white/5">
                                        <Star size={10} className="text-yellow-400 fill-yellow-400 mr-1.5" />
                                        <span className="text-[10px] font-black text-white italic">{m.rating || '0.0'}</span>
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
            <h2 className="text-3xl font-black tracking-tighter flex items-center italic uppercase text-text-primary px-2">
                <Heart className="mr-4 text-red-500" size={32} /> My <span className="text-primary-500 ml-3">Favorites</span>
            </h2>
            {favorites.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {favorites.map((m) => (
                        <Card key={m.id} className="p-0 overflow-hidden rounded-[2.5rem] border-white/5 shadow-3xl hover:border-primary-500/30 transition-all group bg-bg2/40 backdrop-blur-3xl relative">
                            <div className="flex flex-col sm:flex-row h-full">
                                <div className="sm:w-1/3 relative h-48 sm:h-auto overflow-hidden">
                                    <img src={getImageUrl(m.image_url) || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=400'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80" alt={m.name} />
                                    <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-xl p-3 rounded-2xl text-red-500 cursor-pointer border border-white/10" onClick={() => navigate(`/mess/${m.id}`)}>
                                        <Heart size={18} fill="currentColor" />
                                    </div>
                                </div>
                                <div className="p-8 flex-1 flex flex-col justify-between relative z-10">
                                    <div>
                                        <h3 className="text-xl font-black uppercase tracking-tight italic text-white line-clamp-1">{m.name}</h3>
                                        <p className="text-text-muted text-[10px] font-black uppercase tracking-widest flex items-center mt-3 italic">
                                            <MapPin size={12} className="mr-2 text-primary-500" /> {m.city || 'Pune'}
                                        </p>
                                    </div>
                                    <div className="mt-8 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="bg-bg3/50 text-yellow-500 px-4 py-2 rounded-xl text-[11px] font-black flex items-center border border-white/5 italic">
                                                <Star size={14} className="fill-yellow-500 mr-2" /> {m.rating || '4.0'}
                                            </div>
                                        </div>
                                        <Link to={`/mess/${m.id}`} className="p-4 bg-primary-500/10 text-primary-500 rounded-2xl hover:bg-primary-500 hover:text-white transition-all border border-primary-500/20 shadow-xl shadow-primary-500/10">
                                            <ArrowRight size={20} />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="min-h-[350px] bg-bg2/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center text-center p-12">
                    <Heart size={64} className="mx-auto mb-8 text-text-muted opacity-20" />
                    <p className="font-black uppercase tracking-[0.3em] text-[10px] text-text-muted italic">No favorites found</p>
                </Card>
            )}
        </div>
    );

    const renderReviews = () => (
        <div className="space-y-8">
            <h2 className="text-3xl font-black tracking-tighter flex items-center italic uppercase text-text-primary px-2">
                <MessageSquare className="mr-4 text-primary-500" size={32} /> My <span className="text-primary-500 ml-3">Reviews</span>
            </h2>
            {userReviews.length > 0 ? (
                <div className="grid grid-cols-1 gap-8">
                    {userReviews.map((r) => (
                        <Card key={r.id} className="p-10 bg-bg2/40 backdrop-blur-3xl rounded-[2.5rem] border-white/5 shadow-3xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                            <div className="flex justify-between items-start mb-8 relative z-10">
                                <div>
                                    <h4 className="font-black text-2xl uppercase tracking-tighter italic text-primary-500 leading-none">{r.mess_name}</h4>
                                    <div className="flex items-center mt-3 space-x-4">
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted italic">{new Date(r.created_at).toLocaleDateString()}</p>
                                        <span className="w-1 h-1 bg-white/10 rounded-full" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted italic">Review ID: {r.id.substring(0,8)}</p>
                                    </div>
                                </div>
                                <div className="bg-bg3/50 px-5 py-2.5 rounded-2xl text-yellow-500 font-black flex items-center text-sm border border-white/5 shadow-xl italic">
                                    <Star size={16} className="fill-yellow-500 mr-2" /> {r.rating}.0
                                </div>
                            </div>
                            <p className="text-text-secondary italic font-medium text-lg leading-relaxed relative z-10">"{r.comment}"</p>
                            {r.owner_response && (
                                <div className="mt-8 p-8 bg-primary-500/5 rounded-[2rem] border border-primary-500/10 relative z-10">
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-1.5 h-1.5 bg-primary-500 rounded-full animate-pulse" />
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary-500 italic">Owner Response</p>
                                    </div>
                                    <p className="text-sm font-bold italic text-white/90 leading-relaxed">"{r.owner_response}"</p>
                                </div>
                            )}
                        </Card>
                    ))}
                </div>
            ) : (
                <Card className="min-h-[350px] bg-bg2/40 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] flex flex-col items-center justify-center text-center p-12">
                    <MessageSquare size={64} className="mx-auto mb-8 text-text-muted opacity-20" />
                    <p className="font-black uppercase tracking-[0.3em] text-[10px] text-text-muted italic">No reviews found</p>
                </Card>
            )}
        </div>
    );

    const renderSettings = () => (
        <div className="space-y-8">
            <h2 className="text-3xl font-black tracking-tighter flex items-center italic uppercase text-text-primary px-2">
                <Settings className="mr-4 text-primary-500" size={32} /> Account <span className="text-primary-500 ml-3">Settings</span>
            </h2>
            <Card className="p-12 bg-bg2/40 backdrop-blur-3xl rounded-[3rem] border-white/5 shadow-3xl">
                <div className="space-y-10">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted ml-4 italic">User Identity</label>
                            <Input value={user.name} readOnly className="bg-bg3/50 border-white/10 rounded-2xl h-16 px-8 font-black uppercase tracking-widest text-[11px] text-white italic" />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-text-muted ml-4 italic">Email Address</label>
                            <Input value={user.email} readOnly className="bg-bg3/50 border-white/10 rounded-2xl h-16 px-8 font-black uppercase tracking-widest text-[11px] text-white italic" />
                        </div>
                    </div>
                    <div className="pt-10 border-t border-white/5 flex flex-col sm:flex-row gap-6">
                        <Button className="rounded-2xl px-12 h-16 font-black uppercase tracking-widest text-[11px] italic shadow-2xl shadow-primary-500/20 bg-primary-500 hover:bg-primary-600 text-white border-none">Save Changes</Button>
                        <Button variant="outline" className="rounded-2xl px-12 h-16 font-black uppercase tracking-widest text-[11px] italic border-white/10 bg-transparent text-red-500 hover:bg-red-500/5 hover:border-red-500/30" onClick={handleLogout}>Logout</Button>
                    </div>
                </div>
            </Card>
        </div>
    );

    return (
        <Layout>
            <Seo title="My Dashboard" description="Manage your FindMess account and subscriptions." />
            <div className="container mx-auto px-6 py-12 max-w-7xl">
                {/* Profile Header */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-12 p-10 bg-bg2/40 backdrop-blur-3xl rounded-[3rem] border border-white/5 shadow-3xl relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-500/50 to-transparent opacity-30" />
                    <div className="flex flex-col md:flex-row items-center gap-10 relative z-10">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-full bg-bg3/50 flex items-center justify-center border-4 border-white/5 shadow-2xl overflow-hidden group-hover:border-primary-500/30 transition-all duration-500 p-1">
                                {(user as any).profile_image || (user as any).avatar ? (
                                    <img src={(user as any).profile_image || (user as any).avatar} alt={user.name} className="w-full h-full object-cover rounded-full" />
                                ) : (
                                    <div className="w-full h-full rounded-full bg-primary-500/10 flex items-center justify-center">
                                        <UserIcon size={48} className="text-primary-500" />
                                    </div>
                                )}
                            </div>
                            <div className="absolute bottom-2 right-2 w-7 h-7 bg-green-500 border-4 border-bg2 rounded-full shadow-lg shadow-green-500/20"></div>
                        </div>
                        <div className="text-center md:text-left">
                            <h1 className="text-5xl font-heading font-black tracking-tighter italic uppercase text-white mb-2">{user.name}</h1>
                            <p className="text-text-muted font-black uppercase tracking-[0.2em] text-[11px] italic">{user.email}</p>
                            <div className="flex flex-wrap justify-center md:justify-start gap-3 mt-6">
                                <span className="px-5 py-2 bg-primary-500/10 text-primary-500 text-[10px] font-black rounded-xl uppercase tracking-widest border border-primary-500/20 italic">
                                    {user.role} Account
                                </span>
                                {(user as any).google_id && (
                                    <span className="px-5 py-2 bg-blue-500/10 text-blue-400 text-[10px] font-black rounded-xl uppercase tracking-widest flex items-center gap-2 border border-blue-500/20 italic">
                                        <ShieldCheck size={14} /> Verified with Google
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-4 relative z-10">
                        <Button 
                            variant="outline" 
                            size="lg" 
                            className={`rounded-2xl h-16 px-10 shadow-2xl transition-all border border-white/10 font-black uppercase tracking-widest text-[10px] italic ${activeTab === 'settings' ? 'bg-primary-500 text-white border-primary-500 shadow-primary-500/20' : 'bg-transparent text-text-muted hover:bg-white/5'}`}
                            onClick={() => setActiveTab('settings')}
                        >
                            <Settings size={20} className="mr-3" /> Account Settings
                        </Button>
                    </div>
                </div>

                <div className="flex overflow-x-auto pb-6 mb-12 gap-5 scrollbar-hide px-2">
                    {[
                        { id: 'overview', label: 'Dashboard', icon: Calendar },
                        { id: 'favorites', label: 'Favorites', icon: Heart },
                        { id: 'reviews', label: 'Reviews', icon: MessageSquare },
                        { id: 'settings', label: 'Settings', icon: Settings },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as Tab)}
                            className={`flex items-center gap-4 px-10 py-5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap shadow-2xl border-2 italic ${activeTab === tab.id
                                ? 'bg-primary-500 border-primary-500 text-white shadow-primary-500/30 -translate-y-1'
                                : 'bg-bg2/40 backdrop-blur-3xl border-white/5 text-text-muted hover:border-primary-500/30'
                                }`}
                        >
                            <tab.icon size={18} />
                            {tab.label}
                        </button>
                    ))}
                </div>

                <div className="min-h-[400px]">
                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="h-48 bg-bg2/40 backdrop-blur-3xl animate-pulse rounded-[2.5rem] border border-white/5 shadow-3xl"></div>
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
