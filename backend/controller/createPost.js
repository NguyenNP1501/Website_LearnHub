const Post = require('../models/Post');

exports.createPost = async (req, res) => {
    try {
        const {content, title} = req.body;
        const user_id = null;

        if(!content || !title) {
            return res.status(400).json({ error: 'Content and title are required' });
        }

      const img_url_json = req.files 
            ? req.files.map(file => {
                // 1. Chuẩn hóa tất cả dấu gạch chéo ngược \ thành gạch chéo xuôi /
                const normalizedPath = file.path.replace(/\\/g, '/');
                
                // 2. Tìm chữ 'backend/' và chỉ lấy phần phía sau nó
                // Kết quả mong muốn: "uploads/Post/Screenshot-..."
                if (normalizedPath.includes('backend/')) {
                    return normalizedPath.split('backend/')[1];
                }
                
                return normalizedPath; // Fallback phòng hờ
              }) 
            : [];


        const newPost = await Post.create(user_id, content, title, JSON.stringify(img_url_json));
        res.status(201).json({ message: 'Post created successfully', post: newPost });
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}