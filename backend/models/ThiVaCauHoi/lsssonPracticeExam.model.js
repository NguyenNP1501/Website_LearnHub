const db = require("../../configs/database.config");

//Thêm lesson_id và exam_id vào bảng lesson_practiceexam
exports.add = async (lesson_id, exam_id) => {
  await db.query(
    "INSERT INTO lesson_practiceexam (lesson_id, practice_exam_id) VALUES (?, ?)",
    [lesson_id, exam_id]
  );
};

//Lấy đề theo lesson
exports.getExamsByLesson = async (lesson_id) => {
  const [rows] = await db.query(`
    SELECT pe.*
    FROM lesson_practiceexam lpe
    JOIN PracticeExam pe 
      ON lpe.practice_exam_id = pe.practice_exam_id
    WHERE lpe.lesson_id = ?
  `, [lesson_id]);

  return rows;
};

//Xoá lesson_id và exam_id khỏi bảng lesson_practiceexam
exports.deleteByLesson = async (lesson_id) => {
  await db.query(
    "DELETE FROM lesson_practiceexam WHERE lesson_id = ?",
    [lesson_id]
  );
};