const express = require("express");
const router = express.Router();
const { getExam, submitExam } = require("../controllers/examControllers");

router.get("/", getExam);
router.post("/submit", submitExam);

module.exports = router;