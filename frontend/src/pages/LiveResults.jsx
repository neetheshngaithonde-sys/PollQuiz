import React, { useState, useEffect } from 'react';
import { pollService } from '../services/pollService';
import { connectPollWebSocket } from '../services/websocketService';
import ResultBar from '../components/ResultBar';
import { 
  BarChart3, 
  Users, 
  Share2, 
  Check, 
  Copy, 
  Wifi, 
  WifiOff, 
  ArrowLeft,
  Sparkles,
  Award
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
    // 1. Initial HTTP fetch for fallback & immediate render
    async function fetchInitial() {
      try {
        setLoading(true);
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

    // 2. Real-time WebSocket connection powered by Redis Pub/Sub
    const wsClient = connectPollWebSocket(
      pollId,
      (message) => {
        // message: { type: "VOTE_UPDATE" | "INITIAL_STATE", results: {...} }
        if (message && message.results) {
          setResults(message.results);
          if (message.type === 'VOTE_UPDATE') {
            setPulseNewVote(true);
            setTimeout(() => setPulseNewVote(false), 1200);
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
    if (onShowToast) onShowToast('Poll link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', color: 'var(--text-muted)' }}>
        <div className="pulse-dot" style={{ margin: '0 auto 1.5rem auto', width: '12px', height: '12px' }}></div>
        <h3 style={{ fontSize: '1.2rem', color: 'var(--text-primary)' }}>Loading Live Results...</h3>
      </div>
    );
  }

  if (error && !results) {
    return (
      <div style={{ maxWidth: '540px', margin: '3rem auto', padding: '1rem' }}>
        <div className="glass-card" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Unable to Load Results</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>{error}</p>
          <button onClick={() => navigate('dashboard')} className="btn btn-secondary">
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Determine top winning option
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

  return (
    <div style={{ maxWidth: '680px', margin: '1rem auto', paddingBottom: '3rem' }}>
      {/* Top action navigation */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '0.75rem',
      }}>
        <button 
          onClick={() => navigate('dashboard')}
          className="btn btn-secondary btn-sm"
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button 
            onClick={() => navigate(`poll/${pollId}`)}
            className="btn btn-secondary btn-sm"
          >
            Vote Page
          </button>

          <button 
            onClick={handleCopyShare}
            className="btn btn-primary btn-sm"
          >
            {copied ? <Check size={14} /> : <Share2 size={14} />}
            {copied ? 'Link Copied' : 'Share Poll'}
          </button>
        </div>
      </div>

      <div className="glass-card" style={{
        padding: '2.5rem',
        border: pulseNewVote 
          ? '1px solid #6366f1' 
          : '1px solid rgba(99, 102, 241, 0.25)',
        boxShadow: pulseNewVote 
          ? '0 0 35px rgba(99, 102, 241, 0.4)' 
          : 'var(--shadow-md)',
        transition: 'all 0.3s ease',
      }}>
        {/* Status Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span className="badge badge-live">
              <span className="pulse-dot"></span> LIVE RESULTS
            </span>

            {/* WebSocket connection status indicator */}
            <span style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.35rem',
              fontSize: '0.75rem',
              color: connected ? 'var(--success)' : 'var(--warning)',
              background: 'rgba(255, 255, 255, 0.04)',
              padding: '0.25rem 0.6rem',
              borderRadius: '6px',
            }}>
              {connected ? <Wifi size={12} /> : <WifiOff size={12} />}
              {connected ? 'Real-Time Sync Active' : 'Connecting...'}
            </span>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.9rem',
            fontWeight: 700,
            color: 'var(--text-primary)',
          }}>
            <Users size={16} color="#818cf8" />
            <span>{results?.total_votes || 0} Total {results?.total_votes === 1 ? 'Vote' : 'Votes'}</span>
          </div>
        </div>

        {/* Question Title */}
        <h1 style={{
          fontSize: '1.65rem',
          fontWeight: 800,
          letterSpacing: '-0.02em',
          lineHeight: 1.35,
          color: '#ffffff',
          marginBottom: '2rem',
        }}>
          {results?.question}
        </h1>

        {/* Results Bars */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '2rem' }}>
          {results?.options?.map((opt) => (
            <ResultBar 
              key={opt.id}
              option={opt}
              totalVotes={results.total_votes}
              isWinner={topOptionId === opt.id && maxVotes > 0}
              isSelected={myVotedOption === opt.id}
            />
          ))}
        </div>

        {/* Live Indicator Footer */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '1.25rem',
          borderTop: '1px solid var(--border-color)',
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="pulse-dot" style={{ width: '6px', height: '6px' }}></span>
            <span>Real-time Redis Pub/Sub stream</span>
          </div>

          <span>
            {results?.is_active ? 'Voting is actively open' : 'Voting has concluded'}
          </span>
        </div>
      </div>
    </div>
  );
}
