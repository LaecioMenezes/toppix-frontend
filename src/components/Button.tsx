import React from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

// Props do componente Button
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'small' | 'medium' | 'large';
  loading?: boolean;
  fullWidth?: boolean;
}

export function Button({
  children,
  variant = 'primary',
  size = 'medium',
  loading = false,
  fullWidth = false,
  className = '',
  disabled,
  style = {},
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || loading;

  // Estilos base
  const baseStyles: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: '500',
    borderRadius: '8px',
    transition: 'all 0.2s',
    cursor: isDisabled ? 'not-allowed' : 'pointer',
    opacity: isDisabled ? 0.5 : 1,
    border: 'none',
    outline: 'none',
    textDecoration: 'none',
    fontFamily: 'inherit'
  };

  // Variantes de cor
  const variantStyles: Record<string, React.CSSProperties> = {
    primary: {
      backgroundColor: '#3b82f6',
      color: 'white',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    },
    secondary: {
      backgroundColor: '#f3f4f6',
      color: '#374151'
    },
    ghost: {
      backgroundColor: 'transparent',
      color: '#3b82f6'
    },
    danger: {
      backgroundColor: '#ef4444',
      color: 'white',
      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
    }
  };

  // Tamanhos
  const sizeStyles: Record<string, React.CSSProperties> = {
    small: {
      padding: '8px 16px',
      fontSize: '14px',
      gap: '6px'
    },
    medium: {
      padding: '12px 24px',
      fontSize: '16px',
      gap: '8px'
    },
    large: {
      padding: '16px 32px',
      fontSize: '18px',
      gap: '10px'
    }
  };

  const finalStyles: React.CSSProperties = {
    ...baseStyles,
    ...variantStyles[variant],
    ...sizeStyles[size],
    width: fullWidth ? '100%' : 'auto',
    ...style
  };

  const handleMouseOver = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isDisabled) {
      const hoverStyles: Record<string, string> = {
        primary: '#2563eb',
        secondary: '#e5e7eb',
        ghost: '#f3f4f6',
        danger: '#dc2626'
      };
      e.currentTarget.style.backgroundColor = hoverStyles[variant];
    }
  };

  const handleMouseOut = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isDisabled) {
      const originalStyles: Record<string, string> = {
        primary: '#3b82f6',
        secondary: '#f3f4f6',
        ghost: 'transparent',
        danger: '#ef4444'
      };
      e.currentTarget.style.backgroundColor = originalStyles[variant];
    }
  };

  return (
    <button
      style={finalStyles}
      disabled={isDisabled}
      aria-disabled={isDisabled}
      onMouseOver={handleMouseOver}
      onMouseOut={handleMouseOut}
      {...rest}
    >
      {loading && (
        <Loader2 
          size={size === 'small' ? 16 : size === 'large' ? 24 : 20} 
          style={{ animation: 'spin 1s linear infinite' }}
          data-testid="loading-spinner" 
        />
      )}
      {children}
      
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </button>
  );
} 