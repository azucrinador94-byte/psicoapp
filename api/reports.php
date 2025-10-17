<?php
session_start();
header('Content-Type: application/json');

require_once '../config/dev.php';
require_once '../config/database.php';

// Check if user is logged in
if (!isAuthenticated()) {
    http_response_code(401);
    echo json_encode(['error' => 'Não autorizado']);
    exit;
}

$database = new Database();
$db = $database->connect();
$user_id = getCurrentUserId();

// Get request method
$method = $_SERVER['REQUEST_METHOD'];

try {
    switch($method) {
        case 'GET':
            handleGetReports($db, $user_id);
            break;
        default:
            http_response_code(405);
            echo json_encode(['error' => 'Method not allowed']);
            break;
    }
} catch(Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Server error']);
}

function handleGetReports($db, $user_id) {
    $type = $_GET['type'] ?? 'monthly';
    $start_date = $_GET['start_date'] ?? null;
    $end_date = $_GET['end_date'] ?? null;
    
    switch($type) {
        case 'weekly':
            $data = getWeeklyReport($db, $user_id);
            break;
        case 'monthly':
            $data = getMonthlyReport($db, $user_id, $start_date, $end_date);
            break;
        case 'patients':
            $data = getPatientsReport($db, $user_id, $start_date, $end_date);
            break;
        case 'appointments':
            $data = getAppointmentsReport($db, $user_id, $start_date, $end_date);
            break;
        case 'financial':
            $data = getFinancialReport($db, $user_id, $start_date, $end_date);
            break;
        default:
            $data = getMonthlyReport($db, $user_id, $start_date, $end_date);
            break;
    }
    
    echo json_encode($data);
}

function getWeeklyReport($db, $user_id) {
    $start_date = date('Y-m-d', strtotime('-7 days'));
    $end_date = date('Y-m-d');
    
    // Count appointments
    $query = "SELECT COUNT(*) as count FROM appointments 
              WHERE user_id = :user_id 
              AND appointment_date BETWEEN :start_date AND :end_date
              AND status = 'completed'";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $user_id);
    $stmt->bindParam(':start_date', $start_date);
    $stmt->bindParam(':end_date', $end_date);
    $stmt->execute();
    $appointments_count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    
    // Count unique patients
    $query = "SELECT COUNT(DISTINCT patient_id) as count FROM appointments 
              WHERE user_id = :user_id 
              AND appointment_date BETWEEN :start_date AND :end_date
              AND status = 'completed'";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $user_id);
    $stmt->bindParam(':start_date', $start_date);
    $stmt->bindParam(':end_date', $end_date);
    $stmt->execute();
    $patients_count = $stmt->fetch(PDO::FETCH_ASSOC)['count'];
    
    // Estimate revenue (assuming average of R$ 150 per session)
    $revenue = number_format($appointments_count * 150, 2, ',', '.');
    
    return [
        'appointments_count' => $appointments_count,
        'patients_count' => $patients_count,
        'revenue' => $revenue
    ];
}

function getMonthlyReport($db, $user_id, $start_date = null, $end_date = null) {
    if (!$start_date) {
        $start_date = date('Y-m-01'); // First day of current month
    }
    if (!$end_date) {
        $end_date = date('Y-m-t'); // Last day of current month
    }
    
    // Count appointments
    $query = "SELECT COUNT(*) as total_appointments FROM appointments 
              WHERE user_id = :user_id 
              AND appointment_date BETWEEN :start_date AND :end_date
              AND status = 'completed'";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $user_id);
    $stmt->bindParam(':start_date', $start_date);
    $stmt->bindParam(':end_date', $end_date);
    $stmt->execute();
    $total_appointments = $stmt->fetch(PDO::FETCH_ASSOC)['total_appointments'];
    
    // Count unique patients
    $query = "SELECT COUNT(DISTINCT patient_id) as total_patients FROM appointments 
              WHERE user_id = :user_id 
              AND appointment_date BETWEEN :start_date AND :end_date
              AND status = 'completed'";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $user_id);
    $stmt->bindParam(':start_date', $start_date);
    $stmt->bindParam(':end_date', $end_date);
    $stmt->execute();
    $total_patients = $stmt->fetch(PDO::FETCH_ASSOC)['total_patients'];
    
    // Estimate revenue
    $estimated_revenue = number_format($total_appointments * 150, 2, ',', '.');
    
    return [
        'total_appointments' => $total_appointments,
        'total_patients' => $total_patients,
        'estimated_revenue' => $estimated_revenue,
        'appointments_count' => $total_appointments,
        'patients_count' => $total_patients,
        'revenue' => $estimated_revenue
    ];
}

function getPatientsReport($db, $user_id, $start_date, $end_date) {
    $query = "SELECT p.name, p.email, 
                     COUNT(a.id) as appointment_count,
                     MAX(a.appointment_date) as last_appointment
              FROM patients p
              LEFT JOIN appointments a ON p.id = a.patient_id 
                     AND a.appointment_date BETWEEN :start_date AND :end_date
                     AND a.status = 'completed'
              WHERE p.user_id = :user_id
              GROUP BY p.id, p.name, p.email
              ORDER BY appointment_count DESC, p.name ASC";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $user_id);
    $stmt->bindParam(':start_date', $start_date);
    $stmt->bindParam(':end_date', $end_date);
    $stmt->execute();
    
    $patients = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    // Format dates
    foreach($patients as &$patient) {
        if ($patient['last_appointment']) {
            $patient['last_appointment'] = date('d/m/Y', strtotime($patient['last_appointment']));
        } else {
            $patient['last_appointment'] = 'Nunca';
        }
    }
    
    return ['patients' => $patients];
}

function getAppointmentsReport($db, $user_id, $start_date, $end_date) {
    $query = "SELECT a.appointment_date, a.appointment_time, a.status,
                     p.name as patient_name
              FROM appointments a
              JOIN patients p ON a.patient_id = p.id
              WHERE a.user_id = :user_id
              AND a.appointment_date BETWEEN :start_date AND :end_date
              ORDER BY a.appointment_date DESC, a.appointment_time DESC";
    
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $user_id);
    $stmt->bindParam(':start_date', $start_date);
    $stmt->bindParam(':end_date', $end_date);
    $stmt->execute();
    
    $appointments = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    return ['appointments' => $appointments];
}

function getFinancialReport($db, $user_id, $start_date, $end_date) {
    // Count completed appointments
    $query = "SELECT COUNT(*) as completed_appointments FROM appointments 
              WHERE user_id = :user_id 
              AND appointment_date BETWEEN :start_date AND :end_date
              AND status = 'completed'";
    $stmt = $db->prepare($query);
    $stmt->bindParam(':user_id', $user_id);
    $stmt->bindParam(':start_date', $start_date);
    $stmt->bindParam(':end_date', $end_date);
    $stmt->execute();
    $completed_appointments = $stmt->fetch(PDO::FETCH_ASSOC)['completed_appointments'];
    
    // Calculate financials (using estimated values)
    $average_value = '150,00';
    $total_revenue = number_format($completed_appointments * 150, 2, ',', '.');
    
    return [
        'completed_appointments' => $completed_appointments,
        'average_value' => $average_value,
        'total_revenue' => $total_revenue
    ];
}
?>