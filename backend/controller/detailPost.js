const Post = require('../models/Post');

exports.detailPost = async (req, res) => {
    try {
        const post_id = req.params.post_id;
        const post = await Post.getById(post_id);
        if (!post) {
            return res.status(404).json({ error: 'Không tìm thấy bài viết' });
        }
        res.status(200).json({ post: post });
    }
    catch (error) {
        console.error('Error fetching post details:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}