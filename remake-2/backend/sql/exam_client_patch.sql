ALTER TABLE Attempt
ADD COLUMN submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE student_answer
ADD COLUMN question_id INT NULL AFTER student_id,
ADD COLUMN answer_text TEXT NULL AFTER answer_id,
ADD CONSTRAINT fk_student_answer_question
  FOREIGN KEY (question_id) REFERENCES Question(question_id) ON DELETE CASCADE;
