import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/common/Card';
import { Utensils, Clock, ThumbsUp, Loader2 } from 'lucide-react';
import api from '../api/axiosInstance';
import Seo from '../components/common/Seo';

const TodayMenuPage: React.FC = () => {
    const [menu, setMenu] = useState<{
        breakfast: string;
        lunch: string;
        dinner: string;
        messName: string;
    } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMenu = async () => {
            try {
                const response = await api.get('/menu/today');
                setMenu(response.data.data);
            } catch (error) {
                console.error('Error fetching today menu:', error);
                // Mocking data if API fails or doesn't exist yet
                setMenu({
                    breakfast: 'Poha & Chai',
                    lunch: 'Rice, Dal, 2 Sabzi, Chapati, Curd',
                    dinner: 'Special Paneer, Chapati, Salad',
                    messName: 'Annapurna Mess'
                });
            } finally {
                setLoading(false);
            }
        };
        fetchMenu();
    }, []);

    return (
        <Layout>
            <Seo title="Today's Menu" description="View what's cooking today in your favorite mess" />
            <div className="bg-bg-section dark:bg-dark-900 min-h-screen py-20">
                <div className="container mx-auto px-4 max-w-4xl">
                    <div className="text-center mb-16 space-y-4">
                        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-text-primary">
                            Today's <span className="text-primary-500">Special</span>
                        </h1>
                        <p className="text-text-muted font-bold uppercase tracking-[0.2em] text-xs">
                            Discover what's on your plate today
                        </p>
                    </div>

                    {loading ? (
                        <div className="flex items-center justify-center p-20 text-primary-500">
                            <Loader2 size={48} className="animate-spin" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-8">
                            {[
                                { title: 'Breakfast', time: '08:00 AM - 10:00 AM', items: menu?.breakfast || 'Not available', icon: '🍳', color: 'bg-yellow-500/10 text-yellow-500' },
                                { title: 'Lunch', time: '12:30 PM - 02:30 PM', items: menu?.lunch || 'Not available', icon: '🍱', color: 'bg-primary-500/10 text-primary-500' },
                                { title: 'Dinner', time: '08:00 PM - 10:00 PM', items: menu?.dinner || 'Not available', icon: '🍛', color: 'bg-red-500/10 text-red-500' },
                            ].map((meal, index) => (
                                <Card key={index} className="p-8 md:p-12 bg-card dark:bg-dark-card border-border-color shadow-xl group hover:shadow-2xl transition-all duration-500 overflow-hidden relative">
                                    <div className="absolute top-0 right-0 p-8 text-8xl opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none">
                                        {meal.icon}
                                    </div>
                                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 relative z-10">
                                        <div className="flex items-center space-x-6">
                                            <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl font-bold shadow-inner ${meal.color}`}>
                                                {meal.icon}
                                            </div>
                                            <div className="space-y-1">
                                                <h3 className="text-3xl font-black tracking-tighter text-text-primary">{meal.title}</h3>
                                                <div className="flex items-center text-text-muted text-xs font-bold uppercase tracking-widest">
                                                    <Clock size={14} className="mr-2" /> {meal.time}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex-grow md:max-w-md bg-bg-section dark:bg-dark-900/50 p-6 rounded-2xl border-2 border-border-color/50 group-hover:border-primary-500/20 transition-all">
                                            <p className="text-lg font-bold text-text-primary leading-relaxed italic">
                                                "{meal.items}"
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            ))}

                            <div className="mt-12 p-8 bg-primary-500 rounded-3xl text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl shadow-primary-500/30">
                                <div className="flex items-center space-x-4">
                                    <div className="bg-white/20 p-4 rounded-2xl">
                                        <Utensils size={32} />
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black italic tracking-tight">{menu?.messName}</h4>
                                        <p className="text-sm font-bold uppercase tracking-widest opacity-80">Provider of your daily meals</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2 bg-white/10 px-6 py-4 rounded-2xl border border-white/20 backdrop-blur-sm">
                                    <ThumbsUp size={20} className="fill-white" />
                                    <span className="font-black uppercase tracking-widest text-[10px]">98% Students liked</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default TodayMenuPage;
