import React, { useState } from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

export default function PasswordInput({
  id,
  label,
  value,
  onChange,
  placeholder = '••••••••',
  required = false,
  minLength,
  autoComplete = 'current-password',
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="form-group" style={{ marginBottom: '1.25rem' }}>
      {label && <label htmlFor={id} className="form-label">{label}</label>}
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <Lock
          size={18}
          style={{
            position: 'absolute',
            left: '1rem',
            color: 'var(--text-muted)',
            pointerEvents: 'none',
          }}
        />
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          required={required}
          minLength={minLength}
          className="form-input"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          style={{
            paddingLeft: '2.75rem',
            paddingRight: '3rem',
            width: '100%',
          }}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          title={showPassword ? 'Hide password' : 'Show password'}
          style={{
            position: 'absolute',
            right: '0.75rem',
            background: 'transparent',
            border: 'none',
            color: showPassword ? 'var(--primary)' : 'var(--text-muted)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0.4rem',
            borderRadius: '0.375rem',
            transition: 'color 0.2s, background-color 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--text-primary)';
            e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.06)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = showPassword ? 'var(--primary)' : 'var(--text-muted)';
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
}
