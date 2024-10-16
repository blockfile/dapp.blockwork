const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const GridFsStorage = require("multer-gridfs-storage");
const Grid = require("gridfs-stream");
const multer = require("multer");
const Conversation = require("../model/messageSchema");
const User = require("../model/userSchema");

// Initialize GridFS
const conn = mongoose.connection;
let gfs;
conn.once("open", () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection("uploads");
});

// GridFS storage configuration for Multer
const storage = new GridFsStorage({
    url: process.env.DATABASE_ACCESS,
    file: (req, file) => {
        return {
            filename: `file_${Date.now()}_${file.originalname}`,
            bucketName: "uploads", // Bucket to store large files
        };
    },
});

const upload = multer({ storage });

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

// Save a new message or update conversation based on jobId, with file handling
router.post("/", upload.single("file"), async (req, res) => {
    const { senderWallet, jobId, content } = req.body;

    // Ensure either content or attachment is provided
    if (!senderWallet || !jobId || (!content && !req.file)) {
        return res
            .status(400)
            .json({ message: "Either content or attachment is required." });
    }

    try {
        const user = await User.findOne({ walletAddress: senderWallet });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        let conversation = await Conversation.findOne({ jobId });

        const newMessage = {
            senderWallet,
            content: content || "", // Handle empty content
            username: user.userName || "Unknown User",
            avatar: user.avatar || "defaultAvatar.png",
            timestamp: new Date(),
            attachment: req.file
                ? `/api/messages/file/${req.file.filename}`
                : null, // Store the file URL
        };

        if (!conversation) {
            // Create a new conversation if none exists
            conversation = new Conversation({
                jobId,
                participants: [senderWallet],
                messages: [newMessage],
                lastMessageTime: newMessage.timestamp,
                lastMessageContent: newMessage.content,
            });
        } else {
            // Update the conversation with the new message
            conversation.messages.push(newMessage);
            conversation.lastMessageTime = newMessage.timestamp;
            conversation.lastMessageContent = newMessage.content;
        }

        await conversation.save();
        res.status(201).json(newMessage);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Endpoint to retrieve a file from GridFS by filename
router.get("/file/:filename", (req, res) => {
    gfs.files.findOne({ filename: req.params.filename }, (err, file) => {
        if (!file || file.length === 0) {
            return res.status(404).json({ message: "File not found" });
        }

        // If the file is found, check if it's an image or not
        if (
            file.contentType === "image/jpeg" ||
            file.contentType === "image/png"
        ) {
            // If it's an image, stream it
            const readstream = gfs.createReadStream(file.filename);
            readstream.pipe(res);
        } else {
            // If it's another type of file, provide it for download
            res.set("Content-Type", file.contentType);
            const readstream = gfs.createReadStream(file.filename);
            readstream.pipe(res);
        }
    });
});

module.exports = router;
