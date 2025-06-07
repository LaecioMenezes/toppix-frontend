/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Sistema de cores personalizável estilo Apple
        primary: {
          50: 'var(--color-primary-50, #eff6ff)',
          100: 'var(--color-primary-100, #dbeafe)',
          200: 'var(--color-primary-200, #bfdbfe)',
          300: 'var(--color-primary-300, #93c5fd)',
          400: 'var(--color-primary-400, #60a5fa)',
          500: 'var(--color-primary-500, #3b82f6)',
          600: 'var(--color-primary-600, #2563eb)',
          700: 'var(--color-primary-700, #1d4ed8)',
          800: 'var(--color-primary-800, #1e40af)',
          900: 'var(--color-primary-900, #1e3a8a)',
          950: 'var(--color-primary-950, #172554)',
        },
        secondary: {
          50: 'var(--color-secondary-50, #f8fafc)',
          100: 'var(--color-secondary-100, #f1f5f9)',
          200: 'var(--color-secondary-200, #e2e8f0)',
          300: 'var(--color-secondary-300, #cbd5e1)',
          400: 'var(--color-secondary-400, #94a3b8)',
          500: 'var(--color-secondary-500, #64748b)',
          600: 'var(--color-secondary-600, #475569)',
          700: 'var(--color-secondary-700, #334155)',
          800: 'var(--color-secondary-800, #1e293b)',
          900: 'var(--color-secondary-900, #0f172a)',
        },
        success: {
          50: 'var(--color-success-50, #f0fdf4)',
          500: 'var(--color-success-500, #22c55e)',
          600: 'var(--color-success-600, #16a34a)',
        },
        warning: {
          50: 'var(--color-warning-50, #fefce8)',
          500: 'var(--color-warning-500, #eab308)',
          600: 'var(--color-warning-600, #ca8a04)',
        },
        error: {
          50: 'var(--color-error-50, #fef2f2)',
          500: 'var(--color-error-500, #ef4444)',
          600: 'var(--color-error-600, #dc2626)',
        },
        surface: {
          50: 'var(--color-surface-50, #ffffff)',
          100: 'var(--color-surface-100, #f8fafc)',
          200: 'var(--color-surface-200, #f1f5f9)',
          300: 'var(--color-surface-300, #e2e8f0)',
          800: 'var(--color-surface-800, #1e293b)',
          900: 'var(--color-surface-900, #0f172a)',
        }
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Segoe UI', 'Roboto', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        'apple': '12px',
        'apple-lg': '16px',
        'apple-xl': '20px',
      },
      backdropBlur: {
        xs: '2px',
        sm: '4px',
        md: '8px',
        lg: '12px',
        xl: '16px',
        '2xl': '24px',
        '3xl': '40px',
      },
      boxShadow: {
        'apple': '0 4px 16px 0 rgba(0, 0, 0, 0.12)',
        'apple-lg': '0 8px 24px 0 rgba(0, 0, 0, 0.15)',
        'apple-xl': '0 16px 32px 0 rgba(0, 0, 0, 0.18)',
      }
    },
  },
  plugins: [],
} 