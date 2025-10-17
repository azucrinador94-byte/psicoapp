import { Patient, Appointment, DashboardStats } from '@/types';

export const mockPatients: Patient[] = [
  {
    id: 1,
    name: 'Maria Silva',
    email: 'maria@email.com',
    phone: '(11) 99999-1234',
    birthDate: '1990-05-15',
    notes: 'Primeira consulta - ansiedade',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-15'
  },
  {
    id: 2,
    name: 'João Santos',
    email: 'joao@email.com',
    phone: '(11) 88888-5678',
    birthDate: '1985-08-22',
    notes: 'Terapia cognitiva comportamental',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-20'
  },
  {
    id: 3,
    name: 'Ana Costa',
    email: 'ana@email.com',
    phone: '(11) 77777-9012',
    birthDate: '1992-12-03',
    notes: 'Depressão - acompanhamento mensal',
    createdAt: '2024-01-05',
    updatedAt: '2024-01-25'
  }
];

export const mockAppointments: Appointment[] = [
  {
    id: 1,
    patientId: 1,
    patientName: 'Maria Silva',
    date: '2024-01-30',
    time: '10:00',
    duration: 50,
    notes: 'Sessão de acompanhamento',
    status: 'scheduled',
    createdAt: '2024-01-25'
  },
  {
    id: 2,
    patientId: 2,
    patientName: 'João Santos',
    date: '2024-01-30',
    time: '14:00',
    duration: 50,
    notes: 'Revisão do plano terapêutico',
    status: 'scheduled',
    createdAt: '2024-01-25'
  },
  {
    id: 3,
    patientId: 3,
    patientName: 'Ana Costa',
    date: '2024-01-29',
    time: '16:00',
    duration: 50,
    status: 'completed',
    createdAt: '2024-01-20'
  },
  {
    id: 4,
    patientId: 1,
    patientName: 'Maria Silva',
    date: '2024-01-31',
    time: '09:00',
    duration: 50,
    notes: 'Técnicas de relaxamento',
    status: 'scheduled',
    createdAt: '2024-01-26'
  }
];

export const mockStats: DashboardStats = {
  totalPatients: mockPatients.length,
  todayAppointments: 2,
  weeklyAppointments: 8,
  monthlyRevenue: 4500
};