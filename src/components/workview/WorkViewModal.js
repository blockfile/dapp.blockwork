import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { saveAs } from "file-saver";
import { Document, Packer, Paragraph } from "docx";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileAlt, faFileWord } from "@fortawesome/free-solid-svg-icons";
import JobEscrowABI from "../home/JobEscrowABI.json";
import { WalletContext } from "../Navbar/walletContext";
import Web3 from "web3"; // Import Web3
import USDT_ABI from "../home/USDT_ABI.json";
function WorkViewModal({ jobId, onClose, onAssign }) {
    const [applications, setApplications] = useState([]);
    const [confirmModal, setConfirmModal] = useState({
        isVisible: false,
        action: null,
        applicationId: null,
        applicantWalletAddress: null,
    });
    const { user } = useContext(WalletContext);
    const web3 = new Web3(window.ethereum); // Create a Web3 instance
    const escrowContractAddress = "0x2dfe9af3a53d02f94b8ef918577b743322a679df"; // Replace with your deployed escrow contract address
    const escrowContract = new web3.eth.Contract(
        JobEscrowABI,
        escrowContractAddress
    );

    useEffect(() => {
        const fetchApplications = async () => {
            try {
                // Fetch job details from your backend
                const response = await axios.get(
                    `http://localhost:3001/jobs/${jobId}`
                );
                if (response.data) {
                    const jobDetails = response.data;

                    // Include jobId from the backend
                    jobDetails.jobId = jobDetails.jobId || jobId;

                    // Set the applications with the jobId
                    setApplications(
                        jobDetails.usersApplied
                            .filter((app) => app.status !== "declined")
                            .map((app) => ({
                                ...app,
                                jobId: jobDetails.jobId, // Include jobId for each application
                            }))
                    );
                }
            } catch (error) {
                console.error("Error fetching applications:", error);
            }
        };

        fetchApplications();
    }, [jobId]);

    const handleApprove = async (applicationId, applicantWalletAddress) => {
        try {
            // Fetch job details from your backend API
            const jobResponse = await axios.get(
                `http://localhost:3001/jobs/${jobId}`
            );
            const job = jobResponse.data;

            // Use job.smartContractJobId for approving
            const jobIdNumber = parseInt(job.smartContractJobId, 10); // Convert to integer

            console.log("Approving Job ID:", jobIdNumber); // Log jobId for verification

            if (isNaN(jobIdNumber) || jobIdNumber <= 0) {
                alert("Invalid Job ID. Please check the Job details.");
                return;
            }

            if (!applicantWalletAddress) {
                alert("Invalid applicant wallet address.");
                return;
            }

            // Ensure that the job budget is available
            if (!job.budget) {
                alert("Job budget is missing.");
                return;
            }

            // Approve USDT transfer
            const usdtAmount = web3.utils.toWei(job.budget.toString(), "ether");
            const usdtContractAddress =
                "0x337610d27c682E347C9cD60BD4b3b107C9d34dDd";
            const usdtContract = new web3.eth.Contract(
                USDT_ABI,
                usdtContractAddress
            );

            await usdtContract.methods
                .approve(escrowContractAddress, usdtAmount)
                .send({ from: user.walletAddress });

            // Call smart contract function to approve the applicant
            await escrowContract.methods
                .approveApplicant(jobIdNumber, applicantWalletAddress)
                .send({ from: user.walletAddress });

            // Update MongoDB to reflect the approved applicant's wallet address
            await axios.put(`http://localhost:3001/jobs/approve/${jobId}`, {
                userId: applicationId,
                approvedApplicantWallet: applicantWalletAddress, // Add this line to update the field
            });

            setApplications((prevApplications) =>
                prevApplications.map((app) =>
                    app.userId._id === applicationId
                        ? { ...app, status: "approved" }
                        : app
                )
            );

            onAssign();
            setConfirmModal({ isVisible: false });
            onClose();
        } catch (error) {
            console.error("Error approving application:", error);
        }
    };

    const handleDecline = async (applicationId) => {
        try {
            await axios.put(`http://localhost:3001/jobs/decline/${jobId}`, {
                userId: applicationId,
            });

            setApplications((prevApplications) =>
                prevApplications.filter(
                    (app) => app.userId._id !== applicationId
                )
            );
            setConfirmModal({ isVisible: false }); // Close the confirm modal
        } catch (error) {
            console.error("Error declining application:", error);
        }
    };

    const downloadAsText = (coverLetter, userName) => {
        const blob = new Blob([coverLetter], {
            type: "text/plain;charset=utf-8",
        });
        saveAs(blob, `${userName}_coverletter.txt`);
    };

    const downloadAsDocx = async (coverLetter, userName) => {
        const doc = new Document({
            sections: [
                {
                    properties: {},
                    children: [new Paragraph(coverLetter)],
                },
            ],
        });

        const buffer = await Packer.toBlob(doc);
        saveAs(buffer, `${userName}_coverletter.docx`);
    };

    const handleBackgroundClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const showConfirmModal = (
        action,
        applicationId,
        applicantWalletAddress
    ) => {
        setConfirmModal({
            isVisible: true,
            action,
            applicationId,
            applicantWalletAddress,
        });
    };

    const handleConfirmAction = () => {
        if (confirmModal.action === "approve") {
            handleApprove(
                confirmModal.applicationId,
                confirmModal.applicantWalletAddress
            );
        }
    };

    return (
        <div
            className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50 text-black"
            onClick={handleBackgroundClick}>
            <div className="relative bg-white p-6 rounded-lg w-11/12 md:w-1/3 max-h-96 overflow-y-auto">
                <button
                    className="absolute top-2 right-2 text-gray-600 text-2xl font-bold"
                    onClick={onClose}>
                    &times;
                </button>
                <h2 className="text-2xl font-semibold mb-4 text-center">
                    Application List
                </h2>
                {applications.length > 0 ? (
                    applications.map((application) => (
                        <div
                            key={application._id}
                            className="flex flex-col md:flex-row justify-between items-center border-b border-gray-200 py-2 space-y-4 md:space-y-0">
                            <div className="flex items-center space-x-4">
                                <img
                                    src={
                                        application.userId.avatar ||
                                        "default-avatar-url"
                                    }
                                    alt="User Avatar"
                                    className="w-10 h-10 rounded-full"
                                />
                                <Link
                                    to={`/profile/${application.userId.walletAddress}`}
                                    className="text-blue-500 hover:underline">
                                    {application.userName}
                                </Link>
                            </div>

                            {/* Combine the download and action buttons in the same container */}
                            <div className="flex flex-col md:flex-row space-x-2 items-center justify-center mt-2 md:mt-0">
                                {/* Download Buttons */}
                                <div className="flex space-x-2">
                                    <button
                                        className="text-blue-500 hover:text-blue-700"
                                        onClick={() =>
                                            downloadAsText(
                                                application.coverLetter,
                                                application.userName
                                            )
                                        }
                                        title="Download as .txt">
                                        <FontAwesomeIcon
                                            icon={faFileAlt}
                                            size="2xl"
                                        />
                                    </button>
                                    <button
                                        className="text-purple-500 hover:text-purple-700"
                                        onClick={() =>
                                            downloadAsDocx(
                                                application.coverLetter,
                                                application.userName
                                            )
                                        }
                                        title="Download as .docx">
                                        <FontAwesomeIcon
                                            icon={faFileWord}
                                            size="2xl"
                                        />
                                    </button>
                                </div>

                                {/* Approve and Decline Buttons */}
                                <div className="flex space-x-2 mt-2 md:mt-0">
                                    {application.status !== "approved" && (
                                        <button
                                            className="bg-green-500 text-white px-3 py-1 rounded"
                                            onClick={() =>
                                                showConfirmModal(
                                                    "approve",
                                                    application.userId._id,
                                                    application.walletAddress
                                                )
                                            }>
                                            Approve
                                        </button>
                                    )}
                                    <button
                                        className="bg-red-500 text-white px-3 py-1 rounded"
                                        onClick={() =>
                                            showConfirmModal(
                                                "decline",
                                                application.userId._id
                                            )
                                        }>
                                        Decline
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>No applications found.</p>
                )}

                {/* Confirmation Modal */}
                {confirmModal.isVisible && (
                    <div className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50">
                        <div className="bg-white p-4 rounded-lg">
                            <p className="text-center">
                                Are you sure you want to {confirmModal.action}{" "}
                                this proposal?
                            </p>
                            <div className="flex justify-center mt-4 space-x-4">
                                <button
                                    className="bg-green-500 text-white px-3 py-1 rounded"
                                    onClick={handleConfirmAction}>
                                    Yes
                                </button>
                                <button
                                    className="bg-red-500 text-white px-3 py-1 rounded"
                                    onClick={() =>
                                        setConfirmModal({ isVisible: false })
                                    }>
                                    No
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default WorkViewModal;
