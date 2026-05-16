const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
    },
    image: {
        url: String,
        publicId: String
    },
    messageType: {
        type: String,
        enum: ['text', 'image'],
        required: true
    },
    seen: {
        type: Boolean,
        default: false
    },
    seenAt: {
        type: Date,
    }
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);