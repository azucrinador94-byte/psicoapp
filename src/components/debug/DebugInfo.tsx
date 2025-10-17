import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bug, X, Copy, Check } from 'lucide-react';
import { useDebugMode } from '@/hooks/useDebugMode';

export function DebugInfo() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const { isDebugMode } = useDebugMode();

  if (!isDebugMode) return null;

  const systemInfo = {
    browser: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,
    screen: `${screen.width}x${screen.height}`,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    colorDepth: screen.colorDepth,
    pixelDepth: screen.pixelDepth,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    memory: (navigator as any).deviceMemory || 'N/A',
    cores: navigator.hardwareConcurrency || 'N/A'
  };

  const apiEndpoints = [
    '/api/patients.php',
    '/api/appointments.php', 
    '/api/anamnesis.php',
    '/api/consultation-history.php',
    '/api/pricing.php',
    '/api/user.php'
  ];

  const handleCopyInfo = async () => {
    const info = `
PsicoApp - Debug Information
===========================
Timestamp: ${new Date().toISOString()}

System Information:
${Object.entries(systemInfo).map(([key, value]) => `${key}: ${value}`).join('\n')}

API Endpoints:
${apiEndpoints.join('\n')}

Current URL: ${window.location.href}
Referrer: ${document.referrer || 'N/A'}
    `.trim();

    try {
      await navigator.clipboard.writeText(info);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erro ao copiar:', error);
    }
  };

  const testApiEndpoint = async (endpoint: string) => {
    try {
      console.log(`🧪 Testando endpoint: ${endpoint}`);
      const response = await fetch(endpoint);
      const result = await response.text();
      console.log(`📡 ${endpoint} - Status: ${response.status}`, result);
      return { status: response.status, ok: response.ok };
    } catch (error) {
      console.error(`❌ Erro ao testar ${endpoint}:`, error);
      return { status: 0, ok: false, error };
    }
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-4 left-4 z-[100]">
        <Button
          onClick={() => setIsOpen(true)}
          variant="outline"
          size="sm"
          className="bg-background/80 backdrop-blur-sm"
        >
          <Bug className="h-4 w-4 mr-2" />
          Debug
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[100]">
      <Card className="w-full max-w-4xl max-h-[80vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <Bug className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Debug Information</h2>
            <Badge variant="outline">Dev Mode</Badge>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleCopyInfo}
              variant="outline"
              size="sm"
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              {copied ? 'Copiado!' : 'Copiar Info'}
            </Button>
            <Button
              onClick={() => setIsOpen(false)}
              variant="ghost"
              size="icon"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="overflow-y-auto max-h-[calc(80vh-80px)]">
          <Tabs defaultValue="system" className="p-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="system">Sistema</TabsTrigger>
              <TabsTrigger value="api">APIs</TabsTrigger>
              <TabsTrigger value="console">Console</TabsTrigger>
            </TabsList>
            
            <TabsContent value="system" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(systemInfo).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center p-3 bg-muted rounded">
                    <span className="font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <code className="text-sm bg-background px-2 py-1 rounded">{String(value)}</code>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="api" className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Clique nos endpoints para testá-los:
                </p>
                {apiEndpoints.map((endpoint) => (
                  <div key={endpoint} className="flex items-center justify-between p-3 bg-muted rounded">
                    <code className="text-sm">{endpoint}</code>
                    <Button
                      onClick={() => testApiEndpoint(endpoint)}
                      variant="outline"
                      size="sm"
                    >
                      Testar
                    </Button>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="console" className="space-y-4">
              <div className="bg-black text-green-400 p-4 rounded font-mono text-sm h-64 overflow-y-auto">
                <div>🚀 Console do navegador ativo</div>
                <div>💡 Abra as ferramentas de desenvolvedor (F12) para ver logs detalhados</div>
                <div>🔧 Use window.toggleDebug() para alternar modo debug</div>
                <div className="text-yellow-400 mt-4">
                  📋 Comandos úteis:
                </div>
                <div>• console.clear() - Limpar console</div>
                <div>• localStorage.clear() - Limpar storage</div>
                <div>• location.reload() - Recarregar página</div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </Card>
    </div>
  );
}