import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Utensils, Building } from 'lucide-react';
import { useAppDispatch } from '../../hooks/redux';
import { setCredentials } from '../../store/slices/authSlice';
import api from '../api/axiosInstance';
import { toast } from 'react-hot-toast';
import Seo from '../components/common/Seo';

const RegisterPage: React.FC = () => {
    const [isLoading, setIsLoading] = React.useState(false);

    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    useEffect(() => {
        const initGoogle = () => {
            if ((window as any).google) {
                (window as any).google.accounts.id.initialize({
                    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || "853966580327-r2l2clrt5j1pnu47n6e8bt96l3sq6t6r.apps.googleusercontent.com",
                    callback: handleGoogleSignup
                });
                (window as any).google.accounts.id.renderButton(
                    document.getElementById("google-signup-btn"),
                    { theme: "outline", size: "large", width: "100%", text: "continue_with" }
                );
            } else {
                setTimeout(initGoogle, 500);
            }
        };
        initGoogle();
    }, []);

    const handleGoogleSignup = async (googleResponse: any) => {
        setIsLoading(true);
        try {
            const response = await api.post('/auth/google', {
                token: googleResponse.credential,
                role: 'STUDENT'
            });
            dispatch(setCredentials(response.data));
            toast.success('Welcome to FindMess!');
            navigate('/find-mess');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Google signup failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark px-4 py-12">
            <Seo title="Join FindMess" description="Join FindMess to find and subscribe to the best mess services near your college." />
            <Card className="w-full max-w-md p-8">
                <div className="text-center space-y-2 mb-8">
                    <Link to="/" className="inline-flex items-center justify-center p-3 bg-primary rounded-xl text-white mb-4">
                        <Utensils size={32} />
                    </Link>
                    <h1 className="text-3xl font-heading font-bold">Join FindMess</h1>
                    <p className="text-gray-500">Find and subscribe to mess services near you</p>
                </div>

                <div className="space-y-6">
                    {/* Google Sign Up for Students */}
                    <div id="google-signup-btn" className="w-full"></div>

                    {isLoading && (
                        <div className="flex justify-center">
                            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}

                    <p className="text-xs text-gray-500 text-center">
                        By continuing, you agree to our{' '}
                        <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link> and{' '}
                        <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                    </p>
                </div>

                {/* Owner CTA */}
                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-dark-lighter space-y-4">
                    <div className="text-center">
                        <p className="text-sm text-gray-500 mb-4">Are you a mess owner?</p>
                        <Link to="/mess-owner-register">
                            <Button variant="outline" className="w-full" size="lg">
                                <Building size={18} className="mr-2" />
                                List Your Mess — 60 Days Free
                            </Button>
                        </Link>
                    </div>

                    <div className="text-center">
                        <p className="text-sm text-gray-500">
                            Already have an account?{' '}
                            <Link to="/login" className="text-primary font-semibold hover:underline">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default RegisterPage;
