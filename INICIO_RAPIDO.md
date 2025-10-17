# 🚀 INÍCIO RÁPIDO - PSICOAPP

## ⚡ Para funcionar AGORA (5 minutos)

### 1️⃣ Iniciar Servidor
```bash
# Abrir XAMPP Control Panel
# Clicar em "Start" nos módulos:
- Apache  ✅
- MySQL   ✅
```

### 2️⃣ Criar Banco de Dados
```bash
# Abrir terminal na pasta do projeto
# Executar:
mysql -u root -p < database/setup.sql

# OU usar phpMyAdmin:
http://localhost/phpmyadmin
- Criar banco "psicoapp"
- Importar arquivo: database/setup.sql
```

### 3️⃣ Verificar Ambiente
```bash
# Executar o diagnóstico:
php check-environment.php

# Deve mostrar tudo ✅
```

### 4️⃣ Acessar Sistema PHP (100% Funcional)
```
http://localhost/psicoapp/register.php
```
1. Criar sua conta
2. Fazer login
3. Usar o sistema completo! ✅

---

## 🎨 Para usar versão React (Interface Moderna)

### 1️⃣ Instalar Dependências
```bash
npm install
```

### 2️⃣ Iniciar Desenvolvimento
```bash
npm run dev
```

### 3️⃣ Acessar
```
http://localhost:8080
```

⚠️ **IMPORTANTE**: Versão React ainda não tem autenticação.
Use a versão PHP por enquanto!

---

## 🐛 Problemas Comuns

### ❌ "Erro de conexão: SQLSTATE[HY000] [2002]"
**Solução**: MySQL não está rodando
```
1. Abrir XAMPP
2. Clicar "Start" no MySQL
3. Atualizar página
```

### ❌ "Unknown database 'psicoapp'"
**Solução**: Banco não foi criado
```
mysql -u root -p < database/setup.sql
```

### ❌ "Call to undefined function PDO"
**Solução**: Extensão não está ativa
```
1. Abrir php.ini
2. Remover ; de: extension=pdo_mysql
3. Reiniciar Apache no XAMPP
```

### ❌ Página em branco / Erro 404
**Solução**: Caminho incorreto
```
# Usar caminho completo:
http://localhost/psicoapp/index.php

# Se instalou em outra pasta:
http://localhost/sua-pasta/index.php
```

---

## 📞 Próximos Passos

1. ✅ Criar sua conta (register.php)
2. ✅ Cadastrar pacientes
3. ✅ Agendar consultas
4. ✅ Preencher anamneses
5. ✅ Registrar histórico de consultas

**Sistema está pronto para uso!** 🎉
