import { describe, it, expect, vi, beforeEach } from 'vitest';
import { bilheteService } from '../bilheteService';
import type { GerarLoteRequest, FiltrosBilhetes } from '../../types';

// Mock do fetch global
const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('BilheteService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('gerarLote', () => {
    it('deve gerar lote de bilhetes com os parâmetros corretos', async () => {
      const parametros: GerarLoteRequest = {
        quantidade: 10,
        prefixo: 'GANHADOR'
      };

      const mockResponse = {
        quantidade: 10,
        prefixo: 'GANHADOR',
        primeiroNumero: 1,
        ultimoNumero: 10,
        createdAt: new Date().toISOString()
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const resultado = await bilheteService.gerarLote(parametros);

      expect(mockFetch).toHaveBeenCalledWith('http://localhost:3000/api/bilhetes/gerar-lote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(parametros),
      });

      expect(resultado.quantidade).toBe(10);
      expect(resultado.prefixo).toBe('GANHADOR');
    });

    it('deve lançar erro quando a API falhar', async () => {
      const parametros: GerarLoteRequest = {
        quantidade: 5,
        prefixo: 'TESTE'
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: () => Promise.resolve({ message: 'Parâmetros inválidos' }),
      });

      await expect(bilheteService.gerarLote(parametros)).rejects.toThrow('Parâmetros inválidos');
    });
  });

  describe('listarBilhetes', () => {
    it('deve listar bilhetes com filtros aplicados', async () => {
      const filtros: FiltrosBilhetes = {
        status: 'GERADO',
        dataInicio: '2024-01-01',
        dataFim: '2024-01-31'
      };

      const mockResponse = [
        {
          id: 'bilhete-1',
          numeroSequencial: 'GANHADOR 001',
          codigoUnico: 'A1B2C3D4E5F',
          qrCodeRef: 'qr-ref-1',
          pdfUrl: undefined,
          status: 'GERADO',
          createdAt: '2024-01-01T10:30:00Z',
          updatedAt: '2024-01-01T10:30:00Z',
          dataResgate: undefined,
          usuarioId: 'user-1',
          usuario: undefined
        }
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const resultado = await bilheteService.listarBilhetes(filtros);

      expect(resultado).toHaveLength(1);
      expect(resultado[0].status).toBe('GERADO');
    });
  });

  describe('validarBilhete', () => {
    it('deve validar código premiado corretamente', async () => {
      const codigo = 'A1B2C3D4E5F';
      const mockResponse = {
        valido: true,
        bilhete: {
          id: 'bilhete-1',
          numeroSequencial: 'GANHADOR 001',
          codigoUnico: 'A1B2C3D4E5F',
          qrCodeRef: 'qr-ref-1',
          pdfUrl: undefined,
          status: 'PREMIADO',
          createdAt: '2024-01-01T10:30:00Z',
          updatedAt: '2024-01-01T12:00:00Z',
          dataResgate: '2024-01-01T12:00:00Z',
          usuarioId: 'user-1',
          usuario: undefined
        },
        mensagem: 'Parabéns! Você ganhou!',
        tipo: 'sucesso'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const resultado = await bilheteService.validarBilhete(codigo);

      expect(resultado.valido).toBe(true);
      expect(resultado.bilhete?.status).toBe('PREMIADO');
      expect(resultado.tipo).toBe('sucesso');
    });

    it('deve retornar erro para código inválido', async () => {
      const codigo = 'INVALIDO123';
      const mockResponse = {
        valido: false,
        mensagem: 'Código não encontrado ou inválido',
        tipo: 'erro'
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const resultado = await bilheteService.validarBilhete(codigo);

      expect(resultado.valido).toBe(false);
      expect(resultado.tipo).toBe('erro');
    });
  });

  describe('formatarDataBrasileira', () => {
    it('deve formatar data ISO para formato brasileiro', () => {
      const dataISO = '2024-01-15T10:30:00Z';
      const resultado = bilheteService.formatarDataBrasileira(dataISO);
      
      expect(resultado).toMatch(/15\/01\/2024/);
    });
  });

  describe('validarFormatoCodigo', () => {
    it('deve validar códigos válidos', () => {
      expect(bilheteService.validarFormatoCodigo('A1B2C3')).toBe(true);
      expect(bilheteService.validarFormatoCodigo('GANHADOR123')).toBe(true);
    });

    it('deve rejeitar códigos inválidos', () => {
      expect(bilheteService.validarFormatoCodigo('AB')).toBe(false);
      expect(bilheteService.validarFormatoCodigo('')).toBe(false);
    });
  });
}); 