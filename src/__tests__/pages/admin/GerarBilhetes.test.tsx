import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GerarBilhetes } from '../../../pages/admin/GerarBilhetes';
import { BilheteProvider } from '../../../contexts/BilheteContext';
import { bilheteService } from '../../../services/bilheteService';

// Mock do serviço
vi.mock('../../../services/bilheteService', () => ({
  bilheteService: {
    gerarLote: vi.fn(),
    listarBilhetes: vi.fn(),
    validarBilhete: vi.fn(),
    downloadPdf: vi.fn(),
    obterUrlPdf: vi.fn(),
    formatarDataBrasileira: vi.fn(),
    obterCorStatus: vi.fn(),
    obterTextoStatus: vi.fn(),
    validarFormatoCodigo: vi.fn(),
  }
}));

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
    expect(screen.getByRole('button', { name: /gerar lote de bilhetes/i })).toBeInTheDocument();
  });

  it('deve validar campos obrigatórios', async () => {
    renderWithProvider(<GerarBilhetes />);
    
    const submitButton = screen.getByRole('button', { name: /gerar lote de bilhetes/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/quantidade deve ser entre 1 e 10.000 bilhetes/i)).toBeInTheDocument();
    });
  });

  it('deve validar quantidade mínima', async () => {
    renderWithProvider(<GerarBilhetes />);
    
    const quantidadeInput = screen.getByLabelText(/quantidade/i);
    fireEvent.change(quantidadeInput, { target: { value: '0' } });
    
    const submitButton = screen.getByRole('button', { name: /gerar lote de bilhetes/i });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/quantidade deve ser entre 1 e 10.000 bilhetes/i)).toBeInTheDocument();
    });
  });

  it('deve gerar lote com sucesso', async () => {
    const mockResponse = {
      quantidade: 2,
      prefixo: 'GANHADOR',
      primeiroNumero: 1,
      ultimoNumero: 2,
      createdAt: new Date().toISOString()
    };

    vi.mocked(bilheteService.gerarLote).mockResolvedValue(mockResponse);

    renderWithProvider(<GerarBilhetes />);
    
    const quantidadeInput = screen.getByLabelText(/quantidade/i);
    const prefixoInput = screen.getByLabelText(/prefixo/i);
    const submitButton = screen.getByRole('button', { name: /gerar lote de bilhetes/i });
    
    fireEvent.change(quantidadeInput, { target: { value: '2' } });
    fireEvent.change(prefixoInput, { target: { value: 'GANHADOR' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/lote gerado com sucesso/i)).toBeInTheDocument();
    });
  });

  it('deve mostrar loading durante geração', async () => {
    let resolvePromise: (value: any) => void;
    const promise = new Promise<any>(resolve => {
      resolvePromise = resolve;
    });

    vi.mocked(bilheteService.gerarLote).mockReturnValue(promise);

    renderWithProvider(<GerarBilhetes />);
    
    const quantidadeInput = screen.getByLabelText(/quantidade/i);
    const prefixoInput = screen.getByLabelText(/prefixo/i);
    const submitButton = screen.getByRole('button', { name: /gerar lote de bilhetes/i });
    
    fireEvent.change(quantidadeInput, { target: { value: '10' } });
    fireEvent.change(prefixoInput, { target: { value: 'GANHADOR' } });
    fireEvent.click(submitButton);
    
    // Verifica se o loading aparece
    await waitFor(() => {
      expect(screen.getByText(/gerando bilhetes/i)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();
    });

    // Resolve a promise para terminar o teste
    resolvePromise!({
      quantidade: 10,
      prefixo: 'GANHADOR',
      primeiroNumero: 1,
      ultimoNumero: 10,
      createdAt: new Date().toISOString()
    });
  });

  it('deve validar formato do prefixo', async () => {
    renderWithProvider(<GerarBilhetes />);
    
    const quantidadeInput = screen.getByLabelText(/quantidade/i);
    const prefixoInput = screen.getByLabelText(/prefixo/i);
    const submitButton = screen.getByRole('button', { name: /gerar lote de bilhetes/i });
    
    fireEvent.change(quantidadeInput, { target: { value: '5' } });
    fireEvent.change(prefixoInput, { target: { value: 'prefixo-inválido' } });
    fireEvent.click(submitButton);
    
    await waitFor(() => {
      expect(screen.getByText(/prefixo deve conter apenas letras maiúsculas, números e espaços/i)).toBeInTheDocument();
    });
  });

  it('deve mostrar preview dos bilhetes', () => {
    renderWithProvider(<GerarBilhetes />);
    
    const quantidadeInput = screen.getByLabelText(/quantidade/i);
    const prefixoInput = screen.getByLabelText(/prefixo/i);
    
    fireEvent.change(quantidadeInput, { target: { value: '3' } });
    fireEvent.change(prefixoInput, { target: { value: 'TESTE' } });
    
    expect(screen.getByText(/preview dos bilhetes/i)).toBeInTheDocument();
    expect(screen.getByText('TESTE 001')).toBeInTheDocument();
    expect(screen.getByText('TESTE 003')).toBeInTheDocument();
  });
}); 