const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/courses", require("./routes/courseRoutes"));
app.use("/api/exam", require("./routes/examRoutes"));
app.use("/api/posts", require("./routes/postRoutes"));

// // Thêm route gốc
// app.get("/", (req, res) => {
//     res.send("Backend server is running! Available APIs: /api/courses, /api/posts, /api/exam, /api/auth");
// });

app.listen(3000, () => console.log("Server running"));