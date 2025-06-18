import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { QrCode, Gift, AlertCircle, CheckCircle2, Scan, User, Phone, Mail, CreditCard } from 'lucide-react';
import { useBilhetes } from '../hooks/useBilhetes';
import type { ValidarBilheteResponse } from '../types';

// Schema de validação para o bilhete
const validarBilheteSchema = z.object({
  codigo: z.string().min(1, 'Código é obrigatório'),
});

// Schema de validação para os dados do ganhador
const dadosGanhadorSchema = z.object({
  nomeCompleto: z.string().min(2, 'Nome completo é obrigatório'),
  telefone: z.string().min(10, 'Telefone deve ter pelo menos 10 dígitos'),
  email: z.string().email('Email deve ser válido'),
  chavePix: z.string().min(1, 'Chave PIX é obrigatória'),
});

type ValidarBilheteForm = z.infer<typeof validarBilheteSchema>;
type DadosGanhadorForm = z.infer<typeof dadosGanhadorSchema>;

export function ValidarBilhete() {
  const [resultado, setResultado] = useState<ValidarBilheteResponse | null>(null);
  const [mostrarQRScanner, setMostrarQRScanner] = useState(false);
  const [mostrarFormularioGanhador, setMostrarFormularioGanhador] = useState(false);
  const [dadosEnviados, setDadosEnviados] = useState(false);
  const [enviandoDados, setEnviandoDados] = useState(false);
  const { validarBilhete, carregando } = useBilhetes();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<ValidarBilheteForm>({
    resolver: zodResolver(validarBilheteSchema),
  });

  const {
    register: registerGanhador,
    handleSubmit: handleSubmitGanhador,
    formState: { errors: errorsGanhador },
    reset: resetGanhador,
  } = useForm<DadosGanhadorForm>({
    resolver: zodResolver(dadosGanhadorSchema),
  });

  const onSubmit = async (data: ValidarBilheteForm) => {
    const response = await validarBilhete(data);
    setResultado(response);
    
    // Se for um bilhete premiado, mostrar formulário de dados
    if (response.tipo === 'sucesso' && response.bilhete?.valor) {
      setMostrarFormularioGanhador(true);
    }
  };

  const onSubmitDadosGanhador = async (data: DadosGanhadorForm) => {
    setEnviandoDados(true);
    
    try {
      // Simular envio dos dados (aqui você faria a chamada para a API)
      console.log('Dados do ganhador:', {
        bilhete: resultado?.bilhete,
        dadosGanhador: data
      });
      
      // Simular delay da API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setDadosEnviados(true);
      setMostrarFormularioGanhador(false);
    } catch (error) {
      console.error('Erro ao enviar dados:', error);
    } finally {
      setEnviandoDados(false);
    }
  };

  const handleNovaValidacao = () => {
    setResultado(null);
    setMostrarFormularioGanhador(false);
    setDadosEnviados(false);
    reset();
    resetGanhador();
  };

  const formatarValor = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #eff6ff 0%, #f1f5f9 100%)', 
      padding: '16px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ 
        maxWidth: '448px', 
        margin: '0 auto', 
        paddingTop: '32px' 
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <QrCode style={{ 
            width: '64px', 
            height: '64px', 
            margin: '0 auto 16px', 
            color: '#3b82f6' 
          }} />
          <h1 style={{ 
            fontSize: '30px', 
            fontWeight: 'bold', 
            color: '#1f2937', 
            marginBottom: '8px' 
          }}>
            Top Pix - Validar Bilhete
          </h1>
          <p style={{ color: '#6b7280' }}>
            Digite o código ou escaneie o QR Code do seu bilhete Top Pix
          </p>
        </div>

        {!resultado ? (
          /* Formulário de Validação */
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '32px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            marginBottom: '24px'
          }}>
            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600',
                  color: '#374151',
                  fontSize: '14px'
                }}>
                  Código do Bilhete
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Ex: GANHADOR-ABC123"
                    style={{
                      width: '100%',
                      padding: '16px 16px 16px 48px',
                      border: '2px solid #d1d5db',
                      borderRadius: '12px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      backgroundColor: 'white'
                    }}
                    {...register('codigo')}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                  <QrCode style={{
                    position: 'absolute',
                    left: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '20px',
                    height: '20px',
                    color: '#6b7280'
                  }} />
                </div>
                {errors.codigo && (
                  <p style={{
                    color: '#ef4444',
                    fontSize: '14px',
                    marginTop: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <AlertCircle style={{ width: '16px', height: '16px' }} />
                    {errors.codigo.message}
                  </p>
                )}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  type="submit"
                  disabled={carregando}
                  style={{
                    width: '100%',
                    padding: '16px',
                    backgroundColor: carregando ? '#9ca3af' : '#3b82f6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '18px',
                    fontWeight: 'bold',
                    cursor: carregando ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onMouseOver={(e) => {
                    if (!carregando) e.currentTarget.style.backgroundColor = '#2563eb';
                  }}
                  onMouseOut={(e) => {
                    if (!carregando) e.currentTarget.style.backgroundColor = '#3b82f6';
                  }}
                >
                  {carregando ? (
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
                    'Validar'
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setMostrarQRScanner(true)}
                  style={{
                    width: '100%',
                    padding: '16px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#e5e7eb'}
                  onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#f3f4f6'}
                >
                  <Scan size={20} />
                  Escanear QR Code
                </button>
              </div>
            </form>
          </div>
        ) : (
          /* Resultado da Validação */
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '32px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            textAlign: 'center',
            marginBottom: '24px'
          }}>
            {resultado.tipo === 'sucesso' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  margin: '0 auto',
                  backgroundColor: '#22c55e',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Gift style={{ width: '40px', height: '40px', color: 'white' }} />
                </div>
                <div>
                  <h2 style={{ 
                    fontSize: '24px', 
                    fontWeight: 'bold', 
                    color: '#16a34a', 
                    marginBottom: '8px' 
                  }}>
                    🎉 Parabéns!
                  </h2>
                  <p style={{ color: '#374151', marginBottom: '16px' }}>
                    {resultado.mensagem}
                  </p>
                  {resultado.bilhete?.valor && (
                    <div style={{
                      backgroundColor: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      borderRadius: '12px',
                      padding: '16px'
                    }}>
                      <p style={{ 
                        fontSize: '30px', 
                        fontWeight: 'bold', 
                        color: '#16a34a',
                        margin: 0
                      }}>
                        {formatarValor(resultado.bilhete.valor)}
                      </p>
                      <p style={{ 
                        fontSize: '14px', 
                        color: '#16a34a', 
                        marginTop: '4px',
                        margin: 0
                      }}>
                        Valor do prêmio
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {resultado.tipo === 'aviso' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  margin: '0 auto',
                  backgroundColor: '#eab308',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <CheckCircle2 style={{ width: '40px', height: '40px', color: 'white' }} />
                </div>
                <div>
                  <h2 style={{ 
                    fontSize: '24px', 
                    fontWeight: 'bold', 
                    color: '#ca8a04', 
                    marginBottom: '8px' 
                  }}>
                    Bilhete Válido
                  </h2>
                  <p style={{ color: '#374151' }}>
                    {resultado.mensagem}
                  </p>
                </div>
              </div>
            )}

            {resultado.tipo === 'erro' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  margin: '0 auto',
                  backgroundColor: '#ef4444',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <AlertCircle style={{ width: '40px', height: '40px', color: 'white' }} />
                </div>
                <div>
                  <h2 style={{ 
                    fontSize: '24px', 
                    fontWeight: 'bold', 
                    color: '#dc2626', 
                    marginBottom: '8px' 
                  }}>
                    Bilhete Inválido
                  </h2>
                  <p style={{ color: '#374151' }}>
                    {resultado.mensagem}
                  </p>
                </div>
              </div>
            )}

            {/* Informações do bilhete */}
            {resultado.bilhete && (
              <div style={{
                backgroundColor: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '16px',
                textAlign: 'left',
                marginTop: '16px'
              }}>
                <h3 style={{ 
                  fontWeight: '600', 
                  color: '#1f2937', 
                  marginBottom: '12px',
                  margin: '0 0 12px 0'
                }}>
                  Detalhes do Bilhete
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Número:</span>
                    <span style={{ fontWeight: '500' }}>{resultado.bilhete.numero}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Código:</span>
                    <span style={{ fontWeight: '500' }}>{resultado.bilhete.codigo}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Status:</span>
                    <span style={{ 
                      fontWeight: '500', 
                      textTransform: 'capitalize',
                      color: resultado.bilhete.status === 'premiado' ? '#16a34a' : 
                            resultado.bilhete.status === 'ativo' ? '#ca8a04' : '#6b7280'
                    }}>
                      {resultado.bilhete.status}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#6b7280' }}>Criado em:</span>
                    <span style={{ fontWeight: '500' }}>
                      {resultado.bilhete.dataCriacao.toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Mostrar confirmação se dados foram enviados */}
            {dadosEnviados && (
              <div style={{
                backgroundColor: '#f0fdf4',
                border: '1px solid #bbf7d0',
                borderRadius: '12px',
                padding: '16px',
                marginTop: '16px',
                textAlign: 'center'
              }}>
                <CheckCircle2 style={{ 
                  width: '32px', 
                  height: '32px', 
                  color: '#16a34a', 
                  margin: '0 auto 8px' 
                }} />
                <p style={{ 
                  color: '#16a34a', 
                  fontWeight: 'bold', 
                  margin: 0 
                }}>
                  ✅ Dados enviados com sucesso!
                </p>
                <p style={{ 
                  color: '#6b7280', 
                  fontSize: '14px', 
                  margin: '4px 0 0 0' 
                }}>
                  Entraremos em contato em breve para processar seu prêmio.
                </p>
              </div>
            )}

            {/* Botão para nova validação - só aparece se não estiver mostrando formulário */}
            {!mostrarFormularioGanhador && (
              <button
                onClick={handleNovaValidacao}
                style={{
                  width: '100%',
                  padding: '16px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  marginTop: '24px'
                }}
                onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#3b82f6'}
              >
                Validar Novo Bilhete
              </button>
            )}
          </div>
        )}

        {/* Formulário de Dados do Ganhador */}
        {mostrarFormularioGanhador && (
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: '16px',
            padding: '32px',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
            marginBottom: '24px'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <User style={{ 
                width: '48px', 
                height: '48px', 
                margin: '0 auto 16px', 
                color: '#16a34a' 
              }} />
              <h3 style={{ 
                fontSize: '24px', 
                fontWeight: 'bold', 
                color: '#1f2937', 
                marginBottom: '8px',
                margin: '0 0 8px 0'
              }}>
                Dados do Ganhador
              </h3>
              <p style={{ color: '#6b7280', margin: 0 }}>
                Preencha seus dados para receber o prêmio via PIX
              </p>
            </div>

            <form onSubmit={handleSubmitGanhador(onSubmitDadosGanhador)} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              {/* Nome Completo */}
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600',
                  color: '#374151',
                  fontSize: '14px'
                }}>
                  Nome Completo *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="Digite seu nome completo"
                    style={{
                      width: '100%',
                      padding: '12px 12px 12px 44px',
                      border: '2px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      backgroundColor: 'white'
                    }}
                    {...registerGanhador('nomeCompleto')}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                  <User style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '20px',
                    height: '20px',
                    color: '#6b7280'
                  }} />
                </div>
                {errorsGanhador.nomeCompleto && (
                  <p style={{
                    color: '#ef4444',
                    fontSize: '14px',
                    marginTop: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <AlertCircle style={{ width: '16px', height: '16px' }} />
                    {errorsGanhador.nomeCompleto.message}
                  </p>
                )}
              </div>

              {/* Telefone */}
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600',
                  color: '#374151',
                  fontSize: '14px'
                }}>
                  Telefone *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="tel"
                    placeholder="(11) 99999-9999"
                    style={{
                      width: '100%',
                      padding: '12px 12px 12px 44px',
                      border: '2px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      backgroundColor: 'white'
                    }}
                    {...registerGanhador('telefone')}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                  <Phone style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '20px',
                    height: '20px',
                    color: '#6b7280'
                  }} />
                </div>
                {errorsGanhador.telefone && (
                  <p style={{
                    color: '#ef4444',
                    fontSize: '14px',
                    marginTop: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <AlertCircle style={{ width: '16px', height: '16px' }} />
                    {errorsGanhador.telefone.message}
                  </p>
                )}
              </div>

              {/* Email */}
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600',
                  color: '#374151',
                  fontSize: '14px'
                }}>
                  Email *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="email"
                    placeholder="seu@email.com"
                    style={{
                      width: '100%',
                      padding: '12px 12px 12px 44px',
                      border: '2px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      backgroundColor: 'white'
                    }}
                    {...registerGanhador('email')}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                  <Mail style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '20px',
                    height: '20px',
                    color: '#6b7280'
                  }} />
                </div>
                {errorsGanhador.email && (
                  <p style={{
                    color: '#ef4444',
                    fontSize: '14px',
                    marginTop: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <AlertCircle style={{ width: '16px', height: '16px' }} />
                    {errorsGanhador.email.message}
                  </p>
                )}
              </div>

              {/* Chave PIX */}
              <div>
                <label style={{ 
                  display: 'block', 
                  marginBottom: '8px', 
                  fontWeight: '600',
                  color: '#374151',
                  fontSize: '14px'
                }}>
                  Chave PIX *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder="CPF, telefone, email ou chave aleatória"
                    style={{
                      width: '100%',
                      padding: '12px 12px 12px 44px',
                      border: '2px solid #d1d5db',
                      borderRadius: '8px',
                      fontSize: '16px',
                      outline: 'none',
                      transition: 'border-color 0.2s',
                      backgroundColor: 'white'
                    }}
                    {...registerGanhador('chavePix')}
                    onFocus={(e) => e.target.style.borderColor = '#3b82f6'}
                    onBlur={(e) => e.target.style.borderColor = '#d1d5db'}
                  />
                  <CreditCard style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '20px',
                    height: '20px',
                    color: '#6b7280'
                  }} />
                </div>
                {errorsGanhador.chavePix && (
                  <p style={{
                    color: '#ef4444',
                    fontSize: '14px',
                    marginTop: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <AlertCircle style={{ width: '16px', height: '16px' }} />
                    {errorsGanhador.chavePix.message}
                  </p>
                )}
              </div>

              {/* Botões */}
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button
                  type="button"
                  onClick={() => setMostrarFormularioGanhador(false)}
                  disabled={enviandoDados}
                  style={{
                    flex: 1,
                    padding: '16px',
                    backgroundColor: '#6b7280',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: enviandoDados ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s',
                    opacity: enviandoDados ? 0.5 : 1
                  }}
                  onMouseOver={(e) => {
                    if (!enviandoDados) e.currentTarget.style.backgroundColor = '#4b5563';
                  }}
                  onMouseOut={(e) => {
                    if (!enviandoDados) e.currentTarget.style.backgroundColor = '#6b7280';
                  }}
                >
                  Cancelar
                </button>
                
                <button
                  type="submit"
                  disabled={enviandoDados}
                  style={{
                    flex: 2,
                    padding: '16px',
                    backgroundColor: enviandoDados ? '#9ca3af' : '#16a34a',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: '600',
                    cursor: enviandoDados ? 'not-allowed' : 'pointer',
                    transition: 'background-color 0.2s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px'
                  }}
                  onMouseOver={(e) => {
                    if (!enviandoDados) e.currentTarget.style.backgroundColor = '#15803d';
                  }}
                  onMouseOut={(e) => {
                    if (!enviandoDados) e.currentTarget.style.backgroundColor = '#16a34a';
                  }}
                >
                  {enviandoDados ? (
                    <>
                      <div style={{
                        width: '20px',
                        height: '20px',
                        border: '2px solid rgba(255, 255, 255, 0.3)',
                        borderTop: '2px solid white',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite'
                      }} />
                      Enviando...
                    </>
                  ) : (
                    'Enviar Dados'
                  )}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Scanner QR (placeholder) */}
        {mostrarQRScanner && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{
              backgroundColor: 'white',
              borderRadius: '16px',
              padding: '32px',
              textAlign: 'center',
              maxWidth: '400px',
              margin: '16px'
            }}>
              <h3 style={{ marginBottom: '16px', color: '#1f2937' }}>
                Scanner QR Code
              </h3>
              <p style={{ marginBottom: '24px', color: '#6b7280' }}>
                Funcionalidade de scanner será implementada em breve
              </p>
              <button
                onClick={() => setMostrarQRScanner(false)}
                style={{
                  padding: '12px 24px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Fechar
              </button>
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