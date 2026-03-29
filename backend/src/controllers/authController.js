const db = require("../config/db");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.login = (req, res) => {
  const { email, password } = req.body;

  db.query("SELECT * FROM User WHERE email = ?", [email], async (err, result) => {
    if (result.length === 0) return res.status(400).json({ msg: "User not found" });

    const user = result[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) return res.status(400).json({ msg: "Sai mật khẩu" });

    const token = jwt.sign({ id: user.user_id }, "SECRET", { expiresIn: "1h" });

    res.json({ token, user });
  });
};