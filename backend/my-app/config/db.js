const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',         // Nếu dùng XAMPP thì user mặc định là root
  password: '13112005',         // Mật khẩu mặc định của XAMPP là để trống
  database: 'elearning',   // BẠN ĐỔI TÊN NÀY THÀNH TÊN DATABASE CỦA BẠN NHÉ
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

module.exports = pool;