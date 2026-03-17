import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Card } from '../components/common/Card';
import { Utensils, Building, MapPin, Phone, Mail, Lock, User, Sparkles } from 'lucide-react';
import { useAppDispatch } from '../../hooks/redux';
import { setCredentials } from '../../store/slices/authSlice';
import api from '../api/axiosInstance';
import { toast } from 'react-hot-toast';
import Seo from '../components/common/Seo';

const OwnerRegistrationPage: React.FC = () => {
    const [formData, setFormData] = useState({
        ownerName: '',
        phone: '',
        email: '',
        password: '',
        messName: '',
        location: '',
    });
    const [isLoading, setIsLoading] = useState(false);

    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            if (formData.password.length < 8) {
                toast.error('Password must be at least 8 characters long');
                setIsLoading(false);
                return;
            }

            const response = await api.post('/auth/register-owner', formData);
            dispatch(setCredentials(response.data));
            toast.success('Registration successful! Your 60-day free trial has started.');
            navigate('/owner/dashboard');
        } catch (error) {
            const err = error as {
                response?: {
                    data?: {
                        message?: string;
                    };
                };
            };
            toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark px-4 py-12">
            <Seo title="Register as Mess Owner | FindMess" description="List your mess on FindMess. 60-day free trial, no credit card required." />
            <Card className="w-full max-w-2xl p-8">
                <div className="text-center space-y-2 mb-6">
                    <Link to="/" className="inline-flex items-center justify-center p-3 bg-primary rounded-xl text-white mb-4">
                        <Utensils size={32} />
                    </Link>
                    <h1 className="text-3xl font-heading font-bold">List Your Mess</h1>
                    <p className="text-gray-500">Start reaching students today</p>
                </div>

                {/* Trial Banner */}
                <div className="mb-8 p-4 bg-gradient-to-r from-primary/10 to-orange-500/10 border border-primary/20 rounded-2xl flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-xl shrink-0">
                        <Sparkles size={24} className="text-primary" />
                    </div>
                    <div>
                        <p className="font-bold text-sm text-gray-800 dark:text-white">60-day free trial • No credit card required</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">₹499/month after trial ends. Cancel anytime.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-600 dark:text-gray-300 flex items-center gap-2">
                                <User size={14} /> Owner Name
                            </label>
                            <Input
                                placeholder="Your full name"
                                value={formData.ownerName}
                                onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-600 dark:text-gray-300 flex items-center gap-2">
                                <Phone size={14} /> Phone Number
                            </label>
                            <Input
                                type="tel"
                                placeholder="9876543210"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-600 dark:text-gray-300 flex items-center gap-2">
                                <Mail size={14} /> Email
                            </label>
                            <Input
                                type="email"
                                placeholder="owner@example.com"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-600 dark:text-gray-300 flex items-center gap-2">
                                <Lock size={14} /> Password
                            </label>
                            <Input
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-600 dark:text-gray-300 flex items-center gap-2">
                                <Building size={14} /> Mess Name
                            </label>
                            <Input
                                placeholder="e.g. Shree Krishna Mess"
                                value={formData.messName}
                                onChange={(e) => setFormData({ ...formData, messName: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-bold text-gray-600 dark:text-gray-300 flex items-center gap-2">
                                <MapPin size={14} /> Location
                            </label>
                            <Input
                                placeholder="e.g. Shivaji Nagar, Pune"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <p className="text-xs text-gray-500 text-center">
                        By registering, you agree to our{' '}
                        <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link> and{' '}
                        <Link to="/refund-policy" className="text-primary hover:underline">Refund Policy</Link>.
                    </p>

                    <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                        Start Free Trial
                    </Button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-dark-lighter text-center">
                    <p className="text-sm text-gray-500">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary font-semibold hover:underline">
                            Sign In
                        </Link>
                    </p>
                </div>
            </Card>
        </div>
    );
};

export default OwnerRegistrationPage;
