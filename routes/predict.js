const express = require('express');
const router = express.Router();
const { predict, getHistories } = require('../handlers/predictHandler');

router.post('/', predict);
router.get('/histories', getHistories);

module.exports = router;
