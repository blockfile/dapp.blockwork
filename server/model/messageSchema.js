const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
    {
        senderWallet: {
            type: String,
            required: true,
        },
        content: {
            type: String,
            default: "", // Default empty string to allow no content when attachment is present
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
        attachment: { type: String, default: null },
    },
    {
        validate: {
            validator: function (v) {
                // At least one of content or attachment should be present
                return (v.content && v.content.trim() !== "") || v.attachment;
            },
            message: "At least one of content or attachment is required.",
        },
    }
);

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
