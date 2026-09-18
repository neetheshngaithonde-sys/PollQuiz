import React, { useState } from 'react';
import { 
  Users, 
  Clock, 
  Share2, 
  ExternalLink, 
  BarChart2, 
  Trash2, 
  Power, 
  Check, 
  Copy 
} from 'lucide-react';

export default function PollCard({ 
  poll, 
  navigate, 
  onToggleStatus, 
  onDelete, 
  showManageActions = true,
  onShowToast 
}) {
  const [copied, setCopied] = useState(false);

  const shareUrl = `${window.location.origin}/#poll/${poll.id}`;

  const handleCopy = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    if (onShowToast) onShowToast('Share link copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const formattedDate = new Date(poll.created_at).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Header Info */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {poll.is_active ? (
            <span className="badge badge-live">
              <span className="pulse-dot"></span> Active
            </span>
          ) : (
            <span className="badge" style={{ background: 'rgba(148, 163, 184, 0.15)', color: 'var(--text-muted)' }}>
              Closed
            </span>
          )}
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <Clock size={12} /> {formattedDate}
          </span>
        </div>

        {/* Quick Share Button */}
        <button 
          onClick={handleCopy}
          className="btn btn-secondary btn-sm"
          style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
          title="Copy public voting link"
        >
          {copied ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
          {copied ? 'Copied' : 'Share'}
        </button>
      </div>

      {/* Question */}
      <h3 
        onClick={() => navigate(`poll/${poll.id}/results`)}
        style={{
          fontSize: '1.15rem',
          fontWeight: 700,
          color: 'var(--text-primary)',
          cursor: 'pointer',
          lineHeight: 1.4,
        }}
      >
        {poll.question}
      </h3>

      {/* Stats row */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '1.25rem', 
        fontSize: '0.85rem', 
        color: 'var(--text-secondary)' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Users size={15} color="#818cf8" />
          <span><strong>{poll.total_votes || 0}</strong> {poll.total_votes === 1 ? 'vote' : 'votes'}</span>
        </div>
        <div>
          <span><strong>{poll.options?.length || 0}</strong> options</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        paddingTop: '0.75rem', 
        borderTop: '1px solid var(--border-color)',
        marginTop: 'auto',
        gap: '0.5rem',
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={() => navigate(`poll/${poll.id}`)}
            className="btn btn-secondary btn-sm"
          >
            <ExternalLink size={14} /> Vote
          </button>
          <button 
            onClick={() => navigate(`poll/${poll.id}/results`)}
            className="btn btn-primary btn-sm"
          >
            <BarChart2 size={14} /> Live Results
          </button>
        </div>

        {showManageActions && (
          <div style={{ display: 'flex', gap: '0.35rem' }}>
            {onToggleStatus && (
              <button 
                onClick={() => onToggleStatus(poll.id, !poll.is_active)}
                className="btn btn-secondary btn-sm"
                title={poll.is_active ? 'Close Poll' : 'Reactivate Poll'}
                style={{ padding: '0.4rem 0.6rem' }}
              >
                <Power size={14} color={poll.is_active ? 'var(--warning)' : 'var(--success)'} />
              </button>
            )}
            {onDelete && (
              <button 
                onClick={() => onDelete(poll.id)}
                className="btn btn-danger btn-sm"
                title="Delete Poll"
                style={{ padding: '0.4rem 0.6rem' }}
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
