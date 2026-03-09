import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from '../components/layout/Layout';
import { MessCard } from '../components/mess/MessCard';
import {
    Search as SearchIcon,
    Filter,
    Star,
    CircleCheck,
    MapPin,
    Utensils,
    ArrowRight,
    X,
    ShieldCheck
} from 'lucide-react';
import api from '../api/axiosInstance';
import { Button } from '../components/common/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Seo from '../components/common/Seo';
import type { Mess } from '../types/mess';

/*
const FALLBACK_MESSES = [
    {
        id: 'fallback_1',
        name: 'Maratha Darbar (Elite)',
        description: 'Experience the authentic taste of Maharashtra with our premium thalis. Freshly prepared with traditional spices and organic ingredients.',
        address: 'Shivaji Nagar, Pune',
        cuisine: 'Maharashtrian',
        rating: 4.8,
        monthlyPrice: 3500,
        verified: true,
        images: [
            'https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=1200',
            'https://images.unsplash.com/photo-1626074353765-517a681e40be?q=80&w=1200'
        ],
        createdAt: new Date().toISOString()
    },
    ...
];
*/

const FindMessesPage: React.FC = () => {
    useTranslation();
    const [messes, setMesses] = useState<Mess[]>([]);
    const [loading, setLoading] = useState(true);
    const [locationTerm, setLocationTerm] = useState('');
    const [mealType, setMealType] = useState('');
    const [showFilters, setShowFilters] = useState(window.innerWidth >= 1024);
    const [filters, setFilters] = useState({
        cuisine: '',
        verified: false,
        minRating: 0,
        maxPrice: 6000,
        distance: 5,
        sort: 'Best Rated'
    });

    const fetchMesses = useCallback(async () => {
        setLoading(true);
        try {
            const params: Record<string, string | number | boolean> = {};
            if (filters.cuisine && filters.cuisine !== 'All Signals') {
                params.cuisine = filters.cuisine;
            }
            if (filters.maxPrice) {
                params.maxPrice = filters.maxPrice;
            }

            const response = await api.get('/mess', { params });
            const data = response.data.data || [];

            setMesses(data);
        } catch (error) {
            console.error('Error fetching messes:', error);
        } finally {
            setLoading(false);
        }
    }, [filters.cuisine, filters.maxPrice]);

    useEffect(() => {
        fetchMesses();
    }, [fetchMesses]); // Refetch on server-side filters

    const filteredMesses = messes
        .filter((mess: Mess) => {
            const locationLower = locationTerm.toLowerCase().trim();

            const matchesLocation = !locationTerm ||
                (mess.address && mess.address.toLowerCase().includes(locationLower)) ||
                (mess.city && mess.city.toLowerCase().includes(locationLower)) ||
                (mess.name && mess.name.toLowerCase().includes(locationLower));

            const matchesMealType = !mealType ||
                (mealType === 'veg' ? (mess.cuisine && mess.cuisine.toLowerCase().includes('veg')) : true);

            const matchesVerified = !filters.verified || mess.verified;
            const matchesRating = (mess.rating || 0) >= filters.minRating;

            return matchesLocation && matchesMealType && matchesVerified && matchesRating;
        })
        .sort((a: Mess, b: Mess) => {
            if (filters.sort === 'Best Rated') return (b.rating || 0) - (a.rating || 0);
            if (filters.sort === 'Price: Low to High') return (a.monthlyPrice || 0) - (b.monthlyPrice || 0);
            if (filters.sort === 'Newest First') return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
            return 0;
        });

    // Grouping by city
    const groupedMesses = filteredMesses.reduce((acc: Record<string, Mess[]>, mess: Mess) => {
        const city = mess.city || 'Other';
        if (!acc[city]) acc[city] = [];
        acc[city].push(mess);
        return acc;
    }, {});

    const cityOrder = ['Kolhapur', 'Pune', 'Mumbai', 'Goa', 'Nashik', 'Other'];
    const sortedCities = Object.keys(groupedMesses).sort((a, b) => {
        const indexA = cityOrder.indexOf(a);
        const indexB = cityOrder.indexOf(b);
        if (indexA !== -1 && indexB !== -1) return indexA - indexB;
        if (indexA !== -1) return -1;
        if (indexB !== -1) return 1;
        return a.localeCompare(b);
    });

    const cuisines = ['Veg', 'Non-Veg', 'Maharashtrian', 'North Indian', 'South Indian', 'Chinese'];

    return (
        <Layout>
            <Seo
                title="Find Your Perfect Mess | MessWalha"
                description="Browse and find the best verified messes near your university. Filter by cuisine, rating, price, and distance."
            />

            {/* Premium Header/Search Section */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grad-dark py-20 sm:py-32 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-primary-500/10 rounded-full blur-[100px] sm:blur-[150px] -mr-32 -mt-32 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[200px] sm:w-[400px] h-[200px] sm:h-[400px] bg-indigo-500/10 rounded-full blur-[80px] sm:blur-[120px] -ml-32 -mb-32 pointer-events-none" />

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-5xl mx-auto space-y-8 sm:space-y-12">
                        <div className="text-center space-y-4">
                            <motion.h1
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="text-3xl sm:text-5xl md:text-8xl font-black tracking-tighter text-white italic"
                            >
                                Find Your <span className="text-primary-500">Perfect Mess</span>
                            </motion.h1>
                            <p className="text-white/40 font-black uppercase tracking-[0.3em] sm:tracking-[0.4em] text-[9px] sm:text-xs">
                                Discover verified mess services near your college terminal
                            </p>
                        </div>

                        {/* Features Badges */}
                        <div className="flex flex-wrap justify-center gap-3 sm:gap-6 pt-2 sm:pt-4">
                            {[
                                { icon: CircleCheck, text: 'Verified Owners' },
                                { icon: Utensils, text: 'Clean & Hygienic' },
                                { icon: Star, text: 'Top Rated Menu' }
                            ].map((feature, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ y: 10, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.1 * i }}
                                    className="flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-2 sm:py-3 bg-white/5 rounded-full border border-white/10 backdrop-blur-md"
                                >
                                    <feature.icon size={12} className="text-primary-500 sm:w-3.5 sm:h-3.5" />
                                    <span className="text-[9px] sm:text-[10px] font-black text-white/60 uppercase tracking-widest">{feature.text}</span>
                                </motion.div>
                            ))}
                        </div>

                        {/* Integrated Modern Search */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white/10 backdrop-blur-3xl p-3 sm:p-4 rounded-[2rem] md:rounded-full border border-white/20 shadow-3xl mt-8 sm:mt-12"
                        >
                            <div className="flex flex-col md:flex-row items-center gap-2 sm:gap-3">
                                <div className="flex-1 w-full relative group">
                                    <MapPin className="absolute left-6 sm:left-8 top-1/2 -translate-y-1/2 text-primary-500 z-10" size={18} />
                                    <input
                                        type="text"
                                        placeholder="📍 Enter City / Area / Mess..."
                                        className="w-full bg-white/[0.03] border-none text-white pl-14 sm:pl-16 pr-6 py-5 sm:py-6 rounded-full focus:ring-2 focus:ring-primary-500/50 transition-all font-black uppercase tracking-widest text-[10px] sm:text-xs outline-none"
                                        value={locationTerm}
                                        onChange={(e) => setLocationTerm(e.target.value)}
                                    />
                                </div>
                                <div className="flex-1 w-full relative group">
                                    <Utensils className="absolute left-6 sm:left-8 top-1/2 -translate-y-1/2 text-primary-500 z-10" size={18} />
                                    <select
                                        className="w-full bg-white/[0.03] border-none text-white pl-14 sm:pl-16 pr-10 sm:pr-12 py-5 sm:py-6 rounded-full focus:ring-2 focus:ring-primary-500/50 transition-all font-black uppercase tracking-widest text-[10px] sm:text-xs appearance-none cursor-pointer outline-none"
                                        value={mealType}
                                        onChange={(e) => setMealType(e.target.value)}
                                    >
                                        <option value="" className="bg-dark-900 text-white">🍛 Veg / Non-Veg</option>
                                        <option value="veg" className="bg-dark-900 text-white">Pure Veg</option>
                                        <option value="non-veg" className="bg-dark-900 text-white">Veg + Non-Veg</option>
                                    </select>
                                </div>
                                <Button
                                    size="lg"
                                    onClick={() => setShowFilters(!showFilters)}
                                    className={`w-full md:w-auto h-16 sm:h-20 md:px-12 rounded-full font-black uppercase tracking-[0.2em] text-[10px] sm:text-xs flex items-center justify-center gap-3 shadow-2xl transition-all duration-500 ${showFilters ? 'bg-white/10 border border-white/20 text-white' : 'bg-primary-500 text-white shadow-primary-500/40'}`}
                                >
                                    <Filter size={18} />
                                    <SearchIcon size={18} className="md:hidden" />
                                    <span className="hidden md:inline">{showFilters ? 'Hide' : 'Search Options'}</span>
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            <div className="container mx-auto px-4 py-16 sm:py-24">
                <div className="flex flex-col lg:flex-row gap-16">
                    {/* Advanced Filter Sidebar */}
                    <AnimatePresence>
                        {showFilters && (
                            <motion.aside
                                initial={{ x: -40, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -40, opacity: 0 }}
                                className="w-full lg:w-96 space-y-6 sm:space-y-10 shrink-0"
                            >
                                <div className="p-6 sm:p-12 bg-white/5 backdrop-blur-3xl rounded-[2rem] sm:rounded-[3rem] shadow-3xl border border-white/10 sticky top-32">
                                    <div className="flex items-center justify-between mb-8 sm:mb-10">
                                        <h3 className="font-black text-[10px] uppercase tracking-[0.4em] text-primary-500 italic">Filter Registry</h3>
                                        <button
                                            onClick={() => setShowFilters(false)}
                                            className="lg:hidden p-2 text-white/40 hover:text-white"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>

                                    <div className="space-y-10 sm:space-y-12">
                                        <div className="space-y-4 sm:space-y-6">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40">Cuisine Selection</h4>
                                            <div className="grid grid-cols-2 gap-3">
                                                <button
                                                    onClick={() => setFilters({ ...filters, cuisine: '' })}
                                                    className={`px-4 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border ${!filters.cuisine ? 'bg-primary-500 border-primary-500 text-white shadow-xl shadow-primary-500/20' : 'bg-white/5 border-white/5 text-white/30 hover:bg-white/10 hover:text-white'}`}
                                                >
                                                    All Signals
                                                </button>
                                                {cuisines.map(c => (
                                                    <button
                                                        key={c}
                                                        onClick={() => setFilters({ ...filters, cuisine: c })}
                                                        className={`px-4 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border ${filters.cuisine === c ? 'bg-primary-500 border-primary-500 text-white shadow-xl shadow-primary-500/20' : 'bg-white/5 border-white/5 text-white/30 hover:bg-white/10 hover:text-white'}`}
                                                    >
                                                        {c}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-6">
                                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                                <span className="text-white/40">Price Protocol</span>
                                                <span className="text-white italic">Up to ₹{filters.maxPrice}</span>
                                            </div>
                                            <div className="relative pt-2">
                                                <input
                                                    type="range"
                                                    min="1000"
                                                    max="6000"
                                                    step="100"
                                                    value={filters.maxPrice}
                                                    onChange={(e) => setFilters({ ...filters, maxPrice: parseInt(e.target.value) })}
                                                    className="w-full accent-primary-500 h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4 sm:space-y-6">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40">Network Trust</h4>
                                            <button
                                                onClick={() => setFilters({ ...filters, verified: !filters.verified })}
                                                className={`w-full flex items-center justify-between p-5 sm:p-6 rounded-[1.5rem] border-2 transition-all duration-500 ${filters.verified ? 'border-primary-500 bg-primary-500/10 text-white' : 'border-white/5 bg-white/5 text-white/30 hover:border-white/20'}`}
                                            >
                                                <div className="flex items-center gap-4">
                                                    <ShieldCheck size={20} className={filters.verified ? 'text-primary-500' : 'text-white/20'} />
                                                    <span className="text-[10px] font-black uppercase tracking-widest">Verified Assets</span>
                                                </div>
                                                <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center transition-all ${filters.verified ? 'bg-primary-500 border-primary-500' : 'border-white/20'}`}>
                                                    {filters.verified && <CircleCheck size={12} className="text-white" />}
                                                </div>
                                            </button>
                                        </div>

                                        <div className="space-y-6">
                                            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40">Rating Intelligence</h4>
                                            <div className="flex justify-between items-center p-6 bg-white/5 rounded-[1.5rem] border border-white/5">
                                                <div className="flex gap-2">
                                                    {[1, 2, 3, 4, 5].map(star => (
                                                        <button
                                                            key={star}
                                                            onClick={() => setFilters({ ...filters, minRating: star })}
                                                            className={`transition-all hover:scale-125 ${filters.minRating >= star ? 'text-primary-500' : 'text-white/10'}`}
                                                        >
                                                            <Star size={22} fill={filters.minRating >= star ? 'currentColor' : 'none'} />
                                                        </button>
                                                    ))}
                                                </div>
                                                <span className="text-[10px] font-black text-white italic">{filters.minRating}.0+</span>
                                            </div>
                                        </div>

                                        <button
                                            className="w-full py-6 rounded-[1.5rem] border border-white/10 font-black uppercase tracking-widest text-[9px] text-white/30 hover:text-white hover:bg-white/10 transition-all"
                                            onClick={() => setFilters({ cuisine: '', verified: false, minRating: 0, maxPrice: 6000, distance: 5, sort: 'Best Rated' })}
                                        >
                                            Reset Filter Protocol
                                        </button>
                                    </div>
                                </div>
                            </motion.aside>
                        )}
                    </AnimatePresence>

                    <main className="flex-1 space-y-16">
                        {/* Status Bar */}
                        <div className="flex flex-col md:flex-row justify-between items-center bg-white/5 backdrop-blur-3xl p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] border border-white/10 shadow-3xl relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-primary-500 to-indigo-600"></div>
                            <div className="space-y-2 text-center md:text-left">
                                <p className="text-[9px] text-white/30 font-black uppercase tracking-[0.4em]">Signal Detected</p>
                                <h2 className="text-2xl sm:text-3xl font-black italic tracking-tighter text-white">
                                    Found <span className="text-primary-500">{filteredMesses.length}</span> Premium <span className="text-white/40">Messes</span>
                                </h2>
                            </div>
                            <div className="flex items-center gap-8 mt-6 md:mt-0">
                                <div className="h-12 w-px bg-white/5 hidden md:block"></div>
                                <div className="flex items-center gap-4">
                                    <span className="text-[9px] font-black text-white/20 uppercase tracking-widest">Sorting Method:</span>
                                    <div className="relative">
                                        <select
                                            className="bg-white/5 font-black text-[10px] uppercase tracking-[0.2em] focus:outline-none py-4 px-8 rounded-2xl cursor-pointer text-white border border-white/10 appearance-none pr-12"
                                            value={filters.sort}
                                            onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                                        >
                                            <option className="bg-dark-900">Best Rated</option>
                                            <option className="bg-dark-900">Price: Low to High</option>
                                            <option className="bg-dark-900">Newest First</option>
                                        </select>
                                        <ArrowRight className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 rotate-90" size={14} />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="h-[600px] bg-white/5 animate-pulse rounded-[3rem] border border-white/10" />
                                ))}
                            </div>
                        ) : filteredMesses.length > 0 ? (
                            <div className="space-y-24">
                                {sortedCities.map((city) => (
                                    <div key={city} className="space-y-10">
                                        <div className="flex items-center gap-6">
                                            <h3 className="text-2xl font-black italic text-white flex items-center gap-4 uppercase tracking-tighter">
                                                <MapPin className="text-primary-500" size={24} />
                                                {city} <span className="text-white/20">Mess</span>
                                            </h3>
                                            <div className="h-0.5 flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 sm:gap-12">
                                            {groupedMesses[city].map((mess: Mess) => (
                                                <motion.div
                                                    key={mess.id}
                                                    initial={{ opacity: 0, y: 30 }}
                                                    whileInView={{ opacity: 1, y: 0 }}
                                                    viewport={{ once: true }}
                                                    transition={{ duration: 0.6 }}
                                                >
                                                    <MessCard mess={mess} />
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center py-40 px-12 space-y-16 bg-white/5 backdrop-blur-3xl rounded-[4rem] border border-white/10 shadow-3xl relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-[150px] -mr-64 -mt-64" />
                                <div className="relative z-10 space-y-16">
                                    <div className="w-48 h-48 bg-white/5 rounded-[3rem] shadow-3xl flex items-center justify-center mx-auto text-primary-500 animate-float border border-white/10 relative">
                                        <SearchIcon size={80} strokeWidth={1} className="opacity-30" />
                                        <div className="absolute inset-0 bg-primary-500/10 rounded-[3rem] blur-2xl animate-pulse" />
                                    </div>
                                    <div className="space-y-6">
                                        <h3 className="text-5xl md:text-7xl font-black italic tracking-tighter text-white">
                                            No Mess Found <br />
                                            <span className="text-white/10 italic">In This Area Yet</span>
                                        </h3>
                                        <p className="text-white/40 font-black uppercase tracking-[0.3em] text-[10px] md:text-xs max-w-xl mx-auto leading-loose italic">
                                            We are expanding our network rapidly. You can request a mess service for your specific campus or browse nearby college hubs.
                                        </p>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-6 justify-center pt-8">
                                        <Button
                                            variant="outline"
                                            className="h-20 rounded-full px-16 bg-white/5 border-2 border-white/10 font-black uppercase tracking-[0.2em] text-xs shadow-3xl hover:bg-white/10 transition-all text-white/60 hover:text-white"
                                            onClick={() => {
                                                setLocationTerm('');
                                                setMealType('');
                                                setFilters({ ...filters, cuisine: '', maxPrice: 6000 });
                                            }}
                                        >
                                            Browse Nearby Areas
                                        </Button>
                                        <Button
                                            className="h-20 rounded-full px-16 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-black uppercase tracking-[0.2em] text-xs shadow-3xl shadow-primary-500/30 hover:scale-[1.05] transition-all"
                                            onClick={() => window.location.href = 'mailto:support@messwalha.com?subject=Mess Request'}
                                        >
                                            Request a Mess
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </main>
                </div>
            </div>
        </Layout>
    );
};

export default FindMessesPage;
