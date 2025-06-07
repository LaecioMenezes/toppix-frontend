import React from 'react';
import type { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface LayoutProps {
  children: ReactNode;
  title?: string;
  showHeader?: boolean;
  background?: string;
  headerAction?: React.ReactNode;
  showBackButton?: boolean;
  backTo?: string;
}

export function Layout({ children, title, showHeader = true, background = 'bg-surface-50', headerAction, showBackButton = false, backTo = '/' }: LayoutProps) {
  const location = useLocation();
  const isHome = location.pathname === '/';

  const layoutStyles: React.CSSProperties = {
    minHeight: '100vh',
    backgroundColor: '#f8fafc',
    fontFamily: 'Arial, sans-serif'
  };

  const headerStyles: React.CSSProperties = {
    backgroundColor: 'white',
    borderBottom: '1px solid #e5e7eb',
    padding: '16px 24px',
    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2937',
    margin: 0
  };

  const mainStyles: React.CSSProperties = {
    padding: '24px'
  };

  return (
    <div style={layoutStyles}>
      {showHeader && (
        <header style={headerStyles}>
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Left side - Back button or Logo */}
              <div className="flex items-center">
                {showBackButton && !isHome ? (
                  <Link
                    to={backTo}
                    className="flex items-center text-primary-600 hover:text-primary-700 transition-colors mr-4"
                  >
                    <ArrowLeftIcon className="h-5 w-5" />
                  </Link>
                ) : (
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-apple flex items-center justify-center">
                      <span className="text-white font-bold text-sm">TP</span>
                    </div>
                    <span className="ml-2 text-lg font-semibold text-secondary-900">TopPix</span>
                  </div>
                )}
              </div>

              {/* Center - Title */}
              <div className="flex-1 text-center">
                <h1 style={titleStyles} className="text-lg font-semibold text-secondary-900 truncate">
                  {title}
                </h1>
              </div>

              {/* Right side - Action */}
              <div className="flex items-center">
                {headerAction}
              </div>
            </div>
          </div>
        </header>
      )}
      <main style={mainStyles} className={`flex-1 ${background} px-4 sm:px-6 lg:px-8`}>
        <div className="max-w-md mx-auto py-6">
          {children}
        </div>
      </main>
    </div>
  );
} 