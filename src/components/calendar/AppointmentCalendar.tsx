import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, Plus, User } from 'lucide-react';
import { Appointment } from '@/types';

interface AppointmentCalendarProps {
  appointments: Appointment[];
  onAddAppointment: () => void;
  onCompleteAppointment?: (appointmentId: number, patientId: number) => void;
}

export function AppointmentCalendar({ appointments, onAddAppointment, onCompleteAppointment }: AppointmentCalendarProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const getAppointmentsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return appointments.filter(apt => apt.date === dateString);
  };

  const todayAppointments = getAppointmentsForDate(selectedDate);

  const getStatusColor = (status: Appointment['status']) => {
    switch (status) {
      case 'scheduled': return 'bg-primary';
      case 'completed': return 'bg-secondary';
      case 'cancelled': return 'bg-destructive';
      default: return 'bg-muted';
    }
  };

  const getStatusLabel = (status: Appointment['status']) => {
    switch (status) {
      case 'scheduled': return 'Agendado';
      case 'completed': return 'Concluído';
      case 'cancelled': return 'Cancelado';
      default: return 'Desconhecido';
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Agenda</h1>
          <p className="text-muted-foreground">Gerencie seus agendamentos</p>
        </div>
        <Button onClick={onAddAppointment} variant="gradient" className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Consulta
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-2 p-6 shadow-soft">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {formatDate(selectedDate)}
          </h2>
          
          {/* Quick Date Navigation */}
          <div className="flex gap-2 mb-6 flex-wrap">
            {[-1, 0, 1, 2, 3].map(offset => {
              const date = new Date();
              date.setDate(date.getDate() + offset);
              const isSelected = date.toDateString() === selectedDate.toDateString();
              
              return (
                <Button
                  key={offset}
                  variant={isSelected ? "gradient" : "outline"}
                  size="sm"
                  onClick={() => setSelectedDate(date)}
                  className="flex-shrink-0"
                >
                  {offset === 0 ? 'Hoje' : 
                   offset === 1 ? 'Amanhã' :
                   date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
                  }
                </Button>
              );
            })}
          </div>

          {/* Appointments for Selected Date */}
          <div className="space-y-4">
            {todayAppointments.length > 0 ? (
              todayAppointments.map((appointment) => (
                <Card key={appointment.id} className="p-4 border-l-4 border-l-primary shadow-soft">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-foreground">{appointment.patientName}</span>
                        <Badge className={getStatusColor(appointment.status)}>
                          {getStatusLabel(appointment.status)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{appointment.time} ({appointment.duration} min)</span>
                      </div>
                      {appointment.notes && (
                        <p className="text-sm text-muted-foreground mt-2">{appointment.notes}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Editar</Button>
                      {appointment.status === 'scheduled' && (
                        <Button 
                          variant="gradient-secondary" 
                          size="sm"
                          onClick={() => onCompleteAppointment?.(appointment.id, appointment.patientId)}
                        >
                          Concluir
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <Card className="p-8 text-center border-dashed shadow-soft">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  Nenhuma consulta agendada
                </h3>
                <p className="text-muted-foreground mb-4">
                  Não há consultas marcadas para este dia
                </p>
                <Button onClick={onAddAppointment} variant="gradient">
                  <Plus className="h-4 w-4 mr-2" />
                  Agendar Consulta
                </Button>
              </Card>
            )}
          </div>
        </Card>

        {/* Quick Stats */}
        <div className="space-y-6">
          <Card className="p-6 shadow-soft">
            <h3 className="text-lg font-semibold mb-4">Resumo do Dia</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total de consultas</span>
                <Badge variant="secondary">{todayAppointments.length}</Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Agendadas</span>
                <Badge className="bg-primary">
                  {todayAppointments.filter(apt => apt.status === 'scheduled').length}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Concluídas</span>
                <Badge className="bg-secondary">
                  {todayAppointments.filter(apt => apt.status === 'completed').length}
                </Badge>
              </div>
            </div>
          </Card>

          <Card className="p-6 shadow-soft">
            <h3 className="text-lg font-semibold mb-4">Próximas Consultas</h3>
            <div className="space-y-3">
              {appointments
                .filter(apt => new Date(apt.date + 'T' + apt.time) > new Date() && apt.status === 'scheduled')
                .slice(0, 3)
                .map((appointment) => (
                  <div key={appointment.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{appointment.patientName}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(appointment.date).toLocaleDateString('pt-BR')} às {appointment.time}
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}