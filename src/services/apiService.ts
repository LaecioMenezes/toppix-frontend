import type { 
  Bilhete,
  GerarLoteRequest,
  GerarLoteResponse,
  LoginRequest,
  LoginResponse,
  CriarUsuarioRequest,
  Usuario,
  FiltrosBilhetes,
  BilhetesPaginadosResponse,
  StorageInfo,
  PdfUrlResponse,
  ValidarBilheteRequest,
  ValidarBilheteResponse,
  FormularioResgateRequest,
  ResgateResponse,
  MarcarComoPagoRequest,
  MarcarComoPagoResponse
} from '../types';

// Configuração da API
const API_BASE_URL = import.meta.env.VITE_API_URL || (
  import.meta.env.DEV ? '/api' : 'http://localhost:3000'
);

// Classe para lidar com erros da API
class ApiError extends Error {
  status: number;
  data?: any;

  constructor(
    message: string,
    status: number,
    data?: any
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Gerenciamento de token
class TokenManager {
  private static readonly TOKEN_KEY = 'toppix_auth_token';

  static getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  static setToken(token: string): void {
    localStorage.setItem(this.TOKEN_KEY, token);
  }

  static removeToken(): void {
    localStorage.removeItem(this.TOKEN_KEY);
  }

  static isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

// Função auxiliar para fazer requisições
async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  };

  // Adicionar token de autenticação se disponível
  const token = TokenManager.getToken();
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const defaultOptions: RequestInit = {
    mode: 'cors', // Explicitamente habilitar CORS
    credentials: 'include', // Incluir cookies se necessário
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    ...options,
  };

  try {
    console.log(`🔄 API Request: ${options.method || 'GET'} ${url}`);
    console.log('📋 Headers:', defaultOptions.headers);
    if (options.body) {
      console.log('📦 Body:', options.body);
    }

    const response = await fetch(url, defaultOptions);
    
    console.log(`📡 Response: ${response.status} ${response.statusText}`);
    
    // Para downloads de PDF, retornar o blob diretamente
    if (response.headers.get('content-type')?.includes('application/pdf')) {
      return response.blob() as unknown as T;
    }

    let data;
    try {
      data = await response.json();
      console.log('📄 Response Data:', data);
    } catch {
      // Se não for JSON, retornar resposta vazia
      data = {};
    }

    if (!response.ok) {
      const errorMessage = Array.isArray(data.message) 
        ? data.message.join(', ') 
        : data.message || `Erro HTTP ${response.status}`;
      
      console.error('❌ API Error:', errorMessage);
      
      throw new ApiError(
        errorMessage,
        response.status,
        data
      );
    }

    return data;
  } catch (error) {
    console.error('🚨 Request Error:', error);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    // Melhor tratamento de erros de CORS
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new ApiError(
        'Erro de conexão - Verifique se o backend está rodando e configurado para CORS',
        0,
        error
      );
    }
    
    throw new ApiError('Erro de conexão', 0, error);
  }
}

// Serviços da API
export const apiService = {
  // === AUTENTICAÇÃO ===
  
  async login(dados: LoginRequest): Promise<LoginResponse> {
    const response = await apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(dados),
    });
    
    // Salvar token automaticamente
    TokenManager.setToken(response.access_token);
    
    return response;
  },

  async register(dados: CriarUsuarioRequest): Promise<Usuario> {
    return apiRequest<Usuario>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(dados),
    });
  },

  logout(): void {
    TokenManager.removeToken();
  },

  isAuthenticated(): boolean {
    return TokenManager.isAuthenticated();
  },

  // === BILHETES ===

  async gerarLote(dados: GerarLoteRequest): Promise<GerarLoteResponse> {
    return apiRequest<GerarLoteResponse>('/bilhetes/gerar-lote', {
      method: 'POST',
      body: JSON.stringify(dados),
    });
  },

  async listarBilhetes(filtros?: FiltrosBilhetes): Promise<Bilhete[]> {
    const params = new URLSearchParams();
    
    if (filtros?.status) params.append('status', filtros.status);
    if (filtros?.dataInicio) params.append('dataInicio', filtros.dataInicio);
    if (filtros?.dataFim) params.append('dataFim', filtros.dataFim);

    const queryString = params.toString();
    const endpoint = queryString ? `/bilhetes?${queryString}` : '/bilhetes';
    
    return apiRequest<Bilhete[]>(endpoint);
  },

  async listarBilhetesPaginados(filtros?: FiltrosBilhetes): Promise<BilhetesPaginadosResponse> {
    const params = new URLSearchParams();
    
    if (filtros?.status) params.append('status', filtros.status);
    if (filtros?.dataInicio) params.append('dataInicio', filtros.dataInicio);
    if (filtros?.dataFim) params.append('dataFim', filtros.dataFim);
    if (filtros?.pagina) params.append('pagina', filtros.pagina.toString());
    if (filtros?.limite) params.append('limite', filtros.limite.toString());

    const queryString = params.toString();
    const endpoint = queryString ? `/bilhetes?${queryString}` : '/bilhetes';
    
    return apiRequest<BilhetesPaginadosResponse>(endpoint);
  },

  // === PDF ===

  async gerarPdf(bilheteId: string): Promise<Blob> {
    return apiRequest<Blob>(`/bilhetes/${bilheteId}/pdf`);
  },

  async obterUrlPdf(bilheteId: string): Promise<PdfUrlResponse> {
    return apiRequest<PdfUrlResponse>(`/bilhetes/${bilheteId}/pdf-url`);
  },

  async removerPdf(bilheteId: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/bilhetes/${bilheteId}/pdf`, {
      method: 'DELETE',
    });
  },

  // === STORAGE ===

  async obterInfoStorage(): Promise<StorageInfo> {
    return apiRequest<StorageInfo>('/bilhetes/storage/info');
  },

  // === VALIDAÇÃO PÚBLICA ===

  async validarBilhete(dados: ValidarBilheteRequest): Promise<ValidarBilheteResponse> {
    try {
      const response = await apiRequest<ValidarBilheteResponse>('/bilhetes/validar', {
        method: 'POST',
        body: JSON.stringify(dados),
      });
      
      return response;
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

  async processarResgate(dados: FormularioResgateRequest): Promise<ResgateResponse> {
    try {
      const response = await apiRequest<ResgateResponse>('/bilhetes/resgatar', {
        method: 'POST',
        body: JSON.stringify(dados),
      });
      
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Erro de conexão', 500);
    }
  },

  async marcarComoPago(dados: MarcarComoPagoRequest): Promise<MarcarComoPagoResponse> {
    try {
      const response = await apiRequest<MarcarComoPagoResponse>('/bilhetes/marcar-como-pago', {
        method: 'POST',
        body: JSON.stringify(dados),
      });
      
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }
      throw new ApiError('Erro de conexão', 500);
    }
  },
};

// Mock para desenvolvimento (quando a API não estiver disponível)
export const mockApiService = {
  async login(dados: LoginRequest): Promise<LoginResponse> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (dados.email === 'admin@teste.com' && dados.password === 'password123') {
      const response = {
        access_token: 'mock_token_' + Date.now(),
        user: {
          id: 'mock_user_id',
          email: dados.email,
          nome: 'Administrador Mock',
          role: 'ADMIN' as const
        }
      };
      
      TokenManager.setToken(response.access_token);
      return response;
    }
    
    throw new ApiError('Credenciais inválidas', 401);
  },

  async gerarLote(dados: GerarLoteRequest): Promise<GerarLoteResponse> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return {
      quantidade: dados.quantidade,
      prefixo: dados.prefixo || 'GANHADOR'
    };
  },

  async listarBilhetes(filtros?: FiltrosBilhetes): Promise<Bilhete[]> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const bilhetesMock: Bilhete[] = Array.from({ length: 10 }, (_, index) => ({
      id: `mock_${index + 1}`,
      codigoUnico: `A1B2C3D4E${index}`,
      numeroSequencial: `GANHADOR ${String(index + 1).padStart(3, '0')}`,
      qrCodeRef: `QR${index + 1}`,
      pdfUrl: `https://mock.com/bilhete-${index + 1}.pdf`,
      status: ['GERADO', 'PREMIADO', 'PAGO', 'CANCELADO'][index % 4] as any,
      createdAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      usuarioId: null,
      usuario: null,
    }));

    // Aplicar filtros se fornecidos
    let bilhetesFiltrados = bilhetesMock;
    if (filtros?.status) {
      bilhetesFiltrados = bilhetesFiltrados.filter(b => b.status === filtros.status);
    }

    return bilhetesFiltrados;
  },

  async listarBilhetesPaginados(filtros?: FiltrosBilhetes): Promise<BilhetesPaginadosResponse> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Gerar dados mock maiores para simular paginação
    const totalBilhetes = 150;
    const pagina = filtros?.pagina || 1;
    const limite = filtros?.limite || 10;
    
    const bilhetesMock: Bilhete[] = Array.from({ length: totalBilhetes }, (_, index) => ({
      id: `mock_${index + 1}`,
      codigoUnico: `A1B2C3D4E${String(index).padStart(2, '0')}`,
      numeroSequencial: `GANHADOR ${String(index + 1).padStart(3, '0')}`,
      qrCodeRef: `QR${index + 1}`,
      pdfUrl: `https://mock.com/bilhete-${index + 1}.pdf`,
      status: ['GERADO', 'PREMIADO', 'PAGO', 'CANCELADO'][index % 4] as any,
      createdAt: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString(),
      updatedAt: new Date().toISOString(),
      usuarioId: null,
      usuario: null,
    }));

    // Aplicar filtros
    let bilhetesFiltrados = bilhetesMock;
    if (filtros?.status) {
      bilhetesFiltrados = bilhetesFiltrados.filter(b => b.status === filtros.status);
    }

    // Calcular paginação
    const totalItens = bilhetesFiltrados.length;
    const totalPaginas = Math.ceil(totalItens / limite);
    const inicio = (pagina - 1) * limite;
    const fim = inicio + limite;
    const bilhetesPagina = bilhetesFiltrados.slice(inicio, fim);

    return {
      bilhetes: bilhetesPagina,
      paginacao: {
        paginaAtual: pagina,
        itensPorPagina: limite,
        totalItens,
        totalPaginas,
        temPaginaAnterior: pagina > 1,
        temProximaPagina: pagina < totalPaginas
      }
    };
  },

  async validarBilhete(dados: ValidarBilheteRequest): Promise<ValidarBilheteResponse> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simular diferentes cenários baseado no código
    if (dados.codigo.includes('GANHADOR')) {
      return {
        valido: true,
        bilhete: {
          id: 'mock_bilhete_1',
          codigoUnico: dados.codigo,
          numeroSequencial: 'GANHADOR 001',
          status: 'PREMIADO',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          usuarioId: null,
          usuario: null,
        },
        mensagem: 'Parabéns! Bilhete premiado!',
        tipo: 'sucesso'
      };
    }
    
    if (dados.codigo.includes('VALIDO')) {
      return {
        valido: true,
        bilhete: {
          id: 'mock_bilhete_2',
          codigoUnico: dados.codigo,
          numeroSequencial: 'PROMO 002',
          status: 'GERADO',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          usuarioId: null,
          usuario: null,
        },
        mensagem: 'Bilhete válido, mas não premiado. Continue participando!',
        tipo: 'aviso'
      };
    }
    
    return {
      valido: false,
      mensagem: 'Código não encontrado ou inválido',
      tipo: 'erro'
    };
  },

  async processarResgate(dados: FormularioResgateRequest): Promise<ResgateResponse> {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Simular validações
    if (!dados.codigo || dados.codigo.length !== 11) {
      throw new ApiError('Código inválido', 400);
    }
    
    if (!dados.nomeCompleto || dados.nomeCompleto.length < 3) {
      throw new ApiError('Nome completo deve ter pelo menos 3 caracteres', 400);
    }
    
    if (!dados.telefone.match(/^\([0-9]{2}\) [0-9]{4,5}-[0-9]{4}$/)) {
      throw new ApiError('Telefone deve estar no formato (XX) XXXXX-XXXX', 400);
    }
    
    if (!dados.email.includes('@')) {
      throw new ApiError('Email inválido', 400);
    }
    
    if (!dados.chavePix || dados.chavePix.length < 11) {
      throw new ApiError('Chave PIX deve ter pelo menos 11 caracteres', 400);
    }
    
    // Simular bilhete já resgatado
    if (dados.codigo.includes('PREMIADO')) {
      throw new ApiError('Este bilhete já foi resgatado anteriormente', 400);
    }
    
    // Simular bilhete não encontrado
    if (dados.codigo.includes('INVALIDO')) {
      throw new ApiError('Bilhete não encontrado ou inválido', 400);
    }
    
    const dataResgate = new Date().toISOString();
    
    return {
      sucesso: true,
      mensagem: 'Dados de resgate salvos com sucesso! Bilhete marcado como premiado.',
      bilhete: {
        id: 'mock_bilhete_resgatado',
        codigoUnico: dados.codigo,
        numeroSequencial: 'GANHADOR 001',
        status: 'PREMIADO',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        dataResgate,
        usuarioId: null,
        usuario: null,
      },
      dataResgate
    };
  },

  async obterInfoStorage(): Promise<StorageInfo> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    return {
      bucketName: 'bilhetes-pdf-mock',
      endpoint: 'localhost',
      connected: true
    };
  },

  async gerarPdf(bilheteId: string): Promise<Blob> {
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Simular um PDF mock
    const pdfContent = `Mock PDF para bilhete ${bilheteId}`;
    return new Blob([pdfContent], { type: 'application/pdf' });
  },

  async obterUrlPdf(bilheteId: string): Promise<PdfUrlResponse> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      url: `https://mock.com/bilhete-${bilheteId}.pdf?expires=123456`,
      expiresIn: '24 horas'
    };
  },

  async marcarComoPago(dados: MarcarComoPagoRequest): Promise<MarcarComoPagoResponse> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simular validações
    if (!dados.bilheteId) {
      throw new ApiError('ID do bilhete é obrigatório', 400);
    }
    
    // Simular bilhete não encontrado
    if (dados.bilheteId.includes('INEXISTENTE')) {
      throw new ApiError('Bilhete não encontrado', 404);
    }
    
    // Simular bilhete já pago
    if (dados.bilheteId.includes('JA_PAGO')) {
      throw new ApiError('Este bilhete já está marcado como pago', 400);
    }
    
    return {
      sucesso: true,
      mensagem: 'Bilhete marcado como pago com sucesso!',
      bilhete: {
        id: dados.bilheteId,
        codigoUnico: 'A1B2C3D4E5F',
        numeroSequencial: 'GANHADOR 001',
        status: 'PAGO',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        usuarioId: null,
        usuario: null,
      }
    };
  },
};

// Exportar o serviço baseado na configuração
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';
export const bilheteApiService = USE_MOCK ? mockApiService : apiService;

// Exportar classes e utilitários
export { ApiError, TokenManager }; 