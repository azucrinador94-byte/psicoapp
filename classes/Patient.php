<?php
class Patient {
    private $conn;
    private $table = 'patients';

    public $id;
    public $user_id;
    public $name;
    public $email;
    public $phone;
    public $birth_date;
    public $notes;
    public $created_at;
    public $updated_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    // Sanitizar dados
    private function sanitize($data) {
        if ($data === null) return null;
        return htmlspecialchars(strip_tags(trim($data)));
    }

    // Validar dados
    public function validate() {
        $errors = [];
        
        if (empty($this->name) || strlen($this->name) < 3) {
            $errors[] = "Nome deve ter pelo menos 3 caracteres";
        }
        
        if (empty($this->email) || !filter_var($this->email, FILTER_VALIDATE_EMAIL)) {
            $errors[] = "Email inválido";
        }
        
        if (empty($this->phone)) {
            $errors[] = "Telefone é obrigatório";
        }
        
        if (empty($this->birth_date)) {
            $errors[] = "Data de nascimento é obrigatória";
        } else {
            $date = DateTime::createFromFormat('Y-m-d', $this->birth_date);
            if (!$date || $date > new DateTime()) {
                $errors[] = "Data de nascimento inválida";
            }
        }
        
        return $errors;
    }

    // Verificar se email já existe
    public function emailExists($email, $user_id, $exclude_id = null) {
        $query = "SELECT id FROM " . $this->table . " 
                  WHERE email = :email AND user_id = :user_id";
        
        if ($exclude_id) {
            $query .= " AND id != :exclude_id";
        }
        
        $query .= " LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':email', $email);
        $stmt->bindParam(':user_id', $user_id);
        
        if ($exclude_id) {
            $stmt->bindParam(':exclude_id', $exclude_id);
        }
        
        $stmt->execute();
        
        return $stmt->rowCount() > 0;
    }

    // Criar paciente
    public function create() {
        try {
            // Sanitizar
            $this->name = $this->sanitize($this->name);
            $this->email = $this->sanitize($this->email);
            $this->phone = $this->sanitize($this->phone);
            $this->notes = $this->sanitize($this->notes);
            
            // Validar
            $errors = $this->validate();
            if (!empty($errors)) {
                return ['success' => false, 'errors' => $errors];
            }
            
            // Verificar email duplicado
            if ($this->emailExists($this->email, $this->user_id)) {
                return ['success' => false, 'errors' => ['Email já cadastrado']];
            }
            
            $query = "INSERT INTO " . $this->table . " 
                      (user_id, name, email, phone, birth_date, notes) 
                      VALUES (:user_id, :name, :email, :phone, :birth_date, :notes)";
            
            $stmt = $this->conn->prepare($query);

            $stmt->bindParam(':user_id', $this->user_id);
            $stmt->bindParam(':name', $this->name);
            $stmt->bindParam(':email', $this->email);
            $stmt->bindParam(':phone', $this->phone);
            $stmt->bindParam(':birth_date', $this->birth_date);
            $stmt->bindParam(':notes', $this->notes);

            if ($stmt->execute()) {
                return $this->conn->lastInsertId();
            }
            
            return false;
        } catch (PDOException $e) {
            error_log("Erro ao criar paciente: " . $e->getMessage());
            return ['success' => false, 'errors' => ['Erro ao salvar paciente']];
        }
    }

    // Listar pacientes
    public function read($user_id, $limit = null, $offset = 0) {
        $query = "SELECT * FROM " . $this->table . " 
                  WHERE user_id = :user_id 
                  ORDER BY name ASC";
        
        if ($limit) {
            $query .= " LIMIT :limit OFFSET :offset";
        }
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $user_id);
        
        if ($limit) {
            $stmt->bindParam(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindParam(':offset', $offset, PDO::PARAM_INT);
        }
        
        $stmt->execute();
        
        return $stmt;
    }

    // Listar pacientes com estatísticas
    public function readWithStats($user_id) {
        $query = "SELECT 
                    p.*,
                    COUNT(DISTINCT a.id) as total_appointments,
                    MAX(a.appointment_date) as last_appointment,
                    (SELECT session_price FROM patient_pricing pp 
                     WHERE pp.patient_id = p.id AND pp.user_id = :user_id2 
                     LIMIT 1) as session_price
                  FROM " . $this->table . " p
                  LEFT JOIN appointments a ON a.patient_id = p.id AND a.user_id = p.user_id
                  WHERE p.user_id = :user_id
                  GROUP BY p.id
                  ORDER BY p.name ASC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->bindParam(':user_id2', $user_id);
        $stmt->execute();
        
        return $stmt;
    }

    // Buscar paciente por ID
    public function readOne($id, $user_id) {
        $query = "SELECT 
                    p.*,
                    (SELECT session_price FROM patient_pricing pp 
                     WHERE pp.patient_id = p.id AND pp.user_id = :user_id2 
                     LIMIT 1) as session_price
                  FROM " . $this->table . " p
                  WHERE p.id = :id AND p.user_id = :user_id 
                  LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':id', $id);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->bindParam(':user_id2', $user_id);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if($row) {
            $this->id = $row['id'];
            $this->user_id = $row['user_id'];
            $this->name = $row['name'];
            $this->email = $row['email'];
            $this->phone = $row['phone'];
            $this->birth_date = $row['birth_date'];
            $this->notes = $row['notes'];
            $this->created_at = $row['created_at'];
            $this->updated_at = $row['updated_at'];
            return true;
        }
        return false;
    }

    // Atualizar paciente
    public function update() {
        try {
            // Sanitizar
            $this->name = $this->sanitize($this->name);
            $this->email = $this->sanitize($this->email);
            $this->phone = $this->sanitize($this->phone);
            $this->notes = $this->sanitize($this->notes);
            
            // Validar
            $errors = $this->validate();
            if (!empty($errors)) {
                return ['success' => false, 'errors' => $errors];
            }
            
            // Verificar email duplicado (excluindo o próprio paciente)
            if ($this->emailExists($this->email, $this->user_id, $this->id)) {
                return ['success' => false, 'errors' => ['Email já cadastrado']];
            }
            
            $query = "UPDATE " . $this->table . " 
                      SET name = :name, email = :email, phone = :phone, 
                          birth_date = :birth_date, notes = :notes 
                      WHERE id = :id AND user_id = :user_id";
            
            $stmt = $this->conn->prepare($query);

            $stmt->bindParam(':name', $this->name);
            $stmt->bindParam(':email', $this->email);
            $stmt->bindParam(':phone', $this->phone);
            $stmt->bindParam(':birth_date', $this->birth_date);
            $stmt->bindParam(':notes', $this->notes);
            $stmt->bindParam(':id', $this->id);
            $stmt->bindParam(':user_id', $this->user_id);

            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Erro ao atualizar paciente: " . $e->getMessage());
            return false;
        }
    }

    // Deletar paciente
    public function delete() {
        try {
            // Iniciar transação para deletar dados relacionados
            $this->conn->beginTransaction();
            
            // Deletar anamnese
            $query = "DELETE FROM patient_anamnesis WHERE patient_id = :id AND user_id = :user_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $this->id);
            $stmt->bindParam(':user_id', $this->user_id);
            $stmt->execute();
            
            // Deletar histórico de consultas
            $query = "DELETE FROM consultation_history WHERE patient_id = :id AND user_id = :user_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $this->id);
            $stmt->bindParam(':user_id', $this->user_id);
            $stmt->execute();
            
            // Deletar preços
            $query = "DELETE FROM patient_pricing WHERE patient_id = :id AND user_id = :user_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $this->id);
            $stmt->bindParam(':user_id', $this->user_id);
            $stmt->execute();
            
            // Deletar agendamentos
            $query = "DELETE FROM appointments WHERE patient_id = :id AND user_id = :user_id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $this->id);
            $stmt->bindParam(':user_id', $this->user_id);
            $stmt->execute();
            
            // Deletar paciente
            $query = "DELETE FROM " . $this->table . " 
                      WHERE id = :id AND user_id = :user_id";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $this->id);
            $stmt->bindParam(':user_id', $this->user_id);
            $stmt->execute();
            
            $this->conn->commit();
            return true;
        } catch (PDOException $e) {
            $this->conn->rollBack();
            error_log("Erro ao deletar paciente: " . $e->getMessage());
            return false;
        }
    }

    // Buscar pacientes
    public function search($user_id, $search_term) {
        $query = "SELECT * FROM " . $this->table . " 
                  WHERE user_id = :user_id 
                  AND (name LIKE :search OR email LIKE :search OR phone LIKE :search) 
                  ORDER BY name ASC";
        
        $stmt = $this->conn->prepare($query);
        $search_term = "%{$search_term}%";
        $stmt->bindParam(':user_id', $user_id);
        $stmt->bindParam(':search', $search_term);
        $stmt->execute();
        
        return $stmt;
    }

    // Contar total de pacientes
    public function count($user_id) {
        $query = "SELECT COUNT(*) as total FROM " . $this->table . " 
                  WHERE user_id = :user_id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row['total'];
    }
}
?>