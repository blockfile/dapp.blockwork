import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // Ensure BrowserRouter is imported
import "./index.css";
import App from "./App";
import { WalletProvider } from "../src/components/Navbar/walletContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
    <React.StrictMode>
        <BrowserRouter>
            {" "}
            {/* Wrap your app with BrowserRouter */}
            <WalletProvider>
                <App />
            </WalletProvider>
        </BrowserRouter>
    </React.StrictMode>
);
