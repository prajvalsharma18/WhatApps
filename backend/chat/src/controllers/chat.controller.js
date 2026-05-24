const TryCatch = require('../utils/TryCatch');
const Chat = require('../models/chat.model');
const Message = require('../models/message.model');
const axios = require('axios');
const { getRecieverSocketId, io } = require('../config/socket');

const createNewChat = TryCatch(async (req, res) => {
    const userId = req.user?.userId;
    const { otherUserId } = req.body;

    if (!otherUserId) {
        return res.status(400).json({ message: 'otherUserId is required' });
    }

    const existingChat = await Chat.findOne({
        users: { $all: [userId, otherUserId], $size: 2 },
    });

    if (existingChat) {
        return res.status(200).json({
            message: 'Chat already exists',
            chatId: existingChat._id,
        });
    }

    const newChat = await Chat.create({
        users: [userId, otherUserId],
    });

    return res.status(201).json({
        message: 'New chat created',
        chatId: newChat._id,
    });
});

const getAllChats = TryCatch(async (req, res) => {
    const userId = req.user?.userId;

    if (!userId) {
        return res.status(400).json({
            message: 'UserId missing',
        });
    }

    const chats = await Chat.find({ users: userId }).sort({ updatedAt: -1 });

    const chatWithUserData = await Promise.all(
        chats.map(async (chat) => {
            const otherUserId = chat.users.find(
                (id) => id.toString() !== userId.toString()
            );

            const unseenCount = await Message.countDocuments({
                chatId: chat._id,
                sender: { $ne: userId },
                seen: false,
            });

            try {
                const { data } = await axios.get(
                    `${process.env.USER_SERVICE}/api/v1/user/${otherUserId}`
                );

                return {
                    user: data.user,
                    chat: {
                        ...chat.toObject(),
                        latestMessage: chat.latestMessage || null,
                        unseenCount,
                    },
                };
            } catch (err) {
                console.error('Error fetching user data:', err);

                return {
                    user: { _id: otherUserId, name: 'Unknown User' },
                    chat: {
                        ...chat.toObject(),
                        latestMessage: chat.latestMessage || null,
                        unseenCount,
                    },
                };
            }
        })
    );

    return res.json({
        chats: chatWithUserData,
    });
});

const sendMessage = TryCatch(async (req, res) => {
    const userId = req.user?.userId;
    const { chatId, text } = req.body;
    const imageFile = req.file;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!chatId) {
        return res.status(400).json({ message: 'ChatId required' });
    }

    if (!text && !imageFile) {
        return res.status(400).json({ message: 'Either text or image is required' });
    }

    const chat = await Chat.findById(chatId);

    if (!chat) {
        return res.status(404).json({ message: 'Chat not found' });
    }

    const isUserInChat = chat.users.some(
        (id) => id.toString() === userId.toString()
    );

    if (!isUserInChat) {
        return res.status(403).json({ message: 'You are not a member of this chat' });
    }

    const otherUserId = chat.users.find(
        (id) => id.toString() !== userId.toString()
    );

    if (!otherUserId) {
        return res.status(400).json({ message: 'No other user found' });
    }

    const receiverSocketId = getRecieverSocketId(otherUserId.toString());

    let isReceiverInChatRoom = false;

    if (receiverSocketId) {
        const receiverSocket = io.sockets.sockets.get(receiverSocketId);
        if (receiverSocket && receiverSocket.rooms.has(chatId)) {
            isReceiverInChatRoom = true;
        }
    }

    const messageData = {
        chatId,
        sender: userId,
        seen: isReceiverInChatRoom,
        seenAt: isReceiverInChatRoom ? new Date() : undefined,
        messageType: imageFile ? 'image' : 'text',
        text: imageFile ? text || '' : text,
        image: imageFile
            ? {
                  url: imageFile.path,
                  publicId: imageFile.filename || imageFile.public_id,
              }
            : undefined,
    };

    const savedMessage = await Message.create(messageData);

    const latestMessage = imageFile ? '📷 Image' : text;

    await Chat.findByIdAndUpdate(
        chatId,
        {
            latestMessage: {
                text: latestMessage,
                sender: userId,
            },
            updatedAt: new Date(),
        },
        { new: true }
    );

    // emit to chat room
    io.to(chatId).emit('newMessage', savedMessage);

    // emit directly to receiver sirf tab jab wo chat room mein nahi hai
    if (receiverSocketId && !isReceiverInChatRoom) {
        io.to(receiverSocketId).emit('newMessage', savedMessage);
    }

    // emit to sender
    const senderSocketId = getRecieverSocketId(userId.toString());
    if (senderSocketId) {
        io.to(senderSocketId).emit('newMessage', savedMessage);
    }

    // emit seen instantly to sender
    if (isReceiverInChatRoom && senderSocketId) {
        io.to(senderSocketId).emit('messageSeen', {
            chatId,
            seenBy: otherUserId,
            messageIds: [savedMessage._id],
        });
    }

    return res.status(201).json({
        message: savedMessage,
        sender: userId,
    });
});

const getMessagesByChat = TryCatch(async (req, res) => {
    const userId = req.user?.userId;
    const { chatId } = req.params;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    if (!chatId) {
        return res.status(400).json({ message: 'ChatId required' });
    }

    const chat = await Chat.findById(chatId);

    if (!chat) {
        return res.status(404).json({ message: 'Chat not found' });
    }

    const isUserInChat = chat.users.some(
        (id) => id.toString() === userId.toString()
    );

    if (!isUserInChat) {
        return res.status(403).json({ message: 'You are not a member of this chat' });
    }

    const otherUserId = chat.users.find(
        (id) => id.toString() !== userId.toString()
    );

    if (!otherUserId) {
        return res.status(400).json({ message: 'No other user found' });
    }

    const messagesToMarkSeen = await Message.find({
        chatId,
        sender: { $ne: userId },
        seen: false,
    });

    await Message.updateMany(
        {
            chatId,
            sender: { $ne: userId },
            seen: false,
        },
        {
            seen: true,
            seenAt: new Date(),
        }
    );

    const messages = await Message.find({ chatId }).sort({ createdAt: 1 });

    try {
        const { data } = await axios.get(
            `${process.env.USER_SERVICE}/api/v1/user/${otherUserId}`
        );

        if (messagesToMarkSeen.length > 0) {
            const otherUserSocketId = getRecieverSocketId(otherUserId.toString());
            if (otherUserSocketId) {
                io.to(otherUserSocketId).emit('messagesSeen', {
                    chatId,
                    seenBy: userId,
                    messageIds: messagesToMarkSeen.map((msg) => msg._id),
                });
            }
        }

        return res.json({
            messages,
            user: data,
        });
    } catch (err) {
        console.log(err);

        return res.json({
            messages,
            user: { _id: otherUserId, name: 'Unknown User' },
        });
    }
});

module.exports = {
    createNewChat,
    getAllChats,
    sendMessage,
    getMessagesByChat,
};