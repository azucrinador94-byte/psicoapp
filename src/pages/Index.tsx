import { useState } from 'react';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Card } from '@/components/ui/card';

// Components
import { Sidebar } from '@/components/layout/Sidebar';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { PatientList } from '@/components/patients/PatientList';
import { PatientForm } from '@/components/patients/PatientForm';
import { AppointmentCalendar } from '@/components/calendar/AppointmentCalendar';
import { AppointmentForm } from '@/components/appointments/AppointmentForm';
import { PatientAnamnesisModal } from '@/components/patients/PatientAnamnesisModal';
import { ConsultationHistoryModal } from '@/components/patients/ConsultationHistoryModal';
import { Reports } from '@/components/reports/Reports';

// Data
import { mockPatients, mockAppointments, mockStats } from '@/data/mockData';
import { Patient, Appointment } from '@/types';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [patients, setPatients] = useState<Patient[]>(mockPatients);
  const [appointments, setAppointments] = useState<Appointment[]>(mockAppointments);
  const [showPatientForm, setShowPatientForm] = useState(false);
  const [showAppointmentForm, setShowAppointmentForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | undefined>();
  const [editingAppointment, setEditingAppointment] = useState<Appointment | undefined>();
  const [loading, setLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  
  // Estados para os modais de anamnese e histórico
  const [selectedPatientAnamnesis, setSelectedPatientAnamnesis] = useState<Patient | null>(null);
  const [selectedPatientHistory, setSelectedPatientHistory] = useState<Patient | null>(null);

  // Debug: Log quando os modais são abertos
  const handleOpenAnamnesis = (patient: Patient) => {
    console.log('🎯 Index.tsx: handleOpenAnamnesis chamado com paciente:', patient);
    if (!patient) {
      console.error('❌ Paciente inválido!');
      return;
    }
    setSelectedPatientAnamnesis(patient);
    console.log('✅ Estado atualizado, modal deve abrir');
  };

  const handleOpenHistory = (patient: Patient) => {
    console.log('🎯 Index.tsx: handleOpenHistory chamado com paciente:', patient);
    if (!patient) {
      console.error('❌ Paciente inválido!');
      return;
    }
    setSelectedPatientHistory(patient);
    console.log('✅ Estado atualizado, modal deve abrir');
  };

  const handleAddPatient = () => {
    setEditingPatient(undefined);
    setShowPatientForm(true);
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setShowPatientForm(true);
  };

  const handleSavePatient = (patientData: Omit<Patient, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingPatient) {
      setPatients(patients.map(p =>
        p.id === editingPatient.id
          ? { ...editingPatient, ...patientData, updatedAt: new Date().toISOString() }
          : p
      ));
    } else {
      const newPatient: Patient = {
        ...patientData,
        id: Math.floor(Math.random() * 1000000),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      setPatients([...patients, newPatient]);
    }
    setShowPatientForm(false);
    setEditingPatient(undefined);
  };

  const handleDeletePatient = (patientId: number) => {
    setPatients(patients.filter(p => p.id !== patientId));
  };

  // NOVO: FUNÇÃO SNACK_CASE PARA BACKEND
  function toSnakeCaseAppointment(data: any) {
    return {
      patient_id: data.patientId,
      appointment_date: data.date,
      appointment_time: data.time,
      duration: data.duration,
      amount: 'amount' in data ? data.amount : 0,
      notes: data.notes,
      status: data.status,
    };
  }

  const handleSaveAppointment = async (appointmentData: Omit<Appointment, 'id' | 'createdAt' | 'patientName'>) => {
    setLoading(true);
    setToastMsg(null);

    // Nova consulta (envia para backend)
    try {
      const resp = await fetch('/api/appointments.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toSnakeCaseAppointment(appointmentData)),
      });
      const result = await resp.json();
      if (result.success) {
        setToastMsg('Consulta agendada com sucesso!');
        setAppointments([
          ...appointments,
          {
            ...appointmentData,
            id: Math.floor(Math.random() * 1000000),
            createdAt: new Date().toISOString(),
            patientName: patients.find(p => p.id === appointmentData.patientId)?.name || '',
          }
        ]);
        setShowAppointmentForm(false);
        setEditingAppointment(undefined);
      } else {
        setToastMsg(result.message || 'Erro ao agendar consulta!');
      }
    } catch (err) {
      setToastMsg('Erro de comunicação com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAppointment = () => {
    setEditingAppointment(undefined);
    setShowAppointmentForm(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setShowAppointmentForm(true);
  };

  const handleCompleteAppointment = async (appointmentId: number, patientId: number) => {
    setLoading(true);
    setToastMsg(null);
    
    try {
      // Update appointment status locally first
      const updatedAppointments = appointments.map(a =>
        a.id === appointmentId
          ? { ...a, status: 'completed' as const }
          : a
      );
      
      setAppointments(updatedAppointments);

      // Create consultation history record
      const sessionData = {
        patient_id: patientId,
        appointment_id: null, // Backend não precisa de ID numérico se não temos
        session_date: new Date().toISOString().split('T')[0],
        session_notes: 'Consulta realizada.',
        observations: '',
        homework: '',
        next_session_goals: '',
        patient_mood: 'neutral',
        session_duration: 50
      };

      const response = await fetch('/api/consultation-history.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setToastMsg('✅ Consulta finalizada e registrada no histórico!');
      } else {
        setToastMsg('⚠️ Consulta finalizada, mas erro ao salvar no histórico.');
      }
    } catch (error) {
      console.error('Erro ao finalizar consulta:', error);
      setToastMsg('⚠️ Consulta marcada como concluída (offline).');
    } finally {
      setLoading(false);
      // Auto-close toast after 3 seconds
      setTimeout(() => setToastMsg(null), 3000);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            stats={mockStats}
            recentAppointments={appointments}
            recentPatients={patients}
            onNavigate={setActiveTab}
          />
        );
      case 'patients':
        return (
          <PatientList
            patients={patients}
            onAddPatient={handleAddPatient}
            onEditPatient={handleEditPatient}
            onDeletePatient={handleDeletePatient}
            onOpenAnamnesis={handleOpenAnamnesis}
            onOpenHistory={handleOpenHistory}
          />
        );
      case 'calendar':
        return (
          <AppointmentCalendar
            appointments={appointments}
            onAddAppointment={handleAddAppointment}
            onCompleteAppointment={handleCompleteAppointment}
          />
        );
        case 'reports':
        return <Reports />;
      case 'settings':
        return (
          <div className="p-6">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-foreground">Configurações</h1>
              <p className="text-muted-foreground">Gerencie suas configurações</p>
            </div>
            <Card className="p-6">
              <p className="text-muted-foreground">Módulo de configurações em desenvolvimento...</p>
            </Card>
          </div>
        );
      default:
        return (
          <Dashboard
            stats={mockStats}
            recentAppointments={appointments}
            recentPatients={patients}
            onNavigate={setActiveTab}
          />
        );
    }
  };

  return (
    <TooltipProvider>
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      {renderContent()}
      {showPatientForm && (
        <PatientForm
          patient={editingPatient}
          onSave={handleSavePatient}
          onCancel={() => {
            setShowPatientForm(false);
            setEditingPatient(undefined);
          }}
        />
      )}
      {showAppointmentForm && (
        <AppointmentForm
          appointment={editingAppointment}
          patients={patients}
          onSave={handleSaveAppointment}
          onCancel={() => {
            setShowAppointmentForm(false);
            setEditingAppointment(undefined);
          }}
        />
      )}
      {toastMsg && (
        <div className="fixed top-4 right-4 bg-primary text-primary-foreground p-4 rounded-lg shadow-lg z-50">
          {toastMsg}
        </div>
      )}
      
      {/* Modais de Anamnese e Histórico */}
      {selectedPatientAnamnesis && (
        <PatientAnamnesisModal
          patient={selectedPatientAnamnesis}
          onClose={() => setSelectedPatientAnamnesis(null)}
        />
      )}
      
      {selectedPatientHistory && (
        <ConsultationHistoryModal
          patient={selectedPatientHistory}
          onClose={() => setSelectedPatientHistory(null)}
        />
      )}
      
      <Toaster />
    </TooltipProvider>
  );
};

export default Index;
