import React, { forwardRef } from 'react';
import type { InputHTMLAttributes, ReactNode } from 'react';

// Props do componente Input
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  icon,
  fullWidth = true,
  style = {},
  ...rest
}, ref) => {
  const inputStyles: React.CSSProperties = {
    width: fullWidth ? '100%' : 'auto',
    padding: icon ? '12px 16px 12px 48px' : '12px 16px',
    backgroundColor: 'white',
    border: `2px solid ${error ? '#ef4444' : '#d1d5db'}`,
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.2s',
    fontFamily: 'inherit',
    ...style
  };

  const containerStyles: React.CSSProperties = {
    position: 'relative',
    width: fullWidth ? '100%' : 'auto'
  };

  const labelStyles: React.CSSProperties = {
    display: 'block',
    marginBottom: '8px',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151'
  };

  const iconStyles: React.CSSProperties = {
    position: 'absolute',
    left: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#6b7280',
    pointerEvents: 'none'
  };

  const errorStyles: React.CSSProperties = {
    color: '#ef4444',
    fontSize: '14px',
    marginTop: '4px'
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = '#3b82f6';
    if (rest.onFocus) rest.onFocus(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.style.borderColor = error ? '#ef4444' : '#d1d5db';
    if (rest.onBlur) rest.onBlur(e);
  };

  return (
    <div style={containerStyles}>
      {label && (
        <label style={labelStyles}>
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        <input
          ref={ref}
          style={inputStyles}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...rest}
        />
        {icon && (
          <div style={iconStyles}>
            {icon}
          </div>
        )}
      </div>
      {error && (
        <p style={errorStyles}>
          {error}
        </p>
      )}
    </div>
  );
}); 