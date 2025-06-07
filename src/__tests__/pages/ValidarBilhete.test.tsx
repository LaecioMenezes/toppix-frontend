import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ValidarBilhete } from '../../pages/ValidarBilhete';
import { BilheteProvider } from '../../contexts/BilheteContext';
import * as bilheteService from '../../services/bilheteService';

// Mock do serviço
vi.mock('../../services/bilheteService');

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <BilheteProvider>
      {component}
    </BilheteProvider>
  );
};

describe('ValidarBilhete Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar o formulário de validação', () => {
    renderWithProvider(<ValidarBilhete />);
    
    expect(screen.getByText(/validar bilhete/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/código do bilhete/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /validar/i })).toBeInTheDocument();
  });

  it('deve mostrar erro quando código estiver vazio', async () => {
    renderWithProvider(<ValidarBilhete />);
    
    const submitButton = screen.getByRole('button', { name: /validar/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/código é obrigatório/i)).toBeInTheDocument();
    });
  });

  it('deve validar bilhete premiado com sucesso', async () => {
    const mockResponse = {
      valido: true,
      bilhete: {
        id: 'test-1',
        numero: '000001',
        codigo: 'GANHADOR-ABC123',
        prefixo: 'GANHADOR',
        status: 'premiado' as const,
        valor: 100,
        dataCriacao: new Date(),
        dataValidacao: new Date(),
      },
      mensagem: 'Parabéns! Seu bilhete foi premiado com R$ 100,00!',
      tipo: 'sucesso' as const,
    };

    vi.mocked(bilheteService.currentBilheteService.validarBilhete).mockResolvedValue(mockResponse);

    renderWithProvider(<ValidarBilhete />);
    
    const input = screen.getByLabelText(/código do bilhete/i);
    const submitButton = screen.getByRole('button', { name: /validar/i });
    
    fireEvent.change(input, { target: { value: 'GANHADOR-ABC123' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/parabéns! seu bilhete foi premiado/i)).toBeInTheDocument();
      expect(screen.getByText(/r\$ 100,00/i)).toBeInTheDocument();
    });
  });

  it('deve mostrar mensagem para bilhete válido mas não premiado', async () => {
    const mockResponse = {
      valido: true,
      bilhete: {
        id: 'test-2',
        numero: '000002',
        codigo: 'GANHADOR-DEF456',
        prefixo: 'GANHADOR',
        status: 'ativo' as const,
        dataCriacao: new Date(),
      },
      mensagem: 'Bilhete válido, mas não foi premiado. Continue participando!',
      tipo: 'aviso' as const,
    };

    vi.mocked(bilheteService.currentBilheteService.validarBilhete).mockResolvedValue(mockResponse);

    renderWithProvider(<ValidarBilhete />);
    
    const input = screen.getByLabelText(/código do bilhete/i);
    const submitButton = screen.getByRole('button', { name: /validar/i });
    
    fireEvent.change(input, { target: { value: 'GANHADOR-DEF456' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/bilhete válido, mas não foi premiado/i)).toBeInTheDocument();
    });
  });

  it('deve mostrar erro para bilhete inválido', async () => {
    const mockResponse = {
      valido: false,
      mensagem: 'Código inválido ou bilhete expirado.',
      tipo: 'erro' as const,
    };

    vi.mocked(bilheteService.currentBilheteService.validarBilhete).mockResolvedValue(mockResponse);

    renderWithProvider(<ValidarBilhete />);
    
    const input = screen.getByLabelText(/código do bilhete/i);
    const submitButton = screen.getByRole('button', { name: /validar/i });
    
    fireEvent.change(input, { target: { value: 'INVALID-CODE' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/código inválido ou bilhete expirado/i)).toBeInTheDocument();
    });
  });

  it('deve ter botão para escanear QR code', () => {
    renderWithProvider(<ValidarBilhete />);
    
    expect(screen.getByRole('button', { name: /escanear qr code/i })).toBeInTheDocument();
  });
}); 