import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Utensils, User, Building, Rocket, CreditCard, BarChart, CheckCircle2, ArrowRight, ChevronLeft } from 'lucide-react';
import { useAppDispatch } from '../../hooks/redux';
import { setCredentials } from '../../store/slices/authSlice';
import api from '../api/axiosInstance';
import { toast } from 'react-hot-toast';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import Seo from '../components/common/Seo';
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from '../components/common/Input';

const RegisterPage: React.FC = () => {
    const [role, setRole] = useState<'STUDENT' | 'OWNER'>('STUDENT');
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        college: '',
        phone: '',
        messName: '',
        location: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const { executeRecaptcha } = useGoogleReCaptcha();

    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const initScripts = () => {
            if ((window as any).google) {
                (window as any).google.accounts.id.initialize({
                    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        let recaptchaToken = '';
        try {
            if (executeRecaptcha) {
                recaptchaToken = await executeRecaptcha('signup');
            }
        } catch (reError) {
            console.error('reCAPTCHA execution failed:', reError);
        }

        if (formData.password.length < 8) {
            toast.error('Password must be at least 8 characters long');
            setIsLoading(false);
            return;
        }

        try {
            let response;
            if (role === 'STUDENT') {
                response = await api.post('/auth/register', {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    role: 'STUDENT',
                    college: formData.college,
                    recaptchaToken
                });
            } else {
                response = await api.post('/auth/owner-register', {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    phone: formData.phone,
                    messName: formData.messName,
                    location: formData.location,
                    recaptchaToken
                });
            }

            dispatch(setCredentials(response.data));
            toast.success(role === 'OWNER' ? 'Successfully registered! 60-day trial started.' : 'Welcome to FindMess!');
            navigate(role === 'OWNER' ? '/owner/dashboard' : '/find-mess');
        } catch (error: any) {
            const errorMessage = error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || 'Registration failed';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

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
                    <Card className="w-full p-8 md:p-12 bg-navy-900/50 backdrop-blur-3xl border-navy-800 rounded-[2.5rem] md:rounded-[3rem] shadow-2xl relative">
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
                                        placeholder={role === 'OWNER' ? "Rajesh Kumar" : "Priya Sharma"}
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        required
                                        className="h-14 lg:h-16"
                                    />
                                    {role === 'STUDENT' ? (
                                        <Input
                                            id="reg-college"
                                            label="College"
                                            name="college"
                                            placeholder="COEP, Pune"
                                            value={formData.college}
                                            onChange={handleInputChange}
                                            required
                                            className="h-14 lg:h-16"
                                        />
                                    ) : (
                                        <Input
                                            id="reg-phone"
                                            label="Phone Number"
                                            name="phone"
                                            type="tel"
                                            placeholder="+91 98765 43210"
                                            value={formData.phone}
                                            onChange={handleInputChange}
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
                                                placeholder="e.g. Shree Krishna Mess"
                                                value={formData.messName}
                                                onChange={handleInputChange}
                                                required
                                                className="h-14 lg:h-16"
                                            />
                                            <Input
                                                id="reg-location"
                                                label="Location / Area"
                                                name="location"
                                                placeholder="Deccan, Pune"
                                                value={formData.location}
                                                onChange={handleInputChange}
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
                                        placeholder="your@email.com"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        className={`h-14 lg:h-16 ${role === 'STUDENT' ? 'sm:col-span-2' : ''}`}
                                    />
                                    <Input
                                        id="reg-password"
                                        label="Password"
                                        name="password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={handleInputChange}
                                        required
                                        className="h-14 lg:h-16 sm:col-span-2"
                                    />
                                </div>

                                <Button 
                                    type="submit" 
                                    className="w-full h-14 md:h-18 bg-primary-500 py-6 shadow-2xl shadow-primary-500/20 font-black uppercase tracking-[0.2em] italic text-[11px]" 
                                    size="lg" 
                                    isLoading={isLoading}
                                >
                                    <span className="flex items-center space-x-2">
                                        <span>Create Account</span>
                                        <ArrowRight size={20} />
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
                            desc="The most affordable listing plan. Cancel any time." 
                        />
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default RegisterPage;
