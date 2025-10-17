/**
 * Form Validator - Validação de formulários
 */
class FormValidator {
    constructor() {
        this.rules = {
            required: (value) => value.trim() !== '',
            email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
            phone: (value) => /^\(\d{2}\) \d{5}-\d{4}$/.test(value),
            minlength: (value, min) => value.length >= min,
            maxlength: (value, max) => value.length <= max,
            min: (value, min) => parseFloat(value) >= min,
            max: (value, max) => parseFloat(value) <= max,
            pattern: (value, pattern) => new RegExp(pattern).test(value)
        };
        
        this.messages = {
            required: 'Este campo é obrigatório',
            email: 'Email inválido',
            phone: 'Telefone inválido. Use: (11) 99999-9999',
            minlength: 'Mínimo de {min} caracteres',
            maxlength: 'Máximo de {max} caracteres',
            min: 'Valor mínimo: {min}',
            max: 'Valor máximo: {max}',
            pattern: 'Formato inválido'
        };
        
        this.initMasks();
    }
    
    validate(form) {
        if (typeof form === 'string') {
            form = document.getElementById(form);
        }
        
        if (!form) return false;
        
        this.clearErrors(form);
        let isValid = true;
        
        // Validar campos obrigatórios
        form.querySelectorAll('[required]').forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        // Validar campos com padrões
        form.querySelectorAll('[pattern]').forEach(field => {
            if (field.value && !this.validateField(field)) {
                isValid = false;
            }
        });
        
        // Validações customizadas
        if (!this.customValidations(form)) {
            isValid = false;
        }
        
        return isValid;
    }
    
    validateField(field) {
        const value = field.value;
        const fieldName = field.name;
        
        // Required
        if (field.hasAttribute('required') && !this.rules.required(value)) {
            this.showError(field, this.messages.required);
            return false;
        }
        
        // Se vazio e não obrigatório, pular outras validações
        if (!value) return true;
        
        // Email
        if (field.type === 'email' && !this.rules.email(value)) {
            this.showError(field, this.messages.email);
            return false;
        }
        
        // Phone
        if (field.type === 'tel' && field.hasAttribute('pattern')) {
            if (!this.rules.phone(value)) {
                this.showError(field, this.messages.phone);
                return false;
            }
        }
        
        // Pattern
        if (field.hasAttribute('pattern')) {
            const pattern = field.getAttribute('pattern');
            if (!this.rules.pattern(value, pattern)) {
                this.showError(field, field.getAttribute('title') || this.messages.pattern);
                return false;
            }
        }
        
        // MinLength
        if (field.hasAttribute('minlength')) {
            const min = parseInt(field.getAttribute('minlength'));
            if (!this.rules.minlength(value, min)) {
                this.showError(field, this.messages.minlength.replace('{min}', min));
                return false;
            }
        }
        
        // MaxLength
        if (field.hasAttribute('maxlength')) {
            const max = parseInt(field.getAttribute('maxlength'));
            if (!this.rules.maxlength(value, max)) {
                this.showError(field, this.messages.maxlength.replace('{max}', max));
                return false;
            }
        }
        
        // Min (números)
        if (field.type === 'number' && field.hasAttribute('min')) {
            const min = parseFloat(field.getAttribute('min'));
            if (value && !this.rules.min(value, min)) {
                this.showError(field, this.messages.min.replace('{min}', min));
                return false;
            }
        }
        
        // Max (números)
        if (field.type === 'number' && field.hasAttribute('max')) {
            const max = parseFloat(field.getAttribute('max'));
            if (value && !this.rules.max(value, max)) {
                this.showError(field, this.messages.max.replace('{max}', max));
                return false;
            }
        }
        
        // Data de nascimento
        if (field.id === 'patient_birth_date' && value) {
            const birthDate = new Date(value);
            const today = new Date();
            const minDate = new Date('1920-01-01');
            
            if (birthDate > today) {
                this.showError(field, 'Data não pode ser futura');
                return false;
            }
            if (birthDate < minDate) {
                this.showError(field, 'Data inválida');
                return false;
            }
        }
        
        return true;
    }
    
    customValidations(form) {
        let isValid = true;
        
        // Validar confirmação de senha
        const newPassword = form.querySelector('#new_password');
        const confirmPassword = form.querySelector('#confirm_new_password');
        
        if (newPassword && confirmPassword && newPassword.value) {
            if (newPassword.value !== confirmPassword.value) {
                this.showError(confirmPassword, 'As senhas não conferem');
                isValid = false;
            }
            
            if (newPassword.value.length < 8) {
                this.showError(newPassword, 'A senha deve ter no mínimo 8 caracteres');
                isValid = false;
            }
        }
        
        return isValid;
    }
    
    showError(field, message) {
        field.classList.add('error');
        
        const errorElement = document.getElementById(`${field.id}_error`);
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.setAttribute('role', 'alert');
        }
    }
    
    clearErrors(form) {
        form.querySelectorAll('.error-message').forEach(el => {
            el.textContent = '';
            el.removeAttribute('role');
        });
        
        form.querySelectorAll('.error').forEach(el => {
            el.classList.remove('error');
        });
    }
    
    initMasks() {
        // Máscara de telefone
        document.addEventListener('input', (e) => {
            if (e.target.matches('#patient_phone, #profile_phone')) {
                this.phoneMask(e.target);
            }
        });
        
        // Contador de caracteres
        document.addEventListener('input', (e) => {
            if (e.target.matches('textarea[maxlength]')) {
                this.updateCharCount(e.target);
            }
        });
    }
    
    phoneMask(input) {
        let value = input.value.replace(/\D/g, '');
        
        if (value.length > 11) value = value.slice(0, 11);
        
        if (value.length > 6) {
            value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
        } else if (value.length > 2) {
            value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
        } else if (value.length > 0) {
            value = `(${value}`;
        }
        
        input.value = value;
    }
    
    updateCharCount(textarea) {
        const maxLength = parseInt(textarea.getAttribute('maxlength'));
        const currentLength = textarea.value.length;
        const countId = `${textarea.id}_count`;
        const countElement = document.getElementById(countId);
        
        if (countElement) {
            countElement.textContent = currentLength;
            
            if (currentLength >= maxLength * 0.9) {
                countElement.style.color = '#ef4444';
            } else {
                countElement.style.color = '';
            }
        }
    }
}

// Instanciar globalmente
const formValidator = new FormValidator();