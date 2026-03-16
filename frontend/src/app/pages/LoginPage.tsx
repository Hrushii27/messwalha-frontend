import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Card } from '../components/common/Card';
import { Utensils, Mail, ShieldCheck } from 'lucide-react';
import { useAppDispatch } from '../../hooks/redux';
import { setCredentials } from '../../store/slices/authSlice';
import api from '../api/axiosInstance';
import Seo from '../components/common/Seo';
import toast from 'react-hot-toast';

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

    // Check if navigated from Registration Google Auth requiring OTP
    useEffect(() => {
        const state = location.state as { email?: string; startWithOtp?: boolean } | null;
        if (state?.startWithOtp && state?.email) {
            setEmail(state.email);
            setLoginMode('otp');
            setOtpStep(2); // Jump straight to verify
        }
    }, [location]);

    // reCAPTCHA and Google Auth Initialization
    useEffect(() => {
        const initScripts = () => {
            // reCAPTCHA
            if ((window as any).grecaptcha && (window as any).grecaptcha.render) {
                const container = document.getElementById('recaptcha-container');
                if (container && container.innerHTML === '') {
                    (window as any).grecaptcha.render('recaptcha-container', {
                        'sitekey': import.meta.env.VITE_RECAPTCHA_SITE_KEY || "6Ld48IssAAAAACSSpuDv2_NC8bNqQBol2lpFpsM7",
                        'theme': document.documentElement.classList.contains('dark') ? 'dark' : 'light'
                    });
                }
            }

            // Google One Tap / Login Button
            if ((window as any).google) {
                (window as any).google.accounts.id.initialize({
                    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "853966580327-r2l2clrt5j1pnu47n6e8bt96l3sq6t6r.apps.googleusercontent.com",
                    callback: handleGoogleLogin
                });
                (window as any).google.accounts.id.renderButton(
                    document.getElementById("google-login-btn"),
                    { theme: "outline", size: "large", width: "100%", text: "continue_with" }
                );
            }
        };

        const timer = setInterval(() => {
            if ((window as any).grecaptcha && (window as any).google) {
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
                // Sequential Auth: Google verified, now need OTP
                setEmail(response.data.email);
                setLoginMode('otp');
                setOtpStep(2);
                toast.success('Google verified. Please check email for OTP.', { duration: 4000 });
            } else {
                // Fallback / legacy
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

        const recaptchaToken = (window as any).grecaptcha?.getResponse();

        if (!recaptchaToken) {
            setError('Please complete the reCAPTCHA verification');
            setIsLoading(false);
            return;
        }

        try {
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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark px-4 py-12">
            <Seo 
                title="Login" 
                description="Sign in to your FindMess account to manage your subscriptions and find the best mess services." 
            />
            <Card className="w-full max-w-md p-8">
                <div className="text-center space-y-2 mb-8">
                    <Link to="/" className="inline-flex items-center justify-center p-3 bg-primary rounded-xl text-white mb-4">
                        <Utensils size={32} />
                    </Link>
                    <h1 className="text-3xl font-heading font-bold">Welcome Back</h1>
                    <p className="text-gray-500">Sign in to your MessWalha account</p>
                </div>

                <div className="space-y-4">
                    {/* Google Login Section */}
                    <div id="google-login-btn" className="w-full"></div>

                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <span className="w-full border-t border-gray-200"></span>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white dark:bg-card-dark text-gray-500 uppercase">Or continue with</span>
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm border border-red-100 mb-4">
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
                                />
                                <Input
                                    id="login-password"
                                    label="Password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <label className="flex items-center space-x-2 text-sm">
                                    <input type="checkbox" className="rounded border-gray-300 text-primary focus:ring-primary" />
                                    <span>Remember me</span>
                                </label>
                                <Link to="/forgot-password" title="Forgot password" className="text-sm text-primary hover:underline">
                                    Forgot password?
                                </Link>
                            </div>

                            <div className="flex justify-center mb-6">
                                <div id="recaptcha-container"></div>
                            </div>

                            <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                                Sign In
                            </Button>

                            <button
                                type="button"
                                onClick={() => setLoginMode('otp')}
                                className="w-full text-sm text-gray-500 hover:text-primary transition-colors flex items-center justify-center space-x-2"
                            >
                                <Mail size={16} />
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
                                    />
                                    <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
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
                                    />
                                    <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                                        Verify & Login
                                    </Button>
                                    <button 
                                        type="button" 
                                        onClick={() => setOtpStep(1)}
                                        className="text-sm text-primary hover:underline block w-full text-center"
                                    >
                                        Resend OTP
                                    </button>
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={() => setLoginMode('password')}
                                className="w-full text-sm text-gray-500 hover:text-primary transition-colors flex items-center justify-center space-x-2"
                            >
                                <ShieldCheck size={16} />
                                <span>Use Password instead</span>
                            </button>
                        </form>
                    )}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-dark-lighter text-center">
                    <p className="text-sm text-gray-500">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-primary font-semibold hover:underline">
                            Create an account
                        </Link>
                    </p>
                </div>
            </Card>
        </div>
    );
};

export default LoginPage;
