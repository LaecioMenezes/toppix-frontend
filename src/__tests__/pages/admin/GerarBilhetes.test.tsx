import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GerarBilhetes } from '../../../pages/admin/GerarBilhetes';
import { BilheteProvider } from '../../../contexts/BilheteContext';
import * as bilheteService from '../../../services/bilheteService';

// Mock do serviço
vi.mock('../../../services/bilheteService');

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <BilheteProvider>
      {component}
    </BilheteProvider>
  );
};

describe('GerarBilhetes Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve renderizar o formulário de geração', () => {
    renderWithProvider(<GerarBilhetes />);
    
    expect(screen.getByText(/gerar bilhetes/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/quantidade/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/prefixo/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /gerar bilhetes/i })).toBeInTheDocument();
  });

  it('deve validar campos obrigatórios', async () => {
    renderWithProvider(<GerarBilhetes />);
    
    const submitButton = screen.getByRole('button', { name: /gerar bilhetes/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/quantidade deve ser pelo menos 1/i)).toBeInTheDocument();
      expect(screen.getByText(/prefixo é obrigatório/i)).toBeInTheDocument();
    });
  });

  it('deve validar quantidade mínima', async () => {
    renderWithProvider(<GerarBilhetes />);
    
    const quantidadeInput = screen.getByLabelText(/quantidade/i);
    fireEvent.change(quantidadeInput, { target: { value: '0' } });
    
    const submitButton = screen.getByRole('button', { name: /gerar bilhetes/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/quantidade deve ser pelo menos 1/i)).toBeInTheDocument();
    });
  });

  it('deve gerar bilhetes com sucesso', async () => {
    const mockResponse = {
      sucesso: true,
      dados: [
        {
          id: 'test-1',
          numero: '000001',
          codigo: 'PROMOCAO-ABC123',
          prefixo: 'PROMOCAO',
          status: 'ativo' as const,
          dataCriacao: new Date(),
        },
        {
          id: 'test-2',
          numero: '000002',
          codigo: 'PROMOCAO-DEF456',
          prefixo: 'PROMOCAO',
          status: 'ativo' as const,
          dataCriacao: new Date(),
        },
      ],
      mensagem: '2 bilhetes gerados com sucesso!'
    };

    vi.mocked(bilheteService.currentBilheteService.gerarBilhetes).mockResolvedValue(mockResponse);

    renderWithProvider(<GerarBilhetes />);
    
    const quantidadeInput = screen.getByLabelText(/quantidade/i);
    const prefixoInput = screen.getByLabelText(/prefixo/i);
    const submitButton = screen.getByRole('button', { name: /gerar bilhetes/i });
    
    fireEvent.change(quantidadeInput, { target: { value: '2' } });
    fireEvent.change(prefixoInput, { target: { value: 'PROMOCAO' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/bilhetes foram gerados com sucesso/i)).toBeInTheDocument();
    });
  });

  it('deve mostrar loading durante geração', async () => {
    let resolvePromise: (value: any) => void;
    const promise = new Promise<any>(resolve => {
      resolvePromise = resolve;
    });

    vi.mocked(bilheteService.currentBilheteService.gerarBilhetes).mockReturnValue(promise);

    renderWithProvider(<GerarBilhetes />);
    
    const quantidadeInput = screen.getByLabelText(/quantidade/i);
    const prefixoInput = screen.getByLabelText(/prefixo/i);
    const submitButton = screen.getByRole('button', { name: /gerar bilhetes/i });
    
    fireEvent.change(quantidadeInput, { target: { value: '10' } });
    fireEvent.change(prefixoInput, { target: { value: 'GANHADOR' } });
    fireEvent.click(submitButton);
    
    // Verifica se o loading aparece
    await waitFor(() => {
      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    // Resolve a promise para terminar o teste
    resolvePromise!({
      sucesso: true,
      dados: [],
      mensagem: 'Sucesso!'
    });
  });

  it('deve permitir definir valor do prêmio', () => {
    renderWithProvider(<GerarBilhetes />);
    
    expect(screen.getByLabelText(/valor do prêmio/i)).toBeInTheDocument();
  });

  it('deve permitir definir data de expiração', () => {
    renderWithProvider(<GerarBilhetes />);
    
    expect(screen.getByLabelText(/data de expiração/i)).toBeInTheDocument();
  });
}); 