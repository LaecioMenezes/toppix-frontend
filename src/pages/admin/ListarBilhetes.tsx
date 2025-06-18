import { useState, useEffect } from 'react';
import { bilheteService } from '../../services/bilheteService';
import type { Bilhete, FiltrosBilhetes, StatusBilhete, MetadadosPaginacao } from '../../types';

export function ListarBilhetes() {
  const [bilhetes, setBilhetes] = useState<Bilhete[]>([]);
  const [paginacao, setPaginacao] = useState<MetadadosPaginacao | null>(null);
  const [filtros, setFiltros] = useState<FiltrosBilhetes>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingPdf, setIsLoadingPdf] = useState<string | null>(null);
  const [erro, setErro] = useState<string | null>(null);

  // Estados para filtros
  const [filtroStatus, setFiltroStatus] = useState<StatusBilhete | ''>('');
  const [filtroDataInicio, setFiltroDataInicio] = useState<string>('');
  const [filtroDataFim, setFiltroDataFim] = useState<string>('');
  
  // Estado para paginação
  const [paginaAtual, setPaginaAtual] = useState<number>(1);
  const [itensPorPagina, setItensPorPagina] = useState<number>(10);

  // Estados para marcar como pago
  const [modalPagoAberto, setModalPagoAberto] = useState(false);
  const [bilheteSelecionado, setBilheteSelecionado] = useState<Bilhete | null>(null);
  const [observacoesPagamento, setObservacoesPagamento] = useState('');
  const [isLoadingPagamento, setIsLoadingPagamento] = useState(false);

  // Carregar bilhetes na inicialização
  useEffect(() => {
    carregarBilhetes();
  }, []);

  const carregarBilhetes = async (filtrosAplicados?: FiltrosBilhetes, pagina?: number) => {
    setIsLoading(true);
    setErro(null);

    try {
      const response = await bilheteService.listarBilhetesPaginados({
        ...filtrosAplicados,
        pagina: pagina || paginaAtual,
        limite: itensPorPagina
      });
      setBilhetes(response.bilhetes);
      setPaginacao(response.paginacao);
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
    setPaginaAtual(1); // Resetar para primeira página ao aplicar filtros
    carregarBilhetes(novosFiltros, 1);
  };

  const limparFiltros = () => {
    setFiltroStatus('');
    setFiltroDataInicio('');
    setFiltroDataFim('');
    setFiltros({});
    setPaginaAtual(1);
    carregarBilhetes({}, 1);
  };

  const irParaPagina = (novaPagina: number) => {
    setPaginaAtual(novaPagina);
    carregarBilhetes(filtros, novaPagina);
  };

  const alterarItensPorPagina = (novoLimite: number) => {
    setItensPorPagina(novoLimite);
    setPaginaAtual(1);
    carregarBilhetes(filtros, 1);
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

  const formatarData = (dataISO: string): string => {
    return bilheteService.formatarDataBrasileira(dataISO);
  };

  const copiarCodigo = async (codigo: string) => {
    try {
      await navigator.clipboard.writeText(codigo);
      // Feedback visual simples
      const button = document.activeElement as HTMLButtonElement;
      if (button) {
        const originalText = button.textContent;
        button.textContent = '✓';
        setTimeout(() => {
          button.textContent = originalText;
        }, 1000);
      }
    } catch (error) {
      console.error('Erro ao copiar código:', error);
    }
  };

  const abrirModalPagamento = (bilhete: Bilhete) => {
    setBilheteSelecionado(bilhete);
    setObservacoesPagamento('');
    setModalPagoAberto(true);
  };

  const fecharModalPagamento = () => {
    setModalPagoAberto(false);
    setBilheteSelecionado(null);
    setObservacoesPagamento('');
  };

  const confirmarPagamento = async () => {
    if (!bilheteSelecionado) return;

    setIsLoadingPagamento(true);
    
    try {
      await bilheteService.marcarComoPago(
        bilheteSelecionado.id,
        observacoesPagamento.trim() || undefined
      );
      
      // Recarregar bilhetes para atualizar a lista
      await carregarBilhetes(filtros, paginaAtual);
      
      fecharModalPagamento();
      
      // Feedback visual
    } catch (error) {
      console.error('Erro ao marcar bilhete como pago:', error);
      alert(error instanceof Error ? error.message : 'Erro ao marcar bilhete como pago');
    } finally {
      setIsLoadingPagamento(false);
    }
  };

  const obterCorStatus = (status: string) => {
    switch (status) {
      case 'GERADO':
        return { bg: '#dbeafe', color: '#1d4ed8', border: '#60a5fa' };
      case 'PREMIADO':
        return { bg: '#dcfce7', color: '#166534', border: '#4ade80' };
      case 'PAGO':
        return { bg: '#f3e8ff', color: '#7c3aed', border: '#a78bfa' };
      case 'CANCELADO':
        return { bg: '#fee2e2', color: '#dc2626', border: '#f87171' };
      default:
        return { bg: '#f3f4f6', color: '#374151', border: '#9ca3af' };
    }
  };

  const estatisticas = {
    total: paginacao?.totalItens || 0,
    gerados: bilhetes.filter(b => b.status === 'GERADO').length,
    premiados: bilhetes.filter(b => b.status === 'PREMIADO').length,
    pagos: bilhetes.filter(b => b.status === 'PAGO').length,
    cancelados: bilhetes.filter(b => b.status === 'CANCELADO').length,
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto'
      }}>
        
        {/* Header Elegante */}
        <div style={{
          marginBottom: '32px',
          textAlign: 'center'
        }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: '700',
            color: '#1e293b',
            margin: '0 0 8px 0',
            letterSpacing: '-0.5px'
          }}>
            Gestão de Bilhetes
          </h1>
          <p style={{
            fontSize: '16px',
            color: '#64748b',
            margin: '0',
            fontWeight: '400'
          }}>
            Visualize e gerencie todos os bilhetes da plataforma
          </p>
        </div>

        {/* Estatísticas Cards */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '20px',
          marginBottom: '32px'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0',
            textAlign: 'center',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 25px -5px rgba(0, 0, 0, 0.1)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
          }}>
            <div style={{
              fontSize: '36px',
              fontWeight: '800',
              color: '#3b82f6',
              marginBottom: '8px'
            }}>
              {estatisticas.total}
            </div>
            <div style={{
              fontSize: '14px',
              color: '#64748b',
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              Total
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0',
            textAlign: 'center',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 25px -5px rgba(0, 0, 0, 0.1)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
          }}>
            <div style={{
              fontSize: '36px',
              fontWeight: '800',
              color: '#06b6d4',
              marginBottom: '8px'
            }}>
              {estatisticas.gerados}
            </div>
            <div style={{
              fontSize: '14px',
              color: '#64748b',
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              Gerados
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0',
            textAlign: 'center',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 25px -5px rgba(0, 0, 0, 0.1)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
          }}>
            <div style={{
              fontSize: '36px',
              fontWeight: '800',
              color: '#10b981',
              marginBottom: '8px'
            }}>
              {estatisticas.premiados}
            </div>
            <div style={{
              fontSize: '14px',
              color: '#64748b',
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              Premiados
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0',
            textAlign: 'center',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 25px -5px rgba(0, 0, 0, 0.1)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
          }}>
            <div style={{
              fontSize: '36px',
              fontWeight: '800',
              color: '#7c3aed',
              marginBottom: '8px'
            }}>
              {estatisticas.pagos}
            </div>
            <div style={{
              fontSize: '14px',
              color: '#64748b',
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              Pagos
            </div>
          </div>

          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            border: '1px solid #e2e8f0',
            textAlign: 'center',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 8px 25px -5px rgba(0, 0, 0, 0.1)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
          }}>
            <div style={{
              fontSize: '36px',
              fontWeight: '800',
              color: '#ef4444',
              marginBottom: '8px'
            }}>
              {estatisticas.cancelados}
            </div>
            <div style={{
              fontSize: '14px',
              color: '#64748b',
              fontWeight: '500',
              textTransform: 'uppercase',
              letterSpacing: '1px'
            }}>
              Cancelados
            </div>
          </div>
        </div>

        {/* Filtros Modernos */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          padding: '32px',
          marginBottom: '32px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0'
        }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#1e293b',
            margin: '0 0 24px 0',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{ fontSize: '20px' }}>🔍</span>
            Filtros Avançados
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginBottom: '24px'
          }}>
            {/* Status */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Status
              </label>
              <select
                value={filtroStatus}
                onChange={(e) => setFiltroStatus(e.target.value as StatusBilhete | '')}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '14px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
                  background: 'white'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              >
                <option value="">Todos os status</option>
                <option value="GERADO">Gerado</option>
                <option value="PREMIADO">Premiado</option>
                <option value="PAGO">Pago</option>
                <option value="CANCELADO">Cancelado</option>
              </select>
            </div>

            {/* Data Início */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Data Início
              </label>
              <input
                type="date"
                value={filtroDataInicio}
                onChange={(e) => setFiltroDataInicio(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '14px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>

            {/* Data Fim */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px',
                textTransform: 'uppercase',
                letterSpacing: '1px'
              }}>
                Data Fim
              </label>
              <input
                type="date"
                value={filtroDataFim}
                onChange={(e) => setFiltroDataFim(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '14px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  outline: 'none',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#3b82f6';
                  e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          {/* Botões de Ação */}
          <div style={{
            display: 'flex',
            gap: '12px',
            justifyContent: 'flex-end',
            alignItems: 'center'
          }}>
            <div style={{
              fontSize: '14px',
              color: '#64748b',
              marginRight: 'auto',
              display: 'flex',
              alignItems: 'center',
              gap: '16px'
            }}>
              <span>
                {isLoading ? 'Carregando...' : paginacao ? 
                  `${paginacao.totalItens} bilhete(s) encontrado(s) | Página ${paginacao.paginaAtual} de ${paginacao.totalPaginas}` :
                  `${bilhetes.length} bilhete(s) encontrado(s)`
                }
              </span>
              
              {paginacao && (
                <select
                  value={itensPorPagina}
                  onChange={(e) => alterarItensPorPagina(Number(e.target.value))}
                  style={{
                    padding: '4px 8px',
                    fontSize: '12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '6px',
                    outline: 'none'
                  }}
                >
                  <option value={10}>10 por página</option>
                  <option value={20}>20 por página</option>
                  <option value={50}>50 por página</option>
                  <option value={100}>100 por página</option>
                </select>
              )}
            </div>
            
            <button
              onClick={limparFiltros}
              disabled={isLoading}
              style={{
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#64748b',
                background: 'white',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                opacity: isLoading ? 0.5 : 1
              }}
              onMouseOver={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.borderColor = '#94a3b8';
                  e.currentTarget.style.color = '#475569';
                }
              }}
              onMouseOut={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.borderColor = '#e5e7eb';
                  e.currentTarget.style.color = '#64748b';
                }
              }}
            >
              Limpar
            </button>
            
            <button
              onClick={aplicarFiltros}
              disabled={isLoading}
              style={{
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '600',
                color: 'white',
                background: isLoading 
                  ? '#94a3b8' 
                  : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                border: 'none',
                borderRadius: '12px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
              onMouseOver={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.4)';
                }
              }}
              onMouseOut={(e) => {
                if (!isLoading) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }
              }}
            >
              {isLoading && (
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
              )}
              Aplicar Filtros
            </button>
          </div>
        </div>

        {/* Mensagem de Erro */}
        {erro && (
          <div style={{
            background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
            border: '1px solid #f87171',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            animation: 'fadeIn 0.3s ease-in-out'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              <span style={{
                fontSize: '14px',
                color: '#991b1b',
                fontWeight: '500'
              }}>
                {erro}
              </span>
            </div>
            <button
              onClick={() => setErro(null)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '18px',
                color: '#991b1b',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '4px',
                transition: 'background-color 0.2s ease'
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(153, 27, 27, 0.1)'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              ✕
            </button>
          </div>
        )}

        {/* Lista de Bilhetes Moderna */}
        <div style={{
          background: 'white',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0'
        }}>
          {isLoading ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '80px 20px',
              gap: '16px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid #e5e7eb',
                borderTop: '4px solid #3b82f6',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              <span style={{
                fontSize: '16px',
                color: '#64748b',
                fontWeight: '500'
              }}>
                Carregando bilhetes...
              </span>
            </div>
          ) : bilhetes.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '80px 20px'
            }}>
              <div style={{ fontSize: '64px', marginBottom: '16px' }}>🎫</div>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '600',
                color: '#1e293b',
                margin: '0 0 8px 0'
              }}>
                Nenhum bilhete encontrado
              </h3>
              <p style={{
                fontSize: '14px',
                color: '#64748b',
                margin: '0'
              }}>
                {Object.keys(filtros).length > 0 
                  ? 'Tente ajustar os filtros ou limpar a busca'
                  : 'Gere alguns bilhetes para começar'
                }
              </p>
            </div>
          ) : (
            <div style={{ overflow: 'auto' }}>
              {/* Header da Tabela */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '2fr 2fr 1fr 2fr 1fr',
                gap: '24px',
                padding: '24px 32px',
                background: '#f8fafc',
                borderBottom: '1px solid #e2e8f0'
              }}>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#475569',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  Número
                </div>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#475569',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  Código Único
                </div>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#475569',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  Status
                </div>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#475569',
                  textTransform: 'uppercase',
                  letterSpacing: '1px'
                }}>
                  Criado em
                </div>
                <div style={{
                  fontSize: '12px',
                  fontWeight: '700',
                  color: '#475569',
                  textTransform: 'uppercase',
                  letterSpacing: '1px',
                  textAlign: 'center'
                }}>
                  Ações
                </div>
              </div>

              {/* Linhas da Tabela */}
              {bilhetes.map((bilhete, index) => {
                const cores = obterCorStatus(bilhete.status);
                return (
                  <div
                    key={bilhete.id}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '2fr 2fr 1fr 2fr 1fr',
                      gap: '24px',
                      padding: '20px 32px',
                      borderBottom: index < bilhetes.length - 1 ? '1px solid #f1f5f9' : 'none',
                      transition: 'background-color 0.2s ease',
                      alignItems: 'center'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                    onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                  >
                    {/* Número */}
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#1e293b'
                    }}>
                      {bilhete.numeroSequencial}
                    </div>

                    {/* Código */}
                    <div style={{
                      fontSize: '13px',
                      fontFamily: 'monospace',
                      color: '#64748b',
                      fontWeight: '500',
                      letterSpacing: '0.5px'
                    }}>
                      {bilhete.codigoUnico}
                    </div>

                    {/* Status */}
                    <div>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        borderRadius: '20px',
                        backgroundColor: cores.bg,
                        color: cores.color,
                        border: `1px solid ${cores.border}`
                      }}>
                        {bilheteService.obterTextoStatus(bilhete.status)}
                      </span>
                    </div>

                    {/* Data */}
                    <div style={{
                      fontSize: '13px',
                      color: '#64748b'
                    }}>
                      {formatarData(bilhete.createdAt)}
                    </div>

                    {/* Ações */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'center',
                      gap: '8px'
                    }}>
                      <button
                        onClick={() => downloadPdf(bilhete)}
                        disabled={isLoadingPdf === bilhete.id}
                        title="Download PDF"
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          border: 'none',
                          background: '#dbeafe',
                          color: '#1d4ed8',
                          cursor: isLoadingPdf === bilhete.id ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '16px',
                          opacity: isLoadingPdf === bilhete.id ? 0.5 : 1
                        }}
                        onMouseOver={(e) => {
                          if (isLoadingPdf !== bilhete.id) {
                            e.currentTarget.style.backgroundColor = '#bfdbfe';
                            e.currentTarget.style.transform = 'scale(1.05)';
                          }
                        }}
                        onMouseOut={(e) => {
                          if (isLoadingPdf !== bilhete.id) {
                            e.currentTarget.style.backgroundColor = '#dbeafe';
                            e.currentTarget.style.transform = 'scale(1)';
                          }
                        }}
                      >
                        {isLoadingPdf === bilhete.id ? (
                          <div style={{
                            width: '16px',
                            height: '16px',
                            border: '2px solid rgba(29, 78, 216, 0.3)',
                            borderTop: '2px solid #1d4ed8',
                            borderRadius: '50%',
                            animation: 'spin 1s linear infinite'
                          }} />
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                            <polyline points="14,2 14,8 20,8"/>
                            <line x1="16" y1="13" x2="8" y2="13"/>
                            <line x1="16" y1="17" x2="8" y2="17"/>
                            <polyline points="10,9 9,9 8,9"/>
                          </svg>
                        )}
                      </button>
                      
                      <button
                        onClick={() => abrirModalPagamento(bilhete)}
                        title="Marcar como pago"
                        disabled={bilhete.status !== 'PREMIADO'}
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          border: 'none',
                          background: bilhete.status === 'PREMIADO' 
                            ? '#dcfce7' 
                            : '#f3f4f6',
                          color: bilhete.status === 'PREMIADO' 
                            ? '#166534' 
                            : '#9ca3af',
                          cursor: bilhete.status === 'PREMIADO' 
                            ? 'pointer' 
                            : 'not-allowed',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          opacity: bilhete.status === 'PREMIADO' ? 1 : 0.5
                        }}
                        onMouseOver={(e) => {
                          if (bilhete.status === 'PREMIADO') {
                            e.currentTarget.style.backgroundColor = '#bbf7d0';
                            e.currentTarget.style.transform = 'scale(1.05)';
                          }
                        }}
                        onMouseOut={(e) => {
                          if (bilhete.status === 'PREMIADO') {
                            e.currentTarget.style.backgroundColor = '#dcfce7';
                            e.currentTarget.style.transform = 'scale(1)';
                          }
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="1" x2="12" y2="23"/>
                          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                        </svg>
                      </button>
                      
                      <button
                        onClick={() => copiarCodigo(bilhete.codigoUnico)}
                        title="Copiar código"
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          border: 'none',
                          background: '#f3f4f6',
                          color: '#374151',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = '#e5e7eb';
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = '#f3f4f6';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
                     )}
         </div>

         {/* Controles de Paginação */}
         {paginacao && paginacao.totalPaginas > 1 && (
           <div style={{
             display: 'flex',
             justifyContent: 'space-between',
             alignItems: 'center',
             padding: '24px 32px',
             borderTop: '1px solid #f1f5f9'
           }}>
             <div style={{
               fontSize: '14px',
               color: '#64748b'
             }}>
               Mostrando {((paginacao.paginaAtual - 1) * paginacao.itensPorPagina) + 1} a{' '}
               {Math.min(paginacao.paginaAtual * paginacao.itensPorPagina, paginacao.totalItens)} de{' '}
               {paginacao.totalItens} resultados
             </div>

             <div style={{
               display: 'flex',
               alignItems: 'center',
               gap: '8px'
             }}>
               {/* Botão Primeira Página */}
               <button
                 onClick={() => irParaPagina(1)}
                 disabled={!paginacao.temPaginaAnterior}
                 style={{
                   padding: '8px 12px',
                   fontSize: '14px',
                   fontWeight: '500',
                   background: paginacao.temPaginaAnterior ? 'white' : '#f3f4f6',
                   color: paginacao.temPaginaAnterior ? '#374151' : '#9ca3af',
                   border: '1px solid #e5e7eb',
                   borderRadius: '8px',
                   cursor: paginacao.temPaginaAnterior ? 'pointer' : 'not-allowed',
                   transition: 'all 0.2s ease'
                 }}
                 onMouseOver={(e) => {
                   if (paginacao.temPaginaAnterior) {
                     e.currentTarget.style.backgroundColor = '#f9fafb';
                   }
                 }}
                 onMouseOut={(e) => {
                   if (paginacao.temPaginaAnterior) {
                     e.currentTarget.style.backgroundColor = 'white';
                   }
                 }}
               >
                 ««
               </button>

               {/* Botão Página Anterior */}
               <button
                 onClick={() => irParaPagina(paginacao.paginaAtual - 1)}
                 disabled={!paginacao.temPaginaAnterior}
                 style={{
                   padding: '8px 12px',
                   fontSize: '14px',
                   fontWeight: '500',
                   background: paginacao.temPaginaAnterior ? 'white' : '#f3f4f6',
                   color: paginacao.temPaginaAnterior ? '#374151' : '#9ca3af',
                   border: '1px solid #e5e7eb',
                   borderRadius: '8px',
                   cursor: paginacao.temPaginaAnterior ? 'pointer' : 'not-allowed',
                   transition: 'all 0.2s ease'
                 }}
                 onMouseOver={(e) => {
                   if (paginacao.temPaginaAnterior) {
                     e.currentTarget.style.backgroundColor = '#f9fafb';
                   }
                 }}
                 onMouseOut={(e) => {
                   if (paginacao.temPaginaAnterior) {
                     e.currentTarget.style.backgroundColor = 'white';
                   }
                 }}
               >
                 ‹ Anterior
               </button>

               {/* Números das Páginas */}
               {Array.from({ length: Math.min(5, paginacao.totalPaginas) }, (_, i) => {
                 let numeroPagina;
                 if (paginacao.totalPaginas <= 5) {
                   numeroPagina = i + 1;
                 } else if (paginacao.paginaAtual <= 3) {
                   numeroPagina = i + 1;
                 } else if (paginacao.paginaAtual >= paginacao.totalPaginas - 2) {
                   numeroPagina = paginacao.totalPaginas - 4 + i;
                 } else {
                   numeroPagina = paginacao.paginaAtual - 2 + i;
                 }

                 const isAtual = numeroPagina === paginacao.paginaAtual;

                 return (
                   <button
                     key={numeroPagina}
                     onClick={() => irParaPagina(numeroPagina)}
                     style={{
                       padding: '8px 12px',
                       fontSize: '14px',
                       fontWeight: '500',
                       background: isAtual ? 'linear-gradient(135deg, #3b82f6, #1d4ed8)' : 'white',
                       color: isAtual ? 'white' : '#374151',
                       border: isAtual ? 'none' : '1px solid #e5e7eb',
                       borderRadius: '8px',
                       cursor: 'pointer',
                       transition: 'all 0.2s ease',
                       minWidth: '40px'
                     }}
                     onMouseOver={(e) => {
                       if (!isAtual) {
                         e.currentTarget.style.backgroundColor = '#f9fafb';
                       }
                     }}
                     onMouseOut={(e) => {
                       if (!isAtual) {
                         e.currentTarget.style.backgroundColor = 'white';
                       }
                     }}
                   >
                     {numeroPagina}
                   </button>
                 );
               })}

               {/* Botão Próxima Página */}
               <button
                 onClick={() => irParaPagina(paginacao.paginaAtual + 1)}
                 disabled={!paginacao.temProximaPagina}
                 style={{
                   padding: '8px 12px',
                   fontSize: '14px',
                   fontWeight: '500',
                   background: paginacao.temProximaPagina ? 'white' : '#f3f4f6',
                   color: paginacao.temProximaPagina ? '#374151' : '#9ca3af',
                   border: '1px solid #e5e7eb',
                   borderRadius: '8px',
                   cursor: paginacao.temProximaPagina ? 'pointer' : 'not-allowed',
                   transition: 'all 0.2s ease'
                 }}
                 onMouseOver={(e) => {
                   if (paginacao.temProximaPagina) {
                     e.currentTarget.style.backgroundColor = '#f9fafb';
                   }
                 }}
                 onMouseOut={(e) => {
                   if (paginacao.temProximaPagina) {
                     e.currentTarget.style.backgroundColor = 'white';
                   }
                 }}
               >
                 Próxima ›
               </button>

               {/* Botão Última Página */}
               <button
                 onClick={() => irParaPagina(paginacao.totalPaginas)}
                 disabled={!paginacao.temProximaPagina}
                 style={{
                   padding: '8px 12px',
                   fontSize: '14px',
                   fontWeight: '500',
                   background: paginacao.temProximaPagina ? 'white' : '#f3f4f6',
                   color: paginacao.temProximaPagina ? '#374151' : '#9ca3af',
                   border: '1px solid #e5e7eb',
                   borderRadius: '8px',
                   cursor: paginacao.temProximaPagina ? 'pointer' : 'not-allowed',
                   transition: 'all 0.2s ease'
                 }}
                 onMouseOver={(e) => {
                   if (paginacao.temProximaPagina) {
                     e.currentTarget.style.backgroundColor = '#f9fafb';
                   }
                 }}
                 onMouseOut={(e) => {
                   if (paginacao.temProximaPagina) {
                     e.currentTarget.style.backgroundColor = 'white';
                   }
                 }}
               >
                 »»
               </button>
             </div>
           </div>
         )}
       </div>

      {/* Modal de Marcar como Pago */}
      {modalPagoAberto && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          animation: 'fadeIn 0.3s ease-in-out'
        }}>
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '32px',
            width: '100%',
            maxWidth: '500px',
            margin: '20px',
            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
            animation: 'fadeIn 0.3s ease-in-out'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '24px'
            }}>
              <h3 style={{
                fontSize: '20px',
                fontWeight: '700',
                color: '#1e293b',
                margin: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23"/>
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                </svg>
                Marcar como Pago
              </h3>
              
              <button
                onClick={fecharModalPagamento}
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#f3f4f6',
                  color: '#6b7280',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '18px',
                  transition: 'all 0.2s ease'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#e5e7eb';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = '#f3f4f6';
                }}
              >
                ×
              </button>
            </div>

            {bilheteSelecionado && (
              <div style={{
                background: '#f8fafc',
                borderRadius: '12px',
                padding: '20px',
                marginBottom: '24px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#1e293b',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14,2 14,8 20,8"/>
                  </svg>
                  Informações do Bilhete
                </div>

                {/* Grid de informações */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '16px'
                }}>
                  {/* Código do Bilhete */}
                  <div>
                    <div style={{
                      fontSize: '12px',
                      color: '#64748b',
                      fontWeight: '500',
                      marginBottom: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Código Único
                    </div>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#1e293b',
                      fontFamily: 'monospace',
                      background: 'white',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0'
                    }}>
                      {bilheteSelecionado.codigoUnico}
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <div style={{
                      fontSize: '12px',
                      color: '#64748b',
                      fontWeight: '500',
                      marginBottom: '4px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Status
                    </div>
                    <div>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        padding: '6px 12px',
                        fontSize: '12px',
                        fontWeight: '600',
                        borderRadius: '20px',
                        backgroundColor: obterCorStatus(bilheteSelecionado.status).bg,
                        color: obterCorStatus(bilheteSelecionado.status).color,
                        border: `1px solid ${obterCorStatus(bilheteSelecionado.status).border}`
                      }}>
                        {bilheteService.obterTextoStatus(bilheteSelecionado.status)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Informações de Resgate (se disponíveis) */}
                {bilheteSelecionado.nomeCompleto && (
                  <div style={{
                    marginTop: '20px',
                    paddingTop: '16px',
                    borderTop: '1px solid #e2e8f0'
                  }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#1e293b',
                      marginBottom: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                      Dados do Ganhador
                    </div>

                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: '12px'
                    }}>
                      {/* Nome Completo */}
                      <div>
                        <div style={{
                          fontSize: '11px',
                          color: '#64748b',
                          fontWeight: '500',
                          marginBottom: '2px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px'
                        }}>
                          Nome Completo
                        </div>
                        <div style={{
                          fontSize: '13px',
                          color: '#1e293b',
                          fontWeight: '500'
                        }}>
                          {bilheteSelecionado.nomeCompleto}
                        </div>
                      </div>

                      {/* Telefone */}
                      {bilheteSelecionado.telefone && (
                        <div>
                          <div style={{
                            fontSize: '11px',
                            color: '#64748b',
                            fontWeight: '500',
                            marginBottom: '2px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            Telefone
                          </div>
                          <div style={{
                            fontSize: '13px',
                            color: '#1e293b',
                            fontWeight: '500'
                          }}>
                            {bilheteSelecionado.telefone}
                          </div>
                        </div>
                      )}

                      {/* Email */}
                      {bilheteSelecionado.emailResgate && (
                        <div>
                          <div style={{
                            fontSize: '11px',
                            color: '#64748b',
                            fontWeight: '500',
                            marginBottom: '2px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            Email
                          </div>
                          <div style={{
                            fontSize: '13px',
                            color: '#1e293b',
                            fontWeight: '500',
                            wordBreak: 'break-all'
                          }}>
                            {bilheteSelecionado.emailResgate}
                          </div>
                        </div>
                      )}

                      {/* Chave PIX */}
                      {bilheteSelecionado.chavePix && (
                        <div>
                          <div style={{
                            fontSize: '11px',
                            color: '#64748b',
                            fontWeight: '500',
                            marginBottom: '2px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px'
                          }}>
                            Chave PIX
                          </div>
                          <div style={{
                            fontSize: '13px',
                            color: '#1e293b',
                            fontWeight: '500',
                            fontFamily: 'monospace',
                            background: 'white',
                            padding: '4px 8px',
                            borderRadius: '4px',
                            border: '1px solid #e2e8f0',
                            wordBreak: 'break-all'
                          }}>
                            {bilheteSelecionado.chavePix}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            <div style={{ marginBottom: '24px' }}>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Observações (opcional)
              </label>
              <textarea
                value={observacoesPagamento}
                onChange={(e) => setObservacoesPagamento(e.target.value)}
                placeholder="Pagamento via PIX"
                rows={3}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  fontSize: '14px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  outline: 'none',
                  resize: 'vertical',
                  transition: 'border-color 0.2s ease',
                  fontFamily: 'inherit'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#7c3aed';
                  e.target.style.boxShadow = '0 0 0 3px rgba(124, 58, 237, 0.1)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#e5e7eb';
                  e.target.style.boxShadow = 'none';
                }}
              />
              <div style={{
                fontSize: '12px',
                color: '#64748b',
                marginTop: '6px'
              }}>
                Se não preenchido, será usado: "Pagamento via PIX"
              </div>
            </div>

            <div style={{
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={fecharModalPagamento}
                disabled={isLoadingPagamento}
                style={{
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: '#64748b',
                  background: 'white',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  cursor: isLoadingPagamento ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  opacity: isLoadingPagamento ? 0.5 : 1
                }}
                onMouseOver={(e) => {
                  if (!isLoadingPagamento) {
                    e.currentTarget.style.borderColor = '#94a3b8';
                    e.currentTarget.style.color = '#475569';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isLoadingPagamento) {
                    e.currentTarget.style.borderColor = '#e5e7eb';
                    e.currentTarget.style.color = '#64748b';
                  }
                }}
              >
                Cancelar
              </button>
              
              <button
                onClick={confirmarPagamento}
                disabled={isLoadingPagamento}
                style={{
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: '600',
                  color: 'white',
                  background: isLoadingPagamento 
                    ? '#94a3b8' 
                    : 'linear-gradient(135deg, #7c3aed, #5b21b6)',
                  border: 'none',
                  borderRadius: '12px',
                  cursor: isLoadingPagamento ? 'not-allowed' : 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseOver={(e) => {
                  if (!isLoadingPagamento) {
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(124, 58, 237, 0.4)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isLoadingPagamento) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }
                }}
              >
                {isLoadingPagamento ? (
                  <>
                    <div style={{
                      width: '16px',
                      height: '16px',
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      borderTop: '2px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Processando...
                  </>
                ) : (
                  <>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20,6 9,17 4,12"/>
                    </svg>
                    Confirmar Pagamento
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSS para animações */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes fadeIn {
            0% { opacity: 0; transform: translateY(10px); }
            100% { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
}