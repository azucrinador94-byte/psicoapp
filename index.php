<?php
session_start();

// Sistema de login básico - redirecionar para login se não estiver logado
if (!isset($_SESSION['user_id'])) {
    header('Location: login.php');
    exit;
}

require_once 'config/database.php';
require_once 'classes/Patient.php';
require_once 'classes/Appointment.php';

$database = new Database();
$db = $database->connect();

$patient = new Patient($db);
$appointment = new Appointment($db);

// Buscar estatísticas
$patient_count = $patient->count($_SESSION['user_id']);
$stats = $appointment->getStats($_SESSION['user_id']);
$upcoming_appointments = $appointment->getUpcoming($_SESSION['user_id'], 5);
$recent_patients = $patient->read($_SESSION['user_id']);
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>PsicoApp - Gestão para Psicólogos Autônomos</title>
    <meta name="description" content="Sistema completo de gestão para psicólogos autônomos. Gerencie pacientes, agenda e consultas de forma simples e intuitiva.">
    <!-- Estilos -->
<link rel="stylesheet" href="assets/css/style.css">
<link rel="stylesheet" href="assets/css/calendar.css">
    <!-- CSS -->
    <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet">
    <link href="assets/css/style.css" rel="stylesheet">
</head>
<body>
    <div class="app-container">
        <!-- Sidebar -->
        <aside class="sidebar">
            <div class="sidebar-header">
                <div class="logo">
                    <div class="logo-icon">
                        <i class="fas fa-brain"></i>
                    </div>
                    <div class="logo-text">
                        <h1>PsicoApp</h1>
                        <p>Gestão Psicológica</p>
                    </div>
                </div>
            </div>
            
            <nav class="sidebar-nav">
                <ul>
                    <li><a href="#dashboard" class="nav-link active" data-tab="dashboard">
                        <i class="fas fa-home"></i>
                        <span>Dashboard</span>
                    </a></li>
                    <li><a href="#patients" class="nav-link" data-tab="patients">
                        <i class="fas fa-users"></i>
                        <span>Pacientes</span>
                    </a></li>
                    <li><a href="#calendar" class="nav-link" data-tab="calendar">
                        <i class="fas fa-calendar"></i>
                        <span>Agenda</span>
                    </a></li>
                    <li><a href="#reports" class="nav-link" data-tab="reports">
                        <i class="fas fa-chart-line"></i>
                        <span>Relatórios</span>
                    </a></li>
                    <li><a href="#settings" class="nav-link" data-tab="settings">
                        <i class="fas fa-cog"></i>
                        <span>Configurações</span>
                    </a></li>
                </ul>
            </nav>
            
            <div class="sidebar-footer">
                <div class="user-info">
                    <div class="user-avatar">
                        <?php 
                        $name_parts = explode(' ', $_SESSION['user_name']);
                        $initials = '';
                        foreach($name_parts as $part) {
                            $initials .= substr($part, 0, 1);
                        }
                        echo substr($initials, 0, 2);
                        ?>
                    </div>
                    <div class="user-details">
                        <p class="user-name"><?php echo htmlspecialchars($_SESSION['user_name']); ?></p>
                        <p class="user-crp"><?php echo htmlspecialchars($_SESSION['user_crp'] ?? 'Sem CRP'); ?></p>
                    </div>
                </div>
                <a href="logout.php" class="btn btn-outline btn-sm" style="margin-top: 1rem; width: 100%;">
                    <i class="fas fa-sign-out-alt"></i> Sair
                </a>
            </div>
        </aside>
        
        <!-- Main Content -->
        <main class="main-content">
            <!-- Dashboard Tab -->
            <div id="dashboard-tab" class="tab-content active">
                <div class="page-header">
                    <h1>Dashboard</h1>
                    <p>Bem-vindo ao seu painel de controle</p>
                </div>
                
                <!-- Stats Cards -->
                <div class="stats-grid">
                    <div class="stat-card primary">
                        <div class="stat-content">
                            <div class="stat-text">
                                <p class="stat-label">Total de Pacientes</p>
                                <h3 class="stat-value"><?php echo $patient_count; ?></h3>
                                <p class="stat-change">+12% vs mês passado</p>
                            </div>
                            <div class="stat-icon">
                                <i class="fas fa-users"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="stat-card secondary">
                        <div class="stat-content">
                            <div class="stat-text">
                                <p class="stat-label">Consultas Hoje</p>
                                <h3 class="stat-value"><?php echo $stats['today_appointments']; ?></h3>
                                <p class="stat-change">+5% vs ontem</p>
                            </div>
                            <div class="stat-icon">
                                <i class="fas fa-calendar-day"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="stat-card primary">
                        <div class="stat-content">
                            <div class="stat-text">
                                <p class="stat-label">Consultas da Semana</p>
                                <h3 class="stat-value"><?php echo $stats['weekly_appointments']; ?></h3>
                                <p class="stat-change">+8% vs semana passada</p>
                            </div>
                            <div class="stat-icon">
                                <i class="fas fa-chart-line"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="stat-card secondary">
                        <div class="stat-content">
                            <div class="stat-text">
                                <p class="stat-label">Receita Mensal</p>
                                <h3 class="stat-value">R$ <?php echo number_format($stats['monthly_revenue'], 0, ',', '.'); ?></h3>
                                <p class="stat-change">+15% vs mês passado</p>
                            </div>
                            <div class="stat-icon">
                                <i class="fas fa-dollar-sign"></i>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Main Dashboard Grid -->
                <div class="dashboard-grid">
                    <!-- Upcoming Appointments -->
                    <div class="card large">
                        <div class="card-header">
                            <h2><i class="fas fa-clock"></i> Próximas Consultas</h2>
                            <button class="btn btn-outline btn-sm" onclick="switchTab('calendar')">Ver Agenda</button>
                        </div>
                        <div class="card-content">
                            <?php
                            $upcoming_result = $upcoming_appointments->fetchAll(PDO::FETCH_ASSOC);
                            if (count($upcoming_result) > 0):
                            ?>
                            <div class="appointments-list">
                                <?php foreach($upcoming_result as $apt): ?>
                                <div class="appointment-item">
                                    <div class="appointment-icon">
                                        <i class="fas fa-calendar"></i>
                                    </div>
                                    <div class="appointment-info">
                                        <h3><?php echo htmlspecialchars($apt['patient_name']); ?></h3>
                                        <p><?php echo date('d/m/Y', strtotime($apt['appointment_date'])); ?> às <?php echo date('H:i', strtotime($apt['appointment_time'])); ?></p>
                                    </div>
                                    <div class="appointment-meta">
                                        <p class="duration"><?php echo $apt['duration']; ?> min</p>
                                        <span class="status scheduled">Agendado</span>
                                    </div>
                                </div>
                                <?php endforeach; ?>
                            </div>
                            <?php else: ?>
                            <div class="empty-state">
                                <i class="fas fa-calendar"></i>
                                <h3>Nenhuma consulta agendada</h3>
                                <p>Que tal agendar uma consulta?</p>
                                <button class="btn btn-primary" onclick="switchTab('calendar')">
                                    <i class="fas fa-calendar-plus"></i> Agendar Consulta
                                </button>
                            </div>
                            <?php endif; ?>
                        </div>
                    </div>
                    
                    <!-- Recent Patients -->
                    <div class="card">
                        <div class="card-header">
                            <h2><i class="fas fa-users"></i> Pacientes Recentes</h2>
                            <button class="btn btn-outline btn-sm" onclick="switchTab('patients')">Ver Todos</button>
                        </div>
                        <div class="card-content">
                            <?php
                            $patients_result = $recent_patients->fetchAll(PDO::FETCH_ASSOC);
                            if (count($patients_result) > 0):
                            ?>
                            <div class="patients-list">
                                <?php foreach(array_slice($patients_result, 0, 5) as $pat): ?>
                                <div class="patient-item">
                                    <div class="patient-avatar">
                                        <?php 
                                        $initials = '';
                                        $name_parts = explode(' ', $pat['name']);
                                        foreach($name_parts as $part) {
                                            $initials .= substr($part, 0, 1);
                                        }
                                        echo substr($initials, 0, 2);
                                        ?>
                                    </div>
                                    <div class="patient-info">
                                        <h4><?php echo htmlspecialchars($pat['name']); ?></h4>
                                        <p><?php echo htmlspecialchars($pat['email']); ?></p>
                                    </div>
                                </div>
                                <?php endforeach; ?>
                            </div>
                            <?php else: ?>
                            <div class="empty-state">
                                <i class="fas fa-users"></i>
                                <h3>Nenhum paciente</h3>
                                <p>Adicione seu primeiro paciente</p>
                                <button class="btn btn-secondary" onclick="switchTab('patients')">
                                    <i class="fas fa-user-plus"></i> Adicionar Paciente
                                </button>
                            </div>
                            <?php endif; ?>
                        </div>
                    </div>
                </div>
                
                <!-- Quick Actions -->
                <div class="card">
                    <div class="card-header">
                        <h2><i class="fas fa-bolt"></i> Ações Rápidas</h2>
                    </div>
                    <div class="card-content">
                        <div class="actions-grid">
                            <button class="action-btn primary" onclick="openPatientModal()">
                                <i class="fas fa-user-plus"></i>
                                <div class="action-text">
                                    <h4>Adicionar Paciente</h4>
                                    <p>Cadastrar novo paciente</p>
                                </div>
                            </button>
                            
                            <button class="action-btn secondary" onclick="openAppointmentModal()">
                                <i class="fas fa-calendar-plus"></i>
                                <div class="action-text">
                                    <h4>Agendar Consulta</h4>
                                    <p>Marcar nova consulta</p>
                                </div>
                            </button>
                            
                            <button class="action-btn outline" onclick="switchTab('reports')">
                                <i class="fas fa-chart-bar"></i>
                                <div class="action-text">
                                    <h4>Ver Relatórios</h4>
                                    <p>Análises e métricas</p>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Patients Tab -->
            <div id="patients-tab" class="tab-content">
                <div class="page-header">
                    <div class="page-title">
                        <h1>Pacientes</h1>
                        <p>Gerencie seus pacientes</p>
                    </div>
                    <button class="btn btn-primary" onclick="openPatientModal()">
                        <i class="fas fa-plus"></i> Novo Paciente
                    </button>
                </div>
                
                <!-- Search -->
                <div class="card">
                    <div class="card-content">
                        <div class="search-box">
                            <i class="fas fa-search"></i>
                            <input type="text" id="patient-search" placeholder="Buscar pacientes por nome ou email..." onkeyup="searchPatients()">
                        </div>
                    </div>
                </div>
                
                <!-- Patients Grid -->
                <div id="patients-grid" class="patients-grid">
                    <!-- Content loaded by JavaScript -->
                </div>
            </div>
            
           <!-- Calendar Tab -->
<div id="calendar-tab" class="tab-content">
    <div class="page-header">
        <h1><i class="fas fa-calendar-alt"></i> Agenda</h1>
    </div>

    <div class="calendar-wrapper">
        <!-- Cabeçalho do Calendário -->
        <div class="calendar-header-bar">
            <div class="calendar-navigation">
                <button class="btn btn-outline" onclick="changeMonth(-1)" aria-label="Mês anterior">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <h2 id="current-month-year">Outubro 2025</h2>
                <button class="btn btn-outline" onclick="changeMonth(1)" aria-label="Próximo mês">
                    <i class="fas fa-chevron-right"></i>
                </button>
            </div>
            <div class="calendar-header-actions">
                <button class="btn btn-secondary" onclick="goToToday()">
                    <i class="fas fa-calendar-day"></i> Hoje
                </button>
                <button class="btn btn-primary" onclick="openAppointmentModalForDate()">
                    <i class="fas fa-plus"></i> Nova Consulta
                </button>
            </div>
        </div>

        <div class="calendar-layout">
            <!-- Grid do Calendário -->
            <div class="calendar-main">
                <div class="calendar-grid-container">
                    <!-- Dias da Semana -->
                    <div class="calendar-weekdays">
                        <div class="weekday-cell">DOM</div>
                        <div class="weekday-cell">SEG</div>
                        <div class="weekday-cell">TER</div>
                        <div class="weekday-cell">QUA</div>
                        <div class="weekday-cell">QUI</div>
                        <div class="weekday-cell">SEX</div>
                        <div class="weekday-cell">SÁB</div>
                    </div>

                    <!-- Dias do Mês -->
                    <div id="calendar-days" class="calendar-days-grid">
                        <!-- Preenchido via JavaScript -->
                    </div>
                </div>

                <!-- Legenda -->
                <div class="calendar-footer">
                    <div class="calendar-legend">
                        <div class="legend-item">
                            <span class="legend-dot" style="background: #6366f1;"></span>
                            <span>Agendadas</span>
                        </div>
                        <div class="legend-item">
                            <span class="legend-dot" style="background: #10b981;"></span>
                            <span>Concluídas</span>
                        </div>
                        <div class="legend-item">
                            <span class="legend-dot" style="background: #ef4444;"></span>
                            <span>Hoje</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Sidebar com Consultas do Dia -->
            <div class="calendar-sidebar-panel">
                <div class="sidebar-header-panel">
                    <h3 id="selected-day-title">Selecione um dia</h3>
                    <span id="selected-day-count" class="count-badge">0</span>
                </div>
                
                <div id="daily-appointments-list" class="appointments-list-container">
                    <div class="empty-state-calendar">
                        <i class="fas fa-calendar-check"></i>
                        <p>Clique em um dia para ver as consultas</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
            
            <!-- Reports Tab -->
            <div id="reports-tab" class="tab-content">
                <div class="page-header">
                    <div class="page-title">
                        <h1>Relatórios</h1>
                        <p>Análises e métricas do seu consultório</p>
                    </div>
                    <button class="btn btn-primary" onclick="openReportsModal()">
                        <i class="fas fa-chart-bar"></i> Relatório Personalizado
                    </button>
                </div>
                
                <!-- Quick Reports -->
                <div class="reports-grid">
                    <div class="card">
                        <div class="card-header">
                            <h3><i class="fas fa-calendar-week"></i> Esta Semana</h3>
                        </div>
                        <div class="card-content">
                            <div class="report-stats">
                                <div class="stat-item">
                                    <span class="stat-value" id="week-patients">0</span>
                                    <span class="stat-label">Pacientes atendidos</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-value" id="week-appointments">0</span>
                                    <span class="stat-label">Consultas realizadas</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-value" id="week-revenue">R$ 0</span>
                                    <span class="stat-label">Receita estimada</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-header">
                            <h3><i class="fas fa-calendar-alt"></i> Este Mês</h3>
                        </div>
                        <div class="card-content">
                            <div class="report-stats">
                                <div class="stat-item">
                                    <span class="stat-value" id="month-patients">0</span>
                                    <span class="stat-label">Pacientes atendidos</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-value" id="month-appointments">0</span>
                                    <span class="stat-label">Consultas realizadas</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-value" id="month-revenue">R$ 0</span>
                                    <span class="stat-label">Receita estimada</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-header">
                            <h3><i class="fas fa-users"></i> Pacientes</h3>
                        </div>
                        <div class="card-content">
                            <div class="report-stats">
                                <div class="stat-item">
                                    <span class="stat-value" id="total-patients"><?php echo $patient_count; ?></span>
                                    <span class="stat-label">Total de pacientes</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-value" id="active-patients">0</span>
                                    <span class="stat-label">Pacientes ativos</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-value" id="new-patients">0</span>
                                    <span class="stat-label">Novos este mês</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- Chart Section -->
                <div class="card">
                    <div class="card-header">
                        <h3><i class="fas fa-chart-line"></i> Tendências</h3>
                        <div class="chart-controls">
                            <button class="btn btn-sm" onclick="loadChart('week')">Semana</button>
                            <button class="btn btn-sm active" onclick="loadChart('month')">Mês</button>
                            <button class="btn btn-sm" onclick="loadChart('year')">Ano</button>
                        </div>
                    </div>
                    <div class="card-content">
                        <div id="reports-chart" class="chart-container">
                            <canvas id="trendsChart" width="400" height="200"></canvas>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Settings Tab -->
            <div id="settings-tab" class="tab-content">
                <div class="page-header">
                    <div class="page-title">
                        <h1>Configurações</h1>
                        <p>Gerencie as configurações do seu consultório</p>
                    </div>
                    <button class="btn btn-primary" onclick="openSettingsModal()">
                        <i class="fas fa-cog"></i> Configurações Avançadas
                    </button>
                </div>
                
                <!-- Quick Settings -->
                <div class="settings-grid">
                    <div class="card">
                        <div class="card-header">
                            <h3><i class="fas fa-user"></i> Perfil</h3>
                        </div>
                        <div class="card-content">
                            <div class="profile-summary">
                                <div class="profile-avatar large">
                                    <?php 
                                    $name_parts = explode(' ', $_SESSION['user_name']);
                                    $initials = '';
                                    foreach($name_parts as $part) {
                                        $initials .= substr($part, 0, 1);
                                    }
                                    echo substr($initials, 0, 2);
                                    ?>
                                </div>
                                <div class="profile-info">
                                    <h4><?php echo htmlspecialchars($_SESSION['user_name']); ?></h4>
                                    <p><?php echo htmlspecialchars($_SESSION['user_email']); ?></p>
                                    <p><?php echo htmlspecialchars($_SESSION['user_crp'] ?? 'CRP não informado'); ?></p>
                                </div>
                            </div>
                            <button class="btn btn-outline btn-sm" onclick="switchSettingsTab('profile'); openSettingsModal();">
                                <i class="fas fa-edit"></i> Editar Perfil
                            </button>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-header">
                            <h3><i class="fas fa-clock"></i> Horários</h3>
                        </div>
                        <div class="card-content">
                            <div class="settings-info">
                                <div class="setting-item">
                                    <span class="setting-label">Horário de trabalho</span>
                                    <span class="setting-value">08:00 - 18:00</span>
                                </div>
                                <div class="setting-item">
                                    <span class="setting-label">Duração padrão</span>
                                    <span class="setting-value">50 minutos</span>
                                </div>
                                <div class="setting-item">
                                    <span class="setting-label">Intervalo entre consultas</span>
                                    <span class="setting-value">10 minutos</span>
                                </div>
                            </div>
                            <button class="btn btn-outline btn-sm" onclick="switchSettingsTab('preferences'); openSettingsModal();">
                                <i class="fas fa-edit"></i> Configurar
                            </button>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-header">
                            <h3><i class="fas fa-bell"></i> Notificações</h3>
                        </div>
                        <div class="card-content">
                            <div class="settings-info">
                                <div class="setting-item">
                                    <span class="setting-label">Email</span>
                                    <span class="setting-value enabled">Ativadas</span>
                                </div>
                                <div class="setting-item">
                                    <span class="setting-label">Lembretes</span>
                                    <span class="setting-value enabled">Ativados</span>
                                </div>
                                <div class="setting-item">
                                    <span class="setting-label">Relatórios</span>
                                    <span class="setting-value disabled">Desativados</span>
                                </div>
                            </div>
                            <button class="btn btn-outline btn-sm" onclick="switchSettingsTab('preferences'); openSettingsModal();">
                                <i class="fas fa-edit"></i> Gerenciar
                            </button>
                        </div>
                    </div>
                    
                    <div class="card">
                        <div class="card-header">
                            <h3><i class="fas fa-shield-alt"></i> Segurança</h3>
                        </div>
                        <div class="card-content">
                            <div class="settings-info">
                                <div class="setting-item">
                                    <span class="setting-label">Última alteração de senha</span>
                                    <span class="setting-value">Há 30 dias</span>
                                </div>
                                <div class="setting-item">
                                    <span class="setting-label">Autenticação</span>
                                    <span class="setting-value">Senha</span>
                                </div>
                            </div>
                            <button class="btn btn-outline btn-sm" onclick="switchSettingsTab('security'); openSettingsModal();">
                                <i class="fas fa-key"></i> Alterar Senha
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- System Info -->
                <div class="card">
                    <div class="card-header">
                        <h3><i class="fas fa-info-circle"></i> Informações do Sistema</h3>
                    </div>
                    <div class="card-content">
                        <div class="system-info">
                            <div class="info-item">
                                <span class="info-label">Versão do PsicoApp</span>
                                <span class="info-value">1.0.0</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Última atualização</span>
                                <span class="info-value"><?php echo date('d/m/Y'); ?></span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Banco de dados</span>
                                <span class="info-value">MySQL</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Servidor</span>
                                <span class="info-value">PHP <?php echo PHP_VERSION; ?></span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
    
    <!-- Modals -->
    <?php include 'includes/modals.php'; ?>
    
    <!-- Scripts -->
    <script src="assets/js/app.js"></script>
    
    <!-- ✅ EVENT DELEGATION PARA DATA-ACTION -->
    <script>
    // Event Delegation para data-action
    document.addEventListener('click', function(e) {
        const target = e.target.closest('[data-action]');
        if (!target) return;
        
        e.preventDefault();
        const action = target.dataset.action;
        
        switch(action) {
            case 'save-patient':
                savePatient();
                break;
            case 'view-anamnesis':
                viewPatientAnamnesis();
                break;
            case 'view-history':
                viewPatientHistory();
                break;
            case 'save-anamnesis':
                saveAnamnesis();
                break;
            case 'open-session-modal':
                openSessionModal();
                break;
            case 'save-session':
                saveSession();
                break;
            case 'save-appointment':
                saveAppointment();
                break;
            case 'generate-report':
                generateReport();
                break;
            case 'export-report':
                exportReport();
                break;
            case 'save-settings':
                saveSettings();
                break;
            case 'save-pricing':
                savePricing();
                break;
        }
    });

    // Event Delegation para data-modal-close
    document.addEventListener('click', function(e) {
        const target = e.target.closest('[data-modal-close]');
        if (!target) return;
        
        e.preventDefault();
        const modalId = target.dataset.modalClose;
        closeModal(modalId);
    });

    // Event Delegation para data-tab (settings)
    document.addEventListener('click', function(e) {
        const target = e.target.closest('[data-tab]');
        if (!target || !target.hasAttribute('data-tab')) return;
        
        // Só processar se for dentro do modal de settings
        if (target.closest('.settings-tabs')) {
            e.preventDefault();
            const tabName = target.dataset.tab;
            switchSettingsTab(tabName);
        }
    });

    console.log('✅ Event delegation carregado!');
    </script>
</body>
</html>