import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Printer, FileText } from 'lucide-react';
import api from '../api/axiosInstance';
import { Button } from '../components/common/Button';
import type { Subscription } from '../types/mess';

const InvoicePage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [subscription, setSubscription] = useState<Subscription | null>(null);

    useEffect(() => {
        const fetchSubscription = async () => {
            try {
                // We fetch all and find the one, or we could add a getById endpoint.
                // For now, let's assume we can find it in the list for simplicity,
                // or better, we can rely on a specific endpoint if it exists.
                const response = await api.get('/subscriptions/my-subscriptions');
                const sub = response.data.data.find((s: Subscription) => s.id === id);
                if (sub) {
                    setSubscription(sub);
                }
            } catch (error) {
                console.error('Error fetching subscription for invoice:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchSubscription();
    }, [id]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin text-primary-500">
                    <FileText size={48} />
                </div>
            </div>
        );
    }

    if (!subscription) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center space-y-4">
                <h1 className="text-2xl font-bold">Invoice not found</h1>
                <Button onClick={() => navigate('/subscriptions')}>Go Back</Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                {/* Actions - Hidden on print */}
                <div className="flex justify-between items-center mb-8 print:hidden">
                    <Button variant="outline" onClick={() => navigate('/subscriptions')} className="flex items-center gap-2">
                        <ArrowLeft size={16} /> Back
                    </Button>
                    <div className="flex gap-4">
                        <Button onClick={handlePrint} className="flex items-center gap-2">
                            <Printer size={16} /> Print / Save PDF
                        </Button>
                    </div>
                </div>

                {/* Invoice Content */}
                <div className="bg-white shadow-xl rounded-2xl overflow-hidden border border-gray-100 p-12 print:shadow-none print:border-none print:p-0">
                    <div className="flex justify-between items-start mb-12">
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center text-white">
                                    <FileText size={24} />
                                </div>
                                <span className="text-2xl font-black italic tracking-tighter">Mess<span className="text-primary-500">Walha</span></span>
                            </div>
                            <p className="text-gray-500 text-sm">Simplifying your meal plans.</p>
                        </div>
                        <div className="text-right">
                            <h2 className="text-3xl font-black uppercase tracking-widest text-gray-900 mb-2">Invoice</h2>
                            <p className="text-gray-500 text-sm font-bold">#{subscription.id.slice(-8).toUpperCase()}</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-12 mb-12">
                        <div>
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Bill To</h3>
                            <p className="font-bold text-gray-900">Student Customer</p>
                            <p className="text-gray-500 text-sm italic">Subscription ID: {subscription.id}</p>
                        </div>
                        <div className="text-right">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-4">Invoice Details</h3>
                            <p className="text-sm font-bold text-gray-900">Date: {subscription.createdAt ? new Date(subscription.createdAt).toLocaleDateString() : 'N/A'}</p>
                            <p className="text-sm font-bold text-gray-900">Status: {subscription.status}</p>
                        </div>
                    </div>

                    <div className="border-t border-b border-gray-100 py-8 mb-12">
                        <table className="w-full">
                            <thead>
                                <tr className="text-left text-xs font-black uppercase tracking-[0.2em] text-gray-400">
                                    <th className="pb-4">Description</th>
                                    <th className="pb-4 text-center">Period</th>
                                    <th className="pb-4 text-right">Amount</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                <tr>
                                    <td className="py-6">
                                        <p className="font-bold text-gray-900">{subscription.mess?.name}</p>
                                        <p className="text-xs text-gray-500 italic">{subscription.planType} Meal Subscription</p>
                                    </td>
                                    <td className="py-6 text-center text-sm text-gray-700">
                                        {subscription.startDate ? new Date(subscription.startDate).toLocaleDateString() : 'N/A'} - {subscription.endDate ? new Date(subscription.endDate).toLocaleDateString() : 'N/A'}
                                    </td>
                                    <td className="py-6 text-right font-black text-gray-900">
                                        ₹{subscription.amount || (subscription.planType === 'MONTHLY' ? '2500' : subscription.planType === 'QUARTERLY' ? '7000' : '25000')}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div className="flex justify-end">
                        <div className="w-64 space-y-3">
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>Subtotal</span>
                                <span>₹{subscription.amount || '0'}</span>
                            </div>
                            <div className="flex justify-between text-sm text-gray-500">
                                <span>Tax (0%)</span>
                                <span>₹0</span>
                            </div>
                            <div className="flex justify-between pt-3 border-t border-gray-200">
                                <span className="font-black uppercase tracking-widest text-xs">Total</span>
                                <span className="text-xl font-black text-primary-500">₹{subscription.amount || '0'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-24 pt-8 border-t border-gray-100 text-center">
                        <p className="text-gray-400 text-xs italic font-bold uppercase tracking-widest">Thank you for eating with MessWalha!</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoicePage;
