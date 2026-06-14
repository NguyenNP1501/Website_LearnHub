const express = require("express");
const postControler = require("../controller/getPost");

const router = express.Router();

router.get("/", postControler.getNearestPost);
router.get("/search/", postControler.searchNearestPost)

module.exports = router;
