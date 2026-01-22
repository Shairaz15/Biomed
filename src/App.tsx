import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Landing, Dashboard, Tests, MemoryAssessment } from "./pages";
import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/tests" element={<Tests />} />
        <Route path="/test/memory" element={<MemoryAssessment />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
