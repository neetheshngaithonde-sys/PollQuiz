import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { pollService } from '../services/pollService';
import PollCard from '../components/PollCard';
import { 
  PlusCircle, 
  BarChart2, 
  Users, 
  CheckCircle, 
  ArrowRight, 
  Sparkles,
  Inbox,
  KeyRound
} from 'lucide-react';

export default function Dashboard({ navigate, onShowToast }) {
  const { user } = useAuth();
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPolls = async () => {
    try {
      setLoading(true);
      const data = await pollService.getMyPolls();
      setPolls(data || []);
    } catch (err) {
      setError(err.message || 'Failed to load your polls');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPolls();
  }, []);

  const handleToggleStatus = async (pollId, nextActive) => {
    try {
      await pollService.toggleStatus(pollId, nextActive);
      setPolls((prev) =>
        prev.map((p) => (p.id === pollId ? { ...p, is_active: nextActive } : p))
      );
      if (onShowToast) {
        onShowToast(`Poll ${nextActive ? 'activated' : 'closed'} successfully`);
      }
    } catch (err) {
      alert(err.message || 'Failed to update poll status');
    }
  };

  const handleDeletePoll = async (pollId) => {
    if (!window.confirm('Are you sure you want to delete this poll and all its votes?')) {
      return;
    }

    try {
      await pollService.deletePoll(pollId);
      setPolls((prev) => prev.filter((p) => p.id !== pollId));
      if (onShowToast) onShowToast('Poll deleted successfully');
    } catch (err) {
      alert(err.message || 'Failed to delete poll');
    }
  };

  const totalPolls = polls.length;
  const activePolls = polls.filter((p) => p.is_active).length;
  const totalVotesCount = polls.reduce((acc, p) => acc + (p.total_votes || 0), 0);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      {/* Header & Greeting */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            {getGreeting()}, {user?.name?.split(' ')[0] || 'Creator'}!
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            Here is what's happening with your live audience polls.
          </p>
        </div>

        <button 
          onClick={() => navigate('create-poll')}
          className="btn btn-primary"
          style={{ padding: '0.85rem 1.75rem' }}
        >
          <PlusCircle size={18} /> Create New Poll
        </button>
      </div>

      {/* Metrics Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.25rem',
      }}>
        {/* Total Polls */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: 'rgba(99, 102, 241, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#818cf8',
          }}>
            <BarChart2 size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Total Created
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {totalPolls}
            </div>
          </div>
        </div>

        {/* Active Polls */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: 'rgba(16, 185, 129, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#34d399',
          }}>
            <CheckCircle size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Active Polls
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {activePolls}
            </div>
          </div>
        </div>

        {/* Total Votes */}
        <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: 'rgba(244, 63, 94, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fb7185',
          }}>
            <Users size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Audience Votes
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {totalVotesCount}
            </div>
          </div>
        </div>

        {/* Security & Password Card */}
        <div 
          className="glass-card" 
          onClick={() => navigate('change-password')}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '1.25rem', 
            cursor: 'pointer',
            border: '1px solid rgba(245, 158, 11, 0.25)',
          }}
          title="Manage Account Password & Security"
        >
          <div style={{
            width: '52px',
            height: '52px',
            borderRadius: '14px',
            background: 'rgba(245, 158, 11, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fbbf24',
          }}>
            <KeyRound size={26} />
          </div>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>
              Security
            </div>
            <div style={{ 
              fontSize: '1rem', 
              fontWeight: 700, 
              color: 'var(--text-primary)', 
              display: 'flex', 
              alignItems: 'center', 
              gap: '0.35rem',
              marginTop: '0.15rem' 
            }}>
              Password <ArrowRight size={14} color="#fbbf24" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Polls Section */}
      <div>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.25rem',
        }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700 }}>
            Recent Polls
          </h2>
          {polls.length > 0 && (
            <button 
              onClick={() => navigate('my-polls')}
              className="btn btn-secondary btn-sm"
            >
              View All ({polls.length}) <ArrowRight size={14} />
            </button>
          )}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <div className="pulse-dot" style={{ margin: '0 auto 1rem auto' }}></div>
            Loading your polls...
          </div>
        ) : error ? (
          <div className="glass-card" style={{ color: 'var(--danger)', padding: '2rem', textAlign: 'center' }}>
            {error}
          </div>
        ) : polls.length === 0 ? (
          <div className="glass-card" style={{
            textAlign: 'center',
            padding: '3.5rem 1.5rem',
            border: '1.5px dashed var(--border-color)',
          }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '18px',
              background: 'rgba(99, 102, 241, 0.12)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#818cf8',
              marginBottom: '1rem',
            }}>
              <Inbox size={30} />
            </div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              No polls created yet
            </h3>
            <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>
              Get started by creating an interactive poll for your audience and watch live real-time votes stream in.
            </p>
            <button 
              onClick={() => navigate('create-poll')}
              className="btn btn-primary"
            >
              <PlusCircle size={16} /> Create Your First Poll
            </button>
          </div>
        ) : (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: '1.25rem',
          }}>
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
      </div>
    </div>
  );
}
