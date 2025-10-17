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

    // Criar registro de consulta
    public function create() {
        // Obter próximo número da sessão
        $this->session_number = $this->getNextSessionNumber($this->patient_id, $this->user_id);
        
        $query = "INSERT INTO " . $this->table . " 
                  (user_id, patient_id, appointment_id, session_number, session_date, 
                   session_notes, observations, homework, next_session_goals, patient_mood, session_duration) 
                  VALUES (:user_id, :patient_id, :appointment_id, :session_number, :session_date, 
                          :session_notes, :observations, :homework, :next_session_goals, :patient_mood, :session_duration)";
        
        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':user_id', $this->user_id);
        $stmt->bindParam(':patient_id', $this->patient_id);
        $stmt->bindParam(':appointment_id', $this->appointment_id);
        $stmt->bindParam(':session_number', $this->session_number);
        $stmt->bindParam(':session_date', $this->session_date);
        $stmt->bindParam(':session_notes', $this->session_notes);
        $stmt->bindParam(':observations', $this->observations);
        $stmt->bindParam(':homework', $this->homework);
        $stmt->bindParam(':next_session_goals', $this->next_session_goals);
        $stmt->bindParam(':patient_mood', $this->patient_mood);
        $stmt->bindParam(':session_duration', $this->session_duration);

        return $stmt->execute();
    }

    // Buscar histórico por paciente
    public function readByPatient($patient_id, $user_id) {
        $query = "SELECT ch.*, p.name as patient_name 
                  FROM " . $this->table . " ch
                  LEFT JOIN patients p ON ch.patient_id = p.id 
                  WHERE ch.patient_id = :patient_id AND ch.user_id = :user_id 
                  ORDER BY ch.session_date DESC, ch.session_number DESC";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':patient_id', $patient_id);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();
        
        return $stmt;
    }

    // Buscar uma sessão específica
    public function readOne($id, $user_id) {
        $query = "SELECT * FROM " . $this->table . " 
                  WHERE id = :id AND user_id = :user_id 
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

    // Atualizar registro de consulta
    public function update() {
        $query = "UPDATE " . $this->table . " 
                  SET session_notes = :session_notes, observations = :observations, 
                      homework = :homework, next_session_goals = :next_session_goals,
                      patient_mood = :patient_mood, session_duration = :session_duration
                  WHERE id = :id AND user_id = :user_id";
        
        $stmt = $this->conn->prepare($query);

        $stmt->bindParam(':session_notes', $this->session_notes);
        $stmt->bindParam(':observations', $this->observations);
        $stmt->bindParam(':homework', $this->homework);
        $stmt->bindParam(':next_session_goals', $this->next_session_goals);
        $stmt->bindParam(':patient_mood', $this->patient_mood);
        $stmt->bindParam(':session_duration', $this->session_duration);
        $stmt->bindParam(':id', $this->id);
        $stmt->bindParam(':user_id', $this->user_id);

        return $stmt->execute();
    }

    // Obter próximo número de sessão
    private function getNextSessionNumber($patient_id, $user_id) {
        $query = "SELECT MAX(session_number) as max_session 
                  FROM " . $this->table . " 
                  WHERE patient_id = :patient_id AND user_id = :user_id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':patient_id', $patient_id);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();
        
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        return ($result['max_session'] ?? 0) + 1;
    }

    // Obter estatísticas de sessões por paciente
    public function getPatientStats($patient_id, $user_id) {
        $query = "SELECT 
                    COUNT(*) as total_sessions,
                    MAX(session_date) as last_session,
                    AVG(session_duration) as avg_duration
                  FROM " . $this->table . " 
                  WHERE patient_id = :patient_id AND user_id = :user_id";
        
        $stmt = $this->conn->prepare($query);
        $stmt->bindParam(':patient_id', $patient_id);
        $stmt->bindParam(':user_id', $user_id);
        $stmt->execute();
        
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
}
?>