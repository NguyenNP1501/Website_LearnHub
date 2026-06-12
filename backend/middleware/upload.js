const fs = require("fs");
const path = require("path");
const multer = require("multer");

const UPLOADS_ROOT = path.join(__dirname, "..", "uploads");

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

const safeName = (value = "") =>
  String(value)
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

const resolveFolderType = (req) => {
  const url = (req.originalUrl || "").toLowerCase();

  if (url.includes("course") || url.includes("lesson")) {
    return "khoahoc";
  }

  return (
    safeName(
      req.body?.folderType ||
      req.query?.folderType ||
      req.get("x-folder-type")
    ) || "question-images"
  );
};

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const folderType = resolveFolderType(req);

    let uploadPath = path.join(UPLOADS_ROOT, folderType);

    if (folderType === "khoahoc") {
      uploadPath = path.join(
        uploadPath,
        file.mimetype.startsWith("video/")
          ? "video"
          : "images"
      );
    }

    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },

  filename(req, file, cb) {
    const ext = path.extname(file.originalname || "") || ".png";
    const name =
      safeName(path.basename(file.originalname, ext)) || "file";

    cb(
      null,
      `${name}-${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}${ext.toLowerCase()}`
    );
  },
});

const imageFilter = (req, file, cb) => {
  if (ALLOWED_IMAGE_TYPES.has(file.mimetype)) {
    return cb(null, true);
  }

  cb(new Error("Only JPG, PNG, GIF, and WEBP images are supported."));
};

const uploadExamImages = multer({
  storage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 50,
  },
}).any();

const uploadImportExamFile = multer({
  storage: multer.memoryStorage(),
  fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();

    if (
      ALLOWED_IMPORT_EXTENSIONS.has(ext) &&
      (!file.mimetype || ALLOWED_IMPORT_TYPES.has(file.mimetype))
    ) {
      return cb(null, true);
    }

    cb(new Error("Only CSV, XLSX, and XLS files are supported."));
  },
  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1,
  },
}).single("examFile");

const uploadLessonFiles = multer({
  storage,
  fileFilter(req, file, cb) {
    if (
      ALLOWED_IMAGE_TYPES.has(file.mimetype) ||
      file.mimetype.startsWith("video/")
    ) {
      return cb(null, true);
    }

    cb(new Error("Chỉ hỗ trợ ảnh và video."));
  },
  limits: {
    fileSize: 150 * 1024 * 1024,
  },
});

const toPublicUploadPath = (filePath) =>
  `/uploads/${path
    .relative(UPLOADS_ROOT, filePath)
    .split(path.sep)
    .join("/")}`;

const parseMultipartExamPayload = (req, res, next) => {
  if (!req.is("multipart/form-data")) return next();

  if (typeof req.body?.payload !== "string") {
    return res.status(400).json({
      success: false,
      message: "Missing exam payload.",
    });
  }

  let payload;

  try {
    payload = JSON.parse(req.body.payload);
  } catch {
    return res.status(400).json({
      success: false,
      message: "Exam payload must be valid JSON.",
    });
  }

  const imageMap = new Map();

  for (const file of req.files || []) {
    const match = /^questionImage_(\d+)$/.exec(file.fieldname);

    if (match) {
      imageMap.set(
        Number(match[1]),
        toPublicUploadPath(file.path)
      );
    }
  }

  payload.questions = (payload.questions || []).map(
    (question, index) => ({
      ...question,
      imgUrl: imageMap.get(index) || question.imgUrl || "",
    })
  );

  req.body = payload;
  next();
};

module.exports = {
  uploadExamImages,
  uploadImportExamFile,
  uploadLessonFiles,
  parseMultipartExamPayload,
};