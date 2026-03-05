import React from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import {
    Star,
    MapPin,
    CircleCheck,
    ChevronLeft,
    ChevronRight,
    Heart
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useFavorites } from '../../context/FavoritesContext';
import { getImageUrl } from '../../api/axiosInstance';

interface MessCardProps {
    mess: {
        id: string;
        name: string;
        description: string;
        address: string;
        rating: number;
        images: string[];
        priceRange?: string;
        monthlyPrice?: number;
        verified?: boolean;
        cuisine?: string;
    };
}

export const MessCard: React.FC<MessCardProps> = ({ mess }) => {
    const { isFavorite, toggleFavorite } = useFavorites();
    const [currentImageIndex, setCurrentImageIndex] = React.useState(0);
    const images = mess.images?.length > 0 ? mess.images : ['https://images.unsplash.com/photo-1546069901-ba9599a7e63c?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80'];

    const nextImage = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev + 1) % images.length);
    };

    const prevImage = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const rating = typeof mess.rating === 'number' ? mess.rating : 0;
    const isTopRated = rating >= 4.5;
    const distance = (Math.random() * 2).toFixed(1); // Simulating distance for demo

    return (
        <Card isHoverable className="overflow-hidden flex flex-col h-full bg-white dark:bg-dark-800 border border-border-color shadow-xl hover:shadow-2xl transition-all duration-500 rounded-[2rem] group border-b-8 border-b-transparent hover:border-b-primary-500/50">
            <div className="relative h-72 overflow-hidden">
                <div className="absolute inset-0 bg-bg-section dark:bg-dark-700 animate-pulse" />
                <AnimatePresence mode="wait">
                    <motion.img
                        key={currentImageIndex}
                        src={getImageUrl(images[currentImageIndex])}
                        alt={mess.name}
                        initial={{ opacity: 0, scale: 1.2 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000&auto=format&fit=crop';
                        }}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[3s] relative z-10"
                    />
                </AnimatePresence>

                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-40 group-hover:opacity-60 transition-opacity duration-700 z-[11]" />

                {/* Floating Badges */}
                <div className="absolute top-6 left-6 flex flex-col gap-2 z-20">
                    {mess.verified && (
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            className="bg-primary-500 text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border border-white/20"
                        >
                            <CircleCheck size={14} />
                            Verified
                        </motion.div>
                    )}
                    {isTopRated && (
                        <motion.div
                            initial={{ x: -20, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="bg-rating-color text-white px-4 py-2 rounded-full shadow-2xl flex items-center gap-2 text-[10px] font-black uppercase tracking-widest border border-white/20"
                        >
                            <Star size={14} fill="currentColor" />
                            Top Rated
                        </motion.div>
                    )}
                </div>

                {/* Like & Share */}
                <div className="absolute top-6 right-6 flex flex-col gap-3 z-20">
                    <motion.button
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleFavorite(mess.id);
                        }}
                        className={`w-12 h-12 rounded-2xl backdrop-blur-xl border flex items-center justify-center transition-all shadow-2xl ${isFavorite(mess.id) ? 'bg-red-500 border-red-400 text-white' : 'bg-white/10 border-white/20 text-white hover:bg-white/30'}`}
                    >
                        <Heart size={20} fill={isFavorite(mess.id) ? 'currentColor' : 'none'} />
                    </motion.button>
                </div>

                {/* Image Nav On Hover */}
                {images.length > 1 && (
                    <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-between px-4 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <button onClick={prevImage} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-primary-500 transition-colors">
                            <ChevronLeft size={20} />
                        </button>
                        <button onClick={nextImage} className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-primary-500 transition-colors">
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}

                {/* Bottom Stats Overlay */}
                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end z-20">
                    <div className="flex gap-2">
                        <div className="bg-white/10 backdrop-blur-xl border border-white/20 px-4 py-2 rounded-xl flex items-center shadow-2xl">
                            <Star className="text-rating-color fill-rating-color mr-2" size={14} />
                            <span className="text-xs font-black text-white italic">{rating.toFixed(1)}</span>
                        </div>
                    </div>
                    <div className="bg-primary-500 text-white px-5 py-2 rounded-xl text-[10px] font-black tracking-[0.2em] uppercase shadow-2xl border border-white/10">
                        ₹{mess.monthlyPrice || 2500}/Mo
                    </div>
                </div>
            </div>

            <div className="p-10 flex-grow flex flex-col space-y-6">
                <div>
                    <h3 className="text-3xl font-black text-text-primary dark:text-text-inverse line-clamp-1 group-hover:text-primary-500 transition-colors tracking-tighter italic mb-2 uppercase">
                        {mess.name}
                    </h3>
                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-text-muted">
                        <MapPin size={14} className="text-primary-500" />
                        <span className="line-clamp-1">{mess.address}</span>
                    </div>
                </div>

                <p className="text-text-muted text-sm font-medium leading-relaxed italic border-l-4 border-primary-500/20 pl-4 py-2 line-clamp-2">
                    "{mess.description || 'Excellent quality food with authentic taste and hygienic preparation.'}"
                </p>

                <div className="flex flex-wrap gap-2 pt-2">
                    {(mess.cuisine || 'North Indian').split(',').map((tag, i) => (
                        <span key={i} className="text-[9px] font-black uppercase tracking-widest bg-bg-section dark:bg-dark-700 px-3 py-1.5 rounded-lg border border-border-color">
                            {tag}
                        </span>
                    ))}
                </div>

                <div className="pt-6 mt-auto grid grid-cols-2 gap-4">
                    <Link to={`/mess/${mess.id}`}>
                        <Button
                            variant="outline"
                            className="w-full rounded-2xl py-7 border-2 border-border-color hover:border-primary-500 font-black uppercase tracking-widest text-[9px]"
                        >
                            View Menu
                        </Button>
                    </Link>
                    <Link to={`/mess/${mess.id}`}>
                        <Button
                            className="w-full rounded-2xl py-7 shadow-2xl shadow-primary-500/20 font-black uppercase tracking-widest text-[9px]"
                        >
                            Subscribe
                        </Button>
                    </Link>
                </div>
            </div>
        </Card>
    );
};
