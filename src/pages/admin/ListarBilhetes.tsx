import { useState, useEffect } from 'react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Select } from '../../components/Select';
import { Card } from '../../components/Card';
import { bilheteService } from '../../services/bilheteService';
import type { Bilhete, FiltrosBilhetes, StatusBilhete } from '../../types';

export function ListarBilhetes() {
  const [bilhetes, setBilhetes] = useState<Bilhete[]>([]);
  const [filtros, setFiltros] = useState<FiltrosBilhetes>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPdf, setIsLoadingPdf] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  // Estados para filtros
  const [filtroStatus, setFiltroStatus] = useState<StatusBilhete | ''>('');
  const [filtroDataInicio, setFiltroDataInicio] = useState<string>('');
  const [filtroDataFim, setFiltroDataFim] = useState<string>('');

  // Carregar bilhetes na inicialização
  useEffect(() => {
    carregarBilhetes();
  }, []);

  const carregarBilhetes = async (filtrosAplicados?: FiltrosBilhetes) => {
    setIsLoading(true);
    setErro(null);

    try {
      const bilhetesCarregados = await bilheteService.listarBilhetes(filtrosAplicados);
      setBilhetes(bilhetesCarregados);
    } catch (error) {
      console.error('Erro ao carregar bilhetes:', error);
      setErro(error instanceof Error ? error.message : 'Erro ao carregar bilhetes');
    } finally {
      setIsLoading(false);
    }
  };

  const aplicarFiltros = () => {
    const novosFiltros: FiltrosBilhetes = {};
    
    if (filtroStatus) novosFiltros.status = filtroStatus;
    if (filtroDataInicio) novosFiltros.dataInicio = filtroDataInicio;
    if (filtroDataFim) novosFiltros.dataFim = filtroDataFim;

    setFiltros(novosFiltros);
    carregarBilhetes(novosFiltros);
  };

  const limparFiltros = () => {
    setFiltroStatus('');
    setFiltroDataInicio('');
    setFiltroDataFim('');
    setFiltros({});
    carregarBilhetes();
  };

  const downloadPdf = async (bilhete: Bilhete) => {
    setIsLoadingPdf(bilhete.id);
    
    try {
      await bilheteService.downloadPdf(
        bilhete.id, 
        `${bilhete.numeroSequencial.replace(/\s+/g, '_')}.pdf`
      );
    } catch (error) {
      console.error('Erro ao fazer download do PDF:', error);
      alert('Erro ao fazer download do PDF');
    } finally {
      setIsLoadingPdf(null);
    }
  };

  const obterUrlPdf = async (bilhete: Bilhete) => {
    try {
      const response = await bilheteService.obterUrlPdf(bilhete.id);
      
      // Abrir URL em nova aba
      window.open(response.url, '_blank');
    } catch (error) {
      console.error('Erro ao obter URL do PDF:', error);
      alert('Erro ao obter URL do PDF');
    }
  };

  const formatarData = (dataISO: string): string => {
    return bilheteService.formatarDataBrasileira(dataISO);
  };

  const statusOptions = [
    { value: '', label: 'Todos os status' },
    { value: 'GERADO', label: 'Gerado' },
    { value: 'PREMIADO', label: 'Premiado' },
    { value: 'CANCELADO', label: 'Cancelado' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Listar Bilhetes
        </h1>
        <p className="mt-2 text-gray-600">
          Visualize e gerencie todos os bilhetes criados
        </p>
      </div>

      {/* Filtros */}
      <Card>
        <h3 className="font-semibold text-gray-900 mb-4">🔍 Filtros</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <Select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value as StatusBilhete | '')}
              options={statusOptions}
            />
          </div>

          {/* Data Início */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Início
            </label>
            <Input
              type="date"
              value={filtroDataInicio}
              onChange={(e) => setFiltroDataInicio(e.target.value)}
            />
          </div>

          {/* Data Fim */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data Fim
            </label>
            <Input
              type="date"
              value={filtroDataFim}
              onChange={(e) => setFiltroDataFim(e.target.value)}
            />
          </div>

          {/* Botões */}
          <div className="flex items-end space-x-2">
            <Button
              onClick={aplicarFiltros}
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2"
            >
              Aplicar
            </Button>
            <Button
              onClick={limparFiltros}
              disabled={isLoading}
              variant="secondary"
              className="px-4 py-2"
            >
              Limpar
            </Button>
          </div>
        </div>

        {/* Contador de resultados */}
        <div className="text-sm text-gray-600">
          {isLoading ? 'Carregando...' : `${bilhetes.length} bilhete(s) encontrado(s)`}
        </div>
      </Card>

      {/* Mensagem de erro */}
      {erro && (
        <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
          <div className="flex items-center justify-between">
            <span>❌ {erro}</span>
            <button
              onClick={() => setErro(null)}
              className="text-red-600 hover:text-red-800"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Lista de bilhetes */}
      <Card>
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-gray-600">Carregando bilhetes...</span>
            </div>
          </div>
        ) : bilhetes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎫</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Nenhum bilhete encontrado
            </h3>
            <p className="text-gray-600">
              {Object.keys(filtros).length > 0 
                ? 'Tente ajustar os filtros ou limpar a busca'
                : 'Gere alguns bilhetes para começar'
              }
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Número
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Código Único
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Criado em
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bilhetes.map((bilhete) => (
                  <tr key={bilhete.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {bilhete.numeroSequencial}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-600">
                        {bilhete.codigoUnico}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`
                        inline-flex px-2 py-1 text-xs font-semibold rounded-full
                        ${bilheteService.obterCorStatus(bilhete.status)}
                      `}>
                        {bilheteService.obterTextoStatus(bilhete.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {formatarData(bilhete.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => downloadPdf(bilhete)}
                        disabled={isLoadingPdf === bilhete.id}
                        className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                        title="Download PDF"
                      >
                        {isLoadingPdf === bilhete.id ? (
                          <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          '📄'
                        )}
                      </button>
                      
                      <button
                        onClick={() => obterUrlPdf(bilhete)}
                        className="text-green-600 hover:text-green-900"
                        title="Abrir PDF em nova aba"
                      >
                        🔗
                      </button>
                      
                      <button
                        onClick={() => navigator.clipboard.writeText(bilhete.codigoUnico)}
                        className="text-gray-600 hover:text-gray-900"
                        title="Copiar código"
                      >
                        📋
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Estatísticas */}
      {bilhetes.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {bilhetes.length}
            </div>
            <div className="text-sm text-gray-600">Total</div>
          </Card>
          
          <Card className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {bilhetes.filter(b => b.status === 'GERADO').length}
            </div>
            <div className="text-sm text-gray-600">Gerados</div>
          </Card>
          
          <Card className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {bilhetes.filter(b => b.status === 'PREMIADO').length}
            </div>
            <div className="text-sm text-gray-600">Premiados</div>
          </Card>
          
          <Card className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {bilhetes.filter(b => b.status === 'CANCELADO').length}
            </div>
            <div className="text-sm text-gray-600">Cancelados</div>
          </Card>
        </div>
      )}
    </div>
  );
} 