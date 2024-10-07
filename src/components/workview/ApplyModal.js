// ApplyModal.jsx
import React, { useState, useContext } from "react";
import axios from "axios";
import { WalletContext } from "../Navbar/walletContext";

function ApplyModal({ jobId, onClose, onApplicationSubmit }) {
    const { user } = useContext(WalletContext); // Access user from WalletContext
    const [coverLetter, setCoverLetter] = useState("");

    const handleApply = async () => {
        if (!coverLetter) {
            alert("Please fill in your cover letter.");
            return;
        }

        try {
            // Prepare the data for the application
            const applicationData = {
                jobId: jobId,
                userId: user._id, // Assuming user._id is available in WalletContext
                userName: user.userName,
                coverLetter: coverLetter,
                walletAddress: user.walletAddress, // Include walletAddress
            };

            // Send the application data to the backend
            const response = await axios.post(
                "http://localhost:3001/jobs/apply",
                applicationData
            );
            if (response.status === 200) {
                alert("Application submitted successfully!");
                onClose(); // Close the modal
                onApplicationSubmit("pending"); // Notify the parent about the status change
            }
        } catch (error) {
            console.error("Error applying for the job:", error);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50"
            onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="bg-white p-6 rounded-lg w-1/3">
                <button
                    className="absolute top-2 right-2 text-gray-600 text-2xl font-bold"
                    onClick={onClose}>
                    &times;
                </button>
                <h2 className="text-2xl font-semibold mb-4 text-center">
                    Apply for the Job
                </h2>
                <textarea
                    className="w-full p-2 border border-gray-300 rounded"
                    rows="5"
                    placeholder="Enter your cover letter..."
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}></textarea>
                <div className="text-center mt-4">
                    <button
                        className="bg-blue-600 text-white px-4 py-2 rounded"
                        onClick={handleApply}>
                        Send Application
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ApplyModal;
