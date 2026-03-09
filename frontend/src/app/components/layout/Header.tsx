import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../common/Button';
import { Utensils, Search, User as UserIcon, Languages, LogOut, Menu, X } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../../hooks/redux';
import type { RootState } from '../../../store';
import { logout } from '../../../store/slices/authSlice';
import NotificationCenter from '../NotificationCenter';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

export const Header: React.FC = () => {
    const { isAuthenticated, user } = useAppSelector((state: RootState) => state.auth);
    const dispatch = useAppDispatch();
    const { i18n, t } = useTranslation();
    const [isProfileOpen, setIsProfileOpen] = React.useState(false);
    const [isScrolled, setIsScrolled] = React.useState(false);
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    React.useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        dispatch(logout());
        window.location.href = '/login';
    };

    const toggleLanguage = () => {
        const newLang = i18n.language === 'en' ? 'hi' : 'en';
        i18n.changeLanguage(newLang);
    };

    const navLinks = [
        { label: t('common.find_mess'), path: '/find-mess' },
        ...(isAuthenticated ? [
            { label: t('common.subscriptions'), path: '/subscriptions' },
            { label: t('common.messages'), path: '/messages' }
        ] : []),
        { label: t('common.about'), path: '/about' }
    ];

    return (
        <header className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${isScrolled ? 'py-4 translate-y-0' : 'py-6'}`}>
            <div className={`container mx-auto px-4 h-20 flex items-center justify-between transition-all duration-500 ${isScrolled ? 'bg-dark-900/80 backdrop-blur-3xl rounded-[2rem] border border-white/10 shadow-3xl' : 'bg-transparent border-transparent'}`}>
                <div className="flex items-center space-x-2 sm:space-x-4">
                    <button
                        onClick={() => setIsMenuOpen(true)}
                        className="lg:hidden p-2 text-white/70 hover:text-primary-500 transition-colors"
                    >
                        <Menu size={24} />
                    </button>
                    <Link to="/" className="flex items-center space-x-2 sm:space-x-4 group shrink-0">
                        <div className="w-8 h-8 sm:w-12 sm:h-12 bg-primary-500 rounded-lg sm:rounded-2xl flex items-center justify-center text-white shadow-2xl shadow-primary-500/30 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500">
                            <Utensils size={18} className="sm:w-7 sm:h-7" strokeWidth={2.5} />
                        </div>
                        <span className="text-base sm:text-2xl font-heading font-black tracking-tighter text-white whitespace-nowrap">
                            MESS<span className="text-primary-500">WALHA</span>
                        </span>
                    </Link>
                </div>

                <nav className="hidden lg:flex items-center space-x-12 px-4">
                    {navLinks.map(link => (
                        <Link key={link.path} to={link.path} className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 hover:text-primary-500 transition-all">{link.label}</Link>
                    ))}
                </nav>

                <div className="flex items-center space-x-2 sm:space-x-8">
                    <div className="hidden md:flex items-center space-x-4">
                        <button
                            onClick={toggleLanguage}
                            className="p-3 hover:bg-white/5 rounded-2xl transition-all flex items-center gap-3 group border border-transparent hover:border-white/10"
                        >
                            <Languages size={18} className="group-hover:text-primary-500 text-white/40 transition-colors" />
                            <span className="text-[10px] font-black uppercase text-white/40 tracking-widest">{i18n.language}</span>
                        </button>

                        <button className="p-3 hover:bg-white/5 rounded-2xl transition-all group border border-transparent hover:border-white/10">
                            <Search size={18} className="text-white/40 group-hover:text-white transition-colors" />
                        </button>
                    </div>

                    {isAuthenticated ? (
                        <div className="flex items-center space-x-2 sm:space-x-6">
                            <NotificationCenter />
                            <div className="relative group/profile">
                                <button
                                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                                    className="flex items-center space-x-2 sm:space-x-4 p-1.5 sm:p-2 sm:pl-5 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group shadow-2xl"
                                >
                                    <span className="text-[10px] font-black text-white/70 hidden lg:block uppercase tracking-[0.2em]">{user?.name}</span>
                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br from-primary-500 to-indigo-600 text-white flex items-center justify-center shadow-2xl transition-transform group-hover:scale-105 shrink-0">
                                        <UserIcon size={16} strokeWidth={2.5} className="sm:w-[18px] sm:h-[18px]" />
                                    </div>
                                </button>

                                <AnimatePresence>
                                    {isProfileOpen && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                            animate={{ opacity: 1, y: 0, scale: 1 }}
                                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                            className="absolute right-0 mt-6 w-72 bg-[#0f172a]/95 backdrop-blur-3xl rounded-[2.5rem] shadow-3xl border border-white/10 py-8 z-50 origin-top-right overflow-hidden"
                                        >
                                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-indigo-600" />

                                            <div className="px-10 pb-6 border-b border-white/5 mb-4 relative overflow-hidden">
                                                <div className="absolute top-0 right-0 w-24 h-24 bg-primary-500/10 rounded-full blur-2xl -mr-12 -mt-12" />
                                                <p className="text-[9px] font-black text-primary-500 uppercase tracking-[0.4em] mb-2 relative z-10">Active Protocol</p>
                                                <p className="text-xs font-black text-white truncate italic relative z-10">{user?.email}</p>
                                            </div>

                                            <div className="px-4 space-y-1">
                                                {[
                                                    { label: 'Profile', path: '/profile', icon: UserIcon },
                                                    { label: 'Subscriptions', path: '/subscriptions', icon: Utensils },
                                                    { label: 'Messages', path: '/messages', icon: Search },
                                                    { label: 'Settings', path: '/profile', icon: Languages },
                                                ].map((item) => (
                                                    <Link
                                                        key={item.label}
                                                        to={item.path}
                                                        className="flex items-center gap-4 px-6 py-4 text-[10px] font-black text-white/40 hover:text-white hover:bg-white/5 rounded-2xl transition-all uppercase tracking-[0.2em] group"
                                                        onClick={() => setIsProfileOpen(false)}
                                                    >
                                                        <item.icon size={16} className="group-hover:text-primary-500 transition-colors" />
                                                        {item.label}
                                                    </Link>
                                                ))}
                                            </div>

                                            <div className="px-10 pt-4 mt-4 border-t border-white/5">
                                                <button
                                                    onClick={() => {
                                                        handleLogout();
                                                        setIsProfileOpen(false);
                                                    }}
                                                    className="w-full text-left py-2 text-[10px] font-black text-red-500/70 hover:text-red-500 transition-all uppercase tracking-[0.3em] flex items-center justify-between"
                                                >
                                                    Logout
                                                    <LogOut size={14} />
                                                </button>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center space-x-2 sm:space-x-4">
                            <Link to="/login">
                                <Button variant="ghost" size="sm" className="text-white/60 hover:text-primary-500 font-black uppercase tracking-[0.2em] text-[10px] px-2 sm:px-4">Login</Button>
                            </Link>
                            <Link to="/register">
                                <Button size="lg" className="rounded-xl sm:rounded-2xl px-4 sm:px-8 shadow-2xl shadow-primary-500/30 font-black uppercase tracking-[0.2em] text-[10px] h-10 sm:h-12">Join</Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Navigation Drawer */}
            <AnimatePresence>
                {isMenuOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsMenuOpen(false)}
                            className="fixed inset-0 bg-dark-900/60 backdrop-blur-sm z-[110]"
                        />
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="fixed top-0 left-0 bottom-0 w-[300px] bg-dark-900 border-r border-white/10 z-[120] p-8 flex flex-col"
                        >
                            <div className="flex items-center justify-between mb-12">
                                <Link to="/" onClick={() => setIsMenuOpen(false)} className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center text-white">
                                        <Utensils size={24} />
                                    </div>
                                    <span className="text-xl font-heading font-black tracking-tighter text-white">
                                        MESS<span className="text-primary-500">WALHA</span>
                                    </span>
                                </Link>
                                <button onClick={() => setIsMenuOpen(false)} className="p-2 text-white/40 hover:text-white">
                                    <X size={24} />
                                </button>
                            </div>

                            <nav className="flex flex-col space-y-2 mb-auto">
                                {navLinks.map(link => (
                                    <Link
                                        key={link.path}
                                        to={link.path}
                                        onClick={() => setIsMenuOpen(false)}
                                        className="py-4 px-6 text-[11px] font-black uppercase tracking-[0.3em] text-white/50 hover:text-primary-500 hover:bg-white/5 rounded-2xl transition-all"
                                    >
                                        {link.label}
                                    </Link>
                                ))}
                            </nav>

                            <div className="pt-8 border-t border-white/10 space-y-4">
                                <button
                                    onClick={toggleLanguage}
                                    className="w-full flex items-center justify-between p-6 rounded-2xl bg-white/5 text-white/40 hover:text-white transition-all"
                                >
                                    <span className="text-[10px] font-black uppercase tracking-widest italic">Signal Protocol</span>
                                    <div className="flex items-center gap-3">
                                        <Languages size={18} />
                                        <span className="text-[10px] font-black uppercase">{i18n.language}</span>
                                    </div>
                                </button>
                                {!isAuthenticated && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                                            <Button variant="ghost" className="w-full font-black uppercase tracking-widest text-[10px]">Login</Button>
                                        </Link>
                                        <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                                            <Button className="w-full font-black uppercase tracking-widest text-[10px]">Join</Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </header>
    );
};
