const db = require('../configs/database.config');

const Comment = {
    create: async (user_id, post_id, content, img_url) => {
        const [comment] = await db.query(
            'INSERT INTO Comment (user_id, post_id, content, img_url) VALUES (?, ?, ?, ?)',
            [user_id, post_id, content, img_url]
        );
        return comment;
    },

    getCommentsById: async (post_id) => {
        const [comments] = await db.query(
            'SELECT * FROM Comment WHERE post_id = ? ORDER BY created_at ASC',
            [post_id]
        );
        return comments;
    }
};

module.exports = Comment;