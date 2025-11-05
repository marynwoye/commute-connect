// src/App.js
import React from "react";
import MapSelector from "./MapSelector";

function App() {
  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      <h1>🚗 Commute & Connect</h1>
      <h2>Select your location on the map:</h2>
      <MapSelector
        onLocationSelect={(lat, lng) => {
          console.log("Selected location:", lat, lng);
        }}
      />
    </div>
  );
}

export default App;
