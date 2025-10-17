<?php
class Appointment {
    private $conn;
    private $table = 'appointments';
    public $id;
    public $user_id;
    public $patient_id;
    public $appointment_date;
    public $appointment_time;
    public $duration;
    public $amount;
    public $notes;
    public $status;
    public $created_at;
    public $updated_at;

    public $last_error = null;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create() {
        // Check if amount column exists
        $columnCheck = "SHOW COLUMNS FROM " . $this->table . " LIKE 'amount'";
        $checkStmt = $this->conn->prepare($columnCheck);
        $checkStmt->execute();
        $hasAmountColumn = $checkStmt->rowCount() > 0;
        
        if ($hasAmountColumn) {
            $query = "INSERT INTO " . $this->table . "
                (user_id, patient_id, appointment_date, appointment_time, duration, amount, notes, status)
                VALUES (:user_id, :patient_id, :appointment_date, :appointment_time, :duration, :amount, :notes, :status)";
        } else {
            $query = "INSERT INTO " . $this->table . "
                (user_id, patient_id, appointment_date, appointment_time, duration, notes, status)
                VALUES (:user_id, :patient_id, :appointment_date, :appointment_time, :duration, :notes, :status)";
        }
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $this->user_id);
        $stmt->bindParam(':patient_id', $this->patient_id);
        $stmt->bindParam(':appointment_date', $this->appointment_date);
        $stmt->bindParam(':appointment_time', $this->appointment_time);
        $stmt->bindParam(':duration', $this->duration);
        if ($hasAmountColumn) {
            $stmt->bindParam(':amount', $this->amount);
        }
        $stmt->bindParam(':notes', $this->notes);
        $stmt->bindParam(':status', $this->status);

        if ($stmt->execute()) {
            $this->last_error = null;
            return true;
        } else {
            $errorInfo = $stmt->errorInfo();
            $this->last_error = [
                'sqlstate' => $errorInfo[0],
                'driver_code' => $errorInfo[1],
                'message' => $errorInfo[2],
                'full_message' => "SQLSTATE[{$errorInfo[0]}]: {$errorInfo[2]}"
            ];
            return false;
        }
    }

    public function getLastError() {
        return $this->last_error;
    }

    public function getStats($user_id) {
        // First check if amount column exists
        $columnCheck = "SHOW COLUMNS FROM " . $this->table . " LIKE 'amount'";
        $checkStmt = $this->conn->prepare($columnCheck);
        $checkStmt->execute();
        $hasAmountColumn = $checkStmt->rowCount() > 0;
        
        $amountField = $hasAmountColumn ? "amount" : "0";
        
        $query = "
            SELECT 
                COUNT(*) as total_appointments,
                SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as total_completed,
                SUM(CASE WHEN DATE(appointment_date) = CURDATE() THEN 1 ELSE 0 END) as today_appointments,
                SUM(CASE WHEN YEARWEEK(appointment_date, 1) = YEARWEEK(CURDATE(), 1) THEN 1 ELSE 0 END) as weekly_appointments,
                SUM(CASE WHEN MONTH(appointment_date) = MONTH(CURDATE()) AND YEAR(appointment_date) = YEAR(CURDATE()) THEN " . $amountField . " ELSE 0 END) as monthly_revenue
            FROM " . $this->table . "
            WHERE user_id = :user_id";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC) ?: [
            'total_appointments' => 0,
            'total_completed' => 0,
            'today_appointments' => 0,
            'weekly_appointments' => 0,
            'monthly_revenue' => 0,
        ];
    }

    public function getUpcoming($user_id, $limit = 5) {
        $query = "SELECT a.*, p.name as patient_name
                  FROM " . $this->table . " a
                  LEFT JOIN patients p ON a.patient_id = p.id
                  WHERE a.user_id = :user_id
                  AND a.appointment_date >= CURDATE()
                  ORDER BY a.appointment_date ASC, a.appointment_time ASC
                  LIMIT :limit";
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $user_id, PDO::PARAM_INT);
        $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
        $stmt->execute();
        return $stmt;
    }

    // Listar agendamentos
    public function read($user_id) {
        $query = "SELECT a.*, p.name as patient_name 
                  FROM " . $this->table . " a
                  LEFT JOIN patients p ON a.patient_id = p.id 
                  WHERE a.user_id = :user_id 
                  ORDER BY a.appointment_date DESC, a.appointment_time ASC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();
        
        return $stmt;
    }

    // Buscar agendamento por ID
    public function readOne($id, $user_id) {
        $query = "SELECT a.*, p.name as patient_name 
                  FROM " . $this->table . " a
                  LEFT JOIN patients p ON a.patient_id = p.id 
                  WHERE a.id = :id AND a.user_id = :user_id 
                  LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if($row) {
            $this->id = $row['id'];
            $this->user_id = $row['user_id'];
            $this->patient_id = $row['patient_id'];
            $this->appointment_date = $row['appointment_date'];
            $this->appointment_time = $row['appointment_time'];
            $this->duration = $row['duration'];
            $this->amount = isset($row['amount']) ? $row['amount'] : 0;
            $this->notes = $row['notes'];
            $this->status = $row['status'];
            $this->created_at = $row['created_at'];
            $this->updated_at = $row['updated_at'];
            return true;
        }
        return false;
    }

    // Buscar agendamentos por data
    public function readByDate($user_id, $date) {
        $query = "SELECT a.*, p.name as patient_name 
                  FROM " . $this->table . " a
                  LEFT JOIN patients p ON a.patient_id = p.id 
                  WHERE a.user_id = :user_id AND DATE(a.appointment_date) = :date
                  ORDER BY a.appointment_time ASC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->bindParam(':date', $date);
        $stmt->execute();
        
        return $stmt;
    }

    // Atualizar agendamento
    public function update() {
        // Check if amount column exists
        $columnCheck = "SHOW COLUMNS FROM " . $this->table . " LIKE 'amount'";
        $checkStmt = $this->conn->prepare($columnCheck);
        $checkStmt->execute();
        $hasAmountColumn = $checkStmt->rowCount() > 0;
        
        if ($hasAmountColumn) {
            $query = "UPDATE " . $this->table . " 
                      SET patient_id = :patient_id, appointment_date = :appointment_date, 
                          appointment_time = :appointment_time, duration = :duration,
                          amount = :amount, notes = :notes, status = :status
                      WHERE id = :id AND user_id = :user_id";
        } else {
            $query = "UPDATE " . $this->table . " 
                      SET patient_id = :patient_id, appointment_date = :appointment_date, 
                          appointment_time = :appointment_time, duration = :duration,
                          notes = :notes, status = :status
                      WHERE id = :id AND user_id = :user_id";
        }
        
        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':patient_id', $this->patient_id);
        $stmt->bindParam(':appointment_date', $this->appointment_date);
        $stmt->bindParam(':appointment_time', $this->appointment_time);
        $stmt->bindParam(':duration', $this->duration);
        if ($hasAmountColumn) {
            $stmt->bindParam(':amount', $this->amount);
        }
        $stmt->bindParam(':notes', $this->notes);
        $stmt->bindParam(':status', $this->status);
        $stmt->bindParam(':id', $this->id);
        $stmt->bindParam(':user_id', $this->user_id);

        if ($stmt->execute()) {
            $this->last_error = null;
            return true;
        } else {
            $errorInfo = $stmt->errorInfo();
            $this->last_error = [
                'sqlstate' => $errorInfo[0],
                'driver_code' => $errorInfo[1],
                'message' => $errorInfo[2],
                'full_message' => "SQLSTATE[{$errorInfo[0]}]: {$errorInfo[2]}"
            ];
            return false;
        }
    }

    // Deletar agendamento
    public function delete() {
        $query = "DELETE FROM " . $this->table . " 
                  WHERE id = :id AND user_id = :user_id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $this->id);
        $stmt->bindParam(':user_id', $this->user_id);

        return $stmt->execute();
    }

    // Completar agendamento
    public function complete() {
        $this->status = 'completed';
        return $this->update();
    }
}
?>
