import React, { useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Card } from '../components/common/Card';
import { Utensils, ArrowLeft, AlertCircle } from 'lucide-react';
import api from '../api/axiosInstance';
import { toast } from 'react-hot-toast';

const weakPasswords = [
    "123456", "password", "qwerty", "111111",
    "abc123", "123123", "000000", "password1",
    "iloveyou", "admin", "letmein", "welcome"
];

const ResetPasswordPage: React.FC = () => {
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        password: '',
        confirmPassword: '',
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [touched, setTouched] = useState<Record<string, boolean>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
        if (name === 'password') {
            error = validatePassword(value) || '';
        } else if (name === 'confirmPassword') {
            if (value !== formData.password) error = "Passwords do not match";
        }
        return error;
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setTouched(prev => ({ ...prev, [name]: true }));
        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));
    };

    const isFormValid = () => {
        return !validatePassword(formData.password) && formData.confirmPassword === formData.password && formData.password !== '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Final validation check - mark all as touched
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
            toast.error("Please fix errors before reset");
            return;
        }

        setIsLoading(true);
        setError(null); // Clear general error before new submission
        try {
            await api.post('/auth/reset-password', {
                token,
                password: formData.password
            });
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
                    <Input
                        label="New Password"
                        name="password"
                        type="password"
                        placeholder="Enter new password"
                        value={formData.password}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        error={touched.password ? errors.password : ''}
                        required
                    />
                    <Input
                        label="Confirm New Password"
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirm new password"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        onBlur={handleBlur}
                        error={touched.confirmPassword ? errors.confirmPassword : ''}
                        required
                    />
                    <Button 
                        type="submit" 
                        className={`w-full ${isFormValid() ? 'opacity-100' : 'opacity-50 cursor-not-allowed'}`} 
                        isLoading={isLoading}
                        disabled={!isFormValid() || isLoading}
                    >
                        {isLoading ? 'Resetting...' : 'Reset Password'}
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
