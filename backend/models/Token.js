const db = require('../configs/database.config');

const Token = {
    create: async (email, hashedToken, expires_at, is_used, user_id) => {
        const [token] = await db.query(
            'INSERT INTO Token (email, token, expires_at, is_used, user_id) VALUES (?, ?, ?, ?, ?)', 
            [email, hashedToken, expires_at, is_used, user_id]
        );
        return token;
    },

    deleteToken: async (hashedToken) => {
        const [result] = await db.query(
            'DELETE FROM Token WHERE token = ?',
            [hashedToken]
        );
        return result;
    },

    getToken: async (hashedToken) => {
        const [rows] = await db.query(
            'SELECT * FROM Token WHERE token = ? AND expires_at > NOW()',
            [hashedToken]
        );
        return rows.length > 0 ? rows[0] : null;
    }
}

module.exports = Token;