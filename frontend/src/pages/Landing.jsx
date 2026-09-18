import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Sparkles, 
  BarChart3, 
  Zap, 
  Share2, 
  Users, 
  ArrowRight, 
  ShieldCheck, 
  CheckCircle2 
} from 'lucide-react';

export default function Landing({ navigate }) {
  const { isAuthenticated } = useAuth();
  const [demoSelected, setDemoSelected] = useState(0);
  const [demoVotes, setDemoVotes] = useState([74, 52, 28]);

  const handleDemoVote = (idx) => {
    if (demoSelected === idx) return;
    const nextVotes = [...demoVotes];
    nextVotes[idx] += 1;
    if (demoSelected !== null && demoVotes[demoSelected] > 0) {
      nextVotes[demoSelected] -= 1;
    }
    setDemoVotes(nextVotes);
    setDemoSelected(idx);
  };

  const demoTotal = demoVotes.reduce((a, b) => a + b, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5rem', paddingBottom: '4rem' }}>
      {/* Hero Section */}
      <section style={{
        textAlign: 'center',
        paddingTop: '3rem',
        maxWidth: '900px',
        margin: '0 auto',
      }}>
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.4rem 1rem',
          borderRadius: '9999px',
          background: 'rgba(99, 102, 241, 0.12)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          color: '#a5b4fc',
          fontSize: '0.85rem',
          fontWeight: 600,
          marginBottom: '1.5rem',
        }}>
          <Sparkles size={16} /> Powered by Go, Redis Pub/Sub & WebSockets
        </div>

        <h1 style={{
          fontSize: 'clamp(2.5rem, 5vw, 4rem)',
          fontWeight: 800,
          lineHeight: 1.15,
          letterSpacing: '-0.03em',
          marginBottom: '1.5rem',
        }}>
          Live Polling Reimagined for <br />
          <span style={{
            background: 'var(--primary-gradient)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Instant Audience Engagement
          </span>
        </h1>

        <p style={{
          fontSize: '1.15rem',
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
          maxWidth: '680px',
          margin: '0 auto 2.5rem auto',
        }}>
          Create interactive polls, share unique links with your crowd, and watch
          votes tally dynamically in real time without refreshing your browser.
        </p>

        {/* CTA Buttons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '1rem',
          flexWrap: 'wrap',
          marginBottom: '4rem',
        }}>
          <button 
            onClick={() => navigate(isAuthenticated ? 'create-poll' : 'signup')}
            className="btn btn-primary"
            style={{ padding: '0.9rem 2rem', fontSize: '1.05rem' }}
          >
            Create Your First Poll <ArrowRight size={18} />
          </button>

          <button 
            onClick={() => navigate(isAuthenticated ? 'dashboard' : 'login')}
            className="btn btn-secondary"
            style={{ padding: '0.9rem 1.75rem', fontSize: '1.05rem' }}
          >
            {isAuthenticated ? 'Open Dashboard' : 'Sign In'}
          </button>
        </div>

        {/* Live Interactive Hero Demo Card */}
        <div className="glass-card" style={{
          maxWidth: '620px',
          margin: '0 auto',
          textAlign: 'left',
          padding: '2rem',
          border: '1px solid rgba(99, 102, 241, 0.35)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.5), 0 0 30px rgba(99, 102, 241, 0.15)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <span className="badge badge-live">
              <span className="pulse-dot"></span> LIVE DEMO
            </span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              {demoTotal} votes tallying
            </span>
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.25rem' }}>
            What makes a polling tool truly awesome?
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { text: 'Instant real-time Redis updates', idx: 0 },
              { text: 'Ultra-fast and clean mobile UI', idx: 1 },
              { text: 'Zero login needed for voters', idx: 2 },
            ].map((item) => {
              const count = demoVotes[item.idx];
              const pct = Math.round((count / demoTotal) * 100);
              const isSelected = demoSelected === item.idx;

              return (
                <div
                  key={item.idx}
                  onClick={() => handleDemoVote(item.idx)}
                  className={`vote-option-card ${isSelected ? 'selected' : ''}`}
                  style={{
                    padding: '0.9rem 1.25rem',
                    position: 'relative',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      bottom: 0,
                      width: `${pct}%`,
                      background: isSelected 
                        ? 'rgba(99, 102, 241, 0.25)' 
                        : 'rgba(255, 255, 255, 0.04)',
                      transition: 'width 0.4s ease',
                      zIndex: 0,
                    }}
                  />
                  <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%' }}>
                    <div className="custom-radio">
                      <div className="custom-radio-inner"></div>
                    </div>
                    <span style={{ fontWeight: 600, flex: 1 }}>{item.text}</span>
                    <span style={{ fontWeight: 700, color: '#c7d2fe', fontSize: '0.9rem' }}>{pct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '1rem' }}>
            Click any option above to experience instant live percentage adjustments!
          </p>
        </div>
      </section>

      {/* Feature Pillars */}
      <section style={{ maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Built for Scale, Speed & Precision
          </h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Every component is engineered for production-grade reliability.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
        }}>
          {/* Card 1 */}
          <div className="glass-card">
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(99, 102, 241, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#818cf8',
              marginBottom: '1.25rem',
            }}>
              <Zap size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Genuine Redis Pub/Sub
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Votes are persisted atomically in MongoDB and broadcast instantly across Redis channels to targeted WebSocket connections.
            </p>
          </div>

          {/* Card 2 */}
          <div className="glass-card">
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(16, 185, 129, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#34d399',
              marginBottom: '1.25rem',
            }}>
              <Share2 size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Frictionless Sharing
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Audience members can vote immediately via shareable links on any smartphone, tablet, or desktop with no signup barrier.
            </p>
          </div>

          {/* Card 3 */}
          <div className="glass-card">
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: 'rgba(244, 63, 94, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fb7185',
              marginBottom: '1.25rem',
            }}>
              <ShieldCheck size={24} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>
              Secure & Validated
            </h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.6 }}>
              Bcrypt salted hashing, JWT-authenticated poll management, server-side data validation, and duplicate vote prevention.
            </p>
          </div>
        </div>
      </section>

      {/* Tech Stack Banner */}
      <section className="glass-card" style={{
        maxWidth: '1000px',
        margin: '0 auto',
        width: '100%',
        padding: '2.5rem',
        textAlign: 'center',
      }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', color: 'var(--text-secondary)' }}>
          Powered By Modern Technology
        </h3>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          gap: '2.5rem',
          flexWrap: 'wrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.1rem' }}>
            <span style={{ color: '#61dafb' }}>●</span> React Frontend
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.1rem' }}>
            <span style={{ color: '#00add8' }}>●</span> Go + Gin Backend
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.1rem' }}>
            <span style={{ color: '#47a248' }}>●</span> MongoDB Database
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, fontSize: '1.1rem' }}>
            <span style={{ color: '#dc382d' }}>●</span> Redis Pub/Sub
          </div>
        </div>
      </section>
    </div>
  );
}
