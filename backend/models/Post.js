const db = require('../configs/database.config');

const Post = {
    create: async (user_id, content, title, img_url_json) => {
        const [result] = await db.query(
            'INSERT INTO Post (user_id, content, title, img_url) VALUES (?, ?, ?, ?)',
            [user_id, content, title, img_url_json]
        );
        return result;
    },

    getAll: async () => {
        const [rows] = await db.query('SELECT p.post_id, p.content, p.created_at, p.title, p.img_url, u.user_name, u.email, u.role, u.avatar_url FROM Post p INNER JOIN User u ON p.user_id = u.user_id ORDER BY p.created_at DESC');
        return rows;
    },

    getById: async (post_id) => {
        const [rows] = await db.query('SELECT * FROM Post WHERE post_id = ?', [post_id]);
        return rows[0];
    },

    searchByTitle: async (keyword) => {
        const [rows] = await db.query('SELECT * FROM Post WHERE title LIKE ? ORDER BY created_at DESC', [`%${keyword}%`]);
        return rows;
    }
}

module.exports = Post;