import React from 'react';
import { HelpCircle, Home, ArrowLeft } from 'lucide-react';

export default function NotFound({ navigate }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '65vh',
      padding: '1rem',
    }}>
      <div className="glass-card" style={{
        maxWidth: '480px',
        width: '100%',
        textAlign: 'center',
        padding: '3rem 2rem',
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '16px',
          background: 'rgba(99, 102, 241, 0.15)',
          border: '1px solid var(--border-highlight)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--primary)',
          marginBottom: '1.5rem',
        }}>
          <HelpCircle size={32} />
        </div>

        <h1 style={{
          fontSize: '3rem',
          fontWeight: 800,
          background: 'var(--primary-gradient)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          lineHeight: 1,
          marginBottom: '0.75rem',
        }}>
          404
        </h1>

        <h2 style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '0.5rem' }}>
          Page Not Found
        </h2>

        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '2rem' }}>
          The page or poll you are looking for does not exist, has expired, or may have been moved.
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => window.history.back()}
            className="btn btn-secondary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <ArrowLeft size={16} /> Go Back
          </button>
          <button
            onClick={() => navigate('dashboard')}
            className="btn btn-primary"
            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}
          >
            <Home size={16} /> Return Home
          </button>
        </div>
      </div>
    </div>
  );
}
