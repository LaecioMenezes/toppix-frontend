import { useCallback } from 'react';
import { useBilhete } from '../contexts/BilheteContext';
import { currentBilheteService } from '../services/bilheteService';
import type { 
  GerarBilhetesRequest, 
  ValidarBilheteRequest, 
  FiltrosBilhetes,
  ExportarBilhetesRequest 
} from '../types';

export function useBilhetes() {
  const { state, actions } = useBilhete();

  // Gerar bilhetes
  const gerarBilhetes = useCallback(async (dados: GerarBilhetesRequest) => {
    actions.setLoading(true);
    actions.setError(null);

    try {
      const response = await currentBilheteService.gerarBilhetes(dados);
      
      if (response.sucesso && response.dados) {
        actions.addBilhetes(response.dados);
        return {
          sucesso: true,
          mensagem: response.mensagem || 'Bilhetes gerados com sucesso!',
          dados: response.dados
        };
      } else {
        throw new Error(response.mensagem || 'Erro ao gerar bilhetes');
      }
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : 'Erro desconhecido';
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

  // Listar bilhetes
  const listarBilhetes = useCallback(async (filtros?: FiltrosBilhetes) => {
    actions.setLoading(true);
    actions.setError(null);

    try {
      const response = await currentBilheteService.listarBilhetes(filtros);
      
      if (response.sucesso && response.dados) {
        actions.setBilhetes(response.dados);
        actions.setFiltros(filtros || {});
        return {
          sucesso: true,
          dados: response.dados
        };
      } else {
        throw new Error(response.mensagem || 'Erro ao listar bilhetes');
      }
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : 'Erro desconhecido';
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

  // Validar bilhete
  const validarBilhete = useCallback(async (dados: ValidarBilheteRequest) => {
    actions.setLoading(true);
    actions.setError(null);

    try {
      const resultado = await currentBilheteService.validarBilhete(dados);
      
      // Se o bilhete foi validado com sucesso, atualiza o estado
      if (resultado.valido && resultado.bilhete) {
        actions.updateBilhete(resultado.bilhete);
      }
      
      return resultado;
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : 'Erro desconhecido';
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

  // Exportar bilhetes
  const exportarBilhetes = useCallback(async (dados: ExportarBilhetesRequest) => {
    actions.setLoading(true);
    actions.setError(null);

    try {
      const blob = await currentBilheteService.exportarBilhetes(dados);
      
      // Criar URL para download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      
      const nomeArquivo = dados.formato === 'csv' 
        ? `bilhetes_${new Date().toISOString().split('T')[0]}.csv`
        : `bilhetes_${new Date().toISOString().split('T')[0]}.zip`;
      
      link.download = nomeArquivo;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

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

  // Visualizar PDF
  const visualizarPDF = useCallback(async (id: string) => {
    actions.setLoading(true);
    actions.setError(null);

    try {
      const blob = await currentBilheteService.visualizarPDF(id);
      
      // Abrir PDF em nova aba
      const url = window.URL.createObjectURL(blob);
      window.open(url, '_blank');
      
      // Limpar URL depois de um tempo
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 100);

      return {
        sucesso: true,
        mensagem: 'PDF aberto com sucesso!'
      };
    } catch (error) {
      const mensagem = error instanceof Error ? error.message : 'Erro ao visualizar PDF';
      actions.setError(mensagem);
      return {
        sucesso: false,
        mensagem
      };
    } finally {
      actions.setLoading(false);
    }
  }, [actions]);

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
    
    // Ações
    gerarBilhetes,
    listarBilhetes,
    validarBilhete,
    exportarBilhetes,
    visualizarPDF,
    atualizarFiltros,
    limparEstado,
  };
} 