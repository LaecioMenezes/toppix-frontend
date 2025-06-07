import React, { useState, useEffect, useMemo, useRef } from 'react';
import { List, Search, Filter, Download, FileText, Eye, Loader2, BarChart3, TrendingUp, Users, Clock, Upload, X, CheckCircle, AlertCircle } from 'lucide-react';
import { useBilhetes } from '../../hooks/useBilhetes';
import type { StatusBilhete, FiltrosBilhetes } from '../../types';

// Hook para debounce
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export function ListarBilhetes() {
  const [filtros, setFiltros] = useState<FiltrosBilhetes>({});
  const [codigoFiltro, setCodigoFiltro] = useState('');
  const [prefixoFiltro, setPrefixoFiltro] = useState('');
  const [modalImportOpen, setModalImportOpen] = useState(false);
  const [importandoCSV, setImportandoCSV] = useState(false);
  const [resultadoImport, setResultadoImport] = useState<{
    success: boolean;
    message: string;
    detalhes?: { importados: number; erros: number };
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { 
    bilhetes, 
    listarBilhetes, 
    exportarBilhetes, 
    visualizarPDF, 
    carregando 
  } = useBilhetes();

  // Debounce dos filtros de busca
  const debouncedCodigo = useDebounce(codigoFiltro, 500);
  const debouncedPrefixo = useDebounce(prefixoFiltro, 500);

  // Opções para o select de status
  const statusOptions = [
    { value: '', label: 'Todos os status' },
    { value: 'ativo', label: 'Ativo' },
    { value: 'premiado', label: 'Premiado' },
    { value: 'expirado', label: 'Expirado' },
    { value: 'inativo', label: 'Inativo' },
  ];

  // Aplicar filtros
  useEffect(() => {
    const novosFiltros: FiltrosBilhetes = {};
    
    if (debouncedCodigo) novosFiltros.codigo = debouncedCodigo;
    if (debouncedPrefixo) novosFiltros.prefixo = debouncedPrefixo;
    if (filtros.status) novosFiltros.status = filtros.status;
    
    listarBilhetes(novosFiltros);
  }, [debouncedCodigo, debouncedPrefixo, filtros.status, listarBilhetes]);

  // Carregar bilhetes iniciais
  useEffect(() => {
    listarBilhetes();
  }, []);

  const handleStatusChange = (status: string) => {
    setFiltros(prev => ({
      ...prev,
      status: status as StatusBilhete || undefined,
    }));
  };

  const handleExportarCSV = async () => {
    await exportarBilhetes({
      filtros,
      formato: 'csv',
    });
  };

  const handleExportarPDFs = async () => {
    await exportarBilhetes({
      filtros,
      formato: 'pdf-zip',
    });
  };

  const handleVisualizarPDF = async (bilheteId: string) => {
    await visualizarPDF(bilheteId);
  };

  const handleImportarCSV = async (file: File) => {
    setImportandoCSV(true);
    setResultadoImport(null);

    try {
      const text = await file.text();
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      // Validar cabeçalhos esperados
      const headersEsperados = ['Número', 'Código', 'Status', 'Valor'];
      const headersValidos = headersEsperados.every(h => headers.includes(h));
      
      if (!headersValidos) {
        throw new Error(`Cabeçalhos inválidos. Esperado: ${headersEsperados.join(', ')}`);
      }

      let importados = 0;
      let erros = 0;

      // Processar cada linha (pular cabeçalho)
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        try {
          const values = line.split(',').map(v => v.trim());
          const bilheteData: any = {};
          
          headers.forEach((header, index) => {
            bilheteData[header] = values[index];
          });

          // Validar dados obrigatórios
          if (!bilheteData['Número'] || !bilheteData['Código']) {
            erros++;
            continue;
          }

          // Validar status (deve ser um dos valores válidos)
          const statusValidos = ['Ativo', 'Premiado', 'Expirado', 'Inativo'];
          if (bilheteData['Status'] && !statusValidos.includes(bilheteData['Status'])) {
            console.warn(`Status inválido na linha ${i + 1}: ${bilheteData['Status']}`);
          }

          // Simular importação (aqui você chamaria a API real)
          console.log('Importando bilhete:', bilheteData);
          importados++;
          
        } catch (error) {
          console.error(`Erro na linha ${i + 1}:`, error);
          erros++;
        }
      }

      setResultadoImport({
        success: true,
        message: 'Importação concluída com sucesso!',
        detalhes: { importados, erros }
      });

      // Recarregar lista de bilhetes
      listarBilhetes();

    } catch (error) {
      console.error('Erro ao importar CSV:', error);
      setResultadoImport({
        success: false,
        message: error instanceof Error ? error.message : 'Erro ao processar arquivo CSV'
      });
    } finally {
      setImportandoCSV(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        setResultadoImport({
          success: false,
          message: 'Por favor, selecione um arquivo CSV válido'
        });
        return;
      }
      handleImportarCSV(file);
    }
  };

  const abrirModalImport = () => {
    setModalImportOpen(true);
    setResultadoImport(null);
  };

  const fecharModalImport = () => {
    setModalImportOpen(false);
    setResultadoImport(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getStatusBadge = (status: StatusBilhete) => {
    const styles = {
      ativo: { backgroundColor: '#3b82f6', color: 'white' },
      premiado: { backgroundColor: '#22c55e', color: 'white' },
      expirado: { backgroundColor: '#ef4444', color: 'white' },
      inativo: { backgroundColor: '#9ca3af', color: 'white' },
    };

    const labels = {
      ativo: 'Ativo',
      premiado: 'Premiado',
      expirado: 'Expirado',
      inativo: 'Inativo',
    };

    return (
      <span 
        style={{
          display: 'inline-flex',
          padding: '4px 12px',
          fontSize: '12px',
          fontWeight: 'bold',
          borderRadius: '9999px',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          ...styles[status]
        }}
        data-testid={`status-badge-${status}`}
      >
        {labels[status]}
      </span>
    );
  };

  // Estatísticas
  const estatisticas = useMemo(() => {
    return {
      total: bilhetes.length,
      ativos: bilhetes.filter(b => b.status === 'ativo').length,
      premiados: bilhetes.filter(b => b.status === 'premiado').length,
      expirados: bilhetes.filter(b => b.status === 'expirado').length,
    };
  }, [bilhetes]);

  // Calcular porcentagens
  const porcentagens = useMemo(() => {
    const total = estatisticas.total || 1;
    return {
      ativos: Math.round((estatisticas.ativos / total) * 100),
      premiados: Math.round((estatisticas.premiados / total) * 100),
      expirados: Math.round((estatisticas.expirados / total) * 100),
    };
  }, [estatisticas]);

  return (
    <div style={{ 
      minHeight: '100vh', 
      padding: '24px', 
      background: 'linear-gradient(135deg, #eff6ff 0%, #f1f5f9 100%)',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '80px',
            height: '80px',
            backgroundColor: '#3b82f6',
            borderRadius: '50%',
            marginBottom: '24px',
            boxShadow: '0 8px 24px rgba(59, 130, 246, 0.3)'
          }}>
            <BarChart3 style={{ width: '40px', height: '40px', color: 'white' }} />
          </div>
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: 'bold', 
            color: '#1f2937', 
            marginBottom: '16px',
            lineHeight: 1.2
          }}>
            Bilhetes Gerados
          </h1>
          <p style={{ 
            fontSize: '20px', 
            color: '#6b7280', 
            maxWidth: '512px', 
            margin: '0 auto' 
          }}>
            Visualize, filtre e gerencie todos os bilhetes da sua promoção
          </p>
        </div>

        {/* Estatísticas Cards */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
          gap: '24px', 
          marginBottom: '32px' 
        }}>
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#3b82f6',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <List style={{ width: '24px', height: '24px', color: 'white' }} />
              </div>
              <span style={{ fontSize: '24px' }}>📊</span>
            </div>
            <p style={{ fontSize: '30px', fontWeight: 'bold', color: '#1f2937', marginBottom: '4px' }}>
              {estatisticas.total}
            </p>
            <p style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Total de Bilhetes</p>
          </div>

          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#2563eb',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <TrendingUp style={{ width: '24px', height: '24px', color: 'white' }} />
              </div>
              <span style={{
                fontSize: '12px',
                backgroundColor: '#dbeafe',
                color: '#2563eb',
                padding: '4px 8px',
                borderRadius: '12px',
                fontWeight: 'bold'
              }}>
                {porcentagens.ativos}%
              </span>
            </div>
            <p style={{ fontSize: '30px', fontWeight: 'bold', color: '#2563eb', marginBottom: '4px' }}>
              {estatisticas.ativos}
            </p>
            <p style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Ativos</p>
          </div>

          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#22c55e',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Users style={{ width: '24px', height: '24px', color: 'white' }} />
              </div>
              <span style={{
                fontSize: '12px',
                backgroundColor: '#dcfce7',
                color: '#16a34a',
                padding: '4px 8px',
                borderRadius: '12px',
                fontWeight: 'bold'
              }}>
                {porcentagens.premiados}%
              </span>
            </div>
            <p style={{ fontSize: '30px', fontWeight: 'bold', color: '#16a34a', marginBottom: '4px' }}>
              {estatisticas.premiados}
            </p>
            <p style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Premiados</p>
          </div>

          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '24px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{
                width: '48px',
                height: '48px',
                backgroundColor: '#ef4444',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Clock style={{ width: '24px', height: '24px', color: 'white' }} />
              </div>
              <span style={{
                fontSize: '12px',
                backgroundColor: '#fee2e2',
                color: '#dc2626',
                padding: '4px 8px',
                borderRadius: '12px',
                fontWeight: 'bold'
              }}>
                {porcentagens.expirados}%
              </span>
            </div>
            <p style={{ fontSize: '30px', fontWeight: 'bold', color: '#dc2626', marginBottom: '4px' }}>
              {estatisticas.expirados}
            </p>
            <p style={{ fontSize: '14px', color: '#6b7280', fontWeight: '500' }}>Expirados</p>
          </div>
        </div>

        {/* Filtros */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          marginBottom: '24px'
        }}>
          <h2 style={{ 
            fontSize: '20px', 
            fontWeight: 'bold', 
            color: '#1f2937', 
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Filter style={{ width: '20px', height: '20px', color: '#3b82f6' }} />
            Filtros
          </h2>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '16px' 
          }}>
            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600',
                color: '#374151',
                fontSize: '14px'
              }}>
                Buscar por código
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Digite o código..."
                  value={codigoFiltro}
                  onChange={(e) => setCodigoFiltro(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 40px',
                    border: '2px solid #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.2s'
                  }}
                  onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                  onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                />
                <Search style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '16px',
                  height: '16px',
                  color: '#6b7280'
                }} />
              </div>
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600',
                color: '#374151',
                fontSize: '14px'
              }}>
                Buscar por prefixo
              </label>
              <input
                type="text"
                placeholder="Digite o prefixo..."
                value={prefixoFiltro}
                onChange={(e) => setPrefixoFiltro(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color 0.2s'
                }}
                onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
              />
            </div>

            <div>
              <label style={{ 
                display: 'block', 
                marginBottom: '8px', 
                fontWeight: '600',
                color: '#374151',
                fontSize: '14px'
              }}>
                Status
              </label>
              <select
                value={filtros.status || ''}
                onChange={(e) => handleStatusChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px',
                  border: '2px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '14px',
                  outline: 'none',
                  backgroundColor: 'white',
                  cursor: 'pointer'
                }}
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Ações */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          padding: '24px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          marginBottom: '24px'
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
            <button
              onClick={abrirModalImport}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                backgroundColor: '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#7c3aed'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#8b5cf6'}
            >
              <Upload style={{ width: '16px', height: '16px' }} />
              Importar Bilhetes
            </button>
            
            <button
              onClick={handleExportarCSV}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                backgroundColor: '#22c55e',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#16a34a'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#22c55e'}
            >
              <Download style={{ width: '16px', height: '16px' }} />
              Exportar CSV
            </button>

            <button
              onClick={handleExportarPDFs}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                backgroundColor: '#ef4444',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#dc2626'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ef4444'}
            >
              <FileText style={{ width: '16px', height: '16px' }} />
              Exportar PDFs
            </button>

            <span style={{ color: '#6b7280', fontSize: '14px' }}>
              {estatisticas.total} bilhetes encontrados
            </span>
          </div>
        </div>

        {/* Tabela */}
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          backdropFilter: 'blur(10px)',
          borderRadius: '16px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
          overflow: 'hidden'
        }}>
          {carregando ? (
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              padding: '48px',
              gap: '12px' 
            }}>
              <Loader2 style={{ width: '24px', height: '24px', color: '#3b82f6', animation: 'spin 1s linear infinite' }} />
              <span style={{ color: '#6b7280' }}>Carregando bilhetes...</span>
            </div>
          ) : bilhetes.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '48px',
              color: '#6b7280'
            }}>
              <List style={{ width: '48px', height: '48px', margin: '0 auto 16px', color: '#d1d5db' }} />
              <p style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px' }}>
                Nenhum bilhete encontrado
              </p>
              <p>Tente ajustar os filtros ou gere novos bilhetes</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f8fafc' }}>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                      Número
                    </th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                      Código
                    </th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                      Status
                    </th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                      Valor
                    </th>
                    <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                      Data
                    </th>
                    <th style={{ padding: '16px', textAlign: 'center', fontWeight: '600', color: '#374151', borderBottom: '1px solid #e5e7eb' }}>
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {bilhetes.map((bilhete) => (
                    <tr key={bilhete.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '16px', color: '#1f2937', fontFamily: 'monospace' }}>
                        {bilhete.numero}
                      </td>
                      <td style={{ padding: '16px', color: '#1f2937', fontFamily: 'monospace' }}>
                        {bilhete.codigo}
                      </td>
                      <td style={{ padding: '16px' }}>
                        {getStatusBadge(bilhete.status)}
                      </td>
                      <td style={{ padding: '16px', color: '#1f2937' }}>
                        {bilhete.valor ? new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL',
                        }).format(bilhete.valor) : '-'}
                      </td>
                      <td style={{ padding: '16px', color: '#6b7280' }}>
                        {bilhete.dataCriacao.toLocaleDateString('pt-BR')}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <button
                          onClick={() => handleVisualizarPDF(bilhete.id)}
                          style={{
                            padding: '8px',
                            backgroundColor: '#3b82f6',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'background-color 0.2s'
                          }}
                          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
                          title="Visualizar PDF"
                        >
                          <Eye style={{ width: '16px', height: '16px' }} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal de Importação */}
        {modalImportOpen && (
          <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 50,
            padding: '16px'
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '32px',
              maxWidth: '500px',
              width: '100%',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              position: 'relative'
            }}>
              {/* Header do Modal */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '24px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                  Importar Bilhetes
                </h3>
                <button
                  onClick={fecharModalImport}
                  style={{
                    padding: '8px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <X style={{ width: '20px', height: '20px', color: '#6b7280' }} />
                </button>
              </div>

              {/* Instruções */}
              <div style={{ marginBottom: '24px' }}>
                <p style={{ color: '#6b7280', marginBottom: '16px' }}>
                  Selecione um arquivo CSV com os bilhetes para importar. O arquivo deve conter as seguintes colunas:
                </p>
                <div style={{
                  backgroundColor: '#f8fafc',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #e2e8f0',
                  marginBottom: '16px'
                }}>
                  <p style={{ fontFamily: 'monospace', fontSize: '14px', color: '#1f2937', margin: 0, marginBottom: '12px' }}>
                    <strong>Cabeçalhos esperados:</strong><br />
                    Número, Código, Status, Valor
                  </p>
                  <p style={{ fontFamily: 'monospace', fontSize: '12px', color: '#6b7280', margin: 0 }}>
                    <strong>Exemplo:</strong><br />
                    Número,Código,Status,Valor<br />
                    000001,GANHADOR-ABC123,Premiado,100.00<br />
                    000002,GANHADOR-DEF456,Ativo,<br />
                    000003,GANHADOR-GHI789,Expirado,50.00
                  </p>
                </div>
                <div style={{
                  backgroundColor: '#fef3c7',
                  padding: '12px',
                  borderRadius: '8px',
                  border: '1px solid #fbbf24'
                }}>
                  <p style={{ fontSize: '12px', color: '#92400e', margin: 0 }}>
                    <strong>⚠️ Importante:</strong> Os valores de Status devem ser: Ativo, Premiado, Expirado ou Inativo. O campo Valor pode ficar vazio.
                  </p>
                </div>
              </div>

              {/* Input de Arquivo */}
              <div style={{ marginBottom: '24px' }}>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  disabled={importandoCSV}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px dashed #d1d5db',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: importandoCSV ? 'not-allowed' : 'pointer',
                    backgroundColor: importandoCSV ? '#f9fafb' : 'white'
                  }}
                />
              </div>

              {/* Loading */}
              {importandoCSV && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '12px',
                  padding: '16px',
                  backgroundColor: '#eff6ff',
                  borderRadius: '8px',
                  marginBottom: '16px'
                }}>
                  <Loader2 style={{ width: '20px', height: '20px', color: '#3b82f6', animation: 'spin 1s linear infinite' }} />
                  <span style={{ color: '#3b82f6', fontWeight: '500' }}>Processando arquivo...</span>
                </div>
              )}

              {/* Resultado */}
              {resultadoImport && (
                <div style={{
                  padding: '16px',
                  borderRadius: '8px',
                  backgroundColor: resultadoImport.success ? '#f0fdf4' : '#fef2f2',
                  border: `1px solid ${resultadoImport.success ? '#bbf7d0' : '#fecaca'}`,
                  marginBottom: '16px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                    {resultadoImport.success ? (
                      <CheckCircle style={{ width: '20px', height: '20px', color: '#22c55e' }} />
                    ) : (
                      <AlertCircle style={{ width: '20px', height: '20px', color: '#ef4444' }} />
                    )}
                    <span style={{
                      fontWeight: 'bold',
                      color: resultadoImport.success ? '#16a34a' : '#dc2626'
                    }}>
                      {resultadoImport.message}
                    </span>
                  </div>
                  {resultadoImport.detalhes && (
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>
                      <p style={{ margin: 0 }}>
                        ✅ Importados: {resultadoImport.detalhes.importados}
                      </p>
                      <p style={{ margin: 0 }}>
                        ❌ Erros: {resultadoImport.detalhes.erros}
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* Botões */}
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  onClick={fecharModalImport}
                  style={{
                    padding: '12px 16px',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#4b5563'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#6b7280'}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}

      </div>

      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
} 