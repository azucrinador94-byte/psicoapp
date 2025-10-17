<?php
class PatientAnamnesis {
    private $conn;
    private $table = 'patient_anamnesis';

    public $id;
    public $user_id;
    public $patient_id;
    public $complaint;
    public $history_illness;
    public $previous_treatments;
    public $medications;
    public $family_history;
    public $personal_history; 
    public $social_history;
    public $observations;
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

    // Validar se paciente pertence ao usuário
    private function validatePatientOwnership() {
        $query = "SELECT id FROM patients 
                  WHERE id = :patient_id AND user_id = :user_id 
                  LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':patient_id', $this->patient_id);
        $stmt->bindParam(':user_id', $this->user_id);
        $stmt->execute();
        
        return $stmt->rowCount() > 0;
    }

    // Criar anamnese
    public function create() {
        try {
            // Sanitizar dados
            $this->complaint = $this->sanitize($this->complaint);
            $this->history_illness = $this->sanitize($this->history_illness);
            $this->previous_treatments = $this->sanitize($this->previous_treatments);
            $this->medications = $this->sanitize($this->medications);
            $this->family_history = $this->sanitize($this->family_history);
            $this->personal_history = $this->sanitize($this->personal_history);
            $this->social_history = $this->sanitize($this->social_history);
            $this->observations = $this->sanitize($this->observations);
            
            $query = "INSERT INTO " . $this->table . " 
                      (user_id, patient_id, complaint, history_illness, previous_treatments, 
                       medications, family_history, personal_history, social_history, observations) 
                      VALUES (:user_id, :patient_id, :complaint, :history_illness, :previous_treatments, 
                              :medications, :family_history, :personal_history, :social_history, :observations)";
            
            $stmt = $this->conn->prepare($query);

            $stmt->bindParam(':user_id', $this->user_id);
            $stmt->bindParam(':patient_id', $this->patient_id);
            $stmt->bindParam(':complaint', $this->complaint);
            $stmt->bindParam(':history_illness', $this->history_illness);
            $stmt->bindParam(':previous_treatments', $this->previous_treatments);
            $stmt->bindParam(':medications', $this->medications);
            $stmt->bindParam(':family_history', $this->family_history);
            $stmt->bindParam(':personal_history', $this->personal_history);
            $stmt->bindParam(':social_history', $this->social_history);
            $stmt->bindParam(':observations', $this->observations);

            if ($stmt->execute()) {
                $this->id = $this->conn->lastInsertId();
                return $this->id;
            }
            
            return false;
        } catch (PDOException $e) {
            error_log("Erro ao criar anamnese: " . $e->getMessage());
            return false;
        }
    }

    // Buscar anamnese por paciente
    public function readByPatient($patient_id, $user_id) {
        $query = "SELECT * FROM " . $this->table . " 
                  WHERE patient_id = :patient_id AND user_id = :user_id 
                  LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':patient_id', $patient_id);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();

        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if($row) {
            $this->id = $row['id'];
            $this->user_id = $row['user_id'];
            $this->patient_id = $row['patient_id'];
            $this->complaint = $row['complaint'];
            $this->history_illness = $row['history_illness'];
            $this->previous_treatments = $row['previous_treatments'];
            $this->medications = $row['medications'];
            $this->family_history = $row['family_history'];
            $this->personal_history = $row['personal_history'];
            $this->social_history = $row['social_history'];
            $this->observations = $row['observations'];
            $this->created_at = $row['created_at'];
            $this->updated_at = $row['updated_at'];
            return true;
        }
        return false;
    }

    // Atualizar anamnese
    public function update() {
        try {
            // Sanitizar dados
            $this->complaint = $this->sanitize($this->complaint);
            $this->history_illness = $this->sanitize($this->history_illness);
            $this->previous_treatments = $this->sanitize($this->previous_treatments);
            $this->medications = $this->sanitize($this->medications);
            $this->family_history = $this->sanitize($this->family_history);
            $this->personal_history = $this->sanitize($this->personal_history);
            $this->social_history = $this->sanitize($this->social_history);
            $this->observations = $this->sanitize($this->observations);
            
            $query = "UPDATE " . $this->table . " 
                      SET complaint = :complaint, history_illness = :history_illness, 
                          previous_treatments = :previous_treatments, medications = :medications,
                          family_history = :family_history, personal_history = :personal_history,
                          social_history = :social_history, observations = :observations
                      WHERE id = :id AND user_id = :user_id";
            
            $stmt = $this->conn->prepare($query);

            $stmt->bindParam(':complaint', $this->complaint);
            $stmt->bindParam(':history_illness', $this->history_illness);
            $stmt->bindParam(':previous_treatments', $this->previous_treatments);
            $stmt->bindParam(':medications', $this->medications);
            $stmt->bindParam(':family_history', $this->family_history);
            $stmt->bindParam(':personal_history', $this->personal_history);
            $stmt->bindParam(':social_history', $this->social_history);
            $stmt->bindParam(':observations', $this->observations);
            $stmt->bindParam(':id', $this->id);
            $stmt->bindParam(':user_id', $this->user_id);

            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Erro ao atualizar anamnese: " . $e->getMessage());
            return false;
        }
    }

    // Criar ou atualizar anamnese (UPSERT)
    public function createOrUpdate() {
        try {
            // Validar propriedade do paciente
            if (!$this->validatePatientOwnership()) {
                return [
                    'success' => false, 
                    'message' => 'Paciente não encontrado ou sem permissão'
                ];
            }
            
            // Verificar se já existe anamnese
            if ($this->readByPatient($this->patient_id, $this->user_id)) {
                // Atualizar existente
                $result = $this->update();
                return [
                    'success' => $result,
                    'message' => $result ? 'Anamnese atualizada com sucesso' : 'Erro ao atualizar anamnese',
                    'action' => 'update',
                    'id' => $this->id
                ];
            } else {
                // Criar nova
                $result = $this->create();
                return [
                    'success' => $result !== false,
                    'message' => $result ? 'Anamnese criada com sucesso' : 'Erro ao criar anamnese',
                    'action' => 'create',
                    'id' => $result
                ];
            }
        } catch (PDOException $e) {
            error_log("Erro em createOrUpdate: " . $e->getMessage());
            return [
                'success' => false, 
                'message' => 'Erro ao processar anamnese'
            ];
        }
    }

    // Deletar anamnese
    public function delete() {
        try {
            $query = "DELETE FROM " . $this->table . " 
                      WHERE id = :id AND user_id = :user_id";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':id', $this->id);
            $stmt->bindParam(':user_id', $this->user_id);
            
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log("Erro ao deletar anamnese: " . $e->getMessage());
            return false;
        }
    }
}
?>