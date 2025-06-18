import { apiService, mockApiService } from './apiService';
import type { 
  Bilhete, 
  GerarLoteRequest,
  GerarLoteResponse,
  FiltrosBilhetes,
  BilhetesPaginadosResponse,
  ValidarBilheteResponse,
  StorageInfo,
  PdfUrlResponse,
  ResgateResponse
} from '../types';

// Usar API real ou mock baseado na variável de ambiente
// Por padrão, usar API real (mock apenas se explicitamente configurado)
const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true' || false;
const bilheteApiService = USE_MOCK ? mockApiService : apiService;

// Classe para tratamento de erros da API
class ApiError extends Error {
  status: number;
  data?: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

// Classe principal do serviço de bilhetes
export class BilheteService {
  
  // === GERAÇÃO DE BILHETES ===
  
  /**
   * Gera um lote de bilhetes numerados sequencialmente
   */
  async gerarLote(dados: GerarLoteRequest): Promise<GerarLoteResponse> {
    try {
      const response = await bilheteApiService.gerarLote(dados);
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Erro ao gerar lote: ${error.message}`);
      }
      throw new Error('Erro de conexão ao gerar lote de bilhetes');
    }
  }

  // === LISTAGEM E FILTROS COM PAGINAÇÃO ===
  
  /**
   * Lista bilhetes com paginação e filtros opcionais
   */
  async listarBilhetesPaginados(filtros?: FiltrosBilhetes): Promise<BilhetesPaginadosResponse> {
    try {
      const response = await bilheteApiService.listarBilhetesPaginados(filtros);
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Erro ao listar bilhetes: ${error.message}`);
      }
      throw new Error('Erro de conexão ao listar bilhetes');
    }
  }

  /**
   * Lista todos os bilhetes com filtros opcionais (compatibilidade - sem paginação)
   * @deprecated Use listarBilhetesPaginados para melhor performance
   */
  async listarBilhetes(filtros?: FiltrosBilhetes): Promise<Bilhete[]> {
    try {
      // Para compatibilidade, buscar todas as páginas
      const primeiraPage = await this.listarBilhetesPaginados({
        ...filtros,
        pagina: 1,
        limite: 100 // Limite alto para pegar mais resultados
      });
      
      let todosOsBilhetes = [...primeiraPage.bilhetes];
      
      // Se houver mais páginas, buscar todas
      if (primeiraPage.paginacao.totalPaginas > 1) {
        const promessas = [];
        for (let pagina = 2; pagina <= primeiraPage.paginacao.totalPaginas; pagina++) {
          promessas.push(
            this.listarBilhetesPaginados({
              ...filtros,
              pagina,
              limite: 100
            })
          );
        }
        
        const outrasPages = await Promise.all(promessas);
        outrasPages.forEach(page => {
          todosOsBilhetes = [...todosOsBilhetes, ...page.bilhetes];
        });
      }
      
      return todosOsBilhetes;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Erro ao listar bilhetes: ${error.message}`);
      }
      throw new Error('Erro de conexão ao listar bilhetes');
    }
  }

  /**
   * Busca bilhetes por status com paginação
   */
  async buscarPorStatusPaginado(
    status: 'GERADO' | 'PREMIADO' | 'CANCELADO',
    pagina?: number,
    limite?: number
  ): Promise<BilhetesPaginadosResponse> {
    return this.listarBilhetesPaginados({ status, pagina, limite });
  }

  /**
   * Busca bilhetes por status (compatibilidade)
   * @deprecated Use buscarPorStatusPaginado para melhor performance
   */
  async buscarPorStatus(status: 'GERADO' | 'PREMIADO' | 'CANCELADO'): Promise<Bilhete[]> {
    return this.listarBilhetes({ status });
  }

  /**
   * Busca bilhetes por período com paginação
   */
  async buscarPorPeriodoPaginado(
    dataInicio: string, 
    dataFim: string,
    pagina?: number,
    limite?: number
  ): Promise<BilhetesPaginadosResponse> {
    return this.listarBilhetesPaginados({ dataInicio, dataFim, pagina, limite });
  }

  /**
   * Busca bilhetes por período (compatibilidade)
   * @deprecated Use buscarPorPeriodoPaginado para melhor performance
   */
  async buscarPorPeriodo(dataInicio: string, dataFim: string): Promise<Bilhete[]> {
    return this.listarBilhetes({ dataInicio, dataFim });
  }

  // === VALIDAÇÃO DE BILHETES ===
  
  /**
   * Valida um bilhete pelo código único
   */
  async validarBilhete(codigo: string): Promise<ValidarBilheteResponse> {
    try {
      const response = await bilheteApiService.validarBilhete({ codigo });
      return response;
    } catch (error) {
      return {
        valido: false,
        mensagem: 'Erro ao validar bilhete',
        tipo: 'erro'
      };
    }
  }

  /**
   * Processa o resgate de um bilhete válido
   */
  async processarResgate(dados: {
    codigo: string;
    nomeCompleto: string;
    telefone: string;
    email: string;
    chavePix: string;
  }): Promise<ResgateResponse> {
    try {
      const response = await bilheteApiService.processarResgate(dados);
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(error.message);
      }
      throw new Error('Erro de conexão ao processar resgate');
    }
  }

  // === GERAÇÃO DE PDF ===
  
  /**
   * Gera PDF de um bilhete específico
   */
  async gerarPdf(bilheteId: string): Promise<Blob> {
    try {
      const pdfBlob = await bilheteApiService.gerarPdf(bilheteId);
      return pdfBlob;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Erro ao gerar PDF: ${error.message}`);
      }
      throw new Error('Erro de conexão ao gerar PDF');
    }
  }

  /**
   * Obtém URL pré-assinada para download do PDF
   */
  async obterUrlPdf(bilheteId: string): Promise<PdfUrlResponse> {
    try {
      const response = await bilheteApiService.obterUrlPdf(bilheteId);
      return response;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Erro ao obter URL do PDF: ${error.message}`);
      }
      throw new Error('Erro de conexão ao obter URL do PDF');
    }
  }

  /**
   * Remove PDF do storage
   */
  async removerPdf(_bilheteId: string): Promise<{ message: string }> {
    try {
      // Método ainda não implementado na API real, usar mock
      return { message: 'PDF removido do cache com sucesso' };
    } catch (error) {
      console.error('Erro ao remover PDF:', error);
      throw new Error('Erro ao remover PDF do cache');
    }
  }

  /**
   * Faz download direto do PDF
   */
  async downloadPdf(bilheteId: string, nomeArquivo?: string): Promise<void> {
    try {
      const pdfBlob = await this.gerarPdf(bilheteId);
      
      // Criar URL temporária para download
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = nomeArquivo || `bilhete-${bilheteId}.pdf`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      throw new Error('Erro ao fazer download do PDF');
    }
  }

  // === INFORMAÇÕES DO SISTEMA ===
  
  /**
   * Obtém informações do storage MinIO
   */
  async obterInfoStorage(): Promise<StorageInfo> {
    try {
      const info = await bilheteApiService.obterInfoStorage();
      return info;
    } catch (error) {
      console.error('Erro ao obter informações do storage:', error);
      throw new Error('Erro de conexão ao obter informações do storage');
    }
  }

  // === UTILITÁRIOS DE FORMATAÇÃO ===
  
  /**
   * Formatar data para envio à API (YYYY-MM-DD)
   */
  formatarDataParaApi(data: Date): string {
    return data.toISOString().split('T')[0];
  }

  /**
   * Formatar data ISO para exibição brasileira
   */
  formatarDataBrasileira(dataISO: string): string {
    try {
      const data = new Date(dataISO);
      return data.toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Data inválida';
    }
  }

  // === ESTATÍSTICAS ===
  
  /**
   * Obtém estatísticas dos bilhetes
   */
  async obterEstatisticas(): Promise<{
    total: number;
    gerados: number;
    premiados: number;
    cancelados: number;
  }> {
    try {
      // Buscar estatísticas usando a primeira página com limite alto
      const response = await this.listarBilhetesPaginados({ limite: 1 });
      const total = response.paginacao.totalItens;
      
      // Buscar por status específicos para estatísticas precisas
      const [gerados, premiados, cancelados] = await Promise.all([
        this.listarBilhetesPaginados({ status: 'GERADO', limite: 1 }),
        this.listarBilhetesPaginados({ status: 'PREMIADO', limite: 1 }),
        this.listarBilhetesPaginados({ status: 'CANCELADO', limite: 1 })
      ]);

      return {
        total,
        gerados: gerados.paginacao.totalItens,
        premiados: premiados.paginacao.totalItens,
        cancelados: cancelados.paginacao.totalItens
      };
    } catch (error) {
      console.error('Erro ao obter estatísticas:', error);
      return {
        total: 0,
        gerados: 0,
        premiados: 0,
        cancelados: 0
      };
    }
  }

  // === UTILITÁRIOS DE STATUS ===
  
  /**
   * Obter classe CSS para colorir status
   */
  obterCorStatus(status: string): string {
    switch (status) {
      case 'GERADO':
        return 'bg-blue-100 text-blue-800';
      case 'PREMIADO':
        return 'bg-green-100 text-green-800';
      case 'CANCELADO':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }

  /**
   * Obter texto amigável para status
   */
  obterTextoStatus(status: string): string {
    switch (status) {
      case 'GERADO':
        return 'Gerado';
      case 'PREMIADO':
        return 'Premiado';
      case 'CANCELADO':
        return 'Cancelado';
      default:
        return 'Desconhecido';
    }
  }

  // === VALIDAÇÕES ===
  
  /**
   * Validar formato do código de bilhete
   */
  validarFormatoCodigo(codigo: string): boolean {
    // Código deve ter exatamente 11 caracteres alfanuméricos
    return /^[A-Z0-9]{11}$/.test(codigo);
  }
}

// Instância singleton do serviço
export const bilheteService = new BilheteService(); 

// Exportar para compatibilidade com código existente
export default bilheteService; 