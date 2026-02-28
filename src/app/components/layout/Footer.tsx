import React from 'react';
import { Link } from 'react-router-dom';
import { Utensils, Github, Twitter, Instagram } from 'lucide-react';

export const Footer: React.FC = () => {
    return (
        <footer className="bg-gray-50 dark:bg-dark-lighter border-t border-gray-100 dark:border-dark-lighter">
            <div className="container mx-auto px-4 py-12">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div className="col-span-1 md:col-span-1">
                        <Link to="/" className="flex items-center space-x-2 mb-4">
                            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-white">
                                <Utensils size={18} />
                            </div>
                            <span className="text-lg font-heading font-bold">MessWalha</span>
                        </Link>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Connecting students with the best local mess services. Healthy food, simplified subscriptions.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-heading font-semibold mb-4">Platform</h4>
                        <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                            <li><Link to="/find-mess" className="hover:text-primary transition-colors">Find Mess</Link></li>
                            <li><Link to="/how-it-works" className="hover:text-primary transition-colors">How it Works</Link></li>
                            <li><Link to="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-heading font-semibold mb-4">Support</h4>
                        <ul className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
                            <li><Link to="/faq" className="hover:text-primary transition-colors">FAQ</Link></li>
                            <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
                            <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-heading font-semibold mb-4">Connect</h4>
                        <div className="flex space-x-4">
                            <a href="#" className="p-2 bg-white dark:bg-dark rounded-full shadow-sm hover:text-primary transition-colors">
                                <Twitter size={18} />
                            </a>
                            <a href="#" className="p-2 bg-white dark:bg-dark rounded-full shadow-sm hover:text-primary transition-colors">
                                <Instagram size={18} />
                            </a>
                            <a href="#" className="p-2 bg-white dark:bg-dark rounded-full shadow-sm hover:text-primary transition-colors">
                                <Github size={18} />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="mt-12 pt-8 border-t border-gray-100 dark:border-dark-card text-center text-sm text-gray-500 dark:text-gray-400">
                    © {new Date().getFullYear()} MessWalha. All rights reserved.
                </div>
            </div>
        </footer>
    );
};
