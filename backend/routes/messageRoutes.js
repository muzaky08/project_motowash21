const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { auth } = require('../middleware/auth');

router.get('/conversations/list', auth, messageController.getConversations);
router.get('/unread/count', auth, messageController.getUnreadCount);
router.get('/:receiverId', auth, messageController.getMessagesWithUser);
router.post('/', auth, messageController.sendMessage);

module.exports = router;
