# 💻 INSTALAÇÃO AUTOMÁTICA - WINDOWS

## 🎯 Opção 1: Winget (Recomendado - Nativo Windows 10/11)

### Passo 1: Verificar se Winget está instalado
```cmd
winget --version
```
> Se não estiver, instalar Microsoft App Installer da Microsoft Store

### Passo 2: Instalar XAMPP (Apache + MySQL + PHP)
```cmd
winget install --id ApacheFriends.Xampp.8.2 -e
```

### Passo 3: Instalar Node.js (para desenvolvimento)
```cmd
winget install --id OpenJS.NodeJS.LTS -e
```

### Passo 4: Instalar Git (opcional)
```cmd
winget install --id Git.Git -e
```

### Passo 5: Instalar Visual Studio Code (opcional)
```cmd
winget install --id Microsoft.VisualStudioCode -e
```

---

## 🍫 Opção 2: Chocolatey (Alternativa popular)

### Passo 1: Instalar Chocolatey
**Abrir PowerShell como Administrador** e executar:
```powershell
Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
```

### Passo 2: Instalar tudo de uma vez
**No CMD como Administrador:**
```cmd
choco install xampp-81 nodejs git vscode -y
```

---

## 📦 Opção 3: Download Manual (Tradicional)

### 1. XAMPP
```
https://www.apachefriends.org/download.html
- Baixar versão 8.2.x
- Instalar em C:\xampp
- Marcar: Apache, MySQL, PHP, phpMyAdmin
```

### 2. Node.js
```
https://nodejs.org/
- Baixar versão LTS (20.x)
- Instalar com configurações padrão
```

---

## ⚙️ APÓS INSTALAÇÃO

### 1. Iniciar XAMPP
```cmd
:: Abrir XAMPP Control Panel
C:\xampp\xampp-control.exe

:: OU iniciar serviços via CMD:
net start Apache2.4
net start MySQL
```

### 2. Verificar instalações
```cmd
:: PHP
php --version

:: MySQL
mysql --version

:: Node.js
node --version

:: npm
npm --version
```

### 3. Configurar projeto PsicoApp
```cmd
:: Navegar até pasta do projeto
cd C:\xampp\htdocs\psicoapp

:: Verificar ambiente PHP
php check-environment.php

:: Instalar dependências Node.js
npm install

:: Criar banco de dados
mysql -u root -p < database\setup.sql
```

### 4. Testar sistema
```cmd
:: Abrir no navegador:
start http://localhost/psicoapp/index.php
```

---

## 🚀 SCRIPT COMPLETO - INSTALAÇÃO AUTOMÁTICA

### Salvar como `instalar-psicoapp.bat`

```batch
@echo off
echo ========================================
echo INSTALACAO AUTOMATICA - PSICOAPP
echo ========================================
echo.

:: Verificar se está como Administrador
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo ERRO: Execute como Administrador!
    echo Clique com botao direito e selecione "Executar como administrador"
    pause
    exit
)

echo [1/5] Verificando Winget...
winget --version >nul 2>&1
if %errorLevel% neq 0 (
    echo ERRO: Winget nao encontrado!
    echo Instale Microsoft App Installer da Microsoft Store
    pause
    exit
)

echo [2/5] Instalando XAMPP...
winget install --id ApacheFriends.Xampp.8.2 -e --silent --accept-source-agreements --accept-package-agreements

echo [3/5] Instalando Node.js...
winget install --id OpenJS.NodeJS.LTS -e --silent --accept-source-agreements --accept-package-agreements

echo [4/5] Instalando Git...
winget install --id Git.Git -e --silent --accept-source-agreements --accept-package-agreements

echo [5/5] Instalando Visual Studio Code...
winget install --id Microsoft.VisualStudioCode -e --silent --accept-source-agreements --accept-package-agreements

echo.
echo ========================================
echo INSTALACAO CONCLUIDA!
echo ========================================
echo.
echo PROXIMOS PASSOS:
echo 1. Reiniciar o computador
echo 2. Abrir XAMPP Control Panel
echo 3. Iniciar Apache e MySQL
echo 4. Navegar ate C:\xampp\htdocs\psicoapp
echo 5. Executar: php check-environment.php
echo.
pause
```

### Executar:
```cmd
:: Salvar o arquivo acima como instalar-psicoapp.bat
:: Clicar com botão direito → Executar como Administrador
instalar-psicoapp.bat
```

---

## 🔧 CONFIGURAÇÃO PÓS-INSTALAÇÃO

### 1. Configurar PHP
```cmd
:: Editar php.ini
notepad C:\xampp\php\php.ini

:: Descomentar (remover ;) destas linhas:
:: extension=pdo_mysql
:: extension=mbstring
:: extension=openssl

:: Adicionar timezone:
:: date.timezone = America/Sao_Paulo
```

### 2. Copiar projeto para XAMPP
```cmd
:: Criar pasta
mkdir C:\xampp\htdocs\psicoapp

:: Copiar arquivos do projeto
xcopy /E /I seu-projeto\* C:\xampp\htdocs\psicoapp\
```

### 3. Configurar banco de dados
```cmd
cd C:\xampp\htdocs\psicoapp

:: Criar banco (senha vazia por padrão)
mysql -u root < database\setup.sql

:: OU com senha:
mysql -u root -p < database\setup.sql
```

### 4. Instalar dependências React
```cmd
cd C:\xampp\htdocs\psicoapp
npm install
```

---

## 🐛 SOLUÇÃO DE PROBLEMAS

### ❌ "winget não é reconhecido"
```cmd
:: Instalar Microsoft App Installer:
start ms-windows-store://pdp/?ProductId=9NBLGGH4NNS1
```

### ❌ "Porta 80 já está em uso"
```cmd
:: Ver o que está usando porta 80
netstat -ano | findstr :80

:: Parar IIS (se instalado)
net stop was /y

:: OU mudar porta do Apache em:
:: C:\xampp\apache\conf\httpd.conf
:: Listen 80 → Listen 8080
```

### ❌ "Porta 3306 já está em uso"
```cmd
:: Ver o que está usando porta 3306
netstat -ano | findstr :3306

:: Parar MySQL padrão do Windows
net stop MySQL80
```

### ❌ "php não é reconhecido"
```cmd
:: Adicionar ao PATH
setx PATH "%PATH%;C:\xampp\php"

:: Fechar e reabrir CMD
```

### ❌ "Apache não inicia"
```cmd
:: Ver log de erros
type C:\xampp\apache\logs\error.log

:: Causas comuns:
:: - Skype usando porta 80
:: - IIS ativo
:: - Windows NAT usando porta 80
```

---

## 📊 VERIFICAÇÃO FINAL

### Executar checklist:
```cmd
cd C:\xampp\htdocs\psicoapp

:: 1. Verificar ambiente
php check-environment.php

:: 2. Verificar Apache
curl http://localhost

:: 3. Verificar MySQL
mysql -u root -e "SHOW DATABASES"

:: 4. Verificar phpMyAdmin
start http://localhost/phpmyadmin

:: 5. Verificar PsicoApp
start http://localhost/psicoapp/index.php
```

---

## 🎓 COMANDOS ÚTEIS

### Gerenciar serviços XAMPP
```cmd
:: Iniciar Apache
net start Apache2.4

:: Parar Apache
net stop Apache2.4

:: Iniciar MySQL
net start MySQL

:: Parar MySQL
net stop MySQL

:: Status dos serviços
sc query Apache2.4
sc query MySQL
```

### Logs e debug
```cmd
:: Log Apache
type C:\xampp\apache\logs\error.log

:: Log MySQL
type C:\xampp\mysql\data\mysql_error.log

:: Log PHP
type C:\xampp\php\logs\php_error_log
```

### Backup banco de dados
```cmd
:: Fazer backup
mysqldump -u root psicoapp > backup_%date:~0,2%%date:~3,2%%date:~6,4%.sql

:: Restaurar backup
mysql -u root psicoapp < backup.sql
```

---

## ✅ CHECKLIST DE INSTALAÇÃO

- [ ] XAMPP instalado e rodando
- [ ] Apache ativo (porta 80)
- [ ] MySQL ativo (porta 3306)
- [ ] PHP funcionando (php --version)
- [ ] Node.js instalado (node --version)
- [ ] Projeto copiado para C:\xampp\htdocs\psicoapp
- [ ] Banco de dados criado (psicoapp)
- [ ] Dependências instaladas (npm install)
- [ ] check-environment.php executado ✅
- [ ] Sistema acessível em http://localhost/psicoapp

---

## 📞 SUPORTE

Caso tenha problemas:
1. Executar: `php check-environment.php`
2. Verificar logs do Apache e MySQL
3. Ver DIAGNOSTIC_PRODUCTION.md
4. Consultar INICIO_RAPIDO.md

**Sistema pronto em 15 minutos!** 🚀
