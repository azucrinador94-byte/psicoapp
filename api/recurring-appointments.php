<?php
session_start();
header('Content-Type: application/json');

require_once '../config/dev.php';

error_log("===============================================");
error_log("🔍 [RECURRING APPOINTMENTS] Método: " . $_SERVER['REQUEST_METHOD']);

if (!isAuthenticated()) {
    error_log("❌ [RECURRING APPOINTMENTS] Não autorizado");
    http_response_code(401);
    echo json_encode(['error' => 'Não autorizado']);
    exit;
}

require_once '../config/database.php';
require_once '../classes/Appointment.php';

try {
    $database = new Database();
    $db = $database->connect();
    $user_id = getCurrentUserId();
    
    error_log("✅ [RECURRING APPOINTMENTS] User ID: $user_id");
    
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        throw new Exception('Método não permitido');
    }
    
    $rawInput = file_get_contents("php://input");
    error_log("📝 Raw input: " . $rawInput);
    
    $data = json_decode($rawInput);
    
    if (!$data) {
        throw new Exception('Dados inválidos');
    }
    
    // Validar campos obrigatórios
    if (empty($data->patient_id) || empty($data->start_date) || empty($data->time) || empty($data->frequency) || empty($data->count)) {
        throw new Exception('Campos obrigatórios faltando');
    }
    
    $patientId = $data->patient_id;
    $startDate = $data->start_date;
    $time = $data->time;
    $frequency = (int)$data->frequency;
    $count = (int)$data->count;
    $duration = (int)($data->duration ?? 50);
    $amount = isset($data->amount) ? floatval($data->amount) : 100;
    $notes = $data->notes ?? '';
    
    error_log("📊 Parâmetros:");
    error_log("   - patient_id: $patientId");
    error_log("   - start_date: $startDate");
    error_log("   - time: $time");
    error_log("   - frequency: $frequency dias");
    error_log("   - count: $count consultas");
    error_log("   - amount: R$ $amount");
    
    // Validar quantidade
    if ($count < 2 || $count > 20) {
        throw new Exception('A quantidade de consultas deve estar entre 2 e 20');
    }
    
    // Validar frequência
    if (!in_array($frequency, [7, 15, 30])) {
        throw new Exception('Frequência inválida. Use 7, 15 ou 30 dias');
    }
    
    // Criar consultas
    $appointment = new Appointment($db);
    $createdCount = 0;
    $errors = [];
    
    $currentDate = new DateTime($startDate);
    
    for ($i = 0; $i < $count; $i++) {
        $appointment->user_id = $user_id;
        $appointment->patient_id = $patientId;
        $appointment->appointment_date = $currentDate->format('Y-m-d');
        $appointment->appointment_time = $time;
        $appointment->duration = $duration;
        $appointment->amount = $amount;
        $appointment->notes = $notes . ($i > 0 ? " (Recorrência $i)" : " (Primeira consulta)");
        $appointment->status = 'scheduled';
        
        error_log("📅 Criando consulta " . ($i + 1) . ": " . $appointment->appointment_date . " " . $appointment->appointment_time);
        
        if ($appointment->create()) {
            $createdCount++;
            error_log("   ✅ Consulta " . ($i + 1) . " criada com ID: " . $appointment->id);
        } else {
            $errors[] = "Falha ao criar consulta " . ($i + 1) . " em " . $appointment->appointment_date;
            error_log("   ❌ Falha ao criar consulta " . ($i + 1));
        }
        
        // Avançar para a próxima data
        $currentDate->modify("+{$frequency} days");
    }
    
    if ($createdCount > 0) {
        error_log("✅ Total criado: $createdCount de $count consultas");
        error_log("===============================================");
        
        $response = [
            'success' => true,
            'message' => "$createdCount consultas criadas com sucesso",
            'created_count' => $createdCount,
            'total_count' => $count
        ];
        
        if (count($errors) > 0) {
            $response['warnings'] = $errors;
        }
        
        echo json_encode($response);
    } else {
        throw new Exception('Nenhuma consulta pôde ser criada');
    }
    
} catch (Exception $e) {
    error_log("❌ [RECURRING APPOINTMENTS] EXCEÇÃO: " . $e->getMessage());
    error_log("   Stack: " . $e->getTraceAsString());
    error_log("===============================================");
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erro ao criar consultas recorrentes',
        'message' => DEVELOPMENT_MODE ? $e->getMessage() : 'Erro ao processar requisição'
    ]);
}
?>