import React, { useEffect, useState, useContext } from "react";
import { BsThreeDotsVertical } from "react-icons/bs";
import { MdMessage } from "react-icons/md";
import { FaFileUpload } from "react-icons/fa"; // File upload icon
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import Navbar from "../Navbar/Navbar";
import axios from "axios";
import { WalletContext } from "../Navbar/walletContext";
import "./message.css";

const socket = io("https://dapp.blockworkprotocol.xyz");

function Messages() {
    const { jobId } = useParams();
    const { user } = useContext(WalletContext);
    const senderWallet = user.walletAddress;
    const [message, setMessage] = useState("");
    const [messages, setMessages] = useState([]);
    const [jobConversations, setJobConversations] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchJobDataAndConversations = async () => {
            try {
                // Fetch job-related data first
                const [postedJobsResponse, appliedJobsResponse] =
                    await Promise.all([
                        axios.get(
                            `https://dapp.blockworkprotocol.xyz/api/jobs/my-posts/${senderWallet}`
                        ),
                        axios.get(
                            `https://dapp.blockworkprotocol.xyz/api/jobs/applied/${senderWallet}`
                        ),
                    ]);

                const combinedJobs = [
                    ...postedJobsResponse.data,
                    ...appliedJobsResponse.data,
                ];

                // Fetch conversation data separately
                const conversationsResponse = await axios.get(
                    "https://dapp.blockworkprotocol.xyz/api/messages/conversations"
                );
                const conversations = conversationsResponse.data;

                // Merge jobs with corresponding conversations based on jobId
                const jobsWithConversations = combinedJobs.map((job) => {
                    const conversation = conversations.find(
                        (conv) => conv.jobId === job._id
                    );
                    return {
                        ...job,
                        lastMessageContent: conversation
                            ? conversation.lastMessageContent
                            : "No messages yet",
                        lastMessageTime: conversation
                            ? conversation.lastMessageTime
                            : null,
                    };
                });

                // Sort by last message time if available
                const sortedConversations = jobsWithConversations.sort(
                    (a, b) =>
                        new Date(b.lastMessageTime || 0) -
                        new Date(a.lastMessageTime || 0)
                );

                setJobConversations(sortedConversations);
            } catch (error) {
                console.error("Error fetching jobs and conversations:", error);
            }
        };

        if (senderWallet) {
            fetchJobDataAndConversations();
        }
    }, [senderWallet]);

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Limit file size to 5MB
            if (file.size > 5 * 1024 * 1024) {
                alert("File size exceeds 5MB");
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedFile(reader.result); // Store base64 encoded file
            };
            reader.readAsDataURL(file); // Convert file to base64
        }
    };

    // Fetch messages for the selected job
    useEffect(() => {
        if (!jobId) {
            setMessages([]);
            return;
        }

        const fetchMessages = async () => {
            try {
                const response = await axios.get(
                    `https://dapp.blockworkprotocol.xyz/api/messages/job/${jobId}`
                );
                console.log("Messages fetched successfully:", response.data);

                // Sort the messages based on timestamp
                const sortedMessages = response.data.sort(
                    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
                );
                setMessages(sortedMessages);
            } catch (error) {
                console.error(
                    "Error fetching messages:",
                    error.response?.data || error.message
                );
                // Add more details on the error if needed
                if (error.response?.status === 500) {
                    alert(
                        "Server error while fetching messages. Please try again later."
                    );
                } else if (error.response?.status === 404) {
                    alert("No conversation found for this job.");
                } else {
                    alert(
                        "Error fetching messages. Check your network and try again."
                    );
                }
            }
        };

        if (senderWallet && jobId) {
            fetchMessages();

            socket.on("receiveMessage", (newMessage) => {
                if (newMessage.jobId === jobId) {
                    setMessages((prevMessages) => [
                        ...prevMessages,
                        newMessage,
                    ]);
                }
            });
        }

        return () => {
            socket.off("receiveMessage");
        };
    }, [senderWallet, jobId]);

    const sendMessage = async () => {
        if (!message.trim() && !selectedFile) return;
        if (!senderWallet || !jobId) return;

        let attachmentUrl = null;

        if (selectedFile) {
            const formData = new FormData();
            formData.append("file", selectedFile);

            try {
                const fileResponse = await axios.post(
                    "https://dapp.blockworkprotocol.xyz/api/messages/upload",
                    formData,
                    {
                        headers: {
                            "Content-Type": "multipart/form-data",
                        },
                    }
                );
                attachmentUrl = fileResponse.data.file.filename;
            } catch (error) {
                console.error("Error uploading file:", error);
                return;
            }
        }

        const newMessage = {
            senderWallet,
            jobId,
            content: message,
            username: user.userName,
            avatar: user.avatar,
            timestamp: new Date(),
            attachment: attachmentUrl
                ? `/api/messages/file/${attachmentUrl}`
                : null,
        };

        // Emit the new message via the socket
        socket.emit("sendMessage", newMessage);

        // Send the new message to the backend
        try {
            await axios.post(
                "https://dapp.blockworkprotocol.xyz/api/messages",
                newMessage
            );
            setMessage(""); // Clear the input field
            setSelectedFile(null); // Clear file input
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const handleJobSelection = (job) => {
        setMessages([]);
        navigate(`/messages/${job._id}`);
    };

    useEffect(() => {
        async function fetchJobConversations() {
            try {
                const response = await axios.get(
                    "https://dapp.blockworkprotocol.xyz/api/messages/conversations"
                );
                setJobConversations(response.data);
            } catch (error) {
                console.error("Error fetching conversations:", error);
            }
        }

        fetchJobConversations();
    }, []); // Fetch conversations when the component mounts

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <Navbar />

            <div className="flex flex-grow h-full">
                <div className="w-1/4 border-r border-gray-200 p-4 overflow-y-auto custom-scrollbar h-full">
                    <div className="flex items-center justify-between">
                        <h1 className="text-2xl font-semibold">Messages</h1>
                        <BsThreeDotsVertical className="text-2xl text-gray-500" />
                    </div>
                    <div className="mt-6 text-green-800">
                        {jobConversations.length > 0 ? (
                            jobConversations.map((job) => {
                                const lastMessage =
                                    job.lastMessageContent || "No messages yet";

                                return (
                                    <div
                                        key={job._id}
                                        className={`p-3 mb-3 rounded-lg cursor-pointer flex items-center ${
                                            jobId === job._id
                                                ? "bg-blue-100"
                                                : "bg-gray-100"
                                        }`}
                                        onClick={() => handleJobSelection(job)}>
                                        <img
                                            src={
                                                job.logo || "defaultAvatar.png"
                                            }
                                            alt="Job"
                                            className="w-8 h-8 rounded-full mr-3"
                                        />
                                        <div>
                                            <h3 className="text-lg font-semibold text-justify">
                                                {job.title}
                                            </h3>
                                            <p className="text-sm text-gray-500 text-justify">
                                                {lastMessage}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })
                        ) : (
                            <p>No jobs found</p>
                        )}
                    </div>
                </div>

                <div className="flex-1 flex flex-col h-full">
                    <div className="flex-grow p-6 overflow-y-auto custom-scrollbar">
                        {jobId ? (
                            <>
                                {messages.length > 0 ? (
                                    messages.map((msg, index) => (
                                        <div
                                            key={index}
                                            className={`mb-4 flex ${
                                                msg.senderWallet ===
                                                senderWallet
                                                    ? "justify-start"
                                                    : "justify-end"
                                            }`}>
                                            <img
                                                src={
                                                    msg.senderWallet ===
                                                    senderWallet
                                                        ? user.avatar
                                                        : msg.avatar ||
                                                          "defaultAvatar.png"
                                                }
                                                alt="User Avatar"
                                                className="w-8 h-8 rounded-full mr-3"
                                            />

                                            <div>
                                                <p className="text-xs text-gray-500">
                                                    {msg.senderWallet ===
                                                    senderWallet
                                                        ? "You"
                                                        : msg.username ||
                                                          "Unknown User"}
                                                </p>

                                                <p
                                                    className={`p-2 rounded-lg  ${
                                                        msg.senderWallet ===
                                                        senderWallet
                                                            ? "bg-blue-500 text-white"
                                                            : "bg-gray-600"
                                                    }`}>
                                                    {msg.content}
                                                </p>
                                                {msg.attachment && (
                                                    <div>
                                                        {msg.attachment.startsWith(
                                                            "data:image"
                                                        ) ? (
                                                            <img
                                                                src={
                                                                    msg.attachment
                                                                }
                                                                alt="Attachment"
                                                                className="w-64 h-auto"
                                                            />
                                                        ) : (
                                                            <a
                                                                href={
                                                                    msg.attachment
                                                                }
                                                                download>
                                                                Download
                                                                Attachment
                                                            </a>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-gray-500">
                                        <MdMessage className="text-6xl mb-4" />
                                        <p className="text-lg">
                                            There are no messages yet.
                                        </p>
                                    </div>
                                )}
                            </>
                        ) : (
                            <div className="flex-grow flex items-center justify-center">
                                <p>Select a job to view messages</p>
                            </div>
                        )}
                    </div>

                    {jobId && (
                        <div className="p-4 flex border-t border-gray-300 bg-color text-white">
                            <input
                                type="text"
                                className="flex-1 p-2 border rounded-lg bg-color bg-black"
                                placeholder="Type a message..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        sendMessage();
                                    }
                                }}
                            />
                            <label className="cursor-pointer">
                                <FaFileUpload
                                    className="text-2xl ml-2  "
                                    size={45}
                                />
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    accept="image/*,video/*,.doc,.docx,.pdf,.txt"
                                    className="hidden"
                                />
                            </label>
                            <button
                                className="bg-blue-600 text-white px-4 py-2 rounded ml-2"
                                onClick={sendMessage}>
                                Send
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default Messages;
