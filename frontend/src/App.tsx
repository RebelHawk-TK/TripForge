import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Generate from "./pages/Generate";
import MyTrips from "./pages/MyTrips";
import Blog from "./pages/Blog";
import About from "./pages/About";
import SharedTrip from "./pages/SharedTrip";

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/generate" element={<Generate />} />
        <Route path="/my-trips" element={<MyTrips />} />
        <Route path="/blog" element={<Blog />} />
        <Route path="/about" element={<About />} />
        <Route path="/trip/:tripId" element={<SharedTrip />} />
      </Routes>
    </>
  );
}

export default App;
