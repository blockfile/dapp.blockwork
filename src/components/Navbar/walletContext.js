// WalletProvider.jsx
import React, { createContext, useState, useEffect } from "react";
import { getAddress } from "ethers";
import makeBlockie from "ethereum-blockies-base64";
import axios from "axios";
export const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
    const [walletConnected, setWalletConnected] = useState(false);
    const [user, setUser] = useState({
        walletAddress: "",
        username: "",
        avatar: "",
        age: "",
        location: "",
        gender: "",
    });

    // const connectWallet = async () => {
    //     if (window.ethereum) {
    //         try {
    //             const accounts = await window.ethereum.request({
    //                 method: "eth_requestAccounts",
    //             });
    //             if (accounts.length > 0) {
    //                 const account = getAddress(accounts[0]);

    //                 // Set the wallet address and a blockie avatar locally
    //                 setUser((prevUser) => ({
    //                     ...prevUser,
    //                     walletAddress: account,
    //                     avatar: makeBlockie(account),
    //                 }));
    //                 setWalletConnected(true);

    //                 // Check if the user exists in the database, if not, create the user
    //                 try {
    //                     const response = await axios.post(
    //                         "http://localhost:3001/usersJobs/create-or-get-user",
    //                         { walletAddress: account }
    //                     );
    //                     const userData = response.data;
    //                     updateUserProfile(userData); // Update the user profile with the data from the database
    //                 } catch (error) {
    //                     console.error(
    //                         "Error creating or fetching user:",
    //                         error
    //                     );
    //                 }
    //             }
    //         } catch (error) {
    //             console.error("Error connecting wallet:", error);
    //         }
    //     } else {
    //         alert("Please install MetaMask!");
    //     }
    // };

    const connectWallet = async () => {
        if (window.ethereum) {
            try {
                // Check if the current network is the correct testnet
                const chainId = await window.ethereum.request({
                    method: "eth_chainId",
                });

                // Replace with the chainId of your desired testnet (e.g., BSC Testnet: '0x61')
                const desiredChainId = "0x61"; // BSC Testnet in hexadecimal (use '0x38' for BSC Mainnet)

                if (chainId !== desiredChainId) {
                    try {
                        // Request network change
                        await window.ethereum.request({
                            method: "wallet_switchEthereumChain",
                            params: [{ chainId: desiredChainId }],
                        });
                    } catch (switchError) {
                        // If the desired chain is not available in MetaMask, add it
                        if (switchError.code === 4902) {
                            try {
                                await window.ethereum.request({
                                    method: "wallet_addEthereumChain",
                                    params: [
                                        {
                                            chainId: desiredChainId,
                                            chainName:
                                                "Binance Smart Chain Testnet",
                                            nativeCurrency: {
                                                name: "BNB",
                                                symbol: "BNB",
                                                decimals: 18,
                                            },
                                            rpcUrls: [
                                                "https://data-seed-prebsc-1-s1.binance.org:8545/",
                                            ],
                                            blockExplorerUrls: [
                                                "https://testnet.bscscan.com",
                                            ],
                                        },
                                    ],
                                });
                            } catch (addError) {
                                console.error(
                                    "Failed to add network:",
                                    addError
                                );
                                return;
                            }
                        } else {
                            console.error(
                                "Failed to switch network:",
                                switchError
                            );
                            return;
                        }
                    }
                }

                const accounts = await window.ethereum.request({
                    method: "eth_requestAccounts",
                });
                if (accounts.length > 0) {
                    const account = getAddress(accounts[0]);

                    // Set the wallet address and a blockie avatar locally
                    setUser((prevUser) => ({
                        ...prevUser,
                        walletAddress: account,
                        avatar: makeBlockie(account),
                    }));
                    setWalletConnected(true);

                    // Check if the user exists in the database, if not, create the user
                    try {
                        const response = await axios.post(
                            "http://localhost:3001/usersJobs/create-or-get-user",
                            { walletAddress: account }
                        );
                        const userData = response.data;
                        updateUserProfile(userData); // Update the user profile with the data from the database
                    } catch (error) {
                        console.error(
                            "Error creating or fetching user:",
                            error
                        );
                    }
                }
            } catch (error) {
                console.error("Error connecting wallet:", error);
            }
        } else {
            alert("Please install MetaMask!");
        }
    };

    const updateUserProfile = (updatedUser) => {
        console.log("Updated User:", updatedUser); // Debugging log
        setUser((prevUser) => ({
            ...prevUser,
            ...updatedUser,
        }));
    };

    // Check wallet connection on page load
    useEffect(() => {
        const checkWalletConnection = async () => {
            if (window.ethereum) {
                try {
                    const accounts = await window.ethereum.request({
                        method: "eth_accounts",
                    });

                    if (accounts.length > 0) {
                        const account = getAddress(accounts[0]);
                        setUser((prevUser) => ({
                            ...prevUser,
                            walletAddress: account,
                            avatar: makeBlockie(account),
                        }));
                        setWalletConnected(true);

                        // Fetch the user details from the database
                        try {
                            const response = await axios.post(
                                "http://localhost:3001/usersJobs/create-or-get-user",
                                { walletAddress: account }
                            );
                            const userData = response.data;
                            updateUserProfile(userData); // Update the user profile with the data from the database
                        } catch (error) {
                            console.error("Error fetching user data:", error);
                        }
                    } else {
                        setWalletConnected(false);
                    }
                } catch (error) {
                    console.error(
                        "Error retrieving wallet on page load:",
                        error
                    );
                }
            }
        };

        checkWalletConnection();

        // Listen for account changes
        window.ethereum?.on("accountsChanged", (accounts) => {
            if (accounts.length > 0) {
                const account = getAddress(accounts[0]);
                setUser((prevUser) => ({
                    ...prevUser,
                    walletAddress: account,
                    avatar: makeBlockie(account),
                }));
                setWalletConnected(true);

                // Fetch updated user data for the new wallet address
                axios
                    .post(
                        "http://localhost:3001/usersJobs/create-or-get-user",
                        {
                            walletAddress: account,
                        }
                    )
                    .then((response) => {
                        updateUserProfile(response.data);
                    })
                    .catch((error) => {
                        console.error("Error fetching user data:", error);
                    });
            } else {
                setWalletConnected(false);
                setUser({
                    walletAddress: "",
                    username: "",
                    avatar: "",
                    age: "",
                    location: "",
                    gender: "",
                });
            }
        });
    }, []);

    return (
        <WalletContext.Provider
            value={{
                walletConnected,
                user,
                connectWallet,
                updateUserProfile,
            }}>
            {children}
        </WalletContext.Provider>
    );
};
