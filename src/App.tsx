import React from "react";
import { Routes, Route } from "react-router-dom";

const App = () => {
  // Super simple smoke route - no imports
  const Smoke = () => (
    <div style={{ padding: "20px" }}>
      <h1>Smoke Test - App is Working!</h1>
      <p>If you can see this, React is rendering successfully.</p>
    </div>
  );

  return (
    <Routes>
      <Route path="/smoke" element={<Smoke />} />
      <Route path="*" element={<div style={{ padding: "20px" }}>404 - Not Found</div>} />
    </Routes>
  );
};

export default App;