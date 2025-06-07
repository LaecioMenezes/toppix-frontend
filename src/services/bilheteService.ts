import type { 
  Bilhete, 
  GerarBilhetesRequest, 
  ValidarBilheteRequest, 
  ValidarBilheteResponse,
  FiltrosBilhetes,
  ExportarBilhetesRequest,
  ApiResponse 
} from '../types';

// Configuração da API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Classe para lidar com erros da API
class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Função auxiliar para fazer requisições
async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, defaultOptions);
    const data = await response.json();

    if (!response.ok) {
      throw new ApiError(
        data.mensagem || 'Erro na requisição',
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError('Erro de conexão', 0, error);
  }
}

// Serviços da API
export const bilheteService = {
  // Gerar bilhetes
  async gerarBilhetes(dados: GerarBilhetesRequest): Promise<ApiResponse<Bilhete[]>> {
    return apiRequest<Bilhete[]>('/bilhetes/gerar', {
      method: 'POST',
      body: JSON.stringify(dados),
    });
  },

  // Listar bilhetes
  async listarBilhetes(filtros?: FiltrosBilhetes): Promise<ApiResponse<Bilhete[]>> {
    const params = new URLSearchParams();
    
    if (filtros?.status) params.append('status', filtros.status);
    if (filtros?.prefixo) params.append('prefixo', filtros.prefixo);
    if (filtros?.codigo) params.append('codigo', filtros.codigo);
    if (filtros?.dataInicio) params.append('dataInicio', filtros.dataInicio.toISOString());
    if (filtros?.dataFim) params.append('dataFim', filtros.dataFim.toISOString());

    const queryString = params.toString();
    const endpoint = queryString ? `/bilhetes?${queryString}` : '/bilhetes';
    
    return apiRequest<Bilhete[]>(endpoint);
  },

  // Buscar bilhete por ID
  async buscarBilhete(id: string): Promise<ApiResponse<Bilhete>> {
    return apiRequest<Bilhete>(`/bilhetes/${id}`);
  },

  // Validar bilhete
  async validarBilhete(dados: ValidarBilheteRequest): Promise<ValidarBilheteResponse> {
    try {
      const response = await apiRequest<ValidarBilheteResponse>('/bilhetes/validar', {
        method: 'POST',
        body: JSON.stringify(dados),
      });
      
      return response.dados || {
        valido: false,
        mensagem: 'Erro na validação',
        tipo: 'erro'
      };
    } catch (error) {
      if (error instanceof ApiError) {
        return {
          valido: false,
          mensagem: error.message,
          tipo: 'erro'
        };
      }
      return {
        valido: false,
        mensagem: 'Erro de conexão',
        tipo: 'erro'
      };
    }
  },

  // Exportar bilhetes
  async exportarBilhetes(dados: ExportarBilhetesRequest): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/bilhetes/exportar`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(dados),
    });

    if (!response.ok) {
      throw new ApiError('Erro ao exportar bilhetes', response.status);
    }

    return response.blob();
  },

  // Visualizar PDF do bilhete
  async visualizarPDF(id: string): Promise<Blob> {
    const response = await fetch(`${API_BASE_URL}/bilhetes/${id}/pdf`);

    if (!response.ok) {
      throw new ApiError('Erro ao gerar PDF', response.status);
    }

    return response.blob();
  },
};

// Mock para desenvolvimento (será removido quando o backend estiver pronto)
export const mockBilheteService = {
  async gerarBilhetes(dados: GerarBilhetesRequest): Promise<ApiResponse<Bilhete[]>> {
    // Simula delay da API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const bilhetes: Bilhete[] = Array.from({ length: dados.quantidade }, (_, index) => ({
      id: `mock-${Date.now()}-${index}`,
      numero: String(index + 1).padStart(6, '0'),
      codigo: `${dados.prefixo}-${Math.random().toString(36).toUpperCase().substring(2, 8)}`,
      prefixo: dados.prefixo,
      status: 'ativo' as const,
      valor: dados.valor,
      dataCriacao: new Date(),
      dataExpiracao: dados.dataExpiracao,
    }));

    return {
      sucesso: true,
      dados: bilhetes,
      mensagem: `${dados.quantidade} bilhetes gerados com sucesso!`
    };
  },

  async listarBilhetes(filtros?: FiltrosBilhetes): Promise<ApiResponse<Bilhete[]>> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Dados mock
    const bilhetesMock: Bilhete[] = [
      {
        id: 'mock-1',
        numero: '000001',
        codigo: 'GANHADOR-ABC123',
        prefixo: 'GANHADOR',
        status: 'premiado',
        valor: 100,
        dataCriacao: new Date('2024-01-01'),
        dataValidacao: new Date('2024-01-15'),
      },
      {
        id: 'mock-2',
        numero: '000002',
        codigo: 'GANHADOR-DEF456',
        prefixo: 'GANHADOR',
        status: 'ativo',
        dataCriacao: new Date('2024-01-02'),
      },
    ];

    return {
      sucesso: true,
      dados: bilhetesMock,
    };
  },

  async validarBilhete(dados: ValidarBilheteRequest): Promise<ValidarBilheteResponse> {
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Simula diferentes cenários
    if (dados.codigo === 'GANHADOR-ABC123') {
      return {
        valido: true,
        bilhete: {
          id: 'mock-1',
          numero: '000001',
          codigo: 'GANHADOR-ABC123',
          prefixo: 'GANHADOR',
          status: 'premiado',
          valor: 100,
          dataCriacao: new Date('2024-01-01'),
          dataValidacao: new Date(),
        },
        mensagem: 'Parabéns! Seu bilhete foi premiado com R$ 100,00!',
        tipo: 'sucesso'
      };
    }
    
    if (dados.codigo === 'GANHADOR-DEF456') {
      return {
        valido: true,
        bilhete: {
          id: 'mock-2',
          numero: '000002',
          codigo: 'GANHADOR-DEF456',
          prefixo: 'GANHADOR',
          status: 'ativo',
          dataCriacao: new Date('2024-01-02'),
        },
        mensagem: 'Bilhete válido, mas não foi premiado. Continue participando!',
        tipo: 'aviso'
      };
    }
    
    return {
      valido: false,
      mensagem: 'Código inválido ou bilhete expirado.',
      tipo: 'erro'
    };
  },

  async exportarBilhetes(dados: ExportarBilhetesRequest): Promise<Blob> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simula criação de arquivo CSV ou ZIP
    const conteudo = dados.formato === 'csv' 
      ? 'Número,Código,Status,Valor,Data Criação\n000001,GANHADOR-ABC123,premiado,100,2024-01-01\n000002,GANHADOR-DEF456,ativo,,2024-01-02'
      : 'Arquivo ZIP simulado com PDFs dos bilhetes';
    
    return new Blob([conteudo], { 
      type: dados.formato === 'csv' ? 'text/csv' : 'application/zip' 
    });
  },

  async visualizarPDF(id: string): Promise<Blob> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Simula PDF
    const conteudo = `PDF simulado para o bilhete ${id}`;
    return new Blob([conteudo], { type: 'application/pdf' });
  },
};

// Usa o serviço mock em desenvolvimento
export const currentBilheteService = import.meta.env.VITE_USE_MOCK === 'true' 
  ? mockBilheteService 
  : bilheteService; 