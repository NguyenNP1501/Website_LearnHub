const express = require('express');
const router = express.Router();

const clientSubjectController = require('../../controller/client/clientSubjectController');

router.get('/', clientSubjectController.getAllSubjects);

module.exports = router;