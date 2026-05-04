const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/auth.route");
const adminExamRoutes = require("./routes/admin/exam.route");
const examRoutes = require("./routes/client/exam.route");
const attemptRoutes = require("./routes/client/attempt.route");

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:5173",
  }),
);
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Elearning backend is running",
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/admin/exams", adminExamRoutes);
app.use("/api/client/exams", examRoutes);
app.use("/api/client/attempts", attemptRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

app.use((error, req, res, next) => {
  console.error(error);

  res.status(500).json({
    success: false,
    message: error.message || "Internal server error",
  });
});

app.listen(PORT, () => {
  console.log(`Backend listening on http://localhost:${PORT}`);
});
