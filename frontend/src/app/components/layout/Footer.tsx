import React from 'react';
import { Link } from 'react-router-dom';
import { Utensils, Github, Twitter, Instagram } from 'lucide-react';

export const Footer: React.FC = () => {
    return (
        <footer className="bg-bg2 text-text-primary border-t border-white/5">
            <div className="container mx-auto px-4 py-12 sm:py-20">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 sm:gap-16">
                    <div className="space-y-6">
                        <Link to="/" className="flex items-center space-x-3 group" aria-label="FindMess Home">
                            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/20 group-hover:scale-110 transition-transform">
                                <Utensils size={20} />
                            </div>
                            <span className="text-xl font-heading font-black tracking-tighter">Find<span className="text-primary-500">Mess</span></span>
                        </Link>
                        <p className="text-sm text-text-secondary leading-relaxed font-medium">
                            The #1 platform for student meal management. Helping students find great meals and mess owners grow their service.
                        </p>
                        <div className="flex space-x-4">
                            {[
                                { Icon: Twitter, label: 'Twitter', href: 'https://twitter.com/yourpage' },
                                { Icon: Instagram, label: 'Instagram', href: 'https://instagram.com/yourpage' },
                                { Icon: Github, label: 'Github', href: 'https://github.com/yourpage' }
                            ].map(({ Icon, label, href }, i) => (
                                <a 
                                    key={i} 
                                    href={href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center hover:bg-primary-500 hover:text-white transition-all border border-white/5"
                                    aria-label={label}
                                >
                                    <Icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary mb-6 sm:mb-8">Platform</h4>
                        <ul className="space-y-4 text-sm font-black uppercase tracking-widest text-text-muted">
                            <li><Link to="/find-mess" className="hover:text-primary-500 transition-colors duration-300">Find Mess</Link></li>
                            <li><Link to="/how-it-works" className="hover:text-primary-500 transition-colors duration-300">How it Works</Link></li>
                            <li><Link to="/pricing" className="hover:text-primary-500 transition-colors duration-300">Pricing</Link></li>
                            <li><Link to="/blog" className="hover:text-primary-500 transition-colors duration-300">Blog</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary mb-6 sm:mb-8">Business</h4>
                        <ul className="space-y-4 text-sm font-black uppercase tracking-widest text-text-muted">
                            <li><Link to="/partner" className="hover:text-primary-500 transition-colors duration-300">Partner With Us</Link></li>
                            <li><Link to="/careers" className="hover:text-primary-500 transition-colors duration-300">Careers</Link></li>
                            <li><Link to="/contact" className="hover:text-primary-500 transition-colors duration-300">Contact Us</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary mb-6 sm:mb-8">Legal</h4>
                        <ul className="space-y-4 text-sm font-black uppercase tracking-widest text-text-muted">
                            <li><Link to="/terms" className="hover:text-primary-500 transition-colors duration-300">Terms & Conditions</Link></li>
                            <li><Link to="/refund" className="hover:text-primary-500 transition-colors duration-300">Refund Policy</Link></li>
                            <li><Link to="/privacy" className="hover:text-primary-500 transition-colors duration-300">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    <div className="space-y-8">
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary mb-6 sm:mb-8">Trust & Safety</h4>
                            <ul className="space-y-4 text-sm font-black uppercase tracking-widest text-text-muted">
                                <li className="flex items-center space-x-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                                    <span>Trusted by 1000+ students</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                                    <span>Secure payments</span>
                                </li>
                                <li className="flex items-center space-x-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-primary-500"></span>
                                    <span>Verified mess owners</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <div className="mt-12 sm:mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-text-muted/40 text-center md:text-left">
                        © 2026 FindMess. All rights reserved.
                    </p>
                    <div className="flex flex-wrap items-center justify-center md:justify-end gap-4 sm:gap-6">
                        <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">FindMess is Online</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};
