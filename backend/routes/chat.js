const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const chatRateLimit = require('../middleware/chatRateLimit');

router.post('/', chatRateLimit, chatController.sendMessage);

module.exports = router;
