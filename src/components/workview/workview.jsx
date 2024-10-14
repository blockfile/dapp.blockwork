import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "../Navbar/Navbar";
import WorkViewModal from "./WorkViewModal";
import { WalletContext } from "../Navbar/walletContext";
import ApplyModal from "./ApplyModal";
import JobEscrowABI from "../home/JobEscrowABI.json";
import Web3 from "web3";

function WorkView() {
    const { jobId } = useParams();
    const [job, setJob] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const { user } = useContext(WalletContext);
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [isAssigned, setIsAssigned] = useState(false);
    const [applicationStatus, setApplicationStatus] = useState(null);
    const [newApplicantWallet, setNewApplicantWallet] = useState(""); // New state for the selected applicant
    const web3 = new Web3(window.ethereum);
    const navigate = useNavigate();

    const escrowContractAddress = "0x2dfe9af3a53d02f94b8ef918577b743322a679df";
    const escrowContract = new web3.eth.Contract(
        JobEscrowABI,
        escrowContractAddress
    );

    // Fetch the job details using the jobId
    useEffect(() => {
        const fetchJobDetails = async () => {
            try {
                const response = await axios.get(
                    `http://localhost:3001/jobs/${jobId}`
                );
                console.log(response.data); // Log the full job data to verify

                setJob(response.data);

                // Check if the job has already been assigned
                if (
                    response.data.usersApplied.some(
                        (app) => app.status === "approved"
                    )
                ) {
                    setIsAssigned(true);
                }

                // Check the status of the current user's application using walletAddress
                const userApplication = response.data.usersApplied.find(
                    (app) => app.walletAddress === user.walletAddress
                );

                if (userApplication) {
                    console.log(
                        "User Application Status:",
                        userApplication.status
                    ); // Log the application status
                    setApplicationStatus(userApplication.status); // Set the application status from the database
                }
            } catch (error) {
                console.error("Error fetching job details:", error);
            }
        };

        fetchJobDetails();
    }, [jobId, user.walletAddress]);

    if (!job) {
        return <div>Loading...</div>;
    }

    const handleOpenModal = () => {
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
    };

    const handleAssign = () => {
        setIsAssigned(true);
        handleCloseModal();
    };

    const handleOpenApplyModal = () => {
        setShowApplyModal(true);
    };

    const handleCloseApplyModal = () => {
        setShowApplyModal(false);
    };

    // Modify the handleChat function to navigate based on jobId
    const handleChat = () => {
        // Navigate to the messages page with the jobId
        navigate(`/messages/${jobId}`);
    };

    const handleReleasePayment = async () => {
        try {
            // Ensure job is assigned and has an approvedApplicantWallet
            if (!job.approvedApplicantWallet) {
                alert("No approved applicant for this job.");
                return;
            }

            const jobIdNumber = parseInt(job.smartContractJobId, 10);

            if (isNaN(jobIdNumber) || jobIdNumber <= 0) {
                alert("Invalid Smart Contract Job ID.");
                return;
            }

            // Call the releasePayment function from the smart contract
            await escrowContract.methods
                .releasePayment(jobIdNumber)
                .send({ from: user.walletAddress });

            // Update the backend to mark this job as completed
            const updateResponse = await axios.put(
                `http://localhost:3001/jobs/complete/${job.smartContractJobId}`
            );

            // Check if the update was successful
            if (updateResponse.status === 200) {
                alert("Payment Released Successfully!");

                // Update the job status to reflect the change
                const updatedJob = { ...job, isComplete: true };
                updatedJob.usersApplied = updatedJob.usersApplied.map((app) => {
                    if (app.status === "approved") {
                        return { ...app, status: "complete" };
                    }
                    return app;
                });

                setJob(updatedJob); // Update the state to show the "Payment Released" button
            }
        } catch (error) {
            console.error("Error releasing payment:", error);
            alert(
                "Error releasing payment. Please check the console for details."
            );
        }
    };

    const handleReassignApplicant = async () => {
        try {
            const jobIdNumber = parseInt(job.smartContractJobId, 10);

            if (isNaN(jobIdNumber) || jobIdNumber <= 0) {
                alert("Invalid Smart Contract Job ID.");
                return;
            }

            // Log the jobIdNumber for debugging purposes
            console.log(
                "Reassigning applicant for Smart Contract Job ID:",
                jobIdNumber
            );

            // Check if there is an approved applicant to revoke
            if (!job.approvedApplicantWallet) {
                alert("No approved applicant to revoke.");
                return;
            }

            // Interact with the smart contract to revoke the current applicant
            await escrowContract.methods
                .revokeApplicant(jobIdNumber)
                .send({ from: job.walletAddress });

            // Approve the new applicant
            await escrowContract.methods
                .approveApplicant(jobIdNumber, newApplicantWallet)
                .send({ from: job.walletAddress });

            // After successfully interacting with the smart contract, update the backend
            const response = await axios.put(
                `http://localhost:3001/jobs/reassign/${job._id}`,
                { newApplicantWallet, userId: user._id }
            );

            // Update the frontend state with the new applicant data
            const updatedJob = { ...job };
            updatedJob.usersApplied = updatedJob.usersApplied.map((app) => {
                if (app.walletAddress === newApplicantWallet) {
                    return { ...app, status: "approved" };
                } else if (app.status === "approved") {
                    return { ...app, status: "revoked" };
                }
                return app;
            });
            updatedJob.approvedApplicantWallet = newApplicantWallet;

            setJob(updatedJob);
            alert(response.data.message);
        } catch (error) {
            console.error("Error reassigning applicant:", error);
            alert(
                "Error reassigning applicant. Please check the console for details."
            );
        }
    };
    const handleRefund = async () => {
        try {
            const jobIdNumber = parseInt(job.smartContractJobId, 10);

            if (isNaN(jobIdNumber) || jobIdNumber <= 0) {
                alert("Invalid Smart Contract Job ID.");
                return;
            }

            // Call the refund function from the smart contract
            await escrowContract.methods
                .refund(jobIdNumber)
                .send({ from: user.walletAddress });

            // Update the backend to reflect the refund status
            const updateResponse = await axios.put(
                `http://localhost:3001/jobs/refund/${job.smartContractJobId}`
            );

            if (updateResponse.status === 200) {
                alert("Refund Issued Successfully!");

                // Update the job state to reflect the refund status
                const updatedJob = {
                    ...job,
                    isRefunded: true,
                    status: "refunded", // Set job status to "refunded"
                    usersApplied: job.usersApplied.map((app) => {
                        if (app.status === "approved") {
                            return { ...app, status: "revoked" };
                        }
                        return app;
                    }),
                };

                setJob(updatedJob); // Update the state to reflect refund and revoked status
            }
        } catch (error) {
            console.error("Error issuing refund:", error);
            alert(
                "Error issuing refund. Please check the console for details."
            );
        }
    };

    return (
        <div className="min-h-screen flex flex-col ">
            {/* Include Navbar at the top */}
            <Navbar />

            {/* Main content container */}
            <div
                className="max-w-5xl mx-auto p-6  border bg-gray-900  border-gray-200 shadow-lg rounded-lg mt-6 pb-5 mb-5"
                style={{
                    backgroundImage:
                        "radial-gradient(120% 80% at 50% 0%, transparent 10%, rgba(0, 59, 117, 0.3) 80%)",
                }}>
                {job.banner && (
                    <div className="mb-4">
                        <img
                            src={job.banner}
                            alt="Job Banner"
                            className="w-full h-auto max-h-96 object-cover rounded-lg"
                        />
                    </div>
                )}
                <div className="flex justify-center my-5">
                    {job.logo && (
                        <img
                            src={job.logo}
                            alt="Company Logo"
                            className="w-16 h-16 object-cover rounded-full mr-4"
                        />
                    )}
                </div>
                {/* Header Section */}
                <div className="flex items-center justify-center mb-4">
                    <div className="flex items-center">
                        <div>
                            <h1 className="font-semibold text-center text-3xl">
                                {job.title}
                            </h1>
                            <p className="text-gray-600">{job.walletAddress}</p>
                        </div>
                    </div>
                </div>
                <hr />
                {/* Job Information Section */}
                <div className="mb-4 space-y-3 text-xl text-justify mt-5">
                    <p className="text-gray-600">
                        <span className="font-semibold">Location: </span>
                        {job.location || "Not specified"}
                    </p>
                    <p className="text-gray-600">
                        <span className="font-semibold">Category: </span>
                        Networks & Systems Administration (Information &
                        Communication Technology)
                    </p>
                    <p className="text-gray-600">
                        <span className="font-semibold">Job Type: </span>
                        {job.jobType}
                    </p>
                    <p className="text-gray-600">
                        <span className="font-semibold">
                            Experience Level:{" "}
                        </span>
                        {job.experienceLevel}
                    </p>
                    <p className="text-gray-600">
                        <span className="font-semibold">Posted: </span>
                        {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                </div>

                {/* Responsibilities Section */}
                <div className="mb-4">
                    <h2 className="text-2xl font-semibold mb-2 text-justify">
                        Responsibilities:
                    </h2>
                    <hr />
                    <ul className="list-disc ml-4 text-gray-700 text-justify text-xl mt-2">
                        {job.responsibilities.map((item, index) => (
                            <li key={index} className="ml-1">
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Requirements Section */}
                <div className="mb-4">
                    <h2 className="text-2xl font-semibold mb-2 text-justify">
                        Job Requirements:
                    </h2>
                    <hr />
                    <ul className="list-disc ml-4 text-gray-700 text-justify text-xl mt-2">
                        {job.requirements.map((item, index) => (
                            <li key={index} className="ml-1">
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Description Section */}
                <div className="mb-4">
                    <h2 className="text-2xl font-semibold mb-2 text-justify">
                        Description:
                    </h2>
                    <p className="text-gray-700 text-justify text-xl">
                        {job.description}
                    </p>
                </div>

                {/* Tags Section */}
                <div className="mb-4">
                    <h2 className="text-2xl font-semibold mb-2 text-justify">
                        Skills:
                    </h2>
                    <div className="flex flex-wrap text-xl">
                        {job.skills.map((tag, index) => (
                            <span
                                key={index}
                                className="bg-blue-100 text-blue-700 px-3 py-1 mr-2 mb-2 rounded-full text-sm">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="text-center mt-5">
                    {/* Check if refund has been issued */}
                    {job.status === "refunded" ? (
                        <button
                            className="bg-gray-500 text-white px-4 py-2 rounded"
                            disabled>
                            Refunded
                        </button>
                    ) : job.status === "refund" ? (
                        <button
                            className="bg-red-500 text-white px-4 py-2 rounded"
                            onClick={handleRefund}>
                            Issue Refund
                        </button>
                    ) : (
                        <>
                            {user.walletAddress === job.walletAddress ? (
                                <>
                                    {!isAssigned &&
                                        job.usersApplied.every(
                                            (app) =>
                                                app.status !== "approved" &&
                                                app.status !== "complete"
                                        ) && (
                                            <button
                                                className="bg-blue-600 text-white px-4 py-2 rounded mr-2"
                                                onClick={handleOpenModal}>
                                                Application List
                                            </button>
                                        )}
                                    {job.usersApplied.some(
                                        (app) => app.status === "complete"
                                    ) ? (
                                        <button
                                            className="bg-green-500 text-white px-4 py-2 rounded ml-2"
                                            disabled>
                                            Payment Released
                                        </button>
                                    ) : (
                                        job.usersApplied.some(
                                            (app) => app.status === "approved"
                                        ) && (
                                            <>
                                                <button
                                                    className="bg-yellow-500 text-white px-4 py-2 rounded ml-2"
                                                    onClick={
                                                        handleReleasePayment
                                                    }>
                                                    Release Payment
                                                </button>
                                                <select
                                                    className="bg-white border border-gray-300 px-4 py-2 rounded ml-2 text-black"
                                                    value={newApplicantWallet}
                                                    onChange={(e) =>
                                                        setNewApplicantWallet(
                                                            e.target.value
                                                        )
                                                    }>
                                                    <option value="">
                                                        Select New Applicant
                                                    </option>
                                                    {job.usersApplied
                                                        .filter(
                                                            (app) =>
                                                                app.status ===
                                                                "Pending"
                                                        )
                                                        .map((app) => (
                                                            <option
                                                                key={
                                                                    app.walletAddress
                                                                }
                                                                value={
                                                                    app.walletAddress
                                                                }>
                                                                {app.userName}
                                                            </option>
                                                        ))}
                                                </select>
                                                <button
                                                    className="bg-red-500 text-white px-4 py-2 rounded ml-2"
                                                    onClick={
                                                        handleReassignApplicant
                                                    }>
                                                    Reassign Applicant
                                                </button>
                                            </>
                                        )
                                    )}
                                </>
                            ) : applicationStatus === "declined" ? (
                                <button
                                    className="bg-red-400 text-white px-4 py-2 rounded mr-2 cursor-not-allowed"
                                    disabled>
                                    Declined
                                </button>
                            ) : applicationStatus === "approved" ? (
                                <button
                                    className="bg-green-500 text-white px-4 py-2 rounded mr-2 cursor-not-allowed"
                                    disabled>
                                    Approved
                                </button>
                            ) : applicationStatus === "complete" ? (
                                <button
                                    className="bg-green-500 text-white px-4 py-2 rounded mr-2 cursor-not-allowed"
                                    disabled>
                                    Payment Released
                                </button>
                            ) : applicationStatus === "Pending" ? (
                                <button
                                    className="bg-gray-400 text-white px-4 py-2 rounded mr-2 cursor-not-allowed"
                                    disabled>
                                    Applied
                                </button>
                            ) : (
                                <button
                                    className="bg-pink-600 text-white px-4 py-2 rounded mr-2"
                                    onClick={handleOpenApplyModal}>
                                    Quick Apply
                                </button>
                            )}
                        </>
                    )}
                </div>

                {showModal && (
                    <WorkViewModal
                        jobId={jobId}
                        onClose={handleCloseModal}
                        onAssign={handleAssign}
                    />
                )}

                {showApplyModal && (
                    <ApplyModal
                        jobId={jobId}
                        user={user}
                        onClose={() => setShowApplyModal(false)}
                        onApplicationSubmit={(status) =>
                            setApplicationStatus(status)
                        }
                    />
                )}
            </div>
        </div>
    );
}

export default WorkView;
