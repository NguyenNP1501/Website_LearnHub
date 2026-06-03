const mysql = require('mysql2');
require('dotenv').config();

// Tạo một pool kết nối để tái sử dụng, giúp tăng hiệu năng cho server
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10, // Số lượng kết nối tối đa được phép mở đồng thời
    queueLimit: 0
});

// Chuyển pool sang dạng Promise để bạn có thể dùng async/await
const db = pool.promise();

// Kiểm tra kết nối khi server khởi động
db.getConnection()
    .then(connection => {
        console.log('--- Database Connected Successfully! ---');
        connection.release(); // Giải phóng kết nối sau khi kiểm tra xong
    })
    .catch(err => {
        console.error('--- Database Connection Failed! ---');
        console.error(err.message);
    });

module.exports = db;