import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Card } from '../components/common/Card';
import { Store, MapPin } from 'lucide-react';
import { useAppDispatch } from '../../hooks/redux';
import { setCredentials } from '../../store/slices/authSlice';
import api from '../api/axiosInstance';
import { toast } from 'react-hot-toast';
import Seo from '../components/common/Seo';

const OwnerRegistrationPage: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        messName: '',
        location: '',
        city: '',
    });
    const [isLoading, setIsLoading] = useState(false);

    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const initRecaptcha = () => {
            if ((window as any).grecaptcha && (window as any).grecaptcha.render) {
                const container = document.getElementById('owner-recaptcha-container');
                if (container && container.innerHTML === '') {
                    (window as any).grecaptcha.render('owner-recaptcha-container', {
                        'sitekey': import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6Ld48IssAAAAACSSpuDv2_NC8bNqQBol2lpFpsM7",
                        'theme': document.documentElement.classList.contains('dark') ? 'dark' : 'light'
                    });
                }
            }
        };

        const timer = setInterval(() => {
            if ((window as any).grecaptcha) {
                initRecaptcha();
                clearInterval(timer);
            }
        }, 500);

        return () => clearInterval(timer);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const recaptchaResponse = (window as any).grecaptcha?.getResponse();
        if (!recaptchaResponse) {
            toast.error('Please complete the reCAPTCHA verification');
            setIsLoading(false);
            return;
        }

        if (formData.password.length < 8) {
            toast.error('Password must be at least 8 characters long');
            setIsLoading(false);
            return;
        }

        try {
            const response = await api.post('/auth/owner-register', {
                ...formData,
                recaptchaToken: recaptchaResponse
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
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark px-4 py-12">
            <Seo 
                title="Register Your Mess" 
                description="List your mess on FindMess and reach thousands of students. Start your 60-day free trial today!" 
            />
            <Card className="w-full max-w-3xl p-8">
                <div className="text-center space-y-2 mb-8">
                    <div className="inline-flex items-center justify-center p-3 bg-primary rounded-xl text-white mb-4">
                        <Store size={32} />
                    </div>
                    <h1 className="text-3xl font-heading font-bold">Partner with FindMess</h1>
                    <p className="text-gray-500">Register your mess and start your 60-day free trial</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Personal Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b pb-2">Owner Details</h3>
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
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 border-b pb-2">Mess Details</h3>
                            <Input
                                id="mess-name" name="messName" label="Mess Name" type="text"
                                placeholder="Shree Krishna Food Services" value={formData.messName} onChange={handleInputChange} required
                            />
                            <Input
                                id="mess-city" name="city" label="City" type="text"
                                placeholder="Pune" value={formData.city} onChange={handleInputChange} required
                            />
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Specific Location / Area
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                                        <MapPin size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        name="location"
                                        className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-dark-lighter rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-dark-lighter text-gray-900 dark:text-white"
                                        placeholder="Kothrud, near MIT College"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-lg mt-4 border border-orange-100 dark:border-orange-800/20">
                                <p className="text-sm text-orange-800 dark:text-orange-200 leading-relaxed text-center">
                                    <span className="font-semibold block mb-1">🎁 60-Day Free Trial</span>
                                    You will automatically begin a free trial upon registration. No credit card required.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center my-6">
                        <div id="owner-recaptcha-container"></div>
                    </div>

                    <Button type="submit" className="w-full mt-8" size="lg" isLoading={isLoading}>
                        Complete Registration & Start Trial
                    </Button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-dark-lighter text-center">
                    <p className="text-sm text-gray-500">
                        Already have an owner account?{' '}
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
