const db = require("../../configs/database.config")

exports.getByQuestionId = async (question_id) => {
  const [rows] = await db.query(
    "SELECT * FROM Answer WHERE question_id = ?",
    [question_id]
  );
  return rows;
};

exports.create = async (question_id, answers) => {
  for (let a of answers) {
    await db.query(
      "INSERT INTO Answer (question_id, answer_text, is_correct) VALUES (?, ?, ?)",
      [question_id, a.answer_text, a.is_correct]
    );
  }
};

exports.deleteByQuestionId = async (question_id) => {
  // 1. Xoá student_answer trước
  await db.query(`
    DELETE FROM student_answer
    WHERE answer_id IN (
      SELECT answer_id FROM Answer WHERE question_id = ?
    )
  `, [question_id]);

  // 2. Xoá Answer
  await db.query(
    "DELETE FROM Answer WHERE question_id = ?",
    [question_id]
  );
};

exports.getCorrectAnswer = async (answer_id) => {
  const [rows] = await db.query(
    "SELECT is_correct FROM Answer WHERE answer_id = ?",
    [answer_id]
  );
  return rows[0];
};