import React from "react";

const PortfolioModal = ({ isOpen, onClose, portfolioItem }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-lg">
                <h3 className="text-xl font-semibold mb-2 text-gray-800">
                    {portfolioItem.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                    <strong>Role:</strong> {portfolioItem.role}
                </p>
                <p className="text-gray-600 text-sm mb-4">
                    <strong>Description:</strong> {portfolioItem.description}
                </p>
                <p className="text-gray-600 text-sm mb-4">
                    <strong>Skills:</strong> {portfolioItem.skills.join(", ")}
                </p>
                {portfolioItem.content && (
                    <img
                        src={portfolioItem.content}
                        alt="Uploaded content"
                        className="w-full h-auto rounded mb-4"
                    />
                )}
                <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-semibold text-gray-600 border border-gray-400 rounded hover:bg-gray-100">
                    Close
                </button>
            </div>
        </div>
    );
};

export default PortfolioModal;
