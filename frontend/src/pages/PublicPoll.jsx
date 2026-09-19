import React, { useState, useEffect } from 'react';
import { pollService } from '../services/pollService';
import confetti from 'canvas-confetti';
import { 
  BarChart2, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  HelpCircle,
  Clock,
  Sparkles
} from 'lucide-react';

export default function PublicPoll({ pollId, navigate, onShowToast }) {
  const [poll, setPoll] = useState(null);
  const [selectedOption, setSelectedOption] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [alreadyVoted, setAlreadyVoted] = useState(false);

  useEffect(() => {
    // Check if voter already voted locally
    const votedKey = `voted_poll_${pollId}`;
    if (localStorage.getItem(votedKey)) {
      setAlreadyVoted(true);
    }

    async function fetchPoll() {
      try {
        setLoading(true);
        const data = await pollService.getPoll(pollId);
        setPoll(data);
      } catch (err) {
        setError(err.message || 'Poll not found or inactive');
      } finally {
        setLoading(false);
      }
    }

    if (pollId) {
      fetchPoll();
    }
  }, [pollId]);

  const handleVoteSubmit = async (e) => {
    e.preventDefault();
    if (!selectedOption) {
      setError('Please select an option to submit your vote');
      return;
    }

    setError('');
    setSubmitting(true);

    try {
      // Create or retrieve voter fingerprint
      let fingerprint = localStorage.getItem('voter_fingerprint');
      if (!fingerprint) {
        fingerprint = 'fp_' + Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
        localStorage.setItem('voter_fingerprint', fingerprint);
      }

      await pollService.vote(pollId, selectedOption, fingerprint);

      // Record local voted state
      localStorage.setItem(`voted_poll_${pollId}`, selectedOption);

      // Confetti burst for awesome user feedback
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // confetti fallback
      }

      if (onShowToast) onShowToast('Your vote has been cast!');

      // Immediate redirect to live results
      setTimeout(() => {
        navigate(`poll/${pollId}/results`);
      }, 700);

    } catch (err) {
      setError(err.message || 'Failed to submit vote');
      if (err.message && err.message.toLowerCase().includes('already')) {
        setAlreadyVoted(true);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
        <div className="pulse-dot" style={{ margin: '0 auto 1.5rem auto', width: '12px', height: '12px' }}></div>
        <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>Loading Poll...</h3>
      </div>
    );
  }

  if (error && !poll) {
    return (
      <div style={{ maxWidth: '540px', margin: '3rem auto', padding: '1rem' }}>
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <AlertCircle size={48} color="var(--danger)" style={{ margin: '0 auto 1rem auto' }} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Unable to Open Poll</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{error}</p>
          <button onClick={() => navigate('landing')} className="btn btn-secondary">
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '640px', margin: '1rem auto', paddingBottom: '3rem' }}>
      <div className="glass-card" style={{ padding: '2.5rem', border: '1px solid rgba(99, 102, 241, 0.3)' }}>
        {/* Status bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          {poll.is_active ? (
            <span className="badge badge-live">
              <span className="pulse-dot"></span> Active Poll
            </span>
          ) : (
            <span className="badge" style={{ background: 'rgba(244, 63, 94, 0.15)', color: 'var(--danger)' }}>
              Voting Closed
            </span>
          )}

          <button 
            onClick={() => navigate(`poll/${pollId}/results`)}
            className="btn btn-secondary btn-sm"
          >
            <BarChart2 size={14} /> View Live Results
          </button>
        </div>

        {/* Question */}
        <h1 style={{
          fontSize: '1.65rem',
          fontWeight: 800,
          lineHeight: 1.35,
          letterSpacing: '-0.02em',
          marginBottom: '1.75rem',
          color: '#09020e',
        }}>
          {poll.question}
        </h1>

        {/* Already Voted Notice */}
        {alreadyVoted && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.9rem 1.25rem',
            borderRadius: '0.875rem',
            background: 'rgba(56, 57, 92, 0.15)',
            border: '1px solid var(--border-highlight)',
            marginBottom: '1.75rem',
            gap: '0.75rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
              <CheckCircle2 size={18} color="#818cf8" />
              <span style={{ fontSize: '0.9rem', color: '#050608', fontWeight: 600 }}>
                You have already voted on this poll!
              </span>
            </div>
            <button 
              onClick={() => navigate(`poll/${pollId}/results`)}
              className="btn btn-primary btn-sm"
            >
              See Results
            </button>
          </div>
        )}

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem 1rem',
            borderRadius: '0.75rem',
            background: 'var(--danger-bg)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: '#fda4af',
            fontSize: '0.9rem',
            marginBottom: '1.5rem',
          }}>
            <AlertCircle size={18} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Options List */}
        <form onSubmit={handleVoteSubmit}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', marginBottom: '2rem' }}>
            {poll.options.map((opt) => {
              const isSelected = selectedOption === opt.id;
              return (
                <div
                  key={opt.id}
                  onClick={() => {
                    if (poll.is_active && !alreadyVoted) {
                      setSelectedOption(opt.id);
                      setError('');
                    }
                  }}
                  className={`vote-option-card ${isSelected ? 'selected' : ''}`}
                  style={{
                    opacity: !poll.is_active || alreadyVoted ? 0.6 : 1,
                    cursor: !poll.is_active || alreadyVoted ? 'not-allowed' : 'pointer',
                  }}
                >
                  <div className="custom-radio">
                    <div className="custom-radio-inner"></div>
                  </div>
                  <span style={{ fontSize: '1.05rem', fontWeight: 600, color: '#0e0f10' }}>
                    {opt.text}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Submit Button */}
          {poll.is_active && !alreadyVoted ? (
            <button
              type="submit"
              disabled={submitting || !selectedOption}
              className="btn btn-primary"
              style={{ width: '100%', padding: '1rem', fontSize: '1.05rem' }}
            >
              {submitting ? 'Submitting Vote...' : 'Submit Vote'} <ArrowRight size={18} />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate(`poll/${pollId}/results`)}
              className="btn btn-primary"
              style={{ width: '100%', padding: '1rem', fontSize: '1.05rem' }}
            >
              View Live Results <BarChart2 size={18} />
            </button>
          )}
        </form>

        <p style={{
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          textAlign: 'center',
          marginTop: '1.5rem',
        }}>
          Anonymous Voting • Results update in real-time
        </p>
      </div>
    </div>
  );
}
