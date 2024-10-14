import React, { useState, useContext } from "react";
import axios from "axios";
import Navbar from "../Navbar/Navbar"; // Import the Navbar component
import { WalletContext } from "../Navbar/walletContext"; // Import the WalletContext
import Web3 from "web3"; // Import Web3
import JobEscrowABI from "../home/JobEscrowABI.json";
import USDT_ABI from "../home/USDT_ABI.json";
import "./posting.css";
function Posting() {
    const { user } = useContext(WalletContext); // Access the user from WalletContext

    const [logo, setLogo] = useState(null);
    const [logoPreview, setLogoPreview] = useState(null);
    const [jobTitle, setJobTitle] = useState("");
    const [budget, setBudget] = useState("");
    const [description, setDescription] = useState("");
    const [tags, setTags] = useState("");
    const [location, setLocation] = useState("");
    const [jobType, setJobType] = useState("Fixed-Price"); // Default to "Fixed-Price"
    const [experienceLevel, setExperienceLevel] = useState("");
    const [paymentVerified, setPaymentVerified] = useState(false);
    const [responsibilities, setResponsibilities] = useState("");
    const [requirements, setRequirements] = useState("");
    const [banner, setBanner] = useState(null); // New state for banner
    const [bannerPreview, setBannerPreview] = useState(null);
    const escrowContractAddress = "0x2dfe9af3a53d02f94b8ef918577b743322a679df"; // Your escrow contract address
    const usdtContractAddress = "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd"; // Your USDT contract address
    const web3 = new Web3(window.ethereum);
    const escrowContract = new web3.eth.Contract(
        JobEscrowABI,
        escrowContractAddress
    );
    const usdtContract = new web3.eth.Contract(USDT_ABI, usdtContractAddress);
    const getBase64 = (file, callback) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => callback(reader.result);
        reader.onerror = (error) =>
            console.error("Error converting to base64:", error);
    };

    const handleLogoUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setLogo(file);
            setLogoPreview(URL.createObjectURL(file)); // Preview the logo
        }
    };
    const handleBannerUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            setBanner(file);
            setBannerPreview(URL.createObjectURL(file)); // Preview the banner
        }
    };
    const handleSubmit = (e) => {
        e.preventDefault();

        if (
            !jobTitle ||
            !description ||
            !budget ||
            !tags ||
            !jobType ||
            !experienceLevel
        ) {
            alert("Please fill in all required fields.");
            return;
        }

        if (logo && banner) {
            getBase64(logo, (base64Logo) => {
                getBase64(banner, async (base64Banner) => {
                    const jobData = {
                        title: jobTitle,
                        budget: parseFloat(budget),
                        description,
                        tags: tags.split(","),
                        logo: base64Logo,
                        banner: base64Banner,
                        walletAddress: user.walletAddress,
                        jobType,
                        experienceLevel,
                        responsibilities: responsibilities.split("\n"),
                        requirements: requirements.split("\n"),
                    };

                    try {
                        // Step 1: Approve USDT transfer
                        const usdtAmount = web3.utils.toWei(
                            budget.toString(),
                            "ether"
                        );

                        await usdtContract.methods
                            .approve(escrowContractAddress, usdtAmount)
                            .send({ from: user.walletAddress });

                        // Step 2: Call the smart contract postJob function
                        await escrowContract.methods
                            .postJob(
                                usdtAmount,
                                jobTitle,
                                description,
                                tags.split(",")
                            )
                            .send({ from: user.walletAddress });

                        // Get the updated job count
                        const jobCount = await escrowContract.methods
                            .jobCount()
                            .call();
                        console.log("Job created with ID:", jobCount);

                        // Convert jobCount to a string
                        const jobCountString = jobCount.toString();

                        // Ensure both `smartContractJobId` and `jobId` are strings
                        jobData.smartContractJobId = jobCountString;
                        jobData.jobId = jobCountString;

                        // Step 4: Save job data in your backend
                        const response = await axios.post(
                            "http://localhost:3001/jobs",
                            jobData
                        );
                        console.log("Job created:", response.data);
                        alert("Job posted successfully!");
                    } catch (error) {
                        console.error("Error posting the job:", error);
                    }
                });
            });
        } else {
            alert("Please upload both a logo and a banner!");
        }
    };

    return (
        <div className="min-h-screen flex flex-col">
            {/* Navbar at the top */}
            <Navbar />

            {/* Job posting form */}
            <div className="flex justify-center items-center flex-grow mt-5 mb-5 font-bruno ">
                <div className="w-full max-w-3xl mx-2 p-6   rounded-xl ">
                    <h1 className="text-2xl font-semibold text-center mb-6 ">
                        Job Posting
                    </h1>

                    <form onSubmit={handleSubmit}>
                        {/* Company Logo Upload */}
                        <div className="mb-4 text-center ">
                            <div className="mb-4 text-center">
                                <label
                                    htmlFor="banner-upload"
                                    className="block text-sm font-medium text-white  mb-2 cursor-pointer">
                                    Job Banner
                                </label>
                                <div className="relative group  ">
                                    <label
                                        htmlFor="banner-upload"
                                        className="cursor-pointer ">
                                        {bannerPreview ? (
                                            <img
                                                src={bannerPreview}
                                                alt="Banner Preview"
                                                className="w-full h-36 object-cover  rounded-t-lg mx-auto"
                                            />
                                        ) : (
                                            <div className="w-full h-36 bg-gray-300 rounded-t-lg flex justify-center items-center text-gray-500 ">
                                                Upload Banner
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-50 flex justify-center items-center rounded-t-lg ">
                                            <span className="text-white opacity-0 group-hover:opacity-100">
                                                Upload Banner
                                            </span>
                                        </div>
                                    </label>
                                    <input
                                        id="banner-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleBannerUpload}
                                        className="hidden"
                                    />
                                </div>
                            </div>
                            <label
                                htmlFor="logo-upload"
                                className="block text-sm font-medium text-white mb-2 cursor-pointer">
                                Company Logo
                            </label>
                            <div className="relative group inline-block">
                                <label
                                    htmlFor="logo-upload"
                                    className="cursor-pointer">
                                    {logoPreview ? (
                                        <img
                                            src={logoPreview}
                                            alt="Logo Preview"
                                            className="w-32 h-32 object-cover rounded-full mx-auto"
                                        />
                                    ) : (
                                        <div className="w-32 h-32 bg-gray-300 rounded-full flex justify-center items-center text-gray-500">
                                            Upload Logo
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-50 flex justify-center items-center rounded-full">
                                        <span className="text-white opacity-0 group-hover:opacity-100">
                                            Upload Logo
                                        </span>
                                    </div>
                                </label>
                                <input
                                    id="logo-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleLogoUpload}
                                    className="hidden"
                                />
                            </div>
                        </div>

                        {/* Job Title */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-white mb-2">
                                Job Title
                            </label>
                            <input
                                type="text"
                                className="w-full p-2 border hover:border-4 hover:rounded rounded text-black hover:border-blue-600"
                                placeholder="Enter job title"
                                value={jobTitle}
                                onChange={(e) => setJobTitle(e.target.value)}
                                required
                            />
                        </div>

                        {/* Budget */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-white mb-2">
                                Budget (USDT)
                            </label>
                            <input
                                type="number"
                                className="w-full p-2 border border-gray-300 rounded text-black"
                                placeholder="Enter budget (e.g., 75)"
                                value={budget}
                                onChange={(e) => setBudget(e.target.value)}
                                required
                            />
                        </div>

                        {/* Job Type */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-white mb-2">
                                Job Type
                            </label>
                            <select
                                className="w-full p-2 border border-gray-300 rounded text-black"
                                value={jobType}
                                disabled // Disable the dropdown
                            >
                                <option value="Fixed-Price">Fixed-Price</option>
                            </select>
                        </div>

                        {/* Experience Level */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-white mb-2">
                                Experience Level
                            </label>
                            <select
                                className="w-full p-2 border border-gray-300 rounded text-black"
                                value={experienceLevel}
                                onChange={(e) =>
                                    setExperienceLevel(e.target.value)
                                }
                                required>
                                <option value="">
                                    Select Experience Level
                                </option>
                                <option value="Entry Level">Entry Level</option>
                                <option value="Intermediate">
                                    Intermediate
                                </option>
                                <option value="Expert">Expert</option>
                            </select>
                        </div>

                        {/* Responsibilities */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-white mb-2">
                                Responsibilities
                            </label>
                            <textarea
                                className="w-full p-2 border border-gray-300 rounded text-black"
                                placeholder="Enter responsibilities, each on a new line"
                                value={responsibilities}
                                onChange={(e) =>
                                    setResponsibilities(e.target.value)
                                }
                                rows="4"
                                required></textarea>
                        </div>

                        {/* Requirements */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-white mb-2">
                                Requirements
                            </label>
                            <textarea
                                className="w-full p-2 border border-gray-300 rounded text-black"
                                placeholder="Enter requirements, each on a new line"
                                value={requirements}
                                onChange={(e) =>
                                    setRequirements(e.target.value)
                                }
                                rows="4"
                                required></textarea>
                        </div>

                        {/* Description */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-white mb-2">
                                Description
                            </label>
                            <textarea
                                className="w-full p-2 border border-gray-300 rounded text-black"
                                placeholder="Describe the job..."
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows="4"
                                required></textarea>
                        </div>

                        {/* Tags */}
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-white mb-2">
                                Tags (comma separated)
                            </label>
                            <input
                                type="text"
                                className="w-full p-2 border border-gray-300 rounded text-black"
                                placeholder="e.g., Docker, DevOps, Networking"
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="text-center">
                            <button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded">
                                Post Job
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default Posting;
