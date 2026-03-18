import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Card } from '../components/common/Card';
<<<<<<< HEAD
import { Store, MapPin } from 'lucide-react';
=======
import { Utensils, Building, MapPin, Phone, Mail, Lock, User, Sparkles } from 'lucide-react';
>>>>>>> 3188c9a67539e26bc98942bbe963b9995a127f3a
import { useAppDispatch } from '../../hooks/redux';
import { setCredentials } from '../../store/slices/authSlice';
import api from '../api/axiosInstance';
import { toast } from 'react-hot-toast';
<<<<<<< HEAD
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
=======
>>>>>>> 3188c9a67539e26bc98942bbe963b9995a127f3a
import Seo from '../components/common/Seo';

const OwnerRegistrationPage: React.FC = () => {
    const [formData, setFormData] = useState({
<<<<<<< HEAD
        name: '',
        email: '',
        phone: '',
        password: '',
        messName: '',
        location: '',
        city: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const { executeRecaptcha } = useGoogleReCaptcha();
=======
        ownerName: '',
        phone: '',
        email: '',
        password: '',
        messName: '',
        location: '',
    });
    const [isLoading, setIsLoading] = useState(false);
>>>>>>> 3188c9a67539e26bc98942bbe963b9995a127f3a

    const dispatch = useAppDispatch();
    const navigate = useNavigate();

<<<<<<< HEAD

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

=======
>>>>>>> 3188c9a67539e26bc98942bbe963b9995a127f3a
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

<<<<<<< HEAD
        if (!executeRecaptcha) {
            toast.error('reCAPTCHA not initialized');
            setIsLoading(false);
            return;
        }

        if (formData.password.length < 8) {
            toast.error('Password must be at least 8 characters long');
            setIsLoading(false);
            return;
        }

        try {
            const recaptchaToken = await executeRecaptcha('owner_signup');
            const response = await api.post('/auth/owner-register', {
                ...formData,
                recaptchaToken: recaptchaToken
            });

            dispatch(setCredentials({
                user: response.data.owner,
                token: response.data.token
            }));
            
            toast.success('Successfully registered! Your 60-day trial has started.', { duration: 5000 });
            navigate('/owner-dashboard');
        } catch (error) {
            const err = error as { response?: { data?: { message?: string, errors?: Array<{ msg: string }> } } };
            if (err.response?.data?.errors && err.response.data.errors.length > 0) {
                toast.error(err.response.data.errors[0].msg);
            } else {
                toast.error(err.response?.data?.message || 'Registration failed');
            }
=======
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
>>>>>>> 3188c9a67539e26bc98942bbe963b9995a127f3a
        } finally {
            setIsLoading(false);
        }
    };

    return (
<<<<<<< HEAD
        <div className="min-h-screen flex items-center justify-center bg-navy-950 px-4 py-12 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-[150px] -mr-32 -mt-32 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] -ml-32 -mb-32 pointer-events-none" />
            <Seo 
                title="Partner with FindMess | 60-Day Free Trial for Owners" 
                description="List your mess on India's elite discovery platform. Start your 60-day free trial, reach thousands of students, and manage your culinary business with ease." 
            />
            <Card className="w-full max-w-4xl p-8 sm:p-12 bg-navy-900/50 backdrop-blur-3xl border-navy-800 relative z-10 rounded-[3rem] shadow-2xl">
                <div className="text-center space-y-4 mb-10">
                    <Link to="/" className="inline-flex items-center justify-center p-4 bg-primary-500 rounded-2xl text-white mb-4 shadow-xl shadow-primary-500/20 rotate-3 hover:rotate-0 transition-transform">
                        <Store size={32} />
                    </Link>
                    <h1 className="text-4xl font-black text-white italic tracking-tighter">Partner with FindMess</h1>
                    <p className="text-navy-300 font-medium uppercase tracking-[0.2em] text-[10px]">Register your mess and start your 60-day free trial</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-primary-500 italic pb-2 border-b border-navy-800">Owner Terminal Details</h3>
                            <Input
                                id="owner-name" name="name" label="Full Name" type="text"
                                placeholder="John Doe" value={formData.name} onChange={handleInputChange} required
                            />
                            <Input
                                id="owner-email" name="email" label="Email Address" type="email"
                                placeholder="john@example.com" value={formData.email} onChange={handleInputChange} required
                            />
                            <Input
                                id="owner-phone" name="phone" label="Phone Number" type="tel"
                                placeholder="9876543210" value={formData.phone} onChange={handleInputChange} 
                                pattern="[0-9]{10}" title="Must be exactly 10 digits" required
                            />
                            <Input
                                id="owner-password" name="password" label="Password" type="password"
                                placeholder="••••••••" value={formData.password} onChange={handleInputChange} 
                                minLength={8} required
                            />
                        </div>

                        {/* Mess Information */}
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-primary-500 italic pb-2 border-b border-navy-800">Mess Registry Profile</h3>
                            <Input
                                id="mess-name" name="messName" label="Mess Name" type="text"
                                placeholder="Elite Food Services" value={formData.messName} onChange={handleInputChange} required
                            />
                            <Input
                                id="mess-city" name="city" label="City" type="text"
                                placeholder="Pune" value={formData.city} onChange={handleInputChange} required
                            />
                            <div className="space-y-2">
                                <label className="block text-[11px] font-black uppercase tracking-widest text-navy-300">
                                    Operational Area
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-primary-500">
                                        <MapPin size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        name="location"
                                        className="w-full pl-12 pr-4 py-4 bg-navy-800/20 border border-navy-800 rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-navy-500 transition-all font-medium italic"
                                        placeholder="Kothrud, near MIT College"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="p-6 bg-primary-500/10 rounded-[2rem] mt-6 border border-primary-500/20">
                                <p className="text-[10px] text-white/70 leading-relaxed text-center uppercase tracking-widest font-black">
                                    <span className="text-primary-500 block mb-2 italic">🎁 60-Day Premium Trial</span>
                                    Your secure listing will begin a free trial automatically. <br /> No financial details required.
                                </p>
                            </div>
                        </div>
                    </div>

                    <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                        Complete Registration & Start Trial
=======
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
>>>>>>> 3188c9a67539e26bc98942bbe963b9995a127f3a
                    </Button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-dark-lighter text-center">
                    <p className="text-sm text-gray-500">
<<<<<<< HEAD
                        Already have an owner account?{' '}
=======
                        Already have an account?{' '}
>>>>>>> 3188c9a67539e26bc98942bbe963b9995a127f3a
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
