// Loading.js
import React from "react";
import "./loading.css";

function Loading() {
    return (
        <div className="loading-overlay">
            <img
                src={`${process.env.PUBLIC_URL}/BLOCKWORK.gif`}
                alt="Loading..."
                className="loading-spinner"
            />
        </div>
    );
}

export default Loading;
