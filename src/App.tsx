import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { BilheteProvider } from './contexts/BilheteContext';
import { ValidarBilhete } from './pages/ValidarBilhete';
import { AdminLayout } from './pages/admin/AdminLayout';

function App() {
  return (
    <BilheteProvider>
      <Router>
        <Routes>
          {/* Área Pública */}
          <Route path="/" element={<Navigate to="/validar" replace />} />
          <Route path="/validar" element={<ValidarBilhete />} />
          
          {/* Área Administrativa - rota única */}
          <Route path="/admin" element={<AdminLayout />} />
          
          {/* Rota 404 */}
          <Route path="*" element={<Navigate to="/validar" replace />} />
        </Routes>
      </Router>
    </BilheteProvider>
  );
}

export default App;
