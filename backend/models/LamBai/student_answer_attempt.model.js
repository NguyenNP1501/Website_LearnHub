const db = require("../../configs/database.config");

exports.create = async ({
  connection = db,
  studentAnswerId,
  attemptId,
}) => {
  const [result] = await connection.query(
    `
      INSERT INTO student_answer_attempt (student_answer_id, attempt_id)
      VALUES (?, ?)
    `,
    [studentAnswerId, attemptId],
  );

  return result.insertId;
};
