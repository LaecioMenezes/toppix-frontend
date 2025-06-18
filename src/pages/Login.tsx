import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Card } from '../components/Card';
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo e Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-6">
            <div className="bg-white/80 backdrop-blur-sm border border-white/20 rounded-2xl p-4 shadow-lg">
              <img
                src={logoJayna}
                alt="Jayna"
                className="w-16 h-16 object-contain"
              />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Área Administrativa
          </h1>
          <p className="text-gray-600">
            Faça login para acessar o painel de controle
          </p>
        </div>

        {/* Formulário de Login */}
        <Card className="bg-white/80 backdrop-blur-sm border border-white/20 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Mensagem de erro */}
            {erro && (
              <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
                <div className="flex items-center">
                  <span className="text-red-500 mr-2">❌</span>
                  <span>{erro}</span>
                </div>
              </div>
            )}

            {/* E-mail */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                E-mail *
              </label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange('email')}
                placeholder="seu@email.com"
                required
                disabled={isLoading}
                className="w-full"
                autoComplete="email"
              />
            </div>

            {/* Senha */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha *
              </label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={handleInputChange('password')}
                placeholder="Digite sua senha"
                required
                disabled={isLoading}
                className="w-full"
                autoComplete="current-password"
              />
            </div>

            {/* Botão de Login */}
            <Button
              type="submit"
              disabled={isLoading || !formData.email.trim() || !formData.password.trim()}
              className={`
                w-full py-3 text-lg font-semibold rounded-xl transition-all duration-200
                ${isLoading || !formData.email.trim() || !formData.password.trim()
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:scale-105'
                }
              `}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-3">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Entrando...</span>
                </div>
              ) : (
                <div className="flex items-center justify-center space-x-2">
                  <span>🔐</span>
                  <span>Entrar</span>
                </div>
              )}
            </Button>
          </form>
        </Card>

        {/* Informações de Teste */}
        <div className="mt-6 text-center">
          <Card className="bg-blue-50/80 border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Para Testes</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <p><strong>E-mail:</strong> admin@teste.com</p>
              <p><strong>Senha:</strong> password123</p>
            </div>
          </Card>
        </div>

        {/* Link para validação pública */}
        <div className="mt-6 text-center">
          <button
            onClick={() => navigate('/')}
            className="text-blue-600 hover:text-blue-800 underline text-sm"
          >
            ← Voltar para validação de bilhetes
          </button>
        </div>
      </div>
    </div>
  );
} 