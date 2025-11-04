// src/MapSelector.js
import React, { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet-defaulticon-compatibility";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import { getEmployees } from "./api";

// 🔹 Define a red marker icon for commute group pins
const redIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// 🔹 Location marker for the user’s selected point (blue default)
function LocationMarker({ onSelect }) {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });

  return position ? <Marker position={position}></Marker> : null;
}

// 🔹 Main MapSelector component
export default function MapSelector({ onLocationSelect }) {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    getEmployees().then((data) => {
      console.log("Fetched employees:", data);
      const withLocations = data.filter((e) => {
        if (!e.Location) return false;
        const parts = e.Location.split(",").map((v) => v.trim());
        return parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1]);
      });
      setEmployees(withLocations);
    });
  }, []);

  return (
    <MapContainer
      center={[53.3498, -6.2603]} // Dublin
      zoom={12}
      style={{ height: "400px", width: "100%", marginBottom: "20px" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* 🔴 Commute group pins (employees) */}
      {employees.map((emp) => {
        try {
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
          return null;
        }
      })}

      {/* 🔵 User’s own selected marker */}
      <LocationMarker onSelect={onLocationSelect} />
    </MapContainer>
  );
}
