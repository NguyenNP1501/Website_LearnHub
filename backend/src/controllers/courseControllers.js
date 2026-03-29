const db = require("../config/db");

exports.getCourses = (req, res) => {
  db.query("SELECT * FROM Course", (err, result) => {
    res.json(result);
  });
};

exports.getCourseDetail = (req, res) => {
  const { id } = req.params;
  db.query("SELECT * FROM Lesson WHERE course_id = ?", [id], (err, result) => {
    res.json(result);
  });
};