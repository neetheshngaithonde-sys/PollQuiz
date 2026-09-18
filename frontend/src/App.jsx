import React, { useState, useEffect } from 'react';
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
    const hash = window.location.hash.replace('#', '').replace(/^\//, '');
    if (hash) return hash;
    return 'landing';
  });

  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  const navigate = (route) => {
    window.location.hash = route;
    setCurrentRoute(route);
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').replace(/^\//, '');
      setCurrentRoute(hash || (isAuthenticated ? 'dashboard' : 'landing'));
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isAuthenticated]);

  // Route matching logic
  const renderRoute = () => {
    if (loading) {
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
          <div className="pulse-dot" style={{ width: '12px', height: '12px' }}></div>
        </div>
      );
    }

    // Public Poll Voting Page: poll/:id
    if (currentRoute.startsWith('poll/') && !currentRoute.endsWith('/results')) {
      const pollId = currentRoute.split('/')[1];
      return <PublicPoll pollId={pollId} navigate={navigate} onShowToast={showToast} />;
    }

    // Live Results Page: poll/:id/results
    if (currentRoute.startsWith('poll/') && currentRoute.endsWith('/results')) {
      const parts = currentRoute.split('/');
      const pollId = parts[1];
      return <LiveResults pollId={pollId} navigate={navigate} onShowToast={showToast} />;
    }

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
            <Dashboard navigate={navigate} onShowToast={showToast} />
          </ProtectedRoute>
        );
      case 'create-poll':
        return (
          <ProtectedRoute navigate={navigate}>
            <CreatePoll navigate={navigate} onShowToast={showToast} />
          </ProtectedRoute>
        );
      case 'my-polls':
        return (
          <ProtectedRoute navigate={navigate}>
            <MyPolls navigate={navigate} onShowToast={showToast} />
          </ProtectedRoute>
        );
      case 'change-password':
        return (
          <ProtectedRoute navigate={navigate}>
            <ChangePassword navigate={navigate} onShowToast={showToast} />
          </ProtectedRoute>
        );
      default:
        return <NotFound navigate={navigate} />;
    }
  };

  return (
    <div className="app-container">
      <Navbar currentRoute={currentRoute} navigate={navigate} />

      <main className="main-content">
        {renderRoute()}
      </main>

      {/* Global Toast Notification */}
      {toastMessage && (
        <div className="toast">
          <span className="pulse-dot" style={{ width: '8px', height: '8px' }}></span>
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
