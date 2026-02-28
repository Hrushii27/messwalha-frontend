import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import LandingPage from './app/pages/LandingPage';
import LoginPage from './app/pages/LoginPage';
import RegisterPage from './app/pages/RegisterPage';
import FindMessesPage from './app/pages/FindMessesPage';
import MessDetailsPage from './app/pages/MessDetailsPage';
import StudentDashboardPage from './app/pages/StudentDashboardPage';
import MySubscriptionsPage from './app/pages/MySubscriptionsPage';
import ChatPage from './app/pages/ChatPage';
import OwnerDashboardPage from './app/pages/OwnerDashboardPage';
import AdminDashboardPage from './app/pages/AdminDashboardPage';
import AboutPage from './app/pages/AboutPage';
import ForgotPasswordPage from './app/pages/ForgotPasswordPage';
import InvoicePage from './app/pages/InvoicePage';
import FAQPage from './app/pages/FAQPage';
import { Navigate } from 'react-router-dom';
import { FavoritesProvider } from './app/context/FavoritesContext';
import GlobalErrorBoundary from './app/components/GlobalErrorBoundary';

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <FavoritesProvider>
        <GlobalErrorBoundary>
          <Router>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/faq" element={<FAQPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
              <Route path="/find-mess" element={<FindMessesPage />} />
              <Route path="/find-messes" element={<Navigate to="/find-mess" replace />} />
              <Route path="/mess/:id" element={<MessDetailsPage />} />
              <Route path="/invoice/:id" element={<InvoicePage />} />
              <Route path="/dashboard" element={<StudentDashboardPage />} />
              <Route path="/subscriptions" element={<MySubscriptionsPage />} />
              <Route path="/messages" element={<ChatPage />} />
              <Route path="/owner/dashboard" element={<OwnerDashboardPage />} />
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Router>
        </GlobalErrorBoundary>
      </FavoritesProvider>
    </Provider>
  );
};

export default App;
