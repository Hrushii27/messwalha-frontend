import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import {
    User, Mail, Phone, Calendar, Camera, ShieldCheck,
    Save, ArrowLeft, CircleCheck, Clock, Smartphone,
    LogOut, Trash2, Key, History, Edit3, UserCheck,
    Zap, ExternalLink
} from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import type { RootState } from '../../store';
import Seo from '../components/common/Seo';
import { motion, AnimatePresence } from 'framer-motion';
import api, { getImageUrl } from '../api/axiosInstance';
import { updateAuthUser } from '../../store/slices/authSlice';
import type { Activity } from '../types/mess';
import { AxiosError } from 'axios';

type ActiveTab = 'personal' | 'security' | 'activity';

const ProfilePage: React.FC = () => {
    const { user } = useAppSelector((state: RootState) => state.auth);
    const dispatch = useAppDispatch();
    const [activeTab, setActiveTab] = useState<ActiveTab>('personal');
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
    });
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [activities, setActivities] = useState<Activity[]>([]);
    const [loadingActivities, setLoadingActivities] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    const fetchProfile = useCallback(async () => {
        try {
            const response = await api.get('/users/profile');
            if (response.data.success) {
                const userData = response.data.user;
                dispatch(updateAuthUser(userData));
                setFormData({
                    name: userData.name || '',
                    phone: userData.phone || '',
                });
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        }
    }, [dispatch]);

    const fetchActivity = useCallback(async () => {
        setLoadingActivities(true);
        try {
            const response = await api.get('/users/activity');
            setActivities(response.data.data);
        } catch (error) { // Changed 'err' to 'error' for consistency and removed 'toast.error' as it's not imported
            console.error('Error fetching activity:', error);
        } finally {
            setLoadingActivities(false);
        }
    }, []);

    useEffect(() => {
        fetchProfile();
    }, [fetchProfile]);

    useEffect(() => {
        if (activeTab === 'activity') {
            fetchActivity();
        }
    }, [activeTab, fetchActivity]);

    const handleSave = async () => {
        try {
            const response = await api.put('/users/profile', formData);
            if (response.data.success) {
                dispatch(updateAuthUser(response.data.user));
                setMessage({ type: 'success', text: 'Profile updated successfully!' });
                setIsEditing(false);
            }
        } catch (err) {
            const error = err as { response?: { data?: { message?: string } } };
            setMessage({ type: 'error', text: error.response?.data?.message || 'Update failed' });
        }
    };

    const handlePasswordChange = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return setMessage({ type: 'error', text: 'Passwords do not match' });
        }
        try {
            await api.post('/users/change-password', passwordData);
            setMessage({ type: 'success', text: 'Password changed successfully!' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            const error = err as AxiosError<{ message: string }>;
            setMessage({ type: 'error', text: error.response?.data?.message || 'Password change failed' });
        }
    };

    const triggerAvatarUpload = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e: Event) => {
            const target = e.target as HTMLInputElement;
            const file = target.files?.[0];
            if (file) {
                const formData = new FormData();
                formData.append('avatar', file);
                try {
                    const response = await api.post('/users/upload-avatar', formData, {
                        headers: { 'Content-Type': 'multipart/form-data' }
                    });
                    if (response.data.success) {
                        const newAvatar = response.data.profile_image;
                        // Update profile with new image path
                        const updateRes = await api.put('/users/profile', {
                            name: user?.name,
                            phone: user?.phone,
                            profile_image: newAvatar
                        });
                        if (updateRes.data.success) {
                            dispatch(updateAuthUser(updateRes.data.user));
                            setMessage({ type: 'success', text: 'Avatar updated!' });
                        }
                    }
                } catch (error) {
                    console.error('Upload failed:', error);
                    setMessage({ type: 'error', text: 'Upload failed' });
                }
            }
        };
        input.click();
    };

    // Calculate profile completion
    const completionPercentage = (() => {
        let score = 0;
        if (user?.name) score += 25;
        if (user?.email) score += 25;
        if (user?.phone) score += 25;
        if (user?.profile_image) score += 25;
        return score;
    })();

    const joinDate = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', {
        month: 'long',
        year: 'numeric'
    }) : 'March 2026';

    return (
        <Layout>
            <Seo
                title="Profile Discovery | MessWalha Dashboard"
                description="Manage your professional mess subscription profile"
            />

            <div className="min-h-screen bg-[#0f172a] relative overflow-hidden pt-32 pb-24">
                {/* Futuristic Background Elements */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary-500/10 rounded-full blur-[150px] -mr-64 -mt-64 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] -ml-64 -mb-64 pointer-events-none" />
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />

                <div className="container mx-auto px-4 relative z-10">
                    {/* Header Breadcrumb */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                        <motion.button
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            onClick={() => window.history.back()}
                            className="flex items-center text-white/40 hover:text-primary-500 transition-all font-black uppercase tracking-[0.3em] text-[10px] group"
                        >
                            <ArrowLeft size={16} className="mr-3 group-hover:-translate-x-2 transition-transform" />
                            Discover Dashboard
                        </motion.button>

                        <AnimatePresence>
                            {message.text && (
                                <motion.div
                                    initial={{ y: -20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -20, opacity: 0 }}
                                    className={`px-6 py-3 rounded-2xl border ${message.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-500' : 'bg-red-500/10 border-red-500/20 text-red-500'} text-[10px] font-black uppercase tracking-widest`}
                                >
                                    {message.text}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Sidebar Column */}
                        <div className="lg:col-span-4 space-y-8">
                            <motion.div
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                            >
                                <Card className="bg-white/5 backdrop-blur-3xl border-white/10 p-10 rounded-[3rem] shadow-3xl relative overflow-hidden text-center group">
                                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary-500 to-indigo-600" />

                                    <div className="relative inline-block mb-10">
                                        <div className="w-40 h-40 rounded-[2.5rem] bg-gradient-to-br from-primary-500 to-indigo-600 p-1 shadow-2xl shadow-primary-500/20">
                                            <div className="w-full h-full rounded-[2.3rem] overflow-hidden bg-dark-900 flex items-center justify-center">
                                                {user?.profile_image ? (
                                                    <img src={getImageUrl(user.profile_image)} alt={user.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-6xl font-black text-white italic">{user?.name?.charAt(0)}</span>
                                                )}
                                            </div>
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.1 }}
                                            whileTap={{ scale: 0.9 }}
                                            onClick={triggerAvatarUpload}
                                            className="absolute bottom-0 right-0 p-4 bg-white dark:bg-dark-900 rounded-[1.5rem] shadow-2xl text-primary-500 hover:text-white hover:bg-primary-500 transition-all border border-white/10"
                                        >
                                            <Camera size={20} />
                                        </motion.button>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <h2 className="text-3xl font-black tracking-tighter text-white italic truncate">{user?.name}</h2>
                                            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary-500">
                                                {user?.role === 'OWNER' ? 'Mess Partner' : 'User Account'}
                                            </p>
                                        </div>

                                        <div className="flex flex-col items-center gap-3 pt-6">
                                            <div className="flex items-center gap-2 px-4 py-2 bg-indigo-500/10 rounded-full border border-indigo-500/20">
                                                <UserCheck size={14} className="text-indigo-400" />
                                                <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Verified User</span>
                                            </div>
                                            <div className="flex items-center gap-2 px-4 py-2 bg-primary-500/10 rounded-full border border-primary-500/20">
                                                <Zap size={14} className="text-primary-500" />
                                                <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest">Active Subscription</span>
                                            </div>
                                        </div>

                                        <div className="pt-8 space-y-4 border-t border-white/5">
                                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-white/40">
                                                <span>Profile Completion</span>
                                                <span>{completionPercentage}%</span>
                                            </div>
                                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden p-[2px]">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${completionPercentage}%` }}
                                                    className="h-full bg-gradient-to-r from-primary-500 to-indigo-600 rounded-full shadow-[0_0_15px_rgba(255,100,0,0.4)]"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-6 text-[10px] font-black uppercase tracking-widest text-white/30">
                                            <span className="flex items-center gap-2"><Calendar size={12} /> Joined: {joinDate}</span>
                                            <span className="flex items-center gap-2"><Clock size={12} /> 12:45 PM</span>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>

                            <motion.div
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="space-y-2"
                            >
                                {[
                                    { id: 'personal', icon: User, label: 'Profile Information' },
                                    { id: 'security', icon: ShieldCheck, label: 'Security' },
                                    { id: 'activity', icon: History, label: 'Activity' }
                                ].map(tab => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id as ActiveTab)}
                                        className={`w-full flex items-center justify-between px-8 py-5 rounded-[2rem] transition-all duration-500 font-black uppercase tracking-widest text-[10px] border ${activeTab === tab.id ? 'bg-primary-500 border-primary-400 text-white shadow-3xl shadow-primary-500/30' : 'bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:text-white'}`}
                                    >
                                        <div className="flex items-center gap-4">
                                            <tab.icon size={18} />
                                            <span>{tab.label}</span>
                                        </div>
                                        <ArrowLeft size={16} className="rotate-180 opacity-40" />
                                    </button>
                                ))}
                            </motion.div>
                        </div>

                        {/* Main Content Column */}
                        <div className="lg:col-span-8">
                            <motion.div
                                key={activeTab}
                                initial={{ x: 20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ duration: 0.4 }}
                            >
                                <Card className="bg-white/5 backdrop-blur-3xl border-white/10 p-10 md:p-16 rounded-[3rem] shadow-3xl">
                                    <AnimatePresence mode="wait">
                                        {activeTab === 'personal' && (
                                            <motion.div
                                                key="personal-tab"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="space-y-12"
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div>
                                                        <h3 className="text-4xl font-black text-white italic tracking-tighter">Profile <span className="text-primary-500">Information</span></h3>
                                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 mt-2">View and update your profile details</p>
                                                    </div>
                                                    {!isEditing && (
                                                        <Button
                                                            variant="outline"
                                                            onClick={() => setIsEditing(true)}
                                                            className="rounded-full px-10 h-16 border-white/10 hover:bg-white/5 font-black uppercase tracking-widest text-[10px]"
                                                        >
                                                            <Edit3 size={18} className="mr-3" /> Edit Profile
                                                        </Button>
                                                    )}
                                                </div>

                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                                    {[
                                                        { label: 'Full Name', key: 'name', icon: User, placeholder: 'Enter Name' },
                                                        { label: 'Email Address', key: 'email', icon: Mail, disabled: true },
                                                        { label: 'Phone Number', key: 'phone', icon: Phone, placeholder: '+91 XXXXX XXXXX' },
                                                        { label: 'Join Date', key: 'joined', icon: Calendar, disabled: true, value: joinDate }
                                                    ].map((field) => (
                                                        <div key={field.key} className="space-y-4">
                                                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30 ml-2">{field.label}</label>
                                                            <div className="relative group">
                                                                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-primary-500 z-10">
                                                                    <field.icon size={18} />
                                                                </div>
                                                                <input
                                                                    type="text"
                                                                    disabled={field.disabled || !isEditing}
                                                                    value={field.value || (field.key === 'email' ? user?.email : (formData as Record<string, string>)[field.key])}
                                                                    onChange={e => setFormData({ ...formData, [field.key]: e.target.value })}
                                                                    placeholder={field.placeholder}
                                                                    className="w-full bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[2rem] pl-16 pr-8 py-5 text-white font-black uppercase tracking-widest text-[10px] focus:ring-2 focus:ring-primary-500/40 focus:bg-white/[0.07] outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed group-hover:border-white/20"
                                                                />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                {isEditing && (
                                                    <motion.div
                                                        initial={{ y: 20, opacity: 0 }}
                                                        animate={{ y: 0, opacity: 1 }}
                                                        className="flex flex-col sm:flex-row gap-4 pt-10 border-t border-white/5"
                                                    >
                                                        <button
                                                            onClick={handleSave}
                                                            className="flex-1 h-20 bg-gradient-to-r from-primary-500 to-primary-600 rounded-[2rem] text-white font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-primary-500/40 hover:scale-[1.02] transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
                                                        >
                                                            <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                                                            <Save size={20} /> Save Changes
                                                        </button>
                                                        <button
                                                            onClick={() => setIsEditing(false)}
                                                            className="flex-1 h-20 bg-white/5 border border-white/10 rounded-[2rem] text-white/50 font-black uppercase tracking-[0.2em] text-xs hover:text-white hover:bg-white/10 transition-all flex items-center justify-center gap-3"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </motion.div>
                                                )}

                                                <div className="p-10 bg-indigo-500/5 rounded-[2.5rem] border border-indigo-500/10 space-y-4">
                                                    <div className="flex items-center gap-4 text-indigo-400">
                                                        <CircleCheck size={20} />
                                                        <span className="text-xs font-black uppercase tracking-widest italic">Compliance Status: Fully Aligned</span>
                                                    </div>
                                                    <p className="text-[10px] text-white/30 font-medium leading-relaxed italic">
                                                        Your data is encrypted using 256-bit AES protocols and stored across decentralized nodes for maximum privacy and resilience.
                                                    </p>
                                                </div>
                                            </motion.div>
                                        )}

                                        {activeTab === 'security' && (
                                            <motion.div
                                                key="security-tab"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="space-y-12"
                                            >
                                                <div className="space-y-2">
                                                    <h3 className="text-4xl font-black text-white italic tracking-tighter">Security <span className="text-primary-500">Fortress</span></h3>
                                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Protocol management and access control</p>
                                                </div>

                                                <div className="grid grid-cols-1 gap-10">
                                                    <div className="space-y-8 p-10 bg-white/5 rounded-[2.5rem] border border-white/5">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-12 h-12 rounded-2xl bg-primary-500/20 flex items-center justify-center text-primary-500">
                                                                <Key size={24} />
                                                            </div>
                                                            <h4 className="text-xl font-black text-white italic tracking-tight">Credential Rotation</h4>
                                                        </div>
                                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                                            {[
                                                                { label: 'Current Key', key: 'currentPassword', type: 'password' },
                                                                { label: 'New Key', key: 'newPassword', type: 'password' },
                                                                { label: 'Confirm Key', key: 'confirmPassword', type: 'password' }
                                                            ].map(p => (
                                                                <div key={p.key} className="space-y-3">
                                                                    <label className="text-[9px] font-black uppercase text-white/30 ml-2 tracking-widest">{p.label}</label>
                                                                    <input
                                                                        type={p.type}
                                                                        value={(passwordData as Record<string, string>)[p.key]}
                                                                        onChange={e => setPasswordData({ ...passwordData, [p.key]: e.target.value })}
                                                                        className="w-full bg-dark-900 border border-white/10 rounded-2xl px-6 py-4 text-white text-xs font-black focus:ring-1 focus:ring-primary-500 outline-none transition-all"
                                                                        placeholder="••••••••"
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <Button
                                                            onClick={handlePasswordChange}
                                                            className="w-full h-16 rounded-[1.5rem] bg-gradient-to-r from-primary-500 to-indigo-600 font-black uppercase tracking-widest text-[10px]"
                                                        >
                                                            Update Credential Protocol
                                                        </Button>
                                                    </div>

                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                                        <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 space-y-6">
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-4">
                                                                    <Smartphone size={24} className="text-indigo-400" />
                                                                    <h5 className="text-sm font-black text-white uppercase tracking-widest">2-Factor Auth</h5>
                                                                </div>
                                                                <div className="w-12 h-6 bg-white/10 rounded-full relative cursor-pointer">
                                                                    <div className="absolute left-1 top-1 w-4 h-4 bg-white/30 rounded-full" />
                                                                </div>
                                                            </div>
                                                            <p className="text-[10px] text-white/30 font-medium italic">Add an extra layer of defense to your account using biometric or SMS codes.</p>
                                                        </div>

                                                        <div className="p-8 bg-white/5 rounded-[2.5rem] border border-white/5 space-y-6">
                                                            <div className="flex items-center gap-4">
                                                                <LogOut size={24} className="text-white/40" />
                                                                <h5 className="text-sm font-black text-white uppercase tracking-widest">Active Sessions</h5>
                                                            </div>
                                                            <div className="flex items-center justify-between">
                                                                <span className="text-[10px] font-black text-white/30 italic">currently 1 active terminal</span>
                                                                <button className="text-[9px] font-black text-primary-500 uppercase tracking-widest">Wipe All</button>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <button className="flex items-center justify-center gap-3 p-8 border border-red-500/20 rounded-[2.5rem] hover:bg-red-500/5 transition-all text-red-500 group">
                                                        <Trash2 size={20} className="group-hover:rotate-12 transition-transform" />
                                                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Decommission Account Registry</span>
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}

                                        {activeTab === 'activity' && (
                                            <motion.div
                                                key="activity-tab"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="space-y-12"
                                            >
                                                <div className="flex justify-between items-center">
                                                    <div className="space-y-2">
                                                        <h3 className="text-4xl font-black text-white italic tracking-tighter">Activity <span className="text-primary-500">Chronicle</span></h3>
                                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">Historical registry of your interactions</p>
                                                    </div>
                                                    <button
                                                        onClick={fetchActivity}
                                                        className="p-4 bg-white/5 rounded-2xl hover:bg-white/10 text-white/40 hover:text-white transition-all"
                                                    >
                                                        <History size={20} className={loadingActivities ? 'animate-spin' : ''} />
                                                    </button>
                                                </div>

                                                <div className="space-y-8">
                                                    {activities.map((act, i) => (
                                                        <div key={act.id} className="relative pl-12 group">
                                                            {i !== activities.length - 1 && (
                                                                <div className="absolute left-6 top-10 w-[2px] h-20 bg-white/5 group-hover:bg-primary-500/20 transition-colors" />
                                                            )}
                                                            <div className="absolute left-0 top-0 w-12 h-12 bg-dark-900 border-2 border-white/5 rounded-2xl flex items-center justify-center text-primary-500 z-10 group-hover:border-primary-500/30 transition-all group-hover:scale-110">
                                                                {act.title.includes('LOGIN') ? <Zap size={20} /> : <User size={20} />}
                                                            </div>
                                                            <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2.5rem] space-y-3 group-hover:bg-white/[0.04] group-hover:border-white/10 transition-all">
                                                                <div className="flex justify-between items-center">
                                                                    <p className="text-[10px] font-black uppercase tracking-widest text-primary-500">{act.title}</p>
                                                                    <p className="text-[10px] text-white/20 font-medium italic">{act.created_at ? new Date(act.created_at).toLocaleString() : act.time}</p>
                                                                </div>
                                                                <p className="text-xl font-black text-white tracking-tight italic">"{act.desc}"</p>
                                                                <div className="flex items-center gap-3 pt-2 text-white/30">
                                                                    <span className="text-[9px] font-black uppercase tracking-widest">Protocol Version: 1.0.4</span>
                                                                    <ExternalLink size={12} className="opacity-40" />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </Card>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default ProfilePage;
