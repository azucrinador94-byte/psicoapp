/**
 * Serviço de API com fallback para mock data
 * Detecta automaticamente se backend está disponível
 */

import { PatientAnamnesis, ConsultationHistory } from '@/types';

// Mock data storage
const mockAnamnesisStorage = new Map<number, PatientAnamnesis>();
const mockConsultationStorage = new Map<number, ConsultationHistory[]>();

interface ConsultationStats {
  total_sessions: number;
  last_session_date: string;
  average_duration: number;
}

// Detectar se backend está disponível
let backendAvailable: boolean | null = null;
let lastCheck: number = 0;
const CACHE_DURATION = 30000; // 30 segundos

async function checkBackendAvailability(): Promise<boolean> {
  const now = Date.now();
  
  // Re-verificar a cada 30 segundos
  if (backendAvailable !== null && (now - lastCheck) < CACHE_DURATION) {
    return backendAvailable;
  }
  
  lastCheck = now;
  try {
    const response = await fetch('/api/user.php', { method: 'HEAD' });
    backendAvailable = response.ok;
    console.log(`🔍 Backend ${backendAvailable ? 'DISPONÍVEL' : 'INDISPONÍVEL'}`);
    return backendAvailable;
  } catch {
    backendAvailable = false;
    console.log('🔍 Backend INDISPONÍVEL (erro de conexão)');
    return false;
  }
}

// Serviço de Anamnese
export const anamnesisService = {
  async get(patientId: number): Promise<PatientAnamnesis> {
    console.log(`📋 Carregando anamnese do paciente ${patientId}`);
    
    const isBackendAvailable = await checkBackendAvailability();
    
    if (isBackendAvailable) {
      try {
        const response = await fetch(`/api/anamnesis.php?patient_id=${patientId}`);
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Anamnese carregada do backend');
          return data;
        }
      } catch (error) {
        console.warn('⚠️ Erro ao buscar anamnese do backend, usando mock:', error);
      }
    }
    
    // Fallback para mock data
    console.log('📦 Usando mock data para anamnese');
    const mockData = mockAnamnesisStorage.get(patientId) || {
      patient_id: patientId,
      complaint: '',
      history_illness: '',
      previous_treatments: '',
      medications: '',
      family_history: '',
      personal_history: '',
      social_history: '',
      observations: ''
    };
    
    return mockData;
  },

  async save(data: PatientAnamnesis): Promise<{ success: boolean; message: string }> {
    console.log(`💾 Salvando anamnese do paciente ${data.patient_id}`);
    
    const isBackendAvailable = await checkBackendAvailability();
    
    if (isBackendAvailable) {
      try {
        const response = await fetch('/api/anamnesis.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log('✅ Anamnese salva no backend');
          return result;
        }
      } catch (error) {
        console.warn('⚠️ Erro ao salvar no backend, salvando localmente:', error);
      }
    }
    
    // Fallback para mock storage
    console.log('📦 Salvando anamnese no mock storage');
    mockAnamnesisStorage.set(data.patient_id, data);
    return { success: true, message: 'Anamnese salva localmente (modo offline)' };
  }
};

// Serviço de Histórico de Consultas
export const consultationService = {
  async getHistory(patientId: number): Promise<ConsultationHistory[]> {
    console.log(`📋 Carregando histórico do paciente ${patientId}`);
    
    const isBackendAvailable = await checkBackendAvailability();
    
    if (isBackendAvailable) {
      try {
        const response = await fetch(`/api/consultation-history.php?patient_id=${patientId}`);
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Histórico carregado do backend');
          return data.sessions || [];
        }
      } catch (error) {
        console.warn('⚠️ Erro ao buscar histórico do backend, usando mock:', error);
      }
    }
    
    // Fallback para mock data
    console.log('📦 Usando mock data para histórico');
    return mockConsultationStorage.get(patientId) || [];
  },

  async getStats(patientId: number): Promise<ConsultationStats> {
    console.log(`📊 Carregando estatísticas do paciente ${patientId}`);
    
    const isBackendAvailable = await checkBackendAvailability();
    
    if (isBackendAvailable) {
      try {
        const response = await fetch(`/api/consultation-history.php?patient_id=${patientId}&action=stats`);
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Estatísticas carregadas do backend');
          return data.stats;
        }
      } catch (error) {
        console.warn('⚠️ Erro ao buscar estatísticas do backend, usando mock:', error);
      }
    }
    
    // Fallback para mock data
    const sessions = mockConsultationStorage.get(patientId) || [];
    const avgDuration = sessions.length > 0 
      ? sessions.reduce((sum, s) => sum + s.session_duration, 0) / sessions.length 
      : 0;
    
    return {
      total_sessions: sessions.length,
      last_session_date: sessions.length > 0 ? sessions[sessions.length - 1].session_date : '',
      average_duration: avgDuration
    };
  },

  async saveSession(session: Omit<ConsultationHistory, 'id' | 'session_number'>): Promise<{ success: boolean; message: string }> {
    console.log(`💾 Salvando sessão do paciente ${session.patient_id}`);
    
    const isBackendAvailable = await checkBackendAvailability();
    
    if (isBackendAvailable) {
      try {
        const response = await fetch('/api/consultation-history.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(session)
        });
        
        if (response.ok) {
          const result = await response.json();
          console.log('✅ Sessão salva no backend');
          return result;
        }
      } catch (error) {
        console.warn('⚠️ Erro ao salvar no backend, salvando localmente:', error);
      }
    }
    
    // Fallback para mock storage
    console.log('📦 Salvando sessão no mock storage');
    const sessions = mockConsultationStorage.get(session.patient_id) || [];
    const newSession: ConsultationHistory = {
      ...session,
      id: Date.now(),
      session_number: sessions.length + 1
    };
    sessions.push(newSession);
    mockConsultationStorage.set(session.patient_id, sessions);
    
    return { success: true, message: 'Sessão salva localmente (modo offline)' };
  }
};

// Verificar disponibilidade do backend
export async function isBackendAvailable(): Promise<boolean> {
  return await checkBackendAvailability();
}
