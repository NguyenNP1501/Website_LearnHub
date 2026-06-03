START TRANSACTION;

INSERT INTO user (user_name, email, password, role)
SELECT
  'Admin Demo',
  'admin@elearning.local',
  '$2b$10$vZj0tOMbzQequw1iIwdhu..2O/JOymDRy2Utp/LriKIcO3pGXS1lS',
  'admin'
WHERE NOT EXISTS (
  SELECT 1
  FROM user
  WHERE email = 'admin@elearning.local'
);

SET @admin_user_id := (
  SELECT user_id
  FROM user
  WHERE email = 'admin@elearning.local'
  LIMIT 1
);

INSERT INTO teacher (teacher_id, specialization)
SELECT @admin_user_id, 'Exam Management'
WHERE NOT EXISTS (
  SELECT 1
  FROM teacher
  WHERE teacher_id = @admin_user_id
);

INSERT INTO user (user_name, email, password, role)
SELECT
  'Student Demo',
  'student@elearning.local',
  '$2b$10$t/DZlTt4Cq8ldqDHW.5u0OOPHxx6VyYSMccPrtRs8jN3dSg7PDwzu',
  'student'
WHERE NOT EXISTS (
  SELECT 1
  FROM user
  WHERE email = 'student@elearning.local'
);

SET @student_user_id := (
  SELECT user_id
  FROM user
  WHERE email = 'student@elearning.local'
  LIMIT 1
);

INSERT INTO student (student_id, school, grade_class)
SELECT @student_user_id, 'Remake School', '10A1'
WHERE NOT EXISTS (
  SELECT 1
  FROM student
  WHERE student_id = @student_user_id
);

COMMIT;
