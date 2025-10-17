<?php
/**
 * Script de Diagnóstico - PsicoApp
 * Execute: php check-environment.php
 */

echo "🔍 VERIFICANDO AMBIENTE PSICOAPP\n";
echo str_repeat("=", 50) . "\n\n";

// Verificar versão PHP
echo "📦 PHP\n";
echo "  Versão: " . PHP_VERSION;
if (version_compare(PHP_VERSION, '7.4.0') >= 0) {
    echo " ✅\n";
} else {
    echo " ❌ (mínimo 7.4)\n";
}

// Verificar extensões obrigatórias
echo "\n📚 Extensões PHP Obrigatórias:\n";
$required_extensions = [
    'pdo' => 'PDO',
    'pdo_mysql' => 'PDO MySQL',
    'session' => 'Session',
    'json' => 'JSON',
    'mbstring' => 'Multibyte String',
    'openssl' => 'OpenSSL'
];

foreach ($required_extensions as $ext => $name) {
    $loaded = extension_loaded($ext);
    echo "  $name: " . ($loaded ? "✅" : "❌") . "\n";
    if (!$loaded) {
        echo "    ⚠️  Ativar em php.ini: extension=$ext\n";
    }
}

// Verificar conexão MySQL
echo "\n🗄️  Banco de Dados:\n";
try {
    require_once 'config/database.php';
    $db = new Database();
    $conn = $db->connect();
    
    if ($conn) {
        echo "  Conexão MySQL: ✅\n";
        
        // Verificar se o banco existe
        $stmt = $conn->query("SHOW DATABASES LIKE 'psicoapp'");
        $db_exists = $stmt->rowCount() > 0;
        echo "  Banco 'psicoapp': " . ($db_exists ? "✅" : "❌ (executar setup.sql)") . "\n";
        
        if ($db_exists) {
            // Verificar tabelas
            $conn->query("USE psicoapp");
            $required_tables = [
                'users',
                'patients',
                'appointments',
                'patient_pricing',
                'patient_anamnesis',
                'consultation_history'
            ];
            
            echo "\n  📋 Tabelas:\n";
            foreach ($required_tables as $table) {
                $stmt = $conn->query("SHOW TABLES LIKE '$table'");
                $exists = $stmt->rowCount() > 0;
                echo "    $table: " . ($exists ? "✅" : "❌") . "\n";
            }
            
            // Contar registros
            echo "\n  📊 Dados:\n";
            $stmt = $conn->query("SELECT COUNT(*) as count FROM users");
            $users = $stmt->fetch(PDO::FETCH_ASSOC);
            echo "    Usuários cadastrados: " . $users['count'] . "\n";
            
            $stmt = $conn->query("SELECT COUNT(*) as count FROM patients");
            $patients = $stmt->fetch(PDO::FETCH_ASSOC);
            echo "    Pacientes cadastrados: " . $patients['count'] . "\n";
        }
    }
} catch (Exception $e) {
    echo "  Conexão MySQL: ❌\n";
    echo "  Erro: " . $e->getMessage() . "\n";
    echo "\n  ⚠️  Soluções:\n";
    echo "    1. Verificar se MySQL está rodando\n";
    echo "    2. Conferir credenciais em config/database.php\n";
    echo "    3. Criar banco: mysql -u root -p < database/setup.sql\n";
}

// Verificar arquivos críticos
echo "\n📁 Arquivos Críticos:\n";
$critical_files = [
    'config/database.php' => 'Configuração BD',
    'database/setup.sql' => 'Script instalação',
    'database/migration.sql' => 'Script atualização',
    'login.php' => 'Login PHP',
    'index.php' => 'App PHP',
    'index.html' => 'App React',
    'api/patients.php' => 'API Pacientes',
    'api/appointments.php' => 'API Consultas',
];

foreach ($critical_files as $file => $desc) {
    echo "  $desc: " . (file_exists($file) ? "✅" : "❌") . "\n";
}

// Verificar permissões
echo "\n🔐 Permissões:\n";
$writable_dirs = [
    './' => 'Diretório raiz'
];

foreach ($writable_dirs as $dir => $desc) {
    echo "  $desc: " . (is_writable($dir) ? "✅" : "❌ (ajustar permissões)") . "\n";
}

// Verificar configurações PHP
echo "\n⚙️  Configurações PHP:\n";
$settings = [
    'session.auto_start' => ['0', 'desligado'],
    'display_errors' => ['1', 'ligado (dev)'],
    'date.timezone' => ['America/Sao_Paulo', 'configurado']
];

foreach ($settings as $key => $expected) {
    $value = ini_get($key);
    $status = !empty($value) ? "✅" : "⚠️";
    echo "  $key: $value $status\n";
}

// Verificar Node.js (para desenvolvimento)
echo "\n🟢 Node.js (Desenvolvimento):\n";
exec('node --version 2>&1', $node_output, $node_return);
if ($node_return === 0) {
    echo "  Node.js: " . $node_output[0] . " ✅\n";
} else {
    echo "  Node.js: ❌ (não instalado)\n";
    echo "    ⚠️  Necessário para desenvolvimento React\n";
}

exec('npm --version 2>&1', $npm_output, $npm_return);
if ($npm_return === 0) {
    echo "  npm: " . $npm_output[0] . " ✅\n";
} else {
    echo "  npm: ❌ (não instalado)\n";
}

// Resumo final
echo "\n" . str_repeat("=", 50) . "\n";
echo "📋 RESUMO:\n\n";

if (extension_loaded('pdo_mysql') && isset($conn) && $conn) {
    echo "✅ Backend PHP está OK!\n";
    echo "   Acesse: http://localhost/psicoapp/index.php\n\n";
} else {
    echo "❌ Backend PHP precisa de ajustes!\n";
    echo "   Veja os erros acima.\n\n";
}

if ($node_return === 0) {
    echo "✅ Ambiente React está OK!\n";
    echo "   Execute: npm install && npm run dev\n";
    echo "   Acesse: http://localhost:8080\n\n";
} else {
    echo "⚠️  Node.js não detectado (apenas para desenvolvimento)\n\n";
}

echo "📚 Documentação completa: DIAGNOSTIC_PRODUCTION.md\n";
echo str_repeat("=", 50) . "\n";
?>
