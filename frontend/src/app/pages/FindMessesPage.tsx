import React, { useState, useEffect, useCallback } from 'react';
import { Layout } from '../components/layout/Layout';
import { MessCard } from '../components/mess/MessCard';
import {
    Search as SearchIcon,
    Filter,
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
import { EmptyState } from '../components/common/EmptyState';

const FindMessesPage: React.FC = () => {
    useTranslation();
    const [messes, setMesses] = useState<Mess[]>([]);
    const [loading, setLoading] = useState(true);
    const [locationTerm, setLocationTerm] = useState('');
    const [debouncedLocationTerm, setDebouncedLocationTerm] = useState('');
    const [mealType, setMealType] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    
    // Auto-show filters on desktop, hide on mobile
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setShowFilters(true);
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedLocationTerm(locationTerm);
        }, 300);
        return () => clearTimeout(timer);
    }, [locationTerm]);

    const [filters, setFilters] = useState({
        cuisine: '',
        verified: false,
        minRating: 0,
        maxPrice: 6000,
        distance: 5,
        sort: 'Best Rated',
        college: '',
        veg_nonveg: ''
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

            const response = await api.get('/messes', { params });
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
    }, [fetchMesses]);

    const filteredMesses = messes
        .filter((mess: Mess) => {
            const locationLower = debouncedLocationTerm.toLowerCase().trim();

            const matchesLocation = !debouncedLocationTerm ||
                (mess.address && mess.address.toLowerCase().includes(locationLower)) ||
                (mess.city && mess.city.toLowerCase().includes(locationLower)) ||
                (mess.name && mess.name.toLowerCase().includes(locationLower)) ||
                (mess.collegeTags && mess.collegeTags.toLowerCase().includes(locationLower));

            const matchesMealType = !filters.veg_nonveg || 
                (mess.vegNonVeg === filters.veg_nonveg);

            const matchesCollege = !filters.college ||
                (mess.collegeTags && mess.collegeTags.toLowerCase().includes(filters.college.toLowerCase()));

            const matchesVerified = !filters.verified || mess.verified;
            const matchesRating = (mess.rating || 0) >= filters.minRating;
            const matchesVisibility = mess.isVisible !== false;

            return matchesLocation && matchesMealType && matchesCollege && matchesVerified && matchesRating && matchesVisibility;
        })
        .sort((a: Mess, b: Mess) => {
            if (filters.sort === 'Best Rated') return (b.rating || 0) - (a.rating || 0);
            if (filters.sort === 'Price: Low to High') return (a.monthlyPrice || 0) - (b.monthlyPrice || 0);
            if (filters.sort === 'Newest First') return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
            return 0;
        });

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
                title="Premium Mess Discovery & Weekly Menu Feed | FindMess"
                description="Explore verified elite mess services. Filter by cuisine, pricing, and college terminals. Access premium meal plans with healthy standards across major student hubs."
            />

            {/* Premium Header/Search Section */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="grad-dark py-16 sm:py-24 md:py-32 relative overflow-hidden"
            >
                <div className="absolute top-0 right-0 w-[300px] h-[300px] md:w-[500px] md:h-[500px] bg-primary-500/10 rounded-full blur-[100px] md:blur-[150px] -mr-32 -mt-32 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-[200px] h-[200px] md:w-[400px] md:h-[400px] bg-indigo-500/10 rounded-full blur-[80px] md:blur-[120px] -ml-32 -mb-32 pointer-events-none" />

                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-5xl mx-auto space-y-6 md:space-y-12">
                        <div className="text-center space-y-3 md:space-y-4">
                            <motion.h1
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="text-3xl sm:text-4xl md:text-8xl font-black tracking-tighter text-white italic leading-tight"
                            >
                                Find Your <span className="text-primary-500">Perfect Mess</span>
                            </motion.h1>
                            <p className="text-white/80 font-black uppercase tracking-[0.2em] md:tracking-[0.4em] text-[8px] md:text-xs">
                                Discover verified mess services near your college terminal
                            </p>
                        </div>

                        {/* Integrated Modern Search */}
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white/10 backdrop-blur-3xl p-3 md:p-4 rounded-[1.5rem] md:rounded-full border border-white/20 shadow-3xl"
                        >
                            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-3">
                                <div className="flex-1 w-full relative group">
                                    <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-primary-500 z-10" size={18} />
                                    <input
                                        type="text"
                                        placeholder="📍 Enter City / Area / Mess..."
                                        className="w-full h-14 md:h-20 bg-white/[0.03] border-none text-white pl-14 pr-6 rounded-full focus:ring-2 focus:ring-primary-500/50 transition-all font-black uppercase tracking-widest text-[10px] md:text-xs outline-none"
                                        value={locationTerm}
                                        onChange={(e) => setLocationTerm(e.target.value)}
                                        aria-label="Search by location or name"
                                    />
                                </div>
                                <div className="flex-1 w-full relative group">
                                    <Utensils className="absolute left-6 top-1/2 -translate-y-1/2 text-primary-500 z-10" size={18} />
                                    <select
                                        className="w-full h-14 md:h-20 bg-white/[0.03] border-none text-white pl-14 pr-10 rounded-full focus:ring-2 focus:ring-primary-500/50 transition-all font-black uppercase tracking-widest text-[10px] md:text-xs appearance-none cursor-pointer outline-none"
                                        value={mealType}
                                        onChange={(e) => setMealType(e.target.value)}
                                        aria-label="Filter by meal type"
                                    >
                                        <option value="" className="bg-dark-900 text-white">🍛 Veg / Non-Veg</option>
                                        <option value="veg" className="bg-dark-900 text-white">Pure Veg</option>
                                        <option value="non-veg" className="bg-dark-900 text-white">Veg + Non-Veg</option>
                                    </select>
                                </div>
                                <Button
                                    size="lg"
                                    onClick={() => setShowFilters(!showFilters)}
                                    aria-expanded={showFilters}
                                    className={`w-full md:w-auto h-14 md:h-20 md:px-12 rounded-full font-black uppercase tracking-[0.2em] text-[10px] md:text-xs flex items-center justify-center gap-3 shadow-2xl transition-all duration-500 ${showFilters ? 'bg-white/10 border border-white/20 text-white' : 'bg-primary-500 text-white shadow-primary-500/40'}`}
                                >
                                    <Filter size={18} />
                                    <span>{showFilters ? 'Close Filters' : 'Filter Options'}</span>
                                </Button>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            <div className="container mx-auto px-4 py-8 md:py-24">
                <div className="flex flex-col lg:flex-row gap-8 lg:gap-16">
                    {/* Filter Sidebar / Drawer */}
                    <AnimatePresence>
                        {showFilters && (
                            <>
                                {/* Mobile Backdrop */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setShowFilters(false)}
                                    className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm z-[150] lg:hidden"
                                />
                                <motion.aside
                                    initial={{ x: window.innerWidth < 1024 ? '100%' : -40, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    exit={{ x: window.innerWidth < 1024 ? '100%' : -40, opacity: 0 }}
                                    className="fixed inset-y-0 right-0 w-[85%] max-w-[400px] bg-navy-900 z-[160] p-8 overflow-y-auto lg:relative lg:inset-auto lg:w-96 lg:bg-transparent lg:p-0 lg:z-10 lg:block"
                                >
                                    <div className="lg:p-12 lg:bg-dark-900/95 lg:backdrop-blur-3xl lg:rounded-[3rem] lg:shadow-3xl lg:border lg:border-white/10 lg:sticky lg:top-32">
                                        <div className="flex items-center justify-between mb-8 lg:mb-10">
                                            <h2 className="font-black text-[11px] uppercase tracking-[0.4em] text-primary-500 italic">Filter Registry</h2>
                                            <button
                                                onClick={() => setShowFilters(false)}
                                                className="p-3 bg-white/5 rounded-xl text-white/40 hover:text-white transition-all lg:hidden"
                                            >
                                                <X size={20} />
                                            </button>
                                        </div>

                                        <div className="space-y-10 lg:space-y-12">
                                            {/* Cuisine Filter */}
                                            <div className="space-y-4 lg:space-y-6">
                                                <h2 className="text-[10px] font-black uppercase tracking-widest text-white/70">Cuisine Selection</h2>
                                                <div className="grid grid-cols-2 gap-2 md:gap-3">
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
                                                            className={`px-4 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all border ${filters.cuisine === c ? 'bg-primary-500 border-primary-500 text-white shadow-xl shadow-primary-500/20' : 'bg-white/5 border-white/5 text-white/60 hover:bg-white/10 hover:text-white'}`}
                                                        >
                                                            {c}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Price Filter */}
                                            <div className="space-y-6">
                                                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                                    <span className="text-white/70">Price Protocol</span>
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

                                            {/* Trust Filter */}
                                            <div className="space-y-4 lg:space-y-6">
                                                <h2 className="text-[10px] font-black uppercase tracking-widest text-white/70">Network Trust</h2>
                                                <button
                                                    onClick={() => setFilters({ ...filters, verified: !filters.verified })}
                                                    className={`w-full h-16 flex items-center justify-between px-6 rounded-[1.2rem] border-2 transition-all duration-500 ${filters.verified ? 'border-primary-500 bg-primary-500/10 text-white' : 'border-white/5 bg-white/5 text-white/30 hover:border-white/20'}`}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <ShieldCheck size={20} className={filters.verified ? 'text-primary-500' : 'text-white/20'} />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">Verified Assets</span>
                                                    </div>
                                                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${filters.verified ? 'bg-primary-500 border-primary-500' : 'border-white/20'}`}>
                                                        {filters.verified && <CircleCheck size={12} className="text-white" />}
                                                    </div>
                                                </button>
                                            </div>

                                            {/* Sort Option (Mobile Only) */}
                                            <div className="space-y-4 lg:hidden">
                                                <h2 className="text-[10px] font-black uppercase tracking-widest text-white/70">Sorting Method</h2>
                                                <select
                                                    className="w-full h-16 bg-white/5 border border-white/10 px-6 rounded-[1.2rem] text-white outline-none focus:ring-2 focus:ring-primary-500 text-[10px] font-black uppercase tracking-widest appearance-none bg-dark-900"
                                                    value={filters.sort}
                                                    onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                                                >
                                                    <option className="bg-dark-900">Best Rated</option>
                                                    <option className="bg-dark-900">Price: Low to High</option>
                                                    <option className="bg-dark-900">Newest First</option>
                                                </select>
                                            </div>

                                            <button
                                                className="w-full h-16 rounded-[1.2rem] border border-white/10 font-black uppercase tracking-widest text-[10px] text-white/60 hover:text-white hover:bg-white/10 transition-all"
                                                onClick={() => {
                                                    setFilters({ cuisine: '', verified: false, minRating: 0, maxPrice: 6000, distance: 5, sort: 'Best Rated', college: '', veg_nonveg: '' });
                                                    if (window.innerWidth < 1024) setShowFilters(false);
                                                }}
                                            >
                                                Reset Filters
                                            </button>
                                        </div>
                                    </div>
                                </motion.aside>
                            </>
                        )}
                    </AnimatePresence>

                    <main className="flex-1 space-y-8 md:space-y-16">
                        {/* Status Bar */}
                        <div className="flex flex-col md:flex-row justify-between items-center bg-dark-900/90 backdrop-blur-3xl p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] border border-white/10 shadow-3xl relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-primary-500 to-indigo-600"></div>
                            <div className="space-y-1 md:space-y-2 text-center md:text-left">
                                <p className="text-[8px] md:text-[9px] text-white/60 font-black uppercase tracking-[0.4em]">Signal Detected</p>
                                <h2 className="text-xl md:text-3xl font-black italic tracking-tighter text-white">
                                    Found <span className="text-primary-500">{filteredMesses.length}</span> Premium <span className="text-white/60">Messes</span>
                                </h2>
                            </div>
                            <div className="hidden md:flex items-center gap-8">
                                <div className="h-12 w-px bg-white/5"></div>
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
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="h-96 md:h-[600px] bg-white/5 animate-pulse rounded-[1.5rem] md:rounded-[3rem] border border-white/10" />
                                ))}
                            </div>
                        ) : filteredMesses.length > 0 ? (
                            <div className="space-y-12 md:space-y-24">
                                {sortedCities.map((city) => (
                                    <div key={city} className="space-y-6 md:space-y-10">
                                        <div className="flex items-center gap-4 md:gap-6">
                                            <h3 className="text-xl md:text-2xl font-black italic text-white flex items-center gap-4 uppercase tracking-tighter">
                                                <MapPin className="text-primary-500" size={20} />
                                                {city} <span className="text-white/20">Mess</span>
                                            </h3>
                                            <div className="h-0.5 flex-1 bg-gradient-to-r from-white/10 to-transparent"></div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-12">
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
                            <EmptyState
                                icon={SearchIcon}
                                title="No mess signals detected"
                                description="Try adjusting your filters or search terminal."
                                actionLabel="Reset Filters"
                                onAction={() => {
                                    setLocationTerm('');
                                    setMealType('');
                                    setFilters({ cuisine: '', verified: false, minRating: 0, maxPrice: 6000, distance: 5, sort: 'Best Rated', college: '', veg_nonveg: '' });
                                }}
                            />
                        )}
                    </main>
                </div>
            </div>
        </Layout>
    );
};

export default FindMessesPage;
