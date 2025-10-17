import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ReportCard } from './ReportCard';
import { useToast } from '@/hooks/use-toast';
import { 
  FileText, 
  Calendar, 
  Users, 
  DollarSign, 
  TrendingUp,
  Download,
  RefreshCw
} from 'lucide-react';

type ReportType = 'weekly' | 'monthly' | 'patients' | 'appointments' | 'financial';

interface ReportData {
  weekly?: {
    completed_appointments: number;
    unique_patients: number;
    estimated_revenue: number;
  };
  monthly?: {
    completed_appointments: number;
    unique_patients: number;
    estimated_revenue: number;
    period: string;
  };
  patients?: Array<{
    patient_id: string;
    patient_name: string;
    appointment_count: number;
    last_appointment: string;
  }>;
  appointments?: Array<{
    id: string;
    patient_name: string;
    appointment_date: string;
    appointment_time: string;
    status: string;
    amount: number;
  }>;
  financial?: {
    completed_appointments: number;
    average_value: number;
    total_revenue: number;
    period: string;
  };
}

export function Reports() {
  const [reportType, setReportType] = useState<ReportType>('weekly');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const { toast } = useToast();

  const loadReport = async () => {
    setLoading(true);
    
    try {
      let url = `/api/reports.php?type=${reportType}`;
      
      if (startDate) url += `&start_date=${startDate}`;
      if (endDate) url += `&end_date=${endDate}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setReportData({ [reportType]: result.data });
        toast({
          title: "✅ Relatório carregado",
          description: "Os dados foram carregados com sucesso.",
        });
      } else {
        toast({
          title: "❌ Erro ao carregar relatório",
          description: result.message || "Não foi possível carregar os dados.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao carregar relatório:', error);
      toast({
        title: "❌ Erro de conexão",
        description: "Não foi possível conectar ao servidor.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getReportTitle = () => {
    switch (reportType) {
      case 'weekly': return 'Relatório Semanal';
      case 'monthly': return 'Relatório Mensal';
      case 'patients': return 'Relatório de Pacientes';
      case 'appointments': return 'Relatório de Consultas';
      case 'financial': return 'Relatório Financeiro';
      default: return 'Relatório';
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Relatórios</h1>
          <p className="text-muted-foreground">Visualize estatísticas e gere relatórios detalhados</p>
        </div>
        <Button variant="outline" size="sm" className="gap-2">
          <Download className="h-4 w-4" />
          Exportar PDF
        </Button>
      </div>

      {/* Filters Card */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <Label htmlFor="reportType" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Tipo de Relatório
            </Label>
            <Select value={reportType} onValueChange={(value: ReportType) => setReportType(value)}>
              <SelectTrigger id="reportType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="weekly">Semanal</SelectItem>
                <SelectItem value="monthly">Mensal</SelectItem>
                <SelectItem value="patients">Pacientes</SelectItem>
                <SelectItem value="appointments">Consultas</SelectItem>
                <SelectItem value="financial">Financeiro</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {(reportType === 'monthly' || reportType === 'patients' || reportType === 'appointments' || reportType === 'financial') && (
            <>
              <div className="space-y-2">
                <Label htmlFor="startDate" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Data Início
                </Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate" className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Data Fim
                </Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="flex items-end">
            <Button 
              onClick={loadReport} 
              disabled={loading}
              className="w-full gap-2"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Carregando...
                </>
              ) : (
                <>
                  <TrendingUp className="h-4 w-4" />
                  Gerar Relatório
                </>
              )}
            </Button>
          </div>
        </div>
      </Card>

      {/* Report Results */}
      {reportData && (
        <div className="space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">{getReportTitle()}</h2>

          {/* Weekly Report */}
          {reportData.weekly && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ReportCard
                title="Consultas Realizadas"
                value={reportData.weekly.completed_appointments}
                icon={Calendar}
                description="Últimos 7 dias"
              />
              <ReportCard
                title="Pacientes Atendidos"
                value={reportData.weekly.unique_patients}
                icon={Users}
                description="Únicos"
              />
              <ReportCard
                title="Receita Estimada"
                value={formatCurrency(reportData.weekly.estimated_revenue)}
                icon={DollarSign}
                description="Total da semana"
              />
            </div>
          )}

          {/* Monthly Report */}
          {reportData.monthly && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ReportCard
                title="Consultas Realizadas"
                value={reportData.monthly.completed_appointments}
                icon={Calendar}
                description={reportData.monthly.period}
              />
              <ReportCard
                title="Pacientes Atendidos"
                value={reportData.monthly.unique_patients}
                icon={Users}
                description="Únicos no período"
              />
              <ReportCard
                title="Receita Estimada"
                value={formatCurrency(reportData.monthly.estimated_revenue)}
                icon={DollarSign}
                description="Total do período"
              />
            </div>
          )}

          {/* Patients Report */}
          {reportData.patients && reportData.patients.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Lista de Pacientes</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr className="text-left">
                      <th className="pb-3 font-medium text-foreground">Paciente</th>
                      <th className="pb-3 font-medium text-foreground">Consultas</th>
                      <th className="pb-3 font-medium text-foreground">Última Consulta</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.patients.map((patient, index) => (
                      <tr key={index} className="border-b last:border-0">
                        <td className="py-3 text-foreground">{patient.patient_name}</td>
                        <td className="py-3 text-muted-foreground">{patient.appointment_count}</td>
                        <td className="py-3 text-muted-foreground">
                          {patient.last_appointment ? formatDate(patient.last_appointment) : 'N/A'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Appointments Report */}
          {reportData.appointments && reportData.appointments.length > 0 && (
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Lista de Consultas</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr className="text-left">
                      <th className="pb-3 font-medium text-foreground">Paciente</th>
                      <th className="pb-3 font-medium text-foreground">Data</th>
                      <th className="pb-3 font-medium text-foreground">Horário</th>
                      <th className="pb-3 font-medium text-foreground">Status</th>
                      <th className="pb-3 font-medium text-foreground">Valor</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.appointments.map((appointment, index) => (
                      <tr key={index} className="border-b last:border-0">
                        <td className="py-3 text-foreground">{appointment.patient_name}</td>
                        <td className="py-3 text-muted-foreground">{formatDate(appointment.appointment_date)}</td>
                        <td className="py-3 text-muted-foreground">{appointment.appointment_time}</td>
                        <td className="py-3">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            appointment.status === 'completed' 
                              ? 'bg-secondary/10 text-secondary' 
                              : appointment.status === 'cancelled'
                              ? 'bg-destructive/10 text-destructive'
                              : 'bg-primary/10 text-primary'
                          }`}>
                            {appointment.status === 'completed' ? 'Concluído' : 
                             appointment.status === 'cancelled' ? 'Cancelado' : 'Agendado'}
                          </span>
                        </td>
                        <td className="py-3 text-muted-foreground">{formatCurrency(appointment.amount || 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}

          {/* Financial Report */}
          {reportData.financial && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ReportCard
                title="Consultas Concluídas"
                value={reportData.financial.completed_appointments}
                icon={Calendar}
                description={reportData.financial.period}
              />
              <ReportCard
                title="Valor Médio por Consulta"
                value={formatCurrency(reportData.financial.average_value)}
                icon={TrendingUp}
                description="Média do período"
              />
              <ReportCard
                title="Receita Total"
                value={formatCurrency(reportData.financial.total_revenue)}
                icon={DollarSign}
                description="Total do período"
              />
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!reportData && !loading && (
        <Card className="p-12 text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-medium text-foreground mb-2">Nenhum relatório carregado</h3>
          <p className="text-muted-foreground mb-4">
            Selecione o tipo de relatório e clique em "Gerar Relatório" para visualizar os dados.
          </p>
        </Card>
      )}
    </div>
  );
}
