import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children, navigate }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '50vh',
        color: 'var(--text-secondary)',
      }}>
        <div className="pulse-dot" style={{ width: '12px', height: '12px' }}></div>
        <span style={{ marginLeft: '0.75rem', fontWeight: 600 }}>Authenticating session...</span>
      </div>
    );
  }

  if (!isAuthenticated) {
    setTimeout(() => navigate('login'), 0);
    return null;
  }

  return children;
}
