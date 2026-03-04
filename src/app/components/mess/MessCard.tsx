import React from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Star, MapPin, Clock, CircleCheck, ChevronLeft, ChevronRight, Share2, Heart } from 'lucide-react';
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

    return (
        <Card isHoverable className="overflow-hidden flex flex-col h-full bg-white dark:bg-dark-800 border border-border-color shadow-md hover:shadow-lg transition-all duration-300 rounded-xl group border-b-4 border-b-transparent hover:border-b-primary-500">
            <div className="relative h-64 overflow-hidden">
                <div className="absolute inset-0 bg-bg-section dark:bg-dark-700 animate-pulse" />
                <AnimatePresence mode="wait">
                    <motion.img
                        key={currentImageIndex}
                        src={getImageUrl(images[currentImageIndex])}
                        alt={mess.name}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.4 }}
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000&auto=format&fit=crop';
                        }}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-[2s] relative z-10"
                    />
                </AnimatePresence>

                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500" />

                {/* Carousel Controls */}
                {images.length > 1 && (
                    <div className="absolute inset-0 flex items-center justify-between px-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                        <button
                            onClick={prevImage}
                            className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition-colors"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={nextImage}
                            className="p-2 rounded-full bg-white/20 backdrop-blur-md text-white hover:bg-white/40 transition-colors"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                )}

                {/* Pagination Dots */}
                {images.length > 1 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                        {images.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1.5 rounded-full transition-all duration-300 ${i === currentImageIndex ? 'w-6 bg-primary-500' : 'w-1.5 bg-white/50'}`}
                            />
                        ))}
                    </div>
                )}

                {/* Badges & Actions */}
                {mess.verified && (
                    <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute top-6 left-6 bg-primary-500 text-white p-2 rounded-md shadow-md z-20"
                    >
                        <CircleCheck size={18} />
                    </motion.div>
                )}

                <div className="absolute top-6 right-6 flex gap-3 z-20">
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleFavorite(mess.id);
                        }}
                        className={`w-10 h-10 rounded-md backdrop-blur-md border flex items-center justify-center transition-all shadow-lg ${isFavorite(mess.id) ? 'bg-red-500 border-red-500 text-white' : 'bg-white/20 border-white/30 text-white hover:bg-white/40'}`}
                    >
                        <Heart size={20} fill={isFavorite(mess.id) ? 'currentColor' : 'none'} className={isFavorite(mess.id) ? 'animate-pulse' : ''} />
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            if (navigator.share) {
                                navigator.share({
                                    title: mess.name,
                                    text: `Check out ${mess.name} on MessWalha! ${window.location.origin}/mess/${mess.id}`,
                                    url: window.location.origin + `/mess/${mess.id}`,
                                }).catch(console.error);
                            } else {
                                navigator.clipboard.writeText(window.location.origin + `/mess/${mess.id}`);
                                alert('Link copied to clipboard!');
                            }
                        }}
                        className="w-10 h-10 rounded-md bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center text-white hover:bg-white/40 transition-all shadow-lg"
                    >
                        <Share2 size={20} />
                    </motion.button>
                </div>

                <div className="absolute bottom-5 left-5 right-5 flex justify-between items-end z-10">
                    <div className="flex flex-wrap gap-2 items-center">
                        <div className="bg-white dark:bg-dark-800/90 backdrop-blur px-3 py-1.5 rounded-md flex items-center shadow-md border border-border-color">
                            <Star className="text-rating-color fill-rating-color mr-2" size={14} />
                            <span className="text-xs font-black text-text-primary dark:text-text-inverse">
                                {typeof mess.rating === 'number' ? mess.rating.toFixed(1) : '0.0'}
                            </span>
                        </div>
                        <span className="bg-primary-500 text-white px-4 py-1.5 rounded-md text-[10px] font-black tracking-widest uppercase shadow-md">
                            {mess.cuisine || 'Multi-Cuisine'}
                        </span>
                    </div>
                    <span className="bg-white dark:bg-dark-800/90 backdrop-blur text-text-primary dark:text-text-inverse px-4 py-1.5 rounded-md text-[10px] font-black tracking-widest uppercase shadow-md border border-border-color flex items-center gap-1">
                        Starting {mess.monthlyPrice || 2500}/mo
                    </span>
                </div>
            </div>

            <div className="p-8 flex-grow flex flex-col">
                <div className="flex justify-between items-start mb-3">
                    <h3 className="text-2xl font-black text-text-primary dark:text-text-inverse line-clamp-1 group-hover:text-primary-500 transition-colors tracking-tight italic">
                        {mess.name}
                    </h3>
                </div>

                <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 line-clamp-2 h-10 font-medium leading-relaxed italic">
                    "{mess.description}"
                </p>

                <div className="space-y-4 mb-8">
                    <div className="flex items-center text-text-muted text-xs font-black uppercase tracking-widest">
                        <div className="w-10 h-10 rounded-md bg-bg-section dark:bg-dark-700 flex items-center justify-center mr-4 group-hover:bg-primary-500/10 transition-colors">
                            <MapPin size={18} className="text-primary-500" />
                        </div>
                        <span className="line-clamp-1 italic">{mess.address}</span>
                    </div>
                    <div className="flex items-center text-text-muted text-xs font-black uppercase tracking-widest">
                        <div className="w-10 h-10 rounded-md bg-bg-section dark:bg-dark-700 flex items-center justify-center mr-4 group-hover:bg-primary-500/10 transition-colors">
                            <Clock size={18} className="text-primary-500" />
                        </div>
                        <span className="italic">11:00 AM - 10:00 PM</span>
                    </div>
                </div>

                <div className="mt-auto flex items-center justify-between gap-4">
                    <Link to={`/mess/${mess.id}`} className="flex-[1.5]">
                        <Button
                            variant="outline"
                            size="lg"
                            className="w-full rounded-md border-2 py-6 border-border-color hover:border-primary-500/20 hover:bg-primary-500/5 font-black uppercase tracking-[0.2em] text-[10px]"
                        >
                            View Details
                        </Button>
                    </Link>
                    <Link to={`/mess/${mess.id}`} className="flex-1">
                        <Button
                            size="lg"
                            className="w-full rounded-md py-6 shadow-md shadow-primary-500/30 font-black uppercase tracking-[0.2em] text-[10px]"
                        >
                            Subscribe
                        </Button>
                    </Link>
                </div>
            </div>
        </Card >
    );
};
