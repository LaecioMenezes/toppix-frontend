import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ValidarBilhete } from '../../pages/ValidarBilhete';
import { BilheteProvider } from '../../contexts/BilheteContext';
import { bilheteService } from '../../services/bilheteService';

// Mock do serviço
vi.mock('../../services/bilheteService', () => ({
  bilheteService: {
    gerarLote: vi.fn(),
    listarBilhetes: vi.fn(),
    validarBilhete: vi.fn(),
    downloadPdf: vi.fn(),
    obterUrlPdf: vi.fn(),
    formatarDataBrasileira: vi.fn().mockReturnValue('01/01/2024 10:30'),
    obterCorStatus: vi.fn().mockReturnValue('bg-blue-100 text-blue-800'),
    obterTextoStatus: vi.fn().mockReturnValue('Gerado'),
    validarFormatoCodigo: vi.fn().mockReturnValue(true),
  }
}));

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
    
    expect(screen.getByText(/validador de bilhetes/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/código do bilhete/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /validar bilhete/i })).toBeInTheDocument();
  });

  it('deve mostrar erro quando código estiver vazio', async () => {
    renderWithProvider(<ValidarBilhete />);
    
    const submitButton = screen.getByRole('button', { name: /validar bilhete/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/por favor, digite um código para validar/i)).toBeInTheDocument();
    });
  });

  it('deve validar bilhete premiado com sucesso', async () => {
    const mockResponse = {
      valido: true,
      bilhete: {
        id: 'test-1',
        numeroSequencial: 'GANHADOR 001',
        codigoUnico: 'A1B2C3D4E5F',
        qrCodeRef: 'qr-ref-1',
        pdfUrl: undefined,
        status: 'PREMIADO' as const,
        createdAt: '2024-01-01T10:30:00Z',
        updatedAt: '2024-01-01T12:00:00Z',
        dataResgate: '2024-01-01T12:00:00Z',
        usuarioId: 'user-1',
        usuario: undefined
      },
      mensagem: 'Parabéns! Seu bilhete foi premiado!',
      tipo: 'sucesso' as const,
    };

    vi.mocked(bilheteService.validarBilhete).mockResolvedValue(mockResponse);

    renderWithProvider(<ValidarBilhete />);
    
    const input = screen.getByLabelText(/código do bilhete/i);
    const submitButton = screen.getByRole('button', { name: /validar bilhete/i });
    
    fireEvent.change(input, { target: { value: 'A1B2C3D4E5F' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/bilhete válido!/i)).toBeInTheDocument();
      expect(screen.getByText(/parabéns! seu bilhete foi premiado!/i)).toBeInTheDocument();
    });
  });

  it('deve mostrar mensagem para bilhete válido mas não premiado', async () => {
    const mockResponse = {
      valido: true,
      bilhete: {
        id: 'test-2',
        numeroSequencial: 'GANHADOR 002',
        codigoUnico: 'F6G7H8I9J0K',
        qrCodeRef: 'qr-ref-2',
        pdfUrl: undefined,
        status: 'GERADO' as const,
        createdAt: '2024-01-01T11:00:00Z',
        updatedAt: '2024-01-01T11:00:00Z',
        dataResgate: undefined,
        usuarioId: 'user-1',
        usuario: undefined
      },
      mensagem: 'Bilhete válido, mas não foi premiado. Continue participando!',
      tipo: 'aviso' as const,
    };

    vi.mocked(bilheteService.validarBilhete).mockResolvedValue(mockResponse);

    renderWithProvider(<ValidarBilhete />);
    
    const input = screen.getByLabelText(/código do bilhete/i);
    const submitButton = screen.getByRole('button', { name: /validar bilhete/i });
    
    fireEvent.change(input, { target: { value: 'F6G7H8I9J0K' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/bilhete válido!/i)).toBeInTheDocument();
      expect(screen.getByText(/bilhete válido, mas não foi premiado/i)).toBeInTheDocument();
    });
  });

  it('deve mostrar erro para bilhete inválido', async () => {
    const mockResponse = {
      valido: false,
      mensagem: 'Código inválido ou bilhete não encontrado.',
      tipo: 'erro' as const,
    };

    vi.mocked(bilheteService.validarBilhete).mockResolvedValue(mockResponse);

    renderWithProvider(<ValidarBilhete />);
    
    const input = screen.getByLabelText(/código do bilhete/i);
    const submitButton = screen.getByRole('button', { name: /validar bilhete/i });
    
    fireEvent.change(input, { target: { value: 'INVALID-CODE' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/bilhete inválido/i)).toBeInTheDocument();
      expect(screen.getByText(/código inválido ou bilhete não encontrado/i)).toBeInTheDocument();
    });
  });

  it('deve validar formato do código', async () => {
    vi.mocked(bilheteService.validarFormatoCodigo).mockReturnValue(false);
    
    renderWithProvider(<ValidarBilhete />);
    
    const input = screen.getByLabelText(/código do bilhete/i);
    const submitButton = screen.getByRole('button', { name: /validar bilhete/i });
    
    fireEvent.change(input, { target: { value: 'AB' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/código deve ter pelo menos 3 caracteres alfanuméricos/i)).toBeInTheDocument();
    });
  });

  it('deve mostrar loading durante validação', async () => {
    let resolvePromise: (value: any) => void;
    const promise = new Promise<any>(resolve => {
      resolvePromise = resolve;
    });

    vi.mocked(bilheteService.validarBilhete).mockReturnValue(promise);

    renderWithProvider(<ValidarBilhete />);
    
    const input = screen.getByLabelText(/código do bilhete/i);
    const submitButton = screen.getByRole('button', { name: /validar bilhete/i });
    
    fireEvent.change(input, { target: { value: 'A1B2C3D4E5F' } });
    fireEvent.click(submitButton);
    
    expect(screen.getByText(/validando/i)).toBeInTheDocument();
    expect(submitButton).toBeDisabled();

    // Resolve a promise
    resolvePromise!({
      valido: true,
      mensagem: 'Bilhete válido',
      tipo: 'sucesso'
    });
  });
}); 