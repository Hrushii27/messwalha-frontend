import React from 'react';
import { Link } from 'react-router-dom';
import { Utensils, Github, Twitter, Instagram } from 'lucide-react';

export const Footer: React.FC = () => {
    return (
        <footer className="bg-bg2 text-text-primary border-t border-white/5">
            <div className="container mx-auto px-4 py-12 sm:py-20">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-10 sm:gap-16">
                    <div className="space-y-6">
                        <Link to="/" className="flex items-center space-x-3 group" aria-label="MessWalha Home">
                            <div className="w-10 h-10 bg-primary-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary-500/20 group-hover:scale-110 transition-transform">
                                <Utensils size={20} />
                            </div>
                            <span className="text-xl font-heading font-black tracking-tighter">Mess<span className="text-primary-500">Walha</span></span>
                        </Link>
                        <p className="text-sm text-text-secondary leading-relaxed font-medium">
                            The #1 digital ecosystem for student meal management. Empowering students with healthy food and mess owners with smart technology.
                        </p>
                        <div className="flex space-x-4">
                            {[
                                { Icon: Twitter, label: 'Twitter' },
                                { Icon: Instagram, label: 'Instagram' },
                                { Icon: Github, label: 'Github' }
                            ].map(({ Icon, label }, i) => (
                                <a 
                                    key={i} 
                                    href="#" 
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
                            <li><Link to="/find-mess" className="hover:text-primary-500 transition-colors">Find Mess</Link></li>
                            <li><Link to="/how-it-works" className="hover:text-primary-500 transition-colors">How it Works</Link></li>
                            <li><Link to="/pricing" className="hover:text-primary-500 transition-colors">Pricing</Link></li>
                            <li><Link to="/blog" className="hover:text-primary-500 transition-colors">Blog</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary mb-6 sm:mb-8">Business</h4>
                        <ul className="space-y-4 text-sm font-black uppercase tracking-widest text-text-muted">
                            <li><Link to="/owner/register" className="hover:text-primary-500 transition-colors">Partner With Us</Link></li>
                            <li><Link to="/careers" className="hover:text-primary-500 transition-colors">Careers</Link></li>
                            <li><Link to="/contact" className="hover:text-primary-500 transition-colors">Contact Us</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary mb-6 sm:mb-8">Legal</h4>
                        <ul className="space-y-4 text-sm font-black uppercase tracking-widest text-text-muted">
                            <li><Link to="/terms" className="hover:text-primary-500 transition-colors">Terms & Conditions</Link></li>
                            <li><Link to="/refund-policy" className="hover:text-primary-500 transition-colors">Refund Policy</Link></li>
                            <li><Link to="/privacy" className="hover:text-primary-500 transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="mt-12 sm:mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-text-muted/40 text-center md:text-left">
                        © {new Date().getFullYear()} MessWalha. All rights reserved.
                    </p>
                    <div className="flex flex-wrap items-center justify-center md:justify-end gap-4 sm:gap-6">
                        <div className="flex items-center space-x-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">System Status: Operational</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};
