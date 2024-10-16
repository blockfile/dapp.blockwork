import React, { useContext, useState, useEffect, useMemo } from "react";
import axios from "axios";
import { WalletContext } from "../Navbar/walletContext";
import Navbar from "../Navbar/Navbar";
import makeBlockie from "ethereum-blockies-base64"; // Import makeBlockie
import Modal from "./modal"; // Import the Modal component
import EditIcon from "@mui/icons-material/Edit";
import portfolio from "../assets/images/services-portfolio-1.svg";
import PortfolioModal from "./portfolioModal"; // Import the PortfolioModal component
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useParams } from "react-router-dom";
import "./profile.css";

const Profile = () => {
    const { user, walletConnected, updateUserProfile } =
        useContext(WalletContext);
    const [isEditing, setIsEditing] = useState(false);
    const [modalType, setModalType] = useState(null); // "jobTitle", "hourlyRate", "profileOverview", "language", "education", "name", "avatar", "portfolio"
    const [modalData, setModalData] = useState({});
    const [userFetched, setUserFetched] = useState(false);
    const [selectedPortfolioItem, setSelectedPortfolioItem] = useState(null); // For portfolio modal
    const [userProfile, setUserProfile] = useState(null);
    const { walletAddress } = useParams();

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await axios.get(
                    `https://dapp.blockworkprotocol.xyz/api/usersJobs/${walletAddress}`
                );
                setUserProfile(response.data);
            } catch (error) {
                console.error("Error fetching user profile:", error);
            }
        };

        fetchUserProfile();
    }, [walletAddress]);

    // Fetch connected user data
    useEffect(() => {
        const fetchUserData = async () => {
            if (
                walletConnected &&
                user.walletAddress &&
                !userFetched &&
                walletAddress === user.walletAddress
            ) {
                try {
                    const response = await axios.get(
                        `https://dapp.blockworkprotocol.xyz/api/usersJobs/${user.walletAddress}`
                    );
                    updateUserProfile(response.data); // Update the user profile in the WalletContext
                    setUserFetched(true); // Ensure it doesn't fetch again
                } catch (error) {
                    console.error("Failed to fetch user data:", error);
                }
            }
        };

        fetchUserData();
    }, [
        walletConnected,
        user.walletAddress,
        userFetched,
        updateUserProfile,
        walletAddress,
    ]);

    const displayedUser =
        walletAddress === user.walletAddress && walletConnected
            ? user
            : userProfile;

    const handleDeleteWorkHistory = async (workHistoryId) => {
        try {
            const response = await axios.post(
                "https://dapp.blockworkprotocol.xyz/api/usersJobs/delete-work-history",
                { walletAddress: user.walletAddress, workHistoryId }
            );
            if (response.data) {
                updateUserProfile(response.data); // Update the user profile in WalletContext
            }
        } catch (error) {
            console.error("Failed to delete work history:", error);
        }
    };

    // Handle avatar file selection
    const handleAvatarChange = async (e) => {
        const selectedFile = e.target.files[0];

        if (selectedFile) {
            const reader = new FileReader();

            // Convert file to base64 string
            reader.onloadend = async () => {
                const base64String = reader.result;

                try {
                    // Axios request to upload base64 avatar
                    const response = await axios.post(
                        "https://dapp.blockworkprotocol.xyz/api/usersJobs/upload-avatar",
                        {
                            walletAddress: user.walletAddress,
                            avatarData: base64String,
                        },
                        {
                            headers: { "Content-Type": "application/json" },
                            maxContentLength: Infinity,
                            maxBodyLength: Infinity,
                        }
                    );

                    const updatedUser = response.data;
                    updateUserProfile(updatedUser); // Update the user profile in the WalletContext
                    console.log("Avatar uploaded successfully", updatedUser);
                } catch (error) {
                    console.error("Failed to upload avatar:", error);
                }
            };

            reader.readAsDataURL(selectedFile); // Convert the selected file into base64
        }
    };

    const handleDeletePortfolioItem = async (portfolioId) => {
        try {
            const response = await axios.post(
                "https://dapp.blockworkprotocol.xyz/api/usersJobs/delete-portfolio",
                {
                    walletAddress: user.walletAddress,
                    portfolioId,
                }
            );

            if (response && response.data) {
                updateUserProfile(response.data); // Update the user profile in the WalletContext
            }
        } catch (error) {
            console.error("Failed to delete portfolio item:", error);
        }
    };

    // Handle profile data updates (e.g., name, education, job title, portfolio)
    const handleSave = async (updatedData) => {
        try {
            let response;

            if (modalType === "name") {
                // Ensure that the `updatedData` has a valid `userName`
                if (
                    !updatedData.userName ||
                    updatedData.userName.trim() === ""
                ) {
                    alert("Username cannot be empty.");
                    return;
                }

                // Ensure `walletAddress` is present
                if (!user.walletAddress) {
                    alert("No wallet connected.");
                    return;
                }

                // Making the POST request to update the user's name
                response = await axios.post(
                    "https://dapp.blockworkprotocol.xyz/api/usersJobs/update-name",
                    {
                        walletAddress: user.walletAddress,
                        userName: updatedData.userName.trim(), // Trim whitespaces to avoid empty inputs
                    }
                );
            } else if (modalType === "language") {
                response = await axios.post(
                    "https://dapp.blockworkprotocol.xyz/api/usersJobs/update-language",
                    {
                        walletAddress: user.walletAddress,
                        language: updatedData.language,
                        proficiency: updatedData.proficiency,
                    }
                );
            } else if (modalType === "education") {
                response = await axios.post(
                    "https://dapp.blockworkprotocol.xyz/api/usersJobs/update-education",
                    {
                        walletAddress: user.walletAddress,
                        school: updatedData.school,
                        degree: updatedData.degree,
                    }
                );
            } else if (modalType === "jobTitle") {
                response = await axios.post(
                    "https://dapp.blockworkprotocol.xyz/api/usersJobs/update-job",
                    {
                        walletAddress: user.walletAddress,
                        jobTitle: updatedData.jobTitle,
                    }
                );
            } else if (modalType === "jobDescription") {
                response = await axios.post(
                    "https://dapp.blockworkprotocol.xyz/api/usersJobs/update-job-description",
                    {
                        walletAddress: user.walletAddress,
                        jobDescription: updatedData.jobDescription,
                    }
                );
            } else if (modalType === "hourlyRate") {
                response = await axios.post(
                    "https://dapp.blockworkprotocol.xyz/api/usersJobs/update-rate",
                    {
                        walletAddress: user.walletAddress,
                        hourlyRate: updatedData.hourlyRate,
                    }
                );
            } else if (modalType === "workHistory") {
                // Process each work history entry
                for (const workItem of updatedData.workHistory) {
                    if (
                        workItem.jobTitle &&
                        workItem.company &&
                        workItem.startDate
                    ) {
                        response = await axios.post(
                            "https://dapp.blockworkprotocol.xyz/api/usersJobs/update-work-history",
                            {
                                walletAddress: user.walletAddress,
                                jobTitle: workItem.jobTitle,
                                company: workItem.company,
                                startDate: workItem.startDate,
                                endDate: workItem.endDate || null,
                                description: workItem.description || null,
                            }
                        );
                    } else {
                        console.error(
                            "Missing required fields in work history entry"
                        );
                        return;
                    }
                }
            } else if (modalType === "portfolio") {
                // Handle portfolio update
                response = await axios.post(
                    "https://dapp.blockworkprotocol.xyz/api/usersJobs/update-portfolio",
                    {
                        walletAddress: user.walletAddress,
                        title: updatedData.title,
                        role: updatedData.role,
                        description: updatedData.description,
                        skills: updatedData.skills,
                        content: updatedData.content,
                    }
                );
            }

            if (response && response.data) {
                updateUserProfile(response.data); // Update the user profile in the WalletContext
            }
        } catch (error) {
            console.error("Failed to update profile:", error);
        }

        setIsEditing(false); // Close the modal
    };

    // Function to handle opening the edit modal
    const handleEditClick = (type, initialData) => {
        if (type === "workHistory" && initialData.workHistory.length === 0) {
            initialData.workHistory = [
                {
                    jobTitle: "",
                    company: "",
                    startDate: "",
                    endDate: "",
                    description: "",
                },
            ];
        }

        setModalType(type);
        setModalData(initialData);
        setIsEditing(true);
    };

    const openPortfolioModal = (item) => {
        setSelectedPortfolioItem(item);
    };

    const closePortfolioModal = () => {
        setSelectedPortfolioItem(null);
    };

    const renderAvatar = useMemo(() => {
        return walletConnected
            ? user.avatar
                ? user.avatar
                : makeBlockie(user.walletAddress)
            : "https://via.placeholder.com/150";
    }, [user.avatar, walletConnected]);

    return (
        <div className=" min-h-screen">
            <div className="pb-5">
                <Navbar />
            </div>
            <div
                className="max-w-4xl mx-auto bg-gray-900 shadow-md rounded-lg p-6"
                style={{
                    backgroundImage:
                        "radial-gradient(120% 80% at 50% 0%, transparent 10%, rgba(0, 59, 117, 0.3) 80%)",
                }}>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4">
                        {/* Avatar section */}
                        <div className="relative group">
                            <img
                                className="w-16 h-16 rounded-full"
                                src={
                                    displayedUser?.avatar
                                        ? displayedUser.avatar
                                        : renderAvatar
                                }
                                alt="Profile"
                            />
                            {walletAddress === user.walletAddress &&
                                walletConnected && (
                                    <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <label className="text-white text-sm cursor-pointer">
                                            Change Profile
                                            <input
                                                type="file"
                                                className="hidden"
                                                onChange={handleAvatarChange}
                                            />
                                        </label>
                                    </div>
                                )}
                        </div>
                        <div>
                            <div className="flex items-center">
                                <h1 className="text-2xl font-semibold text-white">
                                    {displayedUser?.userName
                                        ? "@" + displayedUser.userName
                                        : "[Enter your name]"}
                                </h1>
                                {/* Edit name button, only visible for the current user */}
                                {walletAddress === user.walletAddress &&
                                    walletConnected && (
                                        <EditIcon
                                            style={{
                                                color: "green",
                                                marginLeft: "8px",
                                                fontSize: "18px",
                                                cursor: "pointer",
                                            }}
                                            onClick={() =>
                                                handleEditClick("name", {
                                                    userName:
                                                        displayedUser?.userName ||
                                                        "",
                                                })
                                            }
                                        />
                                    )}
                            </div>
                        </div>
                    </div>
                    {walletAddress === user.walletAddress &&
                        walletConnected && (
                            <button className="bg-green-500 text-white py-2 px-4 rounded-md">
                                See public view
                            </button>
                        )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 ">
                    {/* Left Section */}
                    <div className="col-span-1 ">
                        {/* Languages Section */}
                        <div className="p-4 rounded-lg mb-4 relative ">
                            {walletAddress === user.walletAddress &&
                                walletConnected && (
                                    <EditIcon
                                        style={{
                                            color: "green",
                                            position: "absolute",
                                            top: "8px",
                                            right: "8px",
                                            fontSize: "18px",
                                            cursor: "pointer",
                                        }}
                                        onClick={() =>
                                            handleEditClick("language", {
                                                language:
                                                    displayedUser
                                                        ?.languages?.[0]
                                                        ?.language || "",
                                                proficiency:
                                                    displayedUser
                                                        ?.languages?.[0]
                                                        ?.proficiency ||
                                                    "Basic",
                                            })
                                        }
                                    />
                                )}

                            <h2 className="text-lg font-semibold mb-4">
                                Languages
                            </h2>
                            <div className="text-gray-400">
                                {displayedUser?.languages?.[0]
                                    ? `${displayedUser.languages[0].language} (${displayedUser.languages[0].proficiency})`
                                    : "[List your languages]"}
                            </div>
                        </div>
                        <hr />
                        {/* Education Section */}
                        <div className="p-4 rounded-lg mb-4 relative ">
                            {walletAddress === user.walletAddress &&
                                walletConnected && (
                                    <EditIcon
                                        style={{
                                            color: "green",
                                            position: "absolute",
                                            top: "8px",
                                            right: "8px",
                                            cursor: "pointer",
                                            fontSize: "18px",
                                        }}
                                        onClick={() =>
                                            handleEditClick("education", {
                                                school:
                                                    displayedUser
                                                        ?.education?.[0]
                                                        ?.school || "",
                                                degree:
                                                    displayedUser
                                                        ?.education?.[0]
                                                        ?.degree || "",
                                            })
                                        }
                                    />
                                )}

                            <h2 className="text-lg font-semibold mb-4">
                                Education
                            </h2>
                            <div className="text-gray-400">
                                {displayedUser?.education?.[0]
                                    ? `${displayedUser.education[0].school}, ${displayedUser.education[0].degree}`
                                    : "[Education details]"}
                            </div>
                        </div>
                    </div>

                    <div className="col-span-2 border">
                        <div className="p-4 rounded-lg mb-4 relative ">
                            {/* Job Title and Skills */}
                            <div className="flex justify-center items-center mb-2 relative mt-2">
                                <h2 className="text-xl font-semibold text-center text-gray-300">
                                    {displayedUser?.jobTitle ||
                                        "[Enter your job title]"}{" "}
                                </h2>
                                {walletAddress === user.walletAddress &&
                                    walletConnected && (
                                        <EditIcon
                                            style={{
                                                color: "green",
                                                position: "absolute",
                                                right: "8px",
                                                cursor: "pointer",
                                                fontSize: "18px",
                                            }}
                                            onClick={() =>
                                                handleEditClick("jobTitle", {
                                                    jobTitle:
                                                        displayedUser?.jobTitle ||
                                                        "",
                                                    jobDescription:
                                                        displayedUser?.jobDescription ||
                                                        "",
                                                })
                                            }
                                        />
                                    )}
                            </div>
                            <hr />
                            {/* Hourly Rate */}
                            <div className="flex justify-center items-center mb-4 relative mt-2">
                                <div className="text-green-600 font-semibold text-lg">
                                    {displayedUser?.hourlyRate
                                        ? `$${displayedUser.hourlyRate}/hr`
                                        : "[Enter your hourly rate]"}
                                </div>
                                {walletAddress === user.walletAddress &&
                                    walletConnected && (
                                        <EditIcon
                                            style={{
                                                color: "green",
                                                position: "absolute",
                                                right: "8px",
                                                cursor: "pointer",
                                                fontSize: "18px",
                                            }}
                                            onClick={() =>
                                                handleEditClick("hourlyRate", {
                                                    hourlyRate:
                                                        displayedUser?.hourlyRate ||
                                                        "",
                                                })
                                            }
                                        />
                                    )}
                            </div>
                            <hr />
                            {/* Job Description */}
                            <div className="flex justify-center items-start relative mt-2">
                                <p className="text-gray-700 text-justify mt-7">
                                    {displayedUser?.jobDescription ||
                                        "[Enter your job description]"}
                                </p>
                                {walletAddress === user.walletAddress &&
                                    walletConnected && (
                                        <EditIcon
                                            style={{
                                                color: "green",
                                                position: "absolute",
                                                right: "8px",
                                                cursor: "pointer",
                                                fontSize: "18px",
                                            }}
                                            onClick={() =>
                                                handleEditClick(
                                                    "jobDescription",
                                                    {
                                                        jobDescription:
                                                            displayedUser?.jobDescription ||
                                                            "",
                                                    }
                                                )
                                            }
                                        />
                                    )}
                            </div>
                        </div>
                        <hr />
                        {/* Portfolio Section */}
                        <div className="p-4 mb-4 relative">
                            <div className="flex justify-between items-center">
                                <h2 className="text-lg font-semibold">
                                    Portfolio
                                </h2>
                                {walletAddress === user.walletAddress &&
                                    walletConnected && (
                                        <button
                                            className="flex items-center text-green-500"
                                            onClick={() =>
                                                handleEditClick("portfolio", {})
                                            }>
                                            <span className="mr-2">
                                                Add a project
                                            </span>
                                            <AddIcon />
                                        </button>
                                    )}
                            </div>

                            {/* Portfolio Content */}
                            <div className="flex space-x-4 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600">
                                {displayedUser?.portfolio?.length > 0 ? (
                                    displayedUser.portfolio.map((item, idx) => (
                                        <div
                                            key={idx}
                                            className="relative w-32 flex-shrink-0"
                                            onClick={() =>
                                                openPortfolioModal(item)
                                            }>
                                            <img
                                                src={item.content || portfolio}
                                                alt="Portfolio thumbnail"
                                                className="w-full h-full object-cover mb-2"
                                            />
                                            <div className="text-gray-700 font-medium">
                                                {item.title}
                                            </div>
                                            {walletAddress ===
                                                user.walletAddress &&
                                                walletConnected && (
                                                    <DeleteIcon
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleDeletePortfolioItem(
                                                                item._id
                                                            );
                                                        }}
                                                        style={{
                                                            color: "red",
                                                            position:
                                                                "absolute",
                                                            top: "5px",
                                                            right: "5px",
                                                            cursor: "pointer",
                                                        }}
                                                    />
                                                )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex flex-col items-center justify-center text-center h-full">
                                        <img
                                            src={portfolio}
                                            alt="Portfolio"
                                            className="w-24 h-24 mb-4 mt-5"
                                        />
                                        <p className="text-gray-500">
                                            Add a project. For the Employer to
                                            see your past work history, this
                                            will improve the chance of getting
                                            hired.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                        <hr />

                        {/* Work History Section */}
                        <div className="relative col-span-2 border p-4 mb-4">
                            <h2 className="text-lg font-semibold text-center mb-4">
                                Work History
                            </h2>

                            {/* Display work history */}
                            {displayedUser?.workHistory?.length > 0 ? (
                                displayedUser.workHistory.map(
                                    (workItem, idx) => (
                                        <div
                                            key={idx}
                                            className="relative mb-4 p-4 border flex justify-center rounded-lg uppercase">
                                            <div className="flex justify-between">
                                                <div>
                                                    <h3 className="text-red-700">
                                                        {workItem.jobTitle} at{" "}
                                                        {workItem.company}
                                                    </h3>
                                                    <p>
                                                        {new Date(
                                                            workItem.startDate
                                                        ).toLocaleDateString()}{" "}
                                                        -{" "}
                                                        {workItem.endDate
                                                            ? new Date(
                                                                  workItem.endDate
                                                              ).toLocaleDateString()
                                                            : "Present"}
                                                    </p>
                                                    <p>
                                                        {workItem.description}
                                                    </p>
                                                </div>
                                                {walletAddress ===
                                                    user.walletAddress &&
                                                    walletConnected && (
                                                        <button
                                                            className="absolute top-1 right-1 text-red-500"
                                                            onClick={() =>
                                                                handleDeleteWorkHistory(
                                                                    workItem._id
                                                                )
                                                            }>
                                                            <DeleteIcon />
                                                        </button>
                                                    )}
                                            </div>
                                        </div>
                                    )
                                )
                            ) : (
                                <p className="text-center text-gray-500">
                                    No work history yet
                                </p>
                            )}

                            {/* Add Job button positioned at the top-right */}
                            {walletAddress === user.walletAddress &&
                                walletConnected && (
                                    <button
                                        className="absolute top-2 right-2 flex items-center text-green-500"
                                        onClick={() =>
                                            handleEditClick("workHistory", {
                                                workHistory: [],
                                            })
                                        }>
                                        <AddIcon className="mr-1" />
                                        Add Job
                                    </button>
                                )}
                        </div>

                        <hr />
                        {/* Skills Section */}
                        <div className="p-4 rounded-lg relative">
                            {walletAddress === user.walletAddress &&
                                walletConnected && (
                                    <EditIcon
                                        style={{
                                            color: "green",
                                            position: "absolute",
                                            fontSize: "18px",
                                            top: "8px",
                                            right: "8px",
                                            cursor: "pointer",
                                        }}
                                        onClick={() =>
                                            handleEditClick("skills", {
                                                skills:
                                                    displayedUser?.skills || [],
                                            })
                                        }
                                    />
                                )}
                            <h2 className="text-lg font-semibold mb-4">
                                Skills
                            </h2>
                            <div className="text-gray-400">
                                {displayedUser?.skills?.length
                                    ? displayedUser.skills.join(", ")
                                    : "[List your skills]"}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Portfolio Modal */}
            {selectedPortfolioItem && (
                <PortfolioModal
                    isOpen={Boolean(selectedPortfolioItem)}
                    onClose={closePortfolioModal}
                    portfolioItem={selectedPortfolioItem}
                />
            )}

            {isEditing && (
                <Modal
                    isOpen={isEditing}
                    onClose={() => setIsEditing(false)}
                    onSave={handleSave} // function to save the data
                    initialData={modalData} // Initial data to prepopulate the fields
                    type={modalType} // The section being edited
                />
            )}
        </div>
    );
};

export default Profile;
