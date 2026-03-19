import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Utensils, Mail, ShieldCheck, Zap, CreditCard, BarChart3, ChevronLeft } from 'lucide-react';
import { useAppDispatch } from '../../hooks/redux';
import { setCredentials } from '../../store/slices/authSlice';
import api from '../api/axiosInstance';
import Seo from '../components/common/Seo';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';

const LoginPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [loginMode, setLoginMode] = useState<'password' | 'otp'>('password');
    const [otpStep, setOtpStep] = useState<1 | 2>(1);

    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const location = useLocation();

    // Clear error on mount to resolve "stuck" errors
    useEffect(() => {
        setError('');
    }, []);

    // Check if navigated from Registration Google Auth requiring OTP
    useEffect(() => {
        const state = location.state as { email?: string; startWithOtp?: boolean } | null;
        if (state?.startWithOtp && state?.email) {
            setEmail(state.email);
            setLoginMode('otp');
            setOtpStep(2); // Jump straight to verify
        }
    }, [location]);

    // Google Auth Initialization
    useEffect(() => {
        const initScripts = () => {
            if ((window as any).google) {
                (window as any).google.accounts.id.initialize({
                    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
                    callback: handleGoogleLogin
                });
                (window as any).google.accounts.id.renderButton(
                    document.getElementById("google-login-btn"),
                    { theme: "outline", size: "large", width: "100%", text: "continue_with" }
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
            const response = await api.post('/auth/google', { token: googleResponse.credential });
            
            if (response.data.requireOtp) {
                setEmail(response.data.email);
                setLoginMode('otp');
                setOtpStep(2);
                toast.success('Google verified. Please check email for OTP.', { duration: 4000 });
            } else {
                dispatch(setCredentials(response.data));
                toast.success('Logged in with Google!');
                navigate('/dashboard');
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Google login failed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            await api.post('/auth/send-otp', { email });
            setOtpStep(2);
            toast.success('OTP sent to your email');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        try {
            const response = await api.post('/auth/verify-otp', { email, otp });
            dispatch(setCredentials(response.data));
            toast.success('Welcome back!');
            navigate('/dashboard');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Invalid OTP');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const recaptchaToken = 'bypassed';
            const response = await api.post('/auth/login', { email, password, recaptchaToken });
            dispatch(setCredentials(response.data));
            navigate('/dashboard');
        } catch (error) {
            const err = error as { response?: { data?: { message?: string; error?: string } } };
            const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Login failed. Please try again.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-navy-950 flex flex-col lg:flex-row relative overflow-hidden">
            <Seo 
                title="Login | Access Your Elite Mess Terminal | FindMess" 
                description="Sign in to your FindMess account to manage subscriptions, track meal plans, and communicate with verified mess owners." 
            />

            {/* Background Gradients */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-[120px] -mr-32 -mt-32 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/10 rounded-full blur-[100px] -ml-32 -mb-32 pointer-events-none" />

            {/* Left Panel: Branding & Benefits */}
            <div 
                className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 xl:px-24 relative z-10 py-20"
                style={{ 
                    background: 'linear-gradient(135deg, #0D1220 0%, #111826 50%, #18213A 100%)' 
                }}
            >
                {/* Subtle Readability Overlay */}
                <div 
                    className="absolute inset-0 z-0 pointer-events-none"
                    style={{ 
                        background: 'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.6))' 
                    }}
                />
                <div className="max-w-md relative z-10">
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
                            <h2 
                                className="text-4xl xl:text-5xl font-black text-white italic leading-tight tracking-tighter"
                                style={{ textShadow: '0 0 20px rgba(232,98,42,0.25)' }}
                            >
                                Elite Mess <br />
                                <span className="text-primary-500 italic">Discovery Terminal</span>
                            </h2>
                            <p 
                                className="text-lg font-medium italic"
                                style={{ color: 'rgba(232,238,255,0.8)' }}
                            >
                                Access your personalized dashboard and manage your culinary journey.
                            </p>
                        </motion.div>

                        <div className="space-y-8">
                            {[
                                { icon: Zap, title: 'Instant Access', desc: 'Secure login with military-grade encryption.' },
                                { icon: CreditCard, title: 'Smart Payments', desc: 'Track your subscriptions and digital receipts.' },
                                { icon: BarChart3, title: 'Personalized Stats', desc: 'Monitor your nutrition and spending alerts.' }
                            ].map((feature, i) => (
                                <motion.div 
                                    key={i}
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    transition={{ delay: 0.2 + i * 0.1 }}
                                    className="flex items-start space-x-6 group"
                                >
                                    <div 
                                        className="w-14 h-14 rounded-2xl flex items-center justify-center text-primary-500 group-hover:bg-primary-500 group-hover:text-white transition-all duration-500 shadow-xl group-hover:shadow-primary-500/20"
                                        style={{ 
                                            background: 'rgba(232,98,42,0.15)',
                                            border: '1px solid rgba(232,98,42,0.3)'
                                        }}
                                    >
                                        <feature.icon size={24} />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-[11px] font-black uppercase tracking-widest text-white italic">{feature.title}</h3>
                                        <p 
                                            className="text-sm font-medium"
                                            style={{ color: 'rgba(232,238,255,0.6)' }}
                                        >
                                            {feature.desc}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel: Form */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 lg:p-24 relative z-10 w-full overflow-y-auto">
                {/* Mobile Back Button */}
                <Link to="/" className="absolute top-8 left-8 p-3 bg-white/5 rounded-xl text-white/40 hover:text-white transition-all lg:hidden">
                    <ChevronLeft size={24} />
                </Link>

                {/* Mobile Logo */}
                <Link to="/" className="flex items-center space-x-3 mb-12 lg:hidden">
                    <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center text-white">
                        <Utensils size={24} />
                    </div>
                    <span className="text-2xl font-heading font-black tracking-tighter text-white">
                        FIND<span className="text-primary-500">MESS</span>
                    </span>
                </Link>

                <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-full max-w-md">
                    <div className="mb-10 text-center lg:text-left">
                        <h1 className="text-3xl md:text-5xl font-black text-white italic tracking-tighter mb-3">Welcome Back</h1>
                        <p className="text-navy-300 font-black uppercase tracking-[0.2em] text-[10px] md:text-xs">Sign in to access your elite terminal</p>
                    </div>

                    <div className="space-y-4">
                        {/* Google Login Section */}
                        <div id="google-login-btn" className="w-full"></div>

                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-navy-800"></span>
                            </div>
                            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.3em]">
                                <span className="px-4 bg-navy-950 text-navy-400">Or continue with</span>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 text-red-400 p-4 rounded-xl text-xs border border-red-500/20 mb-6 font-medium italic">
                                {error}
                            </div>
                        )}

                        {loginMode === 'password' ? (
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-4">
                                    <Input
                                        id="login-email"
                                        label="Email Address"
                                        type="email"
                                        placeholder="name@example.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="h-14 md:h-16 transition-all"
                                        style={{ 
                                            background: '#111826',
                                            color: '#E8EEFF',
                                            border: '1px solid rgba(255,255,255,0.10)'
                                        }}
                                        onFocus={(e) => {
                                            e.currentTarget.style.border = '1px solid rgba(232,98,42,0.5)';
                                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(232,98,42,0.15)';
                                        }}
                                        onBlur={(e) => {
                                            e.currentTarget.style.border = '1px solid rgba(255,255,255,0.10)';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    />
                                    <Input
                                        id="login-password"
                                        label="Password"
                                        type="password"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        className="h-14 md:h-16 transition-all"
                                        style={{ 
                                            background: '#111826',
                                            color: '#E8EEFF',
                                            border: '1px solid rgba(255,255,255,0.10)'
                                        }}
                                        onFocus={(e) => {
                                            e.currentTarget.style.border = '1px solid rgba(232,98,42,0.5)';
                                            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(232,98,42,0.15)';
                                        }}
                                        onBlur={(e) => {
                                            e.currentTarget.style.border = '1px solid rgba(255,255,255,0.10)';
                                            e.currentTarget.style.boxShadow = 'none';
                                        }}
                                    />
                                </div>

                                <div className="flex items-center justify-between">
                                    <label 
                                        className="flex items-center space-x-2 text-[10px] md:text-[11px] font-black uppercase tracking-widest cursor-pointer"
                                        style={{ color: 'rgba(232,238,255,0.7)' }}
                                    >
                                        <input type="checkbox" className="rounded border-navy-700 bg-navy-800 text-primary-500 focus:ring-primary-500/50" />
                                        <span>Remember me</span>
                                    </label>
                                    <Link 
                                        to="/forgot-password" 
                                        className="uppercase tracking-widest italic text-[10px] md:text-[11px] transition-colors"
                                        style={{ color: '#E8622A', fontWeight: 600 }}
                                    >
                                        Forgot password?
                                    </Link>
                                </div>

                                <Button 
                                    type="submit" 
                                    className="w-full h-14 md:h-16" 
                                    size="lg" 
                                    isLoading={isLoading}
                                >
                                    Sign In
                                </Button>

                                <button
                                    type="button"
                                    onClick={() => {
                                        setLoginMode('otp');
                                        setError(''); // Clear error when switching to OTP
                                    }}
                                    className="w-full text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center space-x-3 py-4 rounded-xl"
                                    style={{ 
                                        background: 'transparent',
                                        border: '1px solid rgba(255,255,255,0.12)',
                                        color: '#E8EEFF'
                                    }}
                                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                                >
                                    <Mail size={16} className="text-primary-500" />
                                    <span>Sign in with OTP</span>
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={otpStep === 1 ? handleSendOTP : handleVerifyOTP} className="space-y-6">
                                {otpStep === 1 ? (
                                    <div className="space-y-4">
                                        <Input
                                            id="otp-email"
                                            label="Email for OTP"
                                            type="email"
                                            placeholder="name@example.com"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            required
                                            className="h-14 md:h-16 transition-all"
                                            style={{ 
                                                background: '#111826',
                                                color: '#E8EEFF',
                                                border: '1px solid rgba(255,255,255,0.10)'
                                            }}
                                            onFocus={(e) => {
                                                e.currentTarget.style.border = '1px solid rgba(232,98,42,0.5)';
                                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(232,98,42,0.15)';
                                            }}
                                            onBlur={(e) => {
                                                e.currentTarget.style.border = '1px solid rgba(255,255,255,0.10)';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                        />
                                        <Button type="submit" className="w-full h-14 md:h-16" size="lg" isLoading={isLoading}>
                                            Send OTP
                                        </Button>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div className="text-center py-2">
                                            <p className="text-sm text-gray-500">OTP sent to <strong>{email}</strong></p>
                                        </div>
                                        <Input
                                            id="otp-code"
                                            label="Enter 6-digit OTP"
                                            type="text"
                                            maxLength={6}
                                            placeholder="000000"
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value)}
                                            required
                                            className="h-14 md:h-16 transition-all"
                                            style={{ 
                                                background: '#111826',
                                                color: '#E8EEFF',
                                                border: '1px solid rgba(255,255,255,0.10)'
                                            }}
                                            onFocus={(e) => {
                                                e.currentTarget.style.border = '1px solid rgba(232,98,42,0.5)';
                                                e.currentTarget.style.boxShadow = '0 0 0 3px rgba(232,98,42,0.15)';
                                            }}
                                            onBlur={(e) => {
                                                e.currentTarget.style.border = '1px solid rgba(255,255,255,0.10)';
                                                e.currentTarget.style.boxShadow = 'none';
                                            }}
                                        />
                                        <Button type="submit" className="w-full h-14 md:h-16" size="lg" isLoading={isLoading}>
                                            Verify & Login
                                        </Button>
                                        <button 
                                            type="button" 
                                            onClick={() => setOtpStep(1)}
                                            className="text-sm hover:underline block w-full text-center"
                                            style={{ color: '#E8622A', fontWeight: 600 }}
                                        >
                                            Resend OTP
                                        </button>
                                    </div>
                                )}

                                <button
                                    type="button"
                                    onClick={() => {
                                        setLoginMode('password');
                                        setError(''); // Clear error when switching back
                                    }}
                                    className="w-full text-sm transition-colors flex items-center justify-center space-x-2"
                                    style={{ color: 'rgba(232,238,255,0.6)' }}
                                    onMouseEnter={(e) => e.currentTarget.style.color = '#E8622A'}
                                    onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(232,238,255,0.6)'}
                                >
                                    <ShieldCheck size={16} />
                                    <span>Use Password instead</span>
                                </button>
                            </form>
                        )}
                    </div>

                    <div className="mt-10 pt-8 border-t border-navy-800 text-center">
                        <p 
                            className="text-[11px] font-black uppercase tracking-[0.2em]"
                            style={{ color: 'rgba(232,238,255,0.4)' }}
                        >
                            Don't have an account?{' '}
                            <Link 
                                to="/register" 
                                className="font-black transition-colors italic"
                                style={{ color: '#E8622A' }}
                            >
                                Create account
                            </Link>
                        </p>
                    </div>

                    {/* Mobile Benefits - Stacked at bottom */}
                    <div className="mt-16 sm:mt-24 space-y-12 lg:hidden">
                        <div className="h-px bg-white/5 w-full"></div>
                        {[
                            { icon: Zap, title: 'Instant Access', desc: 'Secure login with military-grade encryption.' },
                            { icon: CreditCard, title: 'Smart Payments', desc: 'Track your subscriptions and digital receipts.' }
                        ].map((feature, i) => (
                            <div key={i} className="flex items-start space-x-6">
                                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-primary-500 shrink-0">
                                    <feature.icon size={20} />
                                </div>
                                <div className="space-y-1">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-white italic">{feature.title}</h3>
                                    <p className="text-navy-400 text-xs font-medium">{feature.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default LoginPage;
