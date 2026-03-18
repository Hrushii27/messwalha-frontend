import React, { useState, useEffect } from 'react';
import { X, CreditCard, Calendar, Download } from 'lucide-react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import api from '../../api/axiosInstance';
import { toast } from 'react-hot-toast';

interface Payment {
    id: string;
    amount: number;
    transactionId: string;
    status: string;
    createdAt: string;
}

interface BillingHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const BillingHistoryModal: React.FC<BillingHistoryModalProps> = ({ isOpen, onClose }) => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isOpen) {
            const fetchPayments = async () => {
                try {
                    setLoading(true);
                    const response = await api.get('/payments/my');
                    setPayments(response.data.data);
                } catch (error) {
                    console.error('Error fetching billing history:', error);
                    toast.error('Failed to load billing history');
                } finally {
                    setLoading(false);
                }
            };
            fetchPayments();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <Card className="w-full max-w-2xl bg-white dark:bg-dark-card overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-primary/10 rounded-lg text-primary">
                            <CreditCard size={20} />
                        </div>
                        <h2 className="text-xl font-black uppercase tracking-tight">Billing History</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                    >
                        <X size={20} className="text-gray-400" />
                    </button>
                </div>

                <div className="p-6 max-h-[60vh] overflow-y-auto">
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-20 bg-gray-50 dark:bg-gray-800/50 rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : payments.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="inline-flex p-4 bg-gray-50 dark:bg-gray-800 rounded-full mb-4">
                                <Calendar size={32} className="text-gray-300" />
                            </div>
                            <p className="text-gray-500 font-bold">No billing history found.</p>
                            <p className="text-sm text-gray-400 mt-1">Payments from your professional plan will appear here.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {payments.map(payment => (
                                <div
                                    key={payment.id}
                                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800/50 rounded-2xl group hover:bg-primary/5 transition-all border border-transparent hover:border-primary/20"
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className="flex flex-col">
                                            <p className="font-black text-sm uppercase">Professional Plan</p>
                                            <p className="text-xs text-gray-400 flex items-center mt-0.5">
                                                <Calendar size={12} className="mr-1" />
                                                {new Date(payment.createdAt).toLocaleDateString(undefined, {
                                                    year: 'numeric',
                                                    month: 'long',
                                                    day: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center space-x-6 text-right">
                                        <div>
                                            <p className="font-black text-lg text-primary">₹{payment.amount}</p>
                                            <p className="text-[10px] text-gray-400 font-mono tracking-tighter">ID: {payment.transactionId}</p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-[10px] font-black uppercase bg-green-500 text-white px-2 py-1 rounded-lg">
                                                Paid
                                            </span>
                                            <Button variant="ghost" size="sm" className="p-2 h-auto text-gray-400 hover:text-primary">
                                                <Download size={16} />
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="p-6 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-xs text-center text-gray-400 font-bold uppercase tracking-widest">
                        Showing all transaction history • MessWalha Secure Billing
                    </p>
                </div>
            </Card>
        </div>
    );
};

export default BillingHistoryModal;
