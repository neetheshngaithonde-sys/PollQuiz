import React, { useState, useEffect } from 'react';
import { pollService } from '../services/pollService';
import PollCard from '../components/PollCard';

import {
  PlusCircle,
  Search,
  Inbox,
  BarChart3,
  CheckCircle,
  XCircle,
  SlidersHorizontal,
  ArrowRight,
} from 'lucide-react';

export default function MyPolls({ navigate, onShowToast }) {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // =====================================================
  // LOAD POLLS
  // =====================================================

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

  // =====================================================
  // TOGGLE STATUS
  // =====================================================

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

  // =====================================================
  // DELETE
  // =====================================================

  const handleDeletePoll = async (pollId) => {
    if (
      !window.confirm(
        'Are you sure you want to permanently delete this poll?'
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

  // =====================================================
  // FILTER
  // =====================================================

  const filteredPolls = polls.filter((poll) => {
    const question = poll.question || '';

    const matchesSearch = question
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    if (statusFilter === 'active') {
      return matchesSearch && poll.is_active;
    }

    if (statusFilter === 'closed') {
      return matchesSearch && !poll.is_active;
    }

    return matchesSearch;
  });

  // =====================================================
  // COUNTS
  // =====================================================

  const totalPolls = polls.length;

  const activePolls = polls.filter(
    (poll) => poll.is_active
  ).length;

  const closedPolls = polls.filter(
    (poll) => !poll.is_active
  ).length;

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <div
      style={{
        minHeight: '100%',
        background: '#f8fafc',
        padding: '2rem 1.5rem 4rem',
      }}
    >
      <div
        style={{
          maxWidth: '1250px',
          margin: '0 auto',
        }}
      >

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
            marginBottom: '1.5rem',
          }}
        >
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: '#eff6ff',
                color: '#2563eb',
                border: '1px solid #dbeafe',
                padding: '0.35rem 0.7rem',
                borderRadius: '20px',
                fontSize: '0.72rem',
                fontWeight: 700,
                marginBottom: '0.65rem',
              }}
            >
              <BarChart3 size={14} />
              POLL MANAGEMENT
            </div>

            <h1
              style={{
                margin: 0,
                color: '#0f172a',
                fontSize: 'clamp(1.6rem, 4vw, 2.2rem)',
                fontWeight: 800,
                letterSpacing: '-0.03em',
              }}
            >
              My Polls
            </h1>

            <p
              style={{
                margin: '0.4rem 0 0',
                color: '#64748b',
                fontSize: '0.9rem',
              }}
            >
              Manage your polls, monitor responses and share
              them with your audience.
            </p>
          </div>

          <button
            onClick={() => navigate('create-poll')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: '#2563eb',
              color: '#ffffff',
              border: 'none',
              borderRadius: '9px',
              padding: '0.75rem 1rem',
              fontSize: '0.85rem',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <PlusCircle size={18} />
            New Poll
          </button>
        </div>

        {/* ================================================= */}
        {/* SUMMARY CARDS */}
        {/* ================================================= */}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns:
              'repeat(auto-fit, minmax(190px, 1fr))',
            gap: '1rem',
            marginBottom: '1.5rem',
          }}
        >
          {/* Total */}

          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '1.15rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '11px',
                background: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <BarChart3 size={21} />
            </div>

            <div>
              <div
                style={{
                  color: '#64748b',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                Total Polls
              </div>

              <div
                style={{
                  color: '#0f172a',
                  fontSize: '1.45rem',
                  fontWeight: 800,
                }}
              >
                {totalPolls}
              </div>
            </div>
          </div>

          {/* Active */}

          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '1.15rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '11px',
                background: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CheckCircle size={21} />
            </div>

            <div>
              <div
                style={{
                  color: '#64748b',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                Active
              </div>

              <div
                style={{
                  color: '#0f172a',
                  fontSize: '1.45rem',
                  fontWeight: 800,
                }}
              >
                {activePolls}
              </div>
            </div>
          </div>

          {/* Closed */}

          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '1.15rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '11px',
                background: '#f1f5f9',
                color: '#475569',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <XCircle size={21} />
            </div>

            <div>
              <div
                style={{
                  color: '#64748b',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                }}
              >
                Closed
              </div>

              <div
                style={{
                  color: '#0f172a',
                  fontSize: '1.45rem',
                  fontWeight: 800,
                }}
              >
                {closedPolls}
              </div>
            </div>
          </div>
        </div>

        {/* ================================================= */}
        {/* SEARCH + FILTER */}
        {/* ================================================= */}

        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '14px',
            padding: '1rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            flexWrap: 'wrap',
          }}
        >
          {/* Search */}

          <div
            style={{
              position: 'relative',
              flex: 1,
              minWidth: '240px',
            }}
          >
            <Search
              size={17}
              style={{
                position: 'absolute',
                left: '0.85rem',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#94a3b8',
              }}
            />

            <input
              type="text"
              placeholder="Search polls..."
              value={searchQuery}
              onChange={(e) =>
                setSearchQuery(e.target.value)
              }
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '0.7rem 0.9rem 0.7rem 2.4rem',
                border: '1px solid #cbd5e1',
                borderRadius: '9px',
                outline: 'none',
                color: '#0f172a',
                background: '#ffffff',
                fontSize: '0.85rem',
              }}
              className="poll-search-input"
            />
          </div>

          {/* Filter label */}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              color: '#64748b',
              fontSize: '0.78rem',
              fontWeight: 600,
            }}
          >
            <SlidersHorizontal size={15} />
            Filter
          </div>

          {/* Filters */}

          <div
            style={{
              display: 'flex',
              gap: '0.4rem',
            }}
          >
            {['all', 'active', 'closed'].map((filter) => {
              const selected = statusFilter === filter;

              return (
                <button
                  key={filter}
                  onClick={() => setStatusFilter(filter)}
                  style={{
                    background: selected
                      ? '#000000'
                      : '#ffffff',
                    color: selected
                      ? '#ffffff'
                      : '#475569',
                    border: selected
                      ? '1px solid #000000'
                      : '1px solid #cbd5e1',
                    borderRadius: '8px',
                    padding: '0.55rem 0.8rem',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    textTransform: 'capitalize',
                    cursor: 'pointer',
                  }}
                >
                  {filter}
                </button>
              );
            })}
          </div>
        </div>

        {/* ================================================= */}
        {/* RESULT COUNT */}
        {/* ================================================= */}

        {!loading && !error && filteredPolls.length > 0 && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.85rem',
            }}
          >
            <div
              style={{
                color: '#64748b',
                fontSize: '0.8rem',
              }}
            >
              Showing{' '}
              <strong style={{ color: '#0f172a' }}>
                {filteredPolls.length}
              </strong>{' '}
              {filteredPolls.length === 1
                ? 'poll'
                : 'polls'}
            </div>
          </div>
        )}

        {/* ================================================= */}
        {/* LOADING */}
        {/* ================================================= */}

        {loading && (
          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '16px',
              padding: '3.5rem',
              textAlign: 'center',
              color: '#64748b',
            }}
          >
            <div
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                border: '3px solid #dbeafe',
                borderTopColor: '#2563eb',
                margin: '0 auto 1rem',
                animation:
                  'myPollsSpin 0.8s linear infinite',
              }}
            />

            Loading your polls...
          </div>
        )}

        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

        {!loading && error && (
          <div
            style={{
              background: '#fef2f2',
              border: '1px solid #fecaca',
              color: '#dc2626',
              borderRadius: '14px',
              padding: '1.5rem',
              textAlign: 'center',
            }}
          >
            {error}
          </div>
        )}

        {/* ================================================= */}
        {/* EMPTY */}
        {/* ================================================= */}

        {!loading &&
          !error &&
          filteredPolls.length === 0 && (
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
                  fontSize: '1.2rem',
                  fontWeight: 800,
                }}
              >
                {searchQuery
                  ? 'No matching polls'
                  : statusFilter !== 'all'
                  ? `No ${statusFilter} polls`
                  : 'No polls yet'}
              </h3>

              <p
                style={{
                  maxWidth: '420px',
                  margin: '0.5rem auto 1.5rem',
                  color: '#64748b',
                  fontSize: '0.85rem',
                  lineHeight: 1.6,
                }}
              >
                {searchQuery
                  ? 'Try changing your search or selecting another filter.'
                  : statusFilter !== 'all'
                  ? `You don't have any ${statusFilter} polls right now.`
                  : 'Create your first poll and start collecting real-time responses.'}
              </p>

              {!searchQuery &&
                statusFilter === 'all' && (
                  <button
                    onClick={() => navigate('create-poll')}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.45rem',
                      background: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '9px',
                      padding: '0.75rem 1rem',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <PlusCircle size={17} />
                    Create a Poll
                  </button>
                )}
            </div>
          )}

        {/* ================================================= */}
        {/* POLL GRID */}
        {/* ================================================= */}

        {!loading &&
          !error &&
          filteredPolls.length > 0 && (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fill, minmax(310px, 1fr))',
                gap: '1.25rem',
              }}
            >
              {filteredPolls.map((poll) => (
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
      </div>

      {/* ================================================= */}
      {/* RESPONSIVE CSS */}
      {/* ================================================= */}

      <style>
        {`
          @keyframes myPollsSpin {
            to {
              transform: rotate(360deg);
            }
          }

          .poll-search-input:focus {
            border-color: #2563eb !important;
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
          }

          @media (max-width: 600px) {
            .poll-search-input {
              min-width: 100% !important;
            }
          }
        `}
      </style>
    </div>
  );
}