import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import Navbar from "../Navbar/Navbar";
import { WalletContext } from "../Navbar/walletContext";
import { Link } from "react-router-dom";

function MyAppliedJobs() {
    const { user } = useContext(WalletContext); // Access user from WalletContext
    const [appliedJobs, setAppliedJobs] = useState([]); // Initialize jobs state
    const [loading, setLoading] = useState(true); // For handling loading state

    // Fetch the jobs that the user has applied to using the new route
    const fetchAppliedJobs = async () => {
        try {
            const response = await axios.get(
                `http://localhost:3001/jobs/applied/${user.walletAddress}`
            );
            setAppliedJobs(response.data); // Set the fetched jobs to state
            setLoading(false); // Stop loading
        } catch (error) {
            console.error("Error fetching applied jobs:", error);
            setLoading(false); // Stop loading in case of error
        }
    };

    // Call fetchAppliedJobs on component mount
    useEffect(() => {
        if (user.walletAddress) {
            fetchAppliedJobs();
        }
    }, [user.walletAddress]);

    if (loading) {
        return <div>Loading your applied jobs...</div>;
    }

    // Function to determine the application status and if the job is complete
    const getApplicationStatus = (job) => {
        if (job.isComplete) {
            return "Completed"; // If the job is marked as complete
        }

        const application = job.usersApplied.find(
            (applicant) => applicant.walletAddress === user.walletAddress
        );

        if (!application) return "Not Applied";

        switch (application.status) {
            case "approved":
                return "Approved";
            case "declined":
                return "Declined";
            case "revoked":
                return "Revoked";
            case "paymentReleased":
                return "Payment Released";
            default:
                return "Pending";
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            {/* Navbar */}
            <Navbar />

            {/* Main content */}
            <div className="flex flex-col items-center mt-8">
                <h1 className="text-2xl font-semibold mb-6">
                    Jobs Application
                </h1>
                {appliedJobs.length > 0 ? (
                    <div className="w-full max-w-4xl px-5">
                        {appliedJobs.map((job) => (
                            <div
                                key={job._id}
                                className="border p-4 mb-4 rounded-lg shadow-md">
                                <Link to={`/workview/${job._id}`}>
                                    <h2 className="text-xl font-bold text-blue-600 hover:underline cursor-pointer">
                                        {job.title}
                                    </h2>
                                </Link>
                                <p className="text-gray-600">
                                    Budget: ${job.budget}
                                </p>
                                <p>{job.description}</p>
                                <div className="flex flex-wrap mt-2">
                                    {job.skills.map((tag, index) => (
                                        <span
                                            key={index}
                                            className="bg-gray-100 text-gray-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <p className="mt-2 text-gray-700">
                                    Application Status:{" "}
                                    <span
                                        className={
                                            getApplicationStatus(job) ===
                                            "Completed"
                                                ? "text-green-600"
                                                : getApplicationStatus(job) ===
                                                  "Approved"
                                                ? "text-yellow-600"
                                                : getApplicationStatus(job) ===
                                                  "Declined"
                                                ? "text-red-600"
                                                : getApplicationStatus(job) ===
                                                  "Revoked"
                                                ? "text-red-600"
                                                : getApplicationStatus(job) ===
                                                  "Payment Released"
                                                ? "text-blue-600"
                                                : "text-blue-600"
                                        }>
                                        {getApplicationStatus(job)}
                                    </span>
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>You haven't applied to any jobs yet.</p>
                )}
            </div>
        </div>
    );
}

export default MyAppliedJobs;
