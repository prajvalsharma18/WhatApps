const express = require('express');
const { loginUser , verifyUser , myProfile , getAllUsers , getAUser , updateName} = require('../controllers/user.controller');
const isAuth = require("../middleware/auth.middleware");


const router = express.Router();
 
router.post('/login', loginUser);
router.post('/verify', verifyUser);
router.get('/profile' , isAuth , myProfile);
router.get("/user/all" , isAuth , getAllUsers);
router.get("/user/:id" , getAUser);
router.post("/update/name" , isAuth , updateName);


module.exports = router;