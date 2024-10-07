const express = require("express");
const router = express.Router();
const Conversation = require("../model/messageSchema");
const User = require("../model/userSchema");
// Get all messages based on jobId
// Get all messages based on jobId
router.get("/job/:jobId", async (req, res) => {
    const { jobId } = req.params;

    try {
        const conversation = await Conversation.findOne({ jobId });

        if (!conversation) {
            return res
                .status(404)
                .json({ message: "No conversation found for this job." });
        }

        // Sort messages by timestamp in ascending order
        const populatedMessages = await Promise.all(
            conversation.messages
                .map(async (message) => {
                    const user = await User.findOne({
                        walletAddress: message.senderWallet,
                    });

                    return {
                        ...message.toObject(),
                        username: user ? user.userName : "Unknown User",
                        avatar: user ? user.avatar : "defaultAvatar.png",
                    };
                })
                .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
        );

        res.status(200).json(populatedMessages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});
// Get all conversations for jobs

router.get("/conversations", async (req, res) => {
    try {
        const conversations = await Conversation.find(
            {},
            "jobId lastMessageContent lastMessageTime"
        );
        if (!conversations || conversations.length === 0) {
            return res.status(404).json({ message: "No conversations found." });
        }
        res.status(200).json(conversations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Save a new message or update conversation based on jobId
router.post("/", async (req, res) => {
    const { senderWallet, jobId, content } = req.body;

    if (!senderWallet || !jobId || !content) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        const user = await User.findOne({ walletAddress: senderWallet });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        let conversation = await Conversation.findOne({ jobId });

        const newMessage = {
            senderWallet,
            content,
            username: user ? user.userName : "Unknown User",
            avatar: user ? user.avatar : "defaultAvatar.png",
            timestamp: new Date(),
        };

        if (!conversation) {
            console.log(`Creating a new conversation for jobId: ${jobId}`);
            conversation = new Conversation({
                jobId,
                participants: [senderWallet],
                messages: [newMessage],
                lastMessageTime: newMessage.timestamp,
                lastMessageContent: newMessage.content,
            });
        } else {
            console.log(`Updating existing conversation for jobId: ${jobId}`);
            conversation.messages.push(newMessage);
            conversation.lastMessageTime = newMessage.timestamp;
            conversation.lastMessageContent = newMessage.content;
        }

        await conversation.save();
        res.status(201).json(newMessage);
    } catch (error) {
        console.error("Error saving message:", error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
