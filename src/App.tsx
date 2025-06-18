import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { BilheteProvider } from './contexts/BilheteContext';
import { ValidarBilhete } from './pages/ValidarBilhete';
import { AdminLayout } from './pages/admin/AdminLayout';
import { GerarBilhetes } from './pages/admin/GerarBilhetes';
import { ListarBilhetes } from './pages/admin/ListarBilhetes';

function App() {
  return (
    <BilheteProvider>
      <Router>
        <Routes>
          {/* Área Pública */}
          <Route path="/" element={<Navigate to="/validar" replace />} />
          <Route path="/validar" element={<ValidarBilhete />} />
          
          {/* Área Administrativa */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Navigate to="/admin/gerar" replace />} />
            <Route path="gerar" element={<GerarBilhetes />} />
            <Route path="listar" element={<ListarBilhetes />} />
          </Route>
          
          {/* Rota 404 */}
          <Route path="*" element={<Navigate to="/validar" replace />} />
        </Routes>
      </Router>
    </BilheteProvider>
  );
}

export default App;
