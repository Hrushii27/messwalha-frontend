import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { MessCard } from '../components/mess/MessCard';
import { Search, Filter, X, Star, CircleCheck, ChevronDown } from 'lucide-react';
import api from '../api/axiosInstance';
import { Button } from '../components/common/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import Seo from '../components/common/Seo';

const FindMessesPage: React.FC = () => {
    const { t } = useTranslation();
    const [messes, setMesses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [filters, setFilters] = useState({
        cuisine: '',
        verified: false,
        minRating: 0,
        sort: 'Best Rated'
    });

    useEffect(() => {
        const fetchMesses = async () => {
            setLoading(true);
            try {
                // Fetch all messes and let frontend handle filtering for best UX
                const response = await api.get('/messes');
                setMesses(response.data.data);
            } catch (error) {
                console.error('Error fetching messes:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchMesses();
    }, []); // Only fetch once or when explicit refresh needed

    const filteredMesses = messes
        .filter((mess: any) => {
            // 1. Search Filter
            const searchLower = searchTerm.toLowerCase().trim();
            const nameLower = (mess.name || '').toLowerCase();
            const addressLower = (mess.address || '').toLowerCase();
            const cuisineLower = (mess.cuisine || '').toLowerCase();

            const matchesSearch = !searchTerm || searchLower.split(/\s+/).every(word =>
                nameLower.includes(word) || addressLower.includes(word) || cuisineLower.includes(word)
            );

            // 2. Cuisine Filter
            const matchesCuisine = !filters.cuisine || mess.cuisine === filters.cuisine;

            // 3. Verified Filter
            const matchesVerified = !filters.verified || mess.verified;

            // 4. Rating Filter
            const matchesRating = mess.rating >= filters.minRating;

            return matchesSearch && matchesCuisine && matchesVerified && matchesRating;
        })
        .sort((a: any, b: any) => {
            // 5. Sorting Logic
            if (filters.sort === 'Best Rated') {
                return (b.rating || 0) - (a.rating || 0);
            }
            if (filters.sort === 'Price: Low to High') {
                return (a.monthlyPrice || 0) - (b.monthlyPrice || 0);
            }
            if (filters.sort === 'Newest First') {
                return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
            return 0;
        });

    const cuisines = ['Veg', 'Non-Veg', 'Maharashtrian', 'North Indian', 'South Indian', 'Chinese'];

    return (
        <Layout>
            <Seo
                title="Find Mess"
                description="Browse and find the best verified messes near your university or office. Filter by cuisine, rating, and price."
            />
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-bg-section dark:bg-dark-900 py-20 border-b border-border-color relative overflow-hidden"
            >
                <div className="absolute top-0 left-0 w-64 h-64 bg-primary-500/10 rounded-full blur-[100px] -ml-32 -mt-32" />
                <div className="container mx-auto px-4 relative z-10">
                    <div className="max-w-4xl mx-auto space-y-10 text-center">
                        <div className="space-y-4">
                            <motion.h1
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                className="text-5xl md:text-7xl font-black tracking-tighter text-text-primary"
                            >
                                Find Your Perfect <span className="text-primary-500">Meal</span>
                            </motion.h1>
                            <motion.p
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                                className="text-text-muted font-bold uppercase tracking-widest text-sm"
                            >
                                {t('landing.hero_subtitle')}
                            </motion.p>
                        </div>

                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="flex flex-col md:flex-row gap-4 bg-card dark:bg-dark-card p-3 rounded-xl shadow-md border border-border-color"
                        >
                            <div className="relative flex-grow">
                                <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-text-muted" size={24} />
                                <input
                                    type="text"
                                    placeholder={t('landing.search_placeholder')}
                                    className="w-full pl-16 pr-4 py-5 rounded-md bg-bg-section dark:bg-dark-700 border-none outline-none focus:ring-2 focus:ring-primary-500/20 transition-all text-lg font-medium text-text-primary"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <Button
                                variant="outline"
                                className="px-10 rounded-md h-16 shadow-sm bg-card dark:bg-dark-card border-border-color hover:bg-bg-section flex items-center gap-2"
                                onClick={() => setShowFilters(!showFilters)}
                            >
                                <Filter size={20} className={showFilters ? 'text-primary-500' : 'text-text-muted'} />
                                <span className="font-black uppercase tracking-widest text-xs">{showFilters ? 'Hide Filters' : 'Filters'}</span>
                            </Button>
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            <div className="container mx-auto px-4 py-16">
                <div className="flex flex-col lg:flex-row gap-12">
                    {/* Filter Sidebar */}
                    <AnimatePresence>
                        {(showFilters || window.innerWidth >= 1024) && (
                            <motion.aside
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: -20, opacity: 0 }}
                                className="lg:w-72 space-y-10"
                            >
                                <div className="p-8 bg-card dark:bg-dark-card rounded-xl shadow-md border border-border-color">
                                    <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-text-muted mb-6">Cuisine Preference</h3>
                                    <div className="space-y-2">
                                        <button
                                            className={`w-full text-left px-5 py-3 rounded-md text-sm font-black transition-all ${!filters.cuisine ? 'bg-primary-500 text-white shadow-md scale-105' : 'text-text-secondary hover:bg-bg-section'}`}
                                            onClick={() => setFilters({ ...filters, cuisine: '' })}
                                        >
                                            All Cuisines
                                        </button>
                                        {cuisines.map(c => (
                                            <button
                                                key={c}
                                                className={`w-full text-left px-5 py-3 rounded-md text-sm font-black transition-all ${filters.cuisine === c ? 'bg-primary-500 text-white shadow-md scale-105' : 'text-text-secondary hover:bg-bg-section'}`}
                                                onClick={() => setFilters({ ...filters, cuisine: c })}
                                            >
                                                {c}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="mt-10">
                                        <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-text-muted mb-6">Quality Check</h3>
                                        <label className="flex items-center space-x-4 cursor-pointer group p-4 rounded-md bg-bg-section dark:bg-dark-700 hover:bg-primary-500/5 transition-colors">
                                            <div
                                                className={`w-6 h-6 rounded-sm border-2 flex items-center justify-center transition-all ${filters.verified ? 'bg-primary-500 border-primary-500' : 'border-border-color bg-white group-hover:border-primary-500'}`}
                                                onClick={() => setFilters({ ...filters, verified: !filters.verified })}
                                            >
                                                {filters.verified && <CircleCheck size={14} className="text-white" />}
                                            </div>
                                            <span className="text-xs font-black text-text-secondary dark:text-text-inverse uppercase tracking-widest">Verified Only</span>
                                        </label>
                                    </div>

                                    <div className="mt-10">
                                        <h3 className="font-black text-[10px] uppercase tracking-[0.2em] text-text-muted mb-6">Minimum Stars</h3>
                                        <div className="flex items-center justify-between bg-bg-section dark:bg-dark-700 p-4 rounded-md">
                                            <div className="flex items-center space-x-1">
                                                {[1, 2, 3, 4, 5].map(star => (
                                                    <button
                                                        key={star}
                                                        onClick={() => setFilters({ ...filters, minRating: star })}
                                                        className={`transition-all hover:scale-125 ${filters.minRating >= star ? 'text-rating-color' : 'text-gray-300'}`}
                                                    >
                                                        <Star size={20} fill={filters.minRating >= star ? 'currentColor' : 'none'} />
                                                    </button>
                                                ))}
                                            </div>
                                            {filters.minRating > 0 && (
                                                <button
                                                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                                                    onClick={() => setFilters({ ...filters, minRating: 0 })}
                                                >
                                                    <X size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </motion.aside>
                        )}
                    </AnimatePresence>

                    <main className="flex-1 space-y-8">
                        <div className="flex flex-col sm:flex-row justify-between items-center bg-white dark:bg-dark-800 p-6 rounded-xl border border-border-color shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
                            <p className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em]">
                                Showing <span className="text-primary-500">{filteredMesses.length}</span> results in your area
                            </p>
                            <div className="flex items-center space-x-4">
                                <span className="text-[10px] font-black text-gray-300 uppercase italic">Sort by:</span>
                                <div className="relative group">
                                    <select
                                        className="bg-transparent font-black text-xs uppercase tracking-widest focus:outline-none appearance-none pr-8 cursor-pointer text-text-primary dark:text-text-inverse"
                                        value={filters.sort}
                                        onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
                                    >
                                        <option className="text-text-primary">Best Rated</option>
                                        <option className="text-text-primary">Price: Low to High</option>
                                        <option className="text-text-primary">Newest First</option>
                                    </select>
                                    <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none text-primary-500" />
                                </div>
                            </div>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                                {[1, 2, 3, 4, 5, 6].map((i) => (
                                    <div key={i} className="h-[420px] bg-bg-section dark:bg-dark-800 animate-pulse rounded-xl" />
                                ))}
                            </div>
                        ) : filteredMesses.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                                {filteredMesses.map((mess: any) => (
                                    <motion.div
                                        key={mess.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <MessCard mess={mess} />
                                    </motion.div>
                                ))}
                            </div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center py-40 space-y-10 bg-white dark:bg-dark-800 rounded-xl border border-border-color shadow-lg relative overflow-hidden"
                            >
                                <div className="absolute top-0 left-0 w-64 h-64 bg-primary-500/5 rounded-full blur-[100px] -ml-32 -mt-32" />
                                <div className="relative z-10 space-y-8">
                                    <div className="w-32 h-32 bg-bg-section dark:bg-dark-700 rounded-xl shadow-md flex items-center justify-center mx-auto text-primary-500 animate-bounce">
                                        <Search size={56} strokeWidth={2.5} />
                                    </div>
                                    <div className="space-y-4">
                                        <h3 className="text-5xl font-black italic tracking-tighter text-text-primary dark:text-text-inverse">
                                            Oops! No <span className="text-primary-500 underline decoration-primary-500/20 decoration-8 underline-offset-8">Food</span> Found
                                        </h3>
                                        <p className="text-text-muted font-bold uppercase tracking-[0.2em] text-xs max-w-md mx-auto leading-relaxed">
                                            We couldn't find any messes matching your current filters. Try resetting them to see more options in your area.
                                        </p>
                                    </div>
                                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                                        <Button
                                            variant="outline"
                                            onClick={() => setFilters({ cuisine: '', verified: false, minRating: 0, sort: 'Best Rated' })}
                                            className="rounded-md px-12 h-16 border-border-color text-text-primary font-black uppercase tracking-[0.2em] text-[10px] bg-white dark:bg-dark-900 shadow-md hover:scale-105 transition-all"
                                        >
                                            Reset Filters
                                        </Button>
                                        <Button
                                            className="rounded-md px-12 h-16 bg-primary-500 text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-lg shadow-primary-500/20 hover:scale-105 transition-all"
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
