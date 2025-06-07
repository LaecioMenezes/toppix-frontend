import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useQRCodeScanner } from '../useQRCodeScanner';

// Mock do html5-qrcode
const mockHtml5QrCode = {
  start: vi.fn(),
  stop: vi.fn(),
  clear: vi.fn(),
  getState: vi.fn(() => 1), // NOT_STARTED = 1
};

vi.mock('html5-qrcode', () => ({
  Html5Qrcode: vi.fn(() => mockHtml5QrCode),
  Html5QrcodeScannerState: {
    NOT_STARTED: 1,
    SCANNING: 2,
    PAUSED: 3,
  },
}));

describe('useQRCodeScanner', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('deve inicializar com estado padrão', () => {
    const { result } = renderHook(() => useQRCodeScanner());

    expect(result.current.isScanning).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.lastResult).toBeNull();
  });

  it('deve iniciar o scanner corretamente', async () => {
    mockHtml5QrCode.start.mockResolvedValueOnce(undefined);

    const onScan = vi.fn();
    const { result } = renderHook(() => useQRCodeScanner());

    await act(async () => {
      await result.current.startScanning('qr-reader', onScan);
    });

    expect(mockHtml5QrCode.start).toHaveBeenCalledWith(
      { facingMode: 'environment' },
      { fps: 10, qrbox: { width: 250, height: 250 } },
      expect.any(Function),
      expect.any(Function)
    );
    expect(result.current.isScanning).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('deve parar o scanner corretamente', async () => {
    mockHtml5QrCode.stop.mockResolvedValueOnce(undefined);
    mockHtml5QrCode.getState.mockReturnValue(2); // SCANNING

    const { result } = renderHook(() => useQRCodeScanner());

    // Primeiro iniciar o scanner
    await act(async () => {
      await result.current.startScanning('qr-reader', vi.fn());
    });

    // Depois parar
    await act(async () => {
      await result.current.stopScanning();
    });

    expect(mockHtml5QrCode.stop).toHaveBeenCalled();
    expect(result.current.isScanning).toBe(false);
  });

  it('deve lidar com erros ao iniciar o scanner', async () => {
    const erro = new Error('Câmera não disponível');
    mockHtml5QrCode.start.mockRejectedValueOnce(erro);

    const { result } = renderHook(() => useQRCodeScanner());

    await act(async () => {
      await result.current.startScanning('qr-reader', vi.fn());
    });

    expect(result.current.isScanning).toBe(false);
    expect(result.current.error).toBe('Erro ao acessar a câmera: Câmera não disponível');
  });

  it('deve processar resultado do scan corretamente', async () => {
    const onScan = vi.fn();
    mockHtml5QrCode.start.mockImplementation((camera, config, onSuccess) => {
      // Simular um scan bem-sucedido
      setTimeout(() => onSuccess('GANHADOR123', undefined), 100);
      return Promise.resolve();
    });

    const { result } = renderHook(() => useQRCodeScanner());

    await act(async () => {
      await result.current.startScanning('qr-reader', onScan);
    });

    // Aguardar o callback ser chamado
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 150));
    });

    expect(onScan).toHaveBeenCalledWith('GANHADOR123');
    expect(result.current.lastResult).toBe('GANHADOR123');
  });
}); 