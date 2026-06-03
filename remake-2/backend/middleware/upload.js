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

const resolveFolderType = (req, fallback = DEFAULT_QUESTION_IMAGE_FOLDER) => {
  const rawFolderType =
    req.body?.folderType ?? req.query?.folderType ?? req.get("x-folder-type");
  const safeFolderType = toSafeName(rawFolderType);

  return safeFolderType || fallback;
};

const ensureUploadDirectory = (folderType) => {
  const targetPath = path.join(UPLOADS_ROOT, folderType);
  fs.mkdirSync(targetPath, { recursive: true });
  return targetPath;
};

const storage = multer.diskStorage({
  destination: (req, file, callback) => {
    callback(null, ensureUploadDirectory(resolveFolderType(req)));
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

module.exports = {
  uploadExamImages,
  uploadImportExamFile,
  parseMultipartExamPayload,
};
