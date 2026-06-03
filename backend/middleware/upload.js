const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        // Mặc định là 'uploads', nếu có folderType thì lưu vào thư mục con tương ứng
        // folderType có thể là 'posts', 'lessons', 'avatars', v.v.
        const folderType = req.body.folderType || 'others';
        const rootPath = './uploads';
        const targetPath = path.join(rootPath, folderType);

        // Tự động tạo thư mục con nếu chưa có
        if (!fs.existsSync(targetPath)) {
            fs.mkdirSync(targetPath, { recursive: true });
        }

        cb(null, targetPath);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });
module.exports = upload;