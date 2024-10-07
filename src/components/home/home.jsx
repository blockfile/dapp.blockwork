import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../Navbar/Navbar";
import { Link } from "react-router-dom";
function Home() {
    const [searchQuery, setSearchQuery] = useState("");
    const [category, setCategory] = useState("");
    const [experienceLevel, setExperienceLevel] = useState("");
    const [jobType, setJobType] = useState("");
    const [priceRange, setPriceRange] = useState([0, 1000]);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch jobs from the backend when the component mounts
    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const response = await axios.get("http://localhost:3001/jobs");
                setJobs(response.data);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching jobs:", error);
                setLoading(false);
            }
        };

        fetchJobs();
    }, []);

    // Handle search and filter changes
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    // Handle applying to a job
    const handleApply = (jobId) => {
        console.log(`Applied to job with ID: ${jobId}`);
        // Implement the logic to apply to a job (e.g., send POST request)
    };

    // Filter jobs based on search query, category, experience level, and price range
    // Home.jsx

    // Filter jobs based on search query, category, experience level, price range, and exclude jobs with approved or complete status
    const filteredJobs = jobs.filter((job) => {
        // Check if any of the applications have the status "approved" or "complete"
        const hasApprovedOrCompleteApplicant = job.usersApplied.some(
            (application) =>
                application.status === "approved" ||
                application.status === "complete" ||
                application.status === "revoked"
        );

        return (
            !hasApprovedOrCompleteApplicant && // Exclude jobs with an approved or complete applicant
            job.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
            (category ? job.skills.includes(category) : true) &&
            (experienceLevel
                ? job.experienceLevel === experienceLevel
                : true) &&
            (jobType ? job.jobType === jobType : true) &&
            parseInt(job.budget) >= priceRange[0] &&
            parseInt(job.budget) <= priceRange[1]
        );
    });

    if (loading) {
        return <p>Loading jobs...</p>; // Display loading state while fetching jobs
    }

    return (
        <div className="min-h-screen flex flex-col">
            {/* Navbar at the top */}
            <Navbar />

            {/* Content below navbar centered on page */}
            <div className="flex justify-center w-full mt-6">
                {/* Main content container with a max width */}
                <div className="flex w-full max-w-7xl">
                    {/* Sidebar Filters */}
                    <div className="w-1/4 p-4 border-r border-gray-200">
                        <h3 className="font-semibold mb-4">Filters</h3>

                        {/* Category Filter */}
                        <div className="mb-4">
                            <label className="block font-semibold mb-2">
                                Category
                            </label>
                            <select
                                className="w-full p-2 border border-gray-300 rounded"
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}>
                                <option value="">All Categories</option>
                                <option value="Network Administration">
                                    Network Administration
                                </option>
                                <option value="Docker">Docker</option>
                                <option value="AWS">AWS</option>
                            </select>
                        </div>

                        {/* Experience Level Filter */}
                        <div className="mb-4">
                            <label className="block font-semibold mb-2">
                                Experience Level
                            </label>
                            <select
                                className="w-full p-2 border border-gray-300 rounded"
                                value={experienceLevel}
                                onChange={(e) =>
                                    setExperienceLevel(e.target.value)
                                }>
                                <option value="">All Levels</option>
                                <option value="Entry Level">Entry Level</option>
                                <option value="Intermediate">
                                    Intermediate
                                </option>
                                <option value="Expert">Expert</option>
                            </select>
                        </div>

                        {/* Job Type Filter */}
                        <div className="mb-4">
                            <label className="block font-semibold mb-2">
                                Job Type
                            </label>
                            <select
                                className="w-full p-2 border border-gray-300 rounded"
                                value={jobType}
                                onChange={(e) => setJobType(e.target.value)}>
                                <option value="">All Job Types</option>
                                <option value="Hourly">Hourly</option>
                                <option value="Fixed-Price">Fixed-Price</option>
                            </select>
                        </div>

                        {/* Price Range Filter */}
                        <div className="mb-4">
                            <label className="block font-semibold mb-2">
                                Price Range (Budget)
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="10000"
                                value={priceRange[1]}
                                className="w-full"
                                onChange={(e) =>
                                    setPriceRange([0, e.target.value])
                                }
                            />
                            <div className="flex justify-between text-sm">
                                <span>$0</span>
                                <span>${priceRange[1]}</span>
                            </div>
                        </div>
                    </div>

                    {/* Job Listings */}
                    <div className=" p-4 w-full">
                        <div className="mb-4 ">
                            <input
                                type="text"
                                placeholder="Search for jobs"
                                className="w-full p-2 border border-gray-300 rounded"
                                value={searchQuery}
                                onChange={handleSearchChange}
                            />
                        </div>

                        <div>
                            {filteredJobs.length > 0 ? (
                                filteredJobs.map((job) => (
                                    <div
                                        key={job._id}
                                        className="relative mb-4 p-4 border border-gray-200 rounded shadow-sm text-center hover:border-4 hover:border-blue-500 ">
                                        {/* Centered Title */}

                                        <h2 className="text-xl font-semibold mb-4 text-blue-600 hover:underline cursor-pointer">
                                            {job.title}
                                        </h2>

                                        {/* Logo Below the Title */}
                                        {job.logo && (
                                            <div className="mb-4">
                                                <img
                                                    src={job.logo}
                                                    alt={`${job.title} Logo`}
                                                    className="w-24 h-24 object-cover mx-auto rounded-full"
                                                />
                                            </div>
                                        )}

                                        <p className="text-sm text-gray-600 mb-2 ">
                                            Budget: ${job.budget}
                                        </p>
                                        <p>Job Type: {job.jobType}</p>
                                        <p>
                                            Experience Level:{" "}
                                            {job.experienceLevel}
                                        </p>
                                        <p>{job.description}</p>
                                        <div className="mt-2 flex flex-wrap justify-center">
                                            {job.skills.map((tag, index) => (
                                                <span
                                                    key={index}
                                                    className="bg-gray-100 text-gray-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Apply Button */}
                                        <Link to={`/workview/${job._id}`}>
                                            <button
                                                onClick={() =>
                                                    handleApply(job._id)
                                                }
                                                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
                                                Apply
                                            </button>
                                        </Link>
                                    </div>
                                ))
                            ) : (
                                <p>No jobs found matching your criteria.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;
