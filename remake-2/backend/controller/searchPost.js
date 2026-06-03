const Post = require('../models/Post');

exports.searchPost = async (req, res) => {
    try {
        const keyword = (req.query.keyword || '').trim();
        if (!keyword) {
            return res.status(200).json({ posts: [] });
        }

        const posts = await Post.searchByTitle(keyword);
        res.status(200).json({ posts });
    }
    catch (err) {
        console.error("Error searching posts: " + err);
        res.status(500).json({ error: 'Internal server error' });
    }
}