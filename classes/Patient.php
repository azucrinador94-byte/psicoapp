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

    // Criar paciente - VERSÃO SIMPLIFICADA
    public function create() {
        try {
            // Log inicial
            error_log("===============================================");
            error_log("🔵 INICIANDO CREATE PACIENTE");
            error_log("Nome: " . $this->name);
            error_log("Email: " . $this->email);
            error_log("Phone: " . $this->phone);
            error_log("Birth Date: " . $this->birth_date);
            error_log("User ID: " . $this->user_id);
            
            // Limpar e sanitizar
            $name = htmlspecialchars(strip_tags(trim($this->name)));
            $email = !empty($this->email) ? htmlspecialchars(strip_tags(trim($this->email))) : null;
            $phone = htmlspecialchars(strip_tags(trim($this->phone)));
            $notes = !empty($this->notes) ? htmlspecialchars(strip_tags(trim($this->notes))) : null;
            $birth_date = $this->birth_date;
            $user_id = $this->user_id;
            
            // Validações básicas
            if (empty($name) || strlen($name) < 3) {
                error_log("❌ Nome inválido ou muito curto");
                return false;
            }
            
            if (empty($phone)) {
                error_log("❌ Telefone obrigatório");
                return false;
            }
            
            if (empty($birth_date)) {
                error_log("❌ Data de nascimento obrigatória");
                return false;
            }
            
            if (empty($user_id)) {
                error_log("❌ User ID obrigatório");
                return false;
            }
            
            error_log("✅ Validações básicas OK");
            
            // Query de inserção
            $query = "INSERT INTO patients (user_id, name, email, phone, birth_date, notes) 
                      VALUES (?, ?, ?, ?, ?, ?)";
            
            error_log("🔵 Query preparada");
            
            $stmt = $this->conn->prepare($query);
            
            if (!$stmt) {
                error_log("❌ Falha ao preparar statement");
                error_log("Erro PDO: " . print_r($this->conn->errorInfo(), true));
                return false;
            }
            
            error_log("🔵 Statement preparado, executando...");
            
            // Executar com array de parâmetros
            $params = [$user_id, $name, $email, $phone, $birth_date, $notes];
            error_log("Parâmetros: " . print_r($params, true));
            
            $success = $stmt->execute($params);
            
            if ($success) {
                $this->id = $this->conn->lastInsertId();
                error_log("✅ SUCESSO! Paciente criado com ID: " . $this->id);
                error_log("===============================================");
                return $this->id;
            } else {
                error_log("❌ Execute retornou FALSE");
                error_log("ErrorInfo: " . print_r($stmt->errorInfo(), true));
                error_log("===============================================");
                return false;
            }
            
        } catch (PDOException $e) {
            error_log("❌ EXCEÇÃO PDO: " . $e->getMessage());
            error_log("Código: " . $e->getCode());
            error_log("Arquivo: " . $e->getFile() . " Linha: " . $e->getLine());
            error_log("===============================================");
            return false;
        } catch (Exception $e) {
            error_log("❌ EXCEÇÃO GERAL: " . $e->getMessage());
            error_log("===============================================");
            return false;
        }
    }

    // Listar pacientes
    public function read($user_id, $limit = null, $offset = 0) {
        $query = "SELECT * FROM patients WHERE user_id = ? ORDER BY name ASC";
        
        if ($limit) {
            $query .= " LIMIT ? OFFSET ?";
        }
        
        $stmt = $this->conn->prepare($query);
        
        if ($limit) {
            $stmt->execute([$user_id, $limit, $offset]);
        } else {
            $stmt->execute([$user_id]);
        }
        
        return $stmt;
    }

    // Buscar paciente por ID
    public function readOne($id, $user_id) {
        $query = "SELECT * FROM patients WHERE id = ? AND user_id = ? LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$id, $user_id]);
        
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
            // Limpar e sanitizar
            $name = htmlspecialchars(strip_tags(trim($this->name)));
            $email = !empty($this->email) ? htmlspecialchars(strip_tags(trim($this->email))) : null;
            $phone = htmlspecialchars(strip_tags(trim($this->phone)));
            $notes = !empty($this->notes) ? htmlspecialchars(strip_tags(trim($this->notes))) : null;
            
            $query = "UPDATE patients 
                      SET name = ?, email = ?, phone = ?, birth_date = ?, notes = ? 
                      WHERE id = ? AND user_id = ?";
            
            $stmt = $this->conn->prepare($query);
            
            return $stmt->execute([
                $name, 
                $email, 
                $phone, 
                $this->birth_date, 
                $notes, 
                $this->id, 
                $this->user_id
            ]);
        } catch (PDOException $e) {
            error_log("❌ Erro ao atualizar paciente: " . $e->getMessage());
            return false;
        }
    }

    // Deletar paciente
    public function delete() {
        try {
            $this->conn->beginTransaction();
            
            // Deletar relacionados
            $tables = [
                'patient_anamnesis',
                'consultation_history',
                'patient_pricing',
                'appointments'
            ];
            
            foreach ($tables as $table) {
                $query = "DELETE FROM {$table} WHERE patient_id = ? AND user_id = ?";
                $stmt = $this->conn->prepare($query);
                $stmt->execute([$this->id, $this->user_id]);
            }
            
            // Deletar paciente
            $query = "DELETE FROM patients WHERE id = ? AND user_id = ?";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$this->id, $this->user_id]);
            
            $this->conn->commit();
            return true;
        } catch (PDOException $e) {
            $this->conn->rollBack();
            error_log("❌ Erro ao deletar paciente: " . $e->getMessage());
            return false;
        }
    }

    // Buscar pacientes
    public function search($user_id, $search_term) {
        $query = "SELECT * FROM patients 
                  WHERE user_id = ? 
                  AND (name LIKE ? OR email LIKE ? OR phone LIKE ?) 
                  ORDER BY name ASC";
        
        $search = "%{$search_term}%";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$user_id, $search, $search, $search]);
        
        return $stmt;
    }

    // Contar pacientes
    public function count($user_id) {
        $query = "SELECT COUNT(*) as total FROM patients WHERE user_id = ?";
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$user_id]);
        
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row['total'];
    }

    // Métodos auxiliares (não obrigatórios, mantidos para compatibilidade)
    public function readWithStats($user_id) {
        return $this->read($user_id);
    }

    public function validate() {
        return []; // Validação agora é feita no create()
    }

    public function emailExists($email, $user_id, $exclude_id = null) {
        return false; // Desabilitado por enquanto
    }
}
?>
