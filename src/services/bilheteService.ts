import { apiService, mockApiService } from './apiService';
import type { 
  Bilhete, 
  GerarLoteRequest,
  GerarLoteResponse,
  FiltrosBilhetes,
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

  // === LISTAGEM E FILTROS ===
  
  /**
   * Lista todos os bilhetes com filtros opcionais
   */
  async listarBilhetes(filtros?: FiltrosBilhetes): Promise<Bilhete[]> {
    try {
      const bilhetes = await bilheteApiService.listarBilhetes(filtros);
      return bilhetes;
    } catch (error) {
      if (error instanceof ApiError) {
        throw new Error(`Erro ao listar bilhetes: ${error.message}`);
      }
      throw new Error('Erro de conexão ao listar bilhetes');
    }
  }

  /**
   * Busca bilhetes por status
   */
  async buscarPorStatus(status: 'GERADO' | 'PREMIADO' | 'CANCELADO'): Promise<Bilhete[]> {
    return this.listarBilhetes({ status });
      }

  /**
   * Busca bilhetes por período
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
      if (error instanceof ApiError) {
        throw new Error(`Erro ao obter informações do storage: ${error.message}`);
      }
      throw new Error('Erro de conexão ao obter informações do storage');
    }
  }

  // === UTILITÁRIOS ===
  
  /**
   * Formata data para o formato aceito pela API (YYYY-MM-DD)
   */
  formatarDataParaApi(data: Date): string {
    return data.toISOString().split('T')[0];
  }

  /**
   * Converte data ISO para formato brasileiro
   */
  formatarDataBrasileira(dataISO: string): string {
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

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
      const bilhetes = await this.listarBilhetes();
      
      const estatisticas = {
        total: bilhetes.length,
        gerados: bilhetes.filter(b => b.status === 'GERADO').length,
        premiados: bilhetes.filter(b => b.status === 'PREMIADO').length,
        cancelados: bilhetes.filter(b => b.status === 'CANCELADO').length,
      };

      return estatisticas;
    } catch (error) {
      return {
        total: 0,
        gerados: 0,
        premiados: 0,
        cancelados: 0,
      };
    }
  }

  /**
   * Obtém cor do status para exibição
   */
  obterCorStatus(status: string): string {
    switch (status) {
      case 'GERADO':
        return 'text-blue-600 bg-blue-100';
      case 'PREMIADO':
        return 'text-green-600 bg-green-100';
      case 'CANCELADO':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
      }
  }

  /**
   * Obtém texto amigável do status
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

  /**
   * Valida se o código tem formato válido
   */
  validarFormatoCodigo(codigo: string): boolean {
    // Código deve ter pelo menos 3 caracteres e ser alfanumérico
    const regex = /^[A-Z0-9]{3,}$/;
    return regex.test(codigo.toUpperCase());
    }
  }

// Instância singleton do serviço
export const bilheteService = new BilheteService(); 

// Exportar para compatibilidade com código existente
export default bilheteService; 