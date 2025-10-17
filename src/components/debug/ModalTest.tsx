import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';

export function ModalTest() {
  const [showTestModal, setShowTestModal] = useState(false);

  if (!showTestModal) {
    return (
      <div className="fixed bottom-20 left-4 z-[100]">
        <Button
          onClick={() => {
            console.log('🧪 Abrindo modal de teste');
            setShowTestModal(true);
          }}
          variant="outline"
          size="sm"
        >
          Testar Modal
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md p-6 shadow-large">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Modal de Teste</h2>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => {
              console.log('🧪 Fechando modal de teste');
              setShowTestModal(false);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-4">
          <p>Se você está vendo este modal, significa que a renderização de modals está funcionando!</p>
          <p className="text-sm text-muted-foreground">
            O problema pode estar nas importações ou na lógica específica dos modais de anamnese/histórico.
          </p>
          <Button
            onClick={() => setShowTestModal(false)}
            className="w-full"
          >
            Fechar
          </Button>
        </div>
      </Card>
    </div>
  );
}