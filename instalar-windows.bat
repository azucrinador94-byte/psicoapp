@echo off
chcp 65001 >nul
cls
color 0A
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║          INSTALAÇÃO AUTOMÁTICA - PSICOAPP WINDOWS             ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.

:: Verificar privilégios de administrador
net session >nul 2>&1
if %errorLevel% neq 0 (
    color 0C
    echo ❌ ERRO: Este script precisa ser executado como Administrador!
    echo.
    echo Como executar:
    echo 1. Clique com botão direito no arquivo instalar-windows.bat
    echo 2. Selecione "Executar como administrador"
    echo.
    pause
    exit /b 1
)

echo ✅ Privilégios de administrador confirmados
echo.

:: Verificar Winget
echo [1/6] Verificando Winget...
winget --version >nul 2>&1
if %errorLevel% neq 0 (
    color 0E
    echo ⚠️  Winget não encontrado!
    echo.
    echo Instalando Microsoft App Installer...
    start ms-windows-store://pdp/?ProductId=9NBLGGH4NNS1
    echo.
    echo Após instalar, execute este script novamente.
    pause
    exit /b 1
)
echo ✅ Winget encontrado
echo.

:: Perguntar o que instalar
echo Selecione o que deseja instalar:
echo.
echo [1] TUDO (XAMPP + Node.js + Git + VS Code)
echo [2] Apenas XAMPP
echo [3] Apenas Node.js
echo [4] XAMPP + Node.js (recomendado)
echo [5] Sair
echo.
set /p opcao="Digite a opção (1-5): "

if "%opcao%"=="5" exit /b 0

:: Instalar baseado na escolha
if "%opcao%"=="1" goto instalar_tudo
if "%opcao%"=="2" goto instalar_xampp
if "%opcao%"=="3" goto instalar_node
if "%opcao%"=="4" goto instalar_essencial
echo Opção inválida!
pause
exit /b 1

:instalar_tudo
echo.
echo [2/6] Instalando XAMPP...
winget install --id ApacheFriends.Xampp.8.2 -e --accept-source-agreements --accept-package-agreements
if %errorLevel% neq 0 echo ⚠️  Erro ao instalar XAMPP

echo.
echo [3/6] Instalando Node.js...
winget install --id OpenJS.NodeJS.LTS -e --accept-source-agreements --accept-package-agreements
if %errorLevel% neq 0 echo ⚠️  Erro ao instalar Node.js

echo.
echo [4/6] Instalando Git...
winget install --id Git.Git -e --accept-source-agreements --accept-package-agreements
if %errorLevel% neq 0 echo ⚠️  Erro ao instalar Git

echo.
echo [5/6] Instalando Visual Studio Code...
winget install --id Microsoft.VisualStudioCode -e --accept-source-agreements --accept-package-agreements
if %errorLevel% neq 0 echo ⚠️  Erro ao instalar VS Code

goto verificacao

:instalar_xampp
echo.
echo [2/6] Instalando XAMPP...
winget install --id ApacheFriends.Xampp.8.2 -e --accept-source-agreements --accept-package-agreements
if %errorLevel% neq 0 echo ⚠️  Erro ao instalar XAMPP
goto verificacao

:instalar_node
echo.
echo [2/6] Instalando Node.js...
winget install --id OpenJS.NodeJS.LTS -e --accept-source-agreements --accept-package-agreements
if %errorLevel% neq 0 echo ⚠️  Erro ao instalar Node.js
goto verificacao

:instalar_essencial
echo.
echo [2/6] Instalando XAMPP...
winget install --id ApacheFriends.Xampp.8.2 -e --accept-source-agreements --accept-package-agreements
if %errorLevel% neq 0 echo ⚠️  Erro ao instalar XAMPP

echo.
echo [3/6] Instalando Node.js...
winget install --id OpenJS.NodeJS.LTS -e --accept-source-agreements --accept-package-agreements
if %errorLevel% neq 0 echo ⚠️  Erro ao instalar Node.js
goto verificacao

:verificacao
echo.
echo [6/6] Verificando instalações...
echo.

:: Verificar PHP
where php >nul 2>&1
if %errorLevel% equ 0 (
    echo ✅ PHP instalado
    php --version | findstr /C:"PHP"
) else (
    echo ⚠️  PHP não encontrado no PATH
    echo    Será configurado após reiniciar
)

echo.

:: Verificar MySQL
where mysql >nul 2>&1
if %errorLevel% equ 0 (
    echo ✅ MySQL instalado
    mysql --version
) else (
    echo ⚠️  MySQL não encontrado no PATH
    echo    Será configurado após reiniciar
)

echo.

:: Verificar Node
where node >nul 2>&1
if %errorLevel% equ 0 (
    echo ✅ Node.js instalado
    node --version
) else (
    echo ⚠️  Node.js não encontrado no PATH
    echo    Será configurado após reiniciar
)

echo.
echo ╔═══════════════════════════════════════════════════════════════╗
echo ║                   INSTALAÇÃO CONCLUÍDA!                       ║
echo ╚═══════════════════════════════════════════════════════════════╝
echo.
echo 📋 PRÓXIMOS PASSOS:
echo.
echo 1. REINICIAR o computador (importante!)
echo 2. Abrir XAMPP Control Panel:
echo    C:\xampp\xampp-control.exe
echo.
echo 3. Iniciar serviços:
echo    - Apache ✅
echo    - MySQL ✅
echo.
echo 4. Copiar projeto para:
echo    C:\xampp\htdocs\psicoapp\
echo.
echo 5. Configurar banco de dados:
echo    cd C:\xampp\htdocs\psicoapp
echo    mysql -u root ^< database\setup.sql
echo.
echo 6. Verificar ambiente:
echo    php check-environment.php
echo.
echo 7. Instalar dependências React:
echo    npm install
echo.
echo 8. Acessar sistema:
echo    http://localhost/psicoapp/index.php
echo.
echo 📚 Documentação completa: INSTALACAO_WINDOWS.md
echo.

:: Perguntar se quer reiniciar agora
set /p reiniciar="Deseja reiniciar o computador agora? (S/N): "
if /i "%reiniciar%"=="S" (
    echo.
    echo Reiniciando em 10 segundos...
    echo Pressione Ctrl+C para cancelar
    timeout /t 10
    shutdown /r /t 0
) else (
    echo.
    echo ⚠️  Lembre-se de reiniciar antes de usar o sistema!
    pause
)
