import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Save, X, FileText, AlertCircle } from 'lucide-react';
import { PatientAnamnesis, Patient } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { anamnesisService } from '@/services/api';

interface PatientAnamnesisModalProps {
  patient: Patient;
  onClose: () => void;
}

export function PatientAnamnesisModal({ patient, onClose }: PatientAnamnesisModalProps) {
  console.log('🎯 PatientAnamnesisModal montado para:', patient.name);
  
  const [formData, setFormData] = useState<PatientAnamnesis>({
    patient_id: patient.id,
    complaint: '',
    history_illness: '',
    previous_treatments: '',
    medications: '',
    family_history: '',
    personal_history: '',
    social_history: '',
    observations: ''
  });
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    console.log('🔄 useEffect loadAnamnesis chamado');
    loadAnamnesis();
  }, [patient.id]);

  const loadAnamnesis = async () => {
    console.log('🔄 PatientAnamnesisModal: Iniciando carregamento para paciente', patient.id);
    setIsLoading(true);
    
    try {
      const { anamnesisService } = await import('@/services/api');
      const data = await anamnesisService.get(patient.id);
      
      setFormData({
        id: data.id,
        patient_id: patient.id,
        complaint: data.complaint || '',
        history_illness: data.history_illness || '',
        previous_treatments: data.previous_treatments || '',
        medications: data.medications || '',
        family_history: data.family_history || '',
        personal_history: data.personal_history || '',
        social_history: data.social_history || '',
        observations: data.observations || ''
      });
      console.log('✅ Anamnese carregada com sucesso');
    } catch (error) {
      console.error('❌ Erro ao carregar anamnese:', error);
      // Initialize with empty form
      setFormData({
        patient_id: patient.id,
        complaint: '',
        history_illness: '',
        previous_treatments: '',
        medications: '',
        family_history: '',
        personal_history: '',
        social_history: '',
        observations: ''
      });
      toast({
        title: "Modo Offline",
        description: "Usando formulário vazio. Dados serão salvos localmente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('💾 PatientAnamnesisModal: Salvando anamnese');
    setLoading(true);
    
    try {
      const { anamnesisService } = await import('@/services/api');
      const result = await anamnesisService.save(formData);

      toast({
        title: "Sucesso",
        description: result.message || "Anamnese salva com sucesso!",
      });

      onClose();
    } catch (error) {
      console.error('❌ Erro ao salvar anamnese:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a anamnese. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof PatientAnamnesis, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <div className="flex items-center justify-center p-8">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground">Carregando anamnese...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Anamnese - {patient.name}
          </DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            <Tabs defaultValue="complaint" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="complaint">Queixa Principal</TabsTrigger>
                <TabsTrigger value="history">História</TabsTrigger>
                <TabsTrigger value="family">Família & Social</TabsTrigger>
                <TabsTrigger value="observations">Observações</TabsTrigger>
              </TabsList>

              <TabsContent value="complaint" className="space-y-4 mt-6">
                <div>
                  <Label htmlFor="complaint">Queixa Principal</Label>
                  <Textarea
                    id="complaint"
                    value={formData.complaint}
                    onChange={(e) => handleChange('complaint', e.target.value)}
                    placeholder="Descreva a principal queixa do paciente..."
                    className="mt-1 min-h-[120px]"
                  />
                </div>
                <div>
                  <Label htmlFor="medications">Medicamentos Atuais</Label>
                  <Textarea
                    id="medications"
                    value={formData.medications}
                    onChange={(e) => handleChange('medications', e.target.value)}
                    placeholder="Liste os medicamentos em uso..."
                    className="mt-1"
                    rows={4}
                  />
                </div>
              </TabsContent>

              <TabsContent value="history" className="space-y-4 mt-6">
                <div>
                  <Label htmlFor="history_illness">História da Doença Atual</Label>
                  <Textarea
                    id="history_illness"
                    value={formData.history_illness}
                    onChange={(e) => handleChange('history_illness', e.target.value)}
                    placeholder="Descreva a evolução da doença atual..."
                    className="mt-1 min-h-[120px]"
                  />
                </div>
                <div>
                  <Label htmlFor="previous_treatments">Tratamentos Anteriores</Label>
                  <Textarea
                    id="previous_treatments"
                    value={formData.previous_treatments}
                    onChange={(e) => handleChange('previous_treatments', e.target.value)}
                    placeholder="Descreva tratamentos psicológicos ou psiquiátricos anteriores..."
                    className="mt-1"
                    rows={4}
                  />
                </div>
                <div>
                  <Label htmlFor="personal_history">História Pessoal</Label>
                  <Textarea
                    id="personal_history"
                    value={formData.personal_history}
                    onChange={(e) => handleChange('personal_history', e.target.value)}
                    placeholder="Desenvolvimento, educação, relacionamentos, trabalho..."
                    className="mt-1"
                    rows={4}
                  />
                </div>
              </TabsContent>

              <TabsContent value="family" className="space-y-4 mt-6">
                <div>
                  <Label htmlFor="family_history">História Familiar</Label>
                  <Textarea
                    id="family_history"
                    value={formData.family_history}
                    onChange={(e) => handleChange('family_history', e.target.value)}
                    placeholder="História de doenças mentais na família, relacionamentos familiares..."
                    className="mt-1 min-h-[120px]"
                  />
                </div>
                <div>
                  <Label htmlFor="social_history">História Social</Label>
                  <Textarea
                    id="social_history"
                    value={formData.social_history}
                    onChange={(e) => handleChange('social_history', e.target.value)}
                    placeholder="Relacionamentos sociais, suporte social, atividades..."
                    className="mt-1"
                    rows={4}
                  />
                </div>
              </TabsContent>

              <TabsContent value="observations" className="space-y-4 mt-6">
                <div>
                  <Label htmlFor="observations">Observações Gerais</Label>
                  <Textarea
                    id="observations"
                    value={formData.observations}
                    onChange={(e) => handleChange('observations', e.target.value)}
                    placeholder="Observações importantes, impressões clínicas, plano terapêutico..."
                    className="mt-1 min-h-[200px]"
                  />
                </div>
              </TabsContent>
            </Tabs>

            <div className="flex gap-3 pt-4 border-t">
              <Button 
                type="submit" 
                variant="gradient" 
                className="flex-1" 
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Salvar Anamnese
                  </>
                )}
              </Button>
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}