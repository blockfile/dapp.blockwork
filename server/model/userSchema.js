const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    walletAddress: {
        type: String,
        required: true,
        unique: true,
    },
    userName: {
        type: String,
        default: "",
    },
    avatar: {
        type: String,
        default: "",
    },
    resume: {
        type: String,
        default: "",
    },
    age: {
        type: Number,
        default: null,
    },
    location: {
        type: String,
        default: "",
    },
    gender: {
        type: String,
        enum: ["male", "female", "other"],
        default: "other",
    },
    hourlyRate: {
        type: Number,
        default: null,
    },
    bio: {
        type: String,
        default: "",
    },
    jobTitle: {
        // Add jobTitle field
        type: String,
        default: "",
    },
    jobDescription: {
        // Add jobDescription field
        type: String,
        default: "",
    },
    skills: [
        {
            type: String,
            default: "",
        },
    ],
    portfolio: [
        {
            title: {
                type: String,
                default: "",
            },
            role: {
                type: String,
                default: "",
            },
            description: {
                type: String,
                default: "",
            },
            skills: {
                type: [String],
                default: [],
            },
            content: {
                type: String, // Store base64 content
                default: "",
            },
        },
    ],
    workHistory: [
        {
            jobTitle: {
                type: String,
                default: "",
            },
            company: {
                type: String,
                default: "",
            },
            startDate: {
                type: Date, // Storing both month and year as a Date type
                default: null,
            },
            endDate: {
                type: Date, // Storing both month and year as a Date type
                default: null,
            },
            description: {
                type: String,
                default: "", // Description of the work or project
            },
        },
    ],
    languages: [
        {
            language: { type: String, default: "" },
            proficiency: { type: String, default: "Basic" },
        },
    ],
    education: [
        {
            school: { type: String, default: "" },
            degree: { type: String, default: "" },
        },
    ],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model("UserJobs", userSchema);
