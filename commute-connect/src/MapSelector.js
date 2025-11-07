// MapSelector.js - Shows the Interative Map 
// React leafelt is a libary in React that displays map tiles, markers and popup
// Code below for setting up the map structure, markers, and click events
// was adapted from “A Friendly Guide to Using React-Leaflet with React”
// by DigitalPollution (DEV Community, 2023).(1)
// I expanded the example by fetching live employee data from my Flask backend,
// adding custom marker icons, and showing multiple employee pins on the map.
import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import { getEmployees } from "./api"; // fetching employee data from the backend

// Tells Leafelt to use a red icon marker for employees on map 
// Red marker icon used from the open-source "leaflet-color-markers" GitHub repository
// by user pointhi (2016). Available at: https://github.com/pointhi/leaflet-color-markers
// Used for employee location pins on the map.(2)
// ChatGPT (OpenAI, 2025) advised that it is good practice to include a shadow image
// for map markers to improve visual quality, and provided the official Leaflet URL (3)
// for the shadow image: https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png
// I added this to the icon setup as part of good UI practice.
const redIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41], // size of the marker icon
  iconAnchor: [12, 41], // where it sits on the map
  popupAnchor: [1, -34],  // where the popups appear in relation to the pin 
  shadowSize: [41, 41],  // the size of the shadow image 
});

// Location marker - handles what happens when a user clicks on the map 
// Creates a marker in the spot that you click 
// Adapted from React-Leaflet event example (Reference [1])
function LocationMarker({ onSelect }) {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng); // this runs everytime a user clicks on the map Saves where u clciked longitude/latitude
      onSelect(e.latlng.lat, e.latlng.lng);  // sends those numbers back to App.js  
    },
  });

  return position ? <Marker position={position}></Marker> : null; // If a postion exists will show otherwise shows nothing
}

// Main MapSelector component - what is imported and shown in app.js file
export default function MapSelector({ onLocationSelect }) {
  const [employees, setEmployees] = useState([]);  // storing all employees from the backend 
// useeffect runs this code once when the map first loads 
  useEffect(() => {
    // getEmployees()asks flask for all employees
    getEmployees().then((data) => {
      console.log("Fetched employees:", data);  // checking what came back
      const withLocations = data.filter((e) => { // filter keeps employees that have valid map coordinates 
        if (!e.Location) return false; // skips anyone without a saved location
        const parts = e.Location.split(",").map((v) => v.trim());
        return parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1]);
      });
      setEmployees(withLocations);  // stores the filtered list so i can show red pins on them on the map
    });
  }, []);  // only does this once when the first page shows 
// returning the map layout
  return (
    <MapContainer
      center={[53.3498, -6.2603]} // Dublin
      zoom={12}
      style={{ height: "400px", width: "100%", marginBottom: "20px" }}
    >
      
      <TileLayer  // Map tiles © OpenStreetMap contributors (ODbL) — https://www.openstreetmap.org/ (4)
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'  // base map tiles are from (open street maps)
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* red pins Commute group pins (employees) */}
      {employees.map((emp) => {
        try {   // Split the location into latitude and longitude numbers
          const [lat, lng] = emp.Location.split(",").map((v) => parseFloat(v.trim()));
          return (
            <Marker key={emp.EmployeeID} position={[lat, lng]} icon={redIcon}>
              <Popup> 
                <strong>{emp.FirstName} {emp.LastName}</strong> 
                <br />
                Dept: {emp.Department || "N/A"} <br />
                Office: {emp.OfficeAddress || "N/A"}
              </Popup>
            </Marker>
          );
        } catch (err) {
          console.warn("Invalid location for employee:", emp, err);
          return null; // skip amy employee with bad lcoation data
        }
      })}

      {/*Blue marker when user clicks  */}
      <LocationMarker onSelect={onLocationSelect} />
    </MapContainer>
  );
}
