# PsicoApp - MVP Detalhado

## 📋 Visão Geral

**PsicoApp** é uma aplicação web completa para gestão de consultório de psicologia, permitindo o gerenciamento de pacientes, agendamento de consultas, anamnese detalhada, histórico de sessões e relatórios.

---

## 🏗️ Arquitetura

### Frontend (React + TypeScript + Vite)
- **Framework**: React 18 com TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: React Hooks (useState, useEffect)
- **Routing**: React Router DOM
- **Form Management**: React Hook Form + Zod
- **Data Fetching**: TanStack Query
- **Notifications**: Sonner + Toast UI

### Backend (PHP + MySQL)
- **Language**: PHP 8+
- **Database**: MySQL 8+
- **Architecture**: REST API
- **Authentication**: Session-based (PHP Sessions)
- **Development Mode**: Config-based bypass (`config/dev.php`)

---

## 📁 Estrutura de Arquivos

```
psicoapp/
├── api/                              # Backend PHP APIs
│   ├── anamnesis.php                 # CRUD anamnese
│   ├── appointments.php              # CRUD consultas
│   ├── consultation-history.php      # Histórico de sessões
│   ├── patients.php                  # CRUD pacientes
│   ├── reports.php                   # Relatórios e estatísticas
│   └── user.php                      # Dados do usuário
│
├── classes/                          # PHP Classes (OOP)
│   ├── Appointment.php               # Modelo de Consulta
│   ├── ConsultationHistory.php       # Modelo de Histórico
│   ├── Patient.php                   # Modelo de Paciente
│   ├── PatientAnamnesis.php          # Modelo de Anamnese
│   └── PatientPricing.php            # Modelo de Precificação
│
├── config/                           # Configurações
│   ├── database.php                  # Conexão MySQL (PDO)
│   └── dev.php                       # Modo desenvolvedor (⚠️ CRÍTICO)
│
├── database/                         # Scripts SQL
│   ├── migration.sql                 # Migrações
│   └── setup.sql                     # Schema inicial
│
├── src/                              # Frontend React
│   ├── assets/                       # Imagens e assets
│   ├── components/                   # Componentes React
│   │   ├── appointments/
│   │   │   └── AppointmentForm.tsx   # Formulário de consulta
│   │   ├── calendar/
│   │   │   └── AppointmentCalendar.tsx # Calendário de consultas
│   │   ├── dashboard/
│   │   │   ├── Dashboard.tsx         # Dashboard principal
│   │   │   └── DashboardStats.tsx    # Cards de estatísticas
│   │   ├── debug/                    # Ferramentas de debug
│   │   │   ├── ConnectionStatus.tsx  # Status do backend
│   │   │   ├── DebugInfo.tsx         # Informações de debug
│   │   │   ├── ErrorBoundary.tsx     # Captura de erros
│   │   │   ├── ModalDebugger.tsx     # Debug de modais
│   │   │   ├── ModalTest.tsx         # Teste de modal simples
│   │   │   ├── NetworkMonitor.tsx    # Monitor de rede
│   │   │   └── SimpleAnamnesisTest.tsx # Teste de anamnese
│   │   ├── layout/
│   │   │   └── Sidebar.tsx           # Sidebar navegação
│   │   ├── patients/
│   │   │   ├── ConsultationHistoryModal.tsx # Modal histórico
│   │   │   ├── PatientAnamnesisModal.tsx    # Modal anamnese
│   │   │   ├── PatientForm.tsx       # Formulário paciente
│   │   │   └── PatientList.tsx       # Lista de pacientes
│   │   ├── reports/
│   │   │   ├── ReportCard.tsx        # Card de relatório
│   │   │   └── Reports.tsx           # Página de relatórios
│   │   └── ui/                       # shadcn/ui components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── form.tsx
│   │       ├── input.tsx
│   │       ├── select.tsx
│   │       ├── tabs.tsx
│   │       ├── textarea.tsx
│   │       └── ... (40+ componentes)
│   │
│   ├── data/
│   │   └── mockData.ts               # Dados mock (fallback)
│   │
│   ├── hooks/
│   │   ├── use-mobile.tsx            # Hook responsividade
│   │   ├── use-toast.ts              # Hook toast
│   │   └── useDebugMode.tsx          # Hook debug mode
│   │
│   ├── lib/
│   │   └── utils.ts                  # Utilitários (cn, etc)
│   │
│   ├── pages/
│   │   ├── Index.tsx                 # Página principal
│   │   └── NotFound.tsx              # 404
│   │
│   ├── services/
│   │   └── api.ts                    # ⚠️ CRÍTICO: Camada de API
│   │
│   ├── types/
│   │   └── index.ts                  # Tipos TypeScript
│   │
│   ├── App.tsx                       # App root
│   ├── index.css                     # Global CSS + Design System
│   └── main.tsx                      # Entry point
│
├── .env.development                  # ⚠️ Config desenvolvimento
├── .env.production                   # ⚠️ Config produção
├── vite.config.ts                    # Configuração Vite
├── tailwind.config.ts                # Configuração Tailwind
└── tsconfig.json                     # Configuração TypeScript
```

---

## 🔧 Arquivos Críticos para Produção

### 1. `config/dev.php` ⚠️ MUITO IMPORTANTE

**Propósito**: Permite funcionamento SEM LOGIN em desenvolvimento.

```php
<?php
define('DEVELOPMENT_MODE', true);  // ⚠️ Mudar para false em PRODUÇÃO!
define('DEV_USER_ID', 1);

function getCurrentUserId() {
    if (DEVELOPMENT_MODE && !isset($_SESSION['user_id'])) {
        return DEV_USER_ID;
    }
    return $_SESSION['user_id'] ?? null;
}

function isAuthenticated() {
    if (DEVELOPMENT_MODE) {
        return true;  // Bypass autenticação
    }
    return isset($_SESSION['user_id']);
}
?>
```

**Uso em todas as APIs:**
```php
<?php
session_start();
header('Content-Type: application/json');

require_once '../config/dev.php';  // ⬅️ OBRIGATÓRIO

if (!isAuthenticated()) {           // ⬅️ Usar função helper
    http_response_code(401);
    exit;
}

$user_id = getCurrentUserId();      // ⬅️ Não usar $_SESSION['user_id']
```

---

### 2. `src/services/api.ts` ⚠️ MUITO IMPORTANTE

**Propósito**: Abstração de API com fallback automático para mock data.

**Funcionalidades:**
- ✅ Detecta se backend PHP está disponível
- ✅ Cache de disponibilidade (30 segundos TTL)
- ✅ Fallback automático para mock data em `Map` local
- ✅ Suporte a modo offline
- ✅ Logs detalhados no console

**Estrutura:**
```typescript
// Camada de detecção de backend
let backendAvailable: boolean | null = null;
let lastCheck: number = 0;
const CACHE_DURATION = 30000; // 30s

async function checkBackendAvailability(): Promise<boolean> {
  // Verifica a cada 30s se backend está online
  // ⬅️ Evita cache permanente que travava reconexão
}

// Serviços
export const anamnesisService = {
  async get(patientId: number): Promise<PatientAnamnesis> {
    // Tenta backend primeiro, fallback para mock
  },
  async save(data: PatientAnamnesis): Promise<{ success: boolean; message: string }> {
    // Tenta backend primeiro, fallback para mock storage
  }
};

export const consultationService = {
  async getHistory(patientId: number): Promise<ConsultationHistory[]> {},
  async getStats(patientId: number): Promise<ConsultationStats> {},
  async saveSession(session: Omit<ConsultationHistory, 'id' | 'session_number'>): Promise<{ success: boolean; message: string }> {}
};
```

**Mock Storage (Map):**
```typescript
const mockAnamnesisStorage = new Map<number, PatientAnamnesis>();
const mockConsultationStorage = new Map<number, ConsultationHistory[]>();
```

---

### 3. `.env.development` e `.env.production`

**`.env.development`** (desenvolvimento local):
```env
VITE_USE_BACKEND=true
VITE_API_BASE_URL=http://localhost
```

**`.env.production`** (Lovable/Vercel/deploy sem PHP):
```env
VITE_USE_BACKEND=false
VITE_API_BASE_URL=
```

**Lógica em `api.ts`:**
```typescript
const USE_BACKEND = import.meta.env.VITE_USE_BACKEND === 'true';

async function checkBackendAvailability(): Promise<boolean> {
  if (!USE_BACKEND) {
    console.log('🔍 Modo Mock: Backend desabilitado via env');
    return false;
  }
  // ... continua
}
```

---

### 4. `vite.config.ts`

**Propósito**: Proxy reverso para APIs PHP em desenvolvimento.

```typescript
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    proxy: {
      '/api': {
        target: 'http://localhost:80',  // ⬅️ Apache/Nginx local
        changeOrigin: true,
        secure: false,
      }
    }
  },
  // ...
});
```

⚠️ **Importante**: Este proxy SÓ funciona em `npm run dev`. Em produção, as requisições `/api/*` retornam 404 se não houver servidor PHP.

---

## 🔀 Fluxo de Dados

### Fluxo Normal (Backend Disponível)

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ 1. Clique "Anamnese"
       │
       ▼
┌─────────────────┐
│   Index.tsx     │ handleOpenAnamnesis(patient)
└────────┬────────┘
         │ 2. setSelectedPatientAnamnesis(patient)
         │
         ▼
┌──────────────────────────┐
│ PatientAnamnesisModal    │
└────────┬─────────────────┘
         │ 3. useEffect → loadAnamnesis()
         │
         ▼
┌──────────────────────────┐
│   api.ts                 │
│   anamnesisService.get() │
└────────┬─────────────────┘
         │ 4. checkBackendAvailability()
         │    └─> fetch('/api/user.php', { method: 'HEAD' })
         │    └─> backendAvailable = response.ok
         │
         ▼
┌──────────────────────────┐
│  Backend Disponível?     │
└────────┬─────────────────┘
         │
    ┌────┴────┐
    │   Sim   │
    └────┬────┘
         │ 5. fetch('/api/anamnesis.php?patient_id=1')
         │
         ▼
┌──────────────────────────┐
│  api/anamnesis.php       │
│  (PHP + MySQL)           │
└────────┬─────────────────┘
         │ 6. Query MySQL
         │
         ▼
┌──────────────────────────┐
│  Retorna JSON            │
│  { id: 1, complaint: ... }│
└────────┬─────────────────┘
         │ 7. setFormData(data)
         │
         ▼
┌──────────────────────────┐
│  Modal renderiza         │
│  com dados reais         │
└──────────────────────────┘
```

### Fluxo Offline (Backend Indisponível)

```
┌─────────────┐
│   Browser   │
└──────┬──────┘
       │ 1. Clique "Anamnese"
       │
       ▼
┌─────────────────┐
│   Index.tsx     │
└────────┬────────┘
         │ 2. setSelectedPatientAnamnesis(patient)
         │
         ▼
┌──────────────────────────┐
│ PatientAnamnesisModal    │
└────────┬─────────────────┘
         │ 3. useEffect → loadAnamnesis()
         │
         ▼
┌──────────────────────────┐
│   api.ts                 │
│   anamnesisService.get() │
└────────┬─────────────────┘
         │ 4. checkBackendAvailability()
         │    └─> fetch('/api/user.php') → ERRO 404
         │    └─> backendAvailable = false
         │
         ▼
┌──────────────────────────┐
│  Backend Disponível?     │
└────────┬─────────────────┘
         │
    ┌────┴────┐
    │   Não   │
    └────┬────┘
         │ 5. mockAnamnesisStorage.get(patientId)
         │    └─> Retorna dados mock ou vazio
         │
         ▼
┌──────────────────────────┐
│  Retorna Mock Data       │
│  { patient_id: 1,        │
│    complaint: '',        │
│    ... }                 │
└────────┬─────────────────┘
         │ 6. setFormData(mockData)
         │
         ▼
┌──────────────────────────┐
│  Modal renderiza         │
│  com formulário vazio    │
└──────────────────────────┘
         │
         │ 7. Usuário preenche e salva
         │
         ▼
┌──────────────────────────┐
│  anamnesisService.save() │
│  └─> backendAvailable?   │
│      └─> Não             │
│      └─> mockStorage.set()│
└────────┬─────────────────┘
         │ 8. Salvo localmente
         │
         ▼
┌──────────────────────────┐
│  toast("Salvo localmente")│
└──────────────────────────┘
```

---

## 🚨 Problemas Corrigidos

### Problema 1: Cache Permanente de Backend
**Antes:**
```typescript
let backendAvailable: boolean | null = null;

async function checkBackendAvailability(): Promise<boolean> {
  if (backendAvailable !== null) return backendAvailable; // ❌ Nunca re-verifica!
  // ...
}
```

**Depois:**
```typescript
let backendAvailable: boolean | null = null;
let lastCheck: number = 0;
const CACHE_DURATION = 30000;

async function checkBackendAvailability(): Promise<boolean> {
  const now = Date.now();
  if (backendAvailable !== null && (now - lastCheck) < CACHE_DURATION) {
    return backendAvailable;
  }
  lastCheck = now; // ✅ Re-verifica a cada 30s
  // ...
}
```

---

### Problema 2: Import Dinâmico Travando Modal
**Antes:**
```typescript
const loadAnamnesis = async () => {
  setIsLoading(true);
  try {
    const { anamnesisService } = await import('@/services/api'); // ❌ Import dinâmico
    const data = await anamnesisService.get(patient.id);
    setFormData(data);
  } catch (error) {
    console.error(error);
  } finally {
    setIsLoading(false); // ⚠️ Pode não executar se import falhar
  }
};
```

**Depois:**
```typescript
import { anamnesisService } from '@/services/api'; // ✅ Import estático no topo

const loadAnamnesis = async () => {
  setIsLoading(true);
  try {
    const data = await anamnesisService.get(patient.id);
    setFormData(data);
  } catch (error) {
    console.error(error);
    // ✅ Fallback com dados vazios
    setFormData({
      patient_id: patient.id,
      complaint: '',
      // ...
    });
  } finally {
    setIsLoading(false); // ✅ SEMPRE executa
  }
};
```

---

### Problema 3: APIs PHP Bloqueando sem Sessão
**Antes:**
```php
<?php
session_start();
header('Content-Type: application/json');

if (!isset($_SESSION['user_id'])) {  // ❌ Hardcoded
    http_response_code(401);
    exit;
}

$user_id = $_SESSION['user_id'];      // ❌ Direto da sessão
```

**Depois:**
```php
<?php
session_start();
header('Content-Type: application/json');

require_once '../config/dev.php';     // ✅ Inclui helpers

if (!isAuthenticated()) {             // ✅ Usa função helper
    http_response_code(401);
    exit;
}

$user_id = getCurrentUserId();        // ✅ Usa função helper
```

---

### Problema 4: Tipo `patient_mood` Inconsistente
**Antes:**
```typescript
// src/types/index.ts
patient_mood: 'excellent' | 'good' | 'neutral' | 'poor' | 'critical'; // ❌

// database/setup.sql
ENUM('excellent', 'good', 'neutral', 'poor', 'very_poor')              // ❌
```

**Depois:**
```typescript
// src/types/index.ts
patient_mood: 'excellent' | 'good' | 'neutral' | 'poor' | 'very_poor'; // ✅

// ConsultationHistoryModal.tsx
case 'very_poor': return 'bg-red-100 text-red-800';                    // ✅
case 'very_poor': return 'Muito Ruim';                                 // ✅
<SelectItem value="very_poor">Muito Ruim</SelectItem>                  // ✅
```

---

### Problema 5: Validação de Formulário Insuficiente
**Antes:**
```typescript
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!patientId || !date || !time) {
    alert('Preencha os campos!');
    return;
  }
  
  onSave({
    patientId: parseInt(patientId),
    date,
    time,
    amount: parseFloat(amount) || 0  // ❌ Sem validação
  });
};
```

**Depois:**
```typescript
const handleSubmit = (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!patientId || !date || !time) {
    alert('Preencha os campos obrigatórios!');
    return;
  }

  // ✅ Validar data não no passado
  const selectedDate = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (selectedDate < today) {
    alert('A data não pode ser no passado!');
    return;
  }

  // ✅ Validar valor numérico
  const parsedAmount = parseFloat(amount);
  if (isNaN(parsedAmount) || parsedAmount < 0) {
    alert('Valor inválido!');
    return;
  }

  onSave({
    patientId: parseInt(patientId),
    date,
    time,
    amount: parsedAmount
  });
};
```

---

## 🎯 Funcionalidades MVP

### ✅ 1. Dashboard
- Cards de estatísticas (pacientes, consultas, receita)
- Gráfico de consultas mensais (Recharts)
- Consultas próximas

### ✅ 2. Gestão de Pacientes
- Listar todos os pacientes
- Buscar paciente por nome/email/telefone
- Criar novo paciente
- Editar paciente
- Excluir paciente
- Ver anamnese completa
- Ver histórico de consultas

### ✅ 3. Anamnese
- Modal tabbed (Queixa, História, Família, Observações)
- Salvar/editar anamnese
- Modo offline com mock data
- Loading state

### ✅ 4. Histórico de Consultas
- Listar todas as sessões do paciente
- Adicionar nova sessão
- Campos: data, duração, humor, notas, tarefas, objetivos
- Estatísticas: total de sessões, tempo total, última sessão
- Modo offline com mock data
- Loading state

### ✅ 5. Agendamento de Consultas
- Calendário interativo (react-day-picker)
- Criar consulta
- Editar consulta
- Cancelar consulta
- Filtrar por data
- Status: agendado, concluído, cancelado
- Validação de data/hora

### ✅ 6. Relatórios
- Relatório semanal
- Relatório mensal
- Relatório de pacientes
- Relatório de consultas
- Relatório financeiro
- Exportação (futuro)

### ✅ 7. Modo Offline/Mock
- Detecção automática de backend
- Fallback para mock data
- Persistência em `Map` (RAM)
- Indicador visual "Modo Offline"
- Logs detalhados no console

---

## 🔐 Segurança

### ⚠️ Autenticação (Atual)
- **Desenvolvimento**: `DEVELOPMENT_MODE = true` → bypass completo
- **Produção**: Session-based com `$_SESSION['user_id']`
- **Recomendação**: Implementar JWT ou OAuth2 para produção

### 🛡️ Row-Level Security (RLS)
- Todas as queries usam `user_id` para isolar dados
- Exemplo: `WHERE user_id = :user_id`

### 🔒 Input Validation
- **Frontend**: Validação básica (campos obrigatórios, tipos)
- **Backend**: Validação antes de inserir no MySQL
- **Recomendação**: Usar Zod no frontend, filtros PDO no backend

### 🚫 SQL Injection
- Uso de **Prepared Statements** (PDO) em todas as queries
- Exemplo: `$stmt->bindParam(':user_id', $user_id);`

---

## 📊 Tipos TypeScript

```typescript
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

export interface DashboardStats {
  totalPatients: number;
  todayAppointments: number;
  weeklyAppointments: number;
  monthlyRevenue: number;
}
```

---

## 🚀 Deploy

### Desenvolvimento Local
```bash
# Frontend (porta 8080)
npm run dev

# Backend (Apache/Nginx na porta 80)
# Certifique-se de que o MySQL está rodando
# Importe database/setup.sql
```

### Produção (Lovable/Vercel)
```bash
# Frontend SEM backend PHP
npm run build
# Deploy pasta dist/

# Backend em servidor separado (AWS, DigitalOcean, Hostinger)
# Upload arquivos api/, classes/, config/, database/
# Configure MySQL e import database/setup.sql
# Atualize .env.production com VITE_API_BASE_URL
```

---

## 📦 Próximas Funcionalidades

- [ ] Sistema de login/registro completo
- [ ] Upload de documentos (anamnese, laudos)
- [ ] Exportação de relatórios em PDF
- [ ] Envio de lembretes por email/SMS
- [ ] Agenda integrada com Google Calendar
- [ ] Pagamentos integrados (Stripe/Pagar.me)
- [ ] Modo escuro completo
- [ ] PWA (Progressive Web App)
- [ ] Sincronização offline avançada (IndexedDB)
- [ ] Multi-tenancy (vários psicólogos)

---

## 🐛 Troubleshooting

### Modal não abre
1. Verifique console.log ao clicar no botão
2. Verifique se `selectedPatientAnamnesis !== null`
3. Verifique se há erros no `useEffect` do modal

### Backend retorna 500
1. Verifique se `config/dev.php` está incluído
2. Verifique se `isAuthenticated()` está sendo usada
3. Verifique logs do PHP (`error_log`)

### Dados não aparecem
1. Abra console e veja se backend está disponível
2. Verifique se APIs estão retornando JSON correto
3. Verifique se mock data está sendo usada como fallback

---

## 📝 Licença

Proprietário - PsicoApp 2025
