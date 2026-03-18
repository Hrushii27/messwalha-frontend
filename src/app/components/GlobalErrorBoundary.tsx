import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from './common/Button';
import { Layout } from './layout/Layout';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error?: Error;
}

class GlobalErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false });
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <Layout>
                    <div className="min-h-[70vh] flex items-center justify-center p-4">
                        <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
                            <div className="w-24 h-24 bg-red-500/10 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg shadow-red-500/5">
                                <AlertTriangle size={48} />
                            </div>
                            <div className="space-y-4">
                                <h1 className="text-4xl font-black tracking-tighter text-text-primary dark:text-text-inverse uppercase italic">
                                    Oops! Something <span className="text-red-500">Broke</span>
                                </h1>
                                <p className="text-text-muted font-medium leading-relaxed">
                                    We encountered an unexpected error. Don't worry, your data is safe. Try refreshing the page or going back home.
                                </p>
                                {import.meta.env.DEV && (
                                    <div className="p-4 bg-gray-50 dark:bg-dark-700 rounded-lg text-left text-xs font-mono overflow-auto max-h-40 border border-border-color">
                                        <p className="text-red-500 font-bold mb-2">{this.state.error?.name}: {this.state.error?.message}</p>
                                        <p className="text-gray-400 opacity-50">{this.state.error?.stack}</p>
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4 pt-4">
                                <Button
                                    onClick={this.handleReset}
                                    className="flex-1 rounded-xl h-14 font-black uppercase tracking-widest text-[10px] bg-red-500 hover:bg-red-600 shadow-lg shadow-red-500/20"
                                >
                                    <RefreshCcw size={16} className="mr-2" />
                                    Refresh Page
                                </Button>
                                <Link to="/" className="flex-1">
                                    <Button
                                        variant="outline"
                                        className="w-full rounded-xl h-14 font-black uppercase tracking-widest text-[10px] border-border-color"
                                    >
                                        <Home size={16} className="mr-2" />
                                        Go Home
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </div>
                </Layout>
            );
        }

        return this.props.children;
    }
}

export default GlobalErrorBoundary;
