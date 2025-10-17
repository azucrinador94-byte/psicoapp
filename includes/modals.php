<!-- modals.php - VERSÃO CORRIGIDA SEM DUPLICAÇÕES -->

<!-- Patient Modal -->
<div id="patient-modal" class="modal" role="dialog" aria-labelledby="patient-modal-title" aria-hidden="true">
    <div class="modal-content">
        <div class="modal-header">
            <h2 id="patient-modal-title" class="modal-title">Novo Paciente</h2>
            <button class="modal-close" data-modal-close="patient-modal" aria-label="Fechar modal">
                <i class="fas fa-times"></i>
            </button>
        </div>
        
        <div class="modal-body">
            <form id="patient-form" novalidate>
                <div class="form-group">
                    <label for="patient_name" class="form-label">Nome Completo *</label>
                    <input type="text" id="patient_name" name="name" class="form-input" required 
                           minlength="3" maxlength="100" aria-describedby="patient_name_error">
                    <span id="patient_name_error" class="error-message" role="alert"></span>
                </div>
                
                <div class="form-group">
                    <label for="patient_email" class="form-label">Email *</label>
                    <input type="email" id="patient_email" name="email" class="form-input" required
                           aria-describedby="patient_email_error">
                    <span id="patient_email_error" class="error-message" role="alert"></span>
                </div>
                
                <div class="form-group">
                    <label for="patient_phone" class="form-label">Telefone *</label>
                    <input type="tel" id="patient_phone" name="phone" class="form-input" required 
                           pattern="\(\d{2}\) \d{5}-\d{4}" placeholder="(11) 99999-9999"
                           aria-describedby="patient_phone_error">
                    <span id="patient_phone_error" class="error-message" role="alert"></span>
                </div>
                
                <div class="form-group">
                    <label for="patient_birth_date" class="form-label">Data de Nascimento *</label>
                    <input type="date" id="patient_birth_date" name="birth_date" class="form-input" required
                           aria-describedby="patient_birth_date_error">
                    <span id="patient_birth_date_error" class="error-message" role="alert"></span>
                </div>
                
                <div class="form-group">
                    <label for="patient_session_price" class="form-label">Preço da Sessão (R$)</label>
                    <input type="number" id="patient_session_price" name="session_price" class="form-input" 
                           step="0.01" min="0" max="9999.99" value="100.00" placeholder="100.00"
                           aria-describedby="patient_session_price_error">
                    <span id="patient_session_price_error" class="error-message" role="alert"></span>
                </div>
                
                <div class="form-group">
                    <label for="patient_notes" class="form-label">Observações</label>
                    <textarea id="patient_notes" name="notes" class="form-textarea" maxlength="1000"
                              placeholder="Observações sobre o paciente..."></textarea>
                    <small class="form-help"><span id="patient_notes_count">0</span>/1000 caracteres</small>
                </div>
            </form>
        </div>
        
        <div class="modal-footer">
            <button type="button" class="btn btn-primary" data-action="save-patient" id="save-patient-btn">
                <span class="btn-content">
                    <i class="fas fa-save"></i> Salvar
                </span>
                <span class="btn-loading" style="display:none;">
                    <i class="fas fa-spinner fa-spin"></i> Salvando...
                </span>
            </button>
            <button type="button" class="btn btn-outline" data-action="view-anamnesis" disabled id="view-anamnesis-btn">
                <i class="fas fa-clipboard-list"></i> Anamnese
            </button>
            <button type="button" class="btn btn-outline" data-action="view-history" disabled id="view-history-btn">
                <i class="fas fa-history"></i> Histórico
            </button>
            <button type="button" class="btn btn-outline" data-modal-close="patient-modal">
                Cancelar
            </button>
        </div>
    </div>
</div>

<!-- Patient Anamnesis Modal -->
<div id="anamnesis-modal" class="modal" role="dialog" aria-labelledby="anamnesis-modal-title" aria-hidden="true">
    <div class="modal-content" style="max-width: 800px;">
        <div class="modal-header">
            <h2 id="anamnesis-modal-title" class="modal-title">Anamnese do Paciente</h2>
            <button class="modal-close" data-modal-close="anamnesis-modal" aria-label="Fechar modal">
                <i class="fas fa-times"></i>
            </button>
        </div>
        
        <div class="modal-body">
            <form id="anamnesis-form" novalidate>
                <input type="hidden" id="anamnesis_patient_id" name="patient_id">
                
                <div class="form-group">
                    <label for="anamnesis_complaint" class="form-label">Queixa Principal</label>
                    <textarea id="anamnesis_complaint" name="complaint" class="form-textarea" 
                              placeholder="Descreva a queixa principal do paciente..."></textarea>
                </div>
                
                <div class="form-group">
                    <label for="anamnesis_history_illness" class="form-label">História da Doença Atual</label>
                    <textarea id="anamnesis_history_illness" name="history_illness" class="form-textarea" 
                              placeholder="Descreva o histórico da doença atual..."></textarea>
                </div>
                
                <div class="form-group">
                    <label for="anamnesis_previous_treatments" class="form-label">Tratamentos Anteriores</label>
                    <textarea id="anamnesis_previous_treatments" name="previous_treatments" class="form-textarea" 
                              placeholder="Descreva tratamentos psicológicos ou psiquiátricos anteriores..."></textarea>
                </div>
                
                <div class="form-group">
                    <label for="anamnesis_medications" class="form-label">Medicações</label>
                    <textarea id="anamnesis_medications" name="medications" class="form-textarea" 
                              placeholder="Liste medicações atuais..."></textarea>
                </div>
                
                <div class="form-group">
                    <label for="anamnesis_family_history" class="form-label">História Familiar</label>
                    <textarea id="anamnesis_family_history" name="family_history" class="form-textarea" 
                              placeholder="Histórico familiar relevante..."></textarea>
                </div>
                
                <div class="form-group">
                    <label for="anamnesis_personal_history" class="form-label">História Pessoal</label>
                    <textarea id="anamnesis_personal_history" name="personal_history" class="form-textarea" 
                              placeholder="História pessoal e desenvolvimento..."></textarea>
                </div>
                
                <div class="form-group">
                    <label for="anamnesis_social_history" class="form-label">História Social</label>
                    <textarea id="anamnesis_social_history" name="social_history" class="form-textarea" 
                              placeholder="Relacionamentos, trabalho, social..."></textarea>
                </div>
                
                <div class="form-group">
                    <label for="anamnesis_observations" class="form-label">Observações Gerais</label>
                    <textarea id="anamnesis_observations" name="observations" class="form-textarea" 
                              placeholder="Outras observações relevantes..."></textarea>
                </div>
            </form>
        </div>
        
        <div class="modal-footer">
            <button type="button" class="btn btn-primary" data-action="save-anamnesis" id="save-anamnesis-btn">
                <span class="btn-content">
                    <i class="fas fa-save"></i> Salvar Anamnese
                </span>
                <span class="btn-loading" style="display:none;">
                    <i class="fas fa-spinner fa-spin"></i> Salvando...
                </span>
            </button>
            <button type="button" class="btn btn-outline" data-modal-close="anamnesis-modal">
                Cancelar
            </button>
        </div>
    </div>
</div>

<!-- Patient History Modal -->
<div id="history-modal" class="modal" role="dialog" aria-labelledby="history-modal-title" aria-hidden="true">
    <div class="modal-content" style="max-width: 900px;">
        <div class="modal-header">
            <h2 id="history-modal-title" class="modal-title">Histórico de Consultas</h2>
            <button class="modal-close" data-modal-close="history-modal" aria-label="Fechar modal">
                <i class="fas fa-times"></i>
            </button>
        </div>
        
        <div class="modal-body">
            <div class="history-stats" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-bottom: 2rem;">
                <div class="stat-card">
                    <h4>Total de Sessões</h4>
                    <span id="total-sessions">0</span>
                </div>
                <div class="stat-card">
                    <h4>Última Sessão</h4>
                    <span id="last-session">-</span>
                </div>
                <div class="stat-card">
                    <h4>Duração Média</h4>
                    <span id="avg-duration">50 min</span>
                </div>
            </div>
            
            <div class="form-group">
                <button type="button" class="btn btn-primary" data-action="open-session-modal">
                    <i class="fas fa-plus"></i> Nova Sessão
                </button>
            </div>
            
            <div id="sessions-list" class="sessions-list">
                <!-- Sessions will be loaded here -->
            </div>
        </div>
        
        <div class="modal-footer">
            <button type="button" class="btn btn-outline" data-modal-close="history-modal">
                Fechar
            </button>
        </div>
    </div>
</div>

<!-- Session Modal -->
<div id="session-modal" class="modal" role="dialog" aria-labelledby="session-modal-title" aria-hidden="true">
    <div class="modal-content" style="max-width: 700px;">
        <div class="modal-header">
            <h2 id="session-modal-title" class="modal-title">Nova Sessão</h2>
            <button class="modal-close" data-modal-close="session-modal" aria-label="Fechar modal">
                <i class="fas fa-times"></i>
            </button>
        </div>
        
        <div class="modal-body">
            <form id="session-form" novalidate>
                <input type="hidden" id="session_patient_id" name="patient_id">
                <input type="hidden" id="session_id" name="id">
                <input type="hidden" id="session_appointment_id" name="appointment_id">
                
                <div class="form-group">
                    <label for="session_date" class="form-label">Data da Sessão *</label>
                    <input type="date" id="session_date" name="session_date" class="form-input" required
                           aria-describedby="session_date_error">
                    <span id="session_date_error" class="error-message" role="alert"></span>
                </div>
                
                <div class="form-group">
                    <label for="session_duration" class="form-label">Duração (minutos)</label>
                    <input type="number" id="session_duration" name="session_duration" class="form-input" 
                           value="50" min="15" max="180">
                </div>
                
                <div class="form-group">
                    <label for="session_patient_mood" class="form-label">Humor do Paciente</label>
                    <select id="session_patient_mood" name="patient_mood" class="form-select">
                        <option value="excellent">Excelente</option>
                        <option value="good">Bom</option>
                        <option value="neutral" selected>Neutro</option>
                        <option value="poor">Ruim</option>
                        <option value="very_poor">Muito Ruim</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="session_notes" class="form-label">Notas da Sessão</label>
                    <textarea id="session_notes" name="session_notes" class="form-textarea" 
                              placeholder="Descreva o que foi trabalhado na sessão..."></textarea>
                </div>
                
                <div class="form-group">
                    <label for="session_observations" class="form-label">Observações</label>
                    <textarea id="session_observations" name="observations" class="form-textarea" 
                              placeholder="Observações sobre o comportamento, humor, etc..."></textarea>
                </div>
                
                <div class="form-group">
                    <label for="session_homework" class="form-label">Tarefa de Casa</label>
                    <textarea id="session_homework" name="homework" class="form-textarea" 
                              placeholder="Tarefas ou exercícios para a próxima sessão..."></textarea>
                </div>
                
                <div class="form-group">
                    <label for="session_next_goals" class="form-label">Objetivos Próxima Sessão</label>
                    <textarea id="session_next_goals" name="next_session_goals" class="form-textarea" 
                              placeholder="Objetivos para a próxima sessão..."></textarea>
                </div>
            </form>
        </div>
        
        <div class="modal-footer">
            <button type="button" class="btn btn-primary" data-action="save-session" id="save-session-btn">
                <span class="btn-content">
                    <i class="fas fa-save"></i> Salvar Sessão
                </span>
                <span class="btn-loading" style="display:none;">
                    <i class="fas fa-spinner fa-spin"></i> Salvando...
                </span>
            </button>
            <button type="button" class="btn btn-outline" data-modal-close="session-modal">
                Cancelar
            </button>
        </div>
    </div>
</div>

<!-- Appointment Modal -->
<div id="appointment-modal" class="modal" role="dialog" aria-labelledby="appointment-modal-title" aria-hidden="true">
    <div class="modal-content">
        <div class="modal-header">
            <h2 id="appointment-modal-title" class="modal-title">Nova Consulta</h2>
            <button class="modal-close" data-modal-close="appointment-modal" aria-label="Fechar modal">
                <i class="fas fa-times"></i>
            </button>
        </div>
        
        <div class="modal-body">
            <form id="appointment-form" novalidate>
                <div class="form-group">
                    <label for="appointment_patient_select" class="form-label">Paciente *</label>
                    <select id="appointment_patient_select" name="patient_id" class="form-select" required
                            aria-describedby="appointment_patient_select_error">
                        <option value="">Selecione um paciente</option>
                        <!-- Options loaded by JavaScript -->
                    </select>
                    <span id="appointment_patient_select_error" class="error-message" role="alert"></span>
                </div>
                
                <div class="form-group">
                    <label for="appointment_date" class="form-label">Data *</label>
                    <input type="date" id="appointment_date" name="appointment_date" class="form-input" required
                           aria-describedby="appointment_date_error">
                    <span id="appointment_date_error" class="error-message" role="alert"></span>
                </div>
                
                <div class="form-group">
                    <label for="appointment_time" class="form-label">Horário *</label>
                    <input type="time" id="appointment_time" name="appointment_time" class="form-input" required
                           aria-describedby="appointment_time_error">
                    <span id="appointment_time_error" class="error-message" role="alert"></span>
                </div>
                
                <div class="form-group">
                    <label for="appointment_duration" class="form-label">Duração (minutos)</label>
                    <select id="appointment_duration" name="duration" class="form-select">
                        <option value="30">30 minutos</option>
                        <option value="45">45 minutos</option>
                        <option value="50" selected>50 minutos</option>
                        <option value="60">60 minutos</option>
                        <option value="90">90 minutos</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="appointment_amount" class="form-label">Valor da Consulta (R$)</label>
                    <input type="number" id="appointment_amount" name="amount" class="form-input" 
                           step="0.01" min="0" max="9999.99" placeholder="100.00">
                    <small class="form-help">Deixe vazio para usar o preço padrão do paciente</small>
                </div>
                
                <div class="form-group">
                    <label for="appointment_notes" class="form-label">Observações</label>
                    <textarea id="appointment_notes" name="notes" class="form-textarea" 
                              placeholder="Observações sobre a consulta..."></textarea>
                </div>
            </form>
        </div>
        
        <div class="modal-footer">
            <button type="button" class="btn btn-primary" data-action="save-appointment" id="save-appointment-btn">
                <span class="btn-content">
                    <i class="fas fa-calendar-plus"></i> Agendar
                </span>
                <span class="btn-loading" style="display:none;">
                    <i class="fas fa-spinner fa-spin"></i> Agendando...
                </span>
            </button>
            <button type="button" class="btn btn-outline" data-modal-close="appointment-modal">
                Cancelar
            </button>
        </div>
    </div>
</div>

<!-- Reports Modal -->
<div id="reports-modal" class="modal" role="dialog" aria-labelledby="reports-modal-title" aria-hidden="true">
    <div class="modal-content" style="max-width: 900px;">
        <div class="modal-header">
            <h2 id="reports-modal-title" class="modal-title">Relatórios Detalhados</h2>
            <button class="modal-close" data-modal-close="reports-modal" aria-label="Fechar modal">
                <i class="fas fa-times"></i>
            </button>
        </div>
        
        <div class="modal-body">
            <div class="report-filters">
                <div class="form-group">
                    <label for="report_type" class="form-label">Tipo de Relatório</label>
                    <select id="report_type" name="report_type" class="form-select">
                        <option value="monthly">Relatório Mensal</option>
                        <option value="patients">Relatório de Pacientes</option>
                        <option value="appointments">Relatório de Consultas</option>
                        <option value="financial">Relatório Financeiro</option>
                    </select>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="report_start_date" class="form-label">Data Início</label>
                        <input type="date" id="report_start_date" class="form-input">
                    </div>
                    <div class="form-group">
                        <label for="report_end_date" class="form-label">Data Fim</label>
                        <input type="date" id="report_end_date" class="form-input">
                    </div>
                </div>
                
                <button type="button" class="btn btn-secondary" data-action="generate-report">
                    <i class="fas fa-chart-bar"></i> Gerar Relatório
                </button>
            </div>
            
            <div id="report-content" class="report-content">
                <!-- Content loaded by JavaScript -->
            </div>
        </div>
        
        <div class="modal-footer">
            <button type="button" class="btn btn-primary" data-action="export-report">
                <i class="fas fa-download"></i> Exportar PDF
            </button>
            <button type="button" class="btn btn-outline" data-modal-close="reports-modal">
                Fechar
            </button>
        </div>
    </div>
</div>

<!-- Settings Modal -->
<div id="settings-modal" class="modal" role="dialog" aria-labelledby="settings-modal-title" aria-hidden="true">
    <div class="modal-content">
        <div class="modal-header">
            <h2 id="settings-modal-title" class="modal-title">Configurações</h2>
            <button class="modal-close" data-modal-close="settings-modal" aria-label="Fechar modal">
                <i class="fas fa-times"></i>
            </button>
        </div>
        
        <div class="modal-body">
            <div class="settings-tabs" role="tablist">
                <button class="settings-tab" role="tab" aria-selected="true" aria-controls="profile-settings" 
                        data-tab="profile">
                    <i class="fas fa-user"></i> Perfil
                </button>
                <button class="settings-tab" role="tab" aria-selected="false" aria-controls="preferences-settings" 
                        data-tab="preferences">
                    <i class="fas fa-cog"></i> Preferências
                </button>
                <button class="settings-tab" role="tab" aria-selected="false" aria-controls="security-settings" 
                        data-tab="security">
                    <i class="fas fa-lock"></i> Segurança
                </button>
            </div>
            
            <!-- Profile Settings -->
            <div id="profile-settings" class="settings-content" role="tabpanel" aria-labelledby="profile-tab">
                <form id="profile-form" novalidate>
                    <div class="form-group">
                        <label for="profile_name" class="form-label">Nome Completo</label>
                        <input type="text" id="profile_name" name="name" class="form-input" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="profile_email" class="form-label">Email</label>
                        <input type="email" id="profile_email" name="email" class="form-input" required>
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="profile_crp" class="form-label">CRP</label>
                            <input type="text" id="profile_crp" name="crp" class="form-input" placeholder="Ex: CRP 12345">
                        </div>
                        
                        <div class="form-group">
                            <label for="profile_phone" class="form-label">Telefone</label>
                            <input type="tel" id="profile_phone" name="phone" class="form-input" placeholder="(11) 99999-9999">
                        </div>
                    </div>
                </form>
            </div>
            
            <!-- Preferences Settings -->
            <div id="preferences-settings" class="settings-content" role="tabpanel" style="display:none;">
                <form id="preferences-form">
                    <div class="form-group">
                        <label for="default_duration" class="form-label">Duração Padrão da Consulta</label>
                        <select id="default_duration" name="default_duration" class="form-select">
                            <option value="30">30 minutos</option>
                            <option value="45">45 minutos</option>
                            <option value="50" selected>50 minutos</option>
                            <option value="60">60 minutos</option>
                            <option value="90">90 minutos</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="working_hours_start" class="form-label">Horário de Trabalho - Início</label>
                        <input type="time" id="working_hours_start" name="working_hours_start" class="form-input" value="08:00">
                    </div>
                    
                    <div class="form-group">
                        <label for="working_hours_end" class="form-label">Horário de Trabalho - Fim</label>
                        <input type="time" id="working_hours_end" name="working_hours_end" class="form-input" value="18:00">
                    </div>
                    
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="email_notifications" name="email_notifications" checked>
                            <span class="checkmark"></span>
                            Receber notificações por email
                        </label>
                    </div>
                    
                    <div class="form-group">
                        <label class="checkbox-label">
                            <input type="checkbox" id="reminder_notifications" name="reminder_notifications" checked>
                            <span class="checkmark"></span>
                            Lembretes de consultas
                        </label>
                    </div>
                </form>
            </div>
            
            <!-- Security Settings -->
            <div id="security-settings" class="settings-content" role="tabpanel" style="display:none;">
                <form id="security-form" novalidate>
                    <div class="form-group">
                        <label for="current_password" class="form-label">Senha Atual</label>
                        <input type="password" id="current_password" name="current_password" class="form-input">
                    </div>
                    
                    <div class="form-group">
                        <label for="new_password" class="form-label">Nova Senha</label>
                        <input type="password" id="new_password" name="new_password" class="form-input">
                    </div>
                    
                    <div class="form-group">
                        <label for="confirm_new_password" class="form-label">Confirmar Nova Senha</label>
                        <input type="password" id="confirm_new_password" name="confirm_new_password" class="form-input">
                    </div>
                    
                    <div class="security-info">
                        <div class="security-tip">
                            <i class="fas fa-info-circle"></i>
                            <div>
                                <h4>Dicas de Segurança</h4>
                                <ul>
                                    <li>Use pelo menos 8 caracteres</li>
                                    <li>Inclua letras maiúsculas e minúsculas</li>
                                    <li>Adicione números e símbolos</li>
                                    <li>Evite informações pessoais</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
        
        <div class="modal-footer">
            <button type="button" class="btn btn-primary" data-action="save-settings">
                <i class="fas fa-save"></i> Salvar Alterações
            </button>
            <button type="button" class="btn btn-outline" data-modal-close="settings-modal">
                Cancelar
            </button>
        </div>
    </div>
</div>

<!-- Pricing Modal -->
<div id="pricing-modal" class="modal" role="dialog" aria-labelledby="pricing-modal-title" aria-hidden="true">
    <div class="modal-content">
        <div class="modal-header">
            <h2 id="pricing-modal-title" class="modal-title">Definir Preço do Paciente</h2>
            <button class="modal-close" data-modal-close="pricing-modal" aria-label="Fechar modal">
                <i class="fas fa-times"></i>
            </button>
        </div>
        
        <div class="modal-body">
            <form id="pricing-form" novalidate>
                <div class="form-group">
                    <label for="pricing_patient_select" class="form-label">Paciente *</label>
                    <select id="pricing_patient_select" name="patient_id" class="form-select" required>
                        <option value="">Selecione um paciente</option>
                        <!-- Options loaded by JavaScript -->
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="pricing_session_price" class="form-label">Preço da Sessão (R$) *</label>
                    <input type="number" id="pricing_session_price" name="session_price" class="form-input" 
                           step="0.01" min="0" max="9999.99" placeholder="100.00" required>
                </div>
                
                <div class="form-group">
                    <label for="pricing_notes" class="form-label">Observações</label>
                    <textarea id="pricing_notes" name="notes" class="form-textarea" 
                              placeholder="Observações sobre o preço..."></textarea>
                </div>
            </form>
        </div>
        
        <div class="modal-footer">
            <button type="button" class="btn btn-primary" data-action="save-pricing">
                <i class="fas fa-save"></i> Salvar
            </button>
            <button type="button" class="btn btn-outline" data-modal-close="pricing-modal">
                Cancelar
            </button>
        </div>
    </div>
</div>