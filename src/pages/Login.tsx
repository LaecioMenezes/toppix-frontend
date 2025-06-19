import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { apiService } from '../services/apiService';
import type { LoginRequest } from '../types';
import logoJayna from '../assets/images/logotipo-jayna-icone.png';

export function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  // Redirecionar para a página solicitada após login ou para admin
  const redirectTo = (location.state as any)?.from?.pathname || '/admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    if (!formData.email.trim()) {
      setErro('E-mail é obrigatório');
      return;
    }

    if (!formData.password.trim()) {
      setErro('Senha é obrigatória');
      return;
    }

    if (!formData.email.includes('@')) {
      setErro('E-mail deve ter um formato válido');
      return;
    }

    setIsLoading(true);
    setErro(null);

    try {
      const response = await apiService.login(formData);
      
      // Login bem-sucedido - redirecionar
      console.log('Login realizado com sucesso:', response.user);
      navigate(redirectTo, { replace: true });
      
    } catch (error) {
      console.error('Erro no login:', error);
      setErro(error instanceof Error ? error.message : 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: keyof LoginRequest) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: e.target.value
    }));
    
    // Limpar erro ao digitar
    if (erro) setErro(null);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px'
      }}>
        
        {/* Card Principal */}
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '48px 40px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1), 0 8px 25px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.8)'
        }}>
          
          {/* Logo */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '32px'
          }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: '#f8fafc',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
            }}>
              <img
                src={logoJayna}
                alt="Jayna"
                style={{
                  width: '60px',
                  height: '60px',
                  objectFit: 'contain'
                }}
              />
            </div>
          </div>

          {/* Título */}
          <div style={{
            textAlign: 'center',
            marginBottom: '40px'
          }}>
            <h1 style={{
              fontSize: '28px',
              fontWeight: '700',
              color: '#1e293b',
              margin: '0 0 8px 0',
              letterSpacing: '-0.5px'
            }}>
              Área Administrativa
            </h1>
            <p style={{
              fontSize: '15px',
              color: '#64748b',
              margin: '0',
              fontWeight: '400'
            }}>
              Acesse o painel de controle
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit}>
            
            {/* Mensagem de Erro */}
            {erro && (
              <div style={{
                background: 'linear-gradient(135deg, #fef2f2, #fee2e2)',
                border: '1px solid #fca5a5',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '24px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
                <span style={{
                  color: '#dc2626',
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  {erro}
                </span>
              </div>
            )}

            {/* Campo E-mail */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                E-mail
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                placeholder="seu@email.com"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  fontSize: '15px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  background: isLoading ? '#f9fafb' : 'white',
                  color: '#1f2937',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Campo Senha */}
            <div style={{ marginBottom: '32px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Senha
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={handleInputChange('password')}
                placeholder="Digite sua senha"
                disabled={isLoading}
                style={{
                  width: '100%',
                  padding: '16px 20px',
                  fontSize: '15px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  outline: 'none',
                  transition: 'all 0.2s ease',
                  background: isLoading ? '#f9fafb' : 'white',
                  color: '#1f2937',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Botão de Login */}
            <button
              type="submit"
              disabled={isLoading || !formData.email.trim() || !formData.password.trim()}
              style={{
                width: '100%',
                padding: '18px 24px',
                fontSize: '16px',
                fontWeight: '600',
                color: 'white',
                background: isLoading || !formData.email.trim() || !formData.password.trim()
                  ? '#9ca3af'
                  : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                border: 'none',
                borderRadius: '12px',
                cursor: isLoading || !formData.email.trim() || !formData.password.trim() 
                  ? 'not-allowed' 
                  : 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: isLoading || !formData.email.trim() || !formData.password.trim()
                  ? 'none'
                  : '0 4px 12px rgba(59, 130, 246, 0.4)'
              }}
              onMouseOver={(e) => {
                if (!isLoading && formData.email.trim() && formData.password.trim()) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.5)';
                }
              }}
              onMouseOut={(e) => {
                if (!isLoading && formData.email.trim() && formData.password.trim()) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
                }
              }}
            >
              {isLoading ? (
                <>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  Entrando...
                </>
              ) : (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <circle cx="12" cy="16" r="1"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  Entrar
                </>
              )}
            </button>
          </form>
        </div>

        {/* Informações de Teste */}
        <div style={{
          marginTop: '24px',
          background: 'rgba(255, 255, 255, 0.8)',
          borderRadius: '16px',
          padding: '20px',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '12px'
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M12 16v-4"/>
              <path d="M12 8h.01"/>
            </svg>
            <span style={{
              fontSize: '14px',
              fontWeight: '600',
              color: '#3b82f6'
            }}>
              Para Testes
            </span>
          </div>
          <div style={{
            fontSize: '13px',
            color: '#64748b',
            lineHeight: '1.5'
          }}>
            <div><strong>E-mail:</strong> admin@teste.com</div>
            <div><strong>Senha:</strong> password123</div>
          </div>
        </div>

        {/* Link para validação */}
        <div style={{
          marginTop: '24px',
          textAlign: 'center'
        }}>
          <button
            onClick={() => navigate('/')}
            style={{
              background: 'none',
              border: 'none',
              color: '#64748b',
              fontSize: '14px',
              cursor: 'pointer',
              textDecoration: 'underline',
              transition: 'color 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = '#3b82f6';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = '#64748b';
            }}
          >
            ← Voltar para validação de bilhetes
          </button>
        </div>
      </div>

      {/* CSS para animações */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
} 