export interface Patient {
  id: number;
  name: string;
  email: string;
  phone: string;
  birthDate: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Appointment {
  id: number;
  patientId: number;
  patientName: string;
  date: string;
  time: string;
  duration: number;
  amount?: number;
  notes?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: string;
}

export interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  weeklyAppointments: number;
  monthlyRevenue: number;
}

export interface PatientAnamnesis {
  id?: number;
  patient_id: number;
  complaint: string;
  history_illness: string;
  previous_treatments: string;
  medications: string;
  family_history: string;
  personal_history: string;
  social_history: string;
  observations: string;
  created_at?: string;
  updated_at?: string;
}

export interface ConsultationHistory {
  id?: number;
  patient_id: number;
  appointment_id?: number;
  session_number: number;
  session_date: string;
  session_notes: string;
  observations: string;
  homework: string;
  next_session_goals: string;
  patient_mood: 'excellent' | 'good' | 'neutral' | 'poor' | 'very_poor';
  session_duration: number;
  created_at?: string;
  updated_at?: string;
}
