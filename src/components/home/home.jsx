import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import Layout from "../Navbar/Layout";
import Skeleton from "@mui/material/Skeleton";
import "./home.css";

function Home() {
    const [searchQuery, setSearchQuery] = useState("");
    const [category, setCategory] = useState("");
    const [experienceLevel, setExperienceLevel] = useState("");
    const [jobType, setJobType] = useState("");
    const [priceRange, setPriceRange] = useState([0, 1000]);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    const [currentPage, setCurrentPage] = useState(1);
    const [totalJobs, setTotalJobs] = useState(0); // For total job count
    const jobsPerPage = 10;

    // Fetch paginated jobs and total job count from the backend
    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const response = await axios.get(
                    `https://dapp.blockworkprotocol.xyz/api/jobs?page=${currentPage}&limit=${jobsPerPage}`
                );
                setJobs(response.data.jobs); // Paginated job data
                setTotalJobs(response.data.total); // Total number of jobs
                setLoading(false);
            } catch (error) {
                console.error("Error fetching jobs:", error);
                setLoading(false);
            }
        };

        fetchJobs();
    }, [currentPage]);

    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    const handleApply = (jobId) => {
        console.log(`Applied to job with ID: ${jobId}`);
    };

    // Filter jobs based on search query, category, experience level, and price range
    const filteredJobs = jobs.filter((job) => {
        const hasApprovedOrCompleteApplicant = job.usersApplied.some(
            (application) =>
                application.status === "approved" ||
                application.status === "complete" ||
                application.status === "revoked"
        );

        return (
            !hasApprovedOrCompleteApplicant &&
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

    // Calculate total number of pages
    const pageNumbers = [];
    for (let i = 1; i <= Math.ceil(totalJobs / jobsPerPage); i++) {
        pageNumbers.push(i);
    }

    const paginate = (pageNumber) => setCurrentPage(pageNumber);

    return (
        <Layout>
            <div className="min-h-screen flex flex-col">
                <div className="flex justify-center w-full mt-6 font-orbitron">
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
                                    className="w-full p-2 border border-gray-300 rounded bg text-black"
                                    value={category}
                                    onChange={(e) =>
                                        setCategory(e.target.value)
                                    }>
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
                                    className="w-full p-2 border border-gray-300 bg rounded text-black"
                                    value={experienceLevel}
                                    onChange={(e) =>
                                        setExperienceLevel(e.target.value)
                                    }>
                                    <option value="">All Levels</option>
                                    <option value="Entry Level">
                                        Entry Level
                                    </option>
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
                                    className="w-full p-2 border border-gray-300 rounded bg text-black"
                                    value={jobType}
                                    onChange={(e) =>
                                        setJobType(e.target.value)
                                    }>
                                    <option value="">All Job Types</option>
                                    <option value="Hourly">Hourly</option>
                                    <option value="Fixed-Price">
                                        Fixed-Price
                                    </option>
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
                            <div className="mb-4">
                                <input
                                    type="text"
                                    placeholder="Search for jobs"
                                    className="w-full p-2 border border-gray-300 rounded bg text-black"
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                />
                            </div>

                            <div>
                                {loading ? (
                                    Array.from(new Array(5)).map((_, index) => (
                                        <Skeleton
                                            key={index}
                                            variant="rectangular"
                                            width="100%"
                                            height={180}
                                            className="mb-4"
                                        />
                                    ))
                                ) : filteredJobs.length > 0 ? (
                                    filteredJobs.map((job) => (
                                        <div
                                            key={job._id}
                                            className="relative mb-4 p-4 text-left bg-black bg-opacity-35 text-white hover:shadow-xl transition-all duration-300 ease-in-out transform hover:scale-95"
                                            style={{
                                                clipPath:
                                                    "polygon(1.05% 0, 97% 0, 100% 16%, 100% 100%, 0 100%, 0 85%, 1.05% 74%)",
                                                backgroundImage:
                                                    "radial-gradient(120% 80% at 50% 0%, transparent 10%, rgba(0, 59, 117, 0.3) 80%)",
                                            }}>
                                            <div className="flex items-center space-x-4">
                                                <div className="w-1/3 h-32 flex items-center justify-center">
                                                    {job.logo ? (
                                                        <img
                                                            src={job.logo}
                                                            alt={`${job.title} Logo`}
                                                            className="object-contain w-full h-full rounded-md"
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full bg-gray-600 rounded-md"></div>
                                                    )}
                                                </div>
                                                <div className="w-2/3 flex flex-col justify-between">
                                                    <h2 className="text-xl font-semibold mb-2 text-white">
                                                        {job.title}
                                                    </h2>
                                                    <p className="text-gray-400 text-sm mb-1">
                                                        Job Type: {job.jobType}
                                                    </p>
                                                    <p className="text-gray-400 text-sm mb-1">
                                                        Experience Level:{" "}
                                                        {job.experienceLevel}
                                                    </p>
                                                    <p className="text-gray-400 text-sm">
                                                        Budget: ${job.budget}
                                                    </p>
                                                    <div className="mt-2 flex flex-wrap">
                                                        {job.skills.map(
                                                            (tag, index) => (
                                                                <span
                                                                    key={index}
                                                                    className="bg-blue-600 text-white text-xs font-semibold mr-2 px-2.5 py-0.5 rounded">
                                                                    {tag}
                                                                </span>
                                                            )
                                                        )}
                                                    </div>
                                                    <Link
                                                        to={`/workview/${job._id}`}>
                                                        <button className="mt-4 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded">
                                                            Apply
                                                        </button>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p>No jobs found matching your criteria.</p>
                                )}

                                {/* Pagination */}
                                {totalJobs > jobsPerPage && (
                                    <div className="flex justify-center mt-4 space-x-2">
                                        {currentPage > 1 && (
                                            <button
                                                onClick={() =>
                                                    paginate(currentPage - 1)
                                                }
                                                className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-l">
                                                Prev
                                            </button>
                                        )}

                                        {pageNumbers.map((number) => (
                                            <button
                                                key={number}
                                                onClick={() => paginate(number)}
                                                className={`${
                                                    currentPage === number
                                                        ? "bg-blue-500 text-white"
                                                        : "bg-gray-300 text-black"
                                                } hover:bg-gray-400 px-4 py-2`}>
                                                {number}
                                            </button>
                                        ))}

                                        {currentPage < pageNumbers.length && (
                                            <button
                                                onClick={() =>
                                                    paginate(currentPage + 1)
                                                }
                                                className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded-r">
                                                Next
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
}

export default Home;
