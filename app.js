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
// CALENDAR/APPOINTMENTS - CALENDÁRIO MENSAL
// ======================

let currentMonth = new Date().getMonth();
let currentYear = new Date().getFullYear();
let selectedDate = new Date();
let monthAppointments = [];

function loadCalendar() {
    console.log('📅 Carregando calendário:', currentMonth + 1, currentYear);
    
    updateMonthYearDisplay();
    
    // Buscar todas as consultas do mês
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    
    const startDate = formatDateForAPI(firstDay);
    const endDate = formatDateForAPI(lastDay);
    
    console.log('📅 Período:', startDate, 'até', endDate);
    
    fetch(`api/appointments.php?start_date=${startDate}&end_date=${endDate}`)
        .then(response => response.json())
        .then(data => {
            console.log('✅ Consultas carregadas:', data.length);
            monthAppointments = Array.isArray(data) ? data : [];
            renderCalendarDays();
            loadDayAppointments(selectedDate);
        })
        .catch(error => {
            console.error('❌ Erro ao carregar calendário:', error);
            monthAppointments = [];
            renderCalendarDays();
        });
}

function renderCalendarDays() {
    const container = document.getElementById('calendar-days');
    if (!container) {
        console.error('❌ Elemento calendar-days não encontrado');
        return;
    }
    
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const prevLastDay = new Date(currentYear, currentMonth, 0);
    
    const firstDayOfWeek = firstDay.getDay();
    const lastDateOfMonth = lastDay.getDate();
    const prevLastDate = prevLastDay.getDate();
    
    let days = [];
    
    // Dias do mês anterior
    for (let i = firstDayOfWeek; i > 0; i--) {
        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        days.push({
            date: prevLastDate - i + 1,
            isCurrentMonth: false,
            month: prevMonth,
            year: prevYear
        });
    }
    
    // Dias do mês atual
    for (let i = 1; i <= lastDateOfMonth; i++) {
        days.push({
            date: i,
            isCurrentMonth: true,
            month: currentMonth,
            year: currentYear
        });
    }
    
    // Dias do próximo mês para completar o grid
    const remainingDays = 42 - days.length; // 6 semanas x 7 dias
    for (let i = 1; i <= remainingDays; i++) {
        const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
        const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
        days.push({
            date: i,
            isCurrentMonth: false,
            month: nextMonth,
            year: nextYear
        });
    }
    
    // Renderizar dias
    container.innerHTML = days.map(day => {
        const date = new Date(day.year, day.month, day.date);
        const dateStr = formatDateForAPI(date);
        
        // Verificar se é hoje
        const today = new Date();
        const isToday = date.toDateString() === today.toDateString();
        
        // Verificar se é o dia selecionado
        const isSelected = date.toDateString() === selectedDate.toDateString();
        
        // Contar consultas do dia
        const dayAppointments = monthAppointments.filter(apt => apt.appointment_date === dateStr);
        const hasAppointments = dayAppointments.length > 0;
        
        // Contar por status
        const scheduled = dayAppointments.filter(apt => apt.status === 'scheduled').length;
        const completed = dayAppointments.filter(apt => apt.status === 'completed').length;
        
        let classes = ['calendar-day'];
        if (!day.isCurrentMonth) classes.push('other-month');
        if (isToday) classes.push('today');
        if (isSelected) classes.push('selected');
        if (hasAppointments) classes.push('has-appointments');
        
        return `
            <div class="${classes.join(' ')}" onclick="selectDate('${dateStr}')" data-date="${dateStr}">
                <div class="day-number">${day.date}</div>
                ${hasAppointments ? `
                    <div class="day-appointments">
                        ${scheduled > 0 ? `<span class="apt-badge scheduled">${scheduled}</span>` : ''}
                        ${completed > 0 ? `<span class="apt-badge completed">${completed}</span>` : ''}
                    </div>
                ` : ''}
            </div>
        `;
    }).join('');
    
    console.log('✅ Calendário renderizado:', days.length, 'dias');
}

function selectDate(dateStr) {
    console.log('📅 Data selecionada:', dateStr);
    selectedDate = new Date(dateStr + 'T12:00:00');
    
    // Atualizar visual
    document.querySelectorAll('.calendar-day').forEach(day => {
        day.classList.remove('selected');
    });
    
    const selectedDay = document.querySelector(`[data-date="${dateStr}"]`);
    if (selectedDay) {
        selectedDay.classList.add('selected');
    }
    
    loadDayAppointments(selectedDate);
}

function loadDayAppointments(date) {
    const dateStr = formatDateForAPI(date);
    const dayName = date.toLocaleDateString('pt-BR', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long' 
    });
    
    // Capitalizar primeira letra
    const capitalizedDayName = dayName.charAt(0).toUpperCase() + dayName.slice(1);
    
    document.getElementById('selected-day-title').textContent = capitalizedDayName;
    
    const dayAppointments = monthAppointments.filter(apt => apt.appointment_date === dateStr);
    
    document.getElementById('selected-day-count').textContent = dayAppointments.length;
    
    displayDailyAppointments(dayAppointments);
}

function displayDailyAppointments(appointments) {
    const container = document.getElementById('daily-appointments-list');
    if (!container) {
        console.error('❌ Elemento daily-appointments-list não encontrado');
        return;
    }
    
    if (appointments.length === 0) {
        container.innerHTML = `
            <div class="empty-state-calendar">
                <i class="fas fa-calendar-check"></i>
                <p>Nenhuma consulta neste dia</p>
                <button class="btn btn-primary" onclick="openAppointmentModalForDate()">
                    <i class="fas fa-plus"></i> Agendar Consulta
                </button>
            </div>
        `;
        return;
    }
    
    // Ordenar por horário
    appointments.sort((a, b) => a.appointment_time.localeCompare(b.appointment_time));
    
    container.innerHTML = appointments.map(appointment => `
        <div class="appointment-card ${appointment.status}">
            <div class="appointment-time">
                <i class="fas fa-clock"></i>
                <span>${formatTime(appointment.appointment_time)}</span>
            </div>
            <div class="appointment-details">
                <h4>${escapeHtml(appointment.patient_name)}</h4>
                <p>${appointment.duration} minutos</p>
                ${appointment.amount ? `<span class="amount">R$ ${parseFloat(appointment.amount).toFixed(2)}</span>` : ''}
            </div>
            <div class="appointment-status">
                <span class="status-badge ${appointment.status}">${getStatusLabel(appointment.status)}</span>
                <div class="appointment-menu">
                    <button class="btn-icon" onclick="toggleAppointmentMenu(event, ${appointment.id})">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                    <div class="appointment-dropdown" id="menu-${appointment.id}">
    <button onclick="event.stopPropagation(); closeAllMenus(); editAppointment(${appointment.id})">
        <i class="fas fa-edit"></i> Editar
    </button>
    ${appointment.status === 'scheduled' ? `
        <button onclick="event.stopPropagation(); closeAllMenus(); openRescheduleModal(${appointment.id})">
            <i class="fas fa-calendar-alt"></i> Reagendar
        </button>
        <button onclick="event.stopPropagation(); closeAllMenus(); completeAppointment(${appointment.id})">
            <i class="fas fa-check"></i> Concluir
        </button>
        <button onclick="event.stopPropagation(); closeAllMenus(); cancelAppointment(${appointment.id})" class="text-warning">
            <i class="fas fa-ban"></i> Cancelar
        </button>
    ` : ''}
    ${appointment.status === 'cancelled' ? `
        <button onclick="event.stopPropagation(); closeAllMenus(); reactivateAppointment(${appointment.id})">
            <i class="fas fa-undo"></i> Reativar
        </button>
    ` : ''}
    <button onclick="event.stopPropagation(); closeAllMenus(); deleteAppointment(${appointment.id})" class="text-danger">
        <i class="fas fa-trash"></i> Excluir
    </button>
</div>
                </div>
            </div>
        </div>
    `).join('');
}

function toggleAppointmentMenu(event, appointmentId) {
    event.stopPropagation();
    
    // Fechar outros menus
    document.querySelectorAll('.appointment-dropdown').forEach(menu => {
        if (menu.id !== `menu-${appointmentId}`) {
            menu.classList.remove('active');
        }
    });
    
    const menu = document.getElementById(`menu-${appointmentId}`);
    if (menu) {
        menu.classList.toggle('active');
    }
}

// Fechar menu ao clicar fora
document.addEventListener('click', function(e) {
    if (!e.target.closest('.appointment-menu')) {
        document.querySelectorAll('.appointment-dropdown').forEach(menu => {
            menu.classList.remove('active');
        });
    }
});

function changeMonth(offset) {
    currentMonth += offset;
    
    if (currentMonth < 0) {
        currentMonth = 11;
        currentYear--;
    } else if (currentMonth > 11) {
        currentMonth = 0;
        currentYear++;
    }
    
    console.log('📅 Mudando para:', currentMonth + 1, currentYear);
    loadCalendar();
}

function goToToday() {
    const today = new Date();
    currentMonth = today.getMonth();
    currentYear = today.getFullYear();
    selectedDate = today;
    console.log('📅 Indo para hoje:', currentMonth + 1, currentYear);
    loadCalendar();
}

function updateMonthYearDisplay() {
    const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    
    const display = document.getElementById('current-month-year');
    if (display) {
        display.textContent = `${monthNames[currentMonth]} ${currentYear}`;
    }
}

function openAppointmentModalForDate() {
    console.log('📅 Abrindo modal para data:', selectedDate);
    
    const modal = document.getElementById('appointment-modal');
    const form = document.getElementById('appointment-form');
    const title = document.getElementById('appointment-modal-title');
    
    if (!modal || !form || !title) {
        console.error('❌ Elementos do modal não encontrados');
        return;
    }
    
    title.textContent = 'Nova Consulta';
    form.reset();
    delete form.dataset.appointmentId;
    document.getElementById('appointment_date').value = formatDateForAPI(selectedDate);
    
    fetch('api/patients.php')
        .then(response => response.json())
        .then(patients => {
            const select = document.getElementById('appointment_patient_select');
            if (!select) {
                console.error('❌ Select de pacientes não encontrado');
                return;
            }
            
            select.innerHTML = '<option value="">Selecione um paciente</option>';
            
            patients.forEach(patient => {
                if (patient.status === 'active' || !patient.status) {
                    const option = document.createElement('option');
                    option.value = patient.id;
                    option.textContent = patient.name;
                    select.appendChild(option);
                }
            });
            
            openModal('appointment-modal');
        })
        .catch(error => {
            console.error('❌ Erro ao carregar pacientes:', error);
            showToast('Erro ao carregar pacientes', 'error');
        });
}

function deleteAppointment(appointmentId) {
    console.log('🗑️ Deletar consulta:', appointmentId);
    
    if (confirm('Tem certeza que deseja cancelar esta consulta?')) {
        fetch(`api/appointments.php?id=${appointmentId}`, {
            method: 'DELETE'
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showToast('Consulta cancelada com sucesso!', 'success');
                loadCalendar();
            } else {
                showToast(data.message || 'Erro ao cancelar consulta', 'error');
            }
        })
        .catch(error => {
            console.error('❌ Erro:', error);
            showToast('Erro ao cancelar consulta', 'error');
        });
    }
}

function completeAppointment(appointmentId) {
    console.log('✅ Concluir consulta:', appointmentId);
    
    if (confirm('Marcar esta consulta como concluída?')) {
        fetch(`api/appointments.php?id=${appointmentId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'completed' })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showToast('Consulta marcada como concluída!', 'success');
                loadCalendar();
            } else {
                showToast(data.message || 'Erro ao atualizar consulta', 'error');
            }
        })
        .catch(error => {
            console.error('❌ Erro:', error);
            showToast('Erro ao atualizar consulta', 'error');
        });
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
// =========================================
// REAGENDAR CONSULTA - ADICIONAR NO FINAL
// =========================================

function openRescheduleModal(appointmentId) {
    console.log('📅 Reagendar consulta:', appointmentId);
    
    fetch(`api/appointments.php?id=${appointmentId}`)
        .then(response => response.json())
        .then(appointment => {
            // Buscar nome do paciente
            return fetch(`api/patients.php?id=${appointment.patient_id}`)
                .then(r => r.json())
                .then(patient => {
                    const info = `${patient.name} - ${formatDate(appointment.appointment_date)} às ${formatTime(appointment.appointment_time)}`;
                    document.getElementById('original-appointment-info').textContent = info;
                    
                    document.getElementById('reschedule_appointment_id').value = appointmentId;
                    document.getElementById('reschedule_date').value = appointment.appointment_date;
                    document.getElementById('reschedule_time').value = appointment.appointment_time;
                    document.getElementById('reschedule_reason').value = '';
                    
                    openModal('reschedule-modal');
                });
        })
        .catch(error => {
            console.error('❌ Erro:', error);
            showToast('Erro ao carregar consulta', 'error');
        });
}

function confirmReschedule() {
    const appointmentId = document.getElementById('reschedule_appointment_id').value;
    const newDate = document.getElementById('reschedule_date').value;
    const newTime = document.getElementById('reschedule_time').value;
    const reason = document.getElementById('reschedule_reason').value;
    
    if (!newDate || !newTime) {
        showToast('Preencha data e horário', 'error');
        return;
    }
    
    const data = {
        appointment_date: newDate,
        appointment_time: newTime
    };
    
    if (reason) {
        data.notes = `Reagendado: ${reason}`;
    }
    
    fetch(`api/appointments.php?id=${appointmentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(result => {
        if (result.success) {
            closeModal('reschedule-modal');
            loadCalendar();
            showToast('Consulta reagendada com sucesso!', 'success');
        } else {
            showToast(result.message || 'Erro ao reagendar', 'error');
        }
    })
    .catch(error => {
        console.error('❌ Erro:', error);
        showToast('Erro ao reagendar', 'error');
    });
}
function openAppointmentModal(appointmentId = null) {
    console.log('📅 openAppointmentModal chamado, ID:', appointmentId);
    
    const modal = document.getElementById('appointment-modal');
    const form = document.getElementById('appointment-form');
    const title = document.getElementById('appointment-modal-title');
    
    if (!modal || !form || !title) {
        console.error('❌ Elementos do modal não encontrados');
        return;
    }
    
    if (appointmentId) {
        // Editando consulta existente
        title.textContent = 'Editar Consulta';
        
        fetch(`api/appointments.php?id=${appointmentId}`)
            .then(response => response.json())
            .then(appointment => {
                console.log('📊 Dados da consulta:', appointment);
                
                document.getElementById('appointment_patient_select').value = appointment.patient_id;
                document.getElementById('appointment_date').value = appointment.appointment_date;
                document.getElementById('appointment_time').value = appointment.appointment_time;
                document.getElementById('appointment_duration').value = appointment.duration;
                document.getElementById('appointment_amount').value = appointment.amount || '';
                document.getElementById('appointment_notes').value = appointment.notes || '';
                form.dataset.appointmentId = appointmentId;
                
                // Carregar pacientes e abrir modal
                loadPatientsForAppointment(appointment.patient_id);
            })
            .catch(error => {
                console.error('❌ Erro ao carregar consulta:', error);
                showToast('Erro ao carregar consulta', 'error');
            });
    } else {
        // Nova consulta
        title.textContent = 'Nova Consulta';
        form.reset();
        delete form.dataset.appointmentId;
        
        // Definir data como hoje se não estiver definida
        const dateInput = document.getElementById('appointment_date');
        if (!dateInput.value) {
            dateInput.value = formatDateForAPI(new Date());
        }
        
        // Carregar pacientes e abrir modal
        loadPatientsForAppointment();
    }
}

function loadPatientsForAppointment(selectedPatientId = null) {
    fetch('api/patients.php')
        .then(response => response.json())
        .then(patients => {
            const select = document.getElementById('appointment_patient_select');
            if (!select) {
                console.error('❌ Select de pacientes não encontrado');
                return;
            }
            
            select.innerHTML = '<option value="">Selecione um paciente</option>';
            
            patients.forEach(patient => {
                // Mostrar apenas pacientes ativos ou sem status definido
                if (patient.status === 'active' || !patient.status) {
                    const option = document.createElement('option');
                    option.value = patient.id;
                    option.textContent = patient.name;
                    select.appendChild(option);
                }
            });
            
            // Selecionar paciente se fornecido
            if (selectedPatientId) {
                select.value = selectedPatientId;
            }
            
            // Abrir modal
            openModal('appointment-modal');
        })
        .catch(error => {
            console.error('❌ Erro ao carregar pacientes:', error);
            showToast('Erro ao carregar pacientes', 'error');
        });
}

function openAppointmentModalForDate() {
    console.log('📅 Abrindo modal para data selecionada:', selectedDate);
    
    const form = document.getElementById('appointment-form');
    const title = document.getElementById('appointment-modal-title');
    
    if (!form || !title) {
        console.error('❌ Elementos do modal não encontrados');
        showToast('Erro ao abrir modal de agendamento', 'error');
        return;
    }
    
    // Resetar formulário
    title.textContent = 'Nova Consulta';
    form.reset();
    delete form.dataset.appointmentId;
    
    // Definir data selecionada
    const dateInput = document.getElementById('appointment_date');
    if (dateInput) {
        dateInput.value = formatDateForAPI(selectedDate);
        console.log('✅ Data definida:', dateInput.value);
    }
    
    // Carregar pacientes e abrir modal
    loadPatientsForAppointment();
}
function saveAppointment() {
    console.log('💾 Salvando consulta...');
    
    const form = document.getElementById('appointment-form');
    if (!form) {
        console.error('❌ Formulário não encontrado');
        return;
    }
    
    const appointmentId = form.dataset.appointmentId;
    const patientId = document.getElementById('appointment_patient_select').value;
    const appointmentDate = document.getElementById('appointment_date').value;
    const appointmentTime = document.getElementById('appointment_time').value;
    
    console.log('📝 Dados:', {
        appointmentId,
        patientId,
        appointmentDate,
        appointmentTime
    });
    
    // Validação
    if (!patientId) {
        showToast('Selecione um paciente', 'error');
        return;
    }
    
    if (!appointmentDate) {
        showToast('Informe a data da consulta', 'error');
        return;
    }
    
    if (!appointmentTime) {
        showToast('Informe o horário da consulta', 'error');
        return;
    }
    
    const duration = parseInt(document.getElementById('appointment_duration').value) || 50;
    const amountInput = document.getElementById('appointment_amount').value;
    const amount = amountInput ? parseFloat(amountInput) : 100;
    const notes = document.getElementById('appointment_notes').value || '';
    
    const data = {
        patient_id: patientId,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        duration: duration,
        amount: amount,
        notes: notes
    };
    
    console.log('📤 Enviando:', data);
    
    const url = appointmentId ? `api/appointments.php?id=${appointmentId}` : 'api/appointments.php';
    const method = appointmentId ? 'PUT' : 'POST';
    
    console.log(`🔄 ${method} para ${url}`);
    
    // Desabilitar botão para evitar cliques duplos
    const saveBtn = document.getElementById('save-appointment-btn');
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
    }
    
    fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => {
        console.log('📡 Status da resposta:', response.status);
        return response.json();
    })
    .then(result => {
        console.log('📊 Resultado:', result);
        
        if (result.success) {
            closeModal('appointment-modal');
            
            // Recarregar calendário
            loadCalendar();
            
            const message = appointmentId ? 'Consulta atualizada com sucesso!' : 'Consulta agendada com sucesso!';
            showToast(message, 'success');
        } else {
            showToast(result.message || 'Erro ao salvar consulta', 'error');
        }
    })
    .catch(error => {
        console.error('❌ Erro:', error);
        showToast('Erro ao salvar consulta', 'error');
    })
    .finally(() => {
        // Reabilitar botão
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.innerHTML = '<i class="fas fa-calendar-plus"></i> Agendar';
        }
    });
}

// =========================================
// CORREÇÕES PARA CALENDÁRIO - ADICIONAR NO FINAL
// Data: 2025-10-29
// =========================================

// Função auxiliar - Fechar menus
function closeAllMenus() {
    document.querySelectorAll('.appointment-dropdown').forEach(menu => {
        menu.classList.remove('active');
    });
}

// Função Editar - NOVA
function editAppointment(appointmentId) {
    console.log('✏️ Editar consulta ID:', appointmentId);
    closeAllMenus();
    openAppointmentModal(appointmentId);
}

// Função Cancelar - NOVA
function cancelAppointment(appointmentId) {
    console.log('🚫 Cancelar consulta:', appointmentId);
    
    if (confirm('Tem certeza que deseja cancelar esta consulta?')) {
        fetch(`api/appointments.php?id=${appointmentId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'cancelled' })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showToast('Consulta cancelada!', 'success');
                setTimeout(() => loadCalendar(), 300);
            } else {
                showToast(data.message || 'Erro ao cancelar', 'error');
            }
        })
        .catch(error => {
            console.error('❌ Erro:', error);
            showToast('Erro ao cancelar consulta', 'error');
        });
    }
}

// Função Reativar - NOVA
function reactivateAppointment(appointmentId) {
    console.log('🔄 Reativar consulta:', appointmentId);
    
    if (confirm('Deseja reativar esta consulta?')) {
        fetch(`api/appointments.php?id=${appointmentId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'scheduled' })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                showToast('Consulta reativada!', 'success');
                setTimeout(() => loadCalendar(), 300);
            } else {
                showToast(data.message || 'Erro ao reativar', 'error');
            }
        })
        .catch(error => {
            console.error('❌ Erro:', error);
            showToast('Erro ao reativar consulta', 'error');
        });
    }
}

console.log('✅ Correções do calendário carregadas!');
sconsole.log('✅ App.js carregado com sucesso!');