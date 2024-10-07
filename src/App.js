import "./App.css";
import Navbar from "./components/Navbar/Navbar";
import Profile from "./components/profile/profile";
import { useRoutes } from "react-router-dom";
import Home from "./components/home/home";
import Posting from "./components/home/posting";
import WorkView from "./components/workview/workview"; // Import WorkView component
import Messages from "./components/message/message"; // Import Messages component
import MyPosting from "./components/posting/myposting";
import MyAppliedJobs from "./components/posting/myjobs";
function App() {
    let element = useRoutes([
        {
            path: "/find-work",
            element: <Home />,
        },
        {
            path: "/profile/:walletAddress",
            element: <Profile />,
        },
        {
            path: "/create",
            element: <Posting />,
        },
        {
            path: "/workview/:jobId",
            element: <WorkView />,
        },
        {
            path: "/messages/:jobId?", // Optional jobId parameter
            element: <Messages />, // Messages component will handle both with and without jobId
        },
        {
            path: "/posting",
            element: <MyPosting />,
        },
        {
            path: "/myjobs",
            element: <MyAppliedJobs />,
        },
    ]);
    return <div className="App">{element}</div>;
}

export default App;
