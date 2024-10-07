import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import makeBlockie from "ethereum-blockies-base64";
import { WalletContext } from "../Navbar/walletContext";

function Navbar() {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const { walletConnected, user, connectWallet } = useContext(WalletContext);

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const shortenAddress = (address) => {
        return `${address.slice(0, 4)}...${address.slice(-4)}`;
    };

    return (
        <nav className="bg-white border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex">
                        <div className="flex-shrink-0 flex items-center space-x-2">
                            <span className="text-green-500 font-bold text-xl">
                                BlockWork
                            </span>
                            <span className="font-semibold text-xl">
                                Protocol
                            </span>
                        </div>
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            {/* Changed <a> to <Link> */}
                            <Link
                                to="/find-work"
                                className="text-gray-700 inline-flex items-center px-1 pt-1 text-sm font-medium">
                                Find work
                            </Link>

                            <Link
                                to="/create"
                                className="text-gray-700 inline-flex items-center px-1 pt-1 text-sm font-medium">
                                Create Posting
                            </Link>

                            <Link
                                to="/messages"
                                className="text-gray-700 inline-flex items-center px-1 pt-1 text-sm font-medium">
                                Messages
                            </Link>
                        </div>
                    </div>
                    <div className="flex items-center">
                        <div className="relative mr-4">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg
                                    className="h-5 w-5 text-gray-400"
                                    fill="currentColor"
                                    viewBox="0 0 20 20">
                                    <path
                                        fillRule="evenodd"
                                        d="M12.9 14.32a8 8 0 111.414-1.414l4.95 4.95a1 1 0 01-1.415 1.415l-4.95-4.95zM8 12a4 4 0 100-8 4 4 000 8z"
                                        clipRule="evenodd"
                                    />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Search"
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-full leading-5 bg-gray-100 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-gray-400 sm:text-sm"
                            />
                        </div>

                        <div className="ml-3 relative">
                            <div>
                                {walletConnected ? (
                                    <button
                                        className="max-w-xs bg-white flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                        onClick={toggleDropdown}
                                        aria-expanded={dropdownOpen}
                                        aria-haspopup="true">
                                        <img
                                            className="h-8 w-8 rounded-full"
                                            src={user.avatar}
                                            alt="Profile"
                                        />
                                    </button>
                                ) : (
                                    <button
                                        className="bg-blue-600 hover:bg-blue-500 text-white rounded-full px-5 py-2"
                                        onClick={connectWallet}>
                                        Connect Wallet
                                    </button>
                                )}
                            </div>
                            {dropdownOpen && walletConnected && (
                                <div
                                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5"
                                    role="menu"
                                    aria-orientation="vertical"
                                    aria-labelledby="user-menu">
                                    <div>
                                        <Link
                                            to={`/profile/${user.walletAddress}`}
                                            className="block px-4 py-2 text-sm text-gray-700"
                                            role="menuitem">
                                            Profile
                                        </Link>
                                    </div>
                                    <div>
                                        <Link
                                            to="/posting"
                                            className="text-gray-700 inline-flex items-center px-4 py-2 text-sm ">
                                            My Posting
                                        </Link>
                                    </div>
                                    <Link
                                        to="/myjobs"
                                        className="text-gray-700 inline-flex items-center px-4 py-2 text-sm ">
                                        My Jobs
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
