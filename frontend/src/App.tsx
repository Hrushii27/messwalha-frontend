import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { Navigate } from 'react-router-dom';
import { FavoritesProvider } from './app/context/FavoritesContext';
import GlobalErrorBoundary from './app/components/GlobalErrorBoundary';
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3';
import ProtectedRoute from './app/components/auth/ProtectedRoute';

// Lazy load pages for better performance
const LandingPage = lazy(() => import('./app/pages/LandingPage'));
const LoginPage = lazy(() => import('./app/pages/LoginPage'));
const RegisterPage = lazy(() => import('./app/pages/RegisterPage'));
const OwnerRegistrationPage = lazy(() => import('./app/pages/OwnerRegistrationPage'));
const FindMessesPage = lazy(() => import('./app/pages/FindMessesPage'));
const MessDetailsPage = lazy(() => import('./app/pages/MessDetailsPage'));
const UserDashboard = lazy(() => import('./app/pages/UserDashboard'));
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
const MyReviewsPage = lazy(() => import('./app/pages/MyReviewsPage'));

// Loading component for Suspense
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-bg-section dark:bg-dark-900">
    <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
  </div>
);

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <GoogleReCaptchaProvider
        reCaptchaKey={import.meta.env.VITE_RECAPTCHA_SITE_KEY}
        scriptProps={{
          async: false,
          defer: false,
          appendTo: 'head',
          nonce: undefined,
        }}
      >
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
                  <Route path="/mess-owner-register" element={<OwnerRegistrationPage />} />
                  <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                  <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
                  <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
                  <Route path="/find-mess" element={<FindMessesPage />} />
                  <Route path="/find-messes" element={<Navigate to="/find-mess" replace />} />
                  <Route path="/mess/:id/:section?" element={<MessDetailsPage />} />
                  <Route path="/invoice/:id" element={<ProtectedRoute><InvoicePage /></ProtectedRoute>} />
                  <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['STUDENT']}><UserDashboard /></ProtectedRoute>} />
                  <Route path="/subscriptions" element={<ProtectedRoute allowedRoles={['STUDENT']}><MySubscriptionsPage /></ProtectedRoute>} />
                  <Route path="/messages" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
                  <Route path="/my-reviews" element={<ProtectedRoute allowedRoles={['STUDENT']}><MyReviewsPage /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                  <Route path="/profile/settings" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} /> { /* Shared for now */}
                  <Route path="/security" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} /> { /* Shared for now */}
                  <Route path="/menu/today" element={<ProtectedRoute><TodayMenuPage /></ProtectedRoute>} />
                  <Route path="/orders" element={<ProtectedRoute allowedRoles={['STUDENT']}><MySubscriptionsPage /></ProtectedRoute>} /> { /* Shared for now */}
                  <Route path="/owner/dashboard" element={<ProtectedRoute allowedRoles={['OWNER']}><OwnerDashboardPage /></ProtectedRoute>} />
                  <Route path="/owner/subscribe" element={<ProtectedRoute allowedRoles={['OWNER']}><SubscribePage /></ProtectedRoute>} />
                  <Route path="/owner/add-mess" element={<ProtectedRoute allowedRoles={['OWNER']}><AddMessPage /></ProtectedRoute>} />
                  <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['ADMIN']}><AdminDashboardPage /></ProtectedRoute>} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </Router>
          </GlobalErrorBoundary>
        </FavoritesProvider>
      </GoogleReCaptchaProvider>
    </Provider>
  );
};

export default App;
