<?php
session_start();
header('Content-Type: application/json');

require_once '../config/dev.php';

error_log("===============================================");
error_log("🔍 [APPOINTMENTS] Método: " . $_SERVER['REQUEST_METHOD']);
error_log("🔍 [APPOINTMENTS] Query String: " . ($_SERVER['QUERY_STRING'] ?? 'vazio'));

if (!isAuthenticated()) {
    error_log("❌ [APPOINTMENTS] Não autorizado");
    http_response_code(401);
    echo json_encode(['error' => 'Não autorizado']);
    exit;
}

require_once '../config/database.php';
require_once '../classes/Appointment.php';

$database = new Database();
$db = $database->connect();
$appointment = new Appointment($db);
$method = $_SERVER['REQUEST_METHOD'];
$user_id = getCurrentUserId();

error_log("✅ [APPOINTMENTS] User ID: $user_id");

switch($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            $appointment_id = $_GET['id'];
            error_log("🔍 [APPOINTMENTS GET] ID: $appointment_id");
            
            if ($appointment->readOne($appointment_id, $user_id)) {
                echo json_encode([
                    'id' => $appointment->id,
                    'patient_id' => $appointment->patient_id,
                    'appointment_date' => $appointment->appointment_date,
                    'appointment_time' => $appointment->appointment_time,
                    'duration' => $appointment->duration,
                    'amount' => $appointment->amount,
                    'notes' => $appointment->notes,
                    'status' => $appointment->status
                ]);
            } else {
                error_log("❌ [APPOINTMENTS GET] Não encontrado");
                http_response_code(404);
                echo json_encode(['error' => 'Consulta não encontrada']);
            }
        } else if (isset($_GET['date'])) {
            $date = $_GET['date'];
            error_log("🔍 [APPOINTMENTS GET] Data: $date");
            
            $stmt = $appointment->readByDate($user_id, $date);
            $appointments = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            error_log("✅ [APPOINTMENTS GET] " . count($appointments) . " consultas");
            echo json_encode($appointments);
        } else if (isset($_GET['upcoming'])) {
            $limit = (int)$_GET['upcoming'];
            $stmt = $appointment->getUpcoming($user_id, $limit);
            $appointments = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($appointments);
        } else if (isset($_GET['stats'])) {
            $stats = $appointment->getStats($user_id);
            echo json_encode($stats);
        } else {
            $stmt = $appointment->read($user_id);
            $appointments = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($appointments);
        }
        break;

    case 'POST':
        error_log("🔵 [APPOINTMENTS POST] Criando");
        
        $data = json_decode(file_get_contents("php://input"));

        if (!$data) {
            error_log("❌ [APPOINTMENTS POST] JSON inválido");
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Dados inválidos']);
            break;
        }

        error_log("📝 Dados: " . json_encode($data));

        $appointment->user_id = $user_id;
        $appointment->patient_id = $data->patient_id ?? '';
        $appointment->appointment_date = $data->appointment_date ?? '';
        $appointment->appointment_time = $data->appointment_time ?? '';
        $appointment->duration = $data->duration ?? 50;
        $appointment->amount = $data->amount ?? 0;
        $appointment->notes = $data->notes ?? '';
        $appointment->status = 'scheduled';

        if (empty($appointment->patient_id) || empty($appointment->appointment_date) || empty($appointment->appointment_time)) {
            error_log("❌ [APPOINTMENTS POST] Campos obrigatórios faltando");
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Campos obrigatórios faltando']);
            break;
        }

        if ($appointment->create()) {
            error_log("✅ [APPOINTMENTS POST] Criada");
            error_log("===============================================");
            echo json_encode(['success' => true, 'message' => 'Consulta agendada com sucesso']);
        } else {
            error_log("❌ [APPOINTMENTS POST] Falhou");
            error_log("===============================================");
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Erro ao criar consulta']);
        }
        break;

    case 'PUT':
        error_log("🔵 [APPOINTMENTS PUT] Atualizando");
        
        if (!isset($_GET['id'])) {
            error_log("❌ [APPOINTMENTS PUT] ID ausente");
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID não fornecido']);
            break;
        }

        $appointment_id = $_GET['id'];
        error_log("📝 ID: $appointment_id");
        
        // Buscar appointment existente
        if (!$appointment->readOne($appointment_id, $user_id)) {
            error_log("❌ [APPOINTMENTS PUT] Não encontrada");
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Consulta não encontrada']);
            break;
        }

        // Pegar dados do body
        $rawInput = file_get_contents("php://input");
        error_log("📝 Raw input: " . $rawInput);
        
        $data = json_decode($rawInput);
        
        if (!$data) {
            error_log("❌ [APPOINTMENTS PUT] JSON inválido");
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Dados inválidos']);
            break;
        }

        error_log("📝 Dados JSON: " . json_encode($data));

        // Atualizar campos recebidos
        if (isset($data->status)) {
            error_log("🔄 Atualizando status: " . $data->status);
            $appointment->status = $data->status;
        }
        if (isset($data->patient_id)) $appointment->patient_id = $data->patient_id;
        if (isset($data->appointment_date)) $appointment->appointment_date = $data->appointment_date;
        if (isset($data->appointment_time)) $appointment->appointment_time = $data->appointment_time;
        if (isset($data->duration)) $appointment->duration = $data->duration;
        if (isset($data->amount)) $appointment->amount = $data->amount;
        if (isset($data->notes)) $appointment->notes = $data->notes;

        // Executar update
        if ($appointment->update()) {
            error_log("✅ [APPOINTMENTS PUT] Atualizada com sucesso");
            error_log("===============================================");
            echo json_encode(['success' => true, 'message' => 'Consulta atualizada com sucesso']);
        } else {
            error_log("❌ [APPOINTMENTS PUT] Falha no update");
            error_log("===============================================");
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Erro ao atualizar consulta']);
        }
        break;

    case 'DELETE':
        error_log("🔵 [APPOINTMENTS DELETE]");
        
        if (!isset($_GET['id'])) {
            error_log("❌ [APPOINTMENTS DELETE] ID ausente");
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID não fornecido']);
            break;
        }

        $appointment_id = $_GET['id'];
        $appointment->id = $appointment_id;
        $appointment->user_id = $user_id;

        if ($appointment->delete()) {
            error_log("✅ [APPOINTMENTS DELETE] Deletada");
            error_log("===============================================");
            echo json_encode(['success' => true, 'message' => 'Consulta excluída']);
        } else {
            error_log("❌ [APPOINTMENTS DELETE] Falhou");
            error_log("===============================================");
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Erro ao excluir']);
        }
        break;

    default:
        error_log("❌ [APPOINTMENTS] Método não permitido: $method");
        http_response_code(405);
        echo json_encode(['error' => 'Método não permitido']);
        break;
}
?>