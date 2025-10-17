<?php
session_start();
header('Content-Type: application/json');

// Modo de desenvolvimento
require_once '../config/dev.php';

// Log de debug
error_log("🔍 API Anamnesis - Método: " . $_SERVER['REQUEST_METHOD']);
error_log("🔍 API Anamnesis - Session user_id: " . ($_SESSION['user_id'] ?? 'não definido'));
error_log("🔍 API Anamnesis - DEVELOPMENT_MODE: " . (DEVELOPMENT_MODE ? 'ATIVADO' : 'DESATIVADO'));

if (!isAuthenticated()) {
    error_log("❌ API Anamnesis - Usuário não autorizado");
    http_response_code(401);
    echo json_encode(['error' => 'Não autorizado', 'debug' => 'Usuário não logado']);
    exit;
}

require_once '../config/database.php';
require_once '../classes/PatientAnamnesis.php';

try {
    $database = new Database();
    $db = $database->connect();
    $anamnesis = new PatientAnamnesis($db);
    error_log("✅ API Anamnesis - Conexão com banco estabelecida");
} catch (Exception $e) {
    error_log("❌ API Anamnesis - Erro na conexão: " . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => 'Erro interno do servidor', 
        'debug' => 'Falha na conexão com o banco de dados: ' . $e->getMessage()
    ]);
    exit;
}

$method = $_SERVER['REQUEST_METHOD'];
$user_id = getCurrentUserId();
error_log("🔍 API Anamnesis - User ID sendo usado: " . $user_id);

switch($method) {
    case 'GET':
        if (isset($_GET['patient_id'])) {
            $patient_id = $_GET['patient_id'];
            error_log("🔍 API Anamnesis GET - Buscando anamnese para patient_id: " . $patient_id);
            
            try {
                if ($anamnesis->readByPatient($patient_id, $user_id)) {
                    error_log("✅ API Anamnesis GET - Anamnese encontrada");
                    echo json_encode([
                        'id' => $anamnesis->id,
                        'patient_id' => $anamnesis->patient_id,
                        'complaint' => $anamnesis->complaint,
                        'history_illness' => $anamnesis->history_illness,
                        'previous_treatments' => $anamnesis->previous_treatments,
                        'medications' => $anamnesis->medications,
                        'family_history' => $anamnesis->family_history,
                        'personal_history' => $anamnesis->personal_history,
                        'social_history' => $anamnesis->social_history,
                        'observations' => $anamnesis->observations,
                        'created_at' => $anamnesis->created_at,
                        'updated_at' => $anamnesis->updated_at
                    ]);
                } else {
                    error_log("ℹ️ API Anamnesis GET - Anamnese não encontrada, retornando estrutura vazia");
                    // Retorna estrutura vazia se não houver anamnese
                    echo json_encode([
                        'id' => null,
                        'patient_id' => $patient_id,
                        'complaint' => '',
                        'history_illness' => '',
                        'previous_treatments' => '',
                        'medications' => '',
                        'family_history' => '',
                        'personal_history' => '',
                        'social_history' => '',
                        'observations' => ''
                    ]);
                }
            } catch (Exception $e) {
                error_log("❌ API Anamnesis GET - Erro ao buscar: " . $e->getMessage());
                http_response_code(500);
                echo json_encode([
                    'error' => 'Erro ao buscar anamnese', 
                    'debug' => $e->getMessage()
                ]);
            }
        } else {
            error_log("❌ API Anamnesis GET - Patient ID não fornecido");
            http_response_code(400);
            echo json_encode(['error' => 'ID do paciente não fornecido', 'debug' => 'Parâmetro patient_id é obrigatório']);
        }
        break;

    case 'POST':
        // Criar ou atualizar anamnese
        $rawInput = file_get_contents("php://input");
        error_log("🔍 API Anamnesis POST - Raw input: " . $rawInput);
        
        $data = json_decode($rawInput);
        
        if (!$data || !isset($data->patient_id)) {
            error_log("❌ API Anamnesis POST - Dados inválidos ou patient_id ausente");
            http_response_code(400);
            echo json_encode([
                'success' => false, 
                'message' => 'Dados inválidos', 
                'debug' => 'patient_id é obrigatório'
            ]);
            break;
        }
        
        error_log("🔍 API Anamnesis POST - Salvando anamnese para patient_id: " . $data->patient_id);
        
        try {
            $anamnesis->user_id = $user_id;
            $anamnesis->patient_id = $data->patient_id;
            $anamnesis->complaint = $data->complaint ?? '';
            $anamnesis->history_illness = $data->history_illness ?? '';
            $anamnesis->previous_treatments = $data->previous_treatments ?? '';
            $anamnesis->medications = $data->medications ?? '';
            $anamnesis->family_history = $data->family_history ?? '';
            $anamnesis->personal_history = $data->personal_history ?? '';
            $anamnesis->social_history = $data->social_history ?? '';
            $anamnesis->observations = $data->observations ?? '';

            if ($anamnesis->createOrUpdate()) {
                error_log("✅ API Anamnesis POST - Anamnese salva com sucesso");
                echo json_encode(['success' => true, 'message' => 'Anamnese salva com sucesso']);
            } else {
                error_log("❌ API Anamnesis POST - Falha ao salvar no banco");
                http_response_code(500);
                echo json_encode([
                    'success' => false, 
                    'message' => 'Erro ao salvar anamnese',
                    'debug' => 'Falha na operação do banco de dados'
                ]);
            }
        } catch (Exception $e) {
            error_log("❌ API Anamnesis POST - Exceção: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false, 
                'message' => 'Erro interno do servidor',
                'debug' => $e->getMessage()
            ]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Método não permitido']);
        break;
}
?>