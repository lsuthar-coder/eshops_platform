import { Routes, Route } from "react-router-dom";
import AuroraBackground from "./components/AuroraBackground";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import CreateStorePage from "./pages/CreateStorePage";
import CheckStatusPage from "./pages/CheckStatusPage";

export default function App() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <AuroraBackground />
      <NavBar />
      <Routes>
        <Route path="/" element={<CreateStorePage />} />
        <Route path="/status" element={<CheckStatusPage />} />
      </Routes>
      <Footer />
    </div>
  );
}
