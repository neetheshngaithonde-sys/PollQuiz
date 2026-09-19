import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  BarChart3,
  PlusCircle,
  LayoutDashboard,
  ListFilter,
  LogOut,
  Menu,
  X,
  User,
  KeyRound,
} from 'lucide-react';

export default function Navbar({ currentRoute, navigate }) {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (route) => {
    navigate(route);
    setMobileMenuOpen(false);
  };

  const navButtonStyle = (route) => ({
    display: 'flex',
    alignItems: 'center',
    gap: '0.45rem',
    padding: '0.55rem 0.9rem',
    borderRadius: '8px',
    border: '1px solid transparent',
    background: currentRoute === route ? '#000000' : 'transparent',
    color: '#ffffff',
    fontSize: '0.9rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  });

  return (
    <header
      style={{
        width: '100%',
        background: '#2563eb',
        borderBottom: '1px solid rgba(255,255,255,0.2)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: '0 4px 15px rgba(0,0,0,0.15)',
      }}
    >
      <div
        style={{
          maxWidth: '1250px',
          margin: '0 auto',
          padding: '0.75rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
        }}
      >
        {/* ================= LOGO ================= */}
        <div
          onClick={() =>
            handleNav(isAuthenticated ? 'dashboard' : 'landing')
          }
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            cursor: 'pointer',
            flexShrink: 0,
          }}
        >
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563eb',
            }}
          >
            <BarChart3 size={23} />
          </div>

          <span
            style={{
              color: '#ffffff',
              fontSize: '1.3rem',
              fontWeight: 800,
              letterSpacing: '-0.02em',
            }}
          >
            PollQuiz
          </span>

          <span
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              background: '#000000',
              color: '#ffffff',
              padding: '3px 7px',
              borderRadius: '20px',
              fontSize: '0.65rem',
              fontWeight: 700,
            }}
          >
            <span
              style={{
                width: '5px',
                height: '5px',
                background: '#ffffff',
                borderRadius: '50%',
              }}
            />
            LIVE
          </span>
        </div>

        {/* ================= DESKTOP NAV ================= */}
        <nav
          className="desktop-nav"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
          }}
        >
          {isAuthenticated ? (
            <>
              {/* Dashboard */}
              <button
                onClick={() => handleNav('dashboard')}
                style={navButtonStyle('dashboard')}
              >
                <LayoutDashboard size={17} />
                Dashboard
              </button>

              {/* My Polls */}
              <button
                onClick={() => handleNav('my-polls')}
                style={navButtonStyle('my-polls')}
              >
                <ListFilter size={17} />
                My Polls
              </button>

              {/* Create Poll */}
              <button
                onClick={() => handleNav('create-poll')}
                style={navButtonStyle('create-poll')}
              >
                <PlusCircle size={17} />
                Create Poll
              </button>

              {/* Divider */}
              <div
                style={{
                  width: '1px',
                  height: '28px',
                  background: 'rgba(255,255,255,0.35)',
                  margin: '0 0.5rem',
                }}
              />

              {/* User */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  color: '#ffffff',
                  padding: '0.25rem 0.5rem',
                }}
              >
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    color: '#2563eb',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '0.9rem',
                  }}
                >
                  {user?.name ? (
                    user.name[0].toUpperCase()
                  ) : (
                    <User size={17} />
                  )}
                </div>

                <span
                  style={{
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                  }}
                >
                  {user?.name?.split(' ')[0] || 'User'}
                </span>
              </div>

              {/* Change Password */}
              <button
                onClick={() => handleNav('change-password')}
                title="Change Password"
                style={{
                  ...navButtonStyle('change-password'),
                  padding: '0.55rem',
                }}
              >
                <KeyRound size={17} />
              </button>

              {/* Logout */}
              <button
                onClick={logout}
                title="Log Out"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0.55rem',
                  borderRadius: '8px',
                  border: '1px solid transparent',
                  background: 'transparent',
                  color: '#ffffff',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                }}
                className="logout-button"
              >
                <LogOut size={17} />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleNav('login')}
                style={navButtonStyle('login')}
              >
                Log In
              </button>

              <button
                onClick={() => handleNav('signup')}
                style={navButtonStyle('signup')}
              >
                Get Started
              </button>
            </>
          )}
        </nav>

        {/* ================= MOBILE BUTTON ================= */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="mobile-toggle"
          style={{
            display: 'none',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.55rem',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.3)',
            background: 'transparent',
            color: '#ffffff',
            cursor: 'pointer',
          }}
        >
          {mobileMenuOpen ? <X size={21} /> : <Menu size={21} />}
        </button>
      </div>

      {/* ================= MOBILE MENU ================= */}
      {mobileMenuOpen && (
        <div
          style={{
            padding: '1rem 1.5rem',
            background: '#1d4ed8',
            borderTop: '1px solid rgba(255,255,255,0.2)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.6rem',
          }}
        >
          {isAuthenticated ? (
            <>
              <button
                onClick={() => handleNav('dashboard')}
                style={{
                  ...navButtonStyle('dashboard'),
                  width: '100%',
                  justifyContent: 'flex-start',
                }}
              >
                <LayoutDashboard size={18} />
                Dashboard
              </button>

              <button
                onClick={() => handleNav('my-polls')}
                style={{
                  ...navButtonStyle('my-polls'),
                  width: '100%',
                  justifyContent: 'flex-start',
                }}
              >
                <ListFilter size={18} />
                My Polls
              </button>

              <button
                onClick={() => handleNav('create-poll')}
                style={{
                  ...navButtonStyle('create-poll'),
                  width: '100%',
                  justifyContent: 'flex-start',
                }}
              >
                <PlusCircle size={18} />
                Create Poll
              </button>

              <button
                onClick={() => handleNav('change-password')}
                style={{
                  ...navButtonStyle('change-password'),
                  width: '100%',
                  justifyContent: 'flex-start',
                }}
              >
                <KeyRound size={18} />
                Change Password
              </button>

              <button
                onClick={logout}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  width: '100%',
                  justifyContent: 'flex-start',
                  padding: '0.65rem 0.9rem',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#000000',
                  color: '#ffffff',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <LogOut size={18} />
                Log Out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleNav('login')}
                style={{
                  ...navButtonStyle('login'),
                  width: '100%',
                  justifyContent: 'center',
                }}
              >
                Log In
              </button>

              <button
                onClick={() => handleNav('signup')}
                style={{
                  ...navButtonStyle('signup'),
                  width: '100%',
                  justifyContent: 'center',
                }}
              >
                Get Started
              </button>
            </>
          )}
        </div>
      )}

      {/* ================= RESPONSIVE CSS ================= */}
      <style>
        {`
          .desktop-nav button:hover {
            background: #000000 !important;
            color: #ffffff !important;
          }

          .logout-button:hover {
            background: #000000 !important;
            color: #ffffff !important;
          }

          @media (max-width: 900px) {
            .desktop-nav {
              gap: 0.2rem !important;
            }

            .desktop-nav button {
              padding: 0.5rem 0.65rem !important;
              font-size: 0.82rem !important;
            }
          }

          @media (max-width: 768px) {
            .desktop-nav {
              display: none !important;
            }

            .mobile-toggle {
              display: flex !important;
            }
          }
        `}
      </style>
    </header>
  );
}