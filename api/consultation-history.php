<?php
session_start();
header('Content-Type: application/json');

require_once '../config/dev.php';

error_log("===============================================");
error_log("🔍 [CONSULTATION HISTORY] Método: " . $_SERVER['REQUEST_METHOD']);
error_log("🔍 [CONSULTATION HISTORY] Query: " . ($_SERVER['QUERY_STRING'] ?? 'vazio'));

if (!isAuthenticated()) {
    error_log("❌ [CONSULTATION HISTORY] Não autorizado");
    http_response_code(401);
    echo json_encode(['error' => 'Não autorizado']);
    exit;
}

require_once '../config/database.php';
require_once '../classes/ConsultationHistory.php';

try {
    $database = new Database();
    $db = $database->connect();
    $consultation = new ConsultationHistory($db);
    $method = $_SERVER['REQUEST_METHOD'];
    $user_id = getCurrentUserId();

    error_log("✅ [CONSULTATION HISTORY] User ID: $user_id");

    switch($method) {
        case 'GET':
            if (isset($_GET['id'])) {
                // Buscar sessão específica
                $session_id = $_GET['id'];
                error_log("🔍 [GET] Buscando sessão ID: $session_id");
                
                if ($consultation->readOne($session_id, $user_id)) {
                    error_log("✅ [GET] Sessão encontrada:");
                    error_log("   - session_date: " . $consultation->session_date);
                    error_log("   - patient_mood: " . $consultation->patient_mood);
                    error_log("   - session_number: " . ($consultation->session_number ?? 'N/A'));
                    
                    $response = [
                        'id' => $consultation->id,
                        'patient_id' => $consultation->patient_id,
                        'appointment_id' => $consultation->appointment_id,
                        'session_date' => $consultation->session_date,
                        'session_duration' => $consultation->session_duration,
                        'patient_mood' => $consultation->patient_mood,
                        'session_notes' => $consultation->session_notes,
                        'observations' => $consultation->observations,
                        'homework' => $consultation->homework,
                        'next_session_goals' => $consultation->next_session_goals,
                        'session_number' => $consultation->session_number ?? null
                    ];
                    
                    error_log("📤 [GET] Resposta: " . json_encode($response));
                    echo json_encode($response);
                } else {
                    error_log("❌ [GET] Sessão não encontrada");
                    http_response_code(404);
                    echo json_encode(['error' => 'Sessão não encontrada']);
                }
                
            } else if (isset($_GET['patient_id'])) {
                // Buscar histórico do paciente
                $patient_id = $_GET['patient_id'];
                error_log("🔍 [GET] Buscando histórico do paciente ID: $patient_id");
                
                $stmt = $consultation->readByPatient($patient_id, $user_id);
                $sessions = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                // Calcular estatísticas
                $total_sessions = count($sessions);
                $last_session = $total_sessions > 0 ? $sessions[0]['session_date'] : null;
                
                $total_duration = 0;
                foreach ($sessions as $session) {
                    $total_duration += $session['session_duration'];
                }
                $avg_duration = $total_sessions > 0 ? $total_duration / $total_sessions : 50;
                
                $stats = [
                    'total_sessions' => $total_sessions,
                    'last_session' => $last_session,
                    'avg_duration' => round($avg_duration)
                ];
                
                error_log("✅ [GET] Encontradas $total_sessions sessões");
                
                echo json_encode([
                    'sessions' => $sessions,
                    'stats' => $stats
                ]);
            }
            break;

        case 'POST':
            error_log("🔵 [POST] Criando nova sessão");
            
            $rawInput = file_get_contents("php://input");
            error_log("📝 Raw input: " . $rawInput);
            
            $data = json_decode($rawInput);

            if (!$data) {
                error_log("❌ JSON inválido");
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Dados inválidos']);
                break;
            }

            $consultation->user_id = $user_id;
            $consultation->patient_id = $data->patient_id ?? '';
            $consultation->appointment_id = $data->appointment_id ?? null;
            
            // Corrigir data
            if (isset($data->session_date)) {
                $session_date = $data->session_date;
                
                if (strpos($session_date, 'T') !== false) {
                    $session_date = explode('T', $session_date)[0];
                }
                if (strpos($session_date, ' ') !== false) {
                    $session_date = explode(' ', $session_date)[0];
                }
                
                error_log("🔄 Data recebida: " . $data->session_date);
                error_log("🔄 Data limpa: " . $session_date);
                
                $consultation->session_date = $session_date;
            } else {
                $consultation->session_date = date('Y-m-d');
            }
            
            $consultation->session_duration = $data->session_duration ?? 50;
            $consultation->patient_mood = $data->patient_mood ?? 'neutral';
            $consultation->session_notes = $data->session_notes ?? '';
            $consultation->observations = $data->observations ?? '';
            $consultation->homework = $data->homework ?? '';
            $consultation->next_session_goals = $data->next_session_goals ?? '';

            error_log("📝 Dados para criar:");
            error_log("   - patient_id: " . $consultation->patient_id);
            error_log("   - session_date: " . $consultation->session_date);
            error_log("   - patient_mood: " . $consultation->patient_mood);

            if (empty($consultation->patient_id)) {
                error_log("❌ Patient ID ausente");
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'ID do paciente é obrigatório']);
                break;
            }

            if ($consultation->create()) {
                error_log("✅ Sessão criada com sucesso");
                error_log("===============================================");
                echo json_encode(['success' => true, 'message' => 'Sessão salva com sucesso']);
            } else {
                error_log("❌ Falha ao criar");
                error_log("===============================================");
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Erro ao salvar sessão']);
            }
            break;

        case 'PUT':
            error_log("🔵 [PUT] Atualizando sessão");
            
            if (!isset($_GET['id'])) {
                error_log("❌ ID ausente");
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'ID não fornecido']);
                break;
            }

            $session_id = $_GET['id'];
            error_log("📝 Session ID: $session_id");
            
            if (!$consultation->readOne($session_id, $user_id)) {
                error_log("❌ Sessão não encontrada");
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Sessão não encontrada']);
                break;
            }

            error_log("📝 ANTES do update:");
            error_log("   - session_date: " . $consultation->session_date);
            error_log("   - patient_mood: " . $consultation->patient_mood);

            $rawInput = file_get_contents("php://input");
            error_log("📝 Raw input: " . $rawInput);
            
            $data = json_decode($rawInput);
            
            if (!$data) {
                error_log("❌ JSON inválido");
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'Dados inválidos']);
                break;
            }

            // Atualizar campos recebidos
            if (isset($data->patient_id)) $consultation->patient_id = $data->patient_id;
            if (isset($data->appointment_id)) $consultation->appointment_id = $data->appointment_id;
            
            // Corrigir data
            if (isset($data->session_date)) {
                $session_date = $data->session_date;
                
                if (strpos($session_date, 'T') !== false) {
                    $session_date = explode('T', $session_date)[0];
                }
                if (strpos($session_date, ' ') !== false) {
                    $session_date = explode(' ', $session_date)[0];
                }
                
                error_log("🔄 Data recebida: " . $data->session_date);
                error_log("🔄 Data limpa: " . $session_date);
                
                $consultation->session_date = $session_date;
            }
            
            if (isset($data->session_duration)) $consultation->session_duration = $data->session_duration;
            if (isset($data->patient_mood)) {
                error_log("🔄 Atualizando patient_mood: " . $data->patient_mood);
                $consultation->patient_mood = $data->patient_mood;
            }
            if (isset($data->session_notes)) $consultation->session_notes = $data->session_notes;
            if (isset($data->observations)) $consultation->observations = $data->observations;
            if (isset($data->homework)) $consultation->homework = $data->homework;
            if (isset($data->next_session_goals)) $consultation->next_session_goals = $data->next_session_goals;

            error_log("📝 DEPOIS das atribuições:");
            error_log("   - session_date: " . $consultation->session_date);
            error_log("   - patient_mood: " . $consultation->patient_mood);

            if ($consultation->update()) {
                error_log("✅ Sessão atualizada com sucesso");
                error_log("===============================================");
                echo json_encode(['success' => true, 'message' => 'Sessão atualizada com sucesso']);
            } else {
                error_log("❌ Falha ao atualizar");
                error_log("===============================================");
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Erro ao atualizar sessão']);
            }
            break;

        case 'DELETE':
            error_log("🔵 [DELETE] Deletando sessão");
            
            if (!isset($_GET['id'])) {
                error_log("❌ ID ausente");
                http_response_code(400);
                echo json_encode(['success' => false, 'message' => 'ID não fornecido']);
                break;
            }

            $session_id = $_GET['id'];
            error_log("📝 Session ID: $session_id");
            
            $consultation->id = $session_id;
            $consultation->user_id = $user_id;

            if ($consultation->delete()) {
                error_log("✅ Sessão deletada com sucesso");
                error_log("===============================================");
                echo json_encode(['success' => true, 'message' => 'Sessão excluída com sucesso']);
            } else {
                error_log("❌ Falha ao deletar");
                error_log("===============================================");
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Erro ao excluir sessão']);
            }
            break;

        default:
            error_log("❌ Método não permitido: $method");
            http_response_code(405);
            echo json_encode(['error' => 'Método não permitido']);
            break;
    }
} catch (Exception $e) {
    error_log("❌ [CONSULTATION HISTORY] EXCEÇÃO: " . $e->getMessage());
    error_log("   Stack: " . $e->getTraceAsString());
    error_log("===============================================");
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => 'Erro interno',
        'message' => DEVELOPMENT_MODE ? $e->getMessage() : 'Erro ao processar requisição'
    ]);
}
?>