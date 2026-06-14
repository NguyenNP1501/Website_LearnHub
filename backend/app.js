const path = require("path");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const morgan = require("morgan");
const createError = require("http-errors");
const dotenv = require("dotenv");

dotenv.config();

const authRoutes = require("./routes/auth.route");
const authenticationRoutes = require("./routes/authentication");
const adminExamRoutes = require("./routes/admin/exam.route");
const clientExamRoutes = require("./routes/client/exam.route");
const clientAttemptRoutes = require("./routes/client/attempt.route");
const discussionRoutes = require("./routes/discussion");
const commentRoutes = require("./routes/comment");
const nearestPost = require("./routes/nearest_post.route");
const latestCourse = require("./routes/latest_course.route");

const adminCourseRoutes = require('./routes/admin/course_route');
const clientCourseRoutes = require('./routes/client/course_route');
const adminLessonRoutes = require('./routes/admin/lesson_route'); 
const clientLessonRoutes = require('./routes/client/lesson_route');
const clientSubjectRoute = require('./routes/client/subject_route');
const clientGradeRoute = require('./routes/client/grade_route');
const adminSubjectRoute = require('./routes/admin/subject_route');
const adminGradeRoute = require('./routes/admin/grade_route');
const profileRoute = require('./routes/profile_route');
const app = express();

const PORT = Number(process.env.PORT) || 3000;
const uploadsDirectory = path.join(__dirname, "uploads");
const allowedOrigins = String(process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("CORS origin is not allowed"));
    },
  }),
);
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Backend is running",
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    data: {
      status: "ok",
      timestamp: new Date().toISOString(),
    },
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/authentication", authenticationRoutes);
app.use("/api/admin/exams", adminExamRoutes);
app.use("/api/client/exams", clientExamRoutes);
app.use("/api/client/attempts", clientAttemptRoutes);
app.use("/api/discussion", discussionRoutes);
app.use("/api/comment", commentRoutes);
app.use('/api/nearestposts', nearestPost);
app.use('/api/latestcourses', latestCourse);

app.use('/api/admin/courses', adminCourseRoutes);
app.use('/api/client/courses', clientCourseRoutes);
app.use('/api/admin/lessons', adminLessonRoutes); 
app.use('/api/client/lessons', clientLessonRoutes);
app.use('/api/client/subjects', clientSubjectRoute);
app.use('/api/client/grades', clientGradeRoute);
app.use('/api/admin/subjects', adminSubjectRoute);
app.use('/api/admin/grades', adminGradeRoute);

app.use('/api/client/profile', profileRoute);


app.use((req, res, next) => {
  next(createError(404, `Route not found: ${req.method} ${req.originalUrl}`));
});

app.use((error, req, res, next) => {
  const status = error.status || error.statusCode || 500;
  const isProduction = process.env.NODE_ENV === "production";
  const message =
    status >= 500 && isProduction
      ? "Internal server error"
      : error.message || "Internal server error";

  if (status >= 500) {
    console.error(error);
  }

  res.status(status).json({
    success: false,
    message,
    ...(status >= 500 && !isProduction ? { stack: error.stack } : {}),
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

module.exports = app;
