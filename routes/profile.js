const express = require('express');
const router = express.Router();
const profileHandler = require('../handlers/profileHandler');

router.get('/', profileHandler.getProfile);
router.post('/update', profileHandler.updateProfile);

module.exports = router;
