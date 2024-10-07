const mongoose = require("mongoose");

const JobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    budget: {
        type: Number,
        required: true,
    },
    paymentVerified: {
        type: Boolean,
        default: false,
    },
    skills: [
        {
            type: String,
        },
    ],
    proposals: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Proposal",
        },
    ],
    clientLocation: {
        type: String,
    },
    walletAddress: {
        type: String,
        required: true,
    },
    logo: {
        type: String,
    },
    banner: {
        type: String, // Add banner field as a string
    },
    jobType: {
        type: String, // "Hourly" or "Fixed-Price"
        required: true,
    },
    experienceLevel: {
        type: String, // "Entry Level", "Intermediate", "Expert"
        required: true,
    },
    responsibilities: {
        type: [String], // Array of strings
        required: true,
    },
    requirements: {
        type: [String], // Array of strings
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    approvedApplicantWallet: { type: String },
    smartContractJobId: { type: String },
    isComplete: { type: Boolean, default: false },
    status: {
        type: String,
        default: "ongoing", // Add default status as "ongoing"
    },
    usersApplied: [
        {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: "UserJobs" }, // Reference to User schema
            userName: { type: String }, // Store username of the applicant
            coverLetter: { type: String }, // Store the user's cover letter
            status: { type: String, default: "Pending" },
            walletAddress: {
                type: String,
            },
        },
    ],
});

const Job = mongoose.model("Job", JobSchema);
module.exports = Job;
