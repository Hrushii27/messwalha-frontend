import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Utensils, User, Building, Rocket, CreditCard, BarChart, CheckCircle2, ArrowRight, ChevronLeft } from 'lucide-react';
import { useAppDispatch } from '../../hooks/redux';
import { setCredentials } from '../../store/slices/authSlice';
import api from '../api/axiosInstance';
import { toast } from 'react-hot-toast';
import Seo from '../components/common/Seo';
import { motion, AnimatePresence } from 'framer-motion';

// CACHE_BUST_v3_premium
const weakPasswords = [
    "123456", "password", "qwerty", "111111",
    "abc123", "123123", "000000", "password1",
    "iloveyou", "admin", "letmein", "welcome"
];

const RegisterPage: React.FC = () => {
    const [role, setRole] = useState<'STUDENT' | 'OWNER'>('STUDENT');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        college: '',
        phone: '',
        messName: '',
        location: '',
        city: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [isLoading, setIsLoading] = useState(false);

    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const initScripts = () => {
            if ((window as any).google) {
                (window as any).google.accounts.id.initialize({
                    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "853966580327-r2l2clrt5j1pnu47n6e8bt96l3sq6t6r.apps.googleusercontent.com",
                    callback: handleGoogleLogin
                });
                (window as any).google.accounts.id.renderButton(
                    document.getElementById("google-register-btn"),
                    { theme: "outline", size: "large", width: "100%", text: "signup_with" }
                );
            }
        };

        const timer = setInterval(() => {
            if ((window as any).google) {
                initScripts();
                clearInterval(timer);
            }
        }, 500);

        return () => clearInterval(timer);
    }, []);

    const handleGoogleLogin = async (googleResponse: any) => {
        setIsLoading(true);
        try {
            const response = await api.post('/auth/google', { 
                token: googleResponse.credential,
                role: role // Pass selected role for first-time google login
            });
            if (response.data.requireOtp) {
                toast.success('Google verified. Please check email for OTP.', { duration: 4000 });
                navigate('/login', { state: { email: response.data.email, startWithOtp: true } });
            } else {
                dispatch(setCredentials(response.data));
                toast.success('Successfully registered!');
                navigate(role === 'OWNER' ? '/owner/dashboard' : '/find-mess');
            }
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Google registration failed');
        } finally {
            setIsLoading(false);
        }
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
                if (role === 'OWNER' && !/^[0-9]{10}$/.test(value)) error = "Enter a valid 10-digit phone number";
                break;
            case 'messName':
                if (role === 'OWNER' && !/^[A-Za-z0-9 ]{3,}$/.test(value)) error = "Mess name must be at least 3 characters";
                break;
            case 'city':
                if (role === 'OWNER' && !/^[A-Za-z ]{2,}$/.test(value)) error = "Enter a valid city name";
                break;
            case 'password':
                error = validatePassword(value) || '';
                break;
            case 'confirmPassword':
                if (value !== formData.password) error = "Passwords do not match";
                break;
            case 'college':
                if (role === 'STUDENT' && value.length < 2) error = "Enter a valid college name";
                break;
            case 'location':
                if (role === 'OWNER' && value.length < 5) error = "Enter a valid location (min 5 characters)";
                break;
        }
        return error;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error for the field as user types to avoid "check-type" feel
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = (e.target as HTMLInputElement);
        setTouched(prev => ({ ...prev, [name]: true }));
        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    // Replaced by inline validation in handleSubmit for performance

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Final validation check - mark all fields as touched
        const newErrors: Record<string, string> = {};
        const newTouched: Record<string, boolean> = {};
        Object.keys(formData).forEach(key => {
            newTouched[key] = true;
            const error = validateField(key, formData[key as keyof typeof formData]);
            if (error) newErrors[key] = error;
        });

        setTouched(newTouched);
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            toast.error("Please fix errors before submitting");
            return;
        }

        setIsLoading(true);

        const recaptchaToken = 'off';

        try {
            let response;
            const payload = {
                ...formData,
                name: formData.name.trim(),
                email: formData.email.trim(),
                recaptchaToken
            };

            if (role === 'STUDENT') {
                response = await api.post('/auth/register', {
                    name: payload.name,
                    email: payload.email,
                    password: payload.password,
                    role: 'STUDENT',
                    college: payload.college.trim(),
                    recaptchaToken
                });
            } else {
                response = await api.post('/auth/owner-register', {
                    name: payload.name,
                    email: payload.email,
                    password: payload.password,
                    phone: payload.phone.trim(),
                    messName: payload.messName.trim(),
                    location: payload.location.trim(),
                    city: payload.city.trim(),
                    recaptchaToken
                });
            }

            dispatch(setCredentials(response.data));
            toast.success(role === 'OWNER' ? 'Successfully registered! 60-day trial started.' : 'Welcome to FindMess!');
            navigate(role === 'OWNER' ? '/owner/dashboard' : '/find-mess');
        } catch (error: any) {
            const errorMessage = error.response?.data?.message;
            if (errorMessage === 'Email already registered') {
                setErrors(prev => ({ ...prev, email: "Account already exists. Please sign in." }));
                toast.error("This email is already registered");
            } else if (errorMessage === 'Phone number already registered') {
                setErrors(prev => ({ ...prev, phone: "This phone number is already registered" }));
                toast.error("This phone number is already registered");
            } else {
                const finalMsg = error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || 'Registration failed';
                toast.error(finalMsg);
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Replaced by inline validation in handleSubmit for performance

    return (
        <div className="min-h-screen bg-navy-950 flex flex-col lg:flex-row relative overflow-hidden">
            <Seo 
                title="Join FindMess | Create Your Elite Account" 
                description="Join the elite discovery platform for mess & tiffin services. Create your account to start discovering or listing verified services." 
            />

            {/* Background Gradients */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[120px] -mr-32 -mt-32 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] -ml-32 -mb-32 pointer-events-none" />

            {/* LEFT PANEL: Branding + Benefits */}
            <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-24 relative z-10 py-20 bg-navy-900/30">
                <div className="max-w-md">
                    <Link to="/" className="inline-flex items-center space-x-3 mb-16">
                        <div className="w-12 h-12 bg-primary-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/40">
                            <Utensils size={28} />
                        </div>
                        <span className="text-3xl font-heading font-black tracking-tighter text-white">
                            FIND<span className="text-primary-500">MESS</span>
                        </span>
                    </Link>

                    <div className="space-y-12">
                        <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="space-y-4">
                            <h2 className="text-4xl xl:text-5xl font-black text-white italic leading-tight tracking-tighter">
                                Start Your Culinary <br />
                                <span className="text-primary-500 italic">Journey Today</span>
                            </h2>
                            <p className="text-navy-300 text-lg font-medium italic">
                                Join the network of premium mess services and hungry students.
                            </p>
                        </motion.div>

                        <div className="space-y-6">
                            <BenefitItem 
                                icon={Rocket} 
                                title="60-day free trial" 
                                desc="List your mess and reach thousands of hungry students near your location." 
                            />
                            <BenefitItem 
                                icon={CreditCard} 
                                title="Only ₹499/month after" 
                                desc="The most affordable listing plan. Cancel any time, no questions asked." 
                            />
                            <BenefitItem 
                                icon={BarChart} 
                                title="Full owner dashboard" 
                                desc="Manage photos, menus, reply to reviews, and track performance metrics." 
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* RIGHT PANEL: Form */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 lg:p-24 relative z-10 w-full overflow-y-auto">
                {/* Mobile Back Button */}
                <Link to="/" className="absolute top-8 left-8 p-3 bg-white/5 rounded-xl text-white/40 hover:text-white transition-all lg:hidden">
                    <ChevronLeft size={24} />
                </Link>

                {/* Mobile Logo */}
                <div className="lg:hidden flex items-center space-x-3 mb-12">
                    <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center text-white">
                        <Utensils size={24} />
                    </div>
                    <span className="text-2xl font-heading font-black tracking-tighter text-white">
                        FIND<span className="text-primary-500">MESS</span>
                    </span>
                </div>

                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-2xl">
                    <Card className="w-full p-8 md:p-12 bg-navy-900/50 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl relative">
                        <div className="text-center space-y-3 mb-10">
                            <h1 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter">Create Account</h1>
                            <p className="text-navy-300 font-black uppercase tracking-[0.2em] text-[10px] md:text-xs italic">Join FindMess and start your journey</p>
                        </div>

                        <div className="space-y-8">
                            {/* Google Signup */}
                            <div id="google-register-btn" className="w-full"></div>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-navy-800"></span>
                                </div>
                                <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.3em]">
                                    <span className="px-4 bg-navy-950 lg:bg-navy-900/50 text-navy-400">Or continue with</span>
                                </div>
                            </div>

                            {/* Role Selection */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 pb-2">
                                <button
                                    type="button"
                                    onClick={() => setRole('STUDENT')}
                                    className={`flex flex-col items-center p-6 rounded-[2rem] border-2 transition-all duration-500 relative group overflow-hidden ${role === 'STUDENT'
                                        ? 'border-primary-500 bg-primary-500/10 shadow-[0_0_30px_rgba(249,115,22,0.15)]'
                                        : 'border-navy-800 bg-navy-800/20 hover:border-navy-700'
                                    }`}
                                >
                                    <div className={`p-4 rounded-2xl mb-4 transition-all duration-500 ${role === 'STUDENT' ? 'bg-primary-500 text-white scale-110' : 'bg-navy-800 text-navy-400'}`}>
                                        <User size={24} />
                                    </div>
                                    <span className="font-black uppercase tracking-widest text-[11px] text-white italic">I'm a Student</span>
                                    <span className="text-[9px] text-navy-400 mt-1 uppercase tracking-tighter font-medium italic">Find a mess near me</span>
                                    {role === 'STUDENT' && (
                                        <div className="absolute top-4 right-4 text-primary-500">
                                            <CheckCircle2 size={16} />
                                        </div>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setRole('OWNER')}
                                    className={`flex flex-col items-center p-6 rounded-[2rem] border-2 transition-all duration-500 relative group overflow-hidden ${role === 'OWNER'
                                        ? 'border-primary-500 bg-primary-500/10 shadow-[0_0_30px_rgba(249,115,22,0.15)]'
                                        : 'border-navy-800 bg-navy-800/20 hover:border-navy-700'
                                    }`}
                                >
                                    <div className={`p-4 rounded-2xl mb-4 transition-all duration-500 ${role === 'OWNER' ? 'bg-primary-500 text-white scale-110' : 'bg-navy-800 text-navy-400'}`}>
                                        <Building size={24} />
                                    </div>
                                    <span className="font-black uppercase tracking-widest text-[11px] text-white italic">I'm an Owner</span>
                                    <span className="text-[9px] text-navy-400 mt-1 uppercase tracking-tighter font-medium italic">List my mess free</span>
                                    {role === 'OWNER' && (
                                        <div className="absolute top-4 right-4 text-primary-500">
                                            <CheckCircle2 size={16} />
                                        </div>
                                    )}
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <AnimatePresence mode="wait">
                                    {role === 'OWNER' && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: -20 }}
                                            className="p-4 bg-green-500/10 border border-green-500/20 rounded-2xl flex items-center space-x-3"
                                        >
                                            <div className="p-2 bg-green-500/20 rounded-lg text-green-500">
                                                <CheckCircle2 size={16} />
                                            </div>
                                            <p className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-green-400 italic">
                                                ✓ 60-day free trial • No credit card needed • ₹499/month after
                                            </p>
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <Input
                                        id="reg-name"
                                        label={role === 'OWNER' ? "Owner Name" : "Full Name"}
                                        name="name"
                                        placeholder="Enter your name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        error={errors.name}
                                        isTouched={touched.name}
                                        required
                                        className="h-14 lg:h-16"
                                    />
                                    {role === 'STUDENT' ? (
                                        <Input
                                            id="reg-college"
                                            label="College"
                                            name="college"
                                            placeholder="Enter college name"
                                            value={formData.college}
                                            onChange={handleInputChange}
                                            onBlur={handleBlur}
                                            error={errors.college}
                                            isTouched={touched.college}
                                            required
                                            className="h-14 lg:h-16"
                                        />
                                    ) : (
                                        <Input
                                            id="reg-phone"
                                            label="Phone Number"
                                            name="phone"
                                            type="tel"
                                            placeholder="10-digit number"
                                            value={formData.phone}
                                            onChange={handleInputChange}
                                            onBlur={handleBlur}
                                            error={errors.phone}
                                            isTouched={touched.phone}
                                            required
                                            className="h-14 lg:h-16"
                                        />
                                    )}

                                    {role === 'OWNER' && (
                                        <>
                                            <Input
                                                id="reg-messName"
                                                label="Mess Name"
                                                name="messName"
                                                placeholder="Enter mess name"
                                                value={formData.messName}
                                                onChange={handleInputChange}
                                                onBlur={handleBlur}
                                                error={errors.messName}
                                                isTouched={touched.messName}
                                                required
                                                className="h-14 lg:h-16"
                                            />
                                            <Input
                                                id="reg-location"
                                                label="Location / Area"
                                                name="location"
                                                placeholder="Area name"
                                                value={formData.location}
                                                onChange={handleInputChange}
                                                onBlur={handleBlur}
                                                error={errors.location}
                                                isTouched={touched.location}
                                                required
                                                className="h-14 lg:h-16"
                                            />
                                            <Input
                                                id="reg-city"
                                                label="City"
                                                name="city"
                                                placeholder="City name"
                                                value={formData.city}
                                                onChange={handleInputChange}
                                                onBlur={handleBlur}
                                                error={errors.city}
                                                isTouched={touched.city}
                                                required
                                                className="h-14 lg:h-16"
                                            />
                                        </>
                                    )}

                                    <Input
                                        id="reg-email"
                                        label="Email Address"
                                        name="email"
                                        type="email"
                                        placeholder="Enter email address"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        error={errors.email}
                                        isTouched={touched.email}
                                        required
                                        className={`h-14 lg:h-16 ${role === 'STUDENT' ? 'sm:col-span-2' : ''}`}
                                    />
                                    <Input
                                        id="reg-password"
                                        label="Password"
                                        name="password"
                                        type="password"
                                        placeholder="Min 6 characters, mixed case"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        error={errors.password}
                                        isTouched={touched.password}
                                        required
                                        className="h-14 lg:h-16 sm:col-span-2"
                                    />
                                    <Input
                                        id="reg-confirm-password"
                                        label="Confirm Password"
                                        name="confirmPassword"
                                        type="password"
                                        placeholder="Retype password"
                                        value={formData.confirmPassword}
                                        onChange={handleInputChange}
                                        onBlur={handleBlur}
                                        error={errors.confirmPassword}
                                        isTouched={touched.confirmPassword}
                                        required
                                        className="h-14 lg:h-16 sm:col-span-2"
                                    />
                                </div>

                                <Button 
                                    type="submit" 
                                    className={`w-full h-14 md:h-18 py-6 shadow-2xl font-black uppercase tracking-[0.2em] italic text-[11px] transition-all bg-primary-500 shadow-primary-500/20 opacity-100`}
                                    size="lg" 
                                    isLoading={isLoading}
                                    disabled={isLoading}
                                >
                                    <span className="flex items-center space-x-2">
                                        <span>{isLoading ? 'Creating Account...' : 'Create Account'}</span>
                                        {!isLoading && <ArrowRight size={20} />}
                                    </span>
                                </Button>
                            </form>
                        </div>

                        <div className="mt-10 pt-8 border-t border-navy-800 text-center">
                            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-navy-400 italic">
                                Already have an account?{' '}
                                <Link to="/login" className="text-primary-500 font-black hover:text-primary-400 transition-colors italic">
                                    Sign In
                                </Link>
                            </p>
                        </div>
                    </Card>

                    {/* Mobile Benefits - Stacked at bottom */}
                    <div className="mt-16 sm:mt-24 space-y-6 lg:hidden">
                        <div className="h-px bg-white/5 w-full mb-12"></div>
                        <BenefitItem 
                            icon={Rocket} 
                            title="60-day free trial" 
                            desc="List your mess and reach students near your location." 
                        />
                        <BenefitItem 
                            icon={CreditCard} 
                            title="Only ₹499/month after" 
                            desc="Affordable listing plan. Cancel any time." 
                        />
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

// --- Extracted Components for Performance ---

const BenefitItem = ({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) => (
    <div className="flex items-start space-x-6 p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-primary-500/50 transition-all group overflow-hidden relative">
        <div className="absolute inset-0 bg-primary-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
        <div className="p-4 bg-navy-800 rounded-2xl text-primary-500 shadow-lg group-hover:shadow-primary-500/20 group-hover:scale-110 transition-all relative z-10">
            <Icon size={24} />
        </div>
        <div className="relative z-10">
            <h3 className="font-black text-white uppercase tracking-widest text-[11px] mb-1 italic">{title}</h3>
            <p className="text-navy-300 text-[10px] leading-relaxed uppercase tracking-widest">{desc}</p>
        </div>
    </div>
);

const Input = React.memo(({ label, id, error, isTouched, ...props }: any) => (
    <div className="space-y-2">
        <label htmlFor={id} className="text-[10px] font-black uppercase tracking-[0.2em] text-navy-400 italic px-1 block">
            {label}
        </label>
        <input
            id={id}
            {...props}
            className={`w-full bg-navy-800/50 border border-white/5 rounded-2xl px-6 outline-none focus:border-primary-500/50 focus:bg-navy-800 transition-all text-white font-medium placeholder:text-navy-600 ${props.className || ''} ${isTouched && error ? 'border-red-500/50' : ''}`}
            autoComplete="off"
        />
        {isTouched && error && (
            <p className="font-black italic px-1" style={{ color: '#E84B4B', fontSize: '10px', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {error}
            </p>
        )}
    </div>
));

Input.displayName = 'FormInput';

export default RegisterPage;
