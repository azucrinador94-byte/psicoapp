/**
 * Modal Manager - Gerencia abertura, fechamento e comportamentos dos modais
 */
class ModalManager {
    constructor() {
        this.activeModal = null;
        this.previouslyFocusedElement = null;
        this.init();
    }
    
    init() {
        // Event delegation para fechar modais
        document.addEventListener('click', (e) => {
            if (e.target.matches('[data-modal-close]')) {
                const modalId = e.target.dataset.modalClose;
                this.close(modalId);
            }
        });
        
        // Fechar ao clicar no backdrop
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal') && e.target.classList.contains('active')) {
                if (this.confirmClose(e.target.id)) {
                    this.close(e.target.id);
                }
            }
        });
        
        // Fechar com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.activeModal) {
                if (this.confirmClose(this.activeModal)) {
                    this.close(this.activeModal);
                }
            }
        });
    }
    
    open(modalId, data = {}) {
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.error(`Modal ${modalId} não encontrado`);
            return;
        }
        
        // Salvar elemento com foco atual
        this.previouslyFocusedElement = document.activeElement;
        
        // Aplicar dados no formulário se fornecidos
        if (Object.keys(data).length > 0) {
            this.populateForm(modalId, data);
        }
        
        // Abrir modal
        modal.classList.add('active');
        modal.setAttribute('aria-hidden', 'false');
        this.activeModal = modalId;
        
        // Prevenir scroll do body
        document.body.style.overflow = 'hidden';
        
        // Focar no primeiro elemento
        setTimeout(() => {
            const firstInput = modal.querySelector('input:not([type="hidden"]), textarea, select');
            if (firstInput) firstInput.focus();
        }, 100);
        
        // Trap focus
        this.trapFocus(modal);
    }
    
    close(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        // Fechar modal
        modal.classList.remove('active');
        modal.setAttribute('aria-hidden', 'true');
        this.activeModal = null;
        
        // Restaurar scroll do body
        document.body.style.overflow = '';
        
        // Limpar formulário e erros
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
            this.clearErrors(form);
            this.clearLoadingStates(modal);
        }
        
        // Restaurar foco
        if (this.previouslyFocusedElement) {
            this.previouslyFocusedElement.focus();
            this.previouslyFocusedElement = null;
        }
    }
    
    trapFocus(modal) {
        const focusableElements = modal.querySelectorAll(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];
        
        const handleTabKey = (e) => {
            if (e.key !== 'Tab') return;
            
            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    e.preventDefault();
                }
            }
        };
        
        modal.addEventListener('keydown', handleTabKey);
    }
    
    populateForm(modalId, data) {
        const modal = document.getElementById(modalId);
        const form = modal.querySelector('form');
        if (!form) return;
        
        Object.keys(data).forEach(key => {
            const field = form.querySelector(`[name="${key}"]`);
            if (field) {
                field.value = data[key] || '';
            }
        });
        
        // Atualizar título do modal se for edição
        if (data.id) {
            const title = modal.querySelector('.modal-title');
            if (title && title.textContent.includes('Novo')) {
                title.textContent = title.textContent.replace('Novo', 'Editar');
            }
        }
    }
    
    confirmClose(modalId) {
        const modal = document.getElementById(modalId);
        const form = modal?.querySelector('form');
        
        if (!form) return true;
        
        // Verificar se há dados não salvos
        const formData = new FormData(form);
        let hasData = false;
        
        for (let [key, value] of formData.entries()) {
            if (value && value.toString().trim() && !key.includes('hidden')) {
                hasData = true;
                break;
            }
        }
        
        if (hasData) {
            return confirm('Há alterações não salvas. Deseja realmente fechar?');
        }
        
        return true;
    }
    
    clearErrors(form) {
        form.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
        });
        form.querySelectorAll('.form-input, .form-textarea, .form-select').forEach(el => {
            el.classList.remove('error');
        });
    }
    
    clearLoadingStates(modal) {
        modal.querySelectorAll('.btn-loading').forEach(el => {
            el.style.display = 'none';
        });
        modal.querySelectorAll('.btn-content').forEach(el => {
            el.style.display = 'inline-flex';
        });
        modal.querySelectorAll('button').forEach(btn => {
            btn.disabled = false;
        });
    }
    
    setLoading(buttonId, isLoading) {
        const button = document.getElementById(buttonId);
        if (!button) return;
        
        const content = button.querySelector('.btn-content');
        const loading = button.querySelector('.btn-loading');
        
        if (isLoading) {
            button.disabled = true;
            if (content) content.style.display = 'none';
            if (loading) loading.style.display = 'inline-flex';
        } else {
            button.disabled = false;
            if (content) content.style.display = 'inline-flex';
            if (loading) loading.style.display = 'none';
        }
    }
}

// Instanciar globalmente
const modalManager = new ModalManager();

// Expor funções globais para compatibilidade (temporário)
function openModal(modalId, data = {}) {
    modalManager.open(modalId, data);
}

function closeModal(modalId) {
    modalManager.close(modalId);
}