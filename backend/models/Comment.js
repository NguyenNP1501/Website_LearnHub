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
            'SELECT c.comment_id, c.post_id, c.created_at, c.content, c.img_url, u.user_name, u.role, u.avatar_url FROM Comment c INNER JOIN User u ON c.user_id = u.user_id WHERE c.post_id = ?  ORDER BY c.created_at ASC',
            [post_id]
        );
        return comments;
    }
};

module.exports = Comment;