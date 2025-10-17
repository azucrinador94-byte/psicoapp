import { useEffect, useState } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle2, XCircle, AlertCircle, Loader2 } from 'lucide-react';

interface ConnectionTest {
  name: string;
  endpoint: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
}

export function ConnectionStatus() {
  const [tests, setTests] = useState<ConnectionTest[]>([
    { name: 'Servidor Web', endpoint: '/api/user.php', status: 'pending', message: 'Testando...' },
    { name: 'Banco de Dados', endpoint: '/api/patients.php', status: 'pending', message: 'Testando...' },
    { name: 'API Consultas', endpoint: '/api/appointments.php', status: 'pending', message: 'Testando...' },
  ]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const runTests = async () => {
      for (let i = 0; i < tests.length; i++) {
        const test = tests[i];
        try {
          const response = await fetch(test.endpoint);
          const text = await response.text();
          
          let newStatus: ConnectionTest['status'] = 'success';
          let message = 'Conectado ✅';

          if (response.status === 401 || text.includes('Unauthorized')) {
            newStatus = 'warning';
            message = 'Servidor OK, mas sem autenticação';
          } else if (!response.ok) {
            newStatus = 'error';
            message = `Erro HTTP ${response.status}`;
          }

          setTests(prev => prev.map((t, idx) => 
            idx === i ? { ...t, status: newStatus, message } : t
          ));
        } catch (error) {
          setTests(prev => prev.map((t, idx) => 
            idx === i 
              ? { 
                  ...t, 
                  status: 'error', 
                  message: error instanceof Error ? error.message : 'Erro de conexão' 
                } 
              : t
          ));
        }
      }
    };

    runTests();
  }, []);

  const hasErrors = tests.some(t => t.status === 'error');
  const allSuccess = tests.every(t => t.status === 'success' || t.status === 'warning');
  const isPending = tests.some(t => t.status === 'pending');

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-[100] px-3 py-2 rounded-lg bg-background border shadow-lg hover:shadow-xl transition-shadow text-sm"
      >
        🔍 Ver Status
      </button>
    );
  }

  const getIcon = (status: ConnectionTest['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      default:
        return <Loader2 className="h-4 w-4 animate-spin" />;
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-[100] w-96">
      <Alert variant={hasErrors ? "destructive" : "default"}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <AlertTitle className="flex items-center gap-2">
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : hasErrors ? (
                <XCircle className="h-4 w-4" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Status do Sistema
            </AlertTitle>
            <AlertDescription className="mt-3 space-y-2">
              {tests.map((test, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2">
                    {getIcon(test.status)}
                    {test.name}
                  </span>
                  <span className="text-muted-foreground">{test.message}</span>
                </div>
              ))}
              
              {hasErrors && (
                <div className="mt-4 pt-3 border-t text-xs">
                  <strong>⚠️ Servidor PHP não está ativo!</strong>
                  <ul className="mt-2 space-y-1 list-disc list-inside">
                    <li>Iniciar Apache no XAMPP</li>
                    <li>Iniciar MySQL no XAMPP</li>
                    <li>Verificar: php check-environment.php</li>
                  </ul>
                </div>
              )}

              {allSuccess && tests.every(t => t.status === 'warning') && (
                <div className="mt-4 pt-3 border-t text-xs">
                  <strong>⚠️ Autenticação não implementada</strong>
                  <p className="mt-1">
                    Use a versão PHP: <br />
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">
                      /psicoapp/index.php
                    </code>
                  </p>
                </div>
              )}
            </AlertDescription>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-xs hover:underline ml-2"
          >
            ✕
          </button>
        </div>
      </Alert>
    </div>
  );
}
