import React from 'react';
import type { ReactNode, HTMLAttributes } from 'react';

// Props do componente Card
interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: 'default' | 'glass';
  padding?: 'none' | 'small' | 'medium' | 'large';
}

export function Card({ 
  children, 
  variant = 'default', 
  padding = 'medium',
  style = {},
  ...rest 
}: CardProps) {
  const baseStyles: React.CSSProperties = {
    borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    ...style
  };

  const variantStyles: Record<string, React.CSSProperties> = {
    default: {
      backgroundColor: 'white',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      border: '1px solid #e5e7eb'
    },
    glass: {
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
    }
  };

  const paddingStyles: Record<string, React.CSSProperties> = {
    none: { padding: '0' },
    small: { padding: '16px' },
    medium: { padding: '24px' },
    large: { padding: '32px' }
  };

  const finalStyles: React.CSSProperties = {
    ...baseStyles,
    ...variantStyles[variant],
    ...paddingStyles[padding]
  };

  return (
    <div style={finalStyles} {...rest}>
      {children}
    </div>
  );
} 