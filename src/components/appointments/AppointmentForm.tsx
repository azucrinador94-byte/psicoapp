import { useState, useEffect } from 'react';
import { X, Calendar, Clock, User, FileText, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Patient, Appointment } from '@/types';

interface AppointmentFormProps {
  appointment?: Appointment | null;
  patients: Patient[];
  onSave: (appointmentData: Omit<Appointment, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export function AppointmentForm({ appointment, patients, onSave, onCancel }: AppointmentFormProps) {
  const [patientId, setPatientId] = useState<string>(appointment?.patientId?.toString() || '');
  const [date, setDate] = useState(appointment?.date || '');
  const [time, setTime] = useState(appointment?.time || '');
  const [duration, setDuration] = useState(appointment?.duration?.toString() || '50');
  const [amount, setAmount] = useState(appointment?.amount?.toString() || '150');
  const [notes, setNotes] = useState(appointment?.notes || '');
  const [status, setStatus] = useState<Appointment['status']>(appointment?.status || 'scheduled');

  // Update form when appointment prop changes
  useEffect(() => {
    if (appointment) {
      setPatientId(appointment.patientId.toString());
      setDate(appointment.date);
      setTime(appointment.time);
      setDuration(appointment.duration.toString());
      setAmount(appointment.amount?.toString() || '150');
      setNotes(appointment.notes || '');
      setStatus(appointment.status);
    }
  }, [appointment]);

  const selectedPatient = patients.find(p => p.id.toString() === patientId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!patientId || !date || !time) {
      alert('Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Validar data não no passado
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      alert('A data da consulta não pode ser no passado.');
      return;
    }

    // Validar valor numérico
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      alert('Por favor, insira um valor válido.');
      return;
    }

    const appointmentData = {
      patientId: parseInt(patientId),
      patientName: selectedPatient?.name || '',
      date,
      time,
      duration: parseInt(duration),
      amount: parsedAmount,
      notes: notes.trim(),
      status
    };

    onSave(appointmentData);
  };

  // Get current date for min date input
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {appointment ? 'Editar Consulta' : 'Nova Consulta'}
            </h2>
            <p className="text-muted-foreground">
              {appointment ? 'Atualize as informações da consulta' : 'Agende uma nova consulta'}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="p-2"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Patient Selection */}
          <div className="space-y-2">
            <Label htmlFor="patient" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Paciente *
            </Label>
            <Select value={patientId} onValueChange={setPatientId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um paciente..." />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id.toString()}>
                    {patient.name} - {patient.phone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Data *
              </Label>
              <Input
                id="date"
                type="date"
                value={date}
                min={today}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="time" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Horário *
              </Label>
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Duration, Amount and Status */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="duration">Duração (minutos)</Label>
              <Select value={duration} onValueChange={setDuration}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutos</SelectItem>
                  <SelectItem value="45">45 minutos</SelectItem>
                  <SelectItem value="50">50 minutos</SelectItem>
                  <SelectItem value="60">60 minutos</SelectItem>
                  <SelectItem value="90">90 minutos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount" className="flex items-center gap-2">
                <DollarSign className="h-4 w-4" />
                Valor (R$)
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="150.00"
              />
            </div>

            {appointment && (
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(value: Appointment['status']) => setStatus(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="scheduled">Agendado</SelectItem>
                    <SelectItem value="completed">Concluído</SelectItem>
                    <SelectItem value="cancelled">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Observações
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Observações sobre a consulta..."
              rows={3}
            />
          </div>

          {/* Selected Patient Info */}
          {selectedPatient && (
            <Card className="p-4 bg-muted">
              <h3 className="font-medium text-foreground mb-2">Informações do Paciente</h3>
              <div className="text-sm text-muted-foreground space-y-1">
                <p><strong>Nome:</strong> {selectedPatient.name}</p>
                <p><strong>Telefone:</strong> {selectedPatient.phone}</p>
                <p><strong>Email:</strong> {selectedPatient.email}</p>
                {selectedPatient.birthDate && (
                  <p>
                    <strong>Data de Nascimento:</strong>{' '}
                    {new Date(selectedPatient.birthDate).toLocaleDateString('pt-BR')}
                  </p>
                )}
              </div>
            </Card>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="gradient"
              className="flex-1"
            >
              {appointment ? 'Atualizar Consulta' : 'Agendar Consulta'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
