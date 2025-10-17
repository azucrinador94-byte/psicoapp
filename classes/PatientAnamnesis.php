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

    private function sanitize($data) {
        if ($data === null || $data === '') return '';
        return htmlspecialchars(strip_tags(trim($data)));
    }

    private function validatePatientOwnership() {
        try {
            $query = "SELECT id FROM patients WHERE id = ? AND user_id = ? LIMIT 1";
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$this->patient_id, $this->user_id]);
            return $stmt->rowCount() > 0;
        } catch (PDOException $e) {
            error_log("❌ [ANAMNESE] Erro validação: " . $e->getMessage());
            return false;
        }
    }

    public function create() {
        try {
            error_log("===============================================");
            error_log("🔵 [ANAMNESE CREATE] Patient: {$this->patient_id}, User: {$this->user_id}");
            
            $complaint = $this->sanitize($this->complaint);
            $history_illness = $this->sanitize($this->history_illness);
            $previous_treatments = $this->sanitize($this->previous_treatments);
            $medications = $this->sanitize($this->medications);
            $family_history = $this->sanitize($this->family_history);
            $personal_history = $this->sanitize($this->personal_history);
            $social_history = $this->sanitize($this->social_history);
            $observations = $this->sanitize($this->observations);
            
            $query = "INSERT INTO " . $this->table . " 
                      (user_id, patient_id, complaint, history_illness, previous_treatments, 
                       medications, family_history, personal_history, social_history, observations) 
                      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
            
            $stmt = $this->conn->prepare($query);
            
            $params = [
                $this->user_id,
                $this->patient_id,
                $complaint,
                $history_illness,
                $previous_treatments,
                $medications,
                $family_history,
                $personal_history,
                $social_history,
                $observations
            ];
            
            $success = $stmt->execute($params);
            
            if ($success) {
                $this->id = $this->conn->lastInsertId();
                error_log("✅ [ANAMNESE CREATE] ID: {$this->id}");
                error_log("===============================================");
                return $this->id;
            }
            
            error_log("❌ [ANAMNESE CREATE] Falhou");
            error_log("===============================================");
            return false;
            
        } catch (PDOException $e) {
            error_log("❌ [ANAMNESE CREATE] EXCEÇÃO: " . $e->getMessage());
            error_log("===============================================");
            return false;
        }
    }

    public function readByPatient($patient_id, $user_id) {
        try {
            $query = "SELECT * FROM " . $this->table . " 
                      WHERE patient_id = ? AND user_id = ? 
                      LIMIT 1";
            
            $stmt = $this->conn->prepare($query);
            $stmt->execute([$patient_id, $user_id]);

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
                
                error_log("✅ [ANAMNESE READ] Encontrada ID: {$this->id}");
                return true;
            }
            
            error_log("ℹ️ [ANAMNESE READ] Não encontrada");
            return false;
        } catch (PDOException $e) {
            error_log("❌ [ANAMNESE READ] Erro: " . $e->getMessage());
            return false;
        }
    }

    public function update() {
        try {
            error_log("===============================================");
            error_log("🔵 [ANAMNESE UPDATE] ID: {$this->id}, Patient: {$this->patient_id}");
            
            $complaint = $this->sanitize($this->complaint);
            $history_illness = $this->sanitize($this->history_illness);
            $previous_treatments = $this->sanitize($this->previous_treatments);
            $medications = $this->sanitize($this->medications);
            $family_history = $this->sanitize($this->family_history);
            $personal_history = $this->sanitize($this->personal_history);
            $social_history = $this->sanitize($this->social_history);
            $observations = $this->sanitize($this->observations);
            
            error_log("📝 Complaint NOVO: " . substr($complaint, 0, 50));
            error_log("📝 History NOVO: " . substr($history_illness, 0, 50));
            error_log("📝 Treatments NOVO: " . substr($previous_treatments, 0, 50));
            error_log("📝 Medications NOVO: " . substr($medications, 0, 50));
            error_log("📝 Family NOVO: " . substr($family_history, 0, 50));
            
            $query = "UPDATE " . $this->table . " 
                      SET complaint = ?, 
                          history_illness = ?, 
                          previous_treatments = ?, 
                          medications = ?,
                          family_history = ?, 
                          personal_history = ?,
                          social_history = ?, 
                          observations = ?
                      WHERE id = ? AND user_id = ?";
            
            $stmt = $this->conn->prepare($query);
            
            $params = [
                $complaint,
                $history_illness,
                $previous_treatments,
                $medications,
                $family_history,
                $personal_history,
                $social_history,
                $observations,
                $this->id,
                $this->user_id
            ];
            
            $success = $stmt->execute($params);
            $rowsAffected = $stmt->rowCount();
            
            error_log("📊 [ANAMNESE UPDATE] Linhas afetadas: $rowsAffected");
            
            if ($success) {
                error_log("✅ [ANAMNESE UPDATE] EXECUTADO com sucesso");
                error_log("===============================================");
                return true;
            } else {
                error_log("❌ [ANAMNESE UPDATE] Falhou");
                error_log("===============================================");
                return false;
            }
            
        } catch (PDOException $e) {
            error_log("❌ [ANAMNESE UPDATE] EXCEÇÃO: " . $e->getMessage());
            error_log("===============================================");
            return false;
        }
    }

    // ESTE É O MÉTODO CORRIGIDO - A CHAVE DO PROBLEMA!
    public function createOrUpdate() {
        try {
            error_log("===============================================");
            error_log("🔵 [ANAMNESE UPSERT] Patient: {$this->patient_id}, User: {$this->user_id}");
            
            // Validar paciente
            if (!$this->validatePatientOwnership()) {
                error_log("❌ [ANAMNESE UPSERT] Paciente inválido");
                return [
                    'success' => false, 
                    'message' => 'Paciente não encontrado ou sem permissão'
                ];
            }
            
            // ⭐ SALVAR OS DADOS NOVOS ANTES DE QUALQUER COISA!
            $new_complaint = $this->complaint;
            $new_history_illness = $this->history_illness;
            $new_previous_treatments = $this->previous_treatments;
            $new_medications = $this->medications;
            $new_family_history = $this->family_history;
            $new_personal_history = $this->personal_history;
            $new_social_history = $this->social_history;
            $new_observations = $this->observations;
            
            error_log("💾 [ANAMNESE UPSERT] Dados novos salvos temporariamente");
            error_log("   Complaint: " . substr($new_complaint, 0, 30));
            error_log("   History: " . substr($new_history_illness, 0, 30));
            error_log("   Treatments: " . substr($new_previous_treatments, 0, 30));
            
            // Verificar se já existe
            $exists = $this->readByPatient($this->patient_id, $this->user_id);
            
            if ($exists) {
                error_log("🔄 [ANAMNESE UPSERT] Registro existe (ID: {$this->id}), atualizando...");
                
                // ⭐ RESTAURAR OS DADOS NOVOS (readByPatient sobrescreveu com dados antigos!)
                $this->complaint = $new_complaint;
                $this->history_illness = $new_history_illness;
                $this->previous_treatments = $new_previous_treatments;
                $this->medications = $new_medications;
                $this->family_history = $new_family_history;
                $this->personal_history = $new_personal_history;
                $this->social_history = $new_social_history;
                $this->observations = $new_observations;
                
                error_log("♻️ [ANAMNESE UPSERT] Dados novos RESTAURADOS para update");
                
                $result = $this->update();
                
                return [
                    'success' => $result,
                    'message' => $result ? 'Anamnese atualizada com sucesso' : 'Erro ao atualizar',
                    'action' => 'update',
                    'id' => $this->id
                ];
            } else {
                error_log("➕ [ANAMNESE UPSERT] Não existe, criando novo...");
                
                // Dados já estão corretos, apenas criar
                $result = $this->create();
                
                return [
                    'success' => $result !== false,
                    'message' => $result !== false ? 'Anamnese criada com sucesso' : 'Erro ao criar',
                    'action' => 'create',
                    'id' => $result
                ];
            }
        } catch (Exception $e) {
            error_log("❌ [ANAMNESE UPSERT] EXCEÇÃO: " . $e->getMessage());
            return [
                'success' => false, 
                'message' => 'Erro: ' . $e->getMessage()
            ];
        }
    }

    public function delete() {
        try {
            $query = "DELETE FROM " . $this->table . " WHERE id = ? AND user_id = ?";
            $stmt = $this->conn->prepare($query);
            return $stmt->execute([$this->id, $this->user_id]);
        } catch (PDOException $e) {
            error_log("❌ [ANAMNESE DELETE] Erro: " . $e->getMessage());
            return false;
        }
    }
}
?>