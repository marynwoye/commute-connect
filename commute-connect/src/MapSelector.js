// MapSelector.js
import React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ----------------------------------------------------
// ICONS
// ----------------------------------------------------
const officeIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const meetupIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

// ----------------------------------------------------
// OFFICE PHOTO MARKER (custom image icon)
// ----------------------------------------------------
const officePhotoIcon = new L.Icon({
  iconUrl: "https://i.imgur.com/3Q8gVnB.jpeg", // public Deloitte building photo
  iconSize: [55, 55], // image size
  iconAnchor: [27, 55], // bottom center
  className: "office-photo-marker"
});

// ----------------------------------------------------
// DELOITTE OFFICE LOCATIONS
// ----------------------------------------------------
const deloitteOffices = [
  {
    name: "Deloitte Dublin - Earlsfort Terrace",
    position: [53.3336, -6.2581],
    image: "https://i.imgur.com/3Q8gVnB.jpeg"
  },
  {
    name: "Deloitte Dublin - George's Dock",
    position: [53.3489, -6.2435],
    image: null
  },
  {
    name: "Deloitte Dublin - Burlington Road",
    position: [53.3309, -6.2416],
    image: null
  },
];

// ----------------------------------------------------
// MEETUP LOOKUP TABLE
// ----------------------------------------------------
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

// ----------------------------------------------------
// LUAS RED LINE COORDS
// ----------------------------------------------------
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

// ----------------------------------------------------
// LUAS GREEN LINE COORDS
// ----------------------------------------------------
const luasGreenLineCoords = [
  [53.2273, -6.1377],
  [53.2606, -6.2005],
  [53.2711, -6.2408],
  [53.288, -6.26],
  [53.3378, -6.2617],
  [53.3568, -6.2773],
];

// ----------------------------------------------------
// LEGEND
// ----------------------------------------------------
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

      <div className="legend-item" style={{ marginBottom: "6px" }}>
        <div
          style={{
            width: "15px",
            height: "15px",
            background: "red",
            marginRight: "8px",
          }}
        ></div>
        Luas Red Line
      </div>

      <div className="legend-item" style={{ marginBottom: "6px" }}>
        <div
          style={{
            width: "15px",
            height: "15px",
            background: "green",
            marginRight: "8px",
          }}
        ></div>
        Luas Green Line
      </div>

      <div className="legend-item" style={{ marginBottom: "6px" }}>
        <img
          src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png"
          width="14"
          alt=""
          style={{ marginRight: "6px" }}
        />
        Deloitte Offices
      </div>

      <div className="legend-item">
        <img
          src="https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png"
          width="14"
          alt=""
          style={{ marginRight: "6px" }}
        />
        Employee Meetup Points
      </div>
    </div>
  );
}

// ----------------------------------------------------
// MAIN MAP COMPONENT
// ----------------------------------------------------
export default function MapSelector({ commuteProfiles }) {
  return (
    <MapContainer
      center={[53.3498, -6.2603]}
      zoom={12}
      style={{ height: "450px", width: "100%", position: "relative" }}
    >
      <TileLayer
        attribution="&copy; OpenStreetMap contributors"
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* LUAS LINES */}
      <Polyline positions={luasRedLineCoords} color="red" weight={4} />
      <Polyline positions={luasGreenLineCoords} color="green" weight={4} />

      {/* DELOITTE OFFICES */}
      {deloitteOffices.map((office, index) => (
        <Marker
          key={index}
          position={office.position}
          icon={office.image ? officePhotoIcon : officeIcon}
        >
          <Popup>
            <strong>{office.name}</strong>
            <br />
            Deloitte Dublin Office
            <br />
            {office.image && (
              <img
                src={office.image}
                alt={office.name}
                style={{ width: "100%", marginTop: "10px", borderRadius: "6px" }}
              />
            )}
          </Popup>
        </Marker>
      ))}

      {/* COMMUTE PROFILE PINS */}
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
