import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BarChart3, PlusCircle, LayoutDashboard, ListFilter, LogOut, Menu, X, User, KeyRound } from 'lucide-react';

export default function Navbar({ currentRoute, navigate }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (route) => {
    navigate(route);
    setMobileMenuOpen(false);
  };

  return (
    <header style={{
      borderBottom: '1px solid var(--border-color)',
      background: 'rgba(9, 13, 22, 0.8)',
      backdropFilter: 'blur(16px)',
      position: 'sticky',
      top: 0,
      zIndex: 50,
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0.85rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        {/* Brand Logo */}
        <div 
          onClick={() => handleNav(isAuthenticated ? 'dashboard' : 'landing')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            cursor: 'pointer',
          }}
        >
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'var(--primary-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 12px rgba(99, 102, 241, 0.4)',
          }}>
            <BarChart3 size={22} />
          </div>
          <span style={{
            fontSize: '1.25rem',
            fontWeight: 800,
            background: 'linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em',
          }}>
            PollQuiz
          </span>
          <span className="badge badge-live" style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem' }}>
            <span className="pulse-dot" style={{ width: '5px', height: '5px' }}></span> LIVE
          </span>
        </div>

        {/* Desktop Nav Items */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }} className="desktop-nav">
          {isAuthenticated ? (
            <>
              <button 
                onClick={() => handleNav('dashboard')}
                className="btn btn-secondary btn-sm"
                style={{
                  border: currentRoute === 'dashboard' ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                  color: currentRoute === 'dashboard' ? '#ffffff' : 'var(--text-secondary)',
                }}
              >
                <LayoutDashboard size={16} /> Dashboard
              </button>

              <button 
                onClick={() => handleNav('my-polls')}
                className="btn btn-secondary btn-sm"
                style={{
                  border: currentRoute === 'my-polls' ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                  color: currentRoute === 'my-polls' ? '#ffffff' : 'var(--text-secondary)',
                }}
              >
                <ListFilter size={16} /> My Polls
              </button>

              <button 
                onClick={() => handleNav('create-poll')}
                className="btn btn-primary btn-sm"
              >
                <PlusCircle size={16} /> Create Poll
              </button>

              <div style={{
                height: '24px',
                width: '1px',
                background: 'var(--border-color)',
                margin: '0 0.25rem',
              }}></div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: 'rgba(99, 102, 241, 0.2)',
                  border: '1px solid var(--border-highlight)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#818cf8',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                }}>
                  {user?.name ? user.name[0].toUpperCase() : <User size={16} />}
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {user?.name?.split(' ')[0]}
                </span>
              </div>

              <button 
                onClick={() => handleNav('change-password')}
                className="btn btn-secondary btn-sm"
                title="Change Password"
                style={{
                  border: currentRoute === 'change-password' ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                  color: currentRoute === 'change-password' ? '#ffffff' : 'var(--text-secondary)',
                  padding: '0.45rem 0.65rem',
                }}
              >
                <KeyRound size={16} />
              </button>

              <button 
                onClick={logout}
                className="btn btn-secondary btn-sm"
                title="Log Out"
                style={{ padding: '0.45rem 0.65rem' }}
              >
                <LogOut size={16} color="var(--danger)" />
              </button>
            </>
          ) : (
            <>
              <button 
                onClick={() => handleNav('login')}
                className="btn btn-secondary btn-sm"
              >
                Log In
              </button>
              <button 
                onClick={() => handleNav('signup')}
                className="btn btn-primary btn-sm"
              >
                Get Started
              </button>
            </>
          )}
        </nav>

        {/* Mobile Toggle Button */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="btn btn-secondary btn-sm mobile-toggle"
          style={{ padding: '0.45rem', display: 'none' }}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{
          padding: '1rem 1.5rem',
          borderTop: '1px solid var(--border-color)',
          background: 'var(--bg-dark)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}>
          {isAuthenticated ? (
            <>
              <button onClick={() => handleNav('dashboard')} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
                <LayoutDashboard size={18} /> Dashboard
              </button>
              <button onClick={() => handleNav('my-polls')} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
                <ListFilter size={18} /> My Polls
              </button>
              <button onClick={() => handleNav('create-poll')} className="btn btn-primary" style={{ width: '100%', justifyContent: 'flex-start' }}>
                <PlusCircle size={18} /> Create Poll
              </button>
              <button onClick={() => handleNav('change-password')} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'flex-start' }}>
                <KeyRound size={18} /> Change Password
              </button>
              <button onClick={logout} className="btn btn-danger" style={{ width: '100%', justifyContent: 'flex-start' }}>
                <LogOut size={18} /> Log Out ({user?.name})
              </button>
            </>
          ) : (
            <>
              <button onClick={() => handleNav('login')} className="btn btn-secondary" style={{ width: '100%' }}>
                Log In
              </button>
              <button onClick={() => handleNav('signup')} className="btn btn-primary" style={{ width: '100%' }}>
                Get Started
              </button>
            </>
          )}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: inline-flex !important; }
        }
      `}</style>
    </header>
  );
}
