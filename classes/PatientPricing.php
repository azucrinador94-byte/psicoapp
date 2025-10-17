<?php
class PatientPricing {
    private $conn;
    private $table = 'patient_pricing';

    public $id;
    public $user_id;
    public $patient_id;
    public $session_price;
    public $notes;
    public $created_at;
    public $updated_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Criar ou atualizar preço do paciente
    public function createOrUpdate() {
        $query = "INSERT INTO " . $this->table . " 
                  (user_id, patient_id, session_price, notes) 
                  VALUES (:user_id, :patient_id, :session_price, :notes)
                  ON DUPLICATE KEY UPDATE 
                  session_price = :session_price, notes = :notes";
        
        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':user_id', $this->user_id);
        $stmt->bindParam(':patient_id', $this->patient_id);
        $stmt->bindParam(':session_price', $this->session_price);
        $stmt->bindParam(':notes', $this->notes);

        return $stmt->execute();
    }

    // Buscar preço do paciente
    public function getPatientPrice($user_id, $patient_id) {
        $query = "SELECT session_price FROM " . $this->table . " 
                  WHERE user_id = :user_id AND patient_id = :patient_id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->bindParam(':patient_id', $patient_id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ? $row['session_price'] : 100.00; // Preço padrão
    }

    // Listar todos os preços do usuário
    public function read($user_id) {
        $query = "SELECT pp.*, p.name as patient_name 
                  FROM " . $this->table . " pp
                  LEFT JOIN patients p ON pp.patient_id = p.id 
                  WHERE pp.user_id = :user_id 
                  ORDER BY p.name ASC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();
        
        return $stmt;
    }

    // Deletar preço do paciente
    public function delete() {
        $query = "DELETE FROM " . $this->table . " 
                  WHERE id = :id AND user_id = :user_id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $this->id);
        $stmt->bindParam(':user_id', $this->user_id);

        return $stmt->execute();
    }
}
?>