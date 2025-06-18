import { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Plus, Menu, X, Settings, BarChart3, Sparkles, Home, LogOut } from 'lucide-react';
import { apiService } from '../../services/apiService';
import logoJayna from '../../assets/images/logotipo-jayna-icone.png';

export function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Detectar largura da tela
  useEffect(() => {
    const checkScreenSize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  const navigation = [
    {
      name: 'Gerar Bilhetes',
      path: '/admin/gerar',
      icon: Plus,
      description: 'Criar novos bilhetes',
    },
    {
      name: 'Listar Bilhetes',
      path: '/admin/listar',
      icon: BarChart3,
      description: 'Visualizar todos os bilhetes',
    },
  ];

  const NavItem = ({ item }: { item: typeof navigation[0] }) => {
    const isActive = location.pathname === item.path;
    
    return (
      <Link
        to={item.path}
        onClick={() => setSidebarOpen(false)}
        style={{
          display: 'flex',
          alignItems: 'center',
          padding: '16px',
          borderRadius: '8px',
          border: 'none',
          background: 'transparent',
          textDecoration: 'none',
          transition: 'all 0.3s',
          backgroundColor: isActive ? '#3b82f6' : 'transparent',
          color: isActive ? 'white' : '#374151',
          boxShadow: isActive ? '0 4px 6px rgba(0, 0, 0, 0.1)' : 'none',
          position: 'relative',
          width: '100%',
          cursor: 'pointer',
        }}
        onMouseOver={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = '#f3f4f6';
          }
        }}
        onMouseOut={(e) => {
          if (!isActive) {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
        }}
      >
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '8px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: '16px',
          backgroundColor: isActive ? 'rgba(255, 255, 255, 0.2)' : '#3b82f6',
          color: 'white'
        }}>
          <item.icon size={20} />
        </div>
        <div style={{ flex: 1 }}>
          <p style={{ fontWeight: 'bold', fontSize: '16px', margin: 0 }}>{item.name}</p>
          <p style={{ 
            fontSize: '14px', 
            margin: 0,
            color: isActive ? 'rgba(255, 255, 255, 0.8)' : '#6b7280'
          }}>
            {item.description}
          </p>
        </div>
        {isActive && (
          <div style={{ position: 'absolute', right: '16px' }}>
            <Sparkles style={{ width: '20px', height: '20px', color: 'rgba(255, 255, 255, 0.6)' }} />
          </div>
        )}
      </Link>
    );
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f3f4f6' }}>
      {/* Sidebar Mobile Overlay */}
      {sidebarOpen && !isDesktop && (
        <div 
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 40,
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 50,
        width: '320px',
        transform: (sidebarOpen || isDesktop) ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.3s ease-in-out'
      }}>
        <div style={{ 
          height: '100%', 
          backgroundColor: 'white', 
          borderRight: '1px solid #d1d5db', 
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Header */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            padding: '32px', 
            borderBottom: '1px solid #d1d5db' 
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ 
                width: '48px', 
                height: '48px', 
                backgroundColor: 'white', 
                borderRadius: '8px', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                marginRight: '16px', 
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
                border: '2px solid #e5e7eb'
              }}>
                <img 
                  src={logoJayna} 
                  alt="Jayna Logo" 
                  style={{ 
                    width: '32px', 
                    height: '32px',
                    objectFit: 'contain'
                  }} 
                />
              </div>
              <div>
                <h1 style={{ 
                  fontSize: '20px', 
                  fontWeight: 'bold', 
                  color: '#1f2937', 
                  margin: 0 
                }}>
                  Top Pix Admin
                </h1>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#6b7280', 
                  margin: 0 
                }}>
                  Plataforma Jayna
                </p>
              </div>
            </div>
            {!isDesktop && (
              <button
                onClick={() => setSidebarOpen(false)}
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <X size={20} style={{ color: '#6b7280' }} />
              </button>
            )}
          </div>

          {/* Navigation */}
          <nav style={{ flex: 1, padding: '24px' }}>
            <h2 style={{ 
              fontSize: '12px', 
              fontWeight: 'bold', 
              color: '#9ca3af', 
              textTransform: 'uppercase', 
              letterSpacing: '0.1em', 
              marginBottom: '16px', 
              paddingLeft: '16px',
              margin: 0
            }}>
              Navegação
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '16px' }}>
              {navigation.map((item) => (
                <NavItem key={item.name} item={item} />
              ))}
              
              {/* Link para página inicial */}
              <Link
                to="/validar"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '16px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  transition: 'all 0.3s',
                  backgroundColor: 'transparent',
                  color: '#6b7280',
                  border: '2px dashed #d1d5db',
                  marginTop: '8px'
                }}
                onClick={() => setSidebarOpen(false)}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#f9fafb';
                  e.currentTarget.style.borderColor = '#3b82f6';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.borderColor = '#d1d5db';
                }}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '16px',
                  backgroundColor: '#f3f4f6',
                  color: '#6b7280'
                }}>
                  <Home size={20} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: 'bold', fontSize: '16px', margin: 0 }}>Área Pública</p>
                  <p style={{ 
                    fontSize: '14px', 
                    margin: 0,
                    color: '#9ca3af'
                  }}>
                    Validar bilhetes
                  </p>
                </div>
              </Link>
            </div>
          </nav>

          {/* User Section */}
          <div style={{ padding: '24px', borderTop: '1px solid #d1d5db' }}>
            <div style={{ backgroundColor: '#f3f4f6', borderRadius: '8px', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  backgroundColor: '#9ca3af', 
                  borderRadius: '8px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  marginRight: '12px'
                }}>
                  <Settings size={18} style={{ color: 'white' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontWeight: '500', color: '#1f2937', margin: 0 }}>Administrador</p>
                  <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Top Pix v1.0</p>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <div style={{ width: '8px', height: '8px', backgroundColor: '#22c55e', borderRadius: '50%' }}></div>
                    <span>Sistema Online</span>
                  </span>
                </div>
                
                {/* Botão de Logout */}
                <button
                  onClick={() => {
                    apiService.logout();
                    navigate('/login', { replace: true });
                  }}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#ef4444',
                    color: 'white',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    fontSize: '12px',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
                  title="Sair do sistema"
                >
                  <LogOut size={12} />
                  Sair
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ marginLeft: isDesktop ? '320px' : '0' }}>
        {/* Mobile Header */}
        {!isDesktop && (
          <div style={{
            backgroundColor: 'white',
            borderBottom: '1px solid #d1d5db',
            padding: '16px 24px',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <button
                onClick={() => setSidebarOpen(true)}
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Menu size={20} style={{ color: '#6b7280' }} />
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ 
                  width: '32px', 
                  height: '32px', 
                  backgroundColor: 'white', 
                  borderRadius: '8px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  border: '2px solid #e5e7eb'
                }}>
                  <img 
                    src={logoJayna} 
                    alt="Jayna Logo" 
                    style={{ 
                      width: '20px', 
                      height: '20px',
                      objectFit: 'contain'
                    }} 
                  />
                </div>
                <h1 style={{ 
                  fontSize: '18px', 
                  fontWeight: 'bold', 
                  color: '#1f2937', 
                  margin: 0 
                }}>
                  Top Pix
                </h1>
              </div>
              <Link
                to="/validar"
                style={{
                  padding: '8px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: 'transparent',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  color: '#6b7280',
                  textDecoration: 'none'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                <Home size={20} />
              </Link>
            </div>
          </div>
        )}

        {/* Page Content */}
        <main style={{ minHeight: '100vh' }}>
          {/* Renderização das rotas aninhadas */}
          <Outlet />
        </main>
      </div>
    </div>
  );
} 