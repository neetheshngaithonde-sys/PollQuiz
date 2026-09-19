import React, { useState } from 'react';
import { pollService } from '../services/pollService';
import ShareModal from '../components/ShareModal';

import {
  Plus,
  Trash2,
  Sparkles,
  ArrowLeft,
  Check,
  BarChart3,
  Users,
  Zap,
} from 'lucide-react';

export default function CreatePoll({ navigate, onShowToast }) {
  const [question, setQuestion] = useState('');
  const [options, setOptions] = useState(['', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [createdPollId, setCreatedPollId] = useState(null);

  // ================= OPTION HANDLERS =================

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
    setError('');
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

  // ================= SUBMIT =================

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanQuestion = question.trim();

    if (!cleanQuestion || cleanQuestion.length < 5) {
      setError('Poll question must be at least 5 characters');
      return;
    }

    const cleanOptions = options
      .map((opt) => opt.trim())
      .filter(Boolean);

    if (cleanOptions.length < 2) {
      setError('Please provide at least 2 valid options');
      return;
    }

    const unique = new Set(
      cleanOptions.map((option) => option.toLowerCase())
    );

    if (unique.size !== cleanOptions.length) {
      setError('Options must be unique');
      return;
    }

    setLoading(true);

    try {
      const poll = await pollService.createPoll(
        cleanQuestion,
        cleanOptions
      );

      setCreatedPollId(poll.id);

      if (onShowToast) {
        onShowToast('Poll created successfully!');
      }
    } catch (err) {
      setError(err.message || 'Failed to create poll');
    } finally {
      setLoading(false);
    }
  };

  // ================= MAIN UI =================

  return (
    <div
      style={{
        minHeight: '100%',
        padding: '2rem 1.5rem 4rem',
        background: '#f8fafc',
      }}
    >
      <div
        style={{
          maxWidth: '1050px',
          margin: '0 auto',
        }}
      >

        {/* ================================================= */}
        {/* BACK BUTTON */}
        {/* ================================================= */}

        <button
          onClick={() => navigate('dashboard')}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.45rem',
            background: '#ffffff',
            color: '#334155',
            border: '1px solid #e2e8f0',
            borderRadius: '9px',
            padding: '0.6rem 0.9rem',
            fontSize: '0.85rem',
            fontWeight: 600,
            cursor: 'pointer',
            marginBottom: '1.5rem',
          }}
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>

        {/* ================================================= */}
        {/* PAGE HEADER */}
        {/* ================================================= */}

        <div
          style={{
            marginBottom: '1.5rem',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: '#eff6ff',
              color: '#2563eb',
              border: '1px solid #dbeafe',
              padding: '0.4rem 0.7rem',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 700,
              marginBottom: '0.75rem',
            }}
          >
            <Sparkles size={14} />
            CREATE POLL
          </div>

          <h1
            style={{
              margin: 0,
              color: '#0f172a',
              fontSize: 'clamp(1.7rem, 4vw, 2.25rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
            }}
          >
            Create a Live Poll
          </h1>

          <p
            style={{
              margin: '0.5rem 0 0',
              color: '#64748b',
              fontSize: '0.95rem',
              lineHeight: 1.6,
            }}
          >
            Ask a question, add your choices, and collect
            responses from your audience in real time.
          </p>
        </div>

        {/* ================================================= */}
        {/* MAIN GRID */}
        {/* ================================================= */}

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) 280px',
            gap: '1.25rem',
            alignItems: 'start',
          }}
          className="create-poll-layout"
        >

          {/* ================================================= */}
          {/* FORM */}
          {/* ================================================= */}

          <div
            style={{
              background: '#ffffff',
              border: '1px solid #e2e8f0',
              borderRadius: '18px',
              padding: '2rem',
              boxShadow: '0 5px 20px rgba(15, 23, 42, 0.05)',
            }}
          >
            {/* Form Heading */}

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1.75rem',
              }}
            >
              <div
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '11px',
                  background: '#2563eb',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <BarChart3 size={21} />
              </div>

              <div>
                <h2
                  style={{
                    margin: 0,
                    color: '#0f172a',
                    fontSize: '1.1rem',
                    fontWeight: 800,
                  }}
                >
                  Poll Details
                </h2>

                <p
                  style={{
                    margin: '0.15rem 0 0',
                    color: '#64748b',
                    fontSize: '0.8rem',
                  }}
                >
                  Enter your question and answer choices
                </p>
              </div>
            </div>

            {/* ================================================= */}
            {/* ERROR */}
            {/* ================================================= */}

            {error && (
              <div
                style={{
                  padding: '0.85rem 1rem',
                  borderRadius: '10px',
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#dc2626',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  marginBottom: '1.5rem',
                }}
              >
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>

              {/* ================================================= */}
              {/* QUESTION */}
              {/* ================================================= */}

              <div style={{ marginBottom: '1.75rem' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '0.55rem',
                  }}
                >
                  <label
                    style={{
                      color: '#0f172a',
                      fontSize: '0.85rem',
                      fontWeight: 700,
                    }}
                  >
                    Poll Question
                    <span style={{ color: '#ef4444' }}> *</span>
                  </label>

                  <span
                    style={{
                      color:
                        question.length > 200
                          ? '#ef4444'
                          : '#94a3b8',
                      fontSize: '0.75rem',
                    }}
                  >
                    {question.length}/250
                  </span>
                </div>

                <input
                  type="text"
                  required
                  maxLength={250}
                  placeholder="e.g. Which programming language do you prefer?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  style={{
                    width: '100%',
                    boxSizing: 'border-box',
                    padding: '0.85rem 1rem',
                    borderRadius: '10px',
                    border: '1px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#0f172a',
                    fontSize: '0.95rem',
                    outline: 'none',
                    transition: 'all 0.2s ease',
                  }}
                  className="create-input"
                />
              </div>

              {/* ================================================= */}
              {/* OPTIONS */}
              {/* ================================================= */}

              <div style={{ marginBottom: '1rem' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.7rem',
                  }}
                >
                  <div>
                    <label
                      style={{
                        color: '#0f172a',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                      }}
                    >
                      Answer Options
                      <span style={{ color: '#ef4444' }}> *</span>
                    </label>

                    <div
                      style={{
                        color: '#94a3b8',
                        fontSize: '0.75rem',
                        marginTop: '0.2rem',
                      }}
                    >
                      Add between 2 and 10 options
                    </div>
                  </div>

                  <span
                    style={{
                      background: '#f1f5f9',
                      color: '#475569',
                      borderRadius: '20px',
                      padding: '0.3rem 0.6rem',
                      fontSize: '0.7rem',
                      fontWeight: 700,
                    }}
                  >
                    {options.length}/10
                  </span>
                </div>

                {/* Option List */}

                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.7rem',
                  }}
                >
                  {options.map((option, index) => (
                    <div
                      key={index}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                      }}
                    >
                      {/* Number */}

                      <div
                        style={{
                          width: '34px',
                          height: '34px',
                          minWidth: '34px',
                          borderRadius: '9px',
                          background:
                            index === 0 || index === 1
                              ? '#2563eb'
                              : '#f1f5f9',
                          color:
                            index === 0 || index === 1
                              ? '#ffffff'
                              : '#475569',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.8rem',
                          fontWeight: 800,
                        }}
                      >
                        {index + 1}
                      </div>

                      {/* Input */}

                      <input
                        type="text"
                        required
                        maxLength={100}
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) =>
                          handleOptionChange(
                            index,
                            e.target.value
                          )
                        }
                        style={{
                          flex: 1,
                          minWidth: 0,
                          padding: '0.75rem 0.9rem',
                          borderRadius: '9px',
                          border: '1px solid #cbd5e1',
                          background: '#ffffff',
                          color: '#0f172a',
                          fontSize: '0.88rem',
                          outline: 'none',
                        }}
                        className="create-input"
                      />

                      {/* Remove */}

                      {options.length > 2 && (
                        <button
                          type="button"
                          onClick={() =>
                            handleRemoveOption(index)
                          }
                          title="Remove option"
                          style={{
                            width: '36px',
                            height: '36px',
                            minWidth: '36px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '9px',
                            border: '1px solid #fecaca',
                            background: '#fef2f2',
                            color: '#dc2626',
                            cursor: 'pointer',
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* ================================================= */}
              {/* ADD OPTION */}
              {/* ================================================= */}

              {options.length < 10 && (
                <button
                  type="button"
                  onClick={handleAddOption}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    background: '#ffffff',
                    color: '#2563eb',
                    border: '1px dashed #93c5fd',
                    borderRadius: '9px',
                    padding: '0.6rem 0.8rem',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    marginTop: '0.5rem',
                    marginBottom: '1.75rem',
                  }}
                >
                  <Plus size={16} />
                  Add Another Option
                </button>
              )}

              {/* ================================================= */}
              {/* PUBLISH BUTTON */}
              {/* ================================================= */}

              <button
                type="submit"
                disabled={loading}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  background: loading
                    ? '#94a3b8'
                    : '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.9rem 1rem',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  cursor: loading
                    ? 'not-allowed'
                    : 'pointer',
                  transition: 'all 0.2s ease',
                }}
              >
                {loading ? (
                  <>
                    <span
                      style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid rgba(255,255,255,0.4)',
                        borderTopColor: '#ffffff',
                        borderRadius: '50%',
                        animation:
                          'createPollSpin 0.7s linear infinite',
                      }}
                    />
                    Creating Poll...
                  </>
                ) : (
                  <>
                    <Check size={17} />
                    Publish Poll & Get Link
                  </>
                )}
              </button>
            </form>
          </div>

          {/* ================================================= */}
          {/* SIDE INFORMATION */}
          {/* ================================================= */}

          <aside
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
            }}
          >

            {/* Live Preview */}

            <div
              style={{
                background: '#000000',
                color: '#ffffff',
                borderRadius: '16px',
                padding: '1.25rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  color: '#93c5fd',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  marginBottom: '0.8rem',
                }}
              >
                <Zap size={14} />
                LIVE POLL
              </div>

              <div
                style={{
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  lineHeight: 1.5,
                  marginBottom: '0.9rem',
                }}
              >
                {question.trim() ||
                  'Your poll question will appear here'}
              </div>

              {options
                .filter((option) => option.trim())
                .slice(0, 4)
                .map((option, index) => (
                  <div
                    key={index}
                    style={{
                      background:
                        'rgba(255,255,255,0.08)',
                      border:
                        '1px solid rgba(255,255,255,0.12)',
                      borderRadius: '8px',
                      padding: '0.6rem 0.7rem',
                      marginBottom: '0.45rem',
                      fontSize: '0.78rem',
                      color: '#e2e8f0',
                    }}
                  >
                    {option}
                  </div>
                ))}

              {options.filter((option) => option.trim())
                .length === 0 && (
                <div
                  style={{
                    color: '#64748b',
                    fontSize: '0.75rem',
                  }}
                >
                  Add options to see them here.
                </div>
              )}
            </div>

            {/* Tips */}

            <div
              style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '16px',
                padding: '1.25rem',
              }}
            >
              <h3
                style={{
                  margin: '0 0 1rem',
                  color: '#0f172a',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                }}
              >
                Poll Tips
              </h3>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.85rem',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    gap: '0.65rem',
                  }}
                >
                  <Check
                    size={16}
                    color="#2563eb"
                    style={{ flexShrink: 0 }}
                  />

                  <span
                    style={{
                      color: '#64748b',
                      fontSize: '0.78rem',
                      lineHeight: 1.5,
                    }}
                  >
                    Keep your question short and clear.
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: '0.65rem',
                  }}
                >
                  <Check
                    size={16}
                    color="#2563eb"
                    style={{ flexShrink: 0 }}
                  />

                  <span
                    style={{
                      color: '#64748b',
                      fontSize: '0.78rem',
                      lineHeight: 1.5,
                    }}
                  >
                    Give your audience clear choices.
                  </span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: '0.65rem',
                  }}
                >
                  <Check
                    size={16}
                    color="#2563eb"
                    style={{ flexShrink: 0 }}
                  />

                  <span
                    style={{
                      color: '#64748b',
                      fontSize: '0.78rem',
                      lineHeight: 1.5,
                    }}
                  >
                    Avoid duplicate answer options.
                  </span>
                </div>
              </div>
            </div>

            {/* Audience Info */}

            <div
              style={{
                background: '#eff6ff',
                border: '1px solid #dbeafe',
                borderRadius: '16px',
                padding: '1.25rem',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  color: '#2563eb',
                  marginBottom: '0.5rem',
                }}
              >
                <Users size={18} />

                <span
                  style={{
                    fontSize: '0.85rem',
                    fontWeight: 800,
                  }}
                >
                  Real-Time Voting
                </span>
              </div>

              <p
                style={{
                  margin: 0,
                  color: '#475569',
                  fontSize: '0.75rem',
                  lineHeight: 1.5,
                }}
              >
                Once published, your audience can vote
                through the shared poll link and results
                update in real time.
              </p>
            </div>
          </aside>
        </div>
      </div>

      {/* ================================================= */}
      {/* SHARE MODAL */}
      {/* ================================================= */}

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

      {/* ================================================= */}
      {/* RESPONSIVE STYLES */}
      {/* ================================================= */}

      <style>
        {`
          @keyframes createPollSpin {
            to {
              transform: rotate(360deg);
            }
          }

          .create-input:focus {
            border-color: #2563eb !important;
            box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.12);
          }

          button:hover {
            transition: all 0.2s ease;
          }

          @media (max-width: 850px) {
            .create-poll-layout {
              grid-template-columns: 1fr !important;
            }
          }

          @media (max-width: 600px) {
            .create-poll-layout > div {
              padding: 1.25rem !important;
            }
          }

          @media (max-width: 480px) {
            .create-poll-layout {
              gap: 0.85rem !important;
            }
          }
        `}
      </style>
    </div>
  );
}