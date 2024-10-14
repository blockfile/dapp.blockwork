import React, { useState, useEffect } from "react";
import { useRoutes, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar";
import Profile from "./components/profile/profile";
import Home from "./components/home/home";
import Posting from "./components/home/posting";
import WorkView from "./components/workview/workview";
import Messages from "./components/message/message";
import MyPosting from "./components/posting/myposting";
import MyAppliedJobs from "./components/posting/myjobs";
import loadingVideo from "./components/assets/videos/loadingbg.mp4"; // Loading background video
import loader from "./components/assets/images/BLOCKWORK.gif"; // Loading spinner
import "./App.css"; // Custom styles

function App() {
    const [loading, setLoading] = useState(false); // Loading state
    const location = useLocation(); // Get current location (route)

    let element = useRoutes([
        { path: "/", element: <Home /> },
        { path: "/profile/:walletAddress", element: <Profile /> },
        { path: "/create", element: <Posting /> },
        { path: "/workview/:jobId", element: <WorkView /> },
        { path: "/messages/:jobId?", element: <Messages /> },
        { path: "/posting", element: <MyPosting /> },
        { path: "/myjobs", element: <MyAppliedJobs /> },
    ]);

    // UseEffect to show loading screen on route change
    useEffect(() => {
        // Show loading screen
        setLoading(true);

        // Set a timeout to hide the loading screen after 3 seconds
        const timeoutId = setTimeout(() => {
            setLoading(false);
        }, 3000);

        // Cleanup timeout on component unmount or route change
        return () => clearTimeout(timeoutId);
    }, [location]);

    // Display loading screen if the loading state is true
    if (loading) {
        return (
            <div className="relative flex justify-center items-center h-screen w-screen overflow-hidden">
                {/* Background video */}
                <video
                    className="absolute top-0 left-0 h-full w-full object-cover"
                    src={loadingVideo}
                    autoPlay
                    loop
                    muted
                />
                {/* Loading spinner */}
                <img
                    src={loader}
                    alt="Loading..."
                    className="relative z-10 h-[300px] w-[300px]"
                />
                {/* Overlay to darken the background video */}
                <div className="absolute inset-0 bg-black opacity-50 z-0"></div>
            </div>
        );
    }

    return (
        <div className="App relative text-white app-background">
            {/* Blurry overlay div */}

            {/* Actual content with a relative z-index to show on top of the overlay */}
            <div className="relative z-10">{element}</div>
        </div>
    );
}

export default App;
