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
    const [tokenBalance, setTokenBalance] = useState(0); // Add tokenBalance state

    // Fetch the token balance
    const fetchTokenBalance = async (walletAddress) => {
        const apiKey = "JUDPV627WC6YPRF9PJ992PQ4MMAIZVCDVV"; // Replace with your BscScan API key
        const contractAddress = "0x367bDd60b45334e35252f4eB3c4bDCcC59F2eB5c"; // Your token's contract address
        const url = `https://api.bscscan.com/api?module=account&action=tokenbalance&contractaddress=${contractAddress}&address=${walletAddress}&tag=latest&apikey=${apiKey}`;

        try {
            const response = await axios.get(url);
            if (response.data && response.data.result) {
                const balanceStr = response.data.result;
                const tokenDecimal = 18; // Replace with your token's decimal places
                const balance =
                    parseFloat(balanceStr) / Math.pow(10, tokenDecimal);
                setTokenBalance(balance); // Update token balance state
            } else {
                console.error("No token data found.");
                setTokenBalance(0); // If no data, set balance to 0
            }
        } catch (error) {
            console.error("Error fetching token balance:", error);
            setTokenBalance(0); // If error, set balance to 0
        }
    };
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
    // Uncommented version of connectWallet
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

                    // Fetch token balance after wallet is connected
                    await fetchTokenBalance(account);

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

                        // Fetch token balance on page load
                        await fetchTokenBalance(account);
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
        window.ethereum?.on("accountsChanged", async (accounts) => {
            if (accounts.length > 0) {
                const account = getAddress(accounts[0]);
                setUser((prevUser) => ({
                    ...prevUser,
                    walletAddress: account,
                    avatar: makeBlockie(account),
                }));
                setWalletConnected(true);

                // Fetch updated user data for the new wallet address
                try {
                    const response = await axios.post(
                        "http://localhost:3001/usersJobs/create-or-get-user",
                        { walletAddress: account }
                    );
                    updateUserProfile(response.data);
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }

                // Fetch token balance after account switch
                await fetchTokenBalance(account);
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
                setTokenBalance(0); // Reset token balance
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
                tokenBalance, // Provide token balance in the context
            }}>
            {children}
        </WalletContext.Provider>
    );
};
