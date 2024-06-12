const express = require('express');
const router = express.Router();
const authHandler = require('../handlers/authHandler');

// Define routes
router.post('/signup', authHandler.signup);
router.post('/login', authHandler.login);
router.post('/google-login', authHandler.googleLogin);
router.post('/logout', authHandler.logout);
router.post('/refresh-id-token', authHandler.refreshIdToken); // Tambahkan route untuk refresh token

module.exports = router;
