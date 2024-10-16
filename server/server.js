require("dotenv").config(); // Load environment variables
const express = require("express");
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");
const path = require("path"); // Import path module
const http = require("http");
const { Server } = require("socket.io");

// Configure CORS
app.use(
    cors({
        origin: "https://dapp.blockworkprotocol.xyz", // Your frontend URL
        methods: "GET, POST, PUT, DELETE",
        allowedHeaders: "Content-Type, Authorization",
    })
);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Connect to MongoDB
mongoose.connect(process.env.DATABASE_ACCESS, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to Database"));

// Set up the HTTP server and Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "https://dapp.blockworkprotocol.xyz",
        methods: ["GET", "POST"],
    },
});

// Serve static files for avatars or uploads
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Import your routes
const userRouter = require("./routes/userRouter");
const jobRouter = require("./routes/jobRouter");
const messageRouter = require("./routes/messageRouter");

// Add `/api` prefix to all your routes
app.use("/api/usersJobs", userRouter);
app.use("/api/jobs", jobRouter);
app.use("/api/messages", messageRouter);

// Socket.IO connection handling
io.on("connection", (socket) => {
    console.log("New client connected: ", socket.id);

    socket.on("sendMessage", (message) => {
        // Broadcast the message to all connected clients
        io.emit("receiveMessage", message);
    });

    socket.on("disconnect", () => {
        console.log("Client disconnected: ", socket.id);
    });
});

// Start the server on port 3001
server.listen(3001, () => console.log("Server started on port 3001"));
