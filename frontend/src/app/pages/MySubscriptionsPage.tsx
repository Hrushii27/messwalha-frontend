import React, { useState, useEffect } from 'react';
import { Layout } from '../components/layout/Layout';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Search, Filter, Download, Pause, XCircle, RefreshCw } from 'lucide-react';
import api from '../api/axiosInstance';
import type { Subscription } from '../types/mess';

const MySubscriptionsPage: React.FC = () => {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchSubscriptions = async () => {
            try {
                const response = await api.get('/subscriptions');
                setSubscriptions(response.data.subscriptions || []);
            } catch (error) {
                console.error('Error fetching subscriptions:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSubscriptions();
    }, []);

    const filteredSubscriptions = subscriptions.filter((sub: Subscription) =>
        sub.plan_type?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <Layout>
            <div className="container mx-auto px-4 py-8 space-y-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold">My Subscriptions <span className="text-[10px] bg-primary text-white px-2 py-0.5 rounded-full">v2.1</span></h1>
                        <p className="text-gray-500">Manage your active and past meal plans</p>
                    </div>
                    <div className="flex items-center space-x-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search messes..."
                                className="w-full pl-10 pr-4 py-2 border rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" size="sm" className="rounded-xl">
                            <Filter size={18} className="mr-2" /> Filters
                        </Button>
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-48 bg-gray-50 rounded-2xl animate-pulse" />)}
                    </div>
                ) : filteredSubscriptions.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredSubscriptions.map((sub: Subscription) => (
                            <Card key={sub.id} className="p-6 space-y-6">
                                <div className="flex justify-between items-start">
                                    <div className="flex items-center space-x-4">
                                        <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                            <RefreshCw size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-lg">{sub.plan_type === 'trial' ? '60-Day Free Trial' : 'Professional Plan'}</h3>
                                            <p className="text-sm text-gray-400">Status: {sub.status}</p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${sub.status === 'ACTIVE' ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'
                                        } `}>
                                        {sub.status}
                                    </span>
                                </div>

                                {(() => {
                                    const start = new Date(sub.trial_start || sub.created_at || '');
                                    const end = new Date(sub.trial_end || sub.next_billing_date || '');
                                    const now = new Date();
                                    const totalDays = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)));
                                    const daysPast = Math.ceil((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                                    const remaining = Math.max(0, Math.min(totalDays, totalDays - daysPast));
                                    const progress = Math.min(100, Math.max(0, (daysPast / totalDays) * 100));

                                    return (
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-gray-500 font-bold uppercase tracking-tighter text-[10px]">Time Remaining</span>
                                                <span className="font-black text-primary">{remaining} / {totalDays} Days</span>
                                            </div>
                                            <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-primary transition-all duration-1000" style={{ width: `${progress}%` }} />
                                            </div>
                                            <div className="flex justify-between text-[10px] text-gray-400 font-medium">
                                                <span>Started: {sub.trial_start ? new Date(sub.trial_start).toLocaleDateString() : 'N/A'}</span>
                                                <span>Expires: {sub.trial_end ? new Date(sub.trial_end).toLocaleDateString() : 'N/A'}</span>
                                            </div>
                                        </div>
                                    );
                                })()}

                                <div className="grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                                    <Button variant="outline" size="sm" className="rounded-lg">
                                        <Pause size={14} className="mr-2" /> Pause
                                    </Button>
                                    <Button variant="outline" size="sm" className="rounded-lg text-red-500 hover:bg-red-50">
                                        <XCircle size={14} className="mr-2" /> Cancel
                                    </Button>
                                    <Button variant="primary" size="sm" className="rounded-lg col-span-2">
                                        <RefreshCw size={14} className="mr-2" /> Renew Plan
                                    </Button>
                                    <button
                                        onClick={() => window.open(`/invoice/${sub.id}`, '_blank')}
                                        className="col-span-2 text-xs text-primary font-bold flex items-center justify-center py-2 hover:underline"
                                    >
                                        <Download size={14} className="mr-2" /> Download Invoice
                                    </button>
                                </div>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                            <RefreshCw size={40} />
                        </div>
                        <h2 className="text-xl font-bold">Find a Mess</h2>
                        <p className="text-gray-500 mt-2">Browse Available Mess Services</p>
                        <Button
                            className="mt-6 rounded-full px-8"
                            onClick={() => window.location.href = '/find-mess'}
                        >
                            Find a Mess
                        </Button>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default MySubscriptionsPage;
