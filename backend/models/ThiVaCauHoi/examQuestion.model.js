const db = require("../../configs/database.config");

exports.addQuestionToExam = async (exam_id, question_id, number) => {
  await db.query(
    `INSERT INTO ExamQuestion 
     (practice_exam_id, question_id, number_of_question) 
     VALUES (?, ?, ?)`,
    [exam_id, question_id, number]
  );
};

exports.getQuestionIds = async (exam_id) => {
  const [rows] = await db.query(
    `SELECT question_id 
     FROM ExamQuestion 
     WHERE practice_exam_id = ?
     ORDER BY number_of_question ASC`,
    [exam_id]
  );

  return rows;
};

exports.deleteByExam = async (exam_id) => {
  await db.query(
    "DELETE FROM ExamQuestion WHERE practice_exam_id = ?",
    [exam_id]
  );
};

exports.updateOrder = async (exam_id, question_id, number) => {
  await db.query(
    `UPDATE ExamQuestion 
     SET number_of_question = ?
     WHERE practice_exam_id = ? AND question_id = ?`,
    [number, exam_id, question_id]
  );
};

