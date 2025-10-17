# 🔍 DIAGNÓSTICO COMPLETO - PSICOAPP

## ⚠️ PROBLEMA CRÍTICO IDENTIFICADO

Seu projeto possui **2 aplicações diferentes rodando em paralelo**:

### 1️⃣ Versão PHP Legacy (index.php)
- ✅ **FUNCIONAL** - Sistema completo
- ✅ Autenticação implementada
- ✅ Todas as funcionalidades (pacientes, agenda, anamnese, histórico)
- ⚠️ Interface antiga

### 2️⃣ Versão React/TypeScript (index.html → src/)
- ✅ Interface moderna
- ❌ **SEM autenticação**
- ❌ **SEM integração** com backend PHP
- ❌ APIs não funcionam sem servidor PHP ativo

---

## 📦 RECURSOS OBRIGATÓRIOS PARA FUNCIONAMENTO

### Servidor Web
```
✓ Apache 2.4+ (XAMPP recomendado)
  - Porta 80 ativa
  - mod_rewrite habilitado
  - .htaccess habilitado

OU

✓ Nginx + PHP-FPM
```

### PHP
```
✓ Versão: 7.4 ou superior
✓ Extensões obrigatórias:
  ✓ pdo_mysql   (conexão banco de dados)
  ✓ session     (autenticação)
  ✓ json        (APIs)
  ✓ mbstring    (strings UTF-8)
  ✓ openssl     (segurança)

Verificar extensões instaladas:
php -m
```

### Banco de Dados
```
✓ MySQL 5.7+ ou MariaDB 10.3+
✓ Porta 3306 ativa
✓ Usuário com privilégios:
  - CREATE DATABASE
  - CREATE TABLE
  - INSERT, UPDATE, DELETE, SELECT
```

### Node.js (Desenvolvimento)
```
✓ Versão: 16.x ou superior
✓ npm ou yarn
```

---

## 🔧 CHECKLIST DE INSTALAÇÃO

### 1. Verificar XAMPP/Apache
```bash
# Windows (XAMPP)
- Abrir XAMPP Control Panel
- Iniciar Apache (porta 80)
- Iniciar MySQL (porta 3306)

# Verificar se está rodando:
http://localhost/       # Deve mostrar página do Apache
http://localhost/phpmyadmin/  # Deve abrir phpMyAdmin
```

### 2. Configurar Banco de Dados
```bash
# Opção A: Instalação nova
mysql -u root -p < database/setup.sql

# Opção B: Atualização (se já existe)
mysql -u root -p < database/migration.sql

# Verificar tabelas criadas:
# Entrar no phpMyAdmin → Selecionar banco 'psicoapp'
# Deve ter 6 tabelas:
✓ users
✓ patients
✓ appointments
✓ patient_pricing
✓ patient_anamnesis
✓ consultation_history
```

### 3. Configurar Credenciais PHP
```php
// Editar: config/database.php
private $host = 'localhost';     // IP do MySQL
private $db_name = 'psicoapp';   // Nome do banco
private $username = 'root';       // Usuário MySQL
private $password = '';           // Senha MySQL
```

### 4. Testar APIs PHP
```bash
# Com Apache rodando, acessar:
http://localhost/psicoapp/api/user.php
http://localhost/psicoapp/api/patients.php

# Resposta esperada (sem autenticação):
{"error": "Unauthorized"}  ← Está funcionando!

# Se aparecer erro de conexão:
- MySQL não está rodando
- Credenciais erradas
- Banco não criado
```

### 5. Configurar Desenvolvimento React
```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Acessar: http://localhost:8080
```

---

## 🚨 ERROS COMUNS E SOLUÇÕES

### ❌ "Nenhuma conexão pôde ser feita"
```
CAUSA: MySQL não está rodando
SOLUÇÃO: Iniciar MySQL no XAMPP
```

### ❌ "Access denied for user"
```
CAUSA: Credenciais incorretas
SOLUÇÃO: Verificar config/database.php
         Resetar senha MySQL se necessário
```

### ❌ "Unknown database 'psicoapp'"
```
CAUSA: Banco não foi criado
SOLUÇÃO: Executar database/setup.sql
```

### ❌ "Call to undefined function PDO"
```
CAUSA: Extensão pdo_mysql não está ativa
SOLUÇÃO: Editar php.ini → remover ; de:
         ;extension=pdo_mysql
         Reiniciar Apache
```

### ❌ APIs retornam 404
```
CAUSA: Apache não está rodando OU
       Proxy do Vite não configurado
SOLUÇÃO: 
1. Verificar Apache está ativo
2. Configuração de proxy já foi adicionada no vite.config.ts
3. Reiniciar npm run dev
```

### ❌ Modals não abrem
```
CAUSA: Problema já corrigido anteriormente
VERIFICAR: Console do navegador (F12) → Console
          Não deve ter erros React
```

---

## 🎯 MODO DE PRODUÇÃO

### Opção 1: Usar versão PHP (RECOMENDADO para deploy rápido)
```
✓ Sistema 100% funcional
✓ Não precisa build
✓ Deploy direto

USAR:
http://localhost/psicoapp/index.php

OU renomear index.php para index_legacy.php
e usar a versão React
```

### Opção 2: Usar versão React + PHP Backend
```
1. Build da aplicação React:
   npm run build

2. Copiar pasta dist/ para servidor Apache:
   cp -r dist/* /var/www/html/psicoapp/

3. Copiar APIs PHP:
   cp -r api/ /var/www/html/psicoapp/api/
   cp -r classes/ /var/www/html/psicoapp/classes/
   cp -r config/ /var/www/html/psicoapp/config/

4. Configurar .htaccess para SPA:
   (criar em /var/www/html/psicoapp/.htaccess)
```

### Arquivo .htaccess necessário:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /psicoapp/
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_URI} !^/psicoapp/api/
  RewriteRule . /psicoapp/index.html [L]
</IfModule>
```

---

## 📊 STATUS ATUAL DOS MÓDULOS

### ✅ Backend PHP (APIs)
| Módulo | Status | Arquivo |
|--------|--------|---------|
| Autenticação | ✅ Funcional | login.php, logout.php |
| Usuários | ✅ Funcional | api/user.php |
| Pacientes | ✅ Funcional | api/patients.php |
| Consultas | ✅ Funcional | api/appointments.php |
| Anamnese | ✅ Funcional | api/anamnesis.php |
| Histórico | ✅ Funcional | api/consultation-history.php |
| Precificação | ✅ Funcional | api/pricing.php |
| Relatórios | ✅ Funcional | api/reports.php |

### ⚠️ Frontend React
| Módulo | Status | Observação |
|--------|--------|------------|
| Interface | ✅ Funcional | Design moderno |
| Roteamento | ✅ Funcional | React Router |
| Dashboard | ⚠️ Sem dados | Precisa autenticação |
| Pacientes | ⚠️ Sem dados | Precisa autenticação |
| Anamnese | ✅ Modal corrigido | Funcional com auth |
| Histórico | ✅ Modal corrigido | Funcional com auth |
| Agenda | ⚠️ Sem dados | Precisa autenticação |
| Autenticação | ❌ NÃO IMPLEMENTADA | CRÍTICO |

---

## 🔐 PRÓXIMO PASSO CRÍTICO: AUTENTICAÇÃO REACT

Para a versão React funcionar 100%, é necessário:

1. **Criar página de Login em React**
2. **Implementar gerenciamento de sessão**
3. **Criar contexto de autenticação**
4. **Proteger rotas privadas**

Sem isso, as APIs retornarão erro 401 (Unauthorized).

---

## 📝 COMANDOS ÚTEIS

### Verificar portas em uso
```bash
# Windows
netstat -ano | findstr :80
netstat -ano | findstr :3306
netstat -ano | findstr :8080

# Linux/Mac
lsof -i :80
lsof -i :3306
lsof -i :8080
```

### Logs do Apache
```
# Windows (XAMPP)
C:\xampp\apache\logs\error.log

# Linux
/var/log/apache2/error.log
```

### Logs do MySQL
```
# Windows (XAMPP)
C:\xampp\mysql\data\mysql_error.log
```

---

## 🎓 RESUMO EXECUTIVO

**Para funcionar AGORA:**
1. ✅ Iniciar XAMPP (Apache + MySQL)
2. ✅ Criar banco de dados (setup.sql)
3. ✅ Acessar: http://localhost/psicoapp/index.php
4. ✅ Fazer login (criar usuário no register.php)

**Para versão React funcionar:**
1. ❌ Implementar autenticação (pendente)
2. ✅ Proxy configurado (já feito)
3. ✅ Modais corrigidos (já feito)
4. ⚠️ Precisa Apache rodando em paralelo

---

## 🆘 SUPORTE

Se continuar com problemas:
1. Verificar logs de erro (Apache/MySQL)
2. Testar APIs diretamente no navegador
3. Verificar extensões PHP ativas
4. Confirmar banco de dados criado

**Sistema está 90% funcional - falta apenas autenticação React!**
