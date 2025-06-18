import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { Login } from '../../pages/Login';
import { apiService } from '../../services/apiService';

// Mock do serviço de API
vi.mock('../../services/apiService', () => ({
  apiService: {
    login: vi.fn(),
    logout: vi.fn(),
    isAuthenticated: vi.fn(),
  }
}));

// Mock do react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ state: null }),
  };
});

const renderWithRouter = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {ui}
    </BrowserRouter>
  );
};

describe('Login Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar o formulário de login', () => {
    renderWithRouter(<Login />);
    
    expect(screen.getByText(/área administrativa/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /entrar/i })).toBeInTheDocument();
  });

  it('deve mostrar credenciais de teste', () => {
    renderWithRouter(<Login />);
    
    expect(screen.getByText(/para testes/i)).toBeInTheDocument();
    expect(screen.getByText('admin@teste.com')).toBeInTheDocument();
    expect(screen.getByText('password123')).toBeInTheDocument();
  });

  it('deve validar campos obrigatórios', async () => {
    renderWithRouter(<Login />);
    
    const submitButton = screen.getByRole('button', { name: /entrar/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/e-mail é obrigatório/i)).toBeInTheDocument();
    });
  });

  it('deve validar formato do e-mail', async () => {
    renderWithRouter(<Login />);
    
    const emailInput = screen.getByLabelText(/e-mail/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    const submitButton = screen.getByRole('button', { name: /entrar/i });
    
    fireEvent.change(emailInput, { target: { value: 'email-invalido' } });
    fireEvent.change(passwordInput, { target: { value: 'senha123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/e-mail deve ter um formato válido/i)).toBeInTheDocument();
    });
  });

  it('deve fazer login com sucesso', async () => {
    const mockLoginResponse = {
      access_token: 'mock_token',
      user: {
        id: '1',
        email: 'admin@teste.com',
        nome: 'Admin',
        role: 'ADMIN' as const
      }
    };

    vi.mocked(apiService.login).mockResolvedValue(mockLoginResponse);

    renderWithRouter(<Login />);
    
    const emailInput = screen.getByLabelText(/e-mail/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    const submitButton = screen.getByRole('button', { name: /entrar/i });
    
    fireEvent.change(emailInput, { target: { value: 'admin@teste.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(apiService.login).toHaveBeenCalledWith({
        email: 'admin@teste.com',
        password: 'password123'
      });
      expect(mockNavigate).toHaveBeenCalledWith('/admin', { replace: true });
    });
  });

  it('deve mostrar erro de login inválido', async () => {
    vi.mocked(apiService.login).mockRejectedValue(new Error('Credenciais inválidas'));

    renderWithRouter(<Login />);
    
    const emailInput = screen.getByLabelText(/e-mail/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    const submitButton = screen.getByRole('button', { name: /entrar/i });
    
    fireEvent.change(emailInput, { target: { value: 'admin@teste.com' } });
    fireEvent.change(passwordInput, { target: { value: 'senha-errada' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/credenciais inválidas/i)).toBeInTheDocument();
    });
  });

  it('deve mostrar loading durante o login', async () => {
    let resolveLogin: (value: any) => void;
    const loginPromise = new Promise<any>(resolve => {
      resolveLogin = resolve;
    });

    vi.mocked(apiService.login).mockReturnValue(loginPromise);

    renderWithRouter(<Login />);
    
    const emailInput = screen.getByLabelText(/e-mail/i);
    const passwordInput = screen.getByLabelText(/senha/i);
    const submitButton = screen.getByRole('button', { name: /entrar/i });
    
    fireEvent.change(emailInput, { target: { value: 'admin@teste.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);
    
    expect(screen.getByText(/entrando/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    // Resolve o login
    resolveLogin!({
      access_token: 'token',
      user: { id: '1', email: 'admin@teste.com', nome: 'Admin', role: 'ADMIN' }
    });
  });

  it('deve ter link para voltar à validação', () => {
    renderWithRouter(<Login />);
    
    const linkValidacao = screen.getByText(/voltar para validação de bilhetes/i);
    expect(linkValidacao).toBeInTheDocument();
  });
}); 