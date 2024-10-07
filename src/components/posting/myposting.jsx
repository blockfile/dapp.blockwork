import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import Navbar from "../Navbar/Navbar"; // Import the Navbar component
import { WalletContext } from "../Navbar/walletContext"; // Import the WalletContext
import { Link } from "react-router-dom";

function MyPosting() {
    const { user } = useContext(WalletContext); // Access user from WalletContext
    const [jobs, setJobs] = useState([]); // Initialize jobs state
    const [loading, setLoading] = useState(true); // For handling loading state

    // Fetch the posted jobs by the logged-in user using the new route
    const fetchPostedJobs = async () => {
        try {
            // Fetch jobs using the new route with user's wallet address
            const response = await axios.get(
                `http://localhost:3001/jobs/my-posts/${user.walletAddress}`
            );
            setJobs(response.data); // Set the fetched jobs to state
            setLoading(false); // Stop loading
        } catch (error) {
            console.error("Error fetching posted jobs:", error);
            setLoading(false); // Stop loading in case of error
        }
    };

    // Call fetchPostedJobs on component mount
    useEffect(() => {
        if (user.walletAddress) {
            fetchPostedJobs();
        }
    }, [user.walletAddress]);

    if (loading) {
        return <div>Loading your posted jobs...</div>;
    }

    // Function to determine job status based on usersApplied and isComplete
    const getJobStatus = (job) => {
        if (job.status === "refunded") {
            return "Refunded";
        }

        if (job.isComplete) {
            return "Completed";
        }

        const approvedUser = job.usersApplied.find(
            (application) => application.status === "approved"
        );

        if (approvedUser) {
            return "In Progress (Assigned)";
        }

        return "Open for Applications";
    };

    return (
        <div className="min-h-screen flex flex-col">
            {/* Navbar */}
            <Navbar />

            {/* Main content */}
            <div className="flex flex-col items-center mt-8">
                <h1 className="text-2xl font-semibold mb-6">My Posted Jobs</h1>
                {jobs.length > 0 ? (
                    <div className="w-full max-w-4xl px-5">
                        {jobs.map((job) => (
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
                                    Status:{" "}
                                    <span
                                        className={
                                            getJobStatus(job) === "Completed"
                                                ? "text-green-600"
                                                : getJobStatus(job) ===
                                                  "Refunded"
                                                ? "text-red-600" // Refunded will be displayed in red
                                                : getJobStatus(job).includes(
                                                      "In Progress"
                                                  )
                                                ? "text-yellow-600"
                                                : "text-blue-600"
                                        }>
                                        {getJobStatus(job)}
                                    </span>
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p>You haven't posted any jobs yet.</p>
                )}
            </div>
        </div>
    );
}

export default MyPosting;
