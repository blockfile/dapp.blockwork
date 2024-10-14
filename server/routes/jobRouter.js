const express = require("express");
const router = express.Router();
const Job = require("../model/jobSchema");
const Conversation = require("../model/messageSchema");

// Get all jobs
router.get("/", async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; // Get the current page from query params, default to 1
        const limit = parseInt(req.query.limit) || 10; // Get the limit (jobs per page) from query params, default to 10
        const skip = (page - 1) * limit; // Calculate the number of jobs to skip for pagination

        const total = await Job.estimatedDocumentCount();
        // Get the total number of jobs in the collection
        const jobs = await Job.find().skip(skip).limit(limit); // Fetch jobs for the current page

        res.json({
            total, // Total number of jobs
            jobs, // The jobs for the current page
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get("/my-posts/:walletAddress", async (req, res) => {
    try {
        const jobs = await Job.find({
            walletAddress: req.params.walletAddress,
        }); // Fetch only jobs posted by the user
        res.json(jobs);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});
// Get jobs where the user has applied
// Get jobs where the user has applied, without filtering by application status
router.get("/applied/:walletAddress", async (req, res) => {
    try {
        const jobs = await Job.find({
            "usersApplied.walletAddress": req.params.walletAddress, // Find jobs where the user has applied
        });
        res.json(jobs); // Return all jobs the user has applied to
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a new job

router.post("/", async (req, res) => {
    const {
        jobId,
        title,
        description,
        budget,
        tags,
        logo,
        banner,
        walletAddress,
        jobType,
        experienceLevel,
        responsibilities,
        requirements,
        smartContractJobId,
    } = req.body;

    if (
        !title ||
        !description ||
        !budget ||
        !tags ||
        !walletAddress ||
        !logo ||
        !banner ||
        !jobType ||
        !experienceLevel ||
        !responsibilities ||
        !requirements ||
        !smartContractJobId
    ) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    const job = new Job({
        jobId,
        title,
        description,
        budget,
        logo,
        banner,
        skills: tags,
        walletAddress,
        jobType,
        experienceLevel,
        responsibilities,
        requirements,
        smartContractJobId,
    });

    try {
        const newJob = await job.save();
        res.status(201).json(newJob);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.put("/complete/:id", async (req, res) => {
    try {
        // Find the job using smartContractJobId instead of _id
        const job = await Job.findOne({ smartContractJobId: req.params.id });

        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        // Find the index of the approved application
        const applicationIndex = job.usersApplied.findIndex(
            (app) => app.status === "approved"
        );

        if (applicationIndex !== -1) {
            // Update the status of the selected application to "complete"
            job.usersApplied[applicationIndex].status = "complete";
            job.isComplete = true; // Set isComplete to true

            // Save the job with the updated status
            await job.save();

            res.status(200).json({
                message:
                    "Application marked as complete and job marked as completed.",
            });
        } else {
            res.status(404).json({ message: "Approved application not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

router.post("/apply", async (req, res) => {
    const { jobId, userId, userName, coverLetter, walletAddress } = req.body;

    if (!jobId || !userId || !userName || !coverLetter || !walletAddress) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        const job = await Job.findById(jobId);
        if (!job) {
            return res.status(404).json({ message: "Job not found." });
        }

        // Check if the user has already applied
        const hasAlreadyApplied = job.usersApplied.some(
            (application) => application.userId.toString() === userId
        );

        if (hasAlreadyApplied) {
            return res
                .status(400)
                .json({ message: "You have already applied for this job." });
        }

        job.usersApplied.push({
            userId,
            userName,
            coverLetter,
            walletAddress, // Save walletAddress in the application
        });

        await job.save();
        res.status(200).json({
            message: "Application submitted successfully.",
        });
    } catch (error) {
        console.error("Error submitting application:", error);
        res.status(500).json({ message: "Server error." });
    }
});

// Update the "approve" endpoint
router.put("/approve/:id", async (req, res) => {
    const { userId } = req.body;
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        const applicationIndex = job.usersApplied.findIndex(
            (app) => app.userId.toString() === userId
        );

        if (applicationIndex !== -1) {
            job.usersApplied[applicationIndex].status = "approved";
            job.approvedApplicantWallet =
                job.usersApplied[applicationIndex].walletAddress; // Save the approved applicant's wallet address
            await job.save();

            // Automatically create a conversation between the job poster and the approved applicant
            const posterWallet = job.walletAddress; // The job poster's wallet address
            const applicantWallet = job.approvedApplicantWallet;

            // Check if conversation already exists
            let conversation = await Conversation.findOne({
                jobId: job._id,
                participants: { $all: [posterWallet, applicantWallet] },
            });

            if (!conversation) {
                // If no conversation exists, create one
                conversation = new Conversation({
                    jobId: job._id,
                    participants: [posterWallet, applicantWallet],
                    lastMessageTime: new Date(),
                    lastMessageContent: "Conversation created.",
                });

                await conversation.save();
            }

            res.status(200).json({
                message: "Application approved and conversation created",
            });
        } else {
            res.status(404).json({ message: "Application not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

// Updated "decline" endpoint
router.put("/decline/:id", async (req, res) => {
    const { userId } = req.body;
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        // Find the application and update its status to "declined"
        const applicationIndex = job.usersApplied.findIndex(
            (app) => app.userId.toString() === userId
        );

        if (applicationIndex !== -1) {
            job.usersApplied[applicationIndex].status = "declined";
            await job.save();
            res.status(200).json({ message: "Application declined" });
        } else {
            res.status(404).json({ message: "Application not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server error" });
    }
});

router.get("/:id", async (req, res) => {
    try {
        const job = await Job.findById(req.params.id).populate(
            "usersApplied.userId",
            "userName avatar walletAddress" // Ensure walletAddress is included here
        );
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }
        res.json(job);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});
// Re-assign applicant and revoke previous one
router.put("/reassign/:id", async (req, res) => {
    const { newApplicantWallet, userId } = req.body;
    try {
        const job = await Job.findById(req.params.id);
        if (!job) {
            return res.status(404).json({ message: "Job not found" });
        }

        // Find the currently approved applicant and revoke them
        const approvedApplicantIndex = job.usersApplied.findIndex(
            (app) => app.status === "approved"
        );

        if (approvedApplicantIndex !== -1) {
            job.usersApplied[approvedApplicantIndex].status = "revoked";
        }

        // Approve the new applicant
        const newApplicantIndex = job.usersApplied.findIndex(
            (app) => app.walletAddress === newApplicantWallet
        );

        if (newApplicantIndex !== -1) {
            job.usersApplied[newApplicantIndex].status = "approved";
            job.approvedApplicantWallet = newApplicantWallet;

            // Save the changes to the database
            await job.save();

            res.status(200).json({
                message: "Applicant reassigned successfully",
            });
        } else {
            res.status(404).json({ message: "New applicant not found" });
        }
    } catch (error) {
        console.error("Error reassigning applicant:", error);
        res.status(500).json({ message: "Server error" });
    }
});
// Issue a refund and update job status
router.put("/refund/:id", async (req, res) => {
    try {
        console.log(
            "Refund request received for Smart Contract Job ID:",
            req.params.id
        );

        // Find the job using smartContractJobId instead of _id
        const job = await Job.findOne({ smartContractJobId: req.params.id });

        if (!job) {
            console.log(
                "Job not found for Smart Contract Job ID:",
                req.params.id
            );
            return res.status(404).json({ message: "Job not found" });
        }

        // Ensure the job has not already been refunded or completed
        if (job.isComplete || job.isRefunded || job.status === "refunded") {
            return res
                .status(400)
                .json({ message: "Job is already completed or refunded." });
        }

        // Set the job as refunded and update the status
        job.isRefunded = true;
        job.status = "refunded";

        // Revoke the approved applicant's status if applicable
        job.usersApplied = job.usersApplied.map((app) => {
            if (app.status === "approved") {
                return { ...app, status: "revoked" };
            }
            return app;
        });

        // Save the updated job status in the database
        await job.save();

        console.log("Job successfully marked as refunded:", job);
        res.status(200).json({
            message:
                "Job refund issued successfully, applicant revoked, and job status updated to 'refunded'.",
        });
    } catch (error) {
        console.error("Error processing refund:", error);
        res.status(500).json({ message: "Server error." });
    }
});

// Middleware function to get a job by ID
async function getJob(req, res, next) {
    let job;
    try {
        job = await Job.findById(req.params.id).populate("user");
        if (job == null) {
            return res.status(404).json({ message: "Cannot find job" });
        }
    } catch (err) {
        return res.status(500).json({ message: err.message });
    }

    res.job = job;
    next();
}

module.exports = router;
