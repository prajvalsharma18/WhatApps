const TryCatch = require('../utils/TryCatch');
const Chat = require('../models/chat.model');

const createNewChat = TryCatch(async (req , res) =>{
    const userId = req.user?._id;
    const {otherUserId} = req.body;

    if(!otherUserId){
        res.status(400).json({
            message : "otherUserId is required"
        });
        return ;
    }

    const existingChat = await Chat.findOne({
        users : {
            $all : [userId , otherUserId] , $size : 2
        }
    });

    if(existingChat){
        res.status(200).json({
            message : "Chat already exists",
            chatId : existingChat._id
        });
        return ;
    }

    const newChat = await Chat.create({
        users : [userId , otherUserId]
    });

    res.status(201).json({
        message : "new chat created",
        chatId :  newChat._id
    })
});

module.exports = {
    createNewChat
}