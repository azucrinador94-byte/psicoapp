<?php
session_start();
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type');

error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once '../config/dev.php';
require_once '../config/database.php';
require_once '../classes/Patient.php';

// Autenticação
if (defined('DEVELOPMENT_MODE') && DEVELOPMENT_MODE === true) {
    if (!isset($_SESSION['user_id']) && defined('DEV_USER_ID')) {
        $_SESSION['user_id'] = DEV_USER_ID;
    }
}

$user_id = $_SESSION['user_id'] ?? null;

if (!$user_id) {
    http_response_code(401);
    echo json_encode([
        'success' => false, 
        'error' => 'Não autorizado',
        'debug' => [
            'session_id' => session_id(),
            'session_data' => $_SESSION,
            'dev_mode' => defined('DEVELOPMENT_MODE') ? DEVELOPMENT_MODE : 'não definido'
        ]
    ]);
    exit;
}

error_log("=== PATIENTS API ===");
error_log("User ID: $user_id");
error_log("Method: " . $_SERVER['REQUEST_METHOD']);
error_log("Query: " . ($_SERVER['QUERY_STRING'] ?? 'vazio'));

$database = new Database();
$db = $database->connect();
$patient = new Patient($db);

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        try {
            if (isset($_GET['id'])) {
                // Get single patient
                $patient_id = $_GET['id'];
                error_log("Buscando paciente ID: $patient_id para user: $user_id");
                
                if ($patient->readOne($patient_id, $user_id)) {
                    echo json_encode([
                        'id' => $patient->id,
                        'name' => $patient->name,
                        'email' => $patient->email,
                        'phone' => $patient->phone,
                        'birth_date' => $patient->birth_date,
                        'notes' => $patient->notes,
                        'status' => $patient->status,
                        'created_at' => $patient->created_at,
                        'updated_at' => $patient->updated_at
                    ]);
                } else {
                    http_response_code(404);
                    echo json_encode(['success' => false, 'error' => 'Paciente não encontrado']);
                }
            } else if (isset($_GET['search']) && !empty($_GET['search'])) {
                // Search patients
                $search_term = $_GET['search'];
                error_log("Buscando pacientes com termo: $search_term");
                
                $stmt = $patient->search($user_id, $search_term);
                $patients = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                error_log("Pacientes encontrados: " . count($patients));
                echo json_encode($patients);
            } else {
                // Get all patients
                error_log("Listando todos os pacientes do user: $user_id");
                
                $stmt = $patient->read($user_id);
                $patients = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                error_log("Total de pacientes: " . count($patients));
                echo json_encode($patients);
            }
        } catch (Exception $e) {
            error_log("ERRO GET: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false,
                'error' => 'Erro ao buscar pacientes',
                'details' => $e->getMessage()
            ]);
        }
        break;

    case 'POST':
        try {
            // Detectar tipo de conteúdo
            $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
            error_log("Content-Type: $contentType");
            
            if (strpos($contentType, 'application/json') !== false) {
                // JSON
                $rawInput = file_get_contents('php://input');
                error_log("Raw JSON: $rawInput");
                
                $input = json_decode($rawInput, true);
                
                if (json_last_error() !== JSON_ERROR_NONE) {
                    throw new Exception('JSON inválido: ' . json_last_error_msg());
                }
                
                $data = $input;
            } else {
                // FormData
                $data = $_POST;
            }
            
            error_log("Dados recebidos: " . print_r($data, true));
            
            $patient->user_id = $user_id;
            $patient->name = $data['name'] ?? '';
            $patient->email = $data['email'] ?? '';
            $patient->phone = $data['phone'] ?? '';
            $patient->birth_date = $data['birth_date'] ?? '';
            $patient->notes = $data['notes'] ?? '';
            $patient->status = $data['status'] ?? 'active';

            // Validação
            if (empty($patient->name)) {
                throw new Exception('Nome é obrigatório');
            }
            if (empty($patient->email)) {
                throw new Exception('Email é obrigatório');
            }
            if (empty($patient->phone)) {
                throw new Exception('Telefone é obrigatório');
            }
            if (empty($patient->birth_date)) {
                throw new Exception('Data de nascimento é obrigatória');
            }

            error_log("Tentando criar paciente: {$patient->name}");
            $result = $patient->create();
            
            error_log("Resultado do create(): " . var_export($result, true));
            
            if ($result) {
                $patient_id = is_numeric($result) ? $result : $db->lastInsertId();
                
                error_log("Paciente criado com ID: $patient_id");
                
                echo json_encode([
                    'success' => true, 
                    'message' => 'Paciente criado com sucesso',
                    'patient_id' => $patient_id
                ]);
            } else {
                throw new Exception('Falha ao executar create()');
            }
        } catch (Exception $e) {
            error_log("ERRO POST: " . $e->getMessage());
            error_log("Stack trace: " . $e->getTraceAsString());
            
            http_response_code(500);
            echo json_encode([
                'success' => false, 
                'message' => $e->getMessage(),
                'error_info' => $db->errorInfo()
            ]);
        }
        break;

    case 'PUT':
        try {
            if (!isset($_GET['id'])) {
                throw new Exception('ID do paciente não fornecido');
            }

            $patient_id = $_GET['id'];
            
            if (!$patient->readOne($patient_id, $user_id)) {
                http_response_code(404);
                echo json_encode(['success' => false, 'message' => 'Paciente não encontrado']);
                break;
            }

            // Verificar se é para alternar status
            if (isset($_GET['action']) && $_GET['action'] === 'toggle-status') {
                error_log("🔄 Toggle status para paciente ID: $patient_id");
                
                if ($patient->toggleStatus()) {
                    echo json_encode([
                        'success' => true, 
                        'message' => 'Status alterado com sucesso',
                        'new_status' => $patient->status
                    ]);
                } else {
                    throw new Exception('Falha ao alternar status');
                }
                break;
            }

            // Atualização normal
            $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
            
            if (strpos($contentType, 'application/json') !== false) {
                $input = json_decode(file_get_contents('php://input'), true);
                $data = $input;
            } else {
                parse_str(file_get_contents("php://input"), $data);
                if (empty($data)) {
                    $data = $_POST;
                }
            }
            
            error_log("PUT dados: " . print_r($data, true));
            
            $patient->name = $data['name'] ?? $patient->name;
            $patient->email = $data['email'] ?? $patient->email;
            $patient->phone = $data['phone'] ?? $patient->phone;
            $patient->birth_date = $data['birth_date'] ?? $patient->birth_date;
            $patient->notes = $data['notes'] ?? $patient->notes;
            $patient->status = $data['status'] ?? $patient->status;

            if ($patient->update()) {
                echo json_encode(['success' => true, 'message' => 'Paciente atualizado com sucesso']);
            } else {
                throw new Exception('Falha ao atualizar paciente');
            }
        } catch (Exception $e) {
            error_log("ERRO PUT: " . $e->getMessage());
            http_response_code(500);
            echo json_encode([
                'success' => false, 
                'message' => $e->getMessage()
            ]);
        }
        break;

    case 'DELETE':
        try {
            if (!isset($_GET['id'])) {
                throw new Exception('ID do paciente não fornecido');
            }

            $patient_id = $_GET['id'];
            $patient->id = $patient_id;
            $patient->user_id = $user_id;

            error_log("Deletando paciente ID: $patient_id");

            if ($patient->delete()) {
                echo json_encode(['success' => true, 'message' => 'Paciente excluído com sucesso']);
            } else {
                throw new Exception('Falha ao excluir paciente');
            }
        } catch (Exception $e) {
            error_log("ERRO DELETE: " . $e->getMessage());
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Método não permitido']);
        break;
}
?>