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

  const obterUrlPdf = async (bilhete: Bilhete) => {
    try {
      const response = await bilheteService.obterUrlPdf(bilhete.id);
      window.open(response.url, '_blank');
    } catch (error) {
      console.error('Erro ao obter URL do PDF:', error);
      alert('Erro ao obter URL do PDF');
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

  const obterCorStatus = (status: string) => {
    switch (status) {
      case 'GERADO':
        return { bg: '#dbeafe', color: '#1d4ed8', border: '#60a5fa' };
      case 'PREMIADO':
        return { bg: '#dcfce7', color: '#166534', border: '#4ade80' };
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
              <span style={{ fontSize: '24px' }}>⚠️</span>
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
                          '📄'
                        )}
                      </button>
                      
                      <button
                        onClick={() => obterUrlPdf(bilhete)}
                        title="Abrir PDF em nova aba"
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '8px',
                          border: 'none',
                          background: '#dcfce7',
                          color: '#166534',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '16px'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.backgroundColor = '#bbf7d0';
                          e.currentTarget.style.transform = 'scale(1.05)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.backgroundColor = '#dcfce7';
                          e.currentTarget.style.transform = 'scale(1)';
                        }}
                      >
                        🔗
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
                          fontSize: '16px'
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
                        📋
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