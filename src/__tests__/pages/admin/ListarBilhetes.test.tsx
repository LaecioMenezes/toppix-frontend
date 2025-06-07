import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ListarBilhetes } from '../../../pages/admin/ListarBilhetes';
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

const mockBilhetes = [
  {
    id: 'test-1',
    numero: '000001',
    codigo: 'GANHADOR-ABC123',
    prefixo: 'GANHADOR',
    status: 'premiado' as const,
    valor: 100,
    dataCriacao: new Date('2024-01-01'),
    dataValidacao: new Date('2024-01-15'),
  },
  {
    id: 'test-2',
    numero: '000002',
    codigo: 'GANHADOR-DEF456',
    prefixo: 'GANHADOR',
    status: 'ativo' as const,
    dataCriacao: new Date('2024-01-02'),
  },
  {
    id: 'test-3',
    numero: '000003',
    codigo: 'PROMO-GHI789',
    prefixo: 'PROMO',
    status: 'expirado' as const,
    dataCriacao: new Date('2024-01-03'),
    dataExpiracao: new Date('2024-01-10'),
  },
];

describe('ListarBilhetes Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock padrão que retorna os bilhetes
    vi.mocked(bilheteService.currentBilheteService.listarBilhetes).mockResolvedValue({
      sucesso: true,
      dados: mockBilhetes,
    });
  });

  it('deve renderizar a página de listagem', async () => {
    renderWithProvider(<ListarBilhetes />);
    
    expect(screen.getByText(/bilhetes gerados/i)).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('GANHADOR-ABC123')).toBeInTheDocument();
      expect(screen.getByText('GANHADOR-DEF456')).toBeInTheDocument();
      expect(screen.getByText('PROMO-GHI789')).toBeInTheDocument();
    });
  });

  it('deve mostrar filtros de busca', () => {
    renderWithProvider(<ListarBilhetes />);
    
    expect(screen.getByLabelText(/buscar por código/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/filtrar por status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/prefixo/i)).toBeInTheDocument();
  });

  it('deve filtrar bilhetes por código', async () => {
    renderWithProvider(<ListarBilhetes />);
    
    const searchInput = screen.getByLabelText(/buscar por código/i);
    fireEvent.change(searchInput, { target: { value: 'ABC123' } });
    
    await waitFor(() => {
      expect(bilheteService.currentBilheteService.listarBilhetes).toHaveBeenCalledWith({
        codigo: 'ABC123',
      });
    });
  });

  it('deve filtrar bilhetes por status', async () => {
    renderWithProvider(<ListarBilhetes />);
    
    const statusSelect = screen.getByLabelText(/filtrar por status/i);
    fireEvent.change(statusSelect, { target: { value: 'premiado' } });
    
    await waitFor(() => {
      expect(bilheteService.currentBilheteService.listarBilhetes).toHaveBeenCalledWith({
        status: 'premiado',
      });
    });
  });

  it('deve mostrar informações dos bilhetes na tabela', async () => {
    renderWithProvider(<ListarBilhetes />);
    
    await waitFor(() => {
      // Verifica headers da tabela
      expect(screen.getByText(/número/i)).toBeInTheDocument();
      expect(screen.getByText(/código/i)).toBeInTheDocument();
      expect(screen.getByText(/status/i)).toBeInTheDocument();
      expect(screen.getByText(/data de criação/i)).toBeInTheDocument();
      
      // Verifica dados dos bilhetes
      expect(screen.getByText('000001')).toBeInTheDocument();
      expect(screen.getByText('000002')).toBeInTheDocument();
      expect(screen.getByText('000003')).toBeInTheDocument();
    });
  });

  it('deve mostrar badge diferenciado para cada status', async () => {
    renderWithProvider(<ListarBilhetes />);
    
    await waitFor(() => {
      const badges = screen.getAllByTestId(/status-badge/);
      expect(badges).toHaveLength(3);
    });
  });

  it('deve ter botões de ação para cada bilhete', async () => {
    renderWithProvider(<ListarBilhetes />);
    
    await waitFor(() => {
      const pdfButtons = screen.getAllByLabelText(/visualizar pdf/i);
      expect(pdfButtons.length).toBeGreaterThan(0);
    });
  });

  it('deve permitir exportar lista de bilhetes', () => {
    renderWithProvider(<ListarBilhetes />);
    
    expect(screen.getByRole('button', { name: /exportar csv/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /exportar pdfs/i })).toBeInTheDocument();
  });

  it('deve mostrar loading durante carregamento', () => {
    vi.mocked(bilheteService.currentBilheteService.listarBilhetes).mockImplementation(
      () => new Promise(resolve => setTimeout(resolve, 1000))
    );

    renderWithProvider(<ListarBilhetes />);
    
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('deve mostrar mensagem quando não há bilhetes', async () => {
    vi.mocked(bilheteService.currentBilheteService.listarBilhetes).mockResolvedValue({
      sucesso: true,
      dados: [],
    });

    renderWithProvider(<ListarBilhetes />);
    
    await waitFor(() => {
      expect(screen.getByText(/nenhum bilhete encontrado/i)).toBeInTheDocument();
    });
  });

  it('deve aplicar múltiplos filtros', async () => {
    renderWithProvider(<ListarBilhetes />);
    
    const searchInput = screen.getByLabelText(/buscar por código/i);
    const statusSelect = screen.getByLabelText(/filtrar por status/i);
    const prefixoInput = screen.getByLabelText(/prefixo/i);
    
    fireEvent.change(searchInput, { target: { value: 'GANHADOR' } });
    fireEvent.change(statusSelect, { target: { value: 'ativo' } });
    fireEvent.change(prefixoInput, { target: { value: 'GANHADOR' } });
    
    await waitFor(() => {
      expect(bilheteService.currentBilheteService.listarBilhetes).toHaveBeenCalledWith({
        codigo: 'GANHADOR',
        status: 'ativo',
        prefixo: 'GANHADOR',
      });
    });
  });
}); 