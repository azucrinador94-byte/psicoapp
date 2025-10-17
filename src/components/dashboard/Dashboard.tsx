import { DashboardStats } from './DashboardStats';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Users, TrendingUp, Clock } from 'lucide-react';
import { DashboardStats as Stats, Appointment, Patient } from '@/types';

interface DashboardProps {
  stats: Stats;
  recentAppointments: Appointment[];
  recentPatients: Patient[];
  onNavigate: (tab: string) => void;
}

export function Dashboard({ stats, recentAppointments, recentPatients, onNavigate }: DashboardProps) {
  const formatTime = (time: string) => {
    return time.substring(0, 5);
  };

  const getUpcomingAppointments = () => {
    const now = new Date();
    return recentAppointments
      .filter(apt => {
        const aptDate = new Date(apt.date + 'T' + apt.time);
        return aptDate > now && apt.status === 'scheduled';
      })
      .sort((a, b) => new Date(a.date + 'T' + a.time).getTime() - new Date(b.date + 'T' + b.time).getTime())
      .slice(0, 5);
  };

  const upcomingAppointments = getUpcomingAppointments();

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground">Bem-vindo ao seu painel de controle</p>
      </div>

      {/* Stats */}
      <DashboardStats stats={stats} />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Upcoming Appointments */}
        <Card className="lg:col-span-2 p-6 shadow-soft">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Próximas Consultas
            </h2>
            <Button variant="outline" size="sm" onClick={() => onNavigate('calendar')}>
              Ver Agenda
            </Button>
          </div>

          <div className="space-y-4">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center gap-4 p-4 rounded-lg bg-muted hover:bg-accent transition-smooth">
                  <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">{appointment.patientName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {new Date(appointment.date).toLocaleDateString('pt-BR')} às {formatTime(appointment.time)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-foreground">{appointment.duration} min</p>
                    <p className="text-xs text-muted-foreground">Agendado</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Nenhuma consulta agendada</h3>
                <p className="text-muted-foreground mb-4">Que tal agendar uma consulta?</p>
                <Button onClick={() => onNavigate('calendar')} variant="gradient">
                  <Calendar className="h-4 w-4 mr-2" />
                  Agendar Consulta
                </Button>
              </div>
            )}
          </div>
        </Card>

        {/* Recent Patients */}
        <Card className="p-6 shadow-soft">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <Users className="h-5 w-5 text-secondary" />
              Pacientes Recentes
            </h2>
            <Button variant="outline" size="sm" onClick={() => onNavigate('patients')}>
              Ver Todos
            </Button>
          </div>

          <div className="space-y-4">
            {recentPatients.slice(0, 5).map((patient) => (
              <div key={patient.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-smooth">
                <div className="w-10 h-10 bg-gradient-secondary rounded-full flex items-center justify-center">
                  <span className="text-secondary-foreground font-medium text-sm">
                    {patient.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                  </span>
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-foreground text-sm">{patient.name}</h3>
                  <p className="text-xs text-muted-foreground">{patient.email}</p>
                </div>
              </div>
            ))}
          </div>

          {recentPatients.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Nenhum paciente</h3>
              <p className="text-muted-foreground mb-4">Adicione seu primeiro paciente</p>
              <Button onClick={() => onNavigate('patients')} variant="gradient-secondary">
                <Users className="h-4 w-4 mr-2" />
                Adicionar Paciente
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6 shadow-soft">
        <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Ações Rápidas
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            variant="gradient" 
            className="h-16 text-left justify-start gap-4"
            onClick={() => onNavigate('patients')}
          >
            <Users className="h-6 w-6" />
            <div>
              <p className="font-medium">Adicionar Paciente</p>
              <p className="text-sm opacity-90">Cadastrar novo paciente</p>
            </div>
          </Button>
          
          <Button 
            variant="gradient-secondary" 
            className="h-16 text-left justify-start gap-4"
            onClick={() => onNavigate('calendar')}
          >
            <Calendar className="h-6 w-6" />
            <div>
              <p className="font-medium">Agendar Consulta</p>
              <p className="text-sm opacity-90">Marcar nova consulta</p>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="h-16 text-left justify-start gap-4"
            onClick={() => onNavigate('reports')}
          >
            <TrendingUp className="h-6 w-6" />
            <div>
              <p className="font-medium">Ver Relatórios</p>
              <p className="text-sm text-muted-foreground">Análises e métricas</p>
            </div>
          </Button>
        </div>
      </Card>
    </div>
  );
}