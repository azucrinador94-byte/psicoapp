<?php
session_start();
header('Content-Type: application/json');

require_once '../config/dev.php';

if (!isAuthenticated()) {
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

switch($method) {
    case 'GET':
        if (isset($_GET['id'])) {
            $appointment_id = $_GET['id'];
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
                http_response_code(404);
                echo json_encode(['error' => 'Consulta não encontrada']);
            }
        } else if (isset($_GET['date'])) {
            $date = $_GET['date'];
            $stmt = $appointment->readByDate($user_id, $date);
            $appointments = $stmt->fetchAll(PDO::FETCH_ASSOC);
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
        $data = json_decode(file_get_contents("php://input"));

        if (!$data) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Dados inválidos']);
            break;
        }

        // Check if amount column exists before setting it
        $columnCheck = "SHOW COLUMNS FROM appointments LIKE 'amount'";
        $checkStmt = $db->prepare($columnCheck);
        $checkStmt->execute();
        $hasAmountColumn = $checkStmt->rowCount() > 0;

        $appointment->user_id = $user_id;
        $appointment->patient_id = $data->patient_id ?? '';
        $appointment->appointment_date = $data->appointment_date ?? '';
        $appointment->appointment_time = $data->appointment_time ?? '';
        $appointment->duration = $data->duration ?? 50;
        if ($hasAmountColumn) {
            $appointment->amount = $data->amount ?? 0;
        }
        $appointment->notes = $data->notes ?? '';
        $appointment->status = 'scheduled';

        if (empty($appointment->patient_id) || empty($appointment->appointment_date) || empty($appointment->appointment_time)) {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'Todos os campos obrigatórios devem ser preenchidos']);
            break;
        }

        if ($appointment->create()) {
            echo json_encode(['success' => true, 'message' => 'Consulta agendada com sucesso']);
        } else {
            http_response_code(500);
            $errorArr = $appointment->getLastError();
            $msgErro = isset($errorArr['full_message']) ? $errorArr['full_message'] : (isset($errorArr['message']) ? $errorArr['message'] : 'Erro desconhecido');
            echo json_encode([
                'success' => false,
                'message' => 'Erro ao agendar consulta: ' . $msgErro
            ]);
        }
        break;

    // Atualize também os blocos PUT e DELETE se precisar do mesmo tratamento de erro.

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Método não permitido']);
        break;
}
?>
