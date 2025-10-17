# PsicoApp - Instalação PHP/MySQL

## Passo a Passo para Windows 11

### 1. Instalar XAMPP

1. **Baixar XAMPP:**
   - Acesse: https://www.apachefriends.org/download.html
   - Baixe a versão mais recente para Windows
   - Execute o instalador como Administrador

2. **Instalar XAMPP:**
   - Instale em `C:\xampp`
   - Marque: Apache, MySQL, PHP, phpMyAdmin
   - Conclua a instalação

### 2. Configurar XAMPP

1. **Abrir XAMPP Control Panel:**
   - Execute como Administrador
   - Inicie os serviços **Apache** e **MySQL**
   - Verifique se estão rodando (indicador verde)

2. **Testar instalação:**
   - Acesse: http://localhost
   - Deve aparecer a página do XAMPP

### 3. Criar Banco de Dados

1. **Acessar phpMyAdmin:**
   - Acesse: http://localhost/phpmyadmin
   - Usuário: `root` (sem senha)

2. **Executar SQL:**
   - Clique em "SQL"
   - Copie e cole todo o conteúdo do arquivo `database/setup.sql`
   - Clique em "Executar"
   - **IMPORTANTE:** Se aparecer erro sobre colunas não encontradas:
     - Clique na aba "Bancos de dados"
     - Selecione o banco "psicoapp" (se existir) e clique em "Apagar"
     - Execute o SQL novamente

### 4. Baixar PsicoApp

1. **Opção 1 - Download direto do GitHub:**
   - Acesse: https://github.com/[SEU_REPOSITORIO]/psicoapp
   - Clique no botão verde "Code"
   - Selecione "Download ZIP"
   - Salve o arquivo em uma pasta de sua preferência
   - Extraia o arquivo ZIP

2. **Opção 2 - Clone com Git (se tiver Git instalado):**
   - Abra o Prompt de Comando ou PowerShell
   - Navegue até `C:\xampp\htdocs\`
   - Execute: `git clone [URL_DO_REPOSITORIO] psicoapp`

### 5. Instalar PsicoApp

1. **Se baixou via ZIP:**
   - Extraia todos os arquivos do ZIP baixado
   - Copie toda a pasta do projeto para: `C:\xampp\htdocs\psicoapp`
   - Certifique-se que os arquivos PHP estão diretamente em `psicoapp`, não em uma subpasta

2. **Verificar estrutura:**
   - Abra `C:\xampp\htdocs\psicoapp`
   - Deve conter diretamente os arquivos: `index.php`, `login.php`, etc.

2. **Estrutura de pastas:**
   ```
   C:\xampp\htdocs\psicoapp\
   ├── api/
   ├── assets/
   ├── classes/
   ├── config/
   ├── database/
   ├── includes/
   ├── index.php
   ├── login.php
   ├── register.php
   └── logout.php
   ```

### 6. Configurar Permissões

1. **Permissões de pasta:**
   - Clique com botão direito em `C:\xampp\htdocs\psicoapp`
   - Propriedades > Segurança > Editar
   - Dê permissão total para "Todos"

### 7. Acessar o Sistema

1. **Primeira vez:**
   - Acesse: http://localhost/psicoapp
   - Você será redirecionado para a tela de cadastro
   - Crie sua conta de psicólogo
   - Faça login com suas credenciais

2. **Próximos acessos:**
   - Acesse: http://localhost/psicoapp
   - Faça login com email e senha

## Sistema Implementado

### Funcionalidades Ativas:
- ✅ Sistema de login e cadastro
- ✅ Dashboard com estatísticas
- ✅ Gestão completa de pacientes (CRUD)
- ✅ Calendário de consultas
- ✅ Busca de pacientes
- ✅ Interface responsiva
- ✅ API REST em PHP
- ✅ Banco de dados MySQL

### Como Usar:

1. **Primeiro Acesso:**
   - Crie sua conta em "Cadastro"
   - Preencha seus dados profissionais
   - Faça login

2. **Gerenciar Pacientes:**
   - Vá em "Pacientes"
   - Clique em "Novo Paciente"
   - Preencha os dados e salve

3. **Agendar Consultas:**
   - Vá em "Agenda"
   - Clique em "Nova Consulta"
   - Selecione paciente, data e horário

4. **Dashboard:**
   - Visualize estatísticas
   - Veja próximas consultas
   - Acesse ações rápidas

## Solução de Problemas

### Apache não inicia:
1. Verificar se a porta 80 está livre
2. Parar IIS se estiver rodando
3. Executar XAMPP como Administrador

### MySQL não inicia:
1. Verificar se a porta 3306 está livre
2. Parar outros serviços MySQL
3. Reiniciar o XAMPP

### Erro 404:
1. Verificar se os arquivos estão em `htdocs/psicoapp`
2. Verificar se o Apache está rodando
3. Limpar cache do navegador

### Erro de conexão com banco:
1. Verificar se MySQL está rodando
2. Conferir configurações em `config/database.php`
3. Verificar se o banco `psicoapp` foi criado

### Não consegue fazer login:
1. Certifique-se de ter criado uma conta primeiro
2. Verifique se o banco foi criado corretamente
3. Confira email e senha digitados

### Problemas com cadastro:
1. Verifique se todos os campos obrigatórios estão preenchidos
2. Certifique-se de que as senhas coincidem
3. Use um email válido e único

### Erro "Column 'crp' not found":
1. **Problema:** Banco criado com versão antiga do schema
2. **Solução:**
   - Acesse http://localhost/phpmyadmin
   - Clique na aba "Bancos de dados"
   - Selecione o banco "psicoapp" e clique em "Apagar"
   - Vá em "SQL" e execute novamente todo o conteúdo de `database/setup.sql`
   - O banco será recriado com a estrutura correta

## Contato

Para suporte ou dúvidas sobre a instalação, verifique os logs de erro do sistema no phpMyAdmin ou nos logs do Apache.