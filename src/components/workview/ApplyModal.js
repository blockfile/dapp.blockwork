import React, { useState, useContext } from "react";
import axios from "axios";
import { WalletContext } from "../Navbar/walletContext";
import Web3 from "web3";

function ApplyModal({ jobId, onClose, onApplicationSubmit }) {
    const { user } = useContext(WalletContext); // Access user from WalletContext
    const [coverLetter, setCoverLetter] = useState("");
    const [sendingTokens, setSendingTokens] = useState(false);

    const tokenContractAddress = "0x367bDd60b45334e35252f4eB3c4bDCcC59F2eB5c"; // Your token contract address
    const recipientWalletAddress = "0x8de2a7aB7f4241d31F13A541f49083D97dEde28e"; // Wallet to receive the tokens

    const web3 = new Web3(window.ethereum);
    const tokenABI = [
        // ERC-20 transfer method ABI
        {
            constant: false,
            inputs: [
                { name: "_to", type: "address" },
                { name: "_value", type: "uint256" },
            ],
            name: "transfer",
            outputs: [{ name: "", type: "bool" }],
            type: "function",
        },
    ];
    const tokenContract = new web3.eth.Contract(tokenABI, tokenContractAddress);

    const handleApply = async () => {
        if (!coverLetter) {
            alert("Please fill in your cover letter.");
            return;
        }

        setSendingTokens(true);

        try {
            const tokenAmount = web3.utils.toWei("1000", "ether"); // Convert 100 tokens to smallest unit (wei)

            // Request token transfer
            await tokenContract.methods
                .transfer(recipientWalletAddress, tokenAmount)
                .send({ from: user.walletAddress });

            // Once the token transfer is complete, send the job application
            const applicationData = {
                jobId: jobId,
                userId: user._id, // Assuming user._id is available in WalletContext
                userName: user.userName,
                coverLetter: coverLetter,
                walletAddress: user.walletAddress, // Include walletAddress
            };

            // Send the application data to the backend
            const response = await axios.post(
                "https://dapp.blockworkprotocol.xyz/api/jobs/apply",
                applicationData
            );

            if (response.status === 200) {
                alert("Application and token transfer successful!");
                onClose(); // Close the modal
                onApplicationSubmit("pending"); // Notify the parent about the status change
            }
        } catch (error) {
            console.error(
                "Error applying for the job or transferring tokens:",
                error
            );
            alert("Error during token transfer or application submission.");
        } finally {
            setSendingTokens(false);
        }
    };

    return (
        <div
            className="fixed inset-0 bg-gray-800 bg-opacity-50 flex justify-center items-center z-50 text-black"
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
                        onClick={handleApply}
                        disabled={sendingTokens}>
                        {sendingTokens
                            ? "Processing..."
                            : "Send Application (100 $WORK FEE)"}
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ApplyModal;
