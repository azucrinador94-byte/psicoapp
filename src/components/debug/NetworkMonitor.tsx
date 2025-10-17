import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Wifi, WifiOff } from 'lucide-react';

interface NetworkError {
  id: string;
  timestamp: Date;
  url: string;
  status: number;
  error: string;
}

export function NetworkMonitor() {
  const [networkErrors, setNetworkErrors] = useState<NetworkError[]>([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log('🟢 Conectado à internet');
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log('🔴 Desconectado da internet');
    };

    // Monitorar mudanças de conectividade
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Interceptar fetch para monitorar erros de rede
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      try {
        const response = await originalFetch(...args);
        
        if (!response.ok) {
          const error: NetworkError = {
            id: crypto.randomUUID(),
            timestamp: new Date(),
            url: args[0].toString(),
            status: response.status,
            error: `HTTP ${response.status} - ${response.statusText}`
          };
          
          setNetworkErrors(prev => [...prev.slice(-4), error]);
          console.error('🚨 Erro de rede capturado:', error);
        }
        
        return response;
      } catch (error) {
        const networkError: NetworkError = {
          id: crypto.randomUUID(),
          timestamp: new Date(),
          url: args[0].toString(),
          status: 0,
          error: error instanceof Error ? error.message : 'Erro de conexão'
        };
        
        setNetworkErrors(prev => [...prev.slice(-4), networkError]);
        console.error('🚨 Erro de rede capturado:', networkError);
        throw error;
      }
    };

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.fetch = originalFetch;
    };
  }, []);

  if (!isOnline) {
    return (
      <div className="fixed top-4 right-4 z-[100] w-80">
        <Alert variant="destructive">
          <WifiOff className="h-4 w-4" />
          <AlertTitle>Sem conexão</AlertTitle>
          <AlertDescription>
            Você está desconectado da internet. Algumas funcionalidades podem não funcionar.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (networkErrors.length === 0) {
    return null;
  }

  const latestError = networkErrors[networkErrors.length - 1];
  const timeAgo = Math.floor((Date.now() - latestError.timestamp.getTime()) / 1000);

  return (
    <div className="fixed bottom-4 right-4 z-[100] w-80">
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erro de rede detectado</AlertTitle>
        <AlertDescription className="space-y-1">
          <div className="text-xs">
            <strong>URL:</strong> {latestError.url.split('/').pop()}
          </div>
          <div className="text-xs">
            <strong>Erro:</strong> {latestError.error}
          </div>
          <div className="text-xs text-muted-foreground">
            {timeAgo < 60 ? `${timeAgo}s atrás` : `${Math.floor(timeAgo/60)}m atrás`}
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
}