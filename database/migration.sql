-- Migration script to update existing PsicoApp database
-- Execute this script if you're getting errors about missing columns

USE psicoapp;

-- Add amount column to appointments table if it doesn't exist
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS amount DECIMAL(10, 2) DEFAULT 0.00 AFTER duration;

-- Create patient_pricing table if it doesn't exist
CREATE TABLE IF NOT EXISTS patient_pricing (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    patient_id INT NOT NULL,
    session_price DECIMAL(10, 2) NOT NULL DEFAULT 100.00,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    UNIQUE KEY unique_patient_pricing (user_id, patient_id)
);

-- Create patient_anamnesis table if it doesn't exist
CREATE TABLE IF NOT EXISTS patient_anamnesis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    patient_id INT NOT NULL,
    complaint TEXT,
    history_illness TEXT,
    previous_treatments TEXT,
    medications TEXT,
    family_history TEXT,
    personal_history TEXT,
    social_history TEXT,
    observations TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    UNIQUE KEY unique_patient_anamnesis (user_id, patient_id)
);

-- Create consultation_history table if it doesn't exist
CREATE TABLE IF NOT EXISTS consultation_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    patient_id INT NOT NULL,
    appointment_id INT,
    session_number INT NOT NULL DEFAULT 1,
    session_date DATE NOT NULL,
    session_notes TEXT,
    observations TEXT,
    homework TEXT,
    next_session_goals TEXT,
    patient_mood ENUM('excellent', 'good', 'neutral', 'poor', 'very_poor') DEFAULT 'neutral',
    session_duration INT DEFAULT 50,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE SET NULL
);

-- Update existing appointments with default amount if needed
UPDATE appointments SET amount = 0.00 WHERE amount IS NULL;

SELECT 'Migration completed successfully!' as message;