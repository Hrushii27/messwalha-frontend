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
    Zap,
    X,
    CheckCircle2,
    ArrowRight,
    Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/axiosInstance';
import { useNavigate, Link } from 'react-router-dom';
import Seo from '../components/common/Seo';
import { MessCard } from '../components/mess/MessCard';
import { useEffect } from 'react';

const AddMessPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [subStatus, setSubStatus] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                setLoading(true);
                const [subRes, messRes] = await Promise.all([
                    api.get('/subscriptions/status'),
                    api.get('/messes/my')
                ]);

                if (subRes.data.data) {
                    const status = subRes.data.data.status;
                    const now = new Date();
                    const endDate = status === 'trial' 
                        ? (subRes.data.data.trial_end || subRes.data.data.trial_end_date)
                        : (subRes.data.data.next_billing_date || subRes.data.data.subscription_end);

                    if (endDate && new Date(endDate) < now) {
                        setSubStatus('expired');
                    } else {
                        setSubStatus(status);
                    }
                } else {
                    setSubStatus('none');
                }

                if (messRes.data.data) {
                    navigate('/owner/edit-mess', { replace: true });
                }
            } catch (err) {
                console.error('Failed to check status', err);
            } finally {
                setLoading(false);
            }
        };
        checkStatus();
    }, []);

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        ownerName: '',
        contactNumber: '',
        city: '',
        location: '',
        pricePerMonth: '',
        pricePerWeek: '',
        pricePerDay: '',
        description: '',
        upiId: ''
    });

    // Image states
    const [messImage, setMessImage] = useState<File | null>(null);
    const [menuImages, setMenuImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<{ mess: string | null; menus: string[] }>({
        mess: null,
        menus: []
    });

    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [fetchingSuggestions, setFetchingSuggestions] = useState(false);

    const handleLocationChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setFormData(prev => ({ ...prev, location: val }));
        
        if (val.trim().length >= 3) {
            try {
                setFetchingSuggestions(true);
                const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(val)}&countrycodes=in&limit=5`);
                const data = await res.json();
                setSuggestions(data);
            } catch (err) {
                console.error("Suggestions fetch error:", err);
            } finally {
                setFetchingSuggestions(false);
            }
        } else {
            setSuggestions([]);
        }
    };

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
            alert("Maximum 5 menu images allowed");
            return;
        }
        setMenuImages(prev => [...prev, ...files]);
        setPreviews(prev => ({
            ...prev,
            menus: [...prev.menus, ...files.map(f => URL.createObjectURL(f))]
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
        console.log("FORM STATE:", formData);
        
        // Validation logic
        if (!formData.name || formData.name.trim().length < 3) {
            setError("Mess Name must be at least 3 characters");
            setLoading(false);
            return;
        }
        if (!formData.ownerName || formData.ownerName.trim() === "") {
            setError("Owner name is required");
            setLoading(false);
            return;
        }
        if (!formData.contactNumber || formData.contactNumber.trim() === "") {
            setError("Mobile number is required");
            setLoading(false);
            return;
        }
        if (!/^\d{10}$/.test(formData.contactNumber.trim())) {
            setError("A valid 10-digit Mobile Number is required");
            setLoading(false);
            return;
        }

        try {
            const { uploadToCloudinary } = await import('../utils/cloudinary');
            
            // 1. Upload Mess Image (Main Plate)
            let displayPhotoUrl = null;
            if (messImage) {
                displayPhotoUrl = await uploadToCloudinary(messImage);
            }

            // 2. Upload Menu Images
            const menuImageUrls = [];
            for (const file of menuImages) {
                const url = await uploadToCloudinary(file);
                menuImageUrls.push(url);
            }

            // 3. Prepare Final Payload
            const payload = {
                name: formData.name.trim(),
                ownerName: formData.ownerName.trim(),        // 🔥 MUST
                contactNumber: formData.contactNumber.trim(),// 🔥 MUST
                location: formData.location.trim(),
                city: formData.city.trim(),
                pricePerMonth: Number(formData.pricePerMonth),
                pricePerWeek: Number(formData.pricePerWeek) || 0,
                pricePerDay: Number(formData.pricePerDay) || 0,
                description: formData.description || "",
                upiId: formData.upiId || "",
                veg_nonveg: "Veg", 
                foodType: "veg",
                cuisine: "indian",
                displayPhoto: displayPhotoUrl,
                menuImages: menuImageUrls
            };

            console.log("PAYLOAD:", payload);

            // 4. API Request
            const response = await api.post('/messes', payload);
            console.log("SUCCESS:", response.data);
            
            setSuccess(true);
            setTimeout(() => navigate('/owner/dashboard'), 3000);
        } catch (err: any) {
            console.error('Registration failed:', err);
            const msg = err.response?.data?.message || err.message || "Something went wrong";
            setError(msg);
            alert(`Error: ${msg}`);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
                    <p className="text-text-muted font-black uppercase tracking-widest text-xs italic text-center">Verifying details...</p>
                </div>
            </Layout>
        );
    }

    // The hasMess block was removed as we now redirect directly.


    if (success) {
        return (
            <Layout>
                <div className="min-h-[80vh] flex items-center justify-center">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center space-y-8 p-12 bg-bg2/80 backdrop-blur-3xl rounded-[3rem] border border-white/10 shadow-3xl max-w-lg w-full"
                    >
                        <div className="w-24 h-24 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle2 size={48} className="text-primary-500" />
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-4xl font-black italic tracking-tighter text-text-primary uppercase">Mess Added!</h2>
                            <p className="text-text-muted font-black uppercase tracking-widest text-[10px] italic">Your mess has been added successfully. Redirecting to your dashboard...</p>
                        </div>
                    </motion.div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <Seo
                title="Register Your Mess | FindMess"
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

            <div className="bg-bg py-32 relative overflow-hidden">
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-6xl md:text-8xl font-black tracking-tighter text-white italic"
                    >
                        Join the <span className="text-primary-500">Best</span> Network
                    </motion.h1>
                    <p className="text-text-muted font-black uppercase tracking-[0.4em] text-[10px] md:text-xs italic">Add your mess to FindMess</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-24">
                <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
                    <motion.form
                        initial={{ y: 40, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        onSubmit={handleSubmit}
                        className="lg:col-span-2 space-y-12"
                    >
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-6 rounded-2xl text-xs font-black uppercase tracking-widest">
                            {error}
                        </div>
                    )}

                    {/* Section 1: Basic Details */}
                    <Card className="p-12 space-y-10 bg-bg2/40 backdrop-blur-3xl border-white/10 rounded-[3rem]">
                        <div className="flex items-center gap-4 text-primary-500">
                            <Utensils size={24} />
                            <h3 className="text-xl font-black uppercase tracking-widest italic">Basic Details</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label htmlFor="name" className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-2">Mess Name</label>
                                <div className="relative group">
                                    <Utensils size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-primary-500" />
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        autoComplete="organization"
                                        required
                                        placeholder="E.G. SAI DARBAR MESS"
                                        className="w-full bg-bg3/30 border border-white/10 text-text-primary pl-14 pr-6 py-5 rounded-2xl focus:ring-2 focus:ring-primary-500/50 outline-none transition-all font-black tracking-widest text-[10px] uppercase italic"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label htmlFor="ownerName" className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-2">Owner Name (Mandatory)</label>
                                <div className="relative group">
                                    <User size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-primary-500" />
                                    <input
                                        type="text"
                                        id="ownerName"
                                        name="ownerName"
                                        autoComplete="name"
                                        required
                                        placeholder="FULL NAME"
                                        className="w-full bg-bg3/30 border border-white/10 text-text-primary pl-14 pr-6 py-5 rounded-2xl focus:ring-2 focus:ring-primary-500/50 outline-none transition-all font-black tracking-widest text-[10px] uppercase italic"
                                        value={formData.ownerName}
                                        onChange={(e) => setFormData(prev => ({ ...prev, ownerName: e.target.value }))}
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label htmlFor="contactNumber" className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-2">Mobile Number (Mandatory)</label>
                                <div className="relative group">
                                    <Phone size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-primary-500" />
                                    <input
                                        type="tel"
                                        id="contactNumber"
                                        name="contactNumber"
                                        autoComplete="tel"
                                        required
                                        placeholder="10 DIGIT NUMBER"
                                        className="w-full bg-bg3/30 border border-white/10 text-text-primary pl-14 pr-6 py-5 rounded-2xl focus:ring-2 focus:ring-primary-500/50 outline-none transition-all font-black tracking-widest text-[10px] uppercase italic"
                                        value={formData.contactNumber}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label htmlFor="city" className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-2">City</label>
                                <div className="relative group">
                                    <MapPin size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-primary-500" />
                                    <input
                                        type="text"
                                        id="city"
                                        name="city"
                                        autoComplete="address-level2"
                                        required
                                        placeholder="E.G. PUNE"
                                        className="w-full bg-bg3/30 border border-white/10 text-text-primary pl-14 pr-6 py-5 rounded-2xl focus:ring-2 focus:ring-primary-500/50 outline-none transition-all font-black tracking-widest text-[10px] uppercase italic"
                                        value={formData.city}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            <div className="space-y-3 md:col-span-2">
                                <label htmlFor="location" className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-2">Mess Address / Location</label>
                                <div className="relative group">
                                    <MapPin size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-primary-500" />
                                    <input
                                        type="text"
                                        id="location"
                                        name="location"
                                        autoComplete="street-address"
                                        required
                                        placeholder="AREA / NEAR COLLEGE"
                                        className="w-full bg-bg3/30 border border-white/10 text-text-primary pl-14 pr-6 py-5 rounded-2xl focus:ring-2 focus:ring-primary-500/50 outline-none transition-all font-black tracking-widest text-[10px] uppercase italic"
                                        value={formData.location}
                                        onChange={handleLocationChange}
                                    />
                                    {fetchingSuggestions && (
                                        <div className="absolute right-6 top-1/2 -translate-y-1/2 z-10">
                                            <Loader2 className="w-4 h-4 text-primary-500 animate-spin" />
                                        </div>
                                    )}
                                    {suggestions.length > 0 && (
                                        <div className="absolute left-0 right-0 top-full mt-2 bg-bg2 border border-white/10 rounded-2xl shadow-3xl overflow-hidden z-50 divide-y divide-white/5">
                                            {suggestions.map((sug, idx) => (
                                                <div
                                                    key={idx}
                                                    onClick={() => {
                                                        let city = '';
                                                        const parts = sug.display_name.split(',');
                                                        const knownCities = ['kolhapur', 'pune', 'mumbai', 'goa', 'nashik'];
                                                        for (const part of parts) {
                                                            const p = part.trim().toLowerCase();
                                                            if (knownCities.includes(p)) {
                                                                city = part.trim();
                                                                break;
                                                            }
                                                        }
                                                        if (!city && parts.length > 2) {
                                                            city = parts[parts.length - 3]?.trim() || '';
                                                        }
                                                        
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            location: sug.display_name,
                                                            city: city || prev.city
                                                        }));
                                                        setSuggestions([]);
                                                    }}
                                                    className="px-6 py-4 hover:bg-primary-500/20 cursor-pointer transition-colors text-text-primary text-[9px] font-black uppercase tracking-widest italic"
                                                >
                                                    {sug.display_name}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Section 2: Pricing */}
                    <Card className="p-12 space-y-10 bg-bg-section dark:bg-white/5 backdrop-blur-3xl border-border-color dark:border-white/10 rounded-[3rem]">
                        <div className="flex items-center gap-4 text-primary-500">
                            <IndianRupee size={24} />
                            <h3 className="text-xl font-black uppercase tracking-widest italic">Pricing Details</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            <div className="space-y-3">
                                <label htmlFor="pricePerMonth" className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-2">Cost Per Month</label>
                                <div className="relative group">
                                    <IndianRupee size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-primary-500" />
                                    <input
                                        type="number"
                                        id="pricePerMonth"
                                        name="pricePerMonth"
                                        autoComplete="off"
                                        required
                                        placeholder="₹ 3000"
                                        className="w-full bg-bg3/30 border border-white/10 text-text-primary pl-14 pr-6 py-5 rounded-2xl focus:ring-2 focus:ring-primary-500/50 outline-none transition-all font-black tracking-widest text-[10px] uppercase italic"
                                        value={formData.pricePerMonth}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                             <div className="space-y-3">
                                <label htmlFor="pricePerWeek" className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-2">Cost Per Week</label>
                                <div className="relative group">
                                    <IndianRupee size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-primary-500" />
                                    <input
                                        type="number"
                                        id="pricePerWeek"
                                        name="pricePerWeek"
                                        autoComplete="off"
                                        required
                                        placeholder="₹ 800"
                                        className="w-full bg-bg3/30 border border-white/10 text-text-primary pl-14 pr-6 py-5 rounded-2xl focus:ring-2 focus:ring-primary-500/50 outline-none transition-all font-black tracking-widest text-[10px] uppercase italic"
                                        value={formData.pricePerWeek}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            <div className="space-y-3">
                                <label htmlFor="pricePerDay" className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-2">Cost Per Day</label>
                                <div className="relative group">
                                    <IndianRupee size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-primary-500" />
                                    <input
                                        type="number"
                                        id="pricePerDay"
                                        name="pricePerDay"
                                        autoComplete="off"
                                        required
                                        placeholder="₹ 120"
                                        className="w-full bg-bg3/30 border border-white/10 text-text-primary pl-14 pr-6 py-5 rounded-2xl focus:ring-2 focus:ring-primary-500/50 outline-none transition-all font-black tracking-widest text-[10px] uppercase italic"
                                        value={formData.pricePerDay}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                            {/* UPI ID Field */}
                            <div className="space-y-3 md:col-span-3">
                                <label htmlFor="upiId" className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-2">UPI ID for Payments (For Students to pay you)</label>
                                <div className="relative group">
                                    <Zap size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-primary-500" />
                                    <input
                                        type="text"
                                        id="upiId"
                                        name="upiId"
                                        autoComplete="off"
                                        placeholder="e.g. 9876543210@paytm"
                                        className="w-full bg-bg3/30 border border-white/10 text-text-primary pl-14 pr-6 py-5 rounded-2xl focus:ring-2 focus:ring-primary-500/50 outline-none transition-all font-black tracking-widest text-[10px] uppercase italic"
                                        value={formData.upiId}
                                        onChange={handleInputChange}
                                    />
                                </div>
                            </div>
                        </div>
                    </Card>

                    {/* Section 3: Menu & Photos */}
                    <Card className="p-12 space-y-12 bg-bg-section dark:bg-white/5 backdrop-blur-3xl border-border-color dark:border-white/10 rounded-[4rem]">
                        <div className="flex items-center gap-4 text-primary-500">
                            <FileText size={24} />
                            <h3 className="text-xl font-black uppercase tracking-widest italic">Menu & Media</h3>
                        </div>

                        <div className="space-y-12">
                            {/* Text Menu */}
                             <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label htmlFor="description" className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-2">Menu Description (Optional)</label>
                                    <span className="text-[8px] font-black uppercase tracking-widest text-primary-500/60 bg-primary-500/5 px-3 py-1 rounded-full border border-primary-500/10 italic">Text Option</span>
                                </div>
                                <textarea
                                    id="description"
                                    name="description"
                                    autoComplete="off"
                                    placeholder="MONDAY: POHA, DAL RICE..."
                                    rows={4}
                                    className="w-full bg-bg3/30 border border-white/10 text-text-primary px-8 py-6 rounded-3xl focus:ring-2 focus:ring-primary-500/50 outline-none transition-all font-black tracking-widest text-[10px] uppercase italic"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                />
                            </div>

                            {/* Main Image */}
                            <div className="space-y-6">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted dark:text-white/70 ml-2">Mess Display Photo (Plate Image)</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div
                                        onClick={() => document.getElementById('messImageInput')?.click()}
                                        className="h-64 border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center gap-4 hover:border-primary-500/50 hover:bg-bg3/30 cursor-pointer transition-all group overflow-hidden relative"
                                    >
                                        {previews.mess ? (
                                            <img src={previews.mess} alt="Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <>
                                                <Upload size={32} className="text-text-muted group-hover:text-primary-500 transition-colors" />
                                                <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">Click to Upload</span>
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
                                            <h4 className="text-[10px] font-black uppercase tracking-widest">Main Photo {messImage && "✅"}</h4>
                                        </div>
                                        <p className="text-[10px] font-medium leading-relaxed text-text-muted dark:text-white/30 italic">
                                            This will be the first image students see when browsing. We recommend a clear photo of your special meal plate.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Menu Images */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted dark:text-text-muted ml-2">Gallery / Menu Board Photos (Max 5)</label>
                                    <span className="text-[8px] font-black uppercase tracking-widest text-primary-500/60 bg-primary-500/5 px-3 py-1 rounded-full border border-primary-500/10 italic">Image Option</span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6">
                                    {previews.menus.map((url, idx) => (
                                        <div key={idx} className="aspect-square relative group rounded-2xl overflow-hidden border border-white/10">
                                            <img src={url} alt="Menu" className="w-full h-full object-cover" />
                                            <button 
                                                type="button"
                                                onClick={() => removeMenuImage(idx)}
                                                className="absolute inset-0 bg-red-500/80 items-center justify-center hidden group-hover:flex"
                                            >
                                                <X className="text-white" />
                                            </button>
                                        </div>
                                    ))}
                                    {menuImages.length < 5 && (
                                        <div
                                            onClick={() => document.getElementById('menuImagesInput')?.click()}
                                            className="aspect-square border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-primary-500/50 hover:bg-bg3/30 cursor-pointer transition-all group"
                                        >
                                            <Upload size={20} className="text-text-muted group-hover:text-primary-500" />
                                            <span className="text-[8px] font-black uppercase tracking-widest text-text-muted">Add</span>
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
                                    Submit Mess Details
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </Button>
                    </div>
                </motion.form>

                {/* Live Preview Sidebar */}
                <div className="lg:col-span-1 lg:sticky lg:top-32 space-y-6 bg-bg2/50 p-8 rounded-[2rem] border border-white/10 backdrop-blur-2xl">
                    <div className="flex items-center justify-between">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-text-primary italic">Live Card Preview</h3>
                        <span className="text-[8px] font-black uppercase tracking-widest text-green-500 bg-green-500/10 px-3 py-1 rounded-full border border-green-500/20 animate-pulse">Real-Time</span>
                    </div>
                    <div className="w-full max-w-sm mx-auto">
                        <MessCard mess={{
                            id: 'preview',
                            name: formData.name || 'Your Premium Mess',
                            description: formData.description || 'Excellent quality food with authentic taste and hygienic preparation.',
                            address: formData.location || 'Your Mess Address',
                            rating: 4.5,
                            imageUrl: previews.mess || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
                            monthlyPrice: Number(formData.pricePerMonth) || 2500,
                            verified: true,
                            cuisine: 'Indian'
                        }} />
                    </div>
                </div>
            </div>
            </div>
        </Layout>
    );
};

export default AddMessPage;
