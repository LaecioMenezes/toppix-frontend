import { useState } from 'react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { Card } from '../../components/Card';
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
        texto: `✅ Lote gerado com sucesso! ${response.quantidade} bilhetes criados com prefixo "${response.prefixo}"`,
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
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Gerar Bilhetes
        </h1>
        <p className="mt-2 text-gray-600">
          Crie lotes de bilhetes numerados sequencialmente com códigos únicos
        </p>
      </div>

      {/* Mensagem de feedback */}
      {mensagem && (
        <div className={`
          p-4 rounded-lg border flex items-center justify-between
          ${mensagem.tipo === 'sucesso' ? 'bg-green-50 border-green-200 text-green-800' : ''}
          ${mensagem.tipo === 'erro' ? 'bg-red-50 border-red-200 text-red-800' : ''}
          ${mensagem.tipo === 'info' ? 'bg-blue-50 border-blue-200 text-blue-800' : ''}
        `}>
          <span className="flex-1">{mensagem.texto}</span>
          <button
            onClick={dismissMensagem}
            className="ml-4 text-current hover:opacity-70"
          >
            ✕
          </button>
        </div>
      )}

      {/* Formulário */}
      <Card>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quantidade */}
            <div>
              <label htmlFor="quantidade" className="block text-sm font-medium text-gray-700 mb-2">
                Quantidade de Bilhetes *
              </label>
              <Input
                id="quantidade"
                type="number"
                min="1"
                max="10000"
                value={quantidade}
                onChange={(e) => setQuantidade(e.target.value)}
                placeholder="Ex: 500"
                required
                disabled={isLoading}
              />
              <p className="mt-1 text-sm text-gray-500">
                Mínimo: 1 | Máximo: 10.000 bilhetes
              </p>
            </div>

            {/* Prefixo */}
            <div>
              <label htmlFor="prefixo" className="block text-sm font-medium text-gray-700 mb-2">
                Prefixo dos Números *
              </label>
              <Input
                id="prefixo"
                type="text"
                maxLength={20}
                value={prefixo}
                onChange={(e) => setPrefixo(e.target.value.toUpperCase())}
                placeholder="Ex: GANHADOR"
                required
                disabled={isLoading}
              />
              <p className="mt-1 text-sm text-gray-500">
                Máximo 20 caracteres (letras maiúsculas, números e espaços)
              </p>
            </div>
          </div>

          {/* Exemplo de preview */}
          {quantidade && prefixo && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Preview dos Bilhetes:</h3>
              <div className="space-y-1 text-sm text-gray-600">
                <div>{prefixo} 001</div>
                <div>{prefixo} 002</div>
                <div>...</div>
                <div>{prefixo} {String(parseInt(quantidade) || 0).padStart(3, '0')}</div>
              </div>
            </div>
          )}

          {/* Botão de envio */}
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isLoading || !quantidade || !prefixo}
              className={`
                px-8 py-3 font-medium rounded-lg transition-all duration-200
                ${isLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
                }
              `}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Gerando bilhetes...</span>
                </div>
              ) : (
                'Gerar Lote de Bilhetes'
              )}
            </Button>
          </div>
        </form>
      </Card>

      {/* Informações adicionais */}
      <Card>
        <h3 className="font-semibold text-gray-900 mb-3">ℹ️ Informações Importantes</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>• Cada bilhete recebe um <strong>código único</strong> alfanumérico de 11 caracteres</p>
          <p>• Os números são gerados <strong>sequencialmente</strong> (ex: GANHADOR 001, GANHADOR 002...)</p>
          <p>• Todos os bilhetes são criados com status <strong>"GERADO"</strong></p>
          <p>• Cada bilhete pode ter um <strong>QR Code</strong> gerado automaticamente</p>
          <p>• PDFs podem ser gerados individualmente após a criação</p>
        </div>
      </Card>
    </div>
  );
} 