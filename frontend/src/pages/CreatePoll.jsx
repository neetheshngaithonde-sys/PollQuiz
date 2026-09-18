import React, { useState } from 'react';
import { pollService } from '../services/pollService';
import ShareModal from '../components/ShareModal';
import { Plus, Trash2, HelpCircle, Sparkles, ArrowLeft, Check } from 'lucide-react';

export default function CreatePoll({ navigate, onShowToast }) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdPollId, setCreatedPollId] = useState(null);

  const handleOptionChange = (index, value) => {
    const next = [...options];
    next[index] = value;
    setOptions(next);
  };

  const handleAddOption = () => {
    if (options.length >= 10) {
      setError('A poll can have at most 10 options');
      return;
    }
    setOptions([...options, '']);
  };

  const handleRemoveOption = (index) => {
    if (options.length <= 2) {
      setError('A poll requires at least 2 options');
      return;
    }
    const next = options.filter((_, idx) => idx !== index);
    setOptions(next);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanQuestion = question.trim();
    if (!cleanQuestion || cleanQuestion.length < 5) {
      setError('Poll question must be at least 5 characters');
      return;
    }

    const cleanOptions = options.map((opt) => opt.trim()).filter(Boolean);
    if (cleanOptions.length < 2) {
      setError('Please provide at least 2 valid options');
      return;
    }

    // Check duplicates
    const unique = new Set(cleanOptions.map((o) => o.toLowerCase()));
    if (unique.size !== cleanOptions.length) {
      setError('Options must be unique');
      return;
    }

    setLoading(true);
    try {
      const poll = await pollService.createPoll(cleanQuestion, cleanOptions);
      setCreatedPollId(poll.id);
      if (onShowToast) onShowToast('Poll created successfully!');
    } catch (err) {
      setError(err.message || 'Failed to create poll');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '680px', margin: '0 auto', paddingBottom: '3rem' }}>
      {/* Back Link */}
      <button 
        onClick={() => navigate('dashboard')}
        className="btn btn-secondary btn-sm"
        style={{ marginBottom: '1.5rem', display: 'inline-flex' }}
      >
        <ArrowLeft size={16} /> Back to Dashboard
      </button>

      <div className="glass-card" style={{ padding: '2.5rem' }}>
        <div style={{ marginBottom: '2rem' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '12px',
            background: 'var(--primary-gradient)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            marginBottom: '1rem',
            boxShadow: 'var(--shadow-glow)',
          }}>
            <Sparkles size={24} />
          </div>
          <h1 style={{ fontSize: '1.85rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Create a Live Poll
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            Set up your question and choices. Your audience will see results update live.
          </p>
        </div>

        {error && (
          <div style={{
            padding: '0.85rem 1.25rem',
            borderRadius: '0.75rem',
            background: 'var(--danger-bg)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            color: '#fda4af',
            fontSize: '0.9rem',
            marginBottom: '1.75rem',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Question */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Poll Question *</span>
              <span style={{ fontSize: '0.8rem', color: question.length > 200 ? 'var(--danger)' : 'var(--text-muted)' }}>
                {question.length}/250
              </span>
            </label>
            <input 
              type="text"
              required
              maxLength={250}
              className="form-input"
              placeholder="e.g. Which frontend framework do you prefer for real-time apps?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              style={{ fontSize: '1.05rem', fontWeight: 500 }}
            />
          </div>

          {/* Options List */}
          <div className="form-group" style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
            <label className="form-label">Poll Options (2 - 10)</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {options.map((opt, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-color)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    color: 'var(--text-secondary)',
                    flexShrink: 0,
                  }}>
                    {idx + 1}
                  </div>

                  <input 
                    type="text"
                    required
                    maxLength={100}
                    className="form-input"
                    placeholder={`Option ${idx + 1}`}
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                  />

                  {options.length > 2 && (
                    <button 
                      type="button"
                      onClick={() => handleRemoveOption(idx)}
                      className="btn btn-danger btn-sm"
                      style={{ padding: '0.65rem', flexShrink: 0 }}
                      title="Remove Option"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Add Option button */}
          {options.length < 10 && (
            <button 
              type="button"
              onClick={handleAddOption}
              className="btn btn-secondary btn-sm"
              style={{ marginBottom: '2rem', display: 'inline-flex' }}
            >
              <Plus size={16} /> Add Another Option
            </button>
          )}

          {/* Submit */}
          <button 
            type="submit"
            disabled={loading}
            className="btn btn-primary"
            style={{ width: '100%', padding: '0.95rem', fontSize: '1rem' }}
          >
            {loading ? 'Creating Poll...' : 'Publish Poll & Get Link'}
          </button>
        </form>
      </div>

      {/* Share Modal on Success */}
      {createdPollId && (
        <ShareModal 
          pollId={createdPollId}
          onClose={() => {
            setCreatedPollId(null);
            navigate('dashboard');
          }}
          navigate={navigate}
        />
      )}
    </div>
  );
}
