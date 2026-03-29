const db = require("../config/db");

exports.getPosts = (req, res) => {
  db.query("SELECT * FROM Post", (err, result) => {
    res.json(result);
  });
};

exports.createPost = (req, res) => {
  const { user_id, content } = req.body;

  db.query("INSERT INTO Post (user_id, content) VALUES (?, ?)", 
    [user_id, content],
    () => res.json({ msg: "Đăng thành công" })
  );
};