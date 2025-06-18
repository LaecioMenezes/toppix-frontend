import { describe, it, expect, vi, beforeEach } from 'vitest';
import { bilheteService } from '../bilheteService';
import type { GerarBilhetesRequest, FiltrosBilhetes } from '../../types';

// Mock do fetch global
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('BilheteService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('gerarBilhetes', () => {
    it('deve gerar bilhetes com os parâmetros corretos', async () => {
      const parametros: GerarBilhetesRequest = {
        quantidade: 10,
        prefixo: 'GANHADOR',
        valor: 50,
        dataExpiracao: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      };

      const mockResponse = {
        sucesso: true,
        dados: Array.from({ length: 10 }, (_, i) => ({
          id: `bilhete-${i}`,
          numero: `${i + 1}`.padStart(6, '0'),
          codigo: `GANHADOR-${Math.random().toString(36).toUpperCase().substring(2, 8)}`,
          prefixo: 'GANHADOR',
          status: 'ativo',
          valor: 50,
          dataCriacao: new Date(),
          dataExpiracao: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
        })),
        mensagem: '10 bilhetes gerados com sucesso!'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const resultado = await bilheteService.gerarBilhetes(parametros);

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3001/api/bilhetes/gerar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parametros),
      });

      expect(resultado.dados).toHaveLength(10);
      expect(resultado.dados?.[0].prefixo).toBe('GANHADOR');
    });

    it('deve lançar erro quando a API falhar', async () => {
      const parametros: GerarBilhetesRequest = {
        quantidade: 5,
        prefixo: 'TESTE'
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ mensagem: 'Parâmetros inválidos' }),
      });

      await expect(bilheteService.gerarBilhetes(parametros)).rejects.toThrow('Parâmetros inválidos');
    });
  });

  describe('listarBilhetes', () => {
    it('deve listar bilhetes com filtros aplicados', async () => {
      const filtros: FiltrosBilhetes = {
        status: 'ativo',
        prefixo: 'GANHADOR'
      };

      const mockResponse = {
        sucesso: true,
        dados: [
          {
            id: 'bilhete-1',
            numero: '000001',
            codigo: 'GANHADOR-ABC123',
            prefixo: 'GANHADOR',
            status: 'ativo',
            valor: 50,
            dataCriacao: new Date(),
            dataExpiracao: new Date()
          }
        ],
        mensagem: 'Bilhetes encontrados'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const resultado = await bilheteService.listarBilhetes(filtros);

      expect(resultado.dados).toHaveLength(1);
      expect(resultado.dados?.[0].status).toBe('ativo');
    });
  });

  describe('validarBilhete', () => {
    it('deve validar código premiado corretamente', async () => {
      const dados = { codigo: 'GANHADOR123' };
      const mockResponse = {
        sucesso: true,
        dados: {
          valido: true,
          bilhete: {
            id: 'bilhete-1',
            numero: '000001',
            codigo: 'GANHADOR123',
            prefixo: 'GANHADOR',
            status: 'ativo',
            valor: 100,
            dataCriacao: new Date(),
            dataExpiracao: new Date()
          },
          mensagem: 'Parabéns! Você ganhou R$ 100,00!',
          tipo: 'sucesso'
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const resultado = await bilheteService.validarBilhete(dados);

      expect(resultado.valido).toBe(true);
      expect(resultado.bilhete?.valor).toBe(100);
      expect(resultado.tipo).toBe('sucesso');
    });

    it('deve retornar erro para código inválido', async () => {
      const dados = { codigo: 'INVALIDO123' };
      const mockResponse = {
        sucesso: false,
        dados: {
          valido: false,
          mensagem: 'Código não encontrado ou inválido',
          tipo: 'erro'
        }
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const resultado = await bilheteService.validarBilhete(dados);

      expect(resultado.valido).toBe(false);
      expect(resultado.tipo).toBe('erro');
    });
  });
}); 