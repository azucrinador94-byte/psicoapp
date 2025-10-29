// ==============================================
// APP.JS - VERSÃO LIMPA E FUNCIONAL
// ==============================================

// Global variables
let currentDate = new Date();
let currentTab = 'dashboard';
let currentPatientId = null;

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Set up navigation
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const tab = this.dataset.tab;
            switchTab(tab);
        });
    });
    
    // Load initial data
    loadPatients();
    loadCalendar();
    
    // Close modals when clicking outside
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('modal')) {
            closeModal(e.target.id);
        }
    });
    
    // Close modal with ESC
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            const activeModal = document.querySelector('.modal.active');
            if (activeModal) {
                closeModal(activeModal.id);
            }
        }
    });
}

// Tab switching
function switchTab(tabName) {
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`)?.classList.add('active');
    
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(`${tabName}-tab`)?.classList.add('active');
    
    currentTab = tabName;
    
    switch(tabName) {
        case 'patients':
            loadPatients();
            break;
        case 'calendar':
            loadCalendar();
            break;
        case 'reports':
            loadReportsData();
            break;
    }
}

// ======================
// MODAL FUNCTIONS
// ======================

function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;
    
    modal.classList.remove('active');
    document.body.style.overflow = '';
    
    const form = modal.querySelector('form');
    if (form) {
        form.reset();
    }
}

// ======================
// PATIENT FUNCTIONS
// ======================

function loadPatients() {
    const searchTerm = document.getElementById('patient-search')?.value || '';
    
    fetch(`api/patients.php?search=${encodeURIComponent(searchTerm)}`)
        .then(response => response.json())
        .then(data => {
            displayPatients(data);
        })
        .catch(error => {
            console.error('Error loading patients:', error);
        });
}

function displayPatients(patients) {
    const grid = document.getElementById('patients-grid');
    if (!grid) return;
    
    if (patients.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <i class="fas fa-users"></i>
                <h3>Nenhum paciente encontrado</h3>
                <p>Tente ajustar os termos da busca ou adicione um novo paciente</p>
                <button class="btn btn-primary" onclick="openPatientModal()">
                    <i class="fas fa-plus"></i> Adicionar Primeiro Paciente
                </button>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = patients.map(patient => {
        const age = calculateAge(patient.birth_date);
        
        return `
            <div class="patient-card">
                <div class="patient-card-header">
                    <div class="patient-card-info">
                        <h3>${escapeHtml(patient.name)}</h3>
                        <span class="badge">${age} anos</span>
                    </div>
                </div>
                
                <div class="patient-card-details">
                    <div class="detail-item">
                        <i class="fas fa-envelope"></i>
                        <span>${escapeHtml(patient.email)}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-phone"></i>
                        <span>${escapeHtml(patient.phone)}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-calendar"></i>
                        <span>Paciente desde ${formatDate(patient.created_at)}</span>
                    </div>
                </div>
                
                <div class="patient-card-actions">
                    <button class="btn btn-outline btn-sm" onclick="editPatient(${patient.id})">
                        Editar
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="viewPatientAnamnesis(${patient.id})">
                        Anamnese
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="viewPatientHistory(${patient.id})">
                        Histórico
                    </button>
                    <button class="btn btn-destructive btn-sm" onclick="deletePatient(${patient.id})">
                        Excluir
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

function searchPatients() {
    loadPatients();
}

function openPatientModal(patientId = null) {
    const modal = document.getElementById('patient-modal');
    const form = document.getElementById('patient-form');
    const title = document.getElementById('patient-modal-title');
    
    if (patientId) {
        title.textContent = 'Editar Paciente';
        currentPatientId = patientId;
        
        fetch(`api/patients.php?id=${patientId}`)
            .then(response => response.json())
            .then(patient => {
                document.getElementById('patient_name').value = patient.name;
                document.getElementById('patient_email').value = patient.email;
                document.getElementById('patient_phone').value = patient.phone;
                document.getElementById('patient_birth_date').value = patient.birth_date;
                document.getElementById('patient_session_price').value = patient.session_price || '100.00';
                document.getElementById('patient_notes').value = patient.notes || '';
                form.dataset.patientId = patientId;
                
                document.getElementById('view-anamnesis-btn').disabled = false;
                document.getElementById('view-history-btn').disabled = false;
            });
    } else {
        title.textContent = 'Novo Paciente';
        form.reset();
        currentPatientId = null;
        delete form.dataset.patientId;
        
        document.getElementById('view-anamnesis-btn').disabled = true;
        document.getElementById('view-history-btn').disabled = true;
    }
    
    openModal('patient-modal');
}

function savePatient() {
    const form = document.getElementById('patient-form');
    const formData = new FormData(form);
    const patientId = form.dataset.patientId;
    
    if (!formData.get('name') || !formData.get('email') || !formData.get('phone')) {
        showToast('Preencha todos os campos obrigatórios', 'error');
        return;
    }
    
    const url = patientId ? `api/patients.php?id=${patientId}` : 'api/patients.php';
    const method = patientId ? 'PUT' : 'POST';
    
    fetch(url, {
        method: method,
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const sessionPrice = formData.get('session_price');
            const patientIdToSave = patientId || data.patient_id;
            
            if (patientIdToSave && sessionPrice) {
                fetch('api/pricing.php', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        patient_id: patientIdToSave,
                        session_price: parseFloat(sessionPrice)
                    })
                })
                .then(() => {
                    closeModal('patient-modal');
                    loadPatients();
                    showToast('Paciente salvo com sucesso!', 'success');
                    currentPatientId = patientIdToSave;
                })
                .catch(error => {
                    console.error('Error saving price:', error);
                    closeModal('patient-modal');
                    loadPatients();
                    showToast('Paciente salvo, mas erro ao salvar preço', 'warning');
                });
            } else {
                closeModal('patient-modal');
                loadPatients();
                showToast('Paciente salvo com sucesso!', 'success');
                currentPatientId = patientIdToSave;
            }
        } else {
            showToast(data.message || 'Erro ao salvar paciente', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('Erro ao salvar paciente', 'error');
    });
}

function editPatient(patientId) {
    openPatientModal(patientId);
}

function deletePatient(patientId) {
    if (confirm('Tem certeza que deseja excluir este paciente?')) {
        fetch(`api/patients.php?id=${patientId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                loadPatients();
                showToast('Paciente excluído com sucesso!', 'success');
            } else {
                showToast(data.message || 'Erro ao excluir paciente', 'error');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showToast('Erro ao excluir paciente', 'error');
        });
    }
}

// ======================
// ANAMNESIS FUNCTIONS
// ======================

function viewPatientAnamnesis(patientId = null) {
    const id = patientId || currentPatientId;
    if (!id) {
        showToast('Selecione um paciente primeiro', 'error');
        return;
    }
    
    currentPatientId = id;
    openModal('anamnesis-modal');
    loadAnamnesis(id);
}

function loadAnamnesis(patientId) {
    document.getElementById('anamnesis_patient_id').value = patientId;
    
    fetch(`api/anamnesis.php?patient_id=${patientId}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById('anamnesis_complaint').value = data.complaint || '';
            document.getElementById('anamnesis_history_illness').value = data.history_illness || '';
            document.getElementById('anamnesis_previous_treatments').value = data.previous_treatments || '';
            document.getElementById('anamnesis_medications').value = data.medications || '';
            document.getElementById('anamnesis_family_history').value = data.family_history || '';
            document.getElementById('anamnesis_personal_history').value = data.personal_history || '';
            document.getElementById('anamnesis_social_history').value = data.social_history || '';
            document.getElementById('anamnesis_observations').value = data.observations || '';
        })
        .catch(error => {
            console.error('Error loading anamnesis:', error);
        });
}

function saveAnamnesis() {
    const patientId = document.getElementById('anamnesis_patient_id').value;
    
    const data = {
        patient_id: patientId,
        complaint: document.getElementById('anamnesis_complaint').value,
        history_illness: document.getElementById('anamnesis_history_illness').value,
        previous_treatments: document.getElementById('anamnesis_previous_treatments').value,
        medications: document.getElementById('anamnesis_medications').value,
        family_history: document.getElementById('anamnesis_family_history').value,
        personal_history: document.getElementById('anamnesis_personal_history').value,
        social_history: document.getElementById('anamnesis_social_history').value,
        observations: document.getElementById('anamnesis_observations').value
    };
    
    fetch('api/anamnesis.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            closeModal('anamnesis-modal');
            showToast('Anamnese salva com sucesso!', 'success');
        } else {
            showToast(result.message || 'Erro ao salvar anamnese', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('Erro ao salvar anamnese', 'error');
    });
}

// ======================
// HISTORY FUNCTIONS
// ======================

function viewPatientHistory(patientId = null) {
    const id = patientId || currentPatientId;
    if (!id) {
        showToast('Selecione um paciente primeiro', 'error');
        return;
    }
    
    currentPatientId = id;
    openModal('history-modal');
    loadPatientHistory(id);
}

function loadPatientHistory(patientId) {
    fetch(`api/consultation-history.php?patient_id=${patientId}`)
        .then(response => response.json())
        .then(data => {
            displayHistoryStats(data.stats);
            displaySessionsList(data.sessions);
            
            document.getElementById('session_patient_id').value = patientId;
        })
        .catch(error => {
            console.error('Error loading history:', error);
            showToast('Erro ao carregar histórico', 'error');
        });
}

function displayHistoryStats(stats) {
    document.getElementById('total-sessions').textContent = stats.total_sessions || 0;
    document.getElementById('last-session').textContent = stats.last_session ? 
        new Date(stats.last_session).toLocaleDateString('pt-BR') : '-';
    document.getElementById('avg-duration').textContent = stats.avg_duration ? 
        Math.round(stats.avg_duration) + ' min' : '50 min';
}

function displaySessionsList(sessions) {
    const container = document.getElementById('sessions-list');
    
    if (!sessions || sessions.length === 0) {
        container.innerHTML = '<p class="text-center">Nenhuma sessão registrada ainda.</p>';
        return;
    }
    
    container.innerHTML = sessions.map(session => `
        <div class="session-item" onclick="editSession(${session.id})">
            <div class="session-header">
                <span class="session-number">Sessão ${session.session_number}</span>
                <span class="session-date">${new Date(session.session_date).toLocaleDateString('pt-BR')}</span>
                <span class="session-mood mood-${session.patient_mood}">${getMoodLabel(session.patient_mood)}</span>
            </div>
            <div class="session-content">
                <div class="session-notes">${escapeHtml(session.session_notes) || 'Sem anotações'}</div>
                ${session.homework ? `<div style="margin-top: 0.5rem;"><strong>Tarefa:</strong> ${escapeHtml(session.homework)}</div>` : ''}
            </div>
        </div>
    `).join('');
}

// ======================
// SESSION FUNCTIONS
// ======================

function openSessionModal() {
    const patientId = currentPatientId || document.getElementById('session_patient_id').value;
    
    if (!patientId) {
        showToast('Paciente não identificado', 'error');
        return;
    }
    
    document.getElementById('session-modal-title').textContent = 'Nova Sessão';
    document.getElementById('session_id').value = '';
    document.getElementById('session_patient_id').value = patientId;
    document.getElementById('session_date').value = new Date().toISOString().split('T')[0];
    
    document.getElementById('session-form').reset();
    document.getElementById('session_duration').value = '50';
    document.getElementById('session_patient_mood').value = 'neutral';
    
    openModal('session-modal');
}

function editSession(sessionId) {
    fetch(`api/consultation-history.php?id=${sessionId}`)
        .then(response => response.json())
        .then(session => {
            document.getElementById('session-modal-title').textContent = `Editar Sessão ${session.session_number}`;
            document.getElementById('session_id').value = session.id;
            document.getElementById('session_patient_id').value = session.patient_id;
            document.getElementById('session_appointment_id').value = session.appointment_id || '';
            document.getElementById('session_date').value = session.session_date;
            document.getElementById('session_duration').value = session.session_duration;
            document.getElementById('session_patient_mood').value = session.patient_mood;
            document.getElementById('session_notes').value = session.session_notes || '';
            document.getElementById('session_observations').value = session.observations || '';
            document.getElementById('session_homework').value = session.homework || '';
            document.getElementById('session_next_goals').value = session.next_session_goals || '';
            
            openModal('session-modal');
        })
        .catch(error => {
            console.error('Error loading session:', error);
            showToast('Erro ao carregar sessão', 'error');
        });
}

function saveSession() {
    const sessionId = document.getElementById('session_id').value;
    const patientId = document.getElementById('session_patient_id').value;
    
    const data = {
        patient_id: patientId,
        appointment_id: document.getElementById('session_appointment_id').value || null,
        session_date: document.getElementById('session_date').value,
        session_duration: parseInt(document.getElementById('session_duration').value),
        patient_mood: document.getElementById('session_patient_mood').value,
        session_notes: document.getElementById('session_notes').value,
        observations: document.getElementById('session_observations').value,
        homework: document.getElementById('session_homework').value,
        next_session_goals: document.getElementById('session_next_goals').value
    };
    
    const url = sessionId ? `api/consultation-history.php?id=${sessionId}` : 'api/consultation-history.php';
    const method = sessionId ? 'PUT' : 'POST';
    
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            closeModal('session-modal');
            loadPatientHistory(patientId);
            showToast('Sessão salva com sucesso!', 'success');
        } else {
            showToast(result.message || 'Erro ao salvar sessão', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('Erro ao salvar sessão', 'error');
    });
}

// ======================
// CALENDAR/APPOINTMENTS
// ======================

function loadCalendar() {
    const dateStr = formatDateForAPI(currentDate);
    updateDateDisplay();
    updateDayStats([]);
    
    fetch(`api/appointments.php?date=${dateStr}`)
        .then(response => response.json())
        .then(data => {
            displayDailyAppointments(data);
            updateDayStats(data);
        })
        .catch(error => {
            console.error('Error loading appointments:', error);
        });
}

function displayDailyAppointments(appointments) {
    const container = document.getElementById('daily-appointments');
    if (!container) return;
    
    if (appointments.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-calendar"></i>
                <h3>Nenhuma consulta agendada</h3>
                <p>Não há consultas marcadas para este dia</p>
                <button class="btn btn-primary" onclick="openAppointmentModal()">
                    <i class="fas fa-plus"></i> Agendar Consulta
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = appointments.map(appointment => `
        <div class="appointment-item">
            <div class="appointment-icon">
                <i class="fas fa-user"></i>
            </div>
            <div class="appointment-info">
                <h3>${escapeHtml(appointment.patient_name)}</h3>
                <p>${formatTime(appointment.appointment_time)} (${appointment.duration} min)</p>
                ${appointment.notes ? `<p class="appointment-notes">${escapeHtml(appointment.notes)}</p>` : ''}
            </div>
            <div class="appointment-meta">
                <span class="status ${appointment.status}">${getStatusLabel(appointment.status)}</span>
            </div>
            <div class="appointment-actions">
                <button class="btn btn-outline btn-sm" onclick="editAppointment(${appointment.id})">
                    Editar
                </button>
                ${appointment.status === 'scheduled' ? `
                    <button class="btn btn-secondary btn-sm" onclick="completeAppointment(${appointment.id})">
                        Concluir
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
}

function updateDayStats(appointments) {
    const total = appointments.length;
    const scheduled = appointments.filter(apt => apt.status === 'scheduled').length;
    const completed = appointments.filter(apt => apt.status === 'completed').length;
    
    const totalEl = document.getElementById('day-total');
    const scheduledEl = document.getElementById('day-scheduled');
    const completedEl = document.getElementById('day-completed');
    
    if (totalEl) totalEl.textContent = total;
    if (scheduledEl) scheduledEl.textContent = scheduled;
    if (completedEl) completedEl.textContent = completed;
}

function openAppointmentModal(appointmentId = null) {
    const modal = document.getElementById('appointment-modal');
    const form = document.getElementById('appointment-form');
    const title = document.getElementById('appointment-modal-title');
    
    if (appointmentId) {
        title.textContent = 'Editar Consulta';
        
        fetch(`api/appointments.php?id=${appointmentId}`)
            .then(response => response.json())
            .then(appointment => {
                document.getElementById('appointment_patient_select').value = appointment.patient_id;
                document.getElementById('appointment_date').value = appointment.appointment_date;
                document.getElementById('appointment_time').value = appointment.appointment_time;
                document.getElementById('appointment_duration').value = appointment.duration;
                document.getElementById('appointment_amount').value = appointment.amount;
                document.getElementById('appointment_notes').value = appointment.notes || '';
                form.dataset.appointmentId = appointmentId;
            });
    } else {
        title.textContent = 'Nova Consulta';
        form.reset();
        delete form.dataset.appointmentId;
        document.getElementById('appointment_date').value = formatDateForAPI(currentDate);
    }
    
    fetch('api/patients.php')
        .then(response => response.json())
        .then(patients => {
            const select = document.getElementById('appointment_patient_select');
            const currentValue = select.value;
            select.innerHTML = '<option value="">Selecione um paciente</option>';
            
            patients.forEach(patient => {
                const option = document.createElement('option');
                option.value = patient.id;
                option.textContent = patient.name;
                select.appendChild(option);
            });
            
            if (currentValue) {
                select.value = currentValue;
            }
            
            openModal('appointment-modal');
        });
}

function editAppointment(appointmentId) {
    openAppointmentModal(appointmentId);
}

function saveAppointment() {
    const form = document.getElementById('appointment-form');
    const appointmentId = form.dataset.appointmentId;
    const patientId = document.getElementById('appointment_patient_select').value;
    const appointmentDate = document.getElementById('appointment_date').value;
    const appointmentTime = document.getElementById('appointment_time').value;
    
    if (!patientId || !appointmentDate || !appointmentTime) {
        showToast('Preencha todos os campos obrigatórios', 'error');
        return;
    }
    
    const amount = document.getElementById('appointment_amount').value || 100;
    
    const data = {
        patient_id: patientId,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        duration: document.getElementById('appointment_duration').value,
        amount: parseFloat(amount),
        notes: document.getElementById('appointment_notes').value
    };
    
    const url = appointmentId ? `api/appointments.php?id=${appointmentId}` : 'api/appointments.php';
    const method = appointmentId ? 'PUT' : 'POST';
    
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            closeModal('appointment-modal');
            loadCalendar();
            showToast(appointmentId ? 'Consulta atualizada!' : 'Consulta agendada com sucesso!', 'success');
        } else {
            showToast(result.message || 'Erro ao salvar consulta', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('Erro ao salvar consulta', 'error');
    });
}

function completeAppointment(appointmentId) {
    if (confirm('Marcar esta consulta como concluída?')) {
        fetch(`api/appointments.php?id=${appointmentId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: 'completed' })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                loadCalendar();
                showToast('Consulta marcada como concluída!', 'success');
            } else {
                showToast(data.message || 'Erro ao atualizar consulta', 'error');
            }
        });
    }
}

function changeDate(offset) {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + offset);
    currentDate = newDate;
    loadCalendar();
}

function updateDateDisplay() {
    const dateElement = document.getElementById('selected-date');
    if (dateElement) {
        const today = new Date();
        const isToday = currentDate.toDateString() === today.toDateString();
        
        if (isToday) {
            dateElement.textContent = 'Hoje';
        } else {
            dateElement.textContent = currentDate.toLocaleDateString('pt-BR', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        }
    }
}

// ======================
// UTILITY FUNCTIONS
// ======================

function calculateAge(birthDate) {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
        age--;
    }
    return age;
}

function formatDate(dateString) {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('pt-BR');
}

function formatTime(timeString) {
    if (!timeString) return '';
    return timeString.substring(0, 5);
}

function formatDateForAPI(date) {
    return date.toISOString().split('T')[0];
}

function getStatusLabel(status) {
    const labels = {
        'scheduled': 'Agendado',
        'completed': 'Concluído',
        'cancelled': 'Cancelado'
    };
    return labels[status] || status;
}

function getMoodLabel(mood) {
    const labels = {
        'excellent': 'Excelente',
        'good': 'Bom',
        'neutral': 'Neutro',
        'poor': 'Ruim',
        'very_poor': 'Muito Ruim'
    };
    return labels[mood] || mood;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        color: white;
        z-index: 9999;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    `;
    
    if (type === 'success') {
        toast.style.background = '#10b981';
    } else if (type === 'error') {
        toast.style.background = '#ef4444';
    } else if (type === 'warning') {
        toast.style.background = '#f59e0b';
    } else {
        toast.style.background = '#3b82f6';
    }
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            if (document.body.contains(toast)) {
                document.body.removeChild(toast);
            }
        }, 300);
    }, 3000);
}

// Add CSS for toast animations
if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
}

// ======================
// REPORTS FUNCTIONS
// ======================

function loadReportsData() {
    const params = new URLSearchParams({
        type: 'weekly'
    });
    
    fetch(`api/reports.php?${params}`)
        .then(response => response.json())
        .then(data => {
            const weekPatientsEl = document.getElementById('week-patients');
            const weekAppointmentsEl = document.getElementById('week-appointments');
            const weekRevenueEl = document.getElementById('week-revenue');
            
            if (weekPatientsEl) weekPatientsEl.textContent = data.patients_count || 0;
            if (weekAppointmentsEl) weekAppointmentsEl.textContent = data.appointments_count || 0;
            if (weekRevenueEl) weekRevenueEl.textContent = `R$ ${data.revenue || '0,00'}`;
        })
        .catch(error => {
            console.error('Error loading reports:', error);
        });
    
    const monthParams = new URLSearchParams({
        type: 'monthly'
    });
    
    fetch(`api/reports.php?${monthParams}`)
        .then(response => response.json())
        .then(data => {
            const monthPatientsEl = document.getElementById('month-patients');
            const monthAppointmentsEl = document.getElementById('month-appointments');
            const monthRevenueEl = document.getElementById('month-revenue');
            
            if (monthPatientsEl) monthPatientsEl.textContent = data.patients_count || 0;
            if (monthAppointmentsEl) monthAppointmentsEl.textContent = data.appointments_count || 0;
            if (monthRevenueEl) monthRevenueEl.textContent = `R$ ${data.revenue || '0,00'}`;
        })
        .catch(error => {
            console.error('Error loading reports:', error);
        });
}

function openReportsModal() {
    const today = new Date();
    const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
    
    const startDateEl = document.getElementById('report_start_date');
    const endDateEl = document.getElementById('report_end_date');
    
    if (startDateEl) startDateEl.value = formatDateForAPI(firstDay);
    if (endDateEl) endDateEl.value = formatDateForAPI(today);
    
    openModal('reports-modal');
    generateReport();
}

function updateReportContent() {
    generateReport();
}

function generateReport() {
    const reportTypeEl = document.getElementById('report_type');
    const startDateEl = document.getElementById('report_start_date');
    const endDateEl = document.getElementById('report_end_date');
    const contentEl = document.getElementById('report-content');
    
    if (!reportTypeEl || !startDateEl || !endDateEl || !contentEl) return;
    
    const reportType = reportTypeEl.value;
    const startDate = startDateEl.value;
    const endDate = endDateEl.value;
    
    if (!startDate || !endDate) {
        contentEl.innerHTML = '<p>Selecione as datas para gerar o relatório</p>';
        return;
    }
    
    const params = new URLSearchParams({
        type: reportType,
        start_date: startDate,
        end_date: endDate
    });
    
    fetch(`api/reports.php?${params}`)
        .then(response => response.json())
        .then(data => {
            displayReportContent(data, reportType);
        })
        .catch(error => {
            console.error('Error:', error);
            contentEl.innerHTML = '<p>Erro ao gerar relatório</p>';
        });
}

function displayReportContent(data, reportType) {
    const container = document.getElementById('report-content');
    if (!container) return;
    
    switch(reportType) {
        case 'monthly':
            container.innerHTML = `
                <div class="report-section">
                    <h3>Resumo Mensal</h3>
                    <div class="report-stats">
                        <div class="stat-card">
                            <h4>${data.total_appointments || 0}</h4>
                            <p>Consultas Realizadas</p>
                        </div>
                        <div class="stat-card">
                            <h4>${data.total_patients || 0}</h4>
                            <p>Pacientes Atendidos</p>
                        </div>
                        <div class="stat-card">
                            <h4>R$ ${data.estimated_revenue || '0,00'}</h4>
                            <p>Receita Estimada</p>
                        </div>
                    </div>
                </div>
            `;
            break;
        case 'patients':
            container.innerHTML = `
                <div class="report-section">
                    <h3>Relatório de Pacientes</h3>
                    <div class="report-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Nome</th>
                                    <th>Email</th>
                                    <th>Consultas</th>
                                    <th>Última Consulta</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.patients ? data.patients.map(patient => `
                                    <tr>
                                        <td>${escapeHtml(patient.name)}</td>
                                        <td>${escapeHtml(patient.email)}</td>
                                        <td>${patient.appointment_count || 0}</td>
                                        <td>${patient.last_appointment ? formatDate(patient.last_appointment) : 'Nunca'}</td>
                                    </tr>
                                `).join('') : '<tr><td colspan="4">Nenhum paciente encontrado</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
            break;
        case 'appointments':
            container.innerHTML = `
                <div class="report-section">
                    <h3>Relatório de Consultas</h3>
                    <div class="report-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Data</th>
                                    <th>Paciente</th>
                                    <th>Horário</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${data.appointments ? data.appointments.map(apt => `
                                    <tr>
                                        <td>${formatDate(apt.appointment_date)}</td>
                                        <td>${escapeHtml(apt.patient_name)}</td>
                                        <td>${formatTime(apt.appointment_time)}</td>
                                        <td><span class="status-badge ${apt.status}">${getStatusLabel(apt.status)}</span></td>
                                    </tr>
                                `).join('') : '<tr><td colspan="4">Nenhuma consulta encontrada</td></tr>'}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
            break;
        case 'financial':
            container.innerHTML = `
                <div class="report-section">
                    <h3>Relatório Financeiro</h3>
                    <div class="financial-summary">
                        <div class="financial-item">
                            <span class="label">Consultas Concluídas:</span>
                            <span class="value">${data.completed_appointments || 0}</span>
                        </div>
                        <div class="financial-item">
                            <span class="label">Valor médio por consulta:</span>
                            <span class="value">R$ ${data.average_value || '0,00'}</span>
                        </div>
                        <div class="financial-item">
                            <span class="label">Receita Total:</span>
                            <span class="value total">R$ ${data.total_revenue || '0,00'}</span>
                        </div>
                    </div>
                </div>
            `;
            break;
    }
}

function exportReport() {
    showToast('Funcionalidade de exportação em desenvolvimento', 'info');
}

// ======================
// SETTINGS FUNCTIONS
// ======================

function openSettingsModal() {
    loadUserSettings();
    openModal('settings-modal');
}

function loadUserSettings() {
    fetch('api/user.php')
        .then(response => response.json())
        .then(user => {
            const profileNameEl = document.getElementById('profile_name');
            const profileEmailEl = document.getElementById('profile_email');
            const profileCrpEl = document.getElementById('profile_crp');
            const profilePhoneEl = document.getElementById('profile_phone');
            
            if (profileNameEl) profileNameEl.value = user.name || '';
            if (profileEmailEl) profileEmailEl.value = user.email || '';
            if (profileCrpEl) profileCrpEl.value = user.crp || '';
            if (profilePhoneEl) profilePhoneEl.value = user.phone || '';
        })
        .catch(error => {
            console.error('Error loading user settings:', error);
        });
}

function switchSettingsTab(tabName) {
    document.querySelectorAll('.settings-tab').forEach(tab => {
        tab.classList.remove('active');
        tab.setAttribute('aria-selected', 'false');
    });
    
    document.querySelectorAll('.settings-content').forEach(content => {
        content.style.display = 'none';
    });
    
    const selectedTab = document.querySelector(`[data-tab="${tabName}"]`);
    if (selectedTab) {
        selectedTab.classList.add('active');
        selectedTab.setAttribute('aria-selected', 'true');
    }
    
    const content = document.getElementById(`${tabName}-settings`);
    if (content) {
        content.style.display = 'block';
    }
}

function saveSettings() {
    const activeTab = document.querySelector('.settings-content[style*="display: block"]');
    if (!activeTab) return;
    
    const activeTabId = activeTab.id;
    
    switch(activeTabId) {
        case 'profile-settings':
            saveProfileSettings();
            break;
        case 'preferences-settings':
            savePreferences();
            break;
        case 'security-settings':
            saveSecuritySettings();
            break;
    }
}

function saveProfileSettings() {
    const form = document.getElementById('profile-form');
    if (!form) return;
    
    const formData = new FormData(form);
    
    const data = {
        name: formData.get('name'),
        email: formData.get('email'),
        crp: formData.get('crp'),
        phone: formData.get('phone')
    };
    
    fetch('api/user.php', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            showToast('Perfil atualizado com sucesso!', 'success');
            setTimeout(() => {
                location.reload();
            }, 1500);
        } else {
            showToast(result.message || 'Erro ao atualizar perfil', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('Erro ao atualizar perfil', 'error');
    });
}

function savePreferences() {
    showToast('Preferências salvas!', 'success');
}

function saveSecuritySettings() {
    const currentPasswordEl = document.getElementById('current_password');
    const newPasswordEl = document.getElementById('new_password');
    const confirmPasswordEl = document.getElementById('confirm_new_password');
    
    if (!currentPasswordEl || !newPasswordEl || !confirmPasswordEl) return;
    
    const currentPassword = currentPasswordEl.value;
    const newPassword = newPasswordEl.value;
    const confirmPassword = confirmPasswordEl.value;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
        showToast('Preencha todos os campos de senha', 'error');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        showToast('As senhas não coincidem', 'error');
        return;
    }
    
    if (newPassword.length < 6) {
        showToast('A nova senha deve ter pelo menos 6 caracteres', 'error');
        return;
    }
    
    const data = {
        current_password: currentPassword,
        new_password: newPassword
    };
    
    fetch('api/user.php?action=change_password', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            showToast('Senha alterada com sucesso!', 'success');
            const securityForm = document.getElementById('security-form');
            if (securityForm) securityForm.reset();
        } else {
            showToast(result.message || 'Erro ao alterar senha', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('Erro ao alterar senha', 'error');
    });
}

// ======================
// PRICING FUNCTIONS
// ======================

function openPricingModal() {
    const form = document.getElementById('pricing-form');
    if (form) {
        form.reset();
        delete form.dataset.pricingId;
    }
    
    loadPatientsForPricing();
    openModal('pricing-modal');
}

function loadPatientsForPricing() {
    fetch('api/patients.php')
        .then(response => response.json())
        .then(patients => {
            const select = document.getElementById('pricing_patient_select');
            if (!select) return;
            
            select.innerHTML = '<option value="">Selecione um paciente</option>';
            
            patients.forEach(patient => {
                const option = document.createElement('option');
                option.value = patient.id;
                option.textContent = patient.name;
                select.appendChild(option);
            });
        })
        .catch(error => {
            console.error('Error loading patients:', error);
        });
}

function savePricing() {
    const form = document.getElementById('pricing-form');
    if (!form) return;
    
    const formData = new FormData(form);
    
    if (!formData.get('patient_id') || !formData.get('session_price')) {
        showToast('Preencha todos os campos obrigatórios', 'error');
        return;
    }
    
    const data = {
        patient_id: formData.get('patient_id'),
        session_price: parseFloat(formData.get('session_price')),
        notes: formData.get('notes') || ''
    };
    
    fetch('api/pricing.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            closeModal('pricing-modal');
            showToast('Preço salvo com sucesso!', 'success');
        } else {
            showToast(result.message || 'Erro ao salvar preço', 'error');
        }
    })
    .catch(error => {
        console.error('Error:', error);
        showToast('Erro ao salvar preço', 'error');
    });
}
// =========================================
// NOVAS FUNÇÕES - ADICIONAR NO assets/js/app.js
// =========================================

// ⭐ NOVA FUNÇÃO - Alternar status do paciente
function togglePatientStatus(patientId) {
    console.log('🔄 Alternando status do paciente:', patientId);
    
    if (confirm('Deseja alterar o status deste paciente?')) {
        fetch(`api/patients.php?id=${patientId}&action=toggle-status`, {
            method: 'PUT'
        })
        .then(response => response.json())
        .then(data => {
            console.log('📊 Resposta:', data);
            
            if (data.success) {
                loadPatients();
                showToast('Status alterado com sucesso!', 'success');
            } else {
                showToast(data.message || 'Erro ao alterar status', 'error');
            }
        })
        .catch(error => {
            console.error('❌ Erro:', error);
            showToast('Erro ao alterar status', 'error');
        });
    }
}

// ⭐ NOVA FUNÇÃO - Deletar sessão
function deleteSession(sessionId) {
    console.log('🗑️ Deletando sessão:', sessionId);
    
    if (confirm('Tem certeza que deseja excluir esta sessão? Esta ação não pode ser desfeita.')) {
        const patientId = currentPatientId || document.getElementById('session_patient_id').value;
        
        fetch(`api/consultation-history.php?id=${sessionId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            console.log('📊 Resposta:', data);
            
            if (data.success) {
                loadPatientHistory(patientId);
                showToast('Sessão excluída com sucesso!', 'success');
            } else {
                showToast(data.message || 'Erro ao excluir sessão', 'error');
            }
        })
        .catch(error => {
            console.error('❌ Erro:', error);
            showToast('Erro ao excluir sessão', 'error');
        });
    }
}

// ⭐ ATUALIZAR displayPatients - Substituir a função existente
function displayPatients(patients) {
    const grid = document.getElementById('patients-grid');
    if (!grid) return;
    
    if (patients.length === 0) {
        grid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <i class="fas fa-users"></i>
                <h3>Nenhum paciente encontrado</h3>
                <p>Tente ajustar os termos da busca ou adicione um novo paciente</p>
                <button class="btn btn-primary" onclick="openPatientModal()">
                    <i class="fas fa-plus"></i> Adicionar Primeiro Paciente
                </button>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = patients.map(patient => {
        const age = calculateAge(patient.birth_date);
        const statusClass = patient.status === 'active' ? 'success' : 'secondary';
        const statusLabel = patient.status === 'active' ? 'Ativo' : 'Inativo';
        const statusIcon = patient.status === 'active' ? 'check-circle' : 'pause-circle';
        
        return `
            <div class="patient-card ${patient.status === 'inactive' ? 'inactive-patient' : ''}">
                <div class="patient-card-header">
                    <div class="patient-card-info">
                        <h3>${escapeHtml(patient.name)}</h3>
                        <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
                            <span class="badge">${age} anos</span>
                            <span class="badge badge-${statusClass}">
                                <i class="fas fa-${statusIcon}"></i> ${statusLabel}
                            </span>
                        </div>
                    </div>
                </div>
                
                <div class="patient-card-details">
                    <div class="detail-item">
                        <i class="fas fa-envelope"></i>
                        <span>${escapeHtml(patient.email)}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-phone"></i>
                        <span>${escapeHtml(patient.phone)}</span>
                    </div>
                    <div class="detail-item">
                        <i class="fas fa-calendar"></i>
                        <span>Paciente desde ${formatDate(patient.created_at)}</span>
                    </div>
                </div>
                
                <div class="patient-card-actions">
                    <button class="btn btn-outline btn-sm" onclick="editPatient(${patient.id})" title="Editar paciente">
                        <i class="fas fa-edit"></i> Editar
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="viewPatientAnamnesis(${patient.id})" title="Ver anamnese">
                        <i class="fas fa-clipboard-list"></i> Anamnese
                    </button>
                    <button class="btn btn-outline btn-sm" onclick="viewPatientHistory(${patient.id})" title="Ver histórico">
                        <i class="fas fa-history"></i> Histórico
                    </button>
                    <button class="btn btn-${patient.status === 'active' ? 'warning' : 'success'} btn-sm" 
                            onclick="togglePatientStatus(${patient.id})"
                            title="${patient.status === 'active' ? 'Desativar' : 'Ativar'} paciente">
                        <i class="fas fa-${patient.status === 'active' ? 'pause' : 'play'}"></i>
                        ${patient.status === 'active' ? 'Desativar' : 'Ativar'}
                    </button>
                    <button class="btn btn-destructive btn-sm" onclick="deletePatient(${patient.id})" title="Excluir paciente">
                        <i class="fas fa-trash"></i> Excluir
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// ⭐ ATUALIZAR displaySessionsList - Substituir a função existente
function displaySessionsList(sessions) {
    const container = document.getElementById('sessions-list');
    
    if (!sessions || sessions.length === 0) {
        container.innerHTML = '<p class="text-center" style="padding: 2rem; color: #6b7280;">Nenhuma sessão registrada ainda.</p>';
        return;
    }
    
    container.innerHTML = sessions.map(session => `
        <div class="session-item" style="position: relative;">
            <div class="session-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                <div style="display: flex; gap: 0.75rem; align-items: center; flex: 1;">
                    <span class="session-number" style="font-weight: 600;">Sessão ${session.session_number}</span>
                    <span class="session-date" style="color: #6b7280;">${new Date(session.session_date).toLocaleDateString('pt-BR')}</span>
                    <span class="session-mood mood-${session.patient_mood}" style="padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.875rem;">
                        ${getMoodLabel(session.patient_mood)}
                    </span>
                </div>
                <button class="btn btn-sm btn-destructive" 
                        onclick="event.stopPropagation(); deleteSession(${session.id});" 
                        title="Excluir sessão"
                        style="padding: 0.25rem 0.5rem; display: flex; align-items: center; gap: 0.25rem;">
                    <i class="fas fa-trash"></i>
                    <span style="font-size: 0.75rem;">Excluir</span>
                </button>
            </div>
            <div class="session-content" onclick="editSession(${session.id})" 
                 style="cursor: pointer; padding: 0.75rem; background: #f9fafb; border-radius: 0.375rem; transition: background 0.2s;"
                 onmouseover="this.style.background='#f3f4f6'" 
                 onmouseout="this.style.background='#f9fafb'">
                <div class="session-notes" style="color: #374151;">${escapeHtml(session.session_notes) || '<em style="color: #9ca3af;">Sem anotações</em>'}</div>
                ${session.homework ? `<div style="margin-top: 0.5rem; padding-top: 0.5rem; border-top: 1px solid #e5e7eb;"><strong style="color: #6366f1;">Tarefa:</strong> <span style="color: #374151;">${escapeHtml(session.homework)}</span></div>` : ''}
            </div>
        </div>
    `).join('');
}

console.log('✅ App.js carregado com sucesso!');