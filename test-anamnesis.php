<?php
error_reporting(E_ALL);
ini_set('display_errors', 1);

echo "<h1>🔍 Teste de Salvamento de Anamnese</h1>";
echo "<pre>";

session_start();

// Simular usuário logado
if (!isset($_SESSION['user_id'])) {
    $_SESSION['user_id'] = 1; // Ajuste para o ID do seu usuário
}

require_once 'config/database.php';
require_once 'classes/PatientAnamnesis.php';

echo "=== TESTE 1: CONEXÃO ===\n";
try {
    $database = new Database();
    $db = $database->connect();
    echo "✅ Conectado ao banco\n\n";
} catch (Exception $e) {
    echo "❌ Erro: " . $e->getMessage() . "\n";
    die();
}

echo "=== TESTE 2: BUSCAR PACIENTE ===\n";
$stmt = $db->query("SELECT id, name FROM patients LIMIT 1");
$patient = $stmt->fetch(PDO::FETCH_ASSOC);

if ($patient) {
    echo "✅ Paciente encontrado: {$patient['name']} (ID: {$patient['id']})\n\n";
    $patient_id = $patient['id'];
} else {
    echo "❌ Nenhum paciente encontrado. Crie um paciente primeiro.\n";
    die();
}

echo "=== TESTE 3: CRIAR ANAMNESE ===\n";
$anamnesis = new PatientAnamnesis($db);
$anamnesis->user_id = $_SESSION['user_id'];
$anamnesis->patient_id = $patient_id;
$anamnesis->complaint = "Teste de queixa principal - " . date('Y-m-d H:i:s');
$anamnesis->history_illness = "Teste de história da doença atual - Lorem ipsum dolor sit amet";
$anamnesis->previous_treatments = "Teste de tratamentos anteriores - Terapia cognitiva";
$anamnesis->medications = "Teste de medicações - Fluoxetina 20mg";
$anamnesis->family_history = "Teste de história familiar - Mãe com depressão";
$anamnesis->personal_history = "Teste de história pessoal - Infância tranquila";
$anamnesis->social_history = "Teste de história social - Trabalha em TI";
$anamnesis->observations = "Teste de observações gerais - Paciente colaborativo";

echo "Dados da anamnese:\n";
echo "  - Patient ID: {$anamnesis->patient_id}\n";
echo "  - User ID: {$anamnesis->user_id}\n";
echo "  - Complaint: " . substr($anamnesis->complaint, 0, 50) . "...\n";
echo "  - History Illness: " . substr($anamnesis->history_illness, 0, 50) . "...\n";
echo "  - Previous Treatments: " . substr($anamnesis->previous_treatments, 0, 50) . "...\n";
echo "  - Medications: " . substr($anamnesis->medications, 0, 50) . "...\n\n";

echo "Chamando createOrUpdate()...\n";
$result = $anamnesis->createOrUpdate();

echo "\nResultado:\n";
print_r($result);

if (is_array($result) && $result['success']) {
    echo "\n✅ SUCESSO! Anamnese salva.\n";
    echo "   Ação: {$result['action']}\n";
    echo "   ID: {$result['id']}\n";
    echo "   Mensagem: {$result['message']}\n\n";
    
    // Verificar se foi salvo
    echo "=== TESTE 4: VERIFICAR NO BANCO ===\n";
    $check = $db->prepare("SELECT * FROM patient_anamnesis WHERE id = ?");
    $check->execute([$result['id']]);
    $saved = $check->fetch(PDO::FETCH_ASSOC);
    
    if ($saved) {
        echo "✅ Registro encontrado no banco:\n";
        echo "  - ID: {$saved['id']}\n";
        echo "  - Patient ID: {$saved['patient_id']}\n";
        echo "  - Complaint: " . substr($saved['complaint'], 0, 50) . "...\n";
        echo "  - History Illness: " . substr($saved['history_illness'], 0, 50) . "...\n";
        echo "  - Previous Treatments: " . substr($saved['previous_treatments'], 0, 50) . "...\n";
        echo "  - Medications: " . substr($saved['medications'], 0, 50) . "...\n";
        echo "  - Family History: " . substr($saved['family_history'], 0, 50) . "...\n";
        echo "  - Personal History: " . substr($saved['personal_history'], 0, 50) . "...\n";
        echo "  - Social History: " . substr($saved['social_history'], 0, 50) . "...\n";
        echo "  - Observations: " . substr($saved['observations'], 0, 50) . "...\n";
    } else {
        echo "❌ Registro NÃO encontrado no banco!\n";
    }
    
} else {
    echo "\n❌ FALHOU ao salvar anamnese\n";
    if (is_array($result)) {
        echo "   Mensagem: {$result['message']}\n";
    }
}

echo "\n=== TESTE 5: VER TODOS OS CAMPOS DA TABELA ===\n";
$columns = $db->query("DESCRIBE patient_anamnesis");
echo "Colunas da tabela patient_anamnesis:\n";
while ($col = $columns->fetch(PDO::FETCH_ASSOC)) {
    echo "  - {$col['Field']} ({$col['Type']})\n";
}

echo "\n=== TESTE CONCLUÍDO ===\n";
echo "</pre>";
?>