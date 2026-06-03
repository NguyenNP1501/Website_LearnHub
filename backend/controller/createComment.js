const Comment = require('../models/Comment');

exports.createComment = async (req, res) => {
    try {
        const {post_id, content} = req.body;
        const user_id = null;

        if(!content || !post_id) {
            return res.status(400).json({ error: 'Content and post_id are required' });
        }

        const img_url_json = req.files ? req.files.map(file => file.path.replace(/\\/g, '/')) : [];

        const newComment = await Comment.create(user_id, post_id, content, JSON.stringify(img_url_json));
        res.status(201).json({ message: 'Comment created successfully', comment: newComment });
    }
    catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}