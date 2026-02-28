import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../common/Button.tsx';
import { Utensils, Search, User as UserIcon, Languages } from 'lucide-react';
import { useAppSelector } from '../../../hooks/redux';
import type { RootState } from '../../../store';
import NotificationCenter from '../NotificationCenter';
import { useTranslation } from 'react-i18next';

export const Header: React.FC = () => {
    const { isAuthenticated, user } = useAppSelector((state: RootState) => state.auth);
    const { i18n, t } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'hi' : 'en';
        i18n.changeLanguage(newLang);
    };

    return (
        <header className="navbar sticky top-0 z-50 w-full border-b border-white/10">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center space-x-2">
                    <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary-500/20">
                        <Utensils size={24} />
                    </div>
                    <span className="text-xl font-heading font-black tracking-tighter text-white">
                        Mess<span className="text-primary-500">Walha</span>
                    </span>
                </Link>

                <nav className="hidden md:flex items-center space-x-8">
                    <Link to="/find-mess" className="text-sm font-bold uppercase tracking-widest text-white/70 hover:text-primary-500 transition-colors">{t('common.find_mess')}</Link>
                    {isAuthenticated && (
                        <>
                            <Link to="/subscriptions" className="text-sm font-bold uppercase tracking-widest text-white/70 hover:text-primary-500 transition-colors">{t('common.subscriptions')}</Link>
                            <Link to="/messages" className="text-sm font-bold uppercase tracking-widest text-white/70 hover:text-primary-500 transition-colors">{t('common.messages')}</Link>
                            {user?.role === 'OWNER' && (
                                <Link to="/owner/dashboard" className="text-sm font-bold uppercase tracking-widest text-white/70 hover:text-primary-500 transition-colors">Owner Panel</Link>
                            )}
                            {user?.role === 'ADMIN' && (
                                <Link to="/admin/dashboard" className="text-sm font-bold uppercase tracking-widest text-white/70 hover:text-primary-500 transition-colors">Admin Panel</Link>
                            )}
                        </>
                    )}
                    <Link to="/about" className="text-sm font-bold uppercase tracking-widest text-white/70 hover:text-primary-500 transition-colors">{t('common.about')}</Link>
                </nav>

                <div className="flex items-center space-x-4">
                    <button
                        onClick={toggleLanguage}
                        className="p-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-1 group"
                        title="Switch Language"
                    >
                        <Languages size={20} className="group-hover:text-primary-500 text-white/70" />
                        <span className="text-[10px] font-black uppercase text-white/70">{i18n.language}</span>
                    </button>

                    <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <Search size={20} className="text-white/70 hover:text-white" />
                    </button>

                    {isAuthenticated ? (
                        <div className="flex items-center space-x-4">
                            <NotificationCenter />
                            <Link to="/dashboard" className="flex items-center space-x-2 p-1 pl-3 rounded-full bg-white/10 border border-white/10 hover:bg-white/20 transition-colors">
                                <span className="text-xs font-bold text-white hidden sm:block">{user?.name}</span>
                                <div className="w-8 h-8 rounded-full bg-primary-500 text-white flex items-center justify-center shadow-lg shadow-primary-500/20">
                                    <UserIcon size={16} />
                                </div>
                            </Link>
                        </div>
                    ) : (
                        <div className="hidden sm:flex items-center space-x-2">
                            <Link to="/login">
                                <Button variant="ghost" size="sm">Log in</Button>
                            </Link>
                            <Link to="/register">
                                <Button size="sm">Get Started</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
};
