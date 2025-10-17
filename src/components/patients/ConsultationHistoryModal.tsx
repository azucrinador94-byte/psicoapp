import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, X, Plus, Clock, FileText, TrendingUp, Heart, Target, BookOpen } from 'lucide-react';
import { ConsultationHistory, Patient } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { consultationService } from '@/services/api';

interface ConsultationHistoryModalProps {
  patient: Patient;
  onClose: () => void;
}

export function ConsultationHistoryModal({ patient, onClose }: ConsultationHistoryModalProps) {
  console.log('🎯 ConsultationHistoryModal montado para:', patient.name);
  
  const [sessions, setSessions] = useState<ConsultationHistory[]>([]);
  const [stats, setStats] = useState<any>({});
  const [showNewSession, setShowNewSession] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const [newSession, setNewSession] = useState<ConsultationHistory>({
    patient_id: patient.id,
    session_number: 1,
    session_date: new Date().toISOString().split('T')[0],
    session_notes: '',
    observations: '',
    homework: '',
    next_session_goals: '',
    patient_mood: 'neutral',
    session_duration: 50
  });

  useEffect(() => {
    loadConsultationHistory();
  }, [patient.id]);

  const loadConsultationHistory = async () => {
    console.log('🔄 ConsultationHistoryModal: Iniciando carregamento para paciente', patient.id);
    setIsLoading(true);
    try {
      const { consultationService } = await import('@/services/api');
      
      const [sessionsData, statsData] = await Promise.all([
        consultationService.getHistory(patient.id),
        consultationService.getStats(patient.id)
      ]);
      
      setSessions(sessionsData);
      setStats(statsData);
      console.log('✅ Histórico carregado com sucesso');
      
      // Set next session number
      setNewSession(prev => ({
        ...prev,
        session_number: sessionsData.length + 1
      }));
      
    } catch (error) {
      console.error('❌ Erro ao carregar histórico:', error);
      setSessions([]);
      setStats({ total_sessions: 0, last_session_date: '', average_duration: 0 });
      toast({
        title: "Modo Offline",
        description: "Usando dados vazios. Sessões serão salvas localmente.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSession = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newSession.session_notes) {
      toast({
        title: "Atenção",
        description: "Por favor, preencha as notas da sessão.",
        variant: "destructive",
      });
      return;
    }

    console.log('💾 ConsultationHistoryModal: Salvando nova sessão');
    setLoading(true);
    try {
      const { consultationService } = await import('@/services/api');
      
      const result = await consultationService.saveSession(newSession);

      toast({
        title: "Sucesso",
        description: result.message || "Sessão registrada com sucesso!",
      });

      setShowNewSession(false);
      
      // Reset form
      setNewSession({
        patient_id: patient.id,
        session_number: sessions.length + 2,
        session_date: new Date().toISOString().split('T')[0],
        session_notes: '',
        observations: '',
        homework: '',
        next_session_goals: '',
        patient_mood: 'neutral',
        session_duration: 50
      });

      // Recarregar histórico
      await loadConsultationHistory();

    } catch (error) {
      console.error('❌ Erro ao salvar sessão:', error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar a sessão. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getMoodColor = (mood: string) => {
    switch (mood) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'neutral': return 'bg-gray-100 text-gray-800';
      case 'poor': return 'bg-orange-100 text-orange-800';
      case 'very_poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMoodLabel = (mood: string) => {
    switch (mood) {
      case 'excellent': return 'Excelente';
      case 'good': return 'Bom';
      case 'neutral': return 'Neutro';
      case 'poor': return 'Ruim';
      case 'very_poor': return 'Muito Ruim';
      default: return 'Neutro';
    }
  };

  if (isLoading) {
    return (
      <Dialog open={true} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh]">
          <div className="flex items-center justify-center p-8">
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
              <p className="text-sm text-muted-foreground">Carregando histórico...</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Histórico de Consultas - {patient.name}
          </DialogTitle>
          <div className="flex gap-2 mt-2">
            <Button variant="gradient" size="sm" onClick={() => setShowNewSession(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova Sessão
            </Button>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6">
            <Tabs defaultValue="history" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="history">Histórico de Sessões</TabsTrigger>
                <TabsTrigger value="stats">Estatísticas</TabsTrigger>
              </TabsList>

              <TabsContent value="history" className="space-y-4 mt-6">
                {showNewSession && (
                  <Card className="p-6 border-primary">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-foreground">Nova Sessão</h3>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setShowNewSession(false)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>

                    <form onSubmit={handleSaveSession} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="session_date">Data da Sessão</Label>
                          <Input
                            id="session_date"
                            type="date"
                            value={newSession.session_date}
                            onChange={(e) => setNewSession(prev => ({ ...prev, session_date: e.target.value }))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="session_duration">Duração (min)</Label>
                          <Input
                            id="session_duration"
                            type="number"
                            value={newSession.session_duration}
                            onChange={(e) => setNewSession(prev => ({ ...prev, session_duration: parseInt(e.target.value) }))}
                            className="mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="patient_mood">Humor do Paciente</Label>
                          <Select 
                            value={newSession.patient_mood} 
                            onValueChange={(value) => setNewSession(prev => ({ ...prev, patient_mood: value as any }))}
                          >
                            <SelectTrigger className="mt-1">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="excellent">Excelente</SelectItem>
                              <SelectItem value="good">Bom</SelectItem>
                              <SelectItem value="neutral">Neutro</SelectItem>
                              <SelectItem value="poor">Ruim</SelectItem>
                              <SelectItem value="very_poor">Muito Ruim</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="session_notes">Notas da Sessão</Label>
                        <Textarea
                          id="session_notes"
                          value={newSession.session_notes}
                          onChange={(e) => setNewSession(prev => ({ ...prev, session_notes: e.target.value }))}
                          placeholder="Descreva o que foi trabalhado na sessão..."
                          className="mt-1 min-h-[100px]"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="homework">Tarefas para Casa</Label>
                          <Textarea
                            id="homework"
                            value={newSession.homework}
                            onChange={(e) => setNewSession(prev => ({ ...prev, homework: e.target.value }))}
                            placeholder="Tarefas e exercícios para o paciente..."
                            className="mt-1"
                            rows={3}
                          />
                        </div>
                        <div>
                          <Label htmlFor="next_session_goals">Objetivos Próxima Sessão</Label>
                          <Textarea
                            id="next_session_goals"
                            value={newSession.next_session_goals}
                            onChange={(e) => setNewSession(prev => ({ ...prev, next_session_goals: e.target.value }))}
                            placeholder="Objetivos para a próxima sessão..."
                            className="mt-1"
                            rows={3}
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="observations">Observações</Label>
                        <Textarea
                          id="observations"
                          value={newSession.observations}
                          onChange={(e) => setNewSession(prev => ({ ...prev, observations: e.target.value }))}
                          placeholder="Observações importantes sobre a sessão..."
                          className="mt-1"
                          rows={3}
                        />
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button type="submit" variant="gradient" disabled={loading}>
                          {loading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                              Salvando...
                            </>
                          ) : (
                            'Salvar Sessão'
                          )}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setShowNewSession(false)}>
                          Cancelar
                        </Button>
                      </div>
                    </form>
                  </Card>
                )}

                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {sessions.map((session) => (
                      <Card key={session.id} className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary">Sessão {session.session_number}</Badge>
                            <Badge className={getMoodColor(session.patient_mood)}>
                              <Heart className="h-3 w-3 mr-1" />
                              {getMoodLabel(session.patient_mood)}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {new Date(session.session_date).toLocaleDateString('pt-BR')}
                            <Clock className="h-4 w-4 ml-2" />
                            {session.session_duration} min
                          </div>
                        </div>

                        {session.session_notes && (
                          <div className="mb-3">
                            <p className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              Notas da Sessão
                            </p>
                            <p className="text-sm">{session.session_notes}</p>
                          </div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                          {session.homework && (
                            <div>
                              <p className="text-muted-foreground mb-1 flex items-center gap-1">
                                <BookOpen className="h-3 w-3" />
                                Tarefas para Casa
                              </p>
                              <p>{session.homework}</p>
                            </div>
                          )}
                          {session.next_session_goals && (
                            <div>
                              <p className="text-muted-foreground mb-1 flex items-center gap-1">
                                <Target className="h-3 w-3" />
                                Objetivos Próxima Sessão
                              </p>
                              <p>{session.next_session_goals}</p>
                            </div>
                          )}
                        </div>

                        {session.observations && (
                          <>
                            <Separator className="my-3" />
                            <div>
                              <p className="text-sm text-muted-foreground mb-1">Observações</p>
                              <p className="text-sm">{session.observations}</p>
                            </div>
                          </>
                        )}
                      </Card>
                    ))}

                    {sessions.length === 0 && (
                      <Card className="p-8 text-center">
                        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-foreground mb-2">
                          Nenhuma sessão registrada
                        </h3>
                        <p className="text-muted-foreground mb-4">
                          Comece registrando a primeira sessão com este paciente
                        </p>
                        <Button variant="gradient" onClick={() => setShowNewSession(true)}>
                          <Plus className="h-4 w-4 mr-2" />
                          Registrar Primeira Sessão
                        </Button>
                      </Card>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>

              <TabsContent value="stats" className="space-y-4 mt-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Total de Sessões</p>
                        <p className="text-2xl font-semibold">{stats.total_sessions || 0}</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center gap-2">
                      <Clock className="h-5 w-5 text-secondary" />
                      <div>
                        <p className="text-sm text-muted-foreground">Tempo Total</p>
                        <p className="text-2xl font-semibold">{stats.total_duration || 0}h</p>
                      </div>
                    </div>
                  </Card>
                  <Card className="p-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-500" />
                      <div>
                        <p className="text-sm text-muted-foreground">Humor Médio</p>
                        <p className="text-2xl font-semibold">{stats.avg_mood || 'N/A'}</p>
                      </div>
                    </div>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}