import React from 'react';
import { Award } from 'lucide-react';

export default function ResultBar({ option, totalVotes, isWinner, isSelected }) {
  const percentage = option.percentage || 0;

  return (
    <div className="result-row">
      <div 
        className="result-bar-bg"
        style={{
          borderColor: isWinner ? 'rgba(99, 102, 241, 0.4)' : 'var(--border-color)',
          background: isSelected ? 'rgba(99, 102, 241, 0.08)' : 'rgba(255, 255, 255, 0.03)',
        }}
      >
        {/* Animated Percentage Fill */}
        <div 
          className="result-bar-fill"
          style={{
            width: `${percentage}%`,
            background: isWinner 
              ? 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)' 
              : 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
            opacity: percentage > 0 ? 0.85 : 0,
          }}
        />

        {/* Option Text and Stats Overlay */}
        <div className="result-bar-content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {isWinner && totalVotes > 0 && (
              <Award size={16} color="#fbbf24" style={{ flexShrink: 0 }} />
            )}
            <span style={{ 
              color: '#ffffff',
              fontWeight: isWinner ? 700 : 500,
            }}>
              {option.text}
            </span>
            {isSelected && (
              <span className="badge" style={{ 
                background: 'rgba(99, 102, 241, 0.3)', 
                color: '#c7d2fe', 
                fontSize: '0.7rem',
                padding: '0.1rem 0.45rem'
              }}>
                Your Vote
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <span style={{ 
              color: 'var(--text-secondary)', 
              fontSize: '0.85rem',
              fontWeight: 500,
            }}>
              {option.votes} {option.votes === 1 ? 'vote' : 'votes'}
            </span>
            <span style={{ 
              color: '#ffffff', 
              fontWeight: 700, 
              minWidth: '46px', 
              textAlign: 'right' 
            }}>
              {percentage}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
