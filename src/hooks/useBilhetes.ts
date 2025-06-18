import { useCallback } from 'react';
import { useBilhete } from '../contexts/BilheteContext';
import { bilheteService } from '../services/bilheteService';
import type { 
  GerarLoteRequest,
  ValidarBilheteRequest, 
  FiltrosBilhetes,
  ExportarBilhetesRequest
} from '../types';

export function useBilhetes() {
  const { state, actions } = useBilhete();

  // Gerar lote de bilhetes (nova API)
  const gerarLote = useCallback(async (dados: GerarLoteRequest) => {
    actions.setLoading(true);
    actions.setError(null);

    try {
      const response = await bilheteService.gerarLote(dados);
      
      return {
        sucesso: true,
        mensagem: `✅ Lote gerado com sucesso! ${response.quantidade} bilhetes criados com prefixo "${response.prefixo}"`,
        dados: response
      };
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : 'Erro ao gerar lote de bilhetes';
      actions.setError(mensagem);
      return {
        sucesso: false,
        mensagem,
        dados: null
      };
    } finally {
      actions.setLoading(false);
    }
  }, [actions]);

  // Listar bilhetes (nova API)
  const listarBilhetes = useCallback(async (filtros?: FiltrosBilhetes) => {
    actions.setLoading(true);
    actions.setError(null);

    try {
      const bilhetes = await bilheteService.listarBilhetes(filtros);
      
      actions.setBilhetes(bilhetes);
      actions.setFiltros(filtros || {});
      
      return {
        sucesso: true,
        dados: bilhetes
      };
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : 'Erro ao listar bilhetes';
      actions.setError(mensagem);
      return {
        sucesso: false,
        mensagem,
        dados: []
      };
    } finally {
      actions.setLoading(false);
    }
  }, [actions]);

  // Validar bilhete (nova API)
  const validarBilhete = useCallback(async (dados: ValidarBilheteRequest) => {
    actions.setLoading(true);
    actions.setError(null);

    try {
      const resultado = await bilheteService.validarBilhete(dados.codigo);
      
      // Se o bilhete foi validado com sucesso, atualiza o estado
      if (resultado.valido && resultado.bilhete) {
        actions.updateBilhete(resultado.bilhete);
      }
      
      return resultado;
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : 'Erro ao validar bilhete';
      actions.setError(mensagem);
      return {
        valido: false,
        mensagem,
        tipo: 'erro' as const
      };
    } finally {
      actions.setLoading(false);
    }
  }, [actions]);

  // Download PDF
  const downloadPdf = useCallback(async (bilheteId: string, nomeArquivo?: string) => {
    actions.setLoading(true);
    actions.setError(null);

    try {
      await bilheteService.downloadPdf(bilheteId, nomeArquivo);
      
      return {
        sucesso: true,
        mensagem: 'PDF baixado com sucesso!'
      };
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : 'Erro ao baixar PDF';
      actions.setError(mensagem);
      return {
        sucesso: false,
        mensagem
      };
    } finally {
      actions.setLoading(false);
    }
  }, [actions]);

  // Obter URL do PDF
  const obterUrlPdf = useCallback(async (bilheteId: string) => {
    actions.setLoading(true);
    actions.setError(null);

    try {
      const response = await bilheteService.obterUrlPdf(bilheteId);
      
      // Abrir URL em nova aba
      window.open(response.url, '_blank');
      
      return {
        sucesso: true,
        mensagem: 'PDF aberto com sucesso!',
        dados: response
      };
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : 'Erro ao obter URL do PDF';
      actions.setError(mensagem);
      return {
        sucesso: false,
        mensagem
      };
    } finally {
      actions.setLoading(false);
    }
  }, [actions]);

  // Exportar bilhetes (manter compatibilidade)
  const exportarBilhetes = useCallback(async (dados: ExportarBilhetesRequest) => {
    actions.setLoading(true);
    actions.setError(null);

    try {
      // Por enquanto, vamos simular a exportação usando a listagem
      const bilhetes = await bilheteService.listarBilhetes(dados.filtros);
      
      if (dados.formato === 'csv') {
        // Gerar CSV simples
        const csvHeader = 'ID,Numero,Codigo,Status,Criado em\n';
        const csvContent = bilhetes.map(bilhete => 
          `${bilhete.id},"${bilhete.numeroSequencial}","${bilhete.codigoUnico}","${bilhete.status}","${bilheteService.formatarDataBrasileira(bilhete.createdAt)}"`
        ).join('\n');
        
        const csvData = csvHeader + csvContent;
        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        
        // Criar URL para download
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `bilhetes_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }

      return {
        sucesso: true,
        mensagem: 'Arquivo exportado com sucesso!'
      };
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : 'Erro ao exportar bilhetes';
      actions.setError(mensagem);
      return {
        sucesso: false,
        mensagem
      };
    } finally {
      actions.setLoading(false);
    }
  }, [actions]);

  // Visualizar PDF (compatibilidade)
  const visualizarPDF = useCallback(async (id: string) => {
    return obterUrlPdf(id);
  }, [obterUrlPdf]);

  // Obter estatísticas
  const obterEstatisticas = useCallback(async () => {
    try {
      const estatisticas = await bilheteService.obterEstatisticas();
      return {
        sucesso: true,
        dados: estatisticas
      };
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : 'Erro ao obter estatísticas';
      return {
        sucesso: false,
        mensagem,
        dados: {
          total: 0,
          gerados: 0,
          premiados: 0,
          cancelados: 0
        }
      };
    }
  }, []);

  // Atualizar filtros
  const atualizarFiltros = useCallback((filtros: FiltrosBilhetes) => {
    actions.setFiltros(filtros);
  }, [actions]);

  // Limpar estado
  const limparEstado = useCallback(() => {
    actions.resetState();
  }, [actions]);

  return {
    // Estado
    bilhetes: state.bilhetes,
    filtros: state.filtros,
    carregando: state.carregando,
    erro: state.erro,
    total: state.total,
    
    // Ações da nova API
    gerarLote,
    listarBilhetes,
    validarBilhete,
    downloadPdf,
    obterUrlPdf,
    obterEstatisticas,
    
    // Ações de compatibilidade
    exportarBilhetes,
    visualizarPDF,
    atualizarFiltros,
    limparEstado,
    
    // Métodos de compatibilidade (mapeados para nova API)
    gerarBilhetes: gerarLote, // Para compatibilidade com código antigo
  };
} 