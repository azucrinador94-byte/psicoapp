<?php
session_start();
header('Content-Type: application/json');

// Verificar se o usuário está logado
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Usuário não autenticado']);
    exit;
}

require_once '../config/database.php';
require_once '../classes/PatientPricing.php';

$database = new Database();
$db = $database->getConnection();
$pricing = new PatientPricing($db);

$method = $_SERVER['REQUEST_METHOD'];

switch($method) {
    case 'GET':
        if (isset($_GET['patient_id'])) {
            // Buscar preço específico do paciente
            $price = $pricing->getPatientPrice($_SESSION['user_id'], $_GET['patient_id']);
            echo json_encode(['price' => $price]);
        } else {
            // Listar todos os preços
            $stmt = $pricing->read($_SESSION['user_id']);
            $prices = $stmt->fetchAll(PDO::FETCH_ASSOC);
            echo json_encode($prices);
        }
        break;

    case 'POST':
        $data = json_decode(file_get_contents("php://input"));
        
        if (!$data || !isset($data->patient_id) || !isset($data->session_price)) {
            http_response_code(400);
            echo json_encode(['error' => 'Dados inválidos']);
            exit;
        }

        $pricing->user_id = $_SESSION['user_id'];
        $pricing->patient_id = $data->patient_id;
        $pricing->session_price = $data->session_price;
        $pricing->notes = $data->notes ?? '';

        if ($pricing->createOrUpdate()) {
            echo json_encode(['success' => true, 'message' => 'Preço atualizado com sucesso']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Erro ao salvar preço']);
        }
        break;

    case 'DELETE':
        if (!isset($_GET['id'])) {
            http_response_code(400);
            echo json_encode(['error' => 'ID não informado']);
            exit;
        }

        $pricing->id = $_GET['id'];
        $pricing->user_id = $_SESSION['user_id'];

        if ($pricing->delete()) {
            echo json_encode(['success' => true, 'message' => 'Preço removido com sucesso']);
        } else {
            http_response_code(500);
            echo json_encode(['error' => 'Erro ao remover preço']);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Método não permitido']);
}
?>