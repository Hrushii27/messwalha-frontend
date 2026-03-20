import React, { useState } from 'react';
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

const weakPasswords = [
    "123456", "password", "qwerty", "111111",
    "abc123", "123123", "000000", "password1",
    "iloveyou", "admin", "letmein", "welcome"
];

const OwnerRegistrationPage: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        messName: '',
        location: '',
        city: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);

    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const validatePassword = (pass: string) => {
        if (!pass) return "Password is required";
        if (weakPasswords.includes(pass.toLowerCase())) {
            return 'This password is too weak. Use a stronger password.';
        }
        if (pass.length < 6) return 'Password must be at least 6 characters long';
        if (!/[a-z]/.test(pass)) return 'Password must contain at least one lowercase letter';
        if (!/[A-Z]/.test(pass)) return 'Password must contain at least one uppercase letter';
        if (!/[0-9]/.test(pass)) return 'Password must contain at least one number';
        return null;
    };

    const validateField = (name: string, value: string) => {
        let error = '';
        switch (name) {
            case 'name':
                if (!/^[A-Za-z ]{2,}$/.test(value)) error = "Enter a valid full name (min 2 characters)";
                break;
            case 'email':
                if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) error = "Enter a valid email address";
                break;
            case 'phone':
                if (!/^[0-9]{10}$/.test(value)) error = "Enter a valid 10-digit phone number";
                break;
            case 'messName':
                if (!/^[A-Za-z0-9 ]{3,}$/.test(value)) error = "Mess name must be at least 3 characters";
                break;
            case 'city':
                if (!/^[A-Za-z ]{2,}$/.test(value)) error = "Enter a valid city name";
                break;
            case 'password':
                error = validatePassword(value) || '';
                break;
            case 'confirmPassword':
                if (value !== formData.password) error = "Passwords do not match";
                break;
            case 'location':
                if (value.length < 5) error = "Enter a valid location (min 5 characters)";
                break;
        }
        return error;
    };

    const isFormValid = () => {
        const requiredFields = ['name', 'email', 'phone', 'password', 'confirmPassword', 'messName', 'location', 'city'];
        return requiredFields.every(field => {
            const val = formData[field as keyof typeof formData];
            return val && !validateField(field, val);
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors: Record<string, string> = {};
        Object.keys(formData).forEach(key => {
            const error = validateField(key, formData[key as keyof typeof formData]);
            if (error) newErrors[key] = error;
        });

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error("Please fix errors before submitting");
            return;
        }

        setIsLoading(true);

        try {
            const response = await api.post('/auth/owner-register', {
                ...formData,
                name: formData.name.trim(),
                email: formData.email.trim(),
                phone: formData.phone.trim(),
                messName: formData.messName.trim(),
                location: formData.location.trim(),
                city: formData.city.trim(),
                recaptchaToken: 'bypassed'
            });

            dispatch(setCredentials(response.data));
            
            toast.success('Successfully registered! Your 60-day trial has started.', { duration: 5000 });
            navigate('/owner/dashboard');
        } catch (error: any) {
            const errorMessage = error.response?.data?.message;
            if (errorMessage === 'Email already registered') {
                setErrors(prev => ({ ...prev, email: "Account already exists. Please sign in." }));
                toast.error("This email is already registered");
            } else if (errorMessage === 'Phone number already registered') {
                setErrors(prev => ({ ...prev, phone: "This phone number is already registered" }));
                toast.error("This phone number is already registered");
            } else if (error.response?.data?.errors && error.response.data.errors.length > 0) {
                toast.error(error.response.data.errors[0].msg);
            } else {
                toast.error(error.response?.data?.message || 'Registration failed');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg px-4 py-12 relative overflow-hidden">
            {/* Background Gradients */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-500/10 rounded-full blur-[150px] -mr-32 -mt-32 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[120px] -ml-32 -mb-32 pointer-events-none" />
            <Seo 
                title="Partner with FindMess | 60-Day Free Trial for Owners" 
                description="List your mess on India's elite discovery platform. Start your 60-day free trial, reach thousands of students, and manage your culinary business with ease." 
            />
            <Card className="w-full max-w-4xl p-8 sm:p-12 bg-bg2/50 backdrop-blur-3xl border border-white/10 relative z-10 rounded-[3rem] shadow-2xl">
                <div className="text-center space-y-4 mb-10">
                    <Link to="/" className="inline-flex items-center justify-center p-4 bg-primary-500 rounded-2xl text-white mb-4 shadow-xl shadow-primary-500/20 rotate-3 hover:rotate-0 transition-transform">
                        <Store size={32} />
                    </Link>
                    <h1 className="text-4xl font-black text-white italic tracking-tighter">Partner with FindMess</h1>
                    <p className="text-text-secondary font-medium uppercase tracking-[0.2em] text-[10px]">Register your mess and start your 60-day free trial</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-primary-500 italic pb-2 border-b border-white/10">Owner Terminal Details</h3>
                            <Input
                                id="owner-name" name="name" label="Full Name" type="text"
                                placeholder="Enter your full name" value={formData.name} 
                                onChange={handleInputChange} onBlur={handleBlur} error={errors.name} required
                            />
                            <Input
                                id="owner-email" name="email" label="Email Address" type="email"
                                placeholder="Enter email address" value={formData.email} 
                                onChange={handleInputChange} onBlur={handleBlur} error={errors.email} required
                            />
                            <Input
                                id="owner-phone" name="phone" label="Phone Number" type="tel"
                                placeholder="10-digit mobile number" value={formData.phone} 
                                onChange={handleInputChange} onBlur={handleBlur} error={errors.phone} required
                            />
                             <Input
                                id="owner-password" name="password" label="Password" type="password"
                                placeholder="Min 6 chars, mixed case" value={formData.password} 
                                onChange={handleInputChange} onBlur={handleBlur} error={errors.password} required
                            />
                            <Input
                                id="owner-confirm-password" name="confirmPassword" label="Confirm Password" type="password"
                                placeholder="Retype password" value={formData.confirmPassword} 
                                onChange={handleInputChange} onBlur={handleBlur} error={errors.confirmPassword} required
                            />
                        </div>

                        {/* Mess Information */}
                        <div className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-primary-500 italic pb-2 border-b border-white/10">Mess Registry Profile</h3>
                             <Input
                                id="mess-name" name="messName" label="Mess Name" type="text"
                                placeholder="Enter your mess name" value={formData.messName} 
                                onChange={handleInputChange} onBlur={handleBlur} error={errors.messName} required
                            />
                             <Input
                                id="mess-city" name="city" label="City" type="text"
                                placeholder="e.g. Pune" value={formData.city} 
                                onChange={handleInputChange} onBlur={handleBlur} error={errors.city} required
                            />
                            <div className="space-y-2">
                                <label className="block text-[11px] font-black uppercase tracking-widest text-text-secondary">
                                    Operational Area
                                </label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-primary-500">
                                         <MapPin size={18} />
                                    </div>
                                    <input
                                        type="text"
                                        name="location"
                                        className={`w-full pl-12 pr-4 py-4 bg-bg3/20 border ${errors.location ? 'border-red-500/50' : 'border-white/10'} rounded-2xl focus:ring-2 focus:ring-primary-500 focus:border-transparent text-white placeholder-navy-500 transition-all font-medium italic`}
                                        placeholder="Kothrud, near MIT College"
                                        value={formData.location}
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        required
                                    />
                                </div>
                                {errors.location && (
                                    <p className="font-black italic px-1 mt-1" style={{ color: '#E84B4B', fontSize: '10px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                                        {errors.location}
                                    </p>
                                )}
                            </div>
                            <div className="p-6 bg-primary-500/10 rounded-[2rem] mt-6 border border-primary-500/20">
                                <p className="text-[10px] text-text-secondary leading-relaxed text-center uppercase tracking-widest font-black">
                                    <span className="text-primary-500 block mb-2 italic">🎁 60-Day Premium Trial</span>
                                    Your secure listing will begin a free trial automatically. <br /> No financial details required.
                                </p>
                            </div>
                        </div>
                    </div>

                     <Button 
                        type="submit" 
                        className={`w-full transition-all ${isFormValid() ? 'opacity-100' : 'opacity-50 cursor-not-allowed'}`} 
                        size="lg" 
                        isLoading={isLoading}
                        disabled={!isFormValid() || isLoading}
                    >
                        {isLoading ? 'Processing Registration...' : 'Complete Registration & Start Trial'}
                    </Button>
                </form>

                <div className="mt-8 pt-6 border-t border-white/10 text-center">
                    <p className="text-sm text-text-muted">
                        Already have an owner account?{' '}
                        <Link to="/login" className="text-primary-500 font-semibold hover:underline italic">
                            Sign In
                        </Link>
                    </p>
                </div>
            </Card>
        </div>
    );
};

export default OwnerRegistrationPage;
