

// src/components/BookingPage.jsx
import React, { useEffect, useRef, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Html5Qrcode } from "html5-qrcode";
import { setUserAuth } from "../store";
import { API_BASE_URL } from "../config"; // ⭐ backend ka base URL
import eatImg from "../assets/eat.png";


const BookingPage = ({
  restaurant,
  history,
  setHistory,
  favorites,
  setFavorites,
  onBack,
}) => {
  const [dishes, setDishes] = useState([]);
  const [loadingDishes, setLoadingDishes] = useState(false);
  const [dishError, setDishError] = useState("");

  const auth = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const [selectedMenuItemIds, setSelectedMenuItemIds] = useState([]);
  const [activeItems, setActiveItems] = useState([]);
  const [now, setNow] = useState(Date.now());

  const [inRestaurant, setInRestaurant] = useState(false);
  const [currentTable, setCurrentTable] = useState(null);
  const [showScanner, setShowScanner] = useState(false);
  const [scanError, setScanError] = useState("");
  const html5QrcodeRef = useRef(null);

  const [tables, setTables] = useState([
    { id: 1, number: "T1", type: "2 Seater", status: "available" },
    { id: 2, number: "T2", type: "2 Seater", status: "available" },
    { id: 3, number: "T3", type: "4 Seater", status: "booked" },
    { id: 4, number: "T4", type: "4 Seater", status: "available" },
    { id: 5, number: "T5", type: "Family", status: "available" },
    { id: 6, number: "T6", type: "Family", status: "booked" },
  ]);
  const [selectedTableId, setSelectedTableId] = useState(null);

  // receipt popup
  const [showReceipt, setShowReceipt] = useState(false);
  const [lastOrder, setLastOrder] = useState(null);

  // ✅ logo dropdown menu + panels
  const [showMenu, setShowMenu] = useState(false);
  const [showProfilePanel, setShowProfilePanel] = useState(false);
  const [showHistoryPanel, setShowHistoryPanel] = useState(false);
  const [showFavouritesPanel, setShowFavouritesPanel] = useState(false);

  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  // ⭐ dishes ko backend se laana
  useEffect(() => {
    if (!restaurant || !restaurant.id) {
      console.log("BookingPage: no restaurant passed in props", restaurant);
      return;
    }

    const controller = new AbortController();

    const loadDishes = async () => {
      try {
        setLoadingDishes(true);
        setDishError("");
        console.log(
          "Loading dishes for restaurant id =",
          restaurant.id,
          "API:",
          `${API_BASE_URL}/api/restaurants/${restaurant.id}/dishes`
        );

        const res = await fetch(
          `${API_BASE_URL}/api/restaurants/${restaurant.id}/dishes`,
          { signal: controller.signal }
        );

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || "Failed to load menu");
        }

        const data = await res.json();
        console.log("Dishes from backend:", data);
        setDishes(Array.isArray(data) ? data : []);
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Failed to load dishes", err);
        setDishError("");
        setDishes([]);
      } finally {
        setLoadingDishes(false);
      }
    };

    loadDishes();

    return () => controller.abort();
  }, [restaurant?.id]);

  // ⭐ NEW: restaurant rating state
  const [selectedRating, setSelectedRating] = useState(5);
  const [ratingComment, setRatingComment] = useState("");

  // STATIC fallback menu (jab backend me dishes na hon)
  const menuItems = [
    {
      id: 1,
      name: "Paneer Butter Masala",
      price: "₹220",
      type: "Veg",
      prepMinutes: 15,
    },
    {
      id: 2,
      name: "Dal Tadka",
      price: "₹180",
      type: "Veg",
      prepMinutes: 10,
    },
    {
      id: 3,
      name: "Chicken Biryani",
      price: "₹260",
      type: "Non-Veg",
      prepMinutes: 20,
    },
    {
      id: 4,
      name: "Masala Dosa",
      price: "₹150",
      type: "South Indian",
      prepMinutes: 12,
    },
    {
      id: 5,
      name: "Cold Coffee",
      price: "₹90",
      type: "Beverage",
      prepMinutes: 5,
    },
  ];

  // 👉 yahi se decide hoga ki UI me kaun sa menu use hoga
  const itemsSource = dishes.length > 0 ? dishes : menuItems;

  const parsePriceToNumber = (p) => {
    if (p === undefined || p === null) return 0;
    const digits = String(p).replace(/[^\d]/g, "");
    const val = parseInt(digits, 10);
    return isNaN(val) ? 0 : val;
  };

  const totalAmount = selectedMenuItemIds.reduce((sum, id) => {
    const item = itemsSource.find((m) => m.id === id);
    const value = parsePriceToNumber(item?.price);
    return sum + value;
  }, 0);

  const getItemCount = (itemId) =>
    selectedMenuItemIds.filter((id) => id === itemId).length;

  // global timer tick
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  // 🔥 Add keyframes for animated offer button (once)
  useEffect(() => {
    if (document.getElementById("offer-animation-styles")) return;
    const style = document.createElement("style");
    style.id = "offer-animation-styles";
    style.innerHTML = `
      @keyframes offerPulse {
        0% {
          transform: translateY(0);
          box-shadow: 0 0 0 0 rgba(255, 87, 34, 0.6);
        }
        100% {
          transform: translateY(-2px);
          box-shadow: 0 0 14px 2px rgba(255, 152, 0, 0.95);
        }
      }
      @keyframes offerBadgeBlink {
        0%, 100% {
          opacity: 1;
          transform: scale(1);
        }
        50% {
          opacity: 0.4;
          transform: scale(1.1);
        }
      }
    `;
    document.head.appendChild(style);
  }, []);

  // ✅ fill profile form when profile panel opens
  useEffect(() => {
    if (!showProfilePanel || !auth.user) return;
    setProfileForm({
      firstName: auth.user.firstName || auth.user.name || "",
      lastName: auth.user.lastName || "",
      email: auth.user.email || "",
      phone: auth.user.phone || "",
    });
  }, [showProfilePanel, auth.user]);

  // QR scanner
  useEffect(() => {
    const scannerId = "qr-reader";

    if (!showScanner) return;

    const startScanner = async () => {
      setScanError("");
      try {
        const elem = document.getElementById(scannerId);
        if (!elem) {
          setScanError("Scanner container not found.");
          return;
        }

        if (!html5QrcodeRef.current) {
          html5QrcodeRef.current = new Html5Qrcode(scannerId);
        }

        const qr = html5QrcodeRef.current;
        await qr.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: 250 },
          async (decodedText) => {
            console.log("QR Scanned:", decodedText);

            try {
              if (html5QrcodeRef.current) {
                await html5QrcodeRef.current.stop();
                await html5QrcodeRef.current.clear();
                html5QrcodeRef.current = null;
              }
            } catch {}

            setShowScanner(false);
            setInRestaurant(true);
            // For now fixed table:
            setCurrentTable("T3");

            alert(
              "QR Scanned Successfully! ✅ You are checked-in inside the restaurant."
            );
          },
          () => {}
        );
      } catch (err) {
        console.error("Camera error:", err);
        setScanError(
          "Camera permission denied or not available. Please allow camera access."
        );
      }
    };

    startScanner();

    return () => {
      if (html5QrcodeRef.current) {
        html5QrcodeRef.current
          .stop()
          .then(() => html5QrcodeRef.current && html5QrcodeRef.current.clear())
          .catch(() => {});
      }
    };
  }, [showScanner]);

  // add / remove items
  const handleAddMenuItem = (itemId) => {
    if (!inRestaurant) {
      alert(
        "You can add items only when you are inside this restaurant.\nPlease scan the QR on your table."
      );
      return;
    }
    setSelectedMenuItemIds((prev) => [...prev, itemId]);
  };

  const handleRemoveMenuItem = (itemId) => {
    setSelectedMenuItemIds((prev) => {
      const idx = [...prev].lastIndexOf(itemId);
      if (idx === -1) return prev;
      const copy = [...prev];
      copy.splice(idx, 1);
      return copy;
    });
  };

  // favourites
  const handleToggleFavourite = (menuItem) => {
    setFavorites((prev) => {
      const idx = prev.findIndex(
        (f) => f.restaurantId === restaurant.id && f.dishId === menuItem.id
      );
      if (idx !== -1) {
        const copy = [...prev];
        copy.splice(idx, 1);
        return copy;
      } else {
        const newFav = {
          id: Date.now(),
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          dishId: menuItem.id,
          dishName: menuItem.name,
          rating: 5,
        };
        return [...prev, newFav];
      }
    });
  };

  const handleFavouriteRatingChange = (menuItem, rating) => {
    setFavorites((prev) => {
      const idx = prev.findIndex(
        (f) => f.restaurantId === restaurant.id && f.dishId === menuItem.id
      );
      if (idx === -1) {
        const newFav = {
          id: Date.now(),
          restaurantId: restaurant.id,
          restaurantName: restaurant.name,
          dishId: menuItem.id,
          dishName: menuItem.name,
          rating,
        };
        return [...prev, newFav];
      } else {
        const copy = [...prev];
        copy[idx] = { ...copy[idx], rating };
        return copy;
      }
    });
  };

  // ⭐ NEW: save restaurant rating to localStorage
  const saveRestaurantRating = (restaurantId, rating) => {
    try {
      const stored =
        JSON.parse(localStorage.getItem("restaurantRatings") || "{}");
      stored[restaurantId] = {
        rating: Number(rating),
        updatedAt: new Date().toISOString(),
      };
      localStorage.setItem("restaurantRatings", JSON.stringify(stored));
    } catch (e) {
      console.error("Failed to save rating", e);
    }
  };

  // ⭐ NEW: rating submit handler
  const handleSubmitRating = () => {
    if (!selectedRating) {
      alert("Please select a rating first.");
      return;
    }

    if (!restaurant || !restaurant.id) {
      alert("Restaurant info missing.");
      return;
    }

    saveRestaurantRating(restaurant.id, selectedRating);
    alert("Thanks for rating this restaurant! ⭐");
  };

  // confirm order + receipt
  const handleConfirmOrder = () => {
    if (!inRestaurant) {
      alert("Please check-in by scanning the table QR first.");
      return;
    }
    if (selectedMenuItemIds.length === 0) {
      alert("Please add at least one item to your order.");
      return;
    }

    const startTime = Date.now();

    // itemsSource = dishes (agar available) warna static
    const itemsForOrder = selectedMenuItemIds
      .map((id) => {
        const item = itemsSource.find((m) => m.id === id);
        if (!item) return null;

        const priceStr =
          typeof item.price === "number" ? `₹${item.price}` : item.price;
        const prepMinutes = item.prepMinutes || 15;

        return {
          ...item,
          price: priceStr,
          prepMinutes,
        };
      })
      .filter(Boolean);

    const newItems = itemsForOrder.map((item, index) => ({
      id: `${item.id}-${startTime}-${index}`,
      name: item.name,
      readyAt: startTime + item.prepMinutes * 60 * 1000,
    }));

    setActiveItems((prev) => [...prev, ...newItems]);

    const totalNum = itemsForOrder.reduce(
      (sum, item) => sum + parsePriceToNumber(item.price),
      0
    );

    const orderObj = {
      id: Date.now(),
      restaurantId: restaurant.id,
      restaurant: restaurant.name,
      table: currentTable || "-",
      items: itemsForOrder.map((i) => ({
        name: i.name,
        price: i.price,
      })),
      total: totalNum,
      date: new Date().toLocaleDateString("en-GB"),
    };

    setHistory((prev) => [
      ...prev,
      {
        id: orderObj.id,
        restaurantId: restaurant.id,
        restaurant: restaurant.name,
        food: itemsForOrder.map((i) => i.name).join(", "),
        total: `₹${totalNum}`,
        table: currentTable || "-",
        date: orderObj.date,
      },
    ]);

    setLastOrder(orderObj);
    setShowReceipt(true);
    setSelectedMenuItemIds([]);

    alert(`Online Payments are PAUSED DUE TO MAINTENANCE you can pay to restaurent counter(Show order history) ₹${totalNum}. Timer started.`);
  };

  const handlePayNowClick = () => {
    handleConfirmOrder();
  };

  // table booking
  const handleBookTable = () => {
    if (!selectedTableId) {
      alert("Please select a table first.");
      return;
    }

    setTables((prev) =>
      prev.map((t) =>
        t.id === selectedTableId ? { ...t, status: "booked" } : t
      )
    );

    const bookedTable = tables.find((t) => t.id === selectedTableId);
    setCurrentTable(bookedTable?.number || null);
    alert(
      `Table ${bookedTable?.number || ""} booked successfully for ${
        restaurant?.name || "this restaurant"
      }`
    );
    setSelectedTableId(null);
  };

  // cancel booking with reason
  const handleCancelBooking = () => {
    if (!currentTable) {
      alert("No table is currently booked.");
      return;
    }
    const reason = window.prompt(
      "Please enter reason for cancelling your table booking:"
    );
    if (!reason) {
      alert("Cancellation aborted. Reason is required.");
      return;
    }

    setTables((prev) =>
      prev.map((t) =>
        t.number === currentTable ? { ...t, status: "available" } : t
      )
    );
    alert(`Your booking for ${currentTable} is cancelled.\nReason: ${reason}`);
    setCurrentTable(null);
  };

  const TableBox = ({ table, isSelected, onClick }) => {
    const isBooked = table.status === "booked";
    const borderColor = isBooked
      ? "#bdbdbd"
      : isSelected
      ? "#2e7d32"
      : "#4caf50";
    const backgroundColor = isBooked
      ? "#eeeeee"
      : isSelected
      ? "rgba(200,230,201,0.9)"
      : "rgba(255,255,255,0.95)";

    return (
      <div
        onClick={!isBooked ? onClick : undefined}
        style={{
          width: 80,
          height: 70,
          borderRadius: 10,
          border: `2px solid ${borderColor}`,
          backgroundColor,
          margin: 6,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 11,
          cursor: isBooked ? "not-allowed" : "pointer",
          boxShadow: isSelected
            ? "0 0 8px rgba(46,125,50,0.7)"
            : "0 2px 4px rgba(0,0,0,0.15)",
        }}
      >
        <div style={{ fontWeight: "bold" }}>{table.number}</div>
        <div style={{ fontSize: 10, color: "#555" }}>{table.type}</div>
        <div
          style={{
            marginTop: 4,
            fontSize: 10,
            color: isBooked ? "#d32f2f" : "#388e3c",
          }}
        >
          {isBooked ? "Booked" : "Available"}
        </div>
      </div>
    );
  };

  // Back arrow from booking page to dashboard
  const BackArrow = () => (
    <button
      onClick={onBack}
      style={{
        position: "absolute",
        left: "2%",
        top: "9.4%",
        borderRadius: "999px",
        border: "none",
        padding: "4px 10px",
        backgroundColor: "rgba(0,0,0,0.7)",
        color: "#fff",
        fontSize: 12,
        cursor: "pointer",
        zIndex: 50,
      }}
    >
      ← Back
    </button>
  );

  // profile handlers + logout
  const handleProfileInputChange = (field, value) => {
    setProfileForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSaveProfile = () => {
    if (!auth.user) return;

    const userAccounts = JSON.parse(
      localStorage.getItem("userAccounts") || "[]"
    );
    const index = userAccounts.findIndex(
      (u) =>
        u.email === auth.user.email ||
        u.username === auth.user.name ||
        u.username === auth.user.username
    );

    if (index !== -1) {
      userAccounts[index] = {
        ...userAccounts[index],
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        email: profileForm.email,
        phone: profileForm.phone,
      };
      localStorage.setItem("userAccounts", JSON.stringify(userAccounts));
    }

    dispatch(
      setUserAuth({
        ...auth.user,
        firstName: profileForm.firstName,
        lastName: profileForm.lastName,
        email: profileForm.email,
        phone: profileForm.phone,
        name: profileForm.firstName || auth.user.name,
        username: profileForm.firstName || auth.user.username,
      })
    );

    alert("Profile updated successfully.");
    setShowProfilePanel(false);
  };

  const handleLogout = () => {
    // auth hata do
    dispatch(setUserAuth(null));
    setShowMenu(false);

    // 👇 app ko fresh reload karo, taaki login screen dikhe
    window.location.reload();
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
      }}
    >
      <BackArrow />

      {/* logo + greeting */}
      <div
        style={{
          position: "absolute",
          left: "3%",
          top: "3%",
          display: "flex",
          alignItems: "center",
          gap: 10,
          color: "#fff",
          zIndex: 60,
        }}
      >
        <img
          src={eatImg}
          alt="eat"
          style={{ width: 40, height: 40, cursor: "pointer" }}
          onClick={() => setShowMenu((prev) => !prev)}
        />
        <div
          style={{ cursor: "pointer" }}
          onClick={() => setShowMenu((prev) => !prev)}
        >
          <div style={{ fontWeight: "bold", fontSize: 18 }}>DiGiDine</div>
          <div style={{ fontSize: 11, color: "#FFECB3" }}>
            Hi {auth.user?.name || "Foodie"}! Ready to eat? 😋
          </div>
        </div>
      </div>

      {/* logo dropdown menu */}
      {showMenu && (
        <div
          style={{
            position: "absolute",
            left: "3%",
            top: "9%",
            backgroundColor: "rgba(255,255,255,0.97)",
            borderRadius: 12,
            padding: "6px 12px",
            boxShadow: "0 4px 14px rgba(0,0,0,0.45)",
            fontSize: 13,
            minWidth: 160,
            zIndex: 9999,
          }}
        >
          <button
            style={{
              width: "100%",
              textAlign: "left",
              border: "none",
              background: "transparent",
              padding: "4px 2px",
              cursor: "pointer",
            }}
            onClick={() => {
              setShowMenu(false);
              onBack(); // 👈 UserDashboard pe wapas
            }}
          >
            🏠 Home
          </button>

          <button
            style={{
              width: "100%",
              textAlign: "left",
              border: "none",
              background: "transparent",
              padding: "4px 2px",
              cursor: "pointer",
            }}
            onClick={() => {
              setShowMenu(false);
              setShowProfilePanel(true);
            }}
          >
            👤 Profile
          </button>
          <button
            style={{
              width: "100%",
              textAlign: "left",
              border: "none",
              background: "transparent",
              padding: "4px 2px",
              cursor: "pointer",
            }}
            onClick={() => {
              setShowMenu(false);
              setShowHistoryPanel(true);
            }}
          >
            📜 Order History
          </button>
          <button
            style={{
              width: "100%",
              textAlign: "left",
              border: "none",
              background: "transparent",
              padding: "4px 2px",
              cursor: "pointer",
            }}
            onClick={() => {
              setShowMenu(false);
              setShowFavouritesPanel(true);
            }}
          >
            ⭐ Favourites
          </button>
          <button
            style={{
              width: "100%",
              textAlign: "left",
              border: "none",
              background: "transparent",
              padding: "4px 2px",
              cursor: "pointer",
              color: "#d32f2f",
              fontWeight: "bold",
            }}
            onClick={handleLogout}
          >
            🚪 Logout
          </button>
        </div>
      )}

      {/* main dark overlay + booking card */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.7)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "92%",
            maxWidth: 950,
            maxHeight: "85vh",
            backgroundColor: "rgba(255,255,255,0.98)",
            borderRadius: 22,
            padding: "14px 18px",
            boxShadow: "0 8px 22px rgba(0,0,0,0.7)",
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            gap: 14,
            position: "relative",
          }}
        >
          {/* Animated Offer Button */}
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 6,
            }}
          >
            <button
              style={{
                position: "relative",
                padding: "8px 18px",
                borderRadius: 999,
                border: "none",
                background: "linear-gradient(90deg,#ff5722,#ff9800)",
                color: "#fff",
                fontSize: 12,
                fontWeight: "bold",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 8,
                animation: "offerPulse 1.1s infinite alternate",
                letterSpacing: 0.4,
                textTransform: "uppercase",
              }}
              onClick={() =>
                alert(`🔥 Special offers for ${restaurant.name} Not Available!`)
              }
            >
              <span style={{ fontSize: 16 }}>🔥</span>
              <span>Exclusive Offers at {restaurant.name}</span>
              <span
                style={{
                  fontSize: 10,
                  background: "rgba(0,0,0,0.25)",
                  padding: "2px 8px",
                  borderRadius: 999,
                  textTransform: "uppercase",
                  animation: "offerBadgeBlink 1s infinite",
                }}
              >
                New
              </span>
            </button>
          </div>

          {/* header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              marginBottom: 4,
              gap: 12,
            }}
          >
            <div>
              <div style={{ fontWeight: "bold", fontSize: 16 }}>
                {restaurant.name}
              </div>
              <div style={{ fontSize: 11, color: "#555" }}>
                {restaurant.area ? `${restaurant.area}, ` : ""}
                {restaurant.city}
                {restaurant.state ? `, ${restaurant.state}` : ""}
              </div>
              {inRestaurant && (
                <div
                  style={{
                    marginTop: 4,
                    fontSize: 11,
                    color: "#2e7d32",
                    fontWeight: "bold",
                  }}
                >
                  ✅ Checked-in (Table: {currentTable || "N/A"})
                </div>
              )}
            </div>

            {/* scan button / table info */}
            <div style={{ textAlign: "right", fontSize: 11 }}>
              {!inRestaurant && (
                <button
                  onClick={() => setShowScanner(true)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 999,
                    border: "none",
                    backgroundColor: "#1976d2",
                    color: "#fff",
                    fontSize: 12,
                    cursor: "pointer",
                    marginBottom: 4,
                  }}
                >
                  📷 Scan QR to Check-in
                </button>
              )}
              {currentTable && (
                <div style={{ marginTop: 4 }}>
                  Current table:{" "}
                  <strong style={{ color: "#2e7d32" }}>{currentTable}</strong>
                </div>
              )}
            </div>
          </div>

          {/* MENU + TOTAL + CONFIRM */}
          <div
            style={{
              borderRadius: 16,
              border: "1px solid #eee",
              padding: "10px 12px",
            }}
          >
            <div style={{ fontWeight: "bold", fontSize: 15, marginBottom: 6 }}>
              Menu – All Available Items
            </div>
            <div style={{ fontSize: 11, color: "#777", marginBottom: 4 }}>
              {dishes.length > 0
                ? "These dishes are coming directly from DigiDine backend."
                : "Showing all Available Dhises."}
            </div>

            {loadingDishes && (
              <div style={{ fontSize: 12, color: "#555", marginBottom: 4 }}>
                Loading menu...
              </div>
            )}
            {dishError && (
              <div style={{ fontSize: 12, color: "red", marginBottom: 4 }}>
                {dishError}
              </div>
            )}

            <div
              style={{
                fontSize: 11,
                color: "#777",
                marginBottom: 8,
              }}
            >
              Use + / - to add or remove items. Total cost updates below.
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 6,
                fontSize: 11,
                flexWrap: "wrap",
                gap: 6,
              }}
            >
              <div>
                Items selected: <strong>{selectedMenuItemIds.length}</strong>
                <span style={{ marginLeft: 8 }}>
                  Total: <strong>₹{totalAmount}</strong>
                </span>
                {!inRestaurant && (
                  <span style={{ color: "#d32f2f", marginLeft: 6 }}>
                    (Check-in required)
                  </span>
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 10,
                  justifyContent: "flex-end",
                }}
              >
                <button
                  onClick={handleConfirmOrder}
                  style={{
                    padding: "6px 14px",
                    borderRadius: 999,
                    border: "none",
                    backgroundColor: "#4caf50",
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  Pay &amp; Start Timers
                </button>


              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 10,
              }}
            >
              {itemsSource.length === 0 && !loadingDishes && !dishError && (
                <div style={{ fontSize: 12, color: "#777" }}>
                  No dishes added for this restaurant yet.
                </div>
              )}

              {itemsSource.map((item) => {
                const count = getItemCount(item.id);
                const favForItem = favorites.find(
                  (f) =>
                    f.restaurantId === restaurant.id && f.dishId === item.id
                );
                const isFav = !!favForItem;
                const currentRating = favForItem?.rating || 5;

                const priceLabel =
                  typeof item.price === "number"
                    ? `₹${item.price}`
                    : item.price;
                const prepMinutes = item.prepMinutes || 15;

                return (
                  <div
                    key={item.id}
                    style={{
                      flex: "0 0 200px",
                      borderRadius: 12,
                      border: "1px solid #ddd",
                      padding: "8px 10px",
                      backgroundColor: "#fafafa",
                      fontSize: 12,
                    }}
                  >
                    <div style={{ fontWeight: "bold" }}>{item.name}</div>
                    <div style={{ fontSize: 11, color: "#777" }}>
                      {item.type}
                    </div>
                    <div
                      style={{
                        marginTop: 4,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ fontWeight: "bold" }}>{priceLabel}</span>
                      <span
                        style={{
                          fontSize: 10,
                          color: "#555",
                          marginRight: 4,
                        }}
                      >
                        ⏱ {prepMinutes} min
                      </span>
                    </div>

                    <div
                      style={{
                        marginTop: 6,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 6,
                      }}
                    >
                      <button
                        style={{
                          flex: "0 0 32px",
                          borderRadius: 999,
                          padding: "3px 0",
                          border: "none",
                          backgroundColor:
                            count > 0 ? "#f44336" : "#e0e0e0",
                          color: "#fff",
                          fontSize: 14,
                          cursor: count > 0 ? "pointer" : "not-allowed",
                        }}
                        disabled={count === 0}
                        onClick={() => handleRemoveMenuItem(item.id)}
                      >
                        -
                      </button>
                      <span
                        style={{
                          flex: 1,
                          textAlign: "center",
                          fontSize: 12,
                        }}
                      >
                        Qty: <strong>{count}</strong>
                      </span>
                      <button
                        style={{
                          flex: "0 0 32px",
                          borderRadius: 999,
                          padding: "3px 0",
                          border: "none",
                          backgroundColor: "#4caf50",
                          color: "#fff",
                          fontSize: 14,
                          cursor: "pointer",
                        }}
                        onClick={() => handleAddMenuItem(item.id)}
                      >
                        +
                      </button>
                    </div>

                    {/* Favourite + Rating for dish */}
                    <div
                      style={{
                        marginTop: 6,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        gap: 6,
                        fontSize: 11,
                      }}
                    >
                      <button
                        style={{
                          flex: 1,
                          borderRadius: 999,
                          padding: "4px 6px",
                          border: "none",
                          backgroundColor: isFav ? "#ffb300" : "#eeeeee",
                          color: isFav ? "#4e342e" : "#555",
                          cursor: "pointer",
                          fontSize: 11,
                          fontWeight: isFav ? "bold" : "normal",
                        }}
                        onClick={() => handleToggleFavourite(item)}
                      >
                        {isFav ? "★ Favourite" : "☆ Add Favourite"}
                      </button>
                      <select
                        value={currentRating}
                        onChange={(e) =>
                          handleFavouriteRatingChange(
                            item,
                            Number(e.target.value)
                          )
                        }
                        style={{
                          flex: "0 0 70px",
                          fontSize: 11,
                          padding: "3px 4px",
                          borderRadius: 8,
                          border: "1px solid #ccc",
                        }}
                      >
                        {[1, 2, 3, 4, 5].map((n) => (
                          <option key={n} value={n}>
                            {n}★
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ⭐ NEW: Rate this restaurant (global rating) */}
          <div
            style={{
              borderRadius: 16,
              border: "1px solid #eee",
              padding: "10px 12px",
              backgroundColor: "#fafafa",
              fontSize: 12,
            }}
          >
            <div
              style={{
                fontWeight: "bold",
                marginBottom: 4,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>Rate this restaurant</span>
              {selectedRating && (
                <span style={{ fontSize: 11, color: "#555" }}>
                  Your rating: {selectedRating}/5
                </span>
              )}
            </div>

            {/* Star-like buttons 1–5 */}
            <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setSelectedRating(star)}
                  style={{
                    borderRadius: 999,
                    border:
                      selectedRating === star
                        ? "1px solid #ff9800"
                        : "1px solid #ccc",
                    padding: "4px 8px",
                    cursor: "pointer",
                    backgroundColor:
                      selectedRating === star
                        ? "#ffe0b2"
                        : "rgba(255,255,255,0.9)",
                    fontSize: 12,
                  }}
                >
                  {star} ⭐
                </button>
              ))}
            </div>

            {/* Optional comment box */}
            <div style={{ marginBottom: 6 }}>
              <div style={{ fontSize: 11, marginBottom: 2 }}>
                Share your experience (optional)
              </div>
              <textarea
                rows={2}
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                placeholder="Food taste, service, ambience..."
                style={{
                  width: "100%",
                  padding: "6px 8px",
                  borderRadius: 8,
                  border: "1px solid #ccc",
                  fontSize: 12,
                  resize: "vertical",
                }}
              />
            </div>

            <button
              onClick={handleSubmitRating}
              style={{
                padding: "6px 12px",
                borderRadius: 999,
                border: "none",
                backgroundColor: "#ff9800",
                color: "#fff",
                fontSize: 12,
                fontWeight: "bold",
                cursor: "pointer",
              }}
            >
              Submit Rating ⭐
            </button>
          </div>

          {/* ACTIVE TIMERS */}
          <div
            style={{
              borderRadius: 16,
              border: "1px solid #eee",
              padding: "10px 12px",
            }}
          >
            <div style={{ fontWeight: "bold", fontSize: 15, marginBottom: 6 }}>
              Active Orders – Smart Dish Prepration Timers
            </div>
            <div style={{ fontSize: 11, color: "#777", marginBottom: 6 }}>
              These timers run only while you are checked-in at the restaurant.
            </div>

            {activeItems.length === 0 ? (
              <div style={{ fontSize: 12, color: "#777" }}>
                No active items yet. Add items and pay to see timers.
              </div>
            ) : (
              <div style={{ fontSize: 12 }}>
                {activeItems.map((item) => {
                  const remainingMs = item.readyAt - now;
                  const remainingSec = Math.max(
                    0,
                    Math.floor(remainingMs / 1000)
                  );
                  const mm = String(
                    Math.floor(remainingSec / 60)
                  ).padStart(2, "0");
                  const ss = String(remainingSec % 60).padStart(2, "0");
                  return (
                    <div
                      key={item.id}
                      style={{
                        marginBottom: 4,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span>{item.name}</span>
                      <span
                        style={{
                          fontFamily: "monospace",
                          fontWeight: "bold",
                          color:
                            remainingSec === 0 ? "#d32f2f" : "#2e7d32",
                        }}
                      >
                        {mm}:{ss}
                        {remainingSec === 0 && " (Ready)"}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* TABLE LAYOUT + CANCEL BUTTON */}
          <div
            style={{
              borderRadius: 16,
              border: "1px solid #eee",
              padding: "10px 12px",
            }}
          >
            <div style={{ fontWeight: "bold", fontSize: 15, marginBottom: 6 }}>
              Tables – Select &amp; Book
            </div>
            <div style={{ fontSize: 11, color: "#777", marginBottom: 8 }}>
              Tap on any available table to select it, then press{" "}
              <strong>Book Table</strong>.
            </div>

            <div
              style={{
                backgroundColor: "#f9f9f9",
                padding: 8,
                borderRadius: 12,
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "flex-start",
              }}
            >
              {tables.map((table) => (
                <TableBox
                  key={table.id}
                  table={table}
                  isSelected={selectedTableId === table.id}
                  onClick={() => setSelectedTableId(table.id)}
                />
              ))}
            </div>

            <div
              style={{
                marginTop: 10,
                display: "flex",
                justifyContent: "space-between",
                flexWrap: "wrap",
                alignItems: "center",
                gap: 10,
                fontSize: 11,
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 10,
                  flexWrap: "wrap",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 4,
                      backgroundColor: "#c8e6c9",
                      border: "1px solid #4caf50",
                    }}
                  />
                  <span>Available</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 4,
                      backgroundColor: "#eeeeee",
                      border: "1px solid #bdbdbd",
                    }}
                  />
                  <span>Booked</span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      borderRadius: 4,
                      backgroundColor: "#a5d6a7",
                      border: "1px solid #2e7d32",
                    }}
                  />
                  <span>Selected</span>
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: 8,
                  marginLeft: "auto",
                }}
              >
                <button
                  onClick={handleBookTable}
                  style={{
                    padding: "6px 16px",
                    borderRadius: 999,
                    border: "none",
                    backgroundColor: "#2e7d32",
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  Book Table
                </button>
                <button
                  onClick={handleCancelBooking}
                  style={{
                    padding: "6px 16px",
                    borderRadius: 999,
                    border: "none",
                    backgroundColor: "#f44336",
                    color: "#fff",
                    fontSize: 12,
                    fontWeight: "bold",
                    cursor: "pointer",
                  }}
                >
                  Cancel Booking
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* QR Scanner Popup */}
      {showScanner && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 20,
          }}
        >
          <div
            style={{
              width: 340,
              maxWidth: "90%",
              backgroundColor: "#ffffff",
              borderRadius: 16,
              padding: "14px 16px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
              textAlign: "center",
            }}
          >
            <div style={{ fontWeight: "bold", fontSize: 15, marginBottom: 6 }}>
              Scan Restaurant / Table QR
            </div>
            <div
              style={{
                fontSize: 11,
                color: "#555",
                marginBottom: 10,
              }}
            >
              Point your camera at the QR placed on your table.
            </div>

            <div
              id="qr-reader"
              style={{
                width: "100%",
                maxWidth: 300,
                margin: "0 auto",
                minHeight: 220,
                backgroundColor: "#00000011",
              }}
            />

            {scanError && (
              <div
                style={{
                  marginTop: 8,
                  fontSize: 11,
                  color: "#d32f2f",
                }}
              >
                {scanError}
              </div>
            )}

            <button
              onClick={() => {
                setShowScanner(false);
                setScanError("");
              }}
              style={{
                marginTop: 10,
                padding: "6px 14px",
                borderRadius: 999,
                border: "none",
                backgroundColor: "#f44336",
                color: "#fff",
                fontSize: 12,
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* RECEIPT POPUP */}
      {showReceipt && lastOrder && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.7)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 40,
          }}
        >
          <div
            style={{
              width: 360,
              maxWidth: "90%",
              backgroundColor: "#ffffff",
              borderRadius: 16,
              padding: "16px 18px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.7)",
              fontSize: 12,
            }}
          >
            <div
              style={{
                fontWeight: "bold",
                fontSize: 16,
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              🧾 Order Receipt
            </div>
            <div style={{ marginBottom: 4 }}>
              <strong>Restaurant:</strong> {lastOrder.restaurant}
            </div>
            <div style={{ marginBottom: 4 }}>
              <strong>Date:</strong> {lastOrder.date}
            </div>
            <div style={{ marginBottom: 4 }}>
              <strong>Table:</strong> {lastOrder.table}
            </div>
            <div style={{ marginBottom: 4 }}>
              <strong>Name:</strong>{" "}
              {auth.user?.name || auth.user?.email || "Guest"}
            </div>

            <hr style={{ margin: "8px 0" }} />

            <div style={{ marginBottom: 4 }}>
              <strong>Items:</strong>
            </div>
            <ul style={{ paddingLeft: 18, margin: 0 }}>
              {lastOrder.items.map((it, idx) => (
                <li key={idx}>
                  {it.name} — {it.price}
                </li>
              ))}
            </ul>

            <hr style={{ margin: "8px 0" }} />
            <div
              style={{
                textAlign: "right",
                fontSize: 13,
                fontWeight: "bold",
              }}
            >
              Total: ₹{lastOrder.total}
            </div>

            <div
              style={{
                marginTop: 10,
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
              }}
            >
              <button
                onClick={() => window.print()}
                style={{
                  padding: "6px 12px",
                  borderRadius: 999,
                  border: "1px solid #ccc",
                  backgroundColor: "#fafafa",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                Print
              </button>
              <button
                onClick={() => setShowReceipt(false)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 999,
                  border: "none",
                  backgroundColor: "#2196f3",
                  color: "#fff",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PROFILE PANEL */}
      {showProfilePanel && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 70,
          }}
        >
          <div
            style={{
              width: 360,
              maxWidth: "90%",
              backgroundColor: "#ffffff",
              borderRadius: 18,
              padding: "16px 18px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
            }}
          >
            <div
              style={{
                fontWeight: "bold",
                fontSize: 16,
                marginBottom: 8,
              }}
            >
              👤 My Profile
            </div>
            <div
              style={{
                fontSize: 11,
                color: "#666",
                marginBottom: 10,
              }}
            >
              View and edit your DiGiDine account details.
            </div>

            <div style={{ fontSize: 12, marginBottom: 8 }}>
              <div style={{ marginBottom: 6 }}>
                <div style={{ fontSize: 11, marginBottom: 2 }}>
                  First Name
                </div>
                <input
                  type="text"
                  value={profileForm.firstName}
                  onChange={(e) =>
                    handleProfileInputChange("firstName", e.target.value)
                  }
                  style={{
                    width: "100%",
                    padding: "6px 8px",
                    borderRadius: 6,
                    border: "1px solid #ccc",
                    fontSize: 12,
                  }}
                />
              </div>
              <div style={{ marginBottom: 6 }}>
                <div style={{ fontSize: 11, marginBottom: 2 }}>Last Name</div>
                <input
                  type="text"
                  value={profileForm.lastName}
                  onChange={(e) =>
                    handleProfileInputChange("lastName", e.target.value)
                  }
                  style={{
                    width: "100%",
                    padding: "6px 8px",
                    borderRadius: 6,
                    border: "1px solid #ccc",
                    fontSize: 12,
                  }}
                />
              </div>
              <div style={{ marginBottom: 6 }}>
                <div style={{ fontSize: 11, marginBottom: 2 }}>Email</div>
                <input
                  type="email"
                  value={profileForm.email}
                  onChange={(e) =>
                    handleProfileInputChange("email", e.target.value)
                  }
                  style={{
                    width: "100%",
                    padding: "6px 8px",
                    borderRadius: 6,
                    border: "1px solid #ccc",
                    fontSize: 12,
                  }}
                />
              </div>
              <div style={{ marginBottom: 6 }}>
                <div style={{ fontSize: 11, marginBottom: 2 }}>
                  Phone Number
                </div>
                <input
                  type="tel"
                  value={profileForm.phone}
                  onChange={(e) =>
                    handleProfileInputChange("phone", e.target.value)
                  }
                  style={{
                    width: "100%",
                    padding: "6px 8px",
                    borderRadius: 6,
                    border: "1px solid #ccc",
                    fontSize: 12,
                  }}
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 8,
                marginTop: 8,
              }}
            >
              <button
                onClick={() => setShowProfilePanel(false)}
                style={{
                  padding: "6px 12px",
                  borderRadius: 999,
                  border: "1px solid #ccc",
                  backgroundColor: "#fafafa",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                Close
              </button>
              <button
                onClick={handleSaveProfile}
                style={{
                  padding: "6px 12px",
                  borderRadius: 999,
                  border: "none",
                  backgroundColor: "#2196f3",
                  color: "#fff",
                  fontSize: 12,
                  fontWeight: "bold",
                  cursor: "pointer",
                }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ORDER HISTORY PANEL */}
      {showHistoryPanel && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 70,
          }}
        >
          <div
            style={{
              width: "90%",
              maxWidth: 700,
              maxHeight: "80vh",
              backgroundColor: "#ffffff",
              borderRadius: 18,
              padding: "16px 18px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
              overflowY: "auto",
              fontSize: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: "bold",
                    fontSize: 16,
                  }}
                >
                  📜 Order History
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#666",
                  }}
                >
                  All transactions done on DiGiDine.
                </div>
              </div>
              <button
                onClick={() => setShowHistoryPanel(false)}
                style={{
                  borderRadius: 999,
                  border: "none",
                  padding: "4px 10px",
                  backgroundColor: "#f44336",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                ✕ Close
              </button>
            </div>

            {history.length === 0 ? (
              <div style={{ fontSize: 12, color: "#777", marginTop: 6 }}>
                No orders yet. Place an order to see your history here.
              </div>
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 11,
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#f5f5f5" }}>
                    <th
                      style={{
                        border: "1px solid #ddd",
                        padding: "4px 6px",
                        textAlign: "left",
                      }}
                    >
                      Date
                    </th>
                    <th
                      style={{
                        border: "1px solid #ddd",
                        padding: "4px 6px",
                        textAlign: "left",
                      }}
                    >
                      Restaurant
                    </th>
                    <th
                      style={{
                        border: "1px solid #ddd",
                        padding: "4px 6px",
                        textAlign: "left",
                      }}
                    >
                      Food Ordered
                    </th>
                    <th
                      style={{
                        border: "1px solid #ddd",
                        padding: "4px 6px",
                        textAlign: "left",
                      }}
                    >
                      Total
                    </th>
                    <th
                      style={{
                        border: "1px solid #ddd",
                        padding: "4px 6px",
                        textAlign: "left",
                      }}
                    >
                      Table
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((h) => (
                    <tr key={h.id}>
                      <td
                        style={{
                          border: "1px solid #eee",
                          padding: "4px 6px",
                        }}
                      >
                        {h.date}
                      </td>
                      <td
                        style={{
                          border: "1px solid #eee",
                          padding: "4px 6px",
                        }}
                      >
                        {h.restaurant}
                      </td>
                      <td
                        style={{
                          border: "1px solid #eee",
                          padding: "4px 6px",
                        }}
                      >
                        {h.food}
                      </td>
                      <td
                        style={{
                          border: "1px solid #eee",
                          padding: "4px 6px",
                        }}
                      >
                        {h.total}
                      </td>
                      <td
                        style={{
                          border: "1px solid #eee",
                          padding: "4px 6px",
                        }}
                      >
                        {h.table}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}

      {/* FAVOURITES PANEL */}
      {showFavouritesPanel && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 70,
          }}
        >
          <div
            style={{
              width: "90%",
              maxWidth: 600,
              maxHeight: "80vh",
              backgroundColor: "#ffffff",
              borderRadius: 18,
              padding: "16px 18px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.6)",
              overflowY: "auto",
              fontSize: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <div>
                <div
                  style={{
                    fontWeight: "bold",
                    fontSize: 16,
                  }}
                >
                  ⭐ Favourites
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: "#666",
                  }}
                >
                  All dishes you&apos;ve added as favourite with ratings.
                </div>
              </div>
              <button
                onClick={() => setShowFavouritesPanel(false)}
                style={{
                  borderRadius: 999,
                  border: "none",
                  padding: "4px 10px",
                  backgroundColor: "#f44336",
                  color: "#fff",
                  cursor: "pointer",
                  fontSize: 12,
                }}
              >
                ✕ Close
              </button>
            </div>

            {favorites.length === 0 ? (
              <div style={{ fontSize: 12, color: "#777", marginTop: 6 }}>
                No favourites yet. Mark dishes as favourite from the booking
                page.
              </div>
            ) : (
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: 11,
                }}
              >
                <thead>
                  <tr style={{ backgroundColor: "#f5f5f5" }}>
                    <th
                      style={{
                        border: "1px solid #ddd",
                        padding: "4px 6px",
                        textAlign: "left",
                      }}
                    >
                      Restaurant
                    </th>
                    <th
                      style={{
                        border: "1px solid #ddd",
                        padding: "4px 6px",
                        textAlign: "left",
                      }}
                    >
                      Dish
                    </th>
                    <th
                      style={{
                        border: "1px solid #ddd",
                        padding: "4px 6px",
                        textAlign: "left",
                      }}
                    >
                      Rating
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {favorites.map((f) => (
                    <tr key={f.id}>
                      <td
                        style={{
                          border: "1px solid #eee",
                          padding: "4px 6px",
                        }}
                      >
                        {f.restaurantName}
                      </td>
                      <td
                        style={{
                          border: "1px solid #eee",
                          padding: "4px 6px",
                        }}
                      >
                        {f.dishName}
                      </td>
                      <td
                        style={{
                          border: "1px solid #eee",
                          padding: "4px 6px",
                        }}
                      >
                        {f.rating}★
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingPage;
