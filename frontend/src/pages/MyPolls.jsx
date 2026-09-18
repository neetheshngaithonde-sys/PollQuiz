import React, { useState, useEffect } from 'react';
import { pollService } from '../services/pollService';
import PollCard from '../components/PollCard';
import { PlusCircle, Search, Filter, Inbox } from 'lucide-react';

export default function MyPolls({ navigate, onShowToast }) {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'closed'

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
      if (onShowToast) onShowToast(`Poll ${nextActive ? 'activated' : 'closed'} successfully`);
    } catch (err) {
      alert(err.message || 'Failed to update poll status');
    }
  };

  const handleDeletePoll = async (pollId) => {
    if (!window.confirm('Are you sure you want to permanently delete this poll?')) {
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

  const filteredPolls = polls.filter((p) => {
    const matchesSearch = p.question.toLowerCase().includes(searchQuery.toLowerCase());
    if (statusFilter === 'active') return matchesSearch && p.is_active;
    if (statusFilter === 'closed') return matchesSearch && !p.is_active;
    return matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', paddingBottom: '3rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            My Created Polls
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            Manage your questions, monitor live responses, or share public links.
          </p>
        </div>

        <button 
          onClick={() => navigate('create-poll')}
          className="btn btn-primary"
        >
          <PlusCircle size={18} /> New Poll
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card" style={{
        padding: '1rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap',
      }}>
        <div style={{
          position: 'relative',
          flex: '1',
          minWidth: '240px',
        }}>
          <Search size={16} style={{
            position: 'absolute',
            left: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
          }} />
          <input 
            type="text"
            className="form-input"
            placeholder="Search polls by question..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.5rem', paddingRight: '1rem', paddingBottom: '0.65rem', paddingTop: '0.65rem' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['all', 'active', 'closed'].map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className="btn btn-secondary btn-sm"
              style={{
                textTransform: 'capitalize',
                border: statusFilter === filter ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                background: statusFilter === filter ? 'var(--primary-light)' : 'rgba(255, 255, 255, 0.05)',
                color: statusFilter === filter ? '#ffffff' : 'var(--text-secondary)',
              }}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Polls Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <div className="pulse-dot" style={{ margin: '0 auto 1rem auto' }}></div>
          Loading your polls...
        </div>
      ) : error ? (
        <div className="glass-card" style={{ color: 'var(--danger)', padding: '2rem', textAlign: 'center' }}>
          {error}
        </div>
      ) : filteredPolls.length === 0 ? (
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
            {searchQuery ? 'No matching polls found' : 'No polls found'}
          </h3>
          <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 1.5rem auto' }}>
            {searchQuery ? 'Try adjusting your search query or filter.' : 'Create a poll to start gathering real-time votes.'}
          </p>
          {!searchQuery && (
            <button onClick={() => navigate('create-poll')} className="btn btn-primary">
              <PlusCircle size={16} /> Create a Poll
            </button>
          )}
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.25rem',
        }}>
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
  );
}
