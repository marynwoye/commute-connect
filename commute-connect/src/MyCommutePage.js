import React, { useEffect, useMemo, useState } from "react";
import { getCommuteProfiles } from "./api";
import "./ui.css";
import "./CommuteProfileForm.css";
import "./MyCommutePage.css";

export default function MyCommutePage() {
  const [myProfile, setMyProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const savedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user"));
    } catch {
      return null;
    }
  }, []);

  const loggedInFirstName = savedUser?.FirstName || "";

  useEffect(() => {
    async function loadProfile() {
      setLoading(true);

      if (!loggedInFirstName) {
        setMyProfile(null);
        setLoading(false);
        return;
      }

      try {
        const profiles = await getCommuteProfiles();
        const list = Array.isArray(profiles) ? profiles : [];

        const matches = list.filter(
          (p) =>
            (p.FirstName || "").trim().toLowerCase() ===
            loggedInFirstName.trim().toLowerCase()
        );

        matches.sort(
          (a, b) => Number(b.ProfileID || 0) - Number(a.ProfileID || 0)
        );

        setMyProfile(matches[0] || null);
      } catch {
        setMyProfile(null);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [loggedInFirstName]);

  const displayName = myProfile?.FirstName || savedUser?.FirstName || "Employee";
  const subtitle = myProfile?.Department || "Commute Profile";

  return (
    <div className="mycommute-page">
      <div className="mycommute-shell">
        <div className="mycommute-topbar">
          <h2 className="mycommute-title">My Commute</h2>
        </div>

        {savedUser && loading && (
          <div className="mycommute-card">
            <div className="mycommute-muted">Loading your commute profile…</div>
          </div>
        )}

        {savedUser && !loading && myProfile && (
          <div className="mycommute-profile-card">
            {/* Cover */}
            <div className="mycommute-cover">
              <div className="mycommute-cover-overlay" />
            </div>

            {/* Profile content */}
            <div className="mycommute-profile-content">
              {/* Header */}
              <div className="mycommute-header">
                <div className="mycommute-avatar">
                  {displayName[0]?.toUpperCase()}
                </div>

                <div className="mycommute-header-text">
                  <div className="mycommute-name">{displayName}</div>
                  <div className="mycommute-subtitle">{subtitle}</div>
                </div>
              </div>

              {/* Stats */}
              <div className="mycommute-stats">
                <div className="mycommute-stat">
                  <div className="mycommute-stat-label">Transport</div>
                  <div className="mycommute-stat-value">
                    {myProfile.TransportPreference}
                  </div>
                </div>

                <div className="mycommute-stat">
                  <div className="mycommute-stat-label">Work Hours</div>
                  <div className="mycommute-stat-value">
                    {myProfile.WorkHours}
                  </div>
                </div>

                <div className="mycommute-stat">
                  <div className="mycommute-stat-label">Meetup</div>
                  <div className="mycommute-stat-value">
                    {myProfile.MeetupLocation}
                  </div>
                </div>
              </div>

              {/* About */}
              <div className="mycommute-card mycommute-about">
                <div className="mycommute-card-title">About</div>

                <div className="mycommute-grid">
                  <InfoRow label="Name" value={myProfile.FirstName} />
                  <InfoRow label="Department" value={myProfile.Department} />
                  <InfoRow label="Gender" value={myProfile.Gender} />
                  <InfoRow label="Work hours" value={myProfile.WorkHours} />
                  <InfoRow
                    label="Transport preference"
                    value={myProfile.TransportPreference}
                  />
                  <InfoRow
                    label="Meetup location"
                    value={myProfile.MeetupLocation}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div className="mycommute-row">
      <div className="mycommute-row-label">{label}</div>
      <div className="mycommute-row-value">{value || "—"}</div>
    </div>
  );
}