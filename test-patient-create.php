<?php
// Ativar exibição de erros
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/debug.log');

echo "<h1>🔍 Diagnóstico de Criação de Paciente</h1>";
echo "<pre>";

// 1. Testar conexão com banco
echo "=== TESTE 1: CONEXÃO COM BANCO ===\n";
try {
    require_once 'config/database.php';
    $database = new Database();
    $db = $database->connect();
    echo "✅ Conexão com banco estabelecida\n";
    echo "Driver: " . $db->getAttribute(PDO::ATTR_DRIVER_NAME) . "\n";
    echo "Server info: " . $db->getAttribute(PDO::ATTR_SERVER_VERSION) . "\n";
} catch (Exception $e) {
    echo "❌ Erro na conexão: " . $e->getMessage() . "\n";
    die();
}

// 2. Testar se tabela patients existe
echo "\n=== TESTE 2: VERIFICAR TABELA PATIENTS ===\n";
try {
    $stmt = $db->query("DESCRIBE patients");
    $columns = $stmt->fetchAll(PDO::FETCH_ASSOC);
    echo "✅ Tabela 'patients' existe\n";
    echo "Colunas encontradas:\n";
    foreach ($columns as $col) {
        echo "  - {$col['Field']} ({$col['Type']}) " . 
             ($col['Null'] === 'NO' ? 'NOT NULL' : 'NULL') . 
             ($col['Key'] === 'PRI' ? ' PRIMARY KEY' : '') . "\n";
    }
} catch (PDOException $e) {
    echo "❌ Erro ao verificar tabela: " . $e->getMessage() . "\n";
    die();
}

// 3. Testar se tabela users existe e tem dados
echo "\n=== TESTE 3: VERIFICAR USUÁRIOS ===\n";
try {
    $stmt = $db->query("SELECT id, name, email FROM users LIMIT 5");
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if (count($users) > 0) {
        echo "✅ Usuários encontrados: " . count($users) . "\n";
        foreach ($users as $user) {
            echo "  - ID: {$user['id']}, Nome: {$user['name']}, Email: {$user['email']}\n";
        }
        $test_user_id = $users[0]['id'];
    } else {
        echo "⚠️ Nenhum usuário encontrado. Criando usuário de teste...\n";
        $stmt = $db->prepare("INSERT INTO users (name, email, password) VALUES (?, ?, ?)");
        $stmt->execute(['Teste Diagnóstico', 'teste@diagnostico.com', password_hash('123456', PASSWORD_DEFAULT)]);
        $test_user_id = $db->lastInsertId();
        echo "✅ Usuário criado com ID: $test_user_id\n";
    }
} catch (PDOException $e) {
    echo "❌ Erro ao verificar usuários: " . $e->getMessage() . "\n";
    die();
}

// 4. Testar INSERT direto (sem classe)
echo "\n=== TESTE 4: INSERT DIRETO SQL ===\n";
try {
    $query = "INSERT INTO patients (user_id, name, email, phone, birth_date, notes) 
              VALUES (:user_id, :name, :email, :phone, :birth_date, :notes)";
    
    $stmt = $db->prepare($query);
    
    $data = [
        'user_id' => $test_user_id,
        'name' => 'Paciente Teste Direto',
        'email' => 'teste.direto@email.com',
        'phone' => '11999999999',
        'birth_date' => '1990-01-01',
        'notes' => 'Teste de inserção direta'
    ];
    
    echo "Dados para inserção:\n";
    print_r($data);
    
    $stmt->bindParam(':user_id', $data['user_id']);
    $stmt->bindParam(':name', $data['name']);
    $stmt->bindParam(':email', $data['email']);
    $stmt->bindParam(':phone', $data['phone']);
    $stmt->bindParam(':birth_date', $data['birth_date']);
    $stmt->bindParam(':notes', $data['notes']);
    
    if ($stmt->execute()) {
        $patient_id = $db->lastInsertId();
        echo "✅ INSERT direto funcionou! ID do paciente: $patient_id\n";
        
        // Verificar se foi inserido
        $check = $db->prepare("SELECT * FROM patients WHERE id = ?");
        $check->execute([$patient_id]);
        $inserted = $check->fetch(PDO::FETCH_ASSOC);
        echo "Dados inseridos:\n";
        print_r($inserted);
        
        // Limpar teste
        $db->exec("DELETE FROM patients WHERE id = $patient_id");
        echo "✅ Registro de teste removido\n";
    } else {
        echo "❌ INSERT falhou\n";
        print_r($stmt->errorInfo());
    }
} catch (PDOException $e) {
    echo "❌ Erro no INSERT direto: " . $e->getMessage() . "\n";
    echo "Código do erro: " . $e->getCode() . "\n";
}

// 5. Testar com a classe Patient
echo "\n=== TESTE 5: CRIAR PACIENTE COM CLASSE Patient ===\n";
try {
    require_once 'classes/Patient.php';
    $patient = new Patient($db);
    
    $patient->user_id = $test_user_id;
    $patient->name = 'Paciente Teste Classe';
    $patient->email = 'teste.classe@email.com';
    $patient->phone = '11888888888';
    $patient->birth_date = '1985-05-15';
    $patient->notes = 'Teste com classe Patient';
    
    echo "Dados do paciente:\n";
    echo "  - user_id: {$patient->user_id}\n";
    echo "  - name: {$patient->name}\n";
    echo "  - email: {$patient->email}\n";
    echo "  - phone: {$patient->phone}\n";
    echo "  - birth_date: {$patient->birth_date}\n";
    
    $result = $patient->create();
    
    if ($result && is_numeric($result)) {
        echo "✅ Paciente criado com sucesso! ID: $result\n";
        
        // Limpar teste
        $patient->id = $result;
        $patient->user_id = $test_user_id;
        $patient->delete();
        echo "✅ Paciente de teste removido\n";
    } else {
        echo "❌ Falha ao criar paciente\n";
        echo "Retorno do create(): ";
        var_dump($result);
    }
} catch (Exception $e) {
    echo "❌ Exceção ao testar classe: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}

// 6. Verificar modo PDO error
echo "\n=== TESTE 6: MODO DE ERRO PDO ===\n";
echo "Modo de erro atual: ";
$errorMode = $db->getAttribute(PDO::ATTR_ERRMODE);
switch ($errorMode) {
    case PDO::ERRMODE_SILENT:
        echo "SILENT (erros não são reportados)\n";
        break;
    case PDO::ERRMODE_WARNING:
        echo "WARNING (erros geram avisos)\n";
        break;
    case PDO::ERRMODE_EXCEPTION:
        echo "EXCEPTION (erros geram exceções) ✅\n";
        break;
}

// 7. Verificar logs
echo "\n=== TESTE 7: VERIFICAR LOGS ===\n";
$log_file = __DIR__ . '/debug.log';
if (file_exists($log_file)) {
    echo "📄 Últimas 20 linhas do debug.log:\n";
    echo "----------------------------------------\n";
    $lines = file($log_file);
    $last_lines = array_slice($lines, -20);
    echo implode('', $last_lines);
} else {
    echo "⚠️ Arquivo debug.log não existe ainda\n";
}

echo "\n=== DIAGNÓSTICO CONCLUÍDO ===\n";
echo "Verifique os resultados acima para identificar o problema.\n";
echo "</pre>";
?>