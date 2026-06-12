const db = require("../../configs/database.config");

//Lấy câu hỏi theo id
exports.getById = async (id) => {
  const [rows] = await db.query(
    "SELECT * FROM Question WHERE question_id = ?",
    [id]
  );
  return rows[0];
};

//Cập nhật câu hỏi
exports.update = async (id, data) => {
  await db.query(
    `UPDATE Question 
     SET question_text = ?, subject = ?, difficulty = ?
     WHERE question_id = ?`,
    [data.question_text, data.subject, data.difficulty, id]
  );
};

//Xoá câu hỏi
exports.delete = async (id) => {
  await db.query(
    "DELETE FROM Question WHERE question_id = ?",
    [id]
  );
};

//Tìm kiếm câu hỏi
exports.search = async (filters) => {
  let sql = "SELECT * FROM Question WHERE 1=1";
  let params = [];

  if (filters.subject) {
    sql += " AND subject = ?";
    params.push(filters.subject);
  }

  if (filters.difficulty) {
    sql += " AND difficulty = ?";
    params.push(filters.difficulty);
  }

  if (filters.keyword) {
    sql += " AND question_text LIKE ?";
    params.push(`%${filters.keyword}%`);
  }

  const [rows] = await db.query(sql, params);
  return rows;
};