import React, { useState } from "react";
import "./profile.css";
const Modal = ({ isOpen, onClose, onSave, initialData, type }) => {
    const [content, setContent] = useState(""); // Store base64 content
    const [formData, setFormData] = useState(initialData);
    const maxChars = 5000;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };
    // Handle changes to a specific work history field
    const handleWorkHistoryChange = (e, idx, field) => {
        const updatedWorkHistory = [...formData.workHistory];
        updatedWorkHistory[idx] = {
            ...updatedWorkHistory[idx],
            [field]: e.target.value,
        };
        setFormData({ ...formData, workHistory: updatedWorkHistory });
    };

    // Handle adding a new work history entry

    // Handle removing a work history entry

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();

        reader.onloadend = () => {
            setContent(reader.result); // Save base64 string
        };
        reader.readAsDataURL(file);
    };

    const handleSubmit = () => {
        const dataToSave = { ...formData };

        // Only add content and portfolio-specific fields if it's a portfolio form
        if (type === "portfolio") {
            dataToSave.title = formData.title;
            dataToSave.role = formData.role;
            dataToSave.description = formData.description;
            dataToSave.skills = formData.skills
                ?.split(",")
                .map((skill) => skill.trim()); // Assuming skills is a comma-separated string
            dataToSave.content = content; // Add base64 string for content
        }

        onSave(dataToSave); // Save the appropriate data
        onClose(); // Close the modal
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
                {/* Modal Header */}
                <h3 className="text-xl font-semibold mb-2 text-gray-800">
                    {type === "name" && "Edit Your Name"}
                    {type === "jobTitle" && "Edit your title"}
                    {type === "language" && "Edit Language"}
                    {type === "education" && "Edit Education"}
                    {type === "workHistory" && "Edit Work History"}
                    {type === "skills" && "Edit Skills"}
                    {type === "portfolio" && "Add a Portfolio Project"}
                </h3>
                {/* Name Form */}
                {type === "name" && (
                    <>
                        <p className="text-gray-600 text-sm mb-4">
                            Enter your Username or Full Name. Using your real
                            identity or name can improve your chances of getting
                            hired.
                        </p>
                        <div>
                            <label className="block text-sm font-semibold mb-2">
                                Full Name
                            </label>
                            <input
                                type="text"
                                name="userName"
                                value={formData.userName || ""}
                                onChange={handleChange}
                                placeholder="Enter your full name"
                                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 mb-4"
                            />
                        </div>
                    </>
                )}
                {type === "jobTitle" && (
                    <p className="text-gray-600 text-sm mb-4">
                        Enter a single sentence description of your professional
                        skills/experience (e.g., Expert Web Designer with Ajax
                        experience)
                    </p>
                )}

                {type === "hourlyRate" && (
                    <>
                        <p className="text-gray-600 text-sm mb-4">
                            Please note that your new hourly rate will only
                            apply to new contracts.
                        </p>
                        <p className="text-gray-800 mb-2">
                            Your profile rate: {formData.hourlyRate || "$0.00"}
                            /hr
                        </p>
                    </>
                )}

                {/* Job Title Form */}
                {type === "jobTitle" && (
                    <div>
                        <label className="block text-sm font-semibold mb-2">
                            Your title
                        </label>
                        <input
                            type="text"
                            name="jobTitle"
                            value={formData.jobTitle}
                            onChange={handleChange}
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 mb-4"
                        />
                    </div>
                )}

                {/* Hourly Rate Form */}
                {type === "hourlyRate" && (
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-sm font-semibold">
                                Hourly Rate
                            </label>
                            <div className="flex items-center">
                                <input
                                    type="number"
                                    name="hourlyRate"
                                    value={formData.hourlyRate}
                                    onChange={handleChange}
                                    className="w-24 p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600 text-right"
                                />
                                <span className="ml-1 text-gray-600">/hr</span>
                            </div>
                        </div>

                        <div className="flex items-center justify-between mb-4">
                            <label className="text-sm font-semibold">
                                You'll Receive
                            </label>
                            <div className="flex items-center">
                                <input
                                    type="text"
                                    readOnly
                                    value={`$${formData.hourlyRate || "0.00"}`}
                                    className="w-24 p-2 border border-gray-300 rounded bg-gray-100 text-right"
                                />
                                <span className="ml-1 text-gray-600">/hr</span>
                            </div>
                        </div>
                    </div>
                )}

                {type === "jobDescription" && (
                    <>
                        <p className="text-2xl text-justify mb-5 uppercase font-bold">
                            Profile Description
                        </p>
                        <p className="text-gray-600 text-sm mb-4 text-justify">
                            Use this space to show clients you have the skills
                            and experience they're looking for:
                        </p>
                        <ul className="list-disc pl-5 text-gray-600 text-sm mb-4 text-left">
                            <li>Describe your strengths and skills</li>
                            <li>
                                Highlight projects, accomplishments, and
                                education
                            </li>
                            <li>Keep it short and make sure it’s error-free</li>
                        </ul>
                    </>
                )}

                {/* Job Description Form */}
                {type === "jobDescription" && (
                    <div>
                        <label className="block text-sm font-semibold mb-2">
                            Profile overview
                        </label>
                        <textarea
                            name="jobDescription"
                            value={formData.jobDescription}
                            onChange={handleChange}
                            maxLength={maxChars}
                            rows="6"
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-600"
                        />
                        <div className="text-right text-gray-500 text-sm">
                            {formData.jobDescription?.length || 0} / {maxChars}{" "}
                            characters left
                        </div>
                    </div>
                )}

                {/* Portfolio Section */}
                {type === "portfolio" && (
                    <div>
                        <div className="mb-6">
                            <label className="block text-sm font-semibold mb-2">
                                Project Title
                            </label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title || ""}
                                onChange={handleChange}
                                placeholder="Enter a brief but descriptive title"
                                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-600"
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-semibold mb-2">
                                Your Role (Optional)
                            </label>
                            <input
                                type="text"
                                name="role"
                                value={formData.role || ""}
                                onChange={handleChange}
                                placeholder="e.g., Front-end engineer"
                                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-600"
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-semibold mb-2">
                                Project Description
                            </label>
                            <textarea
                                name="description"
                                value={formData.description || ""}
                                onChange={handleChange}
                                placeholder="Briefly describe the project"
                                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-600"
                                rows="4"
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-semibold mb-2">
                                Skills and Deliverables
                            </label>
                            <input
                                type="text"
                                name="skills"
                                value={formData.skills || ""}
                                onChange={handleChange}
                                placeholder="Type to add skills relevant to this project"
                                className="w-full p-3 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-600"
                            />
                        </div>

                        <div className="mb-6 border-2 border-dashed border-green-500 p-8 rounded-lg text-center">
                            <p className="text-green-500 text-lg mb-4">
                                Add content
                            </p>
                            <input
                                type="file"
                                onChange={handleFileChange}
                                className="hidden"
                                id="fileInput"
                            />
                            <label
                                htmlFor="fileInput"
                                className="text-green-600 cursor-pointer">
                                Upload content
                            </label>
                        </div>
                    </div>
                )}

                {/* Language Form */}
                {type === "language" && (
                    <div>
                        <label className="block text-sm mb-1">Language</label>
                        <input
                            type="text"
                            name="language"
                            value={formData.language || ""}
                            onChange={handleChange}
                            className="w-full p-2 rounded bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                        />
                        <label className="block text-sm mb-1">
                            Proficiency Level
                        </label>
                        <select
                            name="proficiency"
                            value={formData.proficiency || "Basic"}
                            onChange={handleChange}
                            className="w-full p-2 rounded bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500">
                            <option value="Basic">Basic</option>
                            <option value="Conversational">
                                Conversational
                            </option>
                            <option value="Fluent">Fluent</option>
                            <option value="Native or Bilingual">
                                Native or Bilingual
                            </option>
                        </select>
                    </div>
                )}

                {/* Education Form */}
                {type === "education" && (
                    <div>
                        <label className="block text-sm mb-1">School</label>
                        <input
                            type="text"
                            name="school"
                            value={formData.school || ""}
                            onChange={handleChange}
                            className="w-full p-2 rounded bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                        />
                        <label className="block text-sm mb-1">Degree</label>
                        <input
                            type="text"
                            name="degree"
                            value={formData.degree || ""}
                            onChange={handleChange}
                            className="w-full p-2 rounded bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                )}

                {type === "workHistory" &&
                    formData.workHistory?.map((workItem, idx) => (
                        <div key={idx} className="mb-4 mx-3">
                            <h3 className="text-lg font-semibold mb-2">
                                Job {idx + 1}
                            </h3>

                            <div className="mb-2">
                                <label className="block text-sm mb-1">
                                    Job Title
                                </label>
                                <input
                                    type="text"
                                    name={`jobTitle-${idx}`}
                                    value={workItem.jobTitle || ""}
                                    onChange={(e) =>
                                        handleWorkHistoryChange(
                                            e,
                                            idx,
                                            "jobTitle"
                                        )
                                    }
                                    className="w-full p-2 rounded bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="mb-2">
                                <label className="block text-sm mb-1">
                                    Company/Project Name
                                </label>
                                <input
                                    type="text"
                                    name={`company-${idx}`}
                                    value={workItem.company || ""}
                                    onChange={(e) =>
                                        handleWorkHistoryChange(
                                            e,
                                            idx,
                                            "company"
                                        )
                                    }
                                    className="w-full p-2 rounded bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="mb-2">
                                <label className="block text-sm mb-1">
                                    Start Date
                                </label>
                                <input
                                    type="month"
                                    name={`startDate-${idx}`}
                                    value={workItem.startDate || ""}
                                    onChange={(e) =>
                                        handleWorkHistoryChange(
                                            e,
                                            idx,
                                            "startDate"
                                        )
                                    }
                                    className="w-full p-2 rounded bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="mb-2">
                                <label className="block text-sm mb-1">
                                    End Date
                                </label>
                                <input
                                    type="month"
                                    name={`endDate-${idx}`}
                                    value={workItem.endDate || ""}
                                    onChange={(e) =>
                                        handleWorkHistoryChange(
                                            e,
                                            idx,
                                            "endDate"
                                        )
                                    }
                                    className="w-full p-2 rounded bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div className="mb-2">
                                <label className="block text-sm mb-1">
                                    Description
                                </label>
                                <textarea
                                    name={`description-${idx}`}
                                    value={workItem.description || ""}
                                    onChange={(e) =>
                                        handleWorkHistoryChange(
                                            e,
                                            idx,
                                            "description"
                                        )
                                    }
                                    className="w-full p-2 rounded bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    ))}

                {/* Skills Form */}
                {type === "skills" && (
                    <div>
                        <label className="block text-sm mb-1">Skills</label>
                        <input
                            type="text"
                            name="skills"
                            value={formData.skills || ""}
                            onChange={handleChange}
                            className="w-full p-2 rounded bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                )}

                {/* Modal Footer */}
                <div className="flex justify-end space-x-4 mt-6">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-400 rounded hover:bg-gray-100">
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded hover:bg-green-500">
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
};

export default Modal;
