const Post = require('../models/Post');

exports.getPosts = async (req, res) => {
    try{
        const posts = await Post.getAll();
        res.status(200).json({ posts: posts });
    }
    catch(error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}
