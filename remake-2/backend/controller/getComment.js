const Comment = require('../models/Comment');

exports.getComments = async (req, res) => {
    try {
        const comments = await Comment.getCommentsById(req.params.post_id);
        res.status(200).json({ comments: comments });
    }
    catch (error) {
        console.error('Error fetching comments:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}