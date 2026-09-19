import React from 'react';
import { Award } from 'lucide-react';

export default function ResultBar({
  option,
  totalVotes,
  isWinner,
  isSelected,
}) {
  const percentage = option.percentage || 0;

  return (
    <div className="result-row">
      <div
        className="result-bar-bg"
        style={{
          borderColor: isWinner
            ? '#2563eb'
            : '#e5e7eb',

          background: isSelected
            ? '#eff6ff'
            : '#ffffff',

          borderRadius: '12px',
          borderWidth: '1px',
          borderStyle: 'solid',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {/* Animated Percentage Fill */}
        <div
          className="result-bar-fill"
          style={{
            width: `${percentage}%`,

            background: isWinner
              ? 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)'
              : 'linear-gradient(135deg, #60a5fa 0%, #2563eb 100%)',

            opacity: percentage > 0 ? 0.18 : 0,

            position: 'absolute',
            inset: 0,
            right: 'auto',

            transition: 'width 0.5s ease',
          }}
        />

        {/* Option Text and Stats */}
        <div
          className="result-bar-content"
          style={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            padding: '1rem 1.1rem',
          }}
        >
          {/* LEFT SIDE */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              minWidth: 0,
            }}
          >
            {isWinner && totalVotes > 0 && (
              <Award
                size={16}
                color="#2563eb"
                style={{ flexShrink: 0 }}
              />
            )}

            <span
              style={{
                color: '#000000',
                fontWeight: isWinner ? 700 : 500,
                fontSize: '0.95rem',
              }}
            >
              {option.text}
            </span>

            {isSelected && (
              <span
                className="badge"
                style={{
                  background: '#2563eb',
                  color: '#ffffff',
                  fontSize: '0.7rem',
                  padding: '0.2rem 0.5rem',
                  borderRadius: '5px',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                }}
              >
                Your Vote
              </span>
            )}
          </div>

          {/* RIGHT SIDE */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.85rem',
              flexShrink: 0,
            }}
          >
            <span
              style={{
                color: '#000000',
                fontSize: '0.85rem',
                fontWeight: 500,
              }}
            >
              {option.votes}{' '}
              {option.votes === 1 ? 'vote' : 'votes'}
            </span>

            <span
              style={{
                color: '#000000',
                fontWeight: 700,
                minWidth: '46px',
                textAlign: 'right',
              }}
            >
              {percentage}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}