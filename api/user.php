<?php
session_start();
require_once '../config/database.php';

// Check if user is logged in
if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized']);
    exit;
}

$database = new Database();
$db = $database->connect();
$user_id = $_SESSION['user_id'];

// Get request method
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch($method) {
        case 'GET':
            handleGetUser($db, $user_id);
            break;
        case 'PUT':
            handleUpdateUser($db, $user_id);
            break;
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error: ' . $e->getMessage()]);
}

function handleGetUser($db, $user_id) {
    $query = "SELECT name, email, crp, phone FROM users WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $user_id);
    $stmt->execute();
    
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if ($user) {
        echo json_encode($user);
    } else {
        http_response_code(404);
        echo json_encode(['error' => 'User not found']);
    }
}

function handleUpdateUser($db, $user_id) {
    $action = $_GET['action'] ?? 'update_profile';
    
    if ($action === 'change_password') {
        handleChangePassword($db, $user_id);
        return;
    }
    
    // Update profile
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid input']);
        return;
    }
    
    $name = $input['name'] ?? '';
    $email = $input['email'] ?? '';
    $crp = $input['crp'] ?? '';
    $phone = $input['phone'] ?? '';
    
    if (!$name || !$email) {
        http_response_code(400);
        echo json_encode(['error' => 'Nome e email são obrigatórios']);
        return;
    }
    
    // Check if email already exists (for other users)
    $query = "SELECT id FROM users WHERE email = :email AND id != :user_id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':user_id', $user_id);
    $stmt->execute();
    
    if ($stmt->fetch()) {
        http_response_code(400);
        echo json_encode(['error' => 'Este email já está em uso']);
        return;
    }
    
    // Update user
    $query = "UPDATE users SET name = :name, email = :email, crp = :crp, phone = :phone, updated_at = CURRENT_TIMESTAMP WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':name', $name);
    $stmt->bindParam(':email', $email);
    $stmt->bindParam(':crp', $crp);
    $stmt->bindParam(':phone', $phone);
    $stmt->bindParam(':id', $user_id);
    
    if ($stmt->execute()) {
        // Update session variables
        $_SESSION['user_name'] = $name;
        $_SESSION['user_email'] = $email;
        $_SESSION['user_crp'] = $crp;
        
        echo json_encode(['success' => true, 'message' => 'Perfil atualizado com sucesso']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao atualizar perfil']);
    }
}

function handleChangePassword($db, $user_id) {
    $input = json_decode(file_get_contents('php://input'), true);
    
    if (!$input) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid input']);
        return;
    }
    
    $current_password = $input['current_password'] ?? '';
    $new_password = $input['new_password'] ?? '';
    
    if (!$current_password || !$new_password) {
        http_response_code(400);
        echo json_encode(['error' => 'Senhas são obrigatórias']);
        return;
    }
    
    if (strlen($new_password) < 6) {
        http_response_code(400);
        echo json_encode(['error' => 'A nova senha deve ter pelo menos 6 caracteres']);
        return;
    }
    
    // Get current password hash
    $query = "SELECT password FROM users WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':id', $user_id);
    $stmt->execute();
    
    $user = $stmt->fetch(PDO::FETCH_ASSOC);
    
    if (!$user) {
        http_response_code(404);
        echo json_encode(['error' => 'Usuário não encontrado']);
        return;
    }
    
    // Verify current password
    if (!password_verify($current_password, $user['password'])) {
        http_response_code(400);
        echo json_encode(['error' => 'Senha atual incorreta']);
        return;
    }
    
    // Hash new password
    $new_password_hash = password_hash($new_password, PASSWORD_DEFAULT);
    
    // Update password
    $query = "UPDATE users SET password = :password, updated_at = CURRENT_TIMESTAMP WHERE id = :id";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':password', $new_password_hash);
    $stmt->bindParam(':id', $user_id);
    
    if ($stmt->execute()) {
        echo json_encode(['success' => true, 'message' => 'Senha alterada com sucesso']);
    } else {
        http_response_code(500);
        echo json_encode(['error' => 'Erro ao alterar senha']);
    }
}
?>