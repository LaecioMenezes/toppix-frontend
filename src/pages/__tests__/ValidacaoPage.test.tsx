import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ValidarBilhete } from '../ValidarBilhete';
import * as bilheteService from '../../services/bilheteService';

// Mock do serviço
vi.mock('../../services/bilheteService');

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

    expect(getByPlaceholderText('Ex: GANHADOR-ABC123')).toBeInTheDocument();
    expect(getByText('Validar Bilhete')).toBeInTheDocument();
    expect(getByText('Escanear QR Code')).toBeInTheDocument();
  });

  it('deve validar código digitado corretamente', async () => {
    const mockValidacao = {
      valido: true,
      bilhete: {
        id: '1',
        numero: '000001',
        codigo: 'GANHADOR123',
        prefixo: 'GANHADOR',
        status: 'ativo' as const,
        valor: 100,
        dataCriacao: new Date(),
        dataExpiracao: new Date(),
      },
      mensagem: 'Parabéns! Você ganhou R$ 100,00!',
      tipo: 'sucesso' as const,
    };

    vi.mocked(bilheteService.bilheteService.validarBilhete).mockResolvedValueOnce(mockValidacao);

    const { getByPlaceholderText, getByText, getByTestId } = renderWithRouter(<ValidarBilhete />);

    const input = getByPlaceholderText('Ex: GANHADOR-ABC123');
    const button = getByText('Validar Bilhete');

    fireEvent.change(input, { target: { value: 'GANHADOR123' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(getByTestId('resultado-validacao')).toBeInTheDocument();
    });

    expect(getByText('Parabéns! Você ganhou R$ 100,00!')).toBeInTheDocument();
  });

  it('deve mostrar erro para código inválido', async () => {
    const mockValidacao = {
      valido: false,
      mensagem: 'Código não encontrado ou inválido',
      tipo: 'erro' as const,
    };

    vi.mocked(bilheteService.bilheteService.validarBilhete).mockResolvedValueOnce(mockValidacao);

    const { getByPlaceholderText, getByText, getByTestId } = renderWithRouter(<ValidarBilhete />);

    const input = getByPlaceholderText('Ex: GANHADOR-ABC123');
    const button = getByText('Validar Bilhete');

    fireEvent.change(input, { target: { value: 'INVALIDO123' } });
    fireEvent.click(button);

    await waitFor(() => {
      expect(getByTestId('resultado-validacao')).toBeInTheDocument();
    });

    expect(getByText('Código não encontrado ou inválido')).toBeInTheDocument();
  });

  it('deve desabilitar botão durante validação', async () => {
    vi.mocked(bilheteService.bilheteService.validarBilhete).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({
        valido: true,
        mensagem: 'Sucesso',
        tipo: 'sucesso' as const,
      }), 100))
    );

    const { getByPlaceholderText, getByText } = renderWithRouter(<ValidarBilhete />);

    const input = getByPlaceholderText('Ex: GANHADOR-ABC123');
    const button = getByText('Validar Bilhete');

    fireEvent.change(input, { target: { value: 'TESTE123' } });
    fireEvent.click(button);

    expect(button).toBeDisabled();
  });
}); 