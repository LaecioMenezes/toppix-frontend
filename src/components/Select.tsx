import React, { forwardRef } from 'react';
import type { SelectHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
  fullWidth?: boolean;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  error,
  options,
  placeholder,
  fullWidth = true,
  style = {},
  ...rest
}, ref) => {
  const selectStyles: React.CSSProperties = {
    width: fullWidth ? '100%' : 'auto',
    padding: '12px 40px 12px 16px',
    backgroundColor: 'white',
    border: `2px solid ${error ? '#ef4444' : '#d1d5db'}`,
    borderRadius: '8px',
    fontSize: '16px',
    outline: 'none',
    transition: 'border-color 0.2s',
    fontFamily: 'inherit',
    appearance: 'none',
    cursor: 'pointer',
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
    right: '16px',
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

  const handleFocus = (e: React.FocusEvent<HTMLSelectElement>) => {
    e.target.style.borderColor = '#3b82f6';
    if (rest.onFocus) rest.onFocus(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
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
        <select
          ref={ref}
          style={selectStyles}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...rest}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown style={iconStyles} size={20} />
      </div>
      {error && (
        <p style={errorStyles}>
          {error}
        </p>
      )}
    </div>
  );
}); 