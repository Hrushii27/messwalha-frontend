import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import {
    Image as ImageIcon,
    Upload,
    X,
    CheckCircle2,
    ArrowRight,
    Loader2
} from 'lucide-react';
import { motion } from 'framer-motion';
import api from '../api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import Seo from '../components/common/Seo';
import { uploadToCloudinary } from '../utils/cloudinary';
import { getImageUrl } from '../api/axiosInstance';
import { toast } from 'react-hot-toast';

const PhotosPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [messImage, setMessImage] = useState<File | null>(null);
    const [menuImages, setMenuImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<{ mess: string | null; menus: string[] }>({
        mess: null,
        menus: []
    });
    const [existingMessUrl, setExistingMessUrl] = useState<string | null>(null);
    const [existingMenuUrls, setExistingMenuUrls] = useState<string[]>([]);

    useEffect(() => {
        const fetchMessData = async () => {
            try {
                setLoading(true);
                const response = await api.get('/messes/my');
                if (response.data.data) {
                    const mess = response.data.data;
                    if (mess.imageUrl) {
                        setExistingMessUrl(mess.imageUrl);
                        setPreviews(prev => ({ ...prev, mess: getImageUrl(mess.imageUrl) }));
                    }
                    if (mess.menuImages && Array.isArray(mess.menuImages)) {
                        setExistingMenuUrls(mess.menuImages);
                        setPreviews(prev => ({ ...prev, menus: mess.menuImages.map((url: string) => getImageUrl(url)) }));
                    }
                } else {
                    toast.error('Please create a listing first');
                    navigate('/owner-dashboard/add-mess');
                }
            } catch (err) {
                console.error('Failed to fetch mess data', err);
                setError('Failed to load photos');
            } finally {
                setLoading(false);
            }
        };
        fetchMessData();
    }, [navigate]);

    const handleMessImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setMessImage(file);
            setPreviews(prev => ({ ...prev, mess: URL.createObjectURL(file) }));
        }
    };

    const handleMenuImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length + menuImages.length + existingMenuUrls.length > 5) {
            toast.error('Maximum 5 menu images allowed');
            return;
        }
        const newFiles = [...menuImages, ...files];
        setMenuImages(newFiles);
        // Previews should combine existing and new ones
        setPreviews(prev => ({
            ...prev,
            menus: [
                ...existingMenuUrls.map(url => getImageUrl(url)),
                ...newFiles.map(f => URL.createObjectURL(f))
            ]
        }));
    };

    const removeExistingMenuImage = (index: number) => {
        const newExisting = [...existingMenuUrls];
        newExisting.splice(index, 1);
        setExistingMenuUrls(newExisting);
        updatePreviews(newExisting, menuImages);
    };

    const removeNewMenuImage = (index: number) => {
        const newFiles = [...menuImages];
        newFiles.splice(index, 1);
        setMenuImages(newFiles);
        updatePreviews(existingMenuUrls, newFiles);
    };

    const updatePreviews = (existing: string[], newFiles: File[]) => {
        setPreviews(prev => ({
            ...prev,
            menus: [
                ...existing.map(url => getImageUrl(url)),
                ...newFiles.map(f => URL.createObjectURL(f))
            ]
        }));
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);

        try {
            let imageUrl = existingMessUrl;
            if (messImage) {
                imageUrl = await uploadToCloudinary(messImage);
            }

            const menuUrls = [...existingMenuUrls];
            for (const file of menuImages) {
                const url = await uploadToCloudinary(file);
                menuUrls.push(url);
            }

            await api.put('/messes/my', {
                imageUrl,
                menuImages: menuUrls
            });

            setSuccess(true);
            toast.success('Photos updated successfully');
            setTimeout(() => navigate('/owner/dashboard'), 2000);
        } catch (err) {
            console.error('Failed to save photos', err);
            setError('Failed to update photos. Please try again.');
            toast.error('Failed to update photos');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="min-h-[80vh] flex flex-col items-center justify-center space-y-4">
                    <Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
                    <p className="text-text-muted font-black uppercase tracking-widest text-xs italic text-center">Loading Gallery...</p>
                </div>
            </Layout>
        );
    }

    if (success) {
        return (
            <Layout>
                <div className="min-h-[80vh] flex items-center justify-center p-6">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center space-y-8 p-12 bg-bg2/80 backdrop-blur-3xl rounded-[3rem] border border-white/10 shadow-3xl max-w-lg w-full"
                    >
                        <div className="w-24 h-24 bg-primary-500/20 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle2 size={48} className="text-primary-500" />
                        </div>
                        <div className="space-y-4">
                            <h2 className="text-4xl font-black italic tracking-tighter text-text-primary uppercase">Gallery Updated!</h2>
                            <p className="text-text-muted font-black uppercase tracking-widest text-[10px] italic">Your photos have been successfully updated. Redirecting to dashboard...</p>
                        </div>
                    </motion.div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <Seo
                title="Manage Photos | FindMess"
                description="Update your mess photos and menu gallery."
            />

            <div className="bg-bg py-32 relative overflow-hidden">
                <div className="container mx-auto px-4 relative z-10 text-center">
                    <motion.h1
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="text-6xl md:text-8xl font-black tracking-tighter text-white italic"
                    >
                        Manage <span className="text-primary-500">Photos</span>
                    </motion.h1>
                    <p className="text-text-muted font-black uppercase tracking-[0.4em] text-[10px] md:text-xs italic">Show students your best dishes</p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-24">
                <div className="max-w-4xl mx-auto space-y-12">
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-6 rounded-2xl text-xs font-black uppercase tracking-widest">
                            {error}
                        </div>
                    )}

                    <Card className="p-12 space-y-12 bg-bg2/40 backdrop-blur-3xl border-white/10 rounded-[4rem]">
                        <div className="flex items-center gap-4 text-primary-500">
                            <ImageIcon size={24} />
                            <h3 className="text-xl font-black uppercase tracking-widest italic">Mess Gallery</h3>
                        </div>

                        <div className="space-y-12">
                            {/* Main Image */}
                            <div className="space-y-6">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-2">Main Display Photo</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div
                                        onClick={() => document.getElementById('messImageInput')?.click()}
                                        className="h-64 border-2 border-dashed border-white/10 rounded-[2rem] flex flex-col items-center justify-center gap-4 hover:border-primary-500/50 hover:bg-bg3/30 cursor-pointer transition-all group overflow-hidden relative"
                                    >
                                        {previews.mess ? (
                                            <img src={previews.mess} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" alt="Preview" />
                                        ) : (
                                            <>
                                                <Upload size={32} className="text-text-muted group-hover:text-primary-500 transition-colors" />
                                                <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">Click to Upload New Photo</span>
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
                                            <h4 className="text-[10px] font-black uppercase tracking-widest">Update Photo</h4>
                                        </div>
                                        <p className="text-[10px] font-medium leading-relaxed text-text-muted italic">
                                            This is the main image students see. Recommend a clear photo of your best meal.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Menu Images */}
                            <div className="space-y-6">
                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted ml-2">Menu & Food Samples (Max 5)</label>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    {/* Existing Menu Images */}
                                    {existingMenuUrls.map((url, index) => (
                                        <div key={`existing-${index}`} className="aspect-square rounded-2xl border border-white/10 overflow-hidden relative group">
                                            <img src={getImageUrl(url)} className="w-full h-full object-cover" alt={`Menu ${index + 1}`} />
                                            <button
                                                type="button"
                                                onClick={() => removeExistingMenuImage(index)}
                                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    {/* New Menu Images */}
                                    {menuImages.map((file, index) => (
                                        <div key={`new-${index}`} className="aspect-square rounded-2xl border border-dashed border-primary-500/50 overflow-hidden relative group">
                                            <img src={URL.createObjectURL(file)} className="w-full h-full object-cover" alt="New Preview" />
                                            <button
                                                type="button"
                                                onClick={() => removeNewMenuImage(index)}
                                                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    {/* Upload Button */}
                                    {existingMenuUrls.length + menuImages.length < 5 && (
                                        <div
                                            onClick={() => document.getElementById('menuImagesInput')?.click()}
                                            className="aspect-square border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-2 hover:border-primary-500/50 hover:bg-bg3/30 cursor-pointer transition-all"
                                        >
                                            <Upload size={20} className="text-text-muted" />
                                            <span className="text-[8px] font-black uppercase tracking-widest text-text-muted">Add Photo</span>
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

                        <div className="pt-12 border-t border-white/10 flex justify-end">
                            <Button
                                onClick={handleSave}
                                isLoading={saving}
                                size="lg"
                                className="px-16 py-6 rounded-2xl bg-primary-500 text-white font-black uppercase tracking-widest text-xs shadow-3xl shadow-primary-500/20 hover:scale-105 transition-all flex items-center gap-3"
                            >
                                Save Changes
                                <ArrowRight size={18} />
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>
        </Layout>
    );
};

export default PhotosPage;
