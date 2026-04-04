import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Generate from "./pages/Generate";
import MyTrips from "./pages/MyTrips";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/generate" element={<Generate />} />
        <Route path="/my-trips" element={<MyTrips />} />
      </Routes>
    </>
  );
}

export default App;
