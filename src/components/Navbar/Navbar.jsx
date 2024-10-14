import React, { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { WalletContext } from "../Navbar/walletContext";
import { FaRegEnvelope, FaPlusCircle, FaSearch } from "react-icons/fa"; // Import icons
import logo from "../assets/images/logo.png";
import "./Navbar.css";

function Navbar() {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const { walletConnected, user, connectWallet, tokenBalance } =
        useContext(WalletContext);

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    const formatAddress = (address) =>
        address
            ? `${address.substring(0, 6)}...${address.substring(
                  address.length - 4
              )}`
            : "";

    return (
        <nav className="text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-5 pt-5 pb-5 rounded-b-3xl shadow-xl bg-opacity-45 hover:bg-transparent ease-in-out bg-color">
                <div className="flex justify-between h-16 items-center">
                    <div className="flex items-center">
                        {/* Logo */}
                        <div className="flex-shrink-0 md:flex items-center font-bruno">
                            <div className="flex justify-center">
                                <img
                                    src={logo}
                                    alt="logo"
                                    className="h-12 w-12"
                                />
                            </div>
                            <div className="space-x-1 md:flex">
                                <div>
                                    <span className="text-lg text-green-400">
                                        Blockwork{" "}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Links for larger screens */}
                        <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                            <Link
                                to="/"
                                className="text-white inline-flex items-center px-1 pt-1 text-sm font-medium link-transition">
                                Find work
                            </Link>
                            <Link
                                to="/create"
                                className="text-white inline-flex items-center px-1 pt-1 text-sm font-medium link-transition">
                                Create Posting
                            </Link>
                            <Link
                                to="/messages"
                                className="text-white inline-flex items-center px-1 pt-1 text-sm font-medium link-transition">
                                Messages
                            </Link>
                        </div>
                    </div>

                    {/* Links with icons for mobile screens */}
                    <div className="flex items-center justify-center sm:hidden space-x-4">
                        <Link to="/">
                            <FaSearch
                                size={24}
                                className="text-white icon-transition"
                            />
                        </Link>
                        <Link to="/create">
                            <FaPlusCircle
                                size={24}
                                className="text-white icon-transition"
                            />
                        </Link>
                        <Link to="/messages">
                            <FaRegEnvelope
                                size={24}
                                className="text-white icon-transition"
                            />
                        </Link>
                    </div>

                    {/* Avatar for profile */}
                    <div className="flex items-center justify-center">
                        <div className="ml-3 relative">
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

                            {/* Dropdown for profile options */}
                            {dropdownOpen && walletConnected && (
                                <div
                                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-slate-300 font-orbitron font-bold ring-1 ring-black ring-opacity-5 z-50"
                                    role="menu"
                                    aria-orientation="vertical"
                                    aria-labelledby="user-menu">
                                    <Link
                                        to={`/profile/${user.walletAddress}`}
                                        className="block px-4 py-2 text-sm text-gray-700"
                                        role="menuitem">
                                        Profile
                                    </Link>
                                    <Link
                                        to="/posting"
                                        className="block px-4 py-2 text-sm text-gray-700"
                                        role="menuitem">
                                        My Posting
                                    </Link>
                                    <Link
                                        to="/myjobs"
                                        className="block px-4 py-2 text-sm text-gray-700"
                                        role="menuitem">
                                        My Jobs
                                    </Link>
                                    {/* Display the token balance here */}
                                    <div className="block px-4 py-2 text-sm text-gray-700">
                                        Balance: {tokenBalance} $WORK
                                    </div>
                                    {/* Optional: Display formatted wallet address */}
                                    <div className="block px-4 py-2 text-sm text-gray-700">
                                        Address:{" "}
                                        {formatAddress(user.walletAddress)}
                                    </div>
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
