import { useState, useRef, useCallback, useEffect } from 'react';
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode';

interface UseQRCodeScannerReturn {
  isScanning: boolean;
  error: string | null;
  lastResult: string | null;
  startScanning: (elementId: string, onScan: (result: string) => void) => Promise<void>;
  stopScanning: () => Promise<void>;
  clearError: () => void;
}

export const useQRCodeScanner = (): UseQRCodeScannerReturn => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const startScanning = useCallback(async (elementId: string, onScan: (result: string) => void) => {
    try {
      setError(null);
      
      // Criar nova instância se não existir
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode(elementId);
      }

      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        aspectRatio: 1.0,
      };

      const onScanSuccess = (decodedText: string) => {
        setLastResult(decodedText);
        onScan(decodedText);
      };

      const onScanError = (errorMessage: string) => {
        // Ignorar erros de scan contínuos (quando não há QR code na vista)
        // Apenas logar erros reais
        if (!errorMessage.includes('No QR code found')) {
          console.warn('QR Code scan error:', errorMessage);
        }
      };

      await scannerRef.current.start(
        { facingMode: 'environment' }, // Usar câmera traseira
        config,
        onScanSuccess,
        onScanError
      );

      setIsScanning(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(`Erro ao acessar a câmera: ${errorMessage}`);
      setIsScanning(false);
    }
  }, []);

  const stopScanning = useCallback(async () => {
    try {
      if (scannerRef.current && scannerRef.current.getState() === Html5QrcodeScannerState.SCANNING) {
        await scannerRef.current.stop();
      }
      setIsScanning(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(`Erro ao parar o scanner: ${errorMessage}`);
    }
  }, []);

  // Cleanup quando o componente for desmontado
  const cleanup = useCallback(async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.getState() === Html5QrcodeScannerState.SCANNING) {
          await scannerRef.current.stop();
        }
        await scannerRef.current.clear();
      } catch (err) {
        console.warn('Erro ao limpar scanner:', err);
      }
      scannerRef.current = null;
    }
  }, []);

  // Limpar quando o hook for desmontado
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  return {
    isScanning,
    error,
    lastResult,
    startScanning,
    stopScanning,
    clearError,
  };
}; 