import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ValidarBilhete } from '../ValidarBilhete';
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

const renderWithRouter = (ui: React.ReactElement) => {
  return render(
    <BrowserRouter>
      {ui}
    </BrowserRouter>
  );
};

describe('ValidarBilhete', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar campos de entrada', () => {
    const { getByPlaceholderText, getByText } = renderWithRouter(<ValidarBilhete />);

    expect(getByPlaceholderText(/digite o código do bilhete/i)).toBeInTheDocument();
    expect(getByText(/validar bilhete/i)).toBeInTheDocument();
  });

  it('deve validar código digitado corretamente', async () => {
    const mockValidacao = {
      valido: true,
      bilhete: {
        id: '1',
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
      mensagem: 'Parabéns! Você ganhou!',
      tipo: 'sucesso' as const,
    };

    vi.mocked(bilheteService.validarBilhete).mockResolvedValueOnce(mockValidacao);

    const { getByPlaceholderText, getByText } = renderWithRouter(<ValidarBilhete />);

    const input = getByPlaceholderText(/digite o código do bilhete/i);
    const button = getByText(/validar bilhete/i);

    fireEvent.change(input, { target: { value: 'A1B2C3D4E5F' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(getByText(/bilhete válido!/i)).toBeInTheDocument();
    });

    expect(getByText(/parabéns! você ganhou!/i)).toBeInTheDocument();
  });

  it('deve mostrar erro para código inválido', async () => {
    const mockValidacao = {
      valido: false,
      mensagem: 'Código não encontrado ou inválido',
      tipo: 'erro' as const,
    };

    vi.mocked(bilheteService.validarBilhete).mockResolvedValueOnce(mockValidacao);

    const { getByPlaceholderText, getByText } = renderWithRouter(<ValidarBilhete />);

    const input = getByPlaceholderText(/digite o código do bilhete/i);
    const button = getByText(/validar bilhete/i);

    fireEvent.change(input, { target: { value: 'INVALIDO123' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(getByText(/bilhete inválido/i)).toBeInTheDocument();
    });

    expect(getByText('Código não encontrado ou inválido')).toBeInTheDocument();
  });

  it('deve desabilitar botão durante validação', async () => {
    vi.mocked(bilheteService.validarBilhete).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({
        valido: true,
        mensagem: 'Sucesso',
        tipo: 'sucesso' as const,
      }), 100))
    );

    const { getByPlaceholderText, getByText } = renderWithRouter(<ValidarBilhete />);

    const input = getByPlaceholderText(/digite o código do bilhete/i);
    const button = getByText(/validar bilhete/i);

    fireEvent.change(input, { target: { value: 'TESTE123' } });
    fireEvent.click(button);

    expect(button).toBeDisabled();
  });
}); 