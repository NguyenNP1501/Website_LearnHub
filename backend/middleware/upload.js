const fs = require("fs");
const path = require("path");
const multer = require("multer");

const UPLOADS_ROOT = path.join(__dirname, "..", "uploads");
const DEFAULT_QUESTION_IMAGE_FOLDER = "question-images";

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);
const ALLOWED_IMPORT_EXTENSIONS = new Set([".csv", ".xlsx", ".xls"]);
const ALLOWED_IMPORT_TYPES = new Set([
  "text/csv",
  "text/plain",
  "application/csv",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/octet-stream",
]);

fs.mkdirSync(UPLOADS_ROOT, { recursive: true });

const toSafeName = (value = "") =>
  String(value)
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const toSafeFileName = (fileName = "image") => toSafeName(fileName);

// Tự động nhận diện thông minh theo tuyến đường (Route)
const resolveFolderType = (req, fallback = DEFAULT_QUESTION_IMAGE_FOLDER) => {
  // Lấy URL hiện tại của request đang gọi đến hệ thống
  const currentUrl = req.originalUrl || req.baseUrl || req.url || "";
  
  // NẾU LÀ COURSE HOẶC LESSON: Ép buộc trả về folder "khoahoc" để lưu chung chỗ
  if (currentUrl.toLowerCase().includes("course") || currentUrl.toLowerCase().includes("lesson")) {
    return "khoahoc";
  }

  // CÁC TRƯỜNG HỢP KHÁC (Exam, Question): Giữ nguyên logic cũ không thay đổi
  const rawFolderType =
    req.body?.folderType ?? req.query?.folderType ?? req.get("x-folder-type");
  const safeFolderType = toSafeName(rawFolderType);

  return safeFolderType || fallback;
};

// --- GIỮ NGUYÊN HÀM CŨ CỦA BẠN ---
const ensureUploadDirectory = (folderType) => {
  const targetPath = path.join(UPLOADS_ROOT, folderType);
  fs.mkdirSync(targetPath, { recursive: true });
  return targetPath;
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    const folderType = resolveFolderType(req);
    let targetPath = path.join(UPLOADS_ROOT, folderType);

    // CHỈ TÁC ĐỘNG ĐẾN KHÓA HỌC: Tự động chia nhỏ folder video và images
    if (folderType === "khoahoc") {
      if (file.mimetype.startsWith("video/")) {
        targetPath = path.join(targetPath, "video");
      } else if (file.mimetype.startsWith("image/")) {
        targetPath = path.join(targetPath, "images");
      }
    }

    // Tạo thư mục (áp dụng Sync nhất quán theo code gốc của bạn)
    fs.mkdirSync(targetPath, { recursive: true });
    callback(null, targetPath);
  },
  filename: (req, file, callback) => {
    const extension = path.extname(file.originalname || "") || ".png";
    const baseName = path.basename(file.originalname || "image", extension);
    const safeBaseName = toSafeFileName(baseName) || "image";
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

    callback(null, `${safeBaseName}-${uniqueSuffix}${extension.toLowerCase()}`);
  },
});

const fileFilter = (req, file, callback) => {
  if (ALLOWED_IMAGE_TYPES.has(file.mimetype)) {
    callback(null, true);
    return;
  }

  const error = new Error("Only JPG, PNG, GIF, and WEBP images are supported.");
  error.status = 400;
  callback(error);
};

// --- GIỮ NGUYÊN HOÀN TOÀN CÁC MIDDLEWARE ĐỀ THI ---
const uploadExamImages = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 50,
  },
}).any();

const uploadImportExamFile = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, callback) => {
    const extension = path.extname(file.originalname || "").toLowerCase();

    if (
      ALLOWED_IMPORT_EXTENSIONS.has(extension) &&
      ALLOWED_IMPORT_TYPES.has(file.mimetype)
    ) {
      callback(null, true);
      return;
    }

    if (
      ALLOWED_IMPORT_EXTENSIONS.has(extension) &&
      !file.mimetype
    ) {
      callback(null, true);
      return;
    }

    const error = new Error("Only CSV, XLSX, and XLS files are supported.");
    error.status = 400;
    callback(error);
  },
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1,
  },
}).single("examFile");

const toPublicUploadPath = (filePath) => {
  const relativePath = path
    .relative(UPLOADS_ROOT, filePath)
    .split(path.sep)
    .join("/");

  return `/uploads/${relativePath.replace(/^\/+/, "")}`;
};

const parseMultipartExamPayload = (req, res, next) => {
  if (!req.is("multipart/form-data")) {
    next();
    return;
  }

  if (typeof req.body?.payload !== "string") {
    res.status(400).json({
      success: false,
      message: "Missing exam payload.",
    });
    return;
  }

  let parsedPayload;

  try {
    parsedPayload = JSON.parse(req.body.payload);
  } catch {
    res.status(400).json({
      success: false,
      message: "Exam payload must be valid JSON.",
    });
    return;
  }

  const uploadedImageMap = new Map();

  for (const file of req.files ?? []) {
    const matchedField = /^questionImage_(\d+)$/.exec(file.fieldname);
    if (!matchedField) {
      continue;
    }

    uploadedImageMap.set(Number(matchedField[1]), toPublicUploadPath(file.path));
  }

  parsedPayload.questions = (parsedPayload.questions ?? []).map(
    (question, index) => ({
      ...question,
      imgUrl: uploadedImageMap.get(index) ?? question?.imgUrl ?? "",
    }),
  );

  req.body = parsedPayload;
  next();
};

// Middleware xử lý upload cho Khóa học (Lessons)
const uploadLessonFiles = multer({
  storage,
  fileFilter: (req, file, callback) => {
    // Chấp nhận các loại ảnh hợp lệ HOẶC bất kỳ định dạng video nào
    if (ALLOWED_IMAGE_TYPES.has(file.mimetype) || file.mimetype.startsWith("video/")) {
      return callback(null, true);
    }
    const error = new Error("Chỉ hỗ trợ định dạng ảnh và video hợp lệ.");
    error.status = 400;
    callback(error);
  },
  limits: {
    fileSize: 150 * 1024 * 1024, // Nâng hạn mức lên 150MB để tải video bài giảng
  },
});

module.exports = {
  uploadExamImages,
  uploadImportExamFile,
  parseMultipartExamPayload,
  uploadLessonFiles, // <-- Export thêm middleware này để dùng bên lesson_route.js và course_route.js
};

// const multer = require('multer');
// const path = require('path');
// const fs = require('fs');

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         // Mặc định là 'uploads', nếu có folderType thì lưu vào thư mục con tương ứng
//         // folderType có thể là 'posts', 'lessons', 'avatars', v.v.
//         const folderType = req.body?.folderType || 'others';
//         const rootPath = './uploads';
//         const targetPath = path.join(rootPath, folderType);

//         // Tự động tạo thư mục con nếu chưa có
//         if (!fs.existsSync(targetPath)) {
//             fs.mkdirSync(targetPath, { recursive: true });
//         }

//         cb(null, targetPath);
//     },
//     filename: function (req, file, cb) {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         cb(null, uniqueSuffix + path.extname(file.originalname));
//     }
// });

// const upload = multer({ storage: storage });
// module.exports = upload;
