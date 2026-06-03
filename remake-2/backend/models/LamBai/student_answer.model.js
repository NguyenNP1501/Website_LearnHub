const db = require("../../configs/database.config");

exports.create = async ({
  connection = db,
  studentId = null,
  questionId,
  answerId = null,
  answerText = null,
}) => {
  const [result] = await connection.query(
    `
      INSERT INTO student_answer (student_id, question_id, answer_id, answer_text)
      VALUES (?, ?, ?, ?)
    `,
    [studentId, questionId, answerId, answerText],
  );

  return result.insertId;
};

exports.getByAttemptId = async (attemptId) => {
  const [rows] = await db.query(
    `
      SELECT
        sa.student_answer_id,
        sa.student_id,
        sa.question_id,
        sa.answer_id,
        sa.answer_text
      FROM student_answer_attempt saa
      JOIN student_answer sa
        ON sa.student_answer_id = saa.student_answer_id
      WHERE saa.attempt_id = ?
    `,
    [attemptId],
  );

  return rows;
};
