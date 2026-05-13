const express = require('express');
const router = express.Router();
const { createNewChat } = require('../controllers/chat.controller');
const  isAuth  = require('../middlewares/auth.middleware');   


router.post('/chat/new' , isAuth , createNewChat);

module.exports = router;