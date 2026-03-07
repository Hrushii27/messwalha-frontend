import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { Navigate } from 'react-router-dom';
import { FavoritesProvider } from './app/context/FavoritesContext';
import GlobalErrorBoundary from './app/components/GlobalErrorBoundary';

// Lazy load pages for better performance
const LandingPage = lazy(() => import('./app/pages/LandingPage'));
const LoginPage = lazy(() => import('./app/pages/LoginPage'));
const RegisterPage = lazy(() => import('./app/pages/RegisterPage'));
const FindMessesPage = lazy(() => import('./app/pages/FindMessesPage'));
const MessDetailsPage = lazy(() => import('./app/pages/MessDetailsPage'));
const StudentDashboardPage = lazy(() => import('./app/pages/StudentDashboardPage'));
const MySubscriptionsPage = lazy(() => import('./app/pages/MySubscriptionsPage'));
const ChatPage = lazy(() => import('./app/pages/ChatPage'));
const OwnerDashboardPage = lazy(() => import('./app/pages/OwnerDashboardPage'));
const AdminDashboardPage = lazy(() => import('./app/pages/AdminDashboardPage'));
const AboutPage = lazy(() => import('./app/pages/AboutPage'));
const TermsPage = lazy(() => import('./app/pages/TermsPage'));
const RefundPolicyPage = lazy(() => import('./app/pages/RefundPolicyPage'));
const ForgotPasswordPage = lazy(() => import('./app/pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./app/pages/ResetPasswordPage'));
const InvoicePage = lazy(() => import('./app/pages/InvoicePage'));
const FAQPage = lazy(() => import('./app/pages/FAQPage'));
const ProfilePage = lazy(() => import('./app/pages/ProfilePage'));
const TodayMenuPage = lazy(() => import('./app/pages/TodayMenuPage'));
const AddMessPage = lazy(() => import('./app/pages/AddMessPage'));
const SubscribePage = lazy(() => import('./app/pages/SubscribePage'));

// Loading component for Suspense
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-bg-section dark:bg-dark-900">
    <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <FavoritesProvider>
        <GlobalErrorBoundary>
          <Router>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/about" element={<AboutPage />} />
                <Route path="/terms" element={<TermsPage />} />
                <Route path="/refund-policy" element={<RefundPolicyPage />} />
                <Route path="/faq" element={<FAQPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="/find-mess" element={<FindMessesPage />} />
                <Route path="/find-messes" element={<Navigate to="/find-mess" replace />} />
                <Route path="/mess/:id" element={<MessDetailsPage />} />
                <Route path="/invoice/:id" element={<InvoicePage />} />
                <Route path="/dashboard" element={<StudentDashboardPage />} />
                <Route path="/subscriptions" element={<MySubscriptionsPage />} />
                <Route path="/messages" element={<ChatPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/profile/settings" element={<ProfilePage />} /> { /* Shared for now */}
                <Route path="/security" element={<ProfilePage />} /> { /* Shared for now */}
                <Route path="/menu/today" element={<TodayMenuPage />} />
                <Route path="/orders" element={<MySubscriptionsPage />} /> { /* Shared for now */}
                <Route path="/owner/dashboard" element={<OwnerDashboardPage />} />
                <Route path="/owner/subscribe" element={<SubscribePage />} />
                <Route path="/owner/add-mess" element={<AddMessPage />} />
                <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Suspense>
          </Router>
        </GlobalErrorBoundary>
      </FavoritesProvider>
    </Provider>
  );
};

export default App;
