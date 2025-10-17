<?php
session_start();
header('Content-Type: application/json');

// Modo de desenvolvimento
require_once '../config/dev.php';

error_log("🔍 API Consultation History - DEVELOPMENT_MODE: " . (DEVELOPMENT_MODE ? 'ATIVADO' : 'DESATIVADO'));

if (!isAuthenticated()) {
    http_response_code(401);
    echo json_encode(['error' => 'Não autorizado']);
    exit;
}

require_once '../config/database.php';
require_once '../classes/ConsultationHistory.php';

$database = new Database();
$db = $database->connect();
$history = new ConsultationHistory($db);

$method = $_SERVER['REQUEST_METHOD'];
$user_id = getCurrentUserId();
error_log("🔍 API Consultation History - User ID sendo usado: " . $user_id);

switch($method) {
    case 'GET':
        if (isset($_GET['patient_id'])) {
            // Buscar histórico por paciente
            $patient_id = $_GET['patient_id'];
            $stmt = $history->readByPatient($patient_id, $user_id);
            $sessions = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Obter estatísticas
            $stats = $history->getPatientStats($patient_id, $user_id);
            
            echo json_encode([
                'sessions' => $sessions,
                'stats' => $stats
            ]);
        } else if (isset($_GET['id'])) {
            // Buscar sessão específica
            $session_id = $_GET['id'];
            if ($history->readOne($session_id, $user_id)) {
                echo json_encode([
                    'id' => $history->id,
                    'patient_id' => $history->patient_id,
                    'appointment_id' => $history->appointment_id,
                    'session_number' => $history->session_number,
                    'session_date' => $history->session_date,
                    'session_notes' => $history->session_notes,
                    'observations' => $history->observations,
                    'homework' => $history->homework,
                    'next_session_goals' => $history->next_session_goals,
                    'patient_mood' => $history->patient_mood,
                    'session_duration' => $history->session_duration
                ]);
            } else {
                http_response_code(404);
                echo json_encode(['error' => 'Sessão não encontrada']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['error' => 'Parâmetros inválidos']);
        }
        break;

    case 'POST':
        // Criar novo registro de consulta
        $data = json_decode(file_get_contents("php://input"));
        
        if (!$data || !isset($data->patient_id)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Dados inválidos']);
            break;
        }
        
        $history->user_id = $user_id;
        $history->patient_id = $data->patient_id;
        $history->appointment_id = $data->appointment_id ?? null;
        $history->session_date = $data->session_date ?? date('Y-m-d');
        $history->session_notes = $data->session_notes ?? '';
        $history->observations = $data->observations ?? '';
        $history->homework = $data->homework ?? '';
        $history->next_session_goals = $data->next_session_goals ?? '';
        $history->patient_mood = $data->patient_mood ?? 'neutral';
        $history->session_duration = $data->session_duration ?? 50;

        if ($history->create()) {
            echo json_encode(['success' => true, 'message' => 'Registro de consulta criado com sucesso']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Erro ao criar registro de consulta']);
        }
        break;

    case 'PUT':
        // Atualizar registro de consulta
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'ID da sessão não fornecido']);
            break;
        }

        $session_id = $_GET['id'];
        if (!$history->readOne($session_id, $user_id)) {
            http_response_code(404);
            echo json_encode(['success' => false, 'message' => 'Sessão não encontrada']);
            break;
        }

        $data = json_decode(file_get_contents("php://input"));
        if (!$data) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Dados inválidos']);
            break;
        }
        
        $history->session_notes = $data->session_notes ?? $history->session_notes;
        $history->observations = $data->observations ?? $history->observations;
        $history->homework = $data->homework ?? $history->homework;
        $history->next_session_goals = $data->next_session_goals ?? $history->next_session_goals;
        $history->patient_mood = $data->patient_mood ?? $history->patient_mood;
        $history->session_duration = $data->session_duration ?? $history->session_duration;

        if ($history->update()) {
            echo json_encode(['success' => true, 'message' => 'Registro de consulta atualizado com sucesso']);
        } else {
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => 'Erro ao atualizar registro de consulta']);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Método não permitido']);
        break;
}
?>