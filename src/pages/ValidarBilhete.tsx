import { useState } from 'react';
import { bilheteService } from '../services/bilheteService';
import type { ValidarBilheteResponse } from '../types';
import logoJayna from '../assets/images/logotipo-jayna-icone.png';

export function ValidarBilhete() {
  const [codigo, setCodigo] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resultado, setResultado] = useState<ValidarBilheteResponse | null>(null);
  const [mostrarFormularioContato, setMostrarFormularioContato] = useState(false);
  const [dadosContato, setDadosContato] = useState({
    nome: '',
    telefone: '',
    email: '',
    chavePix: ''
  });
  const [enviandoContato, setEnviandoContato] = useState(false);
  const [erroFormulario, setErroFormulario] = useState<string | null>(null);
  const [sucessoResgate, setSucessoResgate] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!codigo.trim()) {
      setResultado({
        valido: false,
        mensagem: 'Digite um código para validar',
        tipo: 'erro'
      });
      return;
    }

    if (!bilheteService.validarFormatoCodigo(codigo.trim())) {
      setResultado({
        valido: false,
        mensagem: 'Código deve ter pelo menos 3 caracteres',
        tipo: 'erro'
      });
      return;
    }

    setIsLoading(true);
    setResultado(null);
    setMostrarFormularioContato(false);

    try {
      const response = await bilheteService.validarBilhete(codigo.trim().toUpperCase());
      setResultado(response);
      
      // Se bilhete for válido, mostrar formulário automaticamente
      if (response.valido) {
        setMostrarFormularioContato(true);
      }
    } catch (error) {
      setResultado({
        valido: false,
        mensagem: 'Erro de conexão. Tente novamente.',
        tipo: 'erro'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const limparResultado = () => {
    setResultado(null);
    setCodigo('');
    setMostrarFormularioContato(false);
    setErroFormulario(null);
    setSucessoResgate(null);
    setDadosContato({
      nome: '',
      telefone: '',
      email: '',
      chavePix: ''
    });
  };

  const handleEnviarContato = async (e: React.FormEvent) => {
    e.preventDefault();
    setErroFormulario(null);
    setSucessoResgate(null);
    
    // Validações básicas
    if (!dadosContato.nome.trim() || !dadosContato.telefone.trim() || !dadosContato.email.trim() || !dadosContato.chavePix.trim()) {
      setErroFormulario('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Validação específica do telefone
    const telefoneFormatado = dadosContato.telefone.trim();
    if (!telefoneFormatado.match(/^\([0-9]{2}\) [0-9]{4,5}-[0-9]{4}$/)) {
      setErroFormulario('Telefone deve estar no formato (XX) XXXXX-XXXX. Digite apenas os números que a formatação será aplicada automaticamente.');
      return;
    }

    if (!resultado?.bilhete?.codigoUnico) {
      setErroFormulario('Erro: código do bilhete não encontrado.');
      return;
    }

    setEnviandoContato(true);

    try {
      const dadosResgate = {
        codigo: resultado.bilhete.codigoUnico,
        nomeCompleto: dadosContato.nome.trim(),
        telefone: telefoneFormatado,
        email: dadosContato.email.trim(),
        chavePix: dadosContato.chavePix.trim()
      };

      const response = await bilheteService.processarResgate(dadosResgate);
      
      setSucessoResgate(`${response.mensagem}\n\nData do resgate: ${new Date(response.dataResgate).toLocaleString('pt-BR')}`);
      setMostrarFormularioContato(false);
      
      // Atualizar o resultado com o bilhete atualizado
      setResultado({
        valido: true,
        bilhete: response.bilhete,
        mensagem: 'Bilhete resgatado com sucesso!',
        tipo: 'sucesso'
      });
      
    } catch (error) {
      const mensagemErro = error instanceof Error ? error.message : 'Erro ao processar resgate. Tente novamente.';
      setErroFormulario(mensagemErro);
    } finally {
      setEnviandoContato(false);
    }
  };

  const handleInputContato = (campo: string, valor: string) => {
    let valorFormatado = valor;
    
    // Aplicar máscara de telefone automaticamente
    if (campo === 'telefone') {
      valorFormatado = formatarTelefone(valor);
    }
    
    setDadosContato(prev => ({
      ...prev,
      [campo]: valorFormatado
    }));
  };

  const formatarTelefone = (valor: string): string => {
    // Remove tudo que não é número
    const apenasNumeros = valor.replace(/\D/g, '');
    
    // Aplica a máscara baseado no tamanho
    if (apenasNumeros.length <= 2) {
      return apenasNumeros;
    } else if (apenasNumeros.length <= 3) {
      return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2)}`;
    } else if (apenasNumeros.length <= 7) {
      return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2, 7)}`;
    } else if (apenasNumeros.length <= 11) {
      // Telefone com 9 dígitos: (XX) XXXXX-XXXX
      return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2, 7)}-${apenasNumeros.slice(7, 11)}`;
    } else {
      // Limita a 11 dígitos
      return `(${apenasNumeros.slice(0, 2)}) ${apenasNumeros.slice(2, 7)}-${apenasNumeros.slice(7, 11)}`;
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '480px',
        background: 'white',
        borderRadius: '24px',
        padding: '40px',
        boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
        textAlign: 'center'
      }}>
        
        {/* Logo e Título */}
        <div style={{ marginBottom: '32px' }}>
          <div style={{
            width: '240px',
            height: '240px',
            background: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '60px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 32px',
            padding: '48px',
            border: '3px solid rgba(255, 255, 255, 0.25)',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.1)'
          }}>
            <img
              src={logoJayna}
              alt="Jayna"
              style={{
                width: '144px',
                height: '144px',
                objectFit: 'contain'
              }}
            />
          </div>
          
          <h1 style={{
            fontSize: '28px',
            fontWeight: '700',
            color: '#1a1a1a',
            margin: '0 0 8px 0',
            letterSpacing: '-0.5px'
          }}>
            Top Pix
          </h1>
          
          <p style={{
            fontSize: '16px',
            color: '#666',
            margin: '0',
            lineHeight: '1.5'
          }}>
            Digite o código do seu bilhete para verificar se é premiado
          </p>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSubmit} style={{ marginBottom: '32px' }}>
          <div style={{ marginBottom: '24px' }}>
            <input
              type="text"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.toUpperCase())}
              placeholder="Ex: A1B2C3D4E5F"
              disabled={isLoading}
              maxLength={20}
              autoComplete="off"
              style={{
                width: '100%',
                padding: '16px 20px',
                fontSize: '18px',
                fontFamily: 'monospace',
                letterSpacing: '2px',
                textAlign: 'center',
                border: '2px solid #e5e7eb',
                borderRadius: '16px',
                outline: 'none',
                transition: 'all 0.2s ease',
                background: isLoading ? '#f9fafb' : 'white',
                color: '#1a1a1a',
                fontWeight: '600'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e5e7eb';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !codigo.trim()}
            style={{
              width: '100%',
              padding: '16px 24px',
              fontSize: '16px',
              fontWeight: '600',
              color: 'white',
              background: isLoading || !codigo.trim() 
                ? '#9ca3af' 
                : 'linear-gradient(135deg, #667eea, #764ba2)',
              border: 'none',
              borderRadius: '16px',
              cursor: isLoading || !codigo.trim() ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
            onMouseOver={(e) => {
              if (!isLoading && codigo.trim()) {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.3)';
              }
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            {isLoading ? (
              <>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                Validando...
              </>
            ) : (
              <>
                <span style={{ fontSize: '18px' }}>🔍</span>
                Validar Bilhete
              </>
            )}
          </button>
        </form>

        {/* Resultado */}
        {resultado && (
          <div style={{
            padding: '24px',
            borderRadius: '16px',
            marginBottom: '24px',
            background: resultado.valido 
              ? 'linear-gradient(135deg, #d4f5d4, #a7f3d0)' 
              : 'linear-gradient(135deg, #fecaca, #fca5a5)',
            border: `2px solid ${resultado.valido ? '#10b981' : '#ef4444'}`,
            animation: 'fadeIn 0.3s ease-in-out'
          }}>
            <div style={{
              fontSize: '48px',
              marginBottom: '16px'
            }}>
              {resultado.valido ? '🎉' : '❌'}
            </div>
            
            <h3 style={{
              fontSize: '20px',
              fontWeight: '700',
              color: resultado.valido ? '#065f46' : '#991b1b',
              margin: '0 0 8px 0'
            }}>
              {resultado.valido ? 'Bilhete Válido!' : 'Bilhete Inválido'}
            </h3>
            
            <p style={{
              fontSize: '16px',
              color: resultado.valido ? '#047857' : '#b91c1c',
              margin: '0 0 16px 0',
              lineHeight: '1.5'
            }}>
              {resultado.mensagem}
            </p>

            {/* Detalhes do bilhete válido */}
            {resultado.valido && resultado.bilhete && (
              <div style={{
                background: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '12px',
                padding: '20px',
                marginTop: '16px',
                textAlign: 'left'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: '16px'
                }}>
                  <div>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#666',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}>
                      Código
                    </span>
                    <div style={{
                      fontSize: '16px',
                      fontWeight: '700',
                      fontFamily: 'monospace',
                      color: '#1a1a1a',
                      marginTop: '4px'
                    }}>
                      {resultado.bilhete.codigoUnico}
                    </div>
                  </div>
                  
                  <div>
                    <span style={{
                      fontSize: '12px',
                      fontWeight: '600',
                      color: '#666',
                      textTransform: 'uppercase',
                      letterSpacing: '1px'
                    }}>
                      Status
                    </span>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: resultado.bilhete.status === 'PREMIADO' ? '#f59e0b' : '#10b981',
                      marginTop: '4px',
                      textTransform: 'capitalize'
                    }}>
                      {bilheteService.obterTextoStatus(resultado.bilhete.status)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={limparResultado}
              style={{
                marginTop: '16px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#666',
                background: 'white',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.borderColor = '#667eea';
                e.currentTarget.style.color = '#667eea';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.borderColor = '#e5e7eb';
                e.currentTarget.style.color = '#666';
              }}
            >
              Validar Outro Bilhete
            </button>
          </div>
        )}

        {/* Mensagem de Sucesso do Resgate */}
        {sucessoResgate && (
          <div style={{
            background: 'linear-gradient(135deg, #dcfce7, #bbf7d0)',
            border: '2px solid #22c55e',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '24px',
            textAlign: 'center',
            animation: 'fadeIn 0.3s ease-in-out'
          }}>
            <div style={{
              fontSize: '32px',
              marginBottom: '12px'
            }}>
              🎉
            </div>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#166534',
              margin: '0 0 12px 0'
            }}>
              Resgate Realizado com Sucesso!
            </h3>
            <p style={{
              fontSize: '14px',
              color: '#166534',
              margin: '0',
              lineHeight: '1.5',
              whiteSpace: 'pre-line'
            }}>
              {sucessoResgate}
            </p>
          </div>
        )}

        {/* Formulário de Contato para Bilhetes Válidos */}
        {mostrarFormularioContato && resultado?.valido && (
          <div style={{
            padding: '24px',
            background: 'linear-gradient(135deg, #f0f9ff, #e0f2fe)',
            border: '2px solid #0ea5e9',
            borderRadius: '16px',
            marginBottom: '24px',
            animation: 'fadeIn 0.3s ease-in-out'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '700',
              color: '#0c4a6e',
              margin: '0 0 16px 0',
              textAlign: 'center'
            }}>
              📝 Dados para Participação
            </h3>
            
            <form onSubmit={handleEnviarContato}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '16px',
                marginBottom: '20px'
              }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#0c4a6e',
                    marginBottom: '6px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    value={dadosContato.nome}
                    onChange={(e) => handleInputContato('nome', e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: '14px',
                      border: '2px solid #e0f2fe',
                      borderRadius: '8px',
                      outline: 'none',
                      transition: 'border-color 0.2s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#0ea5e9'}
                    onBlur={(e) => e.target.style.borderColor = '#e0f2fe'}
                  />
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#0c4a6e',
                    marginBottom: '6px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    Telefone *
                  </label>
                  <input
                    type="tel"
                    value={dadosContato.telefone}
                    onChange={(e) => handleInputContato('telefone', e.target.value)}
                    required
                    placeholder="Digite apenas números: 11999999999"
                    maxLength={15}
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: '14px',
                      border: '2px solid #e0f2fe',
                      borderRadius: '8px',
                      outline: 'none',
                      transition: 'border-color 0.2s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#0ea5e9'}
                    onBlur={(e) => e.target.style.borderColor = '#e0f2fe'}
                  />
                  <div style={{
                    fontSize: '11px',
                    color: '#64748b',
                    marginTop: '4px',
                    fontStyle: 'italic'
                  }}>
                    Formatação automática: (XX) XXXXX-XXXX
                  </div>
                </div>
                
                <div>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#0c4a6e',
                    marginBottom: '6px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    Email *
                  </label>
                  <input
                    type="email"
                    value={dadosContato.email}
                    onChange={(e) => handleInputContato('email', e.target.value)}
                    required
                    placeholder="seu@email.com"
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: '14px',
                      border: '2px solid #e0f2fe',
                      borderRadius: '8px',
                      outline: 'none',
                      transition: 'border-color 0.2s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#0ea5e9'}
                    onBlur={(e) => e.target.style.borderColor = '#e0f2fe'}
                  />
                </div>
                
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{
                    display: 'block',
                    fontSize: '12px',
                    fontWeight: '600',
                    color: '#0c4a6e',
                    marginBottom: '6px',
                    textTransform: 'uppercase',
                    letterSpacing: '1px'
                  }}>
                    Chave PIX *
                  </label>
                  <input
                    type="text"
                    value={dadosContato.chavePix}
                    onChange={(e) => handleInputContato('chavePix', e.target.value)}
                    required
                    placeholder="CPF, E-mail, Telefone ou Chave Aleatória"
                    style={{
                      width: '100%',
                      padding: '12px',
                      fontSize: '14px',
                      border: '2px solid #e0f2fe',
                      borderRadius: '8px',
                      outline: 'none',
                      transition: 'border-color 0.2s ease'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#0ea5e9'}
                    onBlur={(e) => e.target.style.borderColor = '#e0f2fe'}
                  />
                </div>
              </div>
              
              {/* Mensagem de Erro */}
              {erroFormulario && (
                <div style={{
                  background: 'linear-gradient(135deg, #fee2e2, #fecaca)',
                  border: '1px solid #f87171',
                  borderRadius: '12px',
                  padding: '12px 16px',
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  animation: 'fadeIn 0.3s ease-in-out'
                }}>
                  <span style={{ fontSize: '16px' }}>⚠️</span>
                  <span style={{
                    fontSize: '13px',
                    color: '#991b1b',
                    fontWeight: '500',
                    lineHeight: '1.4'
                  }}>
                    {erroFormulario}
                  </span>
                </div>
              )}
              
              <div style={{
                display: 'flex',
                gap: '12px',
                justifyContent: 'center'
              }}>
                <button
                  type="button"
                  onClick={() => setMostrarFormularioContato(false)}
                  style={{
                    padding: '12px 20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: '#64748b',
                    background: 'white',
                    border: '2px solid #e2e8f0',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.borderColor = '#94a3b8';
                    e.currentTarget.style.color = '#475569';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.borderColor = '#e2e8f0';
                    e.currentTarget.style.color = '#64748b';
                  }}
                >
                  Cancelar
                </button>
                
                <button
                  type="submit"
                  disabled={enviandoContato}
                  style={{
                    padding: '12px 20px',
                    fontSize: '14px',
                    fontWeight: '600',
                    color: 'white',
                    background: enviandoContato 
                      ? '#94a3b8' 
                      : 'linear-gradient(135deg, #0ea5e9, #0284c7)',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: enviandoContato ? 'not-allowed' : 'pointer',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                  onMouseOver={(e) => {
                    if (!enviandoContato) {
                      e.currentTarget.style.transform = 'translateY(-1px)';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(14, 165, 233, 0.3)';
                    }
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  {enviandoContato ? (
                    <>
                      <div style={{
                        width: '16px',
                        height: '16px',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                      Enviando...
                    </>
                  ) : (
                    <>
                      ✅ Enviar Dados
                    </>
                  )}
                </button>
              </div>
            </form>
            
            <p style={{
              fontSize: '12px',
              color: '#64748b',
              textAlign: 'center',
              margin: '16px 0 0 0',
              lineHeight: '1.5'
            }}>
              * Campos obrigatórios. Seus dados serão utilizados para contato sobre a promoção.
            </p>
          </div>
        )}

        {/* Informações de Contato */}
        <div style={{
          padding: '20px',
          background: '#f8fafc',
          borderRadius: '16px',
          marginBottom: '24px'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#1a1a1a',
            margin: '0 0 12px 0'
          }}>
            🏆 Bilhete Premiado?
          </h3>
          <p style={{
            fontSize: '14px',
            color: '#666',
            margin: '0 0 12px 0',
            lineHeight: '1.5'
          }}>
            Seu prêmio será conferido e enviado automaticamente de acordo com os dados preenchidos, prencha-os com atenção:
          </p>
          <div style={{
            fontSize: '14px',
            color: '#666',
            lineHeight: '1.6'
          }}>

          </div>
        </div>

        {/* Link para Admin */}

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