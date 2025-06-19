import { useState } from 'react';
import { bilheteService } from '../../services/bilheteService';
import type { GerarLoteRequest } from '../../types';

export function GerarBilhetes() {
  const [quantidade, setQuantidade] = useState<string>('');
  const [prefixo, setPrefixo] = useState<string>('GANHADOR');
  const [isLoading, setIsLoading] = useState(false);
  const [mensagem, setMensagem] = useState<{
    texto: string;
    tipo: 'sucesso' | 'erro' | 'info';
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações
    const qtd = parseInt(quantidade);
    if (!qtd || qtd < 1 || qtd > 10000) {
      setMensagem({
        texto: 'Quantidade deve ser entre 1 e 10.000 bilhetes',
        tipo: 'erro'
      });
      return;
    }

    if (!prefixo.trim() || prefixo.length > 20) {
      setMensagem({
        texto: 'Prefixo deve ter entre 1 e 20 caracteres',
        tipo: 'erro'
      });
      return;
    }

    // Validar formato do prefixo (apenas letras maiúsculas, números e espaços)
    const prefixoPattern = /^[A-Z0-9\s]+$/;
    if (!prefixoPattern.test(prefixo.trim())) {
      setMensagem({
        texto: 'Prefixo deve conter apenas letras maiúsculas, números e espaços',
        tipo: 'erro'
      });
      return;
    }

    setIsLoading(true);
    setMensagem(null);

    try {
      const dados: GerarLoteRequest = {
        quantidade: qtd,
        prefixo: prefixo.trim()
      };

      const response = await bilheteService.gerarLote(dados);
      
      setMensagem({
        texto: `Lote gerado com sucesso! ${response.quantidade} bilhetes criados com prefixo "${response.prefixo}"`,
        tipo: 'sucesso'
      });

      // Limpar formulário após sucesso
      setQuantidade('');
      setPrefixo('GANHADOR');
      
    } catch (error) {
      console.error('Erro ao gerar lote:', error);
      setMensagem({
        texto: error instanceof Error ? error.message : 'Erro ao gerar lote de bilhetes',
        tipo: 'erro'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const dismissMensagem = () => {
    setMensagem(null);
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
      padding: '40px 24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        
        {/* Header Elegante */}
        <div style={{
          textAlign: 'center',
          marginBottom: '48px'
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '80px',
            height: '80px',
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            borderRadius: '24px',
            marginBottom: '24px',
            boxShadow: '0 20px 40px rgba(59, 130, 246, 0.3)'
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14,2 14,8 20,8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10,9 9,9 8,9"/>
            </svg>
          </div>
          
          <h1 style={{
            fontSize: '36px',
            fontWeight: '700',
            color: '#1e293b',
            margin: '0 0 12px 0',
            letterSpacing: '-1px'
          }}>
            Gerar Bilhetes
          </h1>
          
          <p style={{
            fontSize: '18px',
            color: '#64748b',
            margin: '0',
            fontWeight: '400',
            maxWidth: '500px',
            marginLeft: 'auto',
            marginRight: 'auto',
            lineHeight: '1.6'
          }}>
            Crie lotes de bilhetes numerados sequencialmente com códigos únicos
          </p>
        </div>

        {/* Mensagem de Feedback */}
        {mensagem && (
          <div style={{
            background: mensagem.tipo === 'sucesso' 
              ? 'linear-gradient(135deg, #dcfce7, #bbf7d0)'
              : mensagem.tipo === 'erro'
              ? 'linear-gradient(135deg, #fef2f2, #fee2e2)'
              : 'linear-gradient(135deg, #dbeafe, #bfdbfe)',
            border: `2px solid ${
              mensagem.tipo === 'sucesso' 
                ? '#22c55e'
                : mensagem.tipo === 'erro'
                ? '#ef4444'
                : '#3b82f6'
            }`,
            borderRadius: '16px',
            padding: '20px 24px',
            marginBottom: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
            animation: 'slideIn 0.3s ease-out'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              {mensagem.tipo === 'sucesso' ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20,6 9,17 4,12"/>
                </svg>
              ) : mensagem.tipo === 'erro' ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <line x1="15" y1="9" x2="9" y2="15"/>
                  <line x1="9" y1="9" x2="15" y2="15"/>
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 16v-4"/>
                  <path d="M12 8h.01"/>
                </svg>
              )}
              
              <span style={{
                color: mensagem.tipo === 'sucesso' 
                  ? '#166534'
                  : mensagem.tipo === 'erro'
                  ? '#dc2626'
                  : '#1d4ed8',
                fontSize: '16px',
                fontWeight: '600'
              }}>
                {mensagem.texto}
              </span>
            </div>
            
            <button
              onClick={dismissMensagem}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '8px',
                color: mensagem.tipo === 'sucesso' 
                  ? '#166534'
                  : mensagem.tipo === 'erro'
                  ? '#dc2626'
                  : '#1d4ed8',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.background = 'rgba(0, 0, 0, 0.1)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.background = 'none';
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        )}

        {/* Card Principal */}
        <div style={{
          background: 'white',
          borderRadius: '24px',
          padding: '48px',
          boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1), 0 8px 25px rgba(0, 0, 0, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.8)',
          marginBottom: '32px'
        }}>
          
          <form onSubmit={handleSubmit}>
            
            {/* Grid de Campos */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '32px',
              marginBottom: '40px'
            }}>
              
              {/* Campo Quantidade */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '12px'
                }}>
                  Quantidade de Bilhetes
                </label>
                
                <div style={{
                  position: 'relative'
                }}>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={quantidade}
                    onChange={(e) => setQuantidade(e.target.value)}
                    placeholder="Ex: 500"
                    disabled={isLoading}
                    style={{
                      width: '100%',
                      padding: '20px 24px',
                      fontSize: '16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '16px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      background: isLoading ? '#f9fafb' : 'white',
                      color: '#1f2937',
                      fontFamily: 'inherit'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  
                  <div style={{
                    position: 'absolute',
                    right: '20px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9ca3af',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                      <polyline points="14,2 14,8 20,8"/>
                    </svg>
                  </div>
                </div>
                
                <div style={{
                  fontSize: '14px',
                  color: '#64748b',
                  marginTop: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 16v-4"/>
                    <path d="M12 8h.01"/>
                  </svg>
                  Mínimo: 1 | Máximo: 10.000 bilhetes
                </div>
              </div>

              {/* Campo Prefixo */}
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '16px',
                  fontWeight: '600',
                  color: '#374151',
                  marginBottom: '12px'
                }}>
                  Prefixo dos Números
                </label>
                
                <div style={{
                  position: 'relative'
                }}>
                  <input
                    type="text"
                    maxLength={20}
                    value={prefixo}
                    onChange={(e) => setPrefixo(e.target.value.toUpperCase())}
                    placeholder="Ex: GANHADOR"
                    disabled={isLoading}
                    style={{
                      width: '100%',
                      padding: '20px 24px',
                      fontSize: '16px',
                      border: '2px solid #e5e7eb',
                      borderRadius: '16px',
                      outline: 'none',
                      transition: 'all 0.2s ease',
                      background: isLoading ? '#f9fafb' : 'white',
                      color: '#1f2937',
                      fontFamily: 'monospace',
                      letterSpacing: '1px'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#3b82f6';
                      e.target.style.boxShadow = '0 0 0 4px rgba(59, 130, 246, 0.1)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#e5e7eb';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                  
                  <div style={{
                    position: 'absolute',
                    right: '20px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: '#9ca3af',
                    fontSize: '14px',
                    fontWeight: '500'
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 7h16"/>
                      <path d="M10 11h4"/>
                      <path d="M12 15h2"/>
                    </svg>
                  </div>
                </div>
                
                <div style={{
                  fontSize: '14px',
                  color: '#64748b',
                  marginTop: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 16v-4"/>
                    <path d="M12 8h.01"/>
                  </svg>
                  Máximo 20 caracteres (letras maiúsculas, números e espaços)
                </div>
              </div>
            </div>

            {/* Preview dos Bilhetes */}
            {quantidade && prefixo && (
              <div style={{
                background: 'linear-gradient(135deg, #f8fafc, #f1f5f9)',
                borderRadius: '20px',
                padding: '32px',
                marginBottom: '40px',
                border: '2px solid #e2e8f0',
                position: 'relative',
                overflow: 'hidden'
              }}>
                
                {/* Background Pattern */}
                <div style={{
                  position: 'absolute',
                  top: '-50%',
                  right: '-50%',
                  width: '200%',
                  height: '200%',
                  background: 'radial-gradient(circle, rgba(59, 130, 246, 0.05) 0%, transparent 50%)',
                  pointerEvents: 'none'
                }} />
                
                <div style={{
                  position: 'relative',
                  zIndex: 1
                }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    marginBottom: '24px'
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                    </div>
                    
                    <div>
                      <h3 style={{
                        fontSize: '20px',
                        fontWeight: '700',
                        color: '#1e293b',
                        margin: '0 0 4px 0'
                      }}>
                        Preview dos Bilhetes
                      </h3>
                      <p style={{
                        fontSize: '14px',
                        color: '#64748b',
                        margin: '0'
                      }}>
                        Visualização de como os bilhetes serão numerados
                      </p>
                    </div>
                  </div>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '16px'
                  }}>
                    {[1, 2, parseInt(quantidade) || 0].map((num, index) => (
                      <div key={index} style={{
                        background: 'white',
                        borderRadius: '12px',
                        padding: '16px 20px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
                        textAlign: 'center'
                      }}>
                        <div style={{
                          fontSize: '18px',
                          fontWeight: '700',
                          color: '#1e293b',
                          fontFamily: 'monospace',
                          letterSpacing: '1px'
                        }}>
                          {index === 2 && parseInt(quantidade) > 2 ? 
                            `${prefixo} ${String(num).padStart(3, '0')}` :
                            index === 1 && parseInt(quantidade) > 2 ?
                            '...' :
                            `${prefixo} ${String(num).padStart(3, '0')}`
                          }
                        </div>
                        {index !== 1 && (
                          <div style={{
                            fontSize: '12px',
                            color: '#64748b',
                            marginTop: '4px'
                          }}>
                            Bilhete #{num === parseInt(quantidade) ? num : index + 1}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Botão de Ação */}
            <div style={{
              textAlign: 'center'
            }}>
              <button
                type="submit"
                disabled={isLoading || !quantidade || !prefixo}
                style={{
                  padding: '20px 48px',
                  fontSize: '18px',
                  fontWeight: '700',
                  color: 'white',
                  background: isLoading || !quantidade || !prefixo
                    ? 'linear-gradient(135deg, #9ca3af, #6b7280)'
                    : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                  border: 'none',
                  borderRadius: '16px',
                  cursor: isLoading || !quantidade || !prefixo 
                    ? 'not-allowed' 
                    : 'pointer',
                  transition: 'all 0.3s ease',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '12px',
                  boxShadow: isLoading || !quantidade || !prefixo
                    ? 'none'
                    : '0 8px 25px rgba(59, 130, 246, 0.4)',
                  minWidth: '240px',
                  justifyContent: 'center'
                }}
                onMouseOver={(e) => {
                  if (!isLoading && quantidade && prefixo) {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = '0 12px 35px rgba(59, 130, 246, 0.5)';
                  }
                }}
                onMouseOut={(e) => {
                  if (!isLoading && quantidade && prefixo) {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(59, 130, 246, 0.4)';
                  }
                }}
              >
                {isLoading ? (
                  <>
                    <div style={{
                      width: '24px',
                      height: '24px',
                      border: '3px solid rgba(255, 255, 255, 0.3)',
                      borderTop: '3px solid white',
                      borderRadius: '50%',
                      animation: 'spin 1s linear infinite'
                    }} />
                    Gerando Bilhetes...
                  </>
                ) : (
                  <>
 
                    Gerar Lote de Bilhetes
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Card de Informações */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '20px',
          padding: '32px',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          backdropFilter: 'blur(10px)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '20px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 16v-4"/>
                <path d="M12 8h.01"/>
              </svg>
            </div>
            
            <h3 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: '#1e293b',
              margin: '0'
            }}>
              Informações Importantes
            </h3>
          </div>
          
                     <div style={{
             display: 'grid',
             gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
             gap: '16px'
           }}>
             {[
               { 
                 icon: (
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                     <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                     <circle cx="12" cy="16" r="1"/>
                     <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                   </svg>
                 ), 
                 text: 'Cada bilhete recebe um código único alfanumérico de 11 caracteres' 
               },
               { 
                 icon: (
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                     <path d="M3 3v18h18"/>
                     <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3"/>
                   </svg>
                 ), 
                 text: 'Os números são gerados sequencialmente (ex: GANHADOR 001, GANHADOR 002...)' 
               },
               { 
                 icon: (
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                     <polyline points="20,6 9,17 4,12"/>
                   </svg>
                 ), 
                 text: 'Todos os bilhetes são criados com status "GERADO"' 
               },
               { 
                 icon: (
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                     <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                     <path d="M9 9h6v6h-6z"/>
                   </svg>
                 ), 
                 text: 'Cada bilhete pode ter um QR Code gerado automaticamente' 
               },
               { 
                 icon: (
                   <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                     <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                     <polyline points="14,2 14,8 20,8"/>
                     <line x1="16" y1="13" x2="8" y2="13"/>
                     <line x1="16" y1="17" x2="8" y2="17"/>
                     <polyline points="10,9 9,9 8,9"/>
                   </svg>
                 ), 
                 text: 'PDFs podem ser gerados individualmente após a criação' 
               }
             ].map((item, index) => (
               <div key={index} style={{
                 display: 'flex',
                 alignItems: 'flex-start',
                 gap: '12px',
                 padding: '16px',
                 background: 'rgba(255, 255, 255, 0.7)',
                 borderRadius: '12px',
                 border: '1px solid rgba(59, 130, 246, 0.1)'
               }}>
                 <div style={{
                   display: 'flex',
                   alignItems: 'center',
                   justifyContent: 'center',
                   width: '32px',
                   height: '32px',
                   background: 'rgba(59, 130, 246, 0.1)',
                   borderRadius: '8px',
                   flexShrink: 0
                 }}>
                   {item.icon}
                 </div>
                 <span style={{
                   fontSize: '14px',
                   color: '#374151',
                   lineHeight: '1.5',
                   fontWeight: '500'
                 }}>
                   {item.text}
                 </span>
               </div>
             ))}
          </div>
        </div>
      </div>

      {/* CSS para animações */}
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
          
          @keyframes slideIn {
            0% { opacity: 0; transform: translateY(-20px); }
            100% { opacity: 1; transform: translateY(0); }
          }
        `}
      </style>
    </div>
  );
} 