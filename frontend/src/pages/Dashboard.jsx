import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { pollService } from '../services/pollService';
import PollCard from '../components/PollCard';

import {
  PlusCircle,
  BarChart3,
  Users,
  CheckCircle,
  ArrowRight,
  Inbox,
  KeyRound,
  Clock3,
} from 'lucide-react';

export default function Dashboard({ navigate, onShowToast }) {
  const { user } = useAuth();

  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // ================= LOAD POLLS =================

  const loadPolls = async () => {
    try {
      setLoading(true);

      const data = await pollService.getMyPolls();

      setPolls(data || []);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to load your polls');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPolls();
  }, []);

  // ================= POLL ACTIONS =================

  const handleToggleStatus = async (pollId, nextActive) => {
    try {
      await pollService.toggleStatus(pollId, nextActive);

      setPolls((prev) =>
        prev.map((poll) =>
          poll.id === pollId
            ? { ...poll, is_active: nextActive }
            : poll
        )
      );

      if (onShowToast) {
        onShowToast(
          `Poll ${nextActive ? 'activated' : 'closed'} successfully`
        );
      }
    } catch (err) {
      alert(err.message || 'Failed to update poll status');
    }
  };

  const handleDeletePoll = async (pollId) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this poll and all its votes?'
      )
    ) {
      return;
    }

    try {
      await pollService.deletePoll(pollId);

      setPolls((prev) =>
        prev.filter((poll) => poll.id !== pollId)
      );

      if (onShowToast) {
        onShowToast('Poll deleted successfully');
      }
    } catch (err) {
      alert(err.message || 'Failed to delete poll');
    }
  };

  // ================= STATISTICS =================

  const totalPolls = polls.length;

  const activePolls = polls.filter(
    (poll) => poll.is_active
  ).length;

  const closedPolls = polls.filter(
    (poll) => !poll.is_active
  ).length;

  const totalVotesCount = polls.reduce(
    (total, poll) => total + (poll.total_votes || 0),
    0
  );

  // ================= GREETING =================

  const getGreeting = () => {
    const hour = new Date().getHours();

    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';

    return 'Good evening';
  };

  // ================= STAT CARD =================

  const StatCard = ({
    icon,
    title,
    value,
    description,
    iconBackground,
    iconColor,
  }) => {
    return (
      <div
        style={{
          background: '#ffffff',
          border: '1px solid #e5e7eb',
          borderRadius: '16px',
          padding: '1.35rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: '0 4px 14px rgba(15, 23, 42, 0.05)',
          transition: 'all 0.2s ease',
        }}
        className="dashboard-stat-card"
      >
        <div
          style={{
            width: '52px',
            height: '52px',
            minWidth: '52px',
            borderRadius: '14px',
            background: iconBackground,
            color: iconColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {icon}
        </div>

        <div style={{ minWidth: 0 }}>
          <div
            style={{
              color: '#64748b',
              fontSize: '0.82rem',
              fontWeight: 600,
              marginBottom: '0.2rem',
            }}
          >
            {title}
          </div>

          <div
            style={{
              color: '#0f172a',
              fontSize: '1.75rem',
              fontWeight: 800,
              lineHeight: 1.2,
            }}
          >
            {value}
          </div>

          <div
            style={{
              color: '#94a3b8',
              fontSize: '0.75rem',
              marginTop: '0.15rem',
            }}
          >
            {description}
          </div>
        </div>
      </div>
    );
  };

  // ================= MAIN UI =================

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '1250px',
        margin: '0 auto',
        padding: '2rem 1.5rem 4rem',
        boxSizing: 'border-box',
      }}
    >
      {/* ================================================= */}
      {/* HEADER */}
      {/* ================================================= */}

      <section
        style={{
          background:
            'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
          borderRadius: '20px',
          padding: '2rem',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1.5rem',
          marginBottom: '1.5rem',
          boxShadow: '0 10px 30px rgba(37, 99, 235, 0.2)',
        }}
        className="dashboard-hero"
      >
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'rgba(255,255,255,0.15)',
              padding: '0.35rem 0.7rem',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 600,
              marginBottom: '0.75rem',
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#ffffff',
              }}
            />
            Live Dashboard
          </div>

          <h1
            style={{
              margin: 0,
              fontSize: 'clamp(1.5rem, 3vw, 2.15rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
            }}
          >
            {getGreeting()},{' '}
            {user?.name?.split(' ')[0] || 'Creator'}!
          </h1>

          <p
            style={{
              margin: '0.5rem 0 0',
              color: 'rgba(255,255,255,0.85)',
              fontSize: '0.95rem',
            }}
          >
            Create polls, collect votes and engage your audience
            in real time.
          </p>
        </div>

        <button
          onClick={() => navigate('create-poll')}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            background: '#000000',
            color: '#ffffff',
            border: 'none',
            borderRadius: '10px',
            padding: '0.8rem 1.15rem',
            fontSize: '0.9rem',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
          }}
        >
          <PlusCircle size={18} />
          Create New Poll
        </button>
      </section>

      {/* ================================================= */}
      {/* STATISTICS */}
      {/* ================================================= */}

      <section style={{ marginBottom: '2rem' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1rem',
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                color: '#0f172a',
                fontSize: '1.25rem',
                fontWeight: 800,
              }}
            >
              Poll Overview
            </h2>

            <p
              style={{
                margin: '0.25rem 0 0',
                color: '#64748b',
                fontSize: '0.85rem',
              }}
            >
              A quick look at your polling activity
            </p>
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(220px, 1fr))',
            gap: '1rem',
          }}
        >
          <StatCard
            icon={<BarChart3 size={24} />}
            title="Total Polls"
            value={totalPolls}
            description="Polls created"
            iconBackground="#eff6ff"
            iconColor="#2563eb"
          />

          <StatCard
            icon={<CheckCircle size={24} />}
            title="Active Polls"
            value={activePolls}
            description="Currently accepting votes"
            iconBackground="#ecfdf5"
            iconColor="#059669"
          />

          <StatCard
            icon={<Users size={24} />}
            title="Total Votes"
            value={totalVotesCount}
            description="Audience responses"
            iconBackground="#f5f3ff"
            iconColor="#7c3aed"
          />

          <StatCard
            icon={<Clock3 size={24} />}
            title="Closed Polls"
            value={closedPolls}
            description="No longer active"
            iconBackground="#f8fafc"
            iconColor="#475569"
          />
        </div>
      </section>

      {/* ================================================= */}
      {/* QUICK ACTIONS */}
      {/* ================================================= */}

      <section
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1rem',
          marginBottom: '2rem',
        }}
      >
        {/* Create Poll */}
        <div
          onClick={() => navigate('create-poll')}
          style={{
            background: '#000000',
            color: '#ffffff',
            borderRadius: '16px',
            padding: '1.25rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
          }}
        >
          <div>
            <div
              style={{
                fontSize: '0.75rem',
                color: '#94a3b8',
                fontWeight: 600,
                marginBottom: '0.3rem',
              }}
            >
              QUICK ACTION
            </div>

            <div
              style={{
                fontSize: '1rem',
                fontWeight: 700,
              }}
            >
              Create a new poll
            </div>

            <div
              style={{
                fontSize: '0.8rem',
                color: '#cbd5e1',
                marginTop: '0.25rem',
              }}
            >
              Start engaging your audience
            </div>
          </div>

          <ArrowRight size={20} />
        </div>

        {/* Security */}
        <div
          onClick={() => navigate('change-password')}
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '16px',
            padding: '1.25rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.9rem',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                background: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <KeyRound size={21} />
            </div>

            <div>
              <div
                style={{
                  fontSize: '0.75rem',
                  color: '#64748b',
                  fontWeight: 600,
                }}
              >
                ACCOUNT SECURITY
              </div>

              <div
                style={{
                  color: '#0f172a',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  marginTop: '0.2rem',
                }}
              >
                Change Password
              </div>
            </div>
          </div>

          <ArrowRight
            size={18}
            color="#64748b"
          />
        </div>
      </section>

      {/* ================================================= */}
      {/* RECENT POLLS */}
      {/* ================================================= */}

      <section>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            marginBottom: '1rem',
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                color: '#0f172a',
                fontSize: '1.25rem',
                fontWeight: 800,
              }}
            >
              Recent Polls
            </h2>

            <p
              style={{
                margin: '0.25rem 0 0',
                color: '#64748b',
                fontSize: '0.85rem',
              }}
            >
              Manage your latest polls
            </p>
          </div>

          {polls.length > 0 && (
            <button
              onClick={() => navigate('my-polls')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                background: '#ffffff',
                color: '#2563eb',
                border: '1px solid #dbeafe',
                borderRadius: '8px',
                padding: '0.55rem 0.8rem',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              View All
              <ArrowRight size={14} />
            </button>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '16px',
              padding: '3rem',
              textAlign: 'center',
              color: '#64748b',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: '3px solid #dbeafe',
                borderTopColor: '#2563eb',
                margin: '0 auto 1rem',
                animation: 'dashboardSpin 0.8s linear infinite',
              }}
            />

            Loading your polls...
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              borderRadius: '14px',
              padding: '1.25rem',
              textAlign: 'center',
            }}
          >
            {error}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && polls.length === 0 && (
          <div
            style={{
              background: '#ffffff',
              border: '1px dashed #cbd5e1',
              borderRadius: '18px',
              padding: '4rem 1.5rem',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: '68px',
                height: '68px',
                borderRadius: '18px',
                background: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem',
              }}
            >
              <Inbox size={32} />
            </div>

            <h3
              style={{
                margin: 0,
                color: '#0f172a',
                fontSize: '1.25rem',
                fontWeight: 800,
              }}
            >
              No polls yet
            </h3>

            <p
              style={{
                maxWidth: '420px',
                margin: '0.5rem auto 1.5rem',
                color: '#64748b',
                fontSize: '0.9rem',
                lineHeight: 1.6,
              }}
            >
              You haven't created any polls yet. Create your
              first interactive poll and start collecting
              real-time audience responses.
            </p>

            <button
              onClick={() => navigate('create-poll')}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: '#2563eb',
                color: '#ffffff',
                border: 'none',
                borderRadius: '9px',
                padding: '0.75rem 1.1rem',
                fontSize: '0.85rem',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <PlusCircle size={17} />
              Create Your First Poll
            </button>
          </div>
        )}

        {/* Poll Cards */}
        {!loading && !error && polls.length > 0 && (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns:
                'repeat(auto-fill, minmax(310px, 1fr))',
              gap: '1rem',
            }}
          >
            {polls.slice(0, 6).map((poll) => (
              <PollCard
                key={poll.id}
                poll={poll}
                navigate={navigate}
                onToggleStatus={handleToggleStatus}
                onDelete={handleDeletePoll}
                onShowToast={onShowToast}
              />
            ))}
          </div>
        )}
      </section>

      {/* ================================================= */}
      {/* RESPONSIVE / ANIMATION */}
      {/* ================================================= */}

      <style>
        {`
          @keyframes dashboardSpin {
            to {
              transform: rotate(360deg);
            }
          }

          .dashboard-stat-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 22px rgba(15, 23, 42, 0.09) !important;
          }

          @media (max-width: 768px) {
            .dashboard-hero {
              padding: 1.5rem !important;
              flex-direction: column !important;
              align-items: flex-start !important;
            }

            .dashboard-hero button {
              width: 100%;
            }
          }

          @media (max-width: 480px) {
            .dashboard-stat-card {
              padding: 1rem !important;
            }
          }
        `}
      </style>
    </div>
  );
}