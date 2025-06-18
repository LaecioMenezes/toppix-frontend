import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ListarBilhetes } from '../../../pages/admin/ListarBilhetes';
import { BilheteProvider } from '../../../contexts/BilheteContext';
import { bilheteService } from '../../../services/bilheteService';
import type { Bilhete } from '../../../types';

// Mock do serviço
vi.mock('../../../services/bilheteService', () => ({
  bilheteService: {
    gerarLote: vi.fn(),
    listarBilhetes: vi.fn(),
    validarBilhete: vi.fn(),
    downloadPdf: vi.fn(),
    obterUrlPdf: vi.fn(),
    formatarDataBrasileira: vi.fn().mockReturnValue('01/01/2024 10:30'),
    obterCorStatus: vi.fn().mockReturnValue('bg-blue-100 text-blue-800'),
    obterTextoStatus: vi.fn().mockReturnValue('Gerado'),
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

const mockBilhetes: Bilhete[] = [
  {
    id: '1',
    numeroSequencial: 'GANHADOR 001',
    codigoUnico: 'A1B2C3D4E5F',
    qrCodeRef: 'qr-ref-1',
    pdfUrl: undefined,
    status: 'GERADO',
    createdAt: '2024-01-01T10:30:00Z',
    updatedAt: '2024-01-01T10:30:00Z',
    dataResgate: undefined,
    usuarioId: 'user-1',
    usuario: undefined
  },
  {
    id: '2',
    numeroSequencial: 'GANHADOR 002',
    codigoUnico: 'F6G7H8I9J0K',
    qrCodeRef: 'qr-ref-2',
    pdfUrl: undefined,
    status: 'PREMIADO',
    createdAt: '2024-01-01T11:00:00Z',
    updatedAt: '2024-01-01T12:00:00Z',
    dataResgate: '2024-01-01T12:00:00Z',
    usuarioId: 'user-1',
    usuario: undefined
  }
];

describe('ListarBilhetes Page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(bilheteService.listarBilhetes).mockResolvedValue(mockBilhetes);
  });

  it('deve renderizar a lista de bilhetes', async () => {
    renderWithProvider(<ListarBilhetes />);
    
    expect(screen.getByText(/listar bilhetes/i)).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('GANHADOR 001')).toBeInTheDocument();
      expect(screen.getByText('GANHADOR 002')).toBeInTheDocument();
      expect(screen.getByText('A1B2C3D4E5F')).toBeInTheDocument();
    });
  });

  it('deve aplicar filtros corretamente', async () => {
    renderWithProvider(<ListarBilhetes />);
    
    await waitFor(() => {
      expect(screen.getByText('GANHADOR 001')).toBeInTheDocument();
    });

    const statusSelect = screen.getByRole('combobox');
    fireEvent.change(statusSelect, { target: { value: 'GERADO' } });
    
    const aplicarButton = screen.getByText(/aplicar/i);
    fireEvent.click(aplicarButton);
    
    await waitFor(() => {
      expect(bilheteService.listarBilhetes).toHaveBeenCalledWith({
        status: 'GERADO'
      });
    });
  });

  it('deve limpar filtros corretamente', async () => {
    renderWithProvider(<ListarBilhetes />);
    
    await waitFor(() => {
      expect(screen.getByText('GANHADOR 001')).toBeInTheDocument();
    });

    const limparButton = screen.getByText(/limpar/i);
    fireEvent.click(limparButton);
    
    await waitFor(() => {
      expect(bilheteService.listarBilhetes).toHaveBeenCalledWith();
    });
  });

  it('deve mostrar loading durante carregamento', async () => {
    let resolvePromise: (value: any) => void;
    const promise = new Promise<Bilhete[]>(resolve => {
      resolvePromise = resolve;
    });

    vi.mocked(bilheteService.listarBilhetes).mockImplementation(() => promise);

    renderWithProvider(<ListarBilhetes />);
    
    expect(screen.getByText(/carregando bilhetes/i)).toBeInTheDocument();
    
    // Resolve a promise
    resolvePromise!(mockBilhetes);
    
    await waitFor(() => {
      expect(screen.getByText('GANHADOR 001')).toBeInTheDocument();
    });
  });

  it('deve mostrar mensagem quando não há bilhetes', async () => {
    vi.mocked(bilheteService.listarBilhetes).mockResolvedValue([]);
    
    renderWithProvider(<ListarBilhetes />);
    
    await waitFor(() => {
      expect(screen.getByText(/nenhum bilhete encontrado/i)).toBeInTheDocument();
    });
  });

  it('deve permitir download de PDF', async () => {
    vi.mocked(bilheteService.downloadPdf).mockResolvedValue();
    
    renderWithProvider(<ListarBilhetes />);
    
    await waitFor(() => {
      expect(screen.getByText('GANHADOR 001')).toBeInTheDocument();
    });

    const downloadButtons = screen.getAllByTitle(/download pdf/i);
    fireEvent.click(downloadButtons[0]);
    
    await waitFor(() => {
      expect(bilheteService.downloadPdf).toHaveBeenCalledWith('1', 'GANHADOR_001.pdf');
    });
  });

  it('deve mostrar estatísticas', async () => {
    renderWithProvider(<ListarBilhetes />);
    
    await waitFor(() => {
      expect(screen.getByText('GANHADOR 001')).toBeInTheDocument();
    });

    // Verifica se as estatísticas aparecem
    expect(screen.getByText('2')).toBeInTheDocument(); // Total
    expect(screen.getByText('Total')).toBeInTheDocument();
    expect(screen.getByText('Gerados')).toBeInTheDocument();
    expect(screen.getByText('Premiados')).toBeInTheDocument();
    expect(screen.getByText('Cancelados')).toBeInTheDocument();
  });
}); 