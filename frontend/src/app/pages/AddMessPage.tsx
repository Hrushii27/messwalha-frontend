import React, { useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import {
    Utensils,
    MapPin,
    Phone,
    User,
    IndianRupee,
    FileText,
    Image as ImageIcon,
    Upload,
    X,
    CheckCircle2,
    ArrowRight,
    Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/axiosInstance';
import { useNavigate, Link } from 'react-router-dom';
import Seo from '../components/common/Seo';
import { useEffect } from 'react';

const AddMessPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [subStatus, setSubStatus] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const checkSub = async () => {
            try {
                const res = await api.get('/subscriptions/status');
                if (res.data.data) {
                    const status = res.data.data.status;
                    // Check if trial/active date is actually valid
                    const now = new Date();
                    const end = status === 'trial' ? new Date(res.data.data.trial_end_date) : new Date(res.data.data.subscription_end);

                    if (end < now) {
                        setSubStatus('expired');
                    } else {
                        setSubStatus(status);
                    }
                } else {
                    setSubStatus('none');
                }
            } catch (err) {
                console.error('Failed to check subscription', err);
            } finally {
                // Done check
            }
        };
        checkSub();
    }, []);

    // Form State
    const [formData, setFormData] = useState({
        messName: '',
        ownerName: '',
        mobile: '',
        address: '',
        pricePerMonth: '',
        pricePerWeek: '',
        pricePerDay: '',
        menuText: ''
    });

    const [messImage, setMessImage] = useState<File | null>(null);
    const [menuImages, setMenuImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<{ mess: string | null; menus: string[] }>({
        mess: null,
        menus: []
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleMessImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setMessImage(file);
            setPreviews(prev => ({ ...prev, mess: URL.createObjectURL(file) }));
        }
    };

    const handleMenuImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length + menuImages.length > 5) {
            alert('Maximum 5 menu images allowed');
            return;
        }
        const newFiles = [...menuImages, ...files];
        setMenuImages(newFiles);
        setPreviews(prev => ({
            ...prev,
            menus: newFiles.map(f => URL.createObjectURL(f))
        }));
    };

    const removeMenuImage = (index: number) => {
        const newFiles = [...menuImages];
        newFiles.splice(index, 1);
        setMenuImages(newFiles);
        setPreviews(prev => ({
            ...prev,
            menus: newFiles.map(f => URL.createObjectURL(f))
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            data.append(key, value);
        });

        if (messImage) {
            data.append('mess_image', messImage);
        }
        menuImages.forEach(file => {
            data.append('menu_images', file);
        });

        try {
            await api.post('/mess', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setSuccess(true);
            setTimeout(() => navigate('/find-mess'), 3000);
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            console.error('Registration failed:', err);
            setError(err.response?.data?.message || 'Failed to register mess. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <Layout>
                <div className="min-h-[80vh] flex items-center justify-center">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center space-y-8 p-12 bg-white/5 backdrop-blur-3xl rounded-[3rem] border border-white/10 shadow-3xl max-w-lg w-full"
                    >
                        <div className="w-24 h-24 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle2 size={48} className="text-primary-500" />
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-4xl font-black italic tracking-tighter text-white uppercase">Mess Registered!</h2>
                            <p className="text-white/40 font-bold uppercase tracking-widest text-xs">Your mess has been added to the network successfully. Redirecting to exploration page...</p>
                        </div>
                    </motion.div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <Seo
                title="Register Your Mess | MessWalha"
                description="Join the elite network of student mess services. Register your mess and reach thousands of students today."
            />

            {subStatus === 'expired' && (
                <div className="bg-red-500 py-4 text-center relative z-50">
                    <p className="text-white font-black uppercase tracking-[0.2em] text-[10px] md:text-xs flex items-center justify-center gap-4">
                        <X size={16} />
                        Your Subscription has expired. Please subscribe to continue publishing.
                        <Link to="/owner/subscribe" className="bg-white text-red-500 px-4 py-1 rounded-full hover:bg-white/90 transition-all font-black">Subscribe Now</Link>
                    </p>
                </div>
            )}

            <div className="grad-dark py-32 relative overflow-hidden">
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-6xl md:text-8xl font-black tracking-tighter text-white italic"
                    >
                        Join the <span className="text-primary-500">Elite</span> Network
                    </motion.h1>
                    <p className="text-white/40 font-black uppercase tracking-[0.4em] text-[10px] md:text-xs">Register your mess service on MessWalha</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-24">
                <motion.form
                    initial={{ y: 40, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    onSubmit={handleSubmit}
                    className="max-w-4xl mx-auto space-y-12"
                >
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-6 rounded-2xl text-xs font-black uppercase tracking-widest">
                            {error}
                        </div>
                    )}

                    {/* Section 1: Basic Details */}
                    <Card className="p-12 space-y-10 bg-white/5 backdrop-blur-3xl border-white/10 rounded-[3rem]">
                        <div className="flex items-center gap-4 text-primary-500">
                            <Utensils size={24} />
                            <h3 className="text-xl font-black uppercase tracking-widest italic">Basic Details</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-2">Mess Name</label>
                                <div className="relative group">
                                    <Utensils size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-primary-500" />
                                    <input
                                        type="text"
                                        name="messName"
                                        required
                                        placeholder="E.G. SAI DARBAR MESS"
                                        className="w-full bg-white/[0.03] border border-white/10 text-white pl-14 pr-6 py-5 rounded-2xl focus:ring-2 focus:ring-primary-500/50 outline-none transition-all font-bold tracking-widest text-xs"
                                        value={formData.messName}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-2">Owner Name</label>
                                <div className="relative group">
                                    <User size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-primary-500" />
                                    <input
                                        type="text"
                                        name="ownerName"
                                        required
                                        placeholder="FULL NAME"
                                        className="w-full bg-white/[0.03] border border-white/10 text-white pl-14 pr-6 py-5 rounded-2xl focus:ring-2 focus:ring-primary-500/50 outline-none transition-all font-bold tracking-widest text-xs"
                                        value={formData.ownerName}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-2">Mobile Number</label>
                                <div className="relative group">
                                    <Phone size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-primary-500" />
                                    <input
                                        type="tel"
                                        name="mobile"
                                        required
                                        placeholder="10 DIGIT NUMBER"
                                        className="w-full bg-white/[0.03] border border-white/10 text-white pl-14 pr-6 py-5 rounded-2xl focus:ring-2 focus:ring-primary-500/50 outline-none transition-all font-bold tracking-widest text-xs"
                                        value={formData.mobile}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-2">Mess Address</label>
                                <div className="relative group">
                                    <MapPin size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-primary-500" />
                                    <input
                                        type="text"
                                        name="address"
                                        required
                                        placeholder="AREA / NEAR COLLEGE"
                                        className="w-full bg-white/[0.03] border border-white/10 text-white pl-14 pr-6 py-5 rounded-2xl focus:ring-2 focus:ring-primary-500/50 outline-none transition-all font-bold tracking-widest text-xs"
                                        value={formData.address}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Section 2: Pricing */}
                    <Card className="p-12 space-y-10 bg-white/5 backdrop-blur-3xl border-white/10 rounded-[3rem]">
                        <div className="flex items-center gap-4 text-primary-500">
                            <IndianRupee size={24} />
                            <h3 className="text-xl font-black uppercase tracking-widest italic">Pricing Details</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-2">Cost Per Month</label>
                                <div className="relative group">
                                    <IndianRupee size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-primary-500" />
                                    <input
                                        type="number"
                                        name="pricePerMonth"
                                        required
                                        placeholder="₹ 3000"
                                        className="w-full bg-white/[0.03] border border-white/10 text-white pl-14 pr-6 py-5 rounded-2xl focus:ring-2 focus:ring-primary-500/50 outline-none transition-all font-bold tracking-widest text-xs"
                                        value={formData.pricePerMonth}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-2">Cost Per Week</label>
                                <div className="relative group">
                                    <IndianRupee size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-primary-500" />
                                    <input
                                        type="number"
                                        name="pricePerWeek"
                                        required
                                        placeholder="₹ 800"
                                        className="w-full bg-white/[0.03] border border-white/10 text-white pl-14 pr-6 py-5 rounded-2xl focus:ring-2 focus:ring-primary-500/50 outline-none transition-all font-bold tracking-widest text-xs"
                                        value={formData.pricePerWeek}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-2">Cost Per Day</label>
                                <div className="relative group">
                                    <IndianRupee size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-primary-500" />
                                    <input
                                        type="number"
                                        name="pricePerDay"
                                        required
                                        placeholder="₹ 120"
                                        className="w-full bg-white/[0.03] border border-white/10 text-white pl-14 pr-6 py-5 rounded-2xl focus:ring-2 focus:ring-primary-500/50 outline-none transition-all font-bold tracking-widest text-xs"
                                        value={formData.pricePerDay}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Section 3: Menu & Photos */}
                    <Card className="p-12 space-y-12 bg-white/5 backdrop-blur-3xl border-white/10 rounded-[4rem]">
                        <div className="flex items-center gap-4 text-primary-500">
                            <FileText size={24} />
                            <h3 className="text-xl font-black uppercase tracking-widest italic">Menu & Media</h3>
                        </div>

                        <div className="space-y-12">
                            {/* Text Menu */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-2">Menu Description (Optional)</label>
                                    <span className="text-[8px] font-black uppercase tracking-widest text-primary-500/60 bg-primary-500/5 px-3 py-1 rounded-full border border-primary-500/10">Text Option</span>
                                </div>
                                <textarea
                                    name="menuText"
                                    placeholder="MONDAY: POHA, DAL RICE..."
                                    rows={4}
                                    className="w-full bg-white/[0.03] border border-white/10 text-white px-8 py-6 rounded-3xl focus:ring-2 focus:ring-primary-500/50 outline-none transition-all font-bold tracking-widest text-xs"
                                    value={formData.menuText}
                                    onChange={handleInputChange}
                                />
                            </div>

                            {/* Main Image */}
                            <div className="space-y-6">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-2">Mess Display Photo (Plate Image)</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div
                                        onClick={() => document.getElementById('messImageInput')?.click()}
                                        className="h-64 border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center gap-4 hover:border-primary-500/50 hover:bg-white/5 cursor-pointer transition-all group overflow-hidden relative"
                                    >
                                        {previews.mess ? (
                                            <img src={previews.mess} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" alt="Preview" />
                                        ) : (
                                            <>
                                                <Upload size={32} className="text-white/10 group-hover:text-primary-500 transition-colors" />
                                                <span className="text-[9px] font-black uppercase tracking-widest text-white/20">Click to Upload</span>
                                            </>
                                        )}
                                        <input
                                            id="messImageInput"
                                            type="file"
                                            hidden
                                            accept="image/*"
                                            onChange={handleMessImageChange}
                                        />
                                    </div>
                                    <div className="flex flex-col justify-center space-y-4 pr-8">
                                        <div className="flex items-center gap-3 text-primary-500">
                                            <ImageIcon size={16} />
                                            <h4 className="text-[10px] font-black uppercase tracking-widest">Main Display Signal</h4>
                                        </div>
                                        <p className="text-[10px] font-medium leading-relaxed text-white/30 italic">
                                            This will be the first image students see when browsing. We recommend a clear photo of your special meal plate.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Menu Images */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-2">Gallery / Menu Board Photos (Max 5)</label>
                                    <span className="text-[8px] font-black uppercase tracking-widest text-primary-500/60 bg-primary-500/5 px-3 py-1 rounded-full border border-primary-500/10">Image Option</span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
                                    {previews.menus.map((url, i) => (
                                        <div key={i} className="aspect-square rounded-2xl overflow-hidden relative group border border-white/10">
                                            <img src={url} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={`Menu ${i}`} />
                                            <button
                                                type="button"
                                                onClick={() => removeMenuImage(i)}
                                                className="absolute top-2 right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    {menuImages.length < 5 && (
                                        <div
                                            onClick={() => document.getElementById('menuImagesInput')?.click()}
                                            className="aspect-square border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-primary-500/50 hover:bg-white/5 cursor-pointer transition-all group"
                                        >
                                            <Upload size={20} className="text-white/10 group-hover:text-primary-500" />
                                            <span className="text-[8px] font-black uppercase tracking-widest text-white/20">Add</span>
                                            <input
                                                id="menuImagesInput"
                                                type="file"
                                                multiple
                                                hidden
                                                accept="image/*"
                                                onChange={handleMenuImagesChange}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>

                    <div className="flex justify-center pt-8">
                        <Button
                            type="submit"
                            size="lg"
                            disabled={loading || subStatus === 'expired'}
                            className="h-24 px-20 rounded-[2rem] bg-primary-500 text-white font-black uppercase tracking-[0.4em] text-sm shadow-3xl shadow-primary-500/40 hover:scale-[1.05] transition-all disabled:opacity-50 flex items-center gap-4"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" />
                            ) : (
                                <>
                                    Submit Mess Registry
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </Button>
                    </div>
                </motion.form>
            </div>
        </Layout>
    );
};

export default AddMessPage;
