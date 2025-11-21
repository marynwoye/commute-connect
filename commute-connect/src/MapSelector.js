
// Displays the iteracative map - [1] Adapted for map setup, markers, and event handling 
import React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  Polygon,
  Tooltip
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";


// icons to visually spearte deloitte office(ornage icons)
// open source leaflet colour markers (refrence here )
const officeIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png",//[2]
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png", // [4]
  iconSize: [25, 41], // marker image size 
  iconAnchor: [12, 41], // pin points correct place on the map
});

const meetupIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png", //[2]
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png", //[4]
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});


// deloitte campus polygon - co ordinates to outline the deloite campus area
// Used to highlight deloitte hatch street 
const deloittePolygon = [
  [53.334550, -6.259300],
  [53.334050, -6.259900],
  [53.333700, -6.260300],
  [53.333300, -6.260700],
  [53.333000, -6.260400],
  [53.333150, -6.259800],
  [53.333500, -6.259300],
];


// deloitte offcie loactions (2 of the offcies co-ordinates)
const deloitteOffices = [
  {
    name: "Deloitte Dublin - Earlsfort Terrace",
    position: [53.3337, -6.2592] 
  },
  {
    name: "Deloitte Dublin - Three Park Place (Hatch St Upper)",
    position: [53.3334, -6.2605] 
  }
];


// meetup lookup table
// employees options of meetup location from the drop down menu
// converting the location names in bacekend to coordinates

const meetupLookup = {
  "Tallaght Luas Stop": [53.286, -6.374],
  "Heuston Station": [53.3463, -6.2967],
  "Ranelagh Luas Stop": [53.3244, -6.2517],
  "Sandyford Luas Stop": [53.2783, -6.2086],
  "Stephens Green Luas Stop": [53.3381, -6.2590],
  "Dundrum Luas Stop": [53.2899, -6.2417],
  "Broombridge Luas Stop": [53.3720, -6.2990],
  "George's Street Arcade": [53.3436, -6.2634],
  "O'Connell Street Spire": [53.3498, -6.2603],
  "Trinity College Front Gate": [53.3440, -6.2597],
  "Temple Bar Square": [53.3453, -6.2640],
  "Grand Canal Dock": [53.3396, -6.2374],
  "Clonskeagh Village": [53.3098, -6.2348],
  "IFSC (Mayor Street)": [53.3489, -6.2372],
};


// polyline in my map to visually repsern the green and red luas line
// not accurate gathered using open street maps 
// [10 Stakeoverflow] - Adpated for polyline in React

const luasRedLineCoords = [
  [53.2859, -6.3733],
  [53.298, -6.342],
  [53.304, -6.316],
  [53.3155, -6.3088],
  [53.323, -6.306],
  [53.334, -6.3],
  [53.339, -6.291],
  [53.343, -6.277],
  [53.3463, -6.2607],
  [53.3502, -6.2515],
];

const luasGreenLineCoords = [
  [53.2273, -6.1377],
  [53.2606, -6.2005],
  [53.2711, -6.2408],
  [53.288, -6.26],
  [53.3378, -6.2617],
  [53.3568, -6.2773],
];


// Map legend - places above the map for users to understnad what all icons represent 

function Legend() {
  return (
    <div
      style={{
        background: "white",
        padding: "10px 14px",
        borderRadius: "8px",
        boxShadow: "0 0 8px rgba(0,0,0,0.2)",
        fontSize: "14px",
        lineHeight: "1.4",
        position: "absolute",
        top: "10px",
        right: "10px",
        zIndex: 9999,
      }}
    >
      <div style={{ fontWeight: "bold", marginBottom: "6px" }}>Map Legend</div>

      <div style={{ marginBottom: "6px", display: "flex", alignItems: "center" }}>
        <div style={{ width: 15, height: 15, background: "red", marginRight: 8 }}></div>
        Luas Red Line
      </div>

      <div style={{ marginBottom: "6px", display: "flex", alignItems: "center" }}>
        <div style={{ width: 15, height: 15, background: "green", marginRight: 8 }}></div>
        Luas Green Line
      </div>

      <div style={{ marginBottom: "6px", display: "flex", alignItems: "center" }}>
        <img
          src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png" //[2]
          width="14"
          alt=""
          style={{ marginRight: 6 }}
        />
        Deloitte Offices
      </div>

      <div style={{ display: "flex", alignItems: "center" }}>
        <img
          src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png" //[2]
          width="14"
          alt=""
          style={{ marginRight: 6 }}
        />
        Employee Meetup Points
      </div>
    </div>
  );
}


// Main map component 
// this renders deloitte polyon,office markers,luas routes
// renderd employee meetup markers based on commute prfiles table coming from backend 

export default function MapSelector({ commuteProfiles }) {
  return (
    <MapContainer
      center={[53.3341, -6.2595]}
      zoom={16}
      style={{ height: "450px", width: "100%", position: "relative" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"  // [5]
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* highlighted deloitte area */}
      <Polygon
        positions={deloittePolygon}
        pathOptions={{ color: "orange", fillColor: "orange", fillOpacity: 0.25 }}
      >
        <Tooltip sticky direction="center" offset={[0, 0]}>
          <strong>Deloitte Campus</strong>
        </Tooltip>
      </Polygon>

      {/* deloitte ofice pins */}
      {deloitteOffices.map((office, index) => (
        <Marker key={index} position={office.position} icon={officeIcon}>
          <Popup>
            <strong>{office.name}</strong>
            <br />
            Deloitte Dublin
          </Popup>
        </Marker>
      ))}

      {/* Luas lines */}
      <Polyline positions={luasRedLineCoords} color="red" weight={4} />
      <Polyline positions={luasGreenLineCoords} color="green" weight={4} />

      {/* green employee meet up pins */}
      {commuteProfiles &&
        commuteProfiles.map((p, index) => {
          const coords = meetupLookup[p.MeetupLocation];
          if (!coords) return null;

          return (
            <Marker key={index} position={coords} icon={meetupIcon}>
              <Popup>
                <strong>{p.FirstName}</strong>
                <br />
                {p.Department}, {p.Gender}
                <br />
                Prefers: {p.TransportPreference}
                <br />
                Meetup: {p.MeetupLocation}
              </Popup>
            </Marker>
          );
        })}

      <Legend />
    </MapContainer>
  );
}
