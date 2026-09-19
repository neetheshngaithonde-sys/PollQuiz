import React, { useEffect, useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import CreatePoll from './pages/CreatePoll';
import MyPolls from './pages/MyPolls';
import PublicPoll from './pages/PublicPoll';
import LiveResults from './pages/LiveResults';
import ChangePassword from './pages/ChangePassword';
import NotFound from './pages/NotFound';

function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  const [currentRoute, setCurrentRoute] = useState(() => {
    const hash = window.location.hash
      .replace('#', '')
      .replace(/^\//, '');

    return hash || (isAuthenticated ? 'dashboard' : 'landing');
  });

  const [toastMessage, setToastMessage] = useState('');

  // -----------------------------
  // Toast
  // -----------------------------
  const showToast = (message) => {
    setToastMessage(message);

    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  // -----------------------------
  // Navigation
  // -----------------------------
  const navigate = (route) => {
    window.location.hash = route;
    setCurrentRoute(route);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // -----------------------------
  // Handle browser hash changes
  // -----------------------------
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash
        .replace('#', '')
        .replace(/^\//, '');

      setCurrentRoute(
        hash || (isAuthenticated ? 'dashboard' : 'landing')
      );

      window.scrollTo(0, 0);
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [isAuthenticated]);

  // -----------------------------
  // Route Rendering
  // -----------------------------
  const renderRoute = () => {
    // Loading screen
    if (loading) {
      return (
        <div className="app-loading">
          <div className="loading-spinner"></div>
          <p>Loading Poll Quiz...</p>
        </div>
      );
    }

    // --------------------------------
    // Public Poll
    // /poll/:id
    // --------------------------------
    if (
      currentRoute.startsWith('poll/') &&
      !currentRoute.endsWith('/results')
    ) {
      const pollId = currentRoute.split('/')[1];

      return (
        <PublicPoll
          pollId={pollId}
          navigate={navigate}
          onShowToast={showToast}
        />
      );
    }

    // --------------------------------
    // Live Results
    // /poll/:id/results
    // --------------------------------
    if (
      currentRoute.startsWith('poll/') &&
      currentRoute.endsWith('/results')
    ) {
      const parts = currentRoute.split('/');
      const pollId = parts[1];

      return (
        <LiveResults
          pollId={pollId}
          navigate={navigate}
          onShowToast={showToast}
        />
      );
    }

    // --------------------------------
    // Normal Routes
    // --------------------------------
    switch (currentRoute) {
      case '':
      case 'landing':
        return <Landing navigate={navigate} />;

      case 'login':
        return <Login navigate={navigate} />;

      case 'signup':
        return <Signup navigate={navigate} />;

      case 'dashboard':
        return (
          <ProtectedRoute navigate={navigate}>
            <Dashboard
              navigate={navigate}
              onShowToast={showToast}
            />
          </ProtectedRoute>
        );

      case 'create-poll':
        return (
          <ProtectedRoute navigate={navigate}>
            <CreatePoll
              navigate={navigate}
              onShowToast={showToast}
            />
          </ProtectedRoute>
        );

      case 'my-polls':
        return (
          <ProtectedRoute navigate={navigate}>
            <MyPolls
              navigate={navigate}
              onShowToast={showToast}
            />
          </ProtectedRoute>
        );

      case 'change-password':
        return (
          <ProtectedRoute navigate={navigate}>
            <ChangePassword
              navigate={navigate}
              onShowToast={showToast}
            />
          </ProtectedRoute>
        );

      default:
        return <NotFound navigate={navigate} />;
    }
  };

  return (
    <div className="app-container">

      {/* --------------------------------
          Navigation Bar
      -------------------------------- */}
      <Navbar
        currentRoute={currentRoute}
        navigate={navigate}
      />

      {/* --------------------------------
          Main Application
      -------------------------------- */}
      <main className="main-content">
        {renderRoute()}
      </main>

      {/* --------------------------------
          Global Toast
      -------------------------------- */}
      {toastMessage && (
        <div className="toast">
          <span className="toast-indicator"></span>

          <span className="toast-message">
            {toastMessage}
          </span>

          <button
            className="toast-close"
            onClick={() => setToastMessage('')}
            aria-label="Close notification"
          >
            ×
          </button>
        </div>
      )}

    </div>
  );
}

// --------------------------------
// Root Application
// --------------------------------

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}