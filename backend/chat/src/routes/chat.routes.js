const express = require('express');
const router = express.Router();
const { createNewChat , getAllChats , sendMessage , getMessagesByChat } = require('../controllers/chat.controller');
const  isAuth  = require('../middlewares/auth.middleware');   
const {upload} = require('../middlewares/multer')


router.post('/chat/new' , isAuth , createNewChat);
router.get('/chat/all' , isAuth , getAllChats);
router.post('/message' , isAuth , upload.single('image') , sendMessage);
router.get('/message/:chatId', isAuth , getMessagesByChat);

module.exports = router;