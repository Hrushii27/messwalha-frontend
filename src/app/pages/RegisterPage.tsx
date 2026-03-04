import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Card } from '../components/common/Card';
import { Utensils, User, Building } from 'lucide-react';
import { useAppDispatch } from '../../hooks/redux';
import { setCredentials } from '../../store/slices/authSlice';
import api from '../api/axiosInstance';

const RegisterPage: React.FC = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        role: 'STUDENT' as 'STUDENT' | 'OWNER',
    });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const dispatch = useAppDispatch();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // Call backend directly for registration
            const response = await api.post('/auth/register', {
                name: formData.name,
                email: formData.email,
                phone: '', // Added empty phone to prevent backend SQL errors
                password: formData.password,
                role: formData.role
            });

            dispatch(setCredentials(response.data));
            navigate('/');
        } catch (err: any) {
            console.error('Registration error:', err);
            const errorMessage = err.response?.data?.message || err.response?.data?.error || 'Registration failed. Please try again.';
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark px-4 py-12">
            <Card className="w-full max-w-2xl p-8">
                <div className="text-center space-y-2 mb-8">
                    <Link to="/" className="inline-flex items-center justify-center p-3 bg-primary rounded-xl text-white mb-4">
                        <Utensils size={32} />
                    </Link>
                    <h1 className="text-3xl font-heading font-bold">Create an Account</h1>
                    <p className="text-gray-500">Join MessWalha and start your food journey</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    {error && (
                        <div className="bg-red-50 text-red-500 p-3 rounded-lg text-sm border border-red-100">
                            {error}
                        </div>
                    )}

                    {/* Role Selection */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, role: 'STUDENT' })}
                            className={`flex items-center p-4 rounded-xl border-2 transition-all ${formData.role === 'STUDENT'
                                ? 'border-primary bg-primary/5'
                                : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <div className={`p-3 rounded-lg mr-4 ${formData.role === 'STUDENT' ? 'bg-primary text-white' : 'bg-gray-100'}`}>
                                <User size={24} />
                            </div>
                            <div className="text-left">
                                <p className="font-bold">I'm a Student</p>
                                <p className="text-xs text-gray-500">I want to find and subscribe to a mess.</p>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => setFormData({ ...formData, role: 'OWNER' })}
                            className={`flex items-center p-4 rounded-xl border-2 transition-all ${formData.role === 'OWNER'
                                ? 'border-primary bg-primary/5'
                                : 'border-gray-200 hover:border-gray-300'
                                }`}
                        >
                            <div className={`p-3 rounded-lg mr-4 ${formData.role === 'OWNER' ? 'bg-primary text-white' : 'bg-gray-100'}`}>
                                <Building size={24} />
                            </div>
                            <div className="text-left">
                                <p className="font-bold">I'm an Owner</p>
                                <p className="text-xs text-gray-500">I want to list and manage my mess service.</p>
                            </div>
                        </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Input
                            label="Full Name"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                        />
                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                        <Input
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            required
                            className="sm:col-span-2"
                        />
                    </div>

                    <p className="text-xs text-gray-500 text-center">
                        By clicking "Create Account", you agree to our{' '}
                        <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link> and{' '}
                        <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
                    </p>

                    <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
                        Create Account
                    </Button>
                </form>

                <div className="mt-8 pt-6 border-t border-gray-100 dark:border-dark-lighter text-center">
                    <p className="text-sm text-gray-500">
                        Already have an account?{' '}
                        <Link to="/login" className="text-primary font-semibold hover:underline">
                            Sign In
                        </Link>
                    </p>
                </div>
            </Card>
        </div>
    );
};

export default RegisterPage;
