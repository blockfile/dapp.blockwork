const express = require("express");
const router = express.Router();
const User = require("../model/userSchema");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Set up multer for storing uploaded files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = path.join(__dirname, "..", "uploads", "avatars");
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(
            null,
            `${req.body.walletAddress}_${Date.now()}${path.extname(
                file.originalname
            )}`
        );
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 }, // Limit file size to 50MB
});

router.post("/delete-portfolio", async (req, res) => {
    const { walletAddress, portfolioId } = req.body;

    if (!walletAddress || !portfolioId) {
        return res.status(400).json({
            message: "Wallet address and portfolio item ID are required.",
        });
    }

    try {
        const user = await User.findOne({ walletAddress });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Remove the portfolio item by its ID
        user.portfolio = user.portfolio.filter(
            (item) => item._id.toString() !== portfolioId
        );

        await user.save();

        res.status(200).json(user); // Respond with the updated user data
    } catch (error) {
        console.error("Error deleting portfolio item:", error);
        res.status(500).json({ message: "Server error." });
    }
});
router.post("/update-name", async (req, res) => {
    const { walletAddress, userName } = req.body;

    if (!walletAddress || !userName) {
        return res.status(400).json({
            message: "Wallet address and username are required.",
        });
    }

    try {
        const user = await User.findOne({ walletAddress });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        user.userName = userName;
        await user.save();

        console.log("Updated user:", user); // Debugging log to confirm update

        res.status(200).json(user);
    } catch (error) {
        console.error("Error updating username:", error);
        res.status(500).json({ message: "Server error." });
    }
});

// Add or update work history
router.post("/update-work-history", async (req, res) => {
    const {
        walletAddress,
        jobTitle,
        company,
        startDate,
        endDate,
        description,
    } = req.body;

    if (!walletAddress || !jobTitle || !company || !startDate) {
        return res.status(400).json({
            message:
                "Wallet address, job title, company, and start date are required.",
        });
    }

    try {
        const user = await User.findOne({ walletAddress });
        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Check if the work history entry already exists (based on jobTitle and company for example)
        const existingEntry = user.workHistory.find(
            (item) =>
                item.jobTitle === jobTitle &&
                item.company === company &&
                item.startDate === startDate
        );

        if (existingEntry) {
            // If the entry exists, update it
            existingEntry.endDate = endDate || existingEntry.endDate;
            existingEntry.description =
                description || existingEntry.description;
        } else {
            // Otherwise, push a new entry
            user.workHistory.push({
                jobTitle,
                company,
                startDate,
                endDate,
                description,
            });
        }

        await user.save();
        res.status(200).json(user); // Return updated user data
    } catch (error) {
        console.error("Error updating work history:", error);
        res.status(500).json({ message: "Server error." });
    }
});

router.post("/delete-work-history", async (req, res) => {
    const { walletAddress, workHistoryId } = req.body;

    if (!walletAddress || !workHistoryId) {
        return res.status(400).json({
            message: "Wallet address and work history ID are required.",
        });
    }

    try {
        const user = await User.findOne({ walletAddress });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Remove the work history item by its ID
        user.workHistory = user.workHistory.filter(
            (item) => item._id.toString() !== workHistoryId
        );

        await user.save();

        res.status(200).json(user); // Respond with the updated user data
    } catch (error) {
        console.error("Error deleting work history:", error);
        res.status(500).json({ message: "Server error." });
    }
});

// Update portfolio
router.post("/update-portfolio", async (req, res) => {
    const { walletAddress, title, role, description, skills, content } =
        req.body;

    // Log the request data to verify
    console.log("Received portfolio data:", req.body);

    if (!walletAddress || !title || !description || !skills || !content) {
        return res.status(400).json({ message: "All fields are required." });
    }

    try {
        const user = await User.findOne({ walletAddress });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Add the new project to the portfolio
        user.portfolio.push({
            title,
            role,
            description,
            skills: Array.isArray(skills) ? skills : [skills], // Ensure skills is an array
            content,
        });

        await user.save();
        res.status(200).json(user);
    } catch (error) {
        console.error("Error updating portfolio:", error);
        res.status(500).json({ message: "Server error." });
    }
});

router.post("/create-or-get-user", async (req, res) => {
    const { walletAddress } = req.body;

    if (!walletAddress) {
        return res.status(400).json({ message: "Wallet address is required." });
    }

    try {
        // Try to find the user by wallet address
        let user = await User.findOne({ walletAddress });

        if (!user) {
            // If the user doesn't exist, create a new one
            user = new User({
                walletAddress,
                userName: "", // You can set default values for other fields here
                avatar: "", // Set an empty avatar or provide a default value
            });
            await user.save();
        }

        res.status(200).json(user); // Return the user (newly created or existing)
    } catch (error) {
        console.error("Error fetching or creating user:", error);
        res.status(500).json({ message: "Server error." });
    }
});
router.post("/update-language", async (req, res) => {
    const { walletAddress, language, proficiency } = req.body;

    if (!walletAddress || !language || !proficiency) {
        return res.status(400).json({
            message: "Wallet address, language, and proficiency are required.",
        });
    }

    try {
        // Find the user by wallet address
        const user = await User.findOne({ walletAddress });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Update the user's language and proficiency
        user.languages = [{ language, proficiency }];
        await user.save();

        res.status(200).json(user); // Respond with updated user data
    } catch (error) {
        console.error("Error updating language:", error);
        res.status(500).json({ message: "Server error." });
    }
});
router.post("/update-education", async (req, res) => {
    const { walletAddress, school, degree } = req.body;

    if (!walletAddress || !school || !degree) {
        return res.status(400).json({
            message: "Wallet address, school, and degree are required.",
        });
    }

    try {
        // Find the user by wallet address
        const user = await User.findOne({ walletAddress });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Update the user's education
        user.education = [{ school, degree }];
        await user.save();

        res.status(200).json(user); // Respond with updated user data
    } catch (error) {
        console.error("Error updating education:", error);
        res.status(500).json({ message: "Server error." });
    }
});
router.post("/update-job-description", async (req, res) => {
    const { walletAddress, jobDescription } = req.body;

    if (!walletAddress || !jobDescription) {
        return res.status(400).json({
            message: "Wallet address and job description are required.",
        });
    }

    try {
        // Find the user by wallet address
        const user = await User.findOne({ walletAddress });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Update the user's job description
        user.jobDescription = jobDescription;
        await user.save();

        res.status(200).json(user); // Respond with updated user data
    } catch (error) {
        console.error("Error updating job description:", error);
        res.status(500).json({ message: "Server error." });
    }
});

router.post("/update-rate", async (req, res) => {
    const { walletAddress, hourlyRate } = req.body;

    if (!walletAddress || hourlyRate === undefined) {
        return res
            .status(400)
            .json({ message: "Wallet address and hourly rate are required." });
    }

    try {
        // Find the user by wallet address
        const user = await User.findOne({ walletAddress: walletAddress });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Update the user's hourly rate
        user.hourlyRate = hourlyRate;
        await user.save();

        res.status(200).json(user); // Respond with updated user data
    } catch (error) {
        console.error("Error updating hourly rate:", error);
        res.status(500).json({ message: "Server error." });
    }
});
router.post("/update-job", async (req, res) => {
    const { walletAddress, jobTitle, jobDescription } = req.body;

    if (!walletAddress || !jobTitle) {
        return res
            .status(400)
            .json({ message: "Wallet address and job title are required." });
    }

    try {
        // Find the user by wallet address
        const user = await User.findOne({ walletAddress: walletAddress });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        // Update the user's job title and description
        user.jobTitle = jobTitle;
        user.jobDescription = jobDescription;
        await user.save();

        res.status(200).json(user); // Respond with updated user data
    } catch (error) {
        console.error("Error updating job information:", error);
        res.status(500).json({ message: "Server error." });
    }
});

router.post("/upload-avatar", async (req, res) => {
    const { walletAddress, avatarData } = req.body;

    if (!walletAddress || !avatarData) {
        return res
            .status(400)
            .json({ message: "Wallet address and avatar data are required" });
    }

    try {
        // Find user by wallet address (case-insensitive)
        const user = await User.findOne({
            walletAddress: {
                $regex: new RegExp("^" + walletAddress + "$", "i"),
            },
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Save base64 encoded avatar string
        user.avatar = avatarData;
        await user.save();

        res.status(200).json(user);
    } catch (error) {
        console.error("Error uploading avatar:", error);
        res.status(500).json({ error: "Server error" });
    }
});

router.get("/:walletAddress", async (req, res) => {
    const { walletAddress } = req.params;

    try {
        const user = await User.findOne({
            walletAddress: {
                $regex: new RegExp("^" + walletAddress + "$", "i"), // Case-insensitive search
            },
        });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json(user);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
