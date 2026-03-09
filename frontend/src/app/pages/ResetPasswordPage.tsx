import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Card } from '../components/common/Card';
import { Utensils, ArrowLeft, Eye, EyeOff, AlertCircle } from 'lucide-react';
import api from '../api/axiosInstance';
import { toast } from 'react-hot-toast';

const ResetPasswordPage: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters long');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            await api.post('/auth/reset-password', { token, password });
            toast.success('Password reset successfully! Please login with your new password.');
            navigate('/login');
        } catch (error) {
            const err = error as { response?: { data?: { message?: string } } };
            const message = err.response?.data?.message || 'Failed to reset password. The link may be invalid or expired.';
            setError(message);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark px-4 py-12">
            <Card className="w-full max-w-md p-8">
                <div className="text-center space-y-2 mb-8">
                    <Link to="/" className="inline-flex items-center justify-center p-3 bg-primary rounded-xl text-white mb-4">
                        <Utensils size={32} />
                    </Link>
                    <h1 className="text-3xl font-heading font-bold">Reset Password</h1>
                    <p className="text-gray-500">Enter your new password below to secure your account.</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600 animate-in fade-in slide-in-from-top-2">
                        <AlertCircle className="shrink-0 mt-0.5" size={18} />
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="relative">
                        <Input
                            label="New Password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-[38px] text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                    </div>

                    <Input
                        label="Confirm New Password"
                        type="password"
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                    />

                    <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                        Update Password
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

export default ResetPasswordPage;
