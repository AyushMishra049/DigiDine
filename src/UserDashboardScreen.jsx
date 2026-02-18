// src/UserDashboardScreen.jsx
import React, { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";


// ✅ Dummy restaurant + menu data
const DUMMY_RESTAURANTS = [
  {
    id: "R1",
    name: "DigiDine Restaurant 1",
    location: "Ground Floor",
    menu: [
      { id: "I1", name: "Paneer Tikka", price: 180, makingTimeMin: 15 },
      { id: "I2", name: "Veg Biryani", price: 220, makingTimeMin: 20 },
      { id: "I3", name: "Masala Dosa", price: 120, makingTimeMin: 10 },
    ],
  },
  {
    id: "R2",
    name: "DigiDine Restaurant 2",
    location: "1st Floor",
    menu: [
      { id: "I4", name: "Chicken Curry", price: 260, makingTimeMin: 25 },
      { id: "I5", name: "Butter Naan", price: 40, makingTimeMin: 5 },
    ],
  },
];

const UserDashboardScreen = () => {
  // restaurant selection
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(
    DUMMY_RESTAURANTS[0]?.id || null
  );

  // QR / dine-in
  const [inRestaurant, setInRestaurant] = useState(false);
  const [currentTable, setCurrentTable] = useState("");
  const [showQrScanner, setShowQrScanner] = useState(false);

  // cart: { itemId: quantity }
  const [cart, setCart] = useState({});

  // 🆕 active order items with timers
  // each item: { itemId, name, readyAt }
  const [orderItems, setOrderItems] = useState([]);
  const [nowTs, setNowTs] = useState(Date.now());

  // QR scanner ref
  const qrRef = useRef(null);

  const selectedRestaurant = DUMMY_RESTAURANTS.find(
    (r) => r.id === selectedRestaurantId
  );

  // --------- GLOBAL TIMER TICK (every 1 sec) ----------
  useEffect(() => {
    const id = setInterval(() => {
      setNowTs(Date.now());
    }, 1000);

    return () => clearInterval(id);
  }, []);

  // --------- QR SCANNER LOGIC ----------
  useEffect(() => {
    let html5QrCode;

    if (showQrScanner && qrRef.current) {
      const qrRegionId = "qr-reader-region";

      html5QrCode = new Html5Qrcode(qrRegionId);

      html5QrCode
        .start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            // ✅ QR CODE SCANNED
            console.log("QR Result:", decodedText);

            try {
              // Expect URL like:
              // https://yourdomain.com/dine?restaurantId=R1&tableId=T5
              const url = new URL(decodedText);
              const restaurantIdFromQr = url.searchParams.get("restaurantId");
              const tableIdFromQr = url.searchParams.get("tableId");

              if (restaurantIdFromQr) {
                setSelectedRestaurantId(restaurantIdFromQr);
              }
              if (tableIdFromQr) {
                setCurrentTable(tableIdFromQr);
              }

              setInRestaurant(true);

              alert(
                `Check-in successful!\nRestaurant: ${
                  restaurantIdFromQr || "N/A"
                }\nTable: ${tableIdFromQr || "N/A"}`
              );
            } catch (e) {
              console.error(e);
              alert("Invalid QR code format.");
            }

            // stop scanning & hide scanner
            html5QrCode
              .stop()
              .then(() => {
                html5QrCode.clear();
              })
              .catch((err) => console.error("Stop failed", err));

            setShowQrScanner(false);
          },
          (errorMessage) => {
            // scanning but no code yet (ignore)
          }
        )
        .catch((err) => {
          console.error("QR start failed", err);
          alert("Unable to access camera. Please allow camera permission.");
        });
    }

    // cleanup
    return () => {
      if (html5QrCode) {
        html5QrCode
          .stop()
          .then(() => html5QrCode.clear())
          .catch(() => {});
      }
    };
  }, [showQrScanner]);

  // --------- CART LOGIC (ADD / REMOVE) ----------

  const handleAddItem = (itemId) => {
    if (!inRestaurant) {
      alert("Please scan the table QR to check-in before ordering.");
      return;
    }

    setCart((prev) => ({
      ...prev,
      [itemId]: (prev[itemId] || 0) + 1,
    }));
  };

  const handleRemoveItem = (itemId) => {
    if (!inRestaurant) {
      alert("Please scan the table QR to check-in before ordering.");
      return;
    }

    setCart((prev) => {
      if (!prev[itemId]) return prev;
      const newQty = prev[itemId] - 1;
      const updated = { ...prev };
      if (newQty <= 0) {
        delete updated[itemId];
      } else {
        updated[itemId] = newQty;
      }
      return updated;
    });
  };

  const getItemQuantity = (itemId) => cart[itemId] || 0;

  const allMenuItems = selectedRestaurant?.menu || [];

  const totalItems = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalPrice = allMenuItems.reduce((sum, item) => {
    const qty = cart[item.id] || 0;
    return sum + qty * item.price;
  }, 0);

  const activeTimers = orderItems.length;

  // helper to format remaining time
  const formatRemaining = (readyAt) => {
    const remainingMs = readyAt - nowTs;
    if (remainingMs <= 0) return "Ready to serve";

    const totalSec = Math.floor(remainingMs / 1000);
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;

    const mm = String(mins).padStart(2, "0");
    const ss = String(secs).padStart(2, "0");
    return `${mm}:${ss}`;
  };

  // --------- PLACE ORDER ----------

  const handlePlaceOrder = () => {
    if (!inRestaurant) {
      alert("Scan QR to check-in before placing order.");
      return;
    }
    if (totalItems === 0) return;

    // create new order items with end time
    const now = Date.now();
    const newOrderItems = allMenuItems
      .filter((item) => cart[item.id])
      .map((item) => ({
        itemId: item.id,
        name: item.name,
        readyAt: now + item.makingTimeMin * 60 * 1000,
      }));

    setOrderItems(newOrderItems);
    setCart({});
    alert("Order placed! Timers started for your items.");
  };

  // --------- UI ----------
  return (
    <div className="page-root">
      {/* Header */}
      <header className="header">
        <div>
          <h2 className="title">DigiDine – User Dashboard</h2>
          <div className="subtitle">
            {inRestaurant
              ? `✅ Checked-in | Table: ${currentTable || "N/A"}`
              : "❌ Not checked-in – scan table QR to start ordering"}
          </div>
        </div>

        <button
          className="btn btn-logout"
          onClick={() => {
            alert("Logout clicked (implement real logout).");
          }}
        >
          ⏻ Logout
        </button>
      </header>

      {/* QR scan section */}
      {!inRestaurant && (
        <div className="card qr-card">
          <button
            onClick={() => setShowQrScanner(true)}
            className="btn btn-primary"
          >
            📷 Scan QR to Check-in
          </button>

          {showQrScanner && (
            <div className="qr-scanner-box">
              <div className="qr-tip">
                Point your camera at the table QR.
              </div>

              <div
                id="qr-reader-region"
                ref={qrRef}
                style={{ width: 260, height: 260, backgroundColor: "#000" }}
              />

              <button
                onClick={() => setShowQrScanner(false)}
                className="btn btn-danger small"
              >
                ✕ Cancel
              </button>
            </div>
          )}
        </div>
      )}

      {/* Restaurant selector */}
      <section className="card">
        <div className="section-title">Choose Restaurant</div>
        <div className="restaurant-chips">
          {DUMMY_RESTAURANTS.map((r) => {
            const isActive = r.id === selectedRestaurantId;
            return (
              <button
                key={r.id}
                onClick={() => setSelectedRestaurantId(r.id)}
                className={`chip ${isActive ? "chip-active" : ""}`}
              >
                {r.name}
              </button>
            );
          })}
        </div>
      </section>

      {/* Menu list */}
      <section className="card menu-card">
        <div className="menu-header">
          <div>
            <div className="menu-title">
              {selectedRestaurant?.name || "No Restaurant Selected"}
            </div>
            <div className="menu-subtitle">
              {selectedRestaurant?.location}
            </div>
          </div>
          {!inRestaurant && (
            <div className="badge-warning">
              Scan QR to enable ordering
            </div>
          )}
        </div>

        {allMenuItems.length === 0 ? (
          <div className="empty-text">
            No menu items found for this restaurant.
          </div>
        ) : (
          <div className="menu-grid">
            {allMenuItems.map((item) => {
              const qty = getItemQuantity(item.id);

              const orderInfo = orderItems.find(
                (o) => o.itemId === item.id
              );
              const remainingLabel = orderInfo
                ? formatRemaining(orderInfo.readyAt)
                : null;
              const isReady =
                orderInfo && orderInfo.readyAt - nowTs <= 0;

              return (
                <div key={item.id} className="menu-card-item">
                  <div className="item-name">{item.name}</div>
                  <div className="item-meta">
                    ₹{item.price} • ⏱ {item.makingTimeMin} min
                  </div>

                  {/* Timer info (only after order placed) */}
                  {orderInfo && (
                    <div
                      className={
                        "item-timer " +
                        (isReady ? "item-timer-ready" : "")
                      }
                    >
                      {isReady ? "✅ Ready to serve" : `⏳ Time left: ${remainingLabel}`}
                    </div>
                  )}

                  <div className="item-footer">
                    <div className="qty-control">
                      <button
                        onClick={() => handleRemoveItem(item.id)}
                        className="circle-btn circle-btn-minus"
                      >
                        -
                      </button>
                      <span className="qty-value">{qty}</span>
                      <button
                        onClick={() => handleAddItem(item.id)}
                        className="circle-btn circle-btn-plus"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Cart summary */}
      <footer className="cart-footer">
        <div>
          Items: <strong>{totalItems}</strong> | Total:{" "}
          <strong>₹{totalPrice}</strong>
          {activeTimers > 0 && (
            <> | Active timers: <strong>{activeTimers}</strong></>
          )}
        </div>
        <button
          disabled={!inRestaurant || totalItems === 0}
          className={`btn ${
            inRestaurant && totalItems > 0 ? "btn-warning" : "btn-disabled"
          }`}
          onClick={handlePlaceOrder}
        >
          🧾 Place Order
        </button>
      </footer>
    </div>
  );
};

export default UserDashboardScreen;
