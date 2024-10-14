import React from "react";
import Navbar from "./Navbar"; // Import your Navbar

const Layout = ({ children }) => {
    return (
        <div className="min-h-screen flex flex-col">
            <Navbar /> {/* Navbar stays at the top */}
            <main className="flex-grow">{children}</main>{" "}
            {/* Dynamic content */}
        </div>
    );
};

export default Layout;
