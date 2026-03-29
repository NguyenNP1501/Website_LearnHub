const db = require("../config/db");

exports.getExam = (req, res) => {
  db.query(`
    SELECT q.*, a.answer_id, a.answer_text
    FROM Question q
    JOIN Answer a ON q.question_id = a.question_id
  `, (err, result) => {
    res.json(result);
  });
};

exports.submitExam = (req, res) => {
  const { answers } = req.body;

  db.query("SELECT answer_id FROM Answer WHERE is_correct = 1", (err, correct) => {
    let score = 0;
    correct.forEach(a => {
      if (Object.values(answers).includes(a.answer_id)) score++;
    });
    res.json({ score });
  });
};