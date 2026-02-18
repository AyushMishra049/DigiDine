// src/components/RestaurantControlPanel.jsx
import React, { useState, useRef } from "react";

const pillStyle = (bg, color = "#fff") => ({
  display: "inline-block",
  padding: "3px 10px",
  borderRadius: 999,
  fontSize: 11,
  fontWeight: 500,
  backgroundColor: bg,
  color,
});

const cardStyle = {
  borderRadius: 16,
  border: "1px solid #eee",
  padding: "14px 16px",
  marginBottom: 16,
  background: "#fff",
  boxShadow: "0 2px 8px rgba(0,0,0,0.03)",
};

const sectionTitleStyle = {
  fontSize: 16,
  fontWeight: 600,
  marginBottom: 8,
};

const labelStyle = {
  fontSize: 12,
  fontWeight: 500,
  marginBottom: 4,
};

const inputStyle = {
  width: "100%",
  padding: "8px 10px",
  borderRadius: 8,
  border: "1px solid #ddd",
  fontSize: 13,
  outline: "none",
};

const smallButton = {
  padding: "6px 10px",
  fontSize: 12,
  borderRadius: 999,
  border: "none",
  cursor: "pointer",
};

const primaryButton = {
  ...smallButton,
  background: "#ff5722",
  color: "#fff",
};

const secondaryButton = {
  ...smallButton,
  background: "#f3f4f6",
  color: "#111827",
};

const RestaurantControlPanel = ({ restaurant, onLogout }) => {
  const [activeTab, setActiveTab] = useState("dashboard"); // dashboard | profile | transactions
  const [menuOpen, setMenuOpen] = useState(false);

  // 1️⃣ QR + Location
  const [locationLink, setLocationLink] = useState("");

  const [qrImageUrl, setQrImageUrl] = useState(() => {
    if (typeof window === "undefined") return "";
    const key = restaurant?.id ? `qrImage_${restaurant.id}` : "qrImage_default";
    return localStorage.getItem(key) || "";
  });
  const [showQrModal, setShowQrModal] = useState(false);
  const qrFileInputRef = useRef(null);

  // 2️⃣ Table management
  const [tables, setTables] = useState([
    { id: 1, name: "Table 1", status: "Available" },
    { id: 2, name: "Table 2", status: "Booked" },
  ]);
  const [newTableName, setNewTableName] = useState("");

  // 3️⃣ Menu management
  const [menuItems, setMenuItems] = useState([]);
  const [newItem, setNewItem] = useState({
    name: "",
    price: "",
    timer: "",
  });

  // 4️⃣ Restaurant details (Profile tab)
  const [details, setDetails] = useState({
    name: restaurant?.name || "",
    address: "",
    helpNumber: "",
    contactEmail: "",
    openingHours: "",
  });

  // 5️⃣ Hiring
  const [hiringTab, setHiringTab] = useState("create"); // "create" | "responses"
  const [hiringForm, setHiringForm] = useState({
    role: "",
    description: "",
    salaryRange: "",
    experience: "",
    lastDate: "",
    showOnUserDashboard: true,
  });
  const [hiringPosts, setHiringPosts] = useState([]);
  const [responses, setResponses] = useState([
    {
      id: 1,
      name: "Rahul Sharma",
      role: "Chef",
      experience: "3 years",
      status: "New",
    },
    {
      id: 2,
      name: "Priya Verma",
      role: "Waiter",
      experience: "1 year",
      status: "Shortlisted",
    },
  ]);
  const [responseFilterRole, setResponseFilterRole] = useState("All");
  const [responseFilterStatus, setResponseFilterStatus] = useState("All");

  // 👉 NEW: selected response for "Details" modal
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [showResponseModal, setShowResponseModal] = useState(false);

  // 6️⃣ Transactions history (demo data)
  const [transactions] = useState([
    {
      id: "TXN-1001",
      userName: "Akash Verma",
      phone: "+91-9876543210",
      amount: 850,
      time: "2025-12-05 19:32",
    },
    {
      id: "TXN-1002",
      userName: "Priya Singh",
      phone: "+91-9988776655",
      amount: 420,
      time: "2025-12-05 20:10",
    },
    {
      id: "TXN-1003",
      userName: "Ravi Kumar",
      phone: "+91-9123456780",
      amount: 1250,
      time: "2025-12-06 13:05",
    },
  ]);

  // Handlers

  const handleSaveLocation = () => {
    if (!locationLink.trim()) return;
    alert("Location URL saved for this restaurant!");
    // TODO: send to backend
  };

  const handleCreateQr = () => {
    alert("QR generated! Remember to paste it on each table.");
  };

  const handleAddTable = () => {
    if (!newTableName.trim()) return;
    setTables((prev) => [
      ...prev,
      {
        id: Date.now(),
        name: newTableName.trim(),
        status: "Available",
      },
    ]);
    setNewTableName("");
  };

  const handleChangeTableStatus = (id, status) => {
    setTables((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status } : t))
    );
  };

  const handleDeleteTable = (id) => {
    setTables((prev) => prev.filter((t) => t.id !== id));
  };

  const handleAddMenuItem = () => {
    if (!newItem.name.trim() || !newItem.price.trim()) return;
    setMenuItems((prev) => [
      ...prev,
      { id: Date.now(), ...newItem, price: parseFloat(newItem.price) },
    ]);
    setNewItem({ name: "", price: "", timer: "" });
  };

  const handleDeleteMenuItem = (id) => {
    setMenuItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleSaveDetails = () => {
    alert("Restaurant details saved! Users will see updated info.");
    // TODO: send to backend
  };

  const handleCreateHiringPost = () => {
    if (!hiringForm.role.trim()) return;
    setHiringPosts((prev) => [
      ...prev,
      {
        id: Date.now(),
        ...hiringForm,
        createdAt: new Date().toISOString().slice(0, 10),
      },
    ]);
    setHiringForm({
      role: "",
      description: "",
      salaryRange: "",
      experience: "",
      lastDate: "",
      showOnUserDashboard: true,
    });
    alert("Hiring post created! It will show on user dashboard (if enabled).");
  };

  const filteredResponses = responses.filter((r) => {
    const matchRole =
      responseFilterRole === "All" || r.role === responseFilterRole;
    const matchStatus =
      responseFilterStatus === "All" || r.status === responseFilterStatus;
    return matchRole && matchStatus;
  });

  const handleSaveQrImage = () => {
    if (!qrImageUrl.trim()) return;
    const key = restaurant?.id ? `qrImage_${restaurant.id}` : "qrImage_default";
    localStorage.setItem(key, qrImageUrl);
    alert("QR image saved! It will appear when user clicks Pay Now.");
  };

  const handleQrFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setQrImageUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleLogoutClick = () => {
    if (onLogout) {
      onLogout();
    } else {
      // fallback: agar parent se onLogout na aaye to app reload karke login/start dikha do
      window.location.reload();
    }
  };

  // 👉 NEW: shortlist handler
  const handleShortlist = (id) => {
    setResponses((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status: "Shortlisted",
            }
          : r
      )
    );
    alert("Candidate shortlisted! User can see 'You are shortlisted'");
  };

  // 👉 NEW: details handler
  const handleShowDetails = (response) => {
    setSelectedResponse(response);
    setShowResponseModal(true);
  };

  return (
    <div
      style={{
        padding: 16,
        maxWidth: 1100,
        margin: "0 auto",
        background: "#f9fafb",
        minHeight: "100vh",
        maxHeight: "100vh",
        overflowY: "auto",
      }}
    >
      {/* 🔝 Header with Back + Logo dropdown */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 20,
          background: "#f9fafb",
          paddingBottom: 8,
          marginBottom: 12,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid #e5e7eb",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Back button */}
          <button
            onClick={handleLogoutClick}
            style={{
              ...secondaryButton,
              borderRadius: 999,
              padding: "4px 10px",
              fontSize: 12,
            }}
          >
            ← Back
          </button>

          {/* DiGiDine logo + dropdown */}
          <div style={{ position: "relative" }}>
            <div
              onClick={() => setMenuOpen((prev) => !prev)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                cursor: "pointer",
                padding: "4px 8px",
                borderRadius: 999,
                transition: "background 0.15s",
              }}
            >
              <img
                src="/src/assets/eat.png"
                alt="DiGiDine"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
              <span
                style={{
                  fontWeight: 700,
                  fontSize: 18,
                  letterSpacing: 0.5,
                }}
              >
                DiGiDine
              </span>
              <span style={{ fontSize: 10 }}>▼</span>
            </div>

            {menuOpen && (
              <div
                style={{
                  position: "absolute",
                  top: "110%",
                  left: 0,
                  marginTop: 4,
                  background: "#ffffff",
                  borderRadius: 12,
                  boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
                  minWidth: 190,
                  padding: 6,
                  fontSize: 13,
                }}
              >
                <button
                  style={{
                    ...smallButton,
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    background: "transparent",
                    padding: "6px 10px",
                  }}
                  onClick={() => {
                    setActiveTab("profile");
                    setMenuOpen(false);
                  }}
                >
                  👤 Profile (Restaurant details)
                </button>
                <button
                  style={{
                    ...smallButton,
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    background: "transparent",
                    padding: "6px 10px",
                  }}
                  onClick={() => {
                    setActiveTab("transactions");
                    setMenuOpen(false);
                  }}
                >
                  💳 All transactions
                </button>
                <button
                  style={{
                    ...smallButton,
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    background: "transparent",
                    padding: "6px 10px",
                  }}
                  onClick={handleLogoutClick}
                >
                  🚪 Logout
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Simple tab buttons for quick switch */}
        <div
          style={{
            display: "inline-flex",
            background: "#e5e7eb",
            borderRadius: 999,
            padding: 3,
            gap: 2,
          }}
        >
          <button
            style={{
              ...smallButton,
              background: activeTab === "dashboard" ? "#fff" : "transparent",
            }}
            onClick={() => setActiveTab("dashboard")}
          >
            Dashboard
          </button>
          <button
            style={{
              ...smallButton,
              background: activeTab === "profile" ? "#fff" : "transparent",
            }}
            onClick={() => setActiveTab("profile")}
          >
            Profile
          </button>
          <button
            style={{
              ...smallButton,
              background:
                activeTab === "transactions" ? "#fff" : "transparent",
            }}
            onClick={() => setActiveTab("transactions")}
          >
            Transactions
          </button>
        </div>
      </div>

      {/* Title (only on dashboard tab) */}
      {activeTab === "dashboard" && (
        <>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>
            Restaurant Control Panel
          </h2>
          <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>
            Manage your tables, menu, hiring and QR from one simple place. ✨
          </p>
        </>
      )}

      {/* DASHBOARD TAB CONTENT */}
      {activeTab === "dashboard" && (
        <>
          {/* 1️⃣ QR + Location Section */}
          <div style={cardStyle}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <div>
                <div style={sectionTitleStyle}>Create your Table QR</div>
                <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>
                  ⚠️ <b>Important:</b> Generate one QR and paste a copy on{" "}
                  <b>each table</b>. Customers will scan it to start ordering
                  directly from their seat.
                </p>
              </div>
              <button style={primaryButton} onClick={handleCreateQr}>
                Create QR
              </button>
            </div>

            <div
              style={{
                marginTop: 12,
                padding: 10,
                borderRadius: 12,
                background: "#fff7ed",
                fontSize: 12,
              }}
            >
              <b>Tip:</b> You can print the QR on small tent cards or stickers
              and place them on every table so guests never need to wait for a
              menu. 🙂
            </div>

            <div style={{ marginTop: 16 }}>
              <div style={labelStyle}>
                Restaurant Location (Google Maps link)
              </div>
              <input
                style={inputStyle}
                placeholder="Paste your Google Maps location URL here"
                value={locationLink}
                onChange={(e) => setLocationLink(e.target.value)}
              />
              <div style={{ marginTop: 8 }}>
                <button style={primaryButton} onClick={handleSaveLocation}>
                  Save Location
                </button>
              </div>
            </div>
          </div>

          {/* 2️⃣ Table Management */}
          <div style={cardStyle}>
            <div style={sectionTitleStyle}>Table Management</div>
            <p style={{ fontSize: 12, color: "#6b7280" }}>
              Quickly see which tables are <b>Booked</b> or <b>Available</b>.
            </p>

            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                marginTop: 12,
                marginBottom: 12,
                flexWrap: "wrap",
              }}
            >
              <input
                style={{ ...inputStyle, maxWidth: 220 }}
                placeholder="New table name (e.g., Table 5)"
                value={newTableName}
                onChange={(e) => setNewTableName(e.target.value)}
              />
              <button style={primaryButton} onClick={handleAddTable}>
                Add Table
              </button>
            </div>

            <div style={{ fontSize: 13 }}>
              {tables.map((t) => (
                <div
                  key={t.id}
                  style={{
                    padding: "8px 0",
                    borderBottom: "1px solid #f3f4f6",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 500 }}>{t.name}</span>{" "}
                    <span
                      style={pillStyle(
                        t.status === "Available"
                          ? "#16a34a"
                          : t.status === "Booked"
                          ? "#eab308"
                          : "#dc2626",
                        t.status === "Booked" ? "#111827" : "#fff"
                      )}
                    >
                      {t.status}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button
                      style={secondaryButton}
                      onClick={() =>
                        handleChangeTableStatus(t.id, "Available")
                      }
                    >
                      Available
                    </button>
                    <button
                      style={secondaryButton}
                      onClick={() =>
                        handleChangeTableStatus(t.id, "Booked")
                      }
                    >
                      Booked
                    </button>
                    <button
                      style={secondaryButton}
                      onClick={() => handleDeleteTable(t.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
              {tables.length === 0 && (
                <div style={{ fontSize: 12, color: "#9ca3af" }}>
                  No tables added yet.
                </div>
              )}
            </div>
          </div>

          {/* 3️⃣ Menu Management */}
          <div style={cardStyle}>
            <div style={sectionTitleStyle}>Menu Management</div>
            <p style={{ fontSize: 12, color: "#6b7280" }}>
              Add / delete items and set a small timer note like “Lunch offer
              till 4 PM”.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
                gap: 8,
                marginTop: 10,
                marginBottom: 10,
              }}
            >
              <div>
                <div style={labelStyle}>Item name</div>
                <input
                  style={inputStyle}
                  value={newItem.name}
                  onChange={(e) =>
                    setNewItem((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Paneer Butter Masala"
                />
              </div>
              <div>
                <div style={labelStyle}>Price (₹)</div>
                <input
                  style={inputStyle}
                  value={newItem.price}
                  onChange={(e) =>
                    setNewItem((prev) => ({ ...prev, price: e.target.value }))
                  }
                  placeholder="220"
                  type="number"
                />
              </div>
              <div>
                <div style={labelStyle}>Timer note (optional)</div>
                <input
                  style={inputStyle}
                  value={newItem.timer}
                  onChange={(e) =>
                    setNewItem((prev) => ({ ...prev, timer: e.target.value }))
                  }
                  placeholder="IN MIN"
                />
              </div>
            </div>
            <button style={primaryButton} onClick={handleAddMenuItem}>
              Add to Menu
            </button>

            <div style={{ marginTop: 12, fontSize: 13 }}>
              {menuItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: "8px 0",
                    borderBottom: "1px solid #f3f4f6",
                    display: "flex",
                    justifyContent: "space-between",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 500 }}>
                      {item.name}{" "}
                      <span style={{ color: "#4b5563", fontWeight: 400 }}>
                        – ₹{item.price}
                      </span>
                    </div>
                    {item.timer && (
                      <div style={{ fontSize: 11, color: "#f97316" }}>
                        ⏱ {item.timer}
                      </div>
                    )}
                  </div>
                  <button
                    style={secondaryButton}
                    onClick={() => handleDeleteMenuItem(item.id)}
                  >
                    Delete
                  </button>
                </div>
              ))}
              {menuItems.length === 0 && (
                <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 8 }}>
                  No items added yet.
                </div>
              )}
            </div>
          </div>

          {/* 5️⃣ Hiring Section */}
          <div style={cardStyle}>
            <div style={sectionTitleStyle}>Hiring</div>
            <p style={{ fontSize: 12, color: "#6b7280" }}>
              Create hiring posts visible on user dashboard and check responses
              with filters.
            </p>

            <div
              style={{
                display: "inline-flex",
                background: "#f3f4f6",
                borderRadius: 999,
                padding: 4,
                marginTop: 10,
                marginBottom: 12,
              }}
            >
              <button
                style={{
                  ...smallButton,
                  background:
                    hiringTab === "create" ? "#fff" : "transparent",
                  color: "#111827",
                }}
                onClick={() => setHiringTab("create")}
              >
                Create hiring post
              </button>
              <button
                style={{
                  ...smallButton,
                  background:
                    hiringTab === "responses" ? "#fff" : "transparent",
                  color: "#111827",
                }}
                onClick={() => setHiringTab("responses")}
              >
                View responses
              </button>
            </div>

            {hiringTab === "create" && (
              <div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: 10,
                  }}
                >
                  <div>
                    <div style={labelStyle}>Role</div>
                    <input
                      style={inputStyle}
                      value={hiringForm.role}
                      onChange={(e) =>
                        setHiringForm((prev) => ({
                          ...prev,
                          role: e.target.value,
                        }))
                      }
                      placeholder="Chef / Waiter / Manager"
                    />
                  </div>
                  <div>
                    <div style={labelStyle}>Salary range</div>
                    <input
                      style={inputStyle}
                      value={hiringForm.salaryRange}
                      onChange={(e) =>
                        setHiringForm((prev) => ({
                          ...prev,
                          salaryRange: e.target.value,
                        }))
                      }
                      placeholder="₹15,000 – ₹25,000"
                    />
                  </div>
                  <div>
                    <div style={labelStyle}>Experience</div>
                    <input
                      style={inputStyle}
                      value={hiringForm.experience}
                      onChange={(e) =>
                        setHiringForm((prev) => ({
                          ...prev,
                          experience: e.target.value,
                        }))
                      }
                      placeholder="1–3 years"
                    />
                  </div>
                  <div>
                    <div style={labelStyle}>Last date to apply</div>
                    <input
                      style={inputStyle}
                      type="date"
                      value={hiringForm.lastDate}
                      onChange={(e) =>
                        setHiringForm((prev) => ({
                          ...prev,
                          lastDate: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <div style={labelStyle}>Job description</div>
                    <textarea
                      style={{
                        ...inputStyle,
                        minHeight: 70,
                        resize: "vertical",
                      }}
                      value={hiringForm.description}
                      onChange={(e) =>
                        setHiringForm((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Describe responsibilities, shift timings, etc."
                    />
                  </div>
                </div>

                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12,
                    marginTop: 8,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={hiringForm.showOnUserDashboard}
                    onChange={(e) =>
                      setHiringForm((prev) => ({
                        ...prev,
                        showOnUserDashboard: e.target.checked,
                      }))
                    }
                  />
                  Show this hiring post on user dashboard
                </label>

                <div style={{ marginTop: 10 }}>
                  <button
                    style={primaryButton}
                    onClick={handleCreateHiringPost}
                  >
                    Create hiring post
                  </button>
                </div>

                {hiringPosts.length > 0 && (
                  <div
                    style={{
                      marginTop: 14,
                      paddingTop: 10,
                      borderTop: "1px dashed #e5e7eb",
                      fontSize: 12,
                    }}
                  >
                    <div style={{ fontWeight: 600, marginBottom: 6 }}>
                      Your hiring posts
                    </div>
                    {hiringPosts.map((hp) => (
                      <div
                        key={hp.id}
                        style={{
                          padding: "6px 0",
                          borderBottom: "1px solid #f3f4f6",
                        }}
                      >
                        <div style={{ fontWeight: 500 }}>{hp.role}</div>
                        <div style={{ fontSize: 11, color: "#4b5563" }}>
                          {hp.salaryRange && <>💸 {hp.salaryRange} · </>}
                          {hp.experience && <>🧑‍🍳 {hp.experience}</>}
                        </div>
                        <div style={{ fontSize: 11, color: "#6b7280" }}>
                          Last date: {hp.lastDate || "Not set"} · Created on:{" "}
                          {hp.createdAt}
                        </div>
                        <div style={{ fontSize: 11, marginTop: 2 }}>
                          {hp.showOnUserDashboard
                            ? "Visible on user dashboard ✅"
                            : "Not visible on user dashboard"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {hiringTab === "responses" && (
              <div>
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    marginBottom: 10,
                    marginTop: 4,
                  }}
                >
                  <div>
                    <div style={labelStyle}>Filter by role</div>
                    <select
                      style={{ ...inputStyle, maxWidth: 180 }}
                      value={responseFilterRole}
                      onChange={(e) => setResponseFilterRole(e.target.value)}
                    >
                      <option>All</option>
                      <option>Chef</option>
                      <option>Waiter</option>
                      <option>Manager</option>
                    </select>
                  </div>
                  <div>
                    <div style={labelStyle}>Filter by status</div>
                    <select
                      style={{ ...inputStyle, maxWidth: 180 }}
                      value={responseFilterStatus}
                      onChange={(e) => setResponseFilterStatus(e.target.value)}
                    >
                      <option>All</option>
                      <option>New</option>
                      <option>Shortlisted</option>
                      <option>Rejected</option>
                    </select>
                  </div>
                </div>

                <div style={{ fontSize: 13 }}>
                  {filteredResponses.map((r) => (
                    <div
                      key={r.id}
                      style={{
                        padding: "8px 0",
                        borderBottom: "1px solid #f3f4f6",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 500 }}>{r.name}</div>
                        <div style={{ fontSize: 11, color: "#4b5563" }}>
                          {r.role} · {r.experience}
                        </div>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <span
                          style={pillStyle(
                            r.status === "New"
                              ? "#3b82f6"
                              : r.status === "Shortlisted"
                              ? "#16a34a"
                              : "#dc2626"
                          )}
                        >
                          {r.status}
                        </span>
                        {/* NEW buttons */}
                        <button
                          style={secondaryButton}
                          onClick={() => handleShowDetails(r)}
                        >
                          Details
                        </button>
                        <button
                          style={primaryButton}
                          onClick={() => handleShortlist(r.id)}
                        >
                          Shortlist
                        </button>
                      </div>
                    </div>
                  ))}
                  {filteredResponses.length === 0 && (
                    <div
                      style={{ fontSize: 12, color: "#9ca3af", marginTop: 6 }}
                    >
                      No responses for selected filters.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* 6️⃣ Save QR for Pay Now */}
          <div style={cardStyle}>
            <div style={sectionTitleStyle}>Saved QR for Pay Now</div>
            <p style={{ fontSize: 12, color: "#6b7280" }}>
              This QR will be shown to the customer when they click{" "}
              <b>Pay Now</b>.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(0, 1.4fr) minmax(0, 1fr)",
                gap: 12,
                marginTop: 10,
              }}
            >
              <div>
                <div style={labelStyle}>QR image URL / Upload</div>
                <input
                  style={inputStyle}
                  value={qrImageUrl}
                  onChange={(e) => setQrImageUrl(e.target.value)}
                  placeholder="Paste QR image URL OR use Add QR button"
                />

                {/* Add QR from phone */}
                <input
                  type="file"
                  accept="image/*"
                  ref={qrFileInputRef}
                  style={{ display: "none" }}
                  onChange={handleQrFileChange}
                />

                <div
                  style={{
                    marginTop: 8,
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                  }}
                >
                  <button
                    style={secondaryButton}
                    onClick={() => qrFileInputRef.current?.click()}
                  >
                    Add QR
                  </button>
                  <button style={primaryButton} onClick={handleSaveQrImage}>
                    Save QR
                  </button>
                  <button
                    style={secondaryButton}
                    onClick={() => setShowQrModal(true)}
                    disabled={!qrImageUrl}
                  >
                    Preview ‘Pay Now’ QR
                  </button>
                </div>
              </div>
              <div
                style={{
                  borderRadius: 12,
                  border: "1px dashed #d1d5db",
                  padding: 10,
                  fontSize: 12,
                  background: "#f9fafb",
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 6 }}>
                  How it works (for you):
                </div>
                <ul
                  style={{ paddingLeft: 16, margin: 0, lineHeight: 1.5 }}
                >
                  <li>Save your UPI / payment QR image here.</li>
                  <li>
                    On user side, when they tap <b>Pay Now</b>, this QR will
                    pop up.
                  </li>
                  <li>They scan it with their UPI app and complete payment.</li>
                </ul>
              </div>
            </div>
          </div>

          {/* QR Modal */}
          {showQrModal && (
            <div
              onClick={() => setShowQrModal(false)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(0,0,0,0.4)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                zIndex: 9999,
              }}
            >
              <div
                onClick={(e) => e.stopPropagation()}
                style={{
                  background: "#fff",
                  borderRadius: 16,
                  padding: 20,
                  maxWidth: 320,
                  width: "90%",
                  textAlign: "center",
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: 8 }}>
                  Pay Now – Scan to Pay
                </div>
                {qrImageUrl ? (
                  <img
                    src={qrImageUrl}
                    alt="Payment QR"
                    style={{
                      width: "100%",
                      maxWidth: 220,
                      margin: "0 auto",
                      display: "block",
                      borderRadius: 12,
                      border: "1px solid #e5e7eb",
                    }}
                  />
                ) : (
                  <div style={{ fontSize: 12, color: "#9ca3af" }}>
                    No QR image set yet.
                  </div>
                )}
                <button
                  style={{ ...secondaryButton, marginTop: 12 }}
                  onClick={() => setShowQrModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* PROFILE TAB CONTENT – Restaurant Details (visible to users) */}
      {activeTab === "profile" && (
        <div style={cardStyle}>
          <div style={sectionTitleStyle}>
            Restaurant Details (visible to users)
          </div>
          <p style={{ fontSize: 12, color: "#6b7280" }}>
            This information appears on the user dashboard – keep it updated.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: 10,
              marginTop: 10,
            }}
          >
            <div>
              <div style={labelStyle}>Restaurant name</div>
              <input
                style={inputStyle}
                value={details.name}
                onChange={(e) =>
                  setDetails((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Your restaurant name"
              />
            </div>
            <div>
              <div style={labelStyle}>Help / contact number</div>
              <input
                style={inputStyle}
                value={details.helpNumber}
                onChange={(e) =>
                  setDetails((prev) => ({
                    ...prev,
                    helpNumber: e.target.value,
                  }))
                }
                placeholder="+91-XXXXXXXXXX"
              />
            </div>
            <div>
              <div style={labelStyle}>Contact email</div>
              <input
                style={inputStyle}
                value={details.contactEmail}
                onChange={(e) =>
                  setDetails((prev) => ({
                    ...prev,
                    contactEmail: e.target.value,
                  }))
                }
                placeholder="hello@restaurant.com"
              />
            </div>
            <div>
              <div style={labelStyle}>Opening hours</div>
              <input
                style={inputStyle}
                value={details.openingHours}
                onChange={(e) =>
                  setDetails((prev) => ({
                    ...prev,
                    openingHours: e.target.value,
                  }))
                }
                placeholder="10 AM – 11 PM"
              />
            </div>
            <div style={{ gridColumn: "1 / -1" }}>
              <div style={labelStyle}>Address</div>
              <textarea
                style={{ ...inputStyle, minHeight: 60, resize: "vertical" }}
                value={details.address}
                onChange={(e) =>
                  setDetails((prev) => ({
                    ...prev,
                    address: e.target.value,
                  }))
                }
                placeholder="Full address for users"
              />
            </div>
          </div>

          <div style={{ marginTop: 10 }}>
            <button style={primaryButton} onClick={handleSaveDetails}>
              Save details
            </button>
          </div>

          <div
            style={{
              marginTop: 14,
              paddingTop: 10,
              borderTop: "1px dashed #e5e7eb",
              fontSize: 12,
            }}
          >
            <div style={{ fontWeight: 600, marginBottom: 4 }}>Preview</div>
            <div>{details.name || "Restaurant Name"}</div>
            <div style={{ color: "#4b5563" }}>
              {details.address || "Address"}
            </div>
            <div style={{ marginTop: 4 }}>
              📞 {details.helpNumber || "Help number"}
            </div>
            <div>⏰ {details.openingHours || "Opening hours"}</div>
          </div>
        </div>
      )}

      {/* TRANSACTIONS TAB CONTENT */}
      {activeTab === "transactions" && (
        <div style={cardStyle}>
          <div style={sectionTitleStyle}>All Transactions</div>
          <p style={{ fontSize: 12, color: "#6b7280", marginBottom: 8 }}>
            Any transaction that users do in this restaurant will be saved here
            with their name, phone and transaction id.
          </p>

          {transactions.length === 0 ? (
            <div style={{ fontSize: 12, color: "#9ca3af" }}>
              No transactions recorded yet.
            </div>
          ) : (
            <div
              style={{
                marginTop: 6,
                borderRadius: 12,
                border: "1px solid #e5e7eb",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "1.2fr 1fr 1.1fr 0.8fr 1.2fr",
                  background: "#f3f4f6",
                  padding: "6px 10px",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                <div>User name</div>
                <div>Phone</div>
                <div>Transaction ID</div>
                <div>Amount</div>
                <div>Time</div>
              </div>
              {transactions.map((t) => (
                <div
                  key={t.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "1.2fr 1fr 1.1fr 0.8fr 1.2fr",
                    padding: "6px 10px",
                    fontSize: 12,
                    borderTop: "1px solid #f3f4f6",
                  }}
                >
                  <div>{t.userName}</div>
                  <div>{t.phone}</div>
                  <div>{t.id}</div>
                  <div>₹{t.amount}</div>
                  <div>{t.time}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* NEW: Candidate Details Modal */}
      {showResponseModal && selectedResponse && (
        <div
          onClick={() => setShowResponseModal(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#ffffff",
              borderRadius: 16,
              padding: 18,
              width: "90%",
              maxWidth: 360,
              fontSize: 13,
            }}
          >
            <div
              style={{
                fontWeight: 600,
                fontSize: 15,
                marginBottom: 8,
              }}
            >
              Candidate Details
            </div>
            <div style={{ marginBottom: 4 }}>
              <b>Name:</b> {selectedResponse.name}
            </div>
            <div style={{ marginBottom: 4 }}>
              <b>Role applied:</b> {selectedResponse.role}
            </div>
            <div style={{ marginBottom: 4 }}>
              <b>Experience:</b> {selectedResponse.experience}
            </div>
            <div style={{ marginBottom: 4 }}>
              <b>Status:</b> {selectedResponse.status}
            </div>
            <div
              style={{
                fontSize: 11,
                color: "#6b7280",
                marginTop: 6,
                marginBottom: 10,
              }}
            >
              (Yahan baad mein aap user ke form ke saare fields show kar
              sakte ho – phone, resume link, message, etc.)
            </div>
            <button
              style={{ ...secondaryButton, width: "100%" }}
              onClick={() => setShowResponseModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestaurantControlPanel;
