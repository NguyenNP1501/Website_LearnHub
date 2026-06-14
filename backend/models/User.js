const db = require('../configs/database.config');

const User = {
    getUserIdByEmail: async (email) => {
        const [rows] = await db.query( // Sửa thành [rows]
            'SELECT user_id FROM User WHERE email = ?',
            [email]
        );
        return rows.length > 0 ? rows[0].user_id : null; 
    },

    updatePassword: async (user_id, newPassword) => { // Nên update theo ID thay vì username để chính xác tuyệt đối
        const [result] = await db.query(
            'UPDATE User SET password = ? WHERE user_id = ?',
            [newPassword, user_id]
        );
        return result;
    },

    getUserById: async (user_id) => {
        const [rows] = await db.query(
            'SELECT user_name, email, role, avatar_url FROM User WHERE user_id = ?',
            [user_id]
        );
        return rows.length > 0 ? rows[0] : null;
    },

    findByEmail: async (email) => {
        const [rows] = await db.query(
            'SELECT * from User WHERE email = ?',
            [email]
        );
        return rows.length > 0 ? rows[0] : null; // Trả về object user duy nhất hoặc null
    }
}

module.exports = User;