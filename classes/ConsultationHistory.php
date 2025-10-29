<?php
class ConsultationHistory {
    private $conn;
    private $table = 'consultation_history';

    public $id;
    public $user_id;
    public $patient_id;
    public $appointment_id;
    public $session_number;
    public $session_date;
    public $session_notes;
    public $observations;
    public $homework;
    public $next_session_goals;
    public $patient_mood;
    public $session_duration;
    public $created_at;
    public $updated_at;

    public function __construct($db) {
        $this->conn = $db;
    }

    public function create() {
        error_log("🔵 [CONSULTATION CREATE] Criando nova sessão");
        error_log("   - patient_id: " . $this->patient_id);
        error_log("   - session_date: " . $this->session_date);
        error_log("   - patient_mood: " . $this->patient_mood);
        
        $this->session_number = $this->getNextSessionNumber($this->patient_id, $this->user_id);
        
        error_log("   - session_number: " . $this->session_number);
        
        $query = "INSERT INTO " . $this->table . " 
                  (user_id, patient_id, appointment_id, session_number, session_date, 
                   session_notes, observations, homework, next_session_goals, patient_mood, session_duration) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $this->conn->prepare($query);

        $success = $stmt->execute([
            $this->user_id,
            $this->patient_id,
            $this->appointment_id,
            $this->session_number,
            $this->session_date,
            $this->session_notes,
            $this->observations,
            $this->homework,
            $this->next_session_goals,
            $this->patient_mood,
            $this->session_duration
        ]);
        
        if ($success) {
            error_log("✅ [CONSULTATION CREATE] Sessão criada com sucesso");
        } else {
            error_log("❌ [CONSULTATION CREATE] Falha ao criar");
        }

        return $success;
    }

    public function readByPatient($patient_id, $user_id) {
        $query = "SELECT ch.*, p.name as patient_name 
                  FROM " . $this->table . " ch
                  LEFT JOIN patients p ON ch.patient_id = p.id 
                  WHERE ch.patient_id = ? AND ch.user_id = ? 
                  ORDER BY ch.session_date DESC, ch.session_number DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$patient_id, $user_id]);
        
        return $stmt;
    }

    public function readOne($id, $user_id) {
        $query = "SELECT * FROM " . $this->table . " 
                  WHERE id = ? AND user_id = ? 
                  LIMIT 1";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$id, $user_id]);

        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if($row) {
            $this->id = $row['id'];
            $this->user_id = $row['user_id'];
            $this->patient_id = $row['patient_id'];
            $this->appointment_id = $row['appointment_id'];
            $this->session_number = $row['session_number'];
            $this->session_date = $row['session_date'];
            $this->session_notes = $row['session_notes'];
            $this->observations = $row['observations'];
            $this->homework = $row['homework'];
            $this->next_session_goals = $row['next_session_goals'];
            $this->patient_mood = $row['patient_mood'];
            $this->session_duration = $row['session_duration'];
            return true;
        }
        return false;
    }

    public function update() {
        error_log("🔵 [CONSULTATION UPDATE] Atualizando sessão ID: " . $this->id);
        error_log("   - session_date: " . $this->session_date);
        error_log("   - patient_mood: " . $this->patient_mood);
        error_log("   - session_duration: " . $this->session_duration);
        
        $query = "UPDATE " . $this->table . " 
                  SET session_date = ?,
                      patient_id = ?,
                      appointment_id = ?,
                      session_notes = ?, 
                      observations = ?, 
                      homework = ?, 
                      next_session_goals = ?,
                      patient_mood = ?, 
                      session_duration = ?
                  WHERE id = ? AND user_id = ?";
        
        $stmt = $this->conn->prepare($query);

        $success = $stmt->execute([
            $this->session_date,
            $this->patient_id,
            $this->appointment_id,
            $this->session_notes,
            $this->observations,
            $this->homework,
            $this->next_session_goals,
            $this->patient_mood,
            $this->session_duration,
            $this->id,
            $this->user_id
        ]);
        
        if ($success) {
            $rowCount = $stmt->rowCount();
            error_log("✅ [CONSULTATION UPDATE] Atualizada! Linhas afetadas: $rowCount");
            
            // Verificar se realmente salvou
            $verify = $this->conn->prepare("SELECT session_date, patient_mood FROM {$this->table} WHERE id = ?");
            $verify->execute([$this->id]);
            $saved = $verify->fetch(PDO::FETCH_ASSOC);
            
            if ($saved) {
                error_log("📊 VERIFICAÇÃO - Valores no banco:");
                error_log("   - session_date: " . $saved['session_date']);
                error_log("   - patient_mood: " . $saved['patient_mood']);
            }
        } else {
            error_log("❌ [CONSULTATION UPDATE] Falha ao atualizar");
        }

        return $success;
    }

    // ⭐ NOVO MÉTODO - Deletar sessão
    public function delete() {
        try {
            error_log("🗑️ [CONSULTATION DELETE] Deletando sessão ID: " . $this->id);
            
            $query = "DELETE FROM " . $this->table . " 
                      WHERE id = ? AND user_id = ?";
            
            $stmt = $this->conn->prepare($query);
            $success = $stmt->execute([$this->id, $this->user_id]);
            
            if ($success) {
                $rowCount = $stmt->rowCount();
                error_log("✅ [CONSULTATION DELETE] Deletada! Linhas afetadas: $rowCount");
            } else {
                error_log("❌ [CONSULTATION DELETE] Falha ao deletar");
            }
            
            return $success;
        } catch (PDOException $e) {
            error_log("❌ Erro ao deletar sessão: " . $e->getMessage());
            return false;
        }
    }

    private function getNextSessionNumber($patient_id, $user_id) {
        $query = "SELECT MAX(session_number) as max_session 
                  FROM " . $this->table . " 
                  WHERE patient_id = ? AND user_id = ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$patient_id, $user_id]);
        
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return ($result['max_session'] ?? 0) + 1;
    }

    public function getPatientStats($patient_id, $user_id) {
        $query = "SELECT 
                    COUNT(*) as total_sessions,
                    MAX(session_date) as last_session,
                    AVG(session_duration) as avg_duration
                  FROM " . $this->table . " 
                  WHERE patient_id = ? AND user_id = ?";
        
        $stmt = $this->conn->prepare($query);
        $stmt->execute([$patient_id, $user_id]);
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
?>