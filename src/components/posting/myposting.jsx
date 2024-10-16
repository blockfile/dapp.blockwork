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
                `https://dapp.blockworkprotocol.xyz/api/jobs/my-posts/${user.walletAddress}`
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
            <div className="flex flex-col items-center mt-8 font-orbitron">
                <h1 className="text-2xl font-semibold mb-6">My Posted Jobs</h1>
                {jobs.length > 0 ? (
                    <div className="w-full max-w-3xl px-5">
                        {jobs.map((job) => (
                            <div
                                key={job._id}
                                className="relative mb-4 p-4 text-left bg-black text-white shadow-lg hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-95"
                                style={{
                                    clipPath:
                                        "polygon(1.05% 0, 97% 0, 100% 16%, 100% 100%, 0 100%, 0 85%, 1.05% 74%)", // Custom polygon clip-path
                                    backgroundImage:
                                        "radial-gradient(120% 80% at 50% 0%, transparent 10%, rgba(0, 59, 117, 0.3) 80%)",
                                    boxShadow: "inset 0 0 10px rgba(0,0,0,0.5)", // Embossing effect
                                }}>
                                <div className="flex items-center space-x-4">
                                    {/* Left-side (Image/Avatar) */}
                                    <div className=" w-1/4">
                                        {job.logo ? (
                                            <img
                                                src={job.logo}
                                                alt={`${job.title} Logo`}
                                                className="object-cover w-full h-auto rounded-md"
                                            />
                                        ) : (
                                            <div className="w-full h-32 bg-gray-600 rounded-md"></div>
                                        )}
                                    </div>

                                    {/* Right-side (Details) */}
                                    <div className="w-1/2">
                                        <Link to={`/workview/${job._id}`}>
                                            <h2 className="text-xl font-semibold mb-2 text-white hover:underline cursor-pointer">
                                                {job.title}
                                            </h2>
                                        </Link>
                                        <p className="text-gray-400 text-sm mb-1">
                                            Budget: ${job.budget}
                                        </p>
                                        <p className="text-gray-400 text-sm mb-1">
                                            Status:{" "}
                                            <span
                                                className={
                                                    getJobStatus(job) ===
                                                    "Completed"
                                                        ? "text-green-600"
                                                        : getJobStatus(job) ===
                                                          "Refunded"
                                                        ? "text-red-600"
                                                        : getJobStatus(
                                                              job
                                                          ).includes(
                                                              "In Progress"
                                                          )
                                                        ? "text-yellow-600"
                                                        : "text-blue-600"
                                                }>
                                                {getJobStatus(job)}
                                            </span>
                                        </p>
                                        <div className="mt-2 flex flex-wrap">
                                            {job.skills.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="bg-blue-600 text-white text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
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
