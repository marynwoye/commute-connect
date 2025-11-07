// src/App.js - the main part of the react app
// Whats shows up when i run my react app
import React from "react";
import MapSelector from "./MapSelector";  // Importing map component 
// main fucntion componet for my app
function App() {
  return (
    <div style={{ padding: "30px", fontFamily: "Arial" }}>
      <h1>🚗 Commute & Connect</h1>
      <h2>Select your location on the map:</h2>
      <MapSelector
        onLocationSelect={(lat, lng) => {  // when user clicks on map longitude/latitude shows in console(if i dispaly crud)
          console.log("Selected location:", lat, lng); // it does not save the location to the databse yet, iteration 2 when users can create accounts..
        }}                                              // this will be updated so chosen location get saved to MySql
      />
    </div>
  );
}

export default App;
