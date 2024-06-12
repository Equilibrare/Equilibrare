const express = require('express');
const router = express.Router();
const { saveData } = require('../handlers/saveDataHandler'); // Pastikan jalur ini benar

router.post('/', saveData);

module.exports = router;
