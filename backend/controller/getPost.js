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

exports.getNearestPost = async (req, res, next) =>{
    try{
        const nearestPosts = await Post.getNearestPost();
        if(!nearestPosts){
            res.status(404).json({
                message: "Không tìm thấy bài đăng",
            })
        }
        res.status(200).json(nearestPosts)
    }catch(error){
        next(error);
    }
}

exports.searchNearestPost = async (req, res, next) =>{
    try{
        const keyword = req.query.keyword;
        const nearestPostList = await Post.searchNearestPost(String(keyword));

        if(!keyword && !nearestPostList){
            res.status(404).json({
                message: "Không tìm thầy bài viết"
            })
        }
        else {
            res.status(200).json(nearestPostList);
        }
    }catch(error){
        next(error);
    }
}
