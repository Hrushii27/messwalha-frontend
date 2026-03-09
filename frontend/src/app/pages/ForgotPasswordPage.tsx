import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Card } from '../components/common/Card';
import { Utensils, ArrowLeft, CircleCheck, AlertCircle } from 'lucide-react';
import api from '../api/axiosInstance';
import { toast } from 'react-hot-toast';

const ForgotPasswordPage: React.FC = () => {
    const [email, setEmail] = useState('');
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            await api.post('/auth/forgot-password', { email });
            setIsSubmitted(true);
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            const message = err.response?.data?.message || 'Failed to send reset link. Please try again.';
            setError(message);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark px-4 py-12">
                <Card className="w-full max-w-md p-8 text-center space-y-6">
                    <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <CircleCheck size={40} />
                    </div>
                    <h1 className="text-3xl font-heading font-bold">Check Your Email</h1>
                    <p className="text-gray-500">
                        We've sent password reset instructions to <span className="font-bold text-gray-900">{email}</span>.
                    </p>
                    <Link to="/login">
                        <Button className="w-full mt-4">Return to Login</Button>
                    </Link>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark px-4 py-12">
            <Card className="w-full max-w-md p-8">
                <div className="text-center space-y-2 mb-8">
                    <Link to="/" className="inline-flex items-center justify-center p-3 bg-primary rounded-xl text-white mb-4">
                        <Utensils size={32} />
                    </Link>
                    <h1 className="text-3xl font-heading font-bold">Forgot Password?</h1>
                    <p className="text-gray-500">Enter your email and we'll send you a link to reset your password.</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600 animate-in fade-in slide-in-from-top-2">
                        <AlertCircle className="shrink-0 mt-0.5" size={18} />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <Input
                        label="Email Address"
                        type="email"
                        placeholder="name@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                        Send Reset Link
                    </Button>

                    <Link to="/login" className="flex items-center justify-center text-sm text-gray-400 hover:text-primary transition-colors gap-2">
                        <ArrowLeft size={16} />
                        Back to Sign In
                    </Link>
                </form>
            </Card>
        </div>
    );
};

export default ForgotPasswordPage;
