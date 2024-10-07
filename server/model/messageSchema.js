const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
    senderWallet: {
        type: String,
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    username: {
        type: String,
        default: "Unknown User",
    },
    avatar: {
        type: String,
        default: "defaultAvatar.png",
    },
    timestamp: { type: Date, default: Date.now },
});

const conversationSchema = new mongoose.Schema(
    {
        jobId: {
            type: String,
            required: true, // Link conversation to a job
        },
        participants: [
            {
                type: String,
            },
        ],
        messages: [messageSchema],
        lastMessageTime: { type: Date, default: Date.now },
        lastMessageContent: { type: String },
    },
    { timestamps: true }
);

const Conversation = mongoose.model("Conversation", conversationSchema);
module.exports = Conversation;
