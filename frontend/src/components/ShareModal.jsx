import React, { useState } from 'react';
import { Check, Copy, ExternalLink, BarChart2, X, Sparkles } from 'lucide-react';

export default function ShareModal({ pollId, onClose, navigate }) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${window.location.origin}/#poll/${pollId}`;
  const resultsUrl = `${window.location.origin}/#poll/${pollId}/results`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1rem',
      zIndex: 1000,
      animation: 'fadeIn 0.2s ease-out',
    }}>
      <div className="glass-card" style={{
        maxWidth: '520px',
        width: '100%',
        position: 'relative',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        border: '1px solid rgba(99, 102, 241, 0.3)',
      }}>
        {/* Close Button */}
        <button 
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '1.25rem',
            right: '1.25rem',
            background: 'none',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
          }}
        >
          <X size={20} />
        </button>

        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            background: 'var(--primary-gradient)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            boxShadow: 'var(--shadow-glow)',
          }}>
            <Sparkles size={28} color="#fff" />
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff' }}>
            Poll Ready to Share!
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            Audience members can vote instantly via this unique link.
          </p>
        </div>

        {/* Copy Box */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          padding: '0.5rem',
          background: 'var(--bg-input)',
          borderRadius: '1rem',
          border: '1px solid var(--border-color)',
          marginBottom: '1.5rem',
        }}>
          <input 
            type="text" 
            readOnly 
            value={shareUrl}
            style={{
              flex: 1,
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--text-primary)',
              padding: '0.5rem 0.75rem',
              fontSize: '0.9rem',
              fontFamily: 'monospace',
            }}
          />
          <button 
            onClick={handleCopy}
            className="btn btn-primary btn-sm"
            style={{ flexShrink: 0 }}
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>

        {/* Quick Nav Options */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
          <button 
            onClick={() => {
              onClose();
              navigate(`poll/${pollId}`);
            }}
            className="btn btn-secondary"
            style={{ fontSize: '0.9rem' }}
          >
            <ExternalLink size={16} /> View Voting Page
          </button>

          <button 
            onClick={() => {
              onClose();
              navigate(`poll/${pollId}/results`);
            }}
            className="btn btn-primary"
            style={{ fontSize: '0.9rem' }}
          >
            <BarChart2 size={16} /> Open Live Results
          </button>
        </div>
      </div>
    </div>
  );
}
