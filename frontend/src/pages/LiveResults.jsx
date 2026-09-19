import React, { useState, useEffect } from 'react';
import { pollService } from '../services/pollService';
import { connectPollWebSocket } from '../services/websocketService';
import ResultBar from '../components/ResultBar';
import {
  BarChart3,
  Users,
  Share2,
  Check,
  Wifi,
  WifiOff,
  ArrowLeft,
  Trophy,
  Vote,
  Radio,
} from 'lucide-react';

export default function LiveResults({ pollId, navigate, onShowToast }) {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [pulseNewVote, setPulseNewVote] = useState(false);

  const myVotedOption = localStorage.getItem(`voted_poll_${pollId}`);

  useEffect(() => {
    async function fetchInitial() {
      try {
        setLoading(true);
        setError('');

        const data = await pollService.getPollResults(pollId);
        setResults(data);
      } catch (err) {
        setError(err.message || 'Failed to load poll results');
      } finally {
        setLoading(false);
      }
    }

    if (pollId) {
      fetchInitial();
    }

    const wsClient = connectPollWebSocket(
      pollId,
      (message) => {
        if (message && message.results) {
          setResults(message.results);

          if (message.type === 'VOTE_UPDATE') {
            setPulseNewVote(true);

            setTimeout(() => {
              setPulseNewVote(false);
            }, 1200);
          }
        }
      },
      (isConnected) => {
        setConnected(isConnected);
      }
    );

    return () => {
      wsClient.disconnect();
    };
  }, [pollId]);

  const handleCopyShare = () => {
    const shareUrl = `${window.location.origin}/#poll/${pollId}`;

    navigator.clipboard.writeText(shareUrl);

    setCopied(true);

    if (onShowToast) {
      onShowToast('Poll link copied to clipboard!');
    }

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  if (loading) {
    return (
      <div
        style={{
          minHeight: '70vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem',
        }}
      >
        <div
          style={{
            textAlign: 'center',
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '20px',
            padding: '3rem',
            width: '100%',
            maxWidth: '420px',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.06)',
          }}
        >
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              border: '4px solid #dbeafe',
              borderTopColor: '#2563eb',
              animation: 'spin 1s linear infinite',
              margin: '0 auto 1.25rem',
            }}
          />

          <h3
            style={{
              margin: 0,
              fontSize: '1.15rem',
              fontWeight: 800,
              color: '#111827',
            }}
          >
            Loading Live Results...
          </h3>

          <p
            style={{
              marginTop: '0.5rem',
              color: '#6b7280',
              fontSize: '0.9rem',
            }}
          >
            Connecting to the live poll data.
          </p>
        </div>

        <style>
          {`
            @keyframes spin {
              to {
                transform: rotate(360deg);
              }
            }
          `}
        </style>
      </div>
    );
  }

  if (error && !results) {
    return (
      <div
        style={{
          maxWidth: '560px',
          margin: '4rem auto',
          padding: '1rem',
        }}
      >
        <div
          style={{
            background: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '20px',
            padding: '3rem 2rem',
            textAlign: 'center',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.06)',
          }}
        >
          <div
            style={{
              width: '58px',
              height: '58px',
              margin: '0 auto 1.25rem',
              borderRadius: '16px',
              background: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <BarChart3 size={28} />
          </div>

          <h2
            style={{
              fontSize: '1.5rem',
              fontWeight: 800,
              color: '#111827',
              marginBottom: '0.5rem',
            }}
          >
            Unable to Load Results
          </h2>

          <p
            style={{
              color: '#6b7280',
              marginBottom: '1.5rem',
            }}
          >
            {error}
          </p>

          <button
            onClick={() => navigate('dashboard')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.25rem',
              borderRadius: '10px',
              border: 'none',
              background: '#2563eb',
              color: '#ffffff',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={16} />
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Find winning option
  let maxVotes = 0;
  let topOptionId = null;

  if (results && results.options) {
    results.options.forEach((opt) => {
      if (opt.votes > maxVotes) {
        maxVotes = opt.votes;
        topOptionId = opt.id;
      }
    });
  }

  const totalVotes = results?.total_votes || 0;

  return (
    <div
      style={{
        minHeight: '100vh',
        background: '#f8fafc',
        padding: '2rem 1rem 4rem',
      }}
    >
      <div
        style={{
          maxWidth: '900px',
          margin: '0 auto',
        }}
      >
        {/* =========================================
            TOP NAVIGATION
        ========================================== */}

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '1rem',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
          }}
        >
          <button
            onClick={() => navigate('dashboard')}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.7rem 1rem',
              background: '#ffffff',
              color: '#111827',
              border: '1px solid #e5e7eb',
              borderRadius: '10px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <ArrowLeft size={16} />
            Dashboard
          </button>

          <div
            style={{
              display: 'flex',
              gap: '0.75rem',
              flexWrap: 'wrap',
            }}
          >
            <button
              onClick={() => navigate(`poll/${pollId}`)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.7rem 1rem',
                background: '#ffffff',
                color: '#111827',
                border: '1px solid #e5e7eb',
                borderRadius: '10px',
                fontWeight: 700,
                cursor: 'pointer',
              }}
            >
              <Vote size={16} />
              Vote Page
            </button>

            <button
              onClick={handleCopyShare}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.7rem 1.1rem',
                background: '#2563eb',
                color: '#ffffff',
                border: '1px solid #2563eb',
                borderRadius: '10px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 5px 14px rgba(37, 99, 235, 0.2)',
              }}
            >
              {copied ? <Check size={16} /> : <Share2 size={16} />}
              {copied ? 'Link Copied' : 'Share Poll'}
            </button>
          </div>
        </div>

        {/* =========================================
            MAIN CARD
        ========================================== */}

        <div
          style={{
            background: '#ffffff',
            border: pulseNewVote
              ? '2px solid #2563eb'
              : '1px solid #e5e7eb',
            borderRadius: '24px',
            padding: '2rem',
            boxShadow: pulseNewVote
              ? '0 0 0 5px rgba(37, 99, 235, 0.10), 0 15px 40px rgba(37, 99, 235, 0.15)'
              : '0 10px 35px rgba(15, 23, 42, 0.07)',
            transition: 'all 0.3s ease',
          }}
        >
          {/* =========================================
              HEADER
          ========================================== */}

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
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                flexWrap: 'wrap',
              }}
            >
              {/* LIVE BADGE */}

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  background: '#eff6ff',
                  color: '#2563eb',
                  border: '1px solid #bfdbfe',
                  padding: '0.45rem 0.75rem',
                  borderRadius: '999px',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  letterSpacing: '0.04em',
                }}
              >
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    background: '#2563eb',
                    borderRadius: '50%',
                    boxShadow: '0 0 0 4px rgba(37, 99, 235, 0.12)',
                  }}
                />

                LIVE RESULTS
              </div>

              {/* CONNECTION */}

              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  padding: '0.4rem 0.7rem',
                  borderRadius: '8px',
                  background: connected ? '#f0fdf4' : '#fff7ed',
                  color: connected ? '#15803d' : '#c2410c',
                  border: connected
                    ? '1px solid #bbf7d0'
                    : '1px solid #fed7aa',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                }}
              >
                {connected ? (
                  <Wifi size={13} />
                ) : (
                  <WifiOff size={13} />
                )}

                {connected
                  ? 'Real-Time Sync Active'
                  : 'Connecting...'}
              </div>
            </div>

            {/* TOTAL VOTES */}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#111827',
                fontWeight: 800,
                fontSize: '0.95rem',
              }}
            >
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '9px',
                  background: '#eff6ff',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Users size={17} />
              </div>

              <div>
                <div
                  style={{
                    fontSize: '1.05rem',
                    lineHeight: 1,
                  }}
                >
                  {totalVotes}
                </div>

                <div
                  style={{
                    color: '#6b7280',
                    fontSize: '0.72rem',
                    fontWeight: 600,
                    marginTop: '3px',
                  }}
                >
                  Total Votes
                </div>
              </div>
            </div>
          </div>

          {/* =========================================
              QUESTION
          ========================================== */}

          <div
            style={{
              background: '#111827',
              borderRadius: '16px',
              padding: '1.5rem',
              marginBottom: '1.75rem',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: '-35px',
                right: '-35px',
                width: '120px',
                height: '120px',
                borderRadius: '50%',
                background: 'rgba(37, 99, 235, 0.25)',
              }}
            />

            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.85rem',
              }}
            >
              <BarChart3
                size={22}
                color="#60a5fa"
                style={{ marginTop: '3px', flexShrink: 0 }}
              />

              <h1
                style={{
                  fontSize: '1.45rem',
                  fontWeight: 800,
                  lineHeight: 1.4,
                  color: '#ffffff',
                  margin: 0,
                  letterSpacing: '-0.02em',
                }}
              >
                {results?.question}
              </h1>
            </div>
          </div>

          {/* =========================================
              RESULTS TITLE
          ========================================== */}

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '1rem',
              gap: '1rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.55rem',
              }}
            >
              <Radio size={18} color="#2563eb" />

              <h2
                style={{
                  margin: 0,
                  fontSize: '1rem',
                  fontWeight: 800,
                  color: '#111827',
                }}
              >
                Current Results
              </h2>
            </div>

            <span
              style={{
                color: '#6b7280',
                fontSize: '0.78rem',
                fontWeight: 600,
              }}
            >
              Updating live
            </span>
          </div>

          {/* =========================================
              RESULT BARS
          ========================================== */}

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '0.65rem',
              marginBottom: '1.75rem',
            }}
          >
            {results?.options?.map((opt) => (
              <ResultBar
                key={opt.id}
                option={opt}
                totalVotes={results.total_votes}
                isWinner={
                  topOptionId === opt.id && maxVotes > 0
                }
                isSelected={myVotedOption === opt.id}
              />
            ))}
          </div>

          {/* =========================================
              WINNER / STATUS INFO
          ========================================== */}

          {maxVotes > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.85rem 1rem',
                background: '#eff6ff',
                border: '1px solid #dbeafe',
                borderRadius: '12px',
                marginBottom: '1.5rem',
              }}
            >
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '9px',
                  background: '#2563eb',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Trophy size={17} />
              </div>

              <div>
                <div
                  style={{
                    fontSize: '0.78rem',
                    color: '#2563eb',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                  }}
                >
                  Leading Option
                </div>

                <div
                  style={{
                    fontSize: '0.88rem',
                    color: '#111827',
                    fontWeight: 700,
                    marginTop: '2px',
                  }}
                >
                  {results?.options?.find(
                    (opt) => opt.id === topOptionId
                  )?.text || 'No leading option yet'}
                </div>
              </div>
            </div>
          )}

          {/* =========================================
              FOOTER
          ========================================== */}

          <div
            style={{
              borderTop: '1px solid #e5e7eb',
              paddingTop: '1.25rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              gap: '1rem',
              flexWrap: 'wrap',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#6b7280',
                fontSize: '0.78rem',
                fontWeight: 600,
              }}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: connected
                    ? '#22c55e'
                    : '#f59e0b',
                }}
              />

              {connected
                ? 'Real-time updates enabled'
                : 'Waiting for real-time connection'}
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                color: results?.is_active
                  ? '#15803d'
                  : '#6b7280',
                fontSize: '0.78rem',
                fontWeight: 700,
              }}
            >
              <span
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  background: results?.is_active
                    ? '#22c55e'
                    : '#9ca3af',
                }}
              />

              {results?.is_active
                ? 'Voting is actively open'
                : 'Voting has concluded'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}