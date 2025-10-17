import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { X, FileText } from 'lucide-react';

// Versão simplificada do modal de anamnese para testar
export function SimpleAnamnesisTest() {
  const [showModal, setShowModal] = useState(false);

  if (!showModal) {
    return (
      <div className="fixed bottom-32 left-4 z-[100]">
        <Button
          onClick={() => {
            console.log('🧪 Abrindo anamnese simples');
            setShowModal(true);
          }}
          variant="outline"
          size="sm"
        >
          <FileText className="h-4 w-4 mr-2" />
          Test Anamnese
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl p-6 shadow-large">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Anamnese Simples</h2>
          </div>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => {
              console.log('🧪 Fechando anamnese simples');
              setShowModal(false);
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-4">
          <p>Se este modal simples está funcionando, então o problema não é com a renderização de modals em si.</p>
          <p className="text-sm text-muted-foreground">
            O problema pode estar nos componentes complexos PatientAnamnesisModal ou ConsultationHistoryModal.
          </p>
          <div className="flex gap-2">
            <Button onClick={() => setShowModal(false)} className="flex-1">
              Fechar
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}