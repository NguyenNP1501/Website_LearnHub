const express = require("express");
const attemptController = require("../../controller/client/attempt.controller");
const { requireAuth } = require("../../middleware/auth.middleware");

const router = express.Router();

router.use(requireAuth("student"));

router.get("/", attemptController.getAttemptHistory);
router.get("/:attemptId", attemptController.getAttemptDetail);
router.delete("/:attemptId", attemptController.deleteAttempt);

module.exports = router;
