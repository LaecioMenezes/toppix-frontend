import { describe, it, expect, vi, beforeEach } from 'vitest';
import { bilheteService } from '../bilheteService';
import type { ParametrosGeracao, FiltrosBilhete } from '../../types';

// Mock do fetch global
global.fetch = vi.fn();

describe('BilheteService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('gerarBilhetes', () => {
    it('deve gerar bilhetes com os parâmetros corretos', async () => {
      const parametros: ParametrosGeracao = {
        quantidade: 10,
        prefixo: 'GANHADOR',
        percentualPremiados: 20,
        valorMinimoPremio: 10,
        valorMaximoPremio: 100
      };

      const mockResponse = {
        bilhetes: Array.from({ length: 10 }, (_, i) => ({
          id: `bilhete-${i}`,
          numero: `${i + 1}`.padStart(6, '0'),
          codigo: `GANHADOR${i + 1}`,
          prefixo: 'GANHADOR',
          status: 'ativo',
          premiado: i < 2,
          valorPremio: i < 2 ? 50 : undefined,
          dataGeracao: new Date(),
          dataExpiracao: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        }))
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const resultado = await bilheteService.gerarBilhetes(parametros);

      expect(fetch).toHaveBeenCalledWith('/api/bilhetes/gerar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parametros),
      });

      expect(resultado.bilhetes).toHaveLength(10);
      expect(resultado.bilhetes[0].prefixo).toBe('GANHADOR');
    });

    it('deve lançar erro quando a API falhar', async () => {
      const parametros: ParametrosGeracao = {
        quantidade: 5,
        prefixo: 'TESTE'
      };

      (fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ erro: 'Parâmetros inválidos' }),
      });

      await expect(bilheteService.gerarBilhetes(parametros)).rejects.toThrow('Erro ao gerar bilhetes: Parâmetros inválidos');
    });
  });

  describe('listarBilhetes', () => {
    it('deve listar bilhetes com filtros aplicados', async () => {
      const filtros: FiltrosBilhete = {
        status: 'ativo',
        premiado: true
      };

      const mockResponse = {
        itens: [
          {
            id: 'bilhete-1',
            numero: '000001',
            codigo: 'GANHADOR1',
            prefixo: 'GANHADOR',
            status: 'ativo',
            premiado: true,
            valorPremio: 50,
            dataGeracao: new Date(),
            dataExpiracao: new Date()
          }
        ],
        total: 1,
        pagina: 1,
        itensPorPagina: 10,
        totalPaginas: 1
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const resultado = await bilheteService.listarBilhetes(filtros, 1, 10);

      expect(resultado.itens).toHaveLength(1);
      expect(resultado.itens[0].premiado).toBe(true);
    });
  });

  describe('validarCodigo', () => {
    it('deve validar código premiado corretamente', async () => {
      const codigo = 'GANHADOR123';
      const mockResponse = {
        valido: true,
        bilhete: {
          id: 'bilhete-1',
          numero: '000001',
          codigo: 'GANHADOR123',
          prefixo: 'GANHADOR',
          status: 'ativo',
          premiado: true,
          valorPremio: 100,
          dataGeracao: new Date(),
          dataExpiracao: new Date()
        },
        mensagem: 'Parabéns! Você ganhou R$ 100,00!',
        tipo: 'sucesso'
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const resultado = await bilheteService.validarCodigo(codigo);

      expect(resultado.valido).toBe(true);
      expect(resultado.bilhete?.premiado).toBe(true);
      expect(resultado.tipo).toBe('sucesso');
    });

    it('deve retornar erro para código inválido', async () => {
      const codigo = 'INVALIDO123';
      const mockResponse = {
        valido: false,
        mensagem: 'Código não encontrado ou inválido',
        tipo: 'erro'
      };

      (fetch as any).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const resultado = await bilheteService.validarCodigo(codigo);

      expect(resultado.valido).toBe(false);
      expect(resultado.tipo).toBe('erro');
    });
  });
}); 