import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/common/Card';
import { Trash2, Star, MessageSquare } from 'lucide-react';
import { EmptyState } from '../components/common/EmptyState';
import api from '../api/axiosInstance';
import Seo from '../components/common/Seo';
import { motion } from 'framer-motion';

const MyReviewsPage: React.FC = () => {
    const [reviews, setReviews] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMyReviews = async () => {
            try {
                const response = await api.get('/reviews/user');
                setReviews(response.data.data || []);
            } catch (error) {
                console.error('Error fetching reviews:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMyReviews();
    }, []);

    const handleDelete = async (reviewId: string) => {
        if (!window.confirm('Are you sure you want to delete this review?')) return;
        try {
            await api.delete(`/reviews/${reviewId}`);
            setReviews(prev => prev.filter(r => r.id !== reviewId));
        } catch (error) {
            console.error('Error deleting review:', error);
            alert('Failed to delete review');
        }
    };

    return (
        <Layout>
            <Seo 
                title="My Reviews | MessWalha" 
                description="Manage your mess reviews and feedback" 
            />
            <div className="container mx-auto px-4 py-32">
                <div className="max-w-4xl mx-auto space-y-12">
                    <div className="text-center space-y-4">
                        <h1 className="text-4xl md:text-5xl font-black italic tracking-tighter text-white uppercase">My <span className="text-primary-500">Reviews</span></h1>
                        <p className="text-white/40 text-[10px] font-black uppercase tracking-[0.3em] font-sora">Manage your feedback history</p>
                    </div>

                    {loading ? (
                        <div className="space-y-6 animate-pulse">
                            {[1, 2, 3].map(i => <div key={i} className="h-48 bg-white/5 rounded-[2.5rem]" />)}
                        </div>
                    ) : reviews.length > 0 ? (
                        <div className="space-y-6">
                            {reviews.map((review, idx) => (
                                <motion.div
                                    key={review.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    <Card className="p-8 bg-white/5 backdrop-blur-3xl border-white/10 rounded-[2.5rem] group hover:border-primary-500/30 transition-all">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-2xl bg-primary-500/10 flex items-center justify-center text-primary-500">
                                                    <Star size={24} fill="currentColor" />
                                                </div>
                                                <div>
                                                    <h4 className="font-black text-white text-[11px] uppercase tracking-widest">{review.mess?.name || 'Mess Name'}</h4>
                                                    <p className="text-[9px] text-white/30 font-black uppercase tracking-[0.2em]">
                                                        {new Date(review.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="flex bg-primary-500/10 px-4 py-2 rounded-full items-center gap-2 border border-primary-500/20">
                                                    <Star size={14} className="text-primary-500 fill-primary-500" />
                                                    <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest">{review.rating}.0</span>
                                                </div>
                                                <button 
                                                    onClick={() => handleDelete(review.id)}
                                                    className="p-3 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>
                                        <p className="text-white/60 font-medium leading-relaxed italic pr-12">"{review.comment}"</p>
                                        
                                        {review.owner_response && (
                                            <div className="mt-6 p-6 bg-primary-500/5 rounded-2xl border-l-4 border-primary-500 space-y-2">
                                                <h5 className="text-[9px] font-black uppercase tracking-widest text-primary-500">Response from Owner</h5>
                                                <p className="text-[11px] text-white italic font-medium leading-relaxed">
                                                    "{review.owner_response}"
                                                </p>
                                            </div>
                                        )}
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState
                            icon={MessageSquare}
                            title="No Reviews Yet"
                            description="You haven't posted any reviews yet. Share your experience with others by reviewing your favorite messes."
                            actionLabel="Discover Messes"
                            onAction={() => window.location.href = '/find-mess'}
                        />
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default MyReviewsPage;
