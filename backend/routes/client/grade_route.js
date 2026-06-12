const express = require('express');
const router = express.Router();

const clientGradeController = require('../../controller/client/clientGradeController');


router.get('/', clientGradeController.getAllGrades);

module.exports = router;