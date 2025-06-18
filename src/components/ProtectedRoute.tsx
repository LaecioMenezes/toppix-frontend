import type { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { apiService } from '../services/apiService';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();
  const isAuthenticated = apiService.isAuthenticated();

  if (!isAuthenticated) {
    // Redirecionar para login, salvando a localização atual
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
} 