# 🗄️ Setup do Banco de Dados MySQL - PsicoApp

## ⚠️ IMPORTANTE: Modo de Desenvolvimento

O sistema está configurado em **MODO DE DESENVOLVIMENTO** por padrão, o que permite testar a aplicação sem necessidade de login.

Para desativar o modo de desenvolvimento e exigir autenticação:
1. Abra o arquivo `config/dev.php`
2. Altere `define('DEVELOPMENT_MODE', true);` para `define('DEVELOPMENT_MODE', false);`

---

## 📋 Pré-requisitos

- MySQL 5.7 ou superior
- PHP 7.4 ou superior
- Acesso ao MySQL via linha de comando, phpMyAdmin ou similar

---

## 🚀 Opção 1: Linha de Comando MySQL

### 1. Conectar ao MySQL

```bash
mysql -u root -p
```

### 2. Criar o banco de dados

```sql
CREATE DATABASE psicoapp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE psicoapp;
```

### 3. Executar o script de setup

```bash
mysql -u root -p psicoapp < database/setup.sql
```

OU copie e cole o conteúdo do arquivo `database/setup.sql` diretamente no console MySQL.

---

## 🌐 Opção 2: phpMyAdmin

1. Acesse o phpMyAdmin (geralmente http://localhost/phpmyadmin)
2. Faça login com suas credenciais
3. Clique em "Novo" para criar um banco de dados
4. Nome do banco: `psicoapp`
5. Charset: `utf8mb4_unicode_ci`
6. Clique em "Criar"
7. Selecione o banco `psicoapp` criado
8. Vá na aba "SQL"
9. Copie todo o conteúdo do arquivo `database/setup.sql`
10. Cole no campo de texto e clique em "Executar"

---

## 🔧 Opção 3: Script PHP Automático

Crie um arquivo `install-database.php` na raiz do projeto:

```php
<?php
require_once 'config/database.php';

try {
    $database = new Database();
    $db = $database->connect();
    
    // Ler arquivo SQL
    $sql = file_get_contents('database/setup.sql');
    
    // Executar SQL
    $db->exec($sql);
    
    echo "✅ Banco de dados criado com sucesso!\n";
} catch (PDOException $e) {
    echo "❌ Erro ao criar banco de dados: " . $e->getMessage() . "\n";
}
?>
```

Execute via terminal:
```bash
php install-database.php
```

---

## 🔐 Configuração do Banco de Dados

Verifique as configurações em `config/database.php`:

```php
private $host = 'localhost';
private $db_name = 'psicoapp';
private $username = 'root';
private $password = '';
```

Ajuste conforme sua configuração local.

---

## 📊 Estrutura das Tabelas

O banco de dados criará automaticamente as seguintes tabelas:

- **users** - Usuários do sistema (psicólogos)
- **patients** - Pacientes cadastrados
- **appointments** - Consultas agendadas
- **patient_anamnesis** - Anamnese dos pacientes
- **consultation_history** - Histórico de consultas realizadas
- **patient_pricing** - Valores cobrados por paciente

---

## ✅ Verificar Instalação

Após executar o setup, verifique se as tabelas foram criadas:

```sql
USE psicoapp;
SHOW TABLES;
```

Você deve ver:
```
+-----------------------------+
| Tables_in_psicoapp         |
+-----------------------------+
| appointments               |
| consultation_history       |
| patient_anamnesis         |
| patient_pricing           |
| patients                  |
| users                     |
+-----------------------------+
```

---

## 🧪 Dados de Teste

Para adicionar dados de teste, execute:

```bash
mysql -u root -p psicoapp < database/migration.sql
```

---

## 🆘 Problemas Comuns

### Erro: "Access denied for user"
- Verifique usuário e senha em `config/database.php`
- Certifique-se que o MySQL está rodando

### Erro: "Database does not exist"
- Crie o banco primeiro: `CREATE DATABASE psicoapp;`
- Execute o script novamente

### Erro: "Table already exists"
- Drop as tabelas existentes:
```sql
DROP TABLE IF EXISTS appointments, consultation_history, patient_anamnesis, patient_pricing, patients, users;
```
- Execute o setup novamente

---

## 🔄 Reinstalar do Zero

```sql
DROP DATABASE IF EXISTS psicoapp;
CREATE DATABASE psicoapp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE psicoapp;
SOURCE database/setup.sql;
```

---

## 📱 Suporte

Se encontrar problemas:
1. Verifique os logs do PHP (geralmente em `/var/log/apache2/error.log`)
2. Verifique os logs do MySQL
3. Certifique-se que todas as extensões PHP necessárias estão instaladas (PDO, pdo_mysql)
