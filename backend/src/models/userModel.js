const db = require("../config/db");

exports.findByEmail = (email, callback) => {
  db.query("SELECT * FROM User WHERE email = ?", [email], callback);
};