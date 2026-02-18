// src/components/LoginPage.jsx
import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { addRestaurant, setUserAuth, setRestaurantAuth } from "../store";
import v0 from "../assets/v0.mp4";
import { API_BASE_URL } from "../config"; // ⭐ NEW: backend base URL

const InputField = ({ label, helper, value, onChange, type = "text" }) => (
  <div style={{ width: "100%", marginBottom: 8 }}>
    <div style={{ fontSize: 12, marginBottom: 2 }}>{label}</div>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      style={{
        width: "100%",
        padding: "6px 8px",
        boxSizing: "border-box",
        borderRadius: 6,
        border: "1px solid #ccc",
        fontSize: 13,
      }}
    />
    <div style={{ fontSize: 10, opacity: 0.7 }}>{helper}</div>
  </div>
);

const LoginPage = ({ onBack, onLoginSuccess, onRestaurantLoginSuccess }) => {
  const dispatch = useDispatch();
  const restaurants = useSelector((state) => state.restaurants.list);
  const auth = useSelector((state) => state.auth);
  const isUserLoggedIn = !!auth.user;

  // which section is visible inside login page
  const [view, setView] = useState("hub"); // hub | account | userLogin | restLogin

  // account form fields
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [restaurantId, setRestaurantId] = useState("");
  const [accountPassword, setAccountPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [restaurantName, setRestaurantName] = useState("");
  const [restaurantArea, setRestaurantArea] = useState("");
  const [restaurantCity, setRestaurantCity] = useState("");
  const [restaurantState, setRestaurantState] = useState("");
  const [isRestaurantMode, setIsRestaurantMode] = useState(false);
  const cardRef = useRef(null);

  // user login
  const [userLoginName, setUserLoginName] = useState("");
  const [userLoginPassword, setUserLoginPassword] = useState("");
  const [showUserPassword, setShowUserPassword] = useState(false);

  // restaurant login
  const [restLoginName, setRestLoginName] = useState("");
  const [restLoginPassword, setRestLoginPassword] = useState("");
  const [restLoginId, setRestLoginId] = useState("");
  const [showRestPassword, setShowRestPassword] = useState(false);

  const [search, setSearch] = useState("");

  const filteredRestaurants = restaurants.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.name.toLowerCase().includes(q) ||
      r.city.toLowerCase().includes(q) ||
      (r.area && r.area.toLowerCase().includes(q)) ||
      (r.state && r.state.toLowerCase().includes(q))
    );
  });
  // ⭐ Same restaurant (name + city) shown only once
  const uniqueRestaurants = filteredRestaurants.filter((r, index, arr) => {
    return (
      index ===
      arr.findIndex(
        (other) =>
          other.name.toLowerCase() === r.name.toLowerCase() &&
          (other.city || "").toLowerCase() === (r.city || "").toLowerCase()
      )
    );
  });

  const handleRestaurantIdFocus = () => {
    setIsRestaurantMode(true);
    setTimeout(() => {
      if (cardRef.current) {
        cardRef.current.scrollTo({
          top: cardRef.current.scrollHeight,
          behavior: "smooth",
        });
      }
    }, 50);
  };

  // ---------- CREATE ACCOUNT ----------
  // ⭐ USER ACCOUNT (no restaurantId) -> use backend register API
  const createAccount = async () => {
    try {
      if (confirmPassword && accountPassword !== confirmPassword) {
        window.alert("Password and Confirm Password do not match.");
        return;
      }
      if (!accountPassword) {
        window.alert("Password is required.");
        return;
      }
      if (accountPassword.length < 6) {
        window.alert("Password must be at least 6 characters long.");
        return;
      }

      // USER ACCOUNT (no restaurantId) -> backend
      if (!restaurantId) {
        if (!email && !firstName) {
          window.alert(
            "Please provide at least name or email for user account."
          );
          return;
        }
        // Backend call: /api/auth/register
        const body = {
          name: firstName || email,
          email: email || "",
          phone: phone || "",
          password: accountPassword,
          role: "USER",
        };

        const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });
        const data = await res.json().catch(() => null);

        if (!res.ok) {
          window.alert(
            (data && data.message) ||
              "Failed to create account. Please try again."
          );
          return;
        }

        window.alert("User account created successfully! Please login.");
        // reset fields
        setFirstName("");
        setLastName("");
        setEmail("");
        setPhone("");
        setAccountPassword("");
        setConfirmPassword("");
        setView("userLogin");
        return;
      }

      // RESTAURANT ACCOUNT (stored locally)
      if (!restaurantName || !restaurantCity) {
        window.alert("Please fill Restaurant Name and City.");
        return;
      }
      const restaurantAccounts = JSON.parse(
        localStorage.getItem("restaurantAccounts") || "[]"
      );
      const idExists = restaurantAccounts.some((r) => r.id === restaurantId);
      if (idExists) {
        window.alert(
          "This Restaurant Id is already registered. Use a different Id."
        );
        return;
      }

      const newRestaurantAccount = {
        id: restaurantId,
        name: restaurantName,
        area: restaurantArea,
        city: restaurantCity,
        state: restaurantState,
        email: email,
        password: accountPassword,
      };
      restaurantAccounts.push(newRestaurantAccount);
      localStorage.setItem(
        "restaurantAccounts",
        JSON.stringify(restaurantAccounts)
      );

      dispatch(
        addRestaurant({
          id: newRestaurantAccount.id,
          name: newRestaurantAccount.name,
          area: newRestaurantAccount.area || "Not set",
          city: newRestaurantAccount.city || "Not set",
          state: newRestaurantAccount.state || "",
          cuisines: ["New Partner"],
        })
      );

      window.alert("Restaurant account created successfully! Please login.");
      // reset fields
      setFirstName("");
      setLastName("");
      setEmail("");
      setPhone("");
      setRestaurantId("");
      setRestaurantName("");
      setRestaurantArea("");
      setRestaurantCity("");
      setRestaurantState("");
      setAccountPassword("");
      setConfirmPassword("");
      setView("restLogin");
    } catch (err) {
      console.error("Error while creating account:", err);
      window.alert("Server error while creating account. Please try again.");
    }
  };

  // ---------- USER LOGIN ----------
  // ⭐ UPDATED: use backend /api/auth/login
  const handleNormalLogin = async () => {
    if (!userLoginName || !userLoginPassword) {
      alert("Please enter both email and password.");
      return;
    }
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: userLoginName,
          password: userLoginPassword,
        }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        alert((data && data.message) || "Wrong email or password");
        return;
      }
      // data = User object from backend
      dispatch(
        setUserAuth({
          id: data.id,
          name: data.name,
          username: data.name || userLoginName,
          firstName: data.name || "",
          lastName: "",
          email: data.email || userLoginName,
          phone: data.phone || "",
          role: data.role || "USER",
          loggedInAt: new Date().toISOString(),
        })
      );
      alert("Login successful!");
      onLoginSuccess();
    } catch (err) {
      console.error("Error during login:", err);
      alert("Server error while logging in. Please try again.");
    }
  };

  // ---------- RESTAURANT LOGIN (localStorage) ----------
  const handleRestLogin = () => {
    if (!restLoginName || !restLoginPassword || !restLoginId) {
      alert("Please fill all restaurant login fields.");
      return;
    }
    const restaurantAccounts = JSON.parse(
      localStorage.getItem("restaurantAccounts") || "[]"
    );
    const foundRest = restaurantAccounts.find(
      (r) =>
        r.id === restLoginId &&
        r.password === restLoginPassword &&
        (r.name === restLoginName || r.email === restLoginName)
    );
    if (!foundRest) {
      alert("Wrong restaurant ID, name/email, or password");
      return;
    }
    dispatch(
      setRestaurantAuth({
        name: foundRest.name,
        id: foundRest.id,
        loggedInAt: new Date().toISOString(),
      })
    );
    alert("Restaurant login successful!");
    
    if (onRestaurantLoginSuccess) {
      onRestaurantLoginSuccess(foundRest);
    }

  };

  // ---------- Main Render ----------
  const BackArrow = ({ onClick }) => (
    <button
      onClick={onClick}
      style={{
        position: "absolute",
        left: "0%",
        top: "0%",
        borderRadius: "999px",
        border: "none",
        padding: "4px 10px",
        backgroundColor: "rgba(0,0,0,0.6)",
        color: "#fff",
        fontSize: 12,
        cursor: "pointer",
        zIndex: 5,
      }}
    >
      ← Back
    </button>
  );

  // HUB VIEW
  if (view === "hub") {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          backdropFilter: "blur(3px)",
        }}
      >
        <BackArrow onClick={onBack} />

        {/* Logo + tagline */}
        <img
          src="/src/assets/eat.png"
          alt="eat"
          style={{
            position: "absolute",
            left: "3%",
            top: "3%",
            width: 55,
            height: 55,
          }}
        />
        <div
          style={{
            position: "absolute",
            left: "3%",
            top: "12%",
            color: "#fff",
            fontWeight: "bold",
            fontSize: 22,
          }}
        >
          DiGiDine
        </div>
        <div
          style={{
            position: "absolute",
            left: "3%",
            top: "17%",
            color: "#f5f5f5",
            fontSize: 12,
            maxWidth: 260,
          }}
        >
          Smart Digital Dining for Smart People
        </div>

        <div
          style={{
            position: "absolute",
            left: "3%",
            top: "27%",
            color: "#FFECB3",
            fontSize: 12,
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          <span>🍽 {uniqueRestaurants.length}+ restaurants</span>
          <span>⏱ Fast ordering</span>
          <span>⭐ Trusted partners</span>
        </div>

        {/* Bottom-left video */}
        <div
          style={{
            position: "absolute",
            left: "3%",
            bottom: "6%",
            width: 260,
            zIndex: 3,
          }}
        >
          <div
            style={{
              position: "relative",
              width: "100%",
              borderRadius: 16,
              overflow: "hidden",
              boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
            }}
          >
            <video
              src={v0}
              autoPlay
              loop
              muted
              playsInline
              style={{
                width: "100%",
                height: "100%",
                display: "block",
                objectFit: "cover",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: 8,
                bottom: 8,
                padding: "4px 10px",
                borderRadius: 999,
                background: "rgba(0,0,0,0.75)",
                color: "#fff",
                fontSize: 11,
                fontWeight: "bold",
                textTransform: "uppercase",
                letterSpacing: 0.5,
                pointerEvents: "none",
              }}
            >
              updating latest offers go fast
            </div>
          </div>
        </div>

        {/* User / Restaurant cards */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "55%",
            transform: "translate(-50%, -50%)",
            display: "flex",
            gap: 20,
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 230,
              padding: "18px 20px",
              borderRadius: 20,
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(245,245,245,0.95))",
              textAlign: "center",
              boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
              border: "1px solid rgba(255,255,255,0.6)",
            }}
          >
            <div style={{ fontWeight: "bold", marginBottom: 10 }}>
              {isUserLoggedIn ? "User Dashboard" : "User Login"}
            </div>
            <p style={{ fontSize: 12, marginBottom: 16, color: "#555" }}>
              {isUserLoggedIn
                ? "Continue to your dashboard to explore restaurants & history."
                : "Track orders, save favourites, and reorder in seconds."}
            </p>
            <button
              style={{
                padding: "8px 16px",
                borderRadius: 999,
                border: "none",
                backgroundColor: "#2196f3",
                color: "#fff",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: 13,
              }}
              onClick={() =>
                isUserLoggedIn ? onLoginSuccess() : setView("userLogin")
              }
            >
              {isUserLoggedIn ? "GO TO DASHBOARD" : "CONTINUE AS USER"}
            </button>
          </div>

          <div
            style={{
              width: 230,
              padding: "18px 20px",
              borderRadius: 20,
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.9), rgba(250,250,250,0.98))",
              textAlign: "center",
              boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
              border: "1px solid rgba(255,255,255,0.6)",
            }}
          >
            <div style={{ fontWeight: "bold", marginBottom: 10 }}>
              Restaurant Login
            </div>
            <p style={{ fontSize: 12, marginBottom: 16, color: "#555" }}>
              Manage menus, orders, and view your daily performance.
            </p>
            <button
              style={{
                padding: "8px 16px",
                borderRadius: 999,
                border: "none",
                backgroundColor: "#ff9800",
                color: "#fff",
                cursor: "pointer",
                fontWeight: "bold",
                fontSize: 13,
              }}
              onClick={() => setView("restLogin")}
            >
              CONTINUE AS RESTAURANT
            </button>
          </div>
        </div>

        {/* Restaurant list */}
        <div
          style={{
            position: "absolute",
            right: "3%",
            bottom: "5%",
            width: "26%",
            maxHeight: "60%",
            backgroundColor: "rgba(255,255,255,0.97)",
            borderRadius: 16,
            padding: "12px 16px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            overflowY: "auto",
          }}
        >
          <div
            style={{
              fontWeight: "bold",
              marginBottom: 4,
              fontSize: 14,
              color: "#333",
            }}
          >
            Restaurants on DiGiDine ({uniqueRestaurants.length})
          </div>
          <div style={{ fontSize: 11, marginBottom: 8, color: "#555" }}>
            Our trusted partners already serving delicious meals on our
            platform.
          </div>

          <input
            type="text"
            placeholder="Search by name, area, city, state..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "6px 8px",
              fontSize: 12,
              marginBottom: 8,
              borderRadius: 6,
              border: "1px solid #ccc",
            }}
          />

          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {uniqueRestaurants.map((r) => (
              <li
                key={r.id}
                style={{
                  padding: "6px 8px",
                  marginBottom: 6,
                  borderRadius: 10,
                  backgroundColor: "rgba(245,245,245,0.95)",
                  fontSize: 12,
                  border: "1px solid #eee",
                }}
              >
                <div style={{ fontWeight: "bold" }}>{r.name}</div>
                <div style={{ fontSize: 11, color: "#555" }}>
                  {r.area ? `${r.area}, ` : ""}
                  {r.city}
                  {r.state ? `, ${r.state}` : ""}
                </div>
                {r.cuisines && (
                  <div
                    style={{ fontSize: 11, color: "#777", marginTop: 2 }}
                  >
                    {r.cuisines.join(" · ")}
                  </div>
                )}
              </li>
            ))}
            {uniqueRestaurants.length === 0 && (
              <li style={{ fontSize: 12, color: "#777", marginTop: 6 }}>
                No restaurants match your search.
              </li>
            )}
          </ul>
        </div>

        {/* Create account */}
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: "8%",
            transform: "translate(-50%, -50%)",
            color: "black",
            fontWeight: "bold",
            textAlign: "center",
            backgroundColor: "rgba(255,255,255,0.9)",
            padding: "6px 16px",
            borderRadius: 20,
          }}
        >
          Don&apos;t have an account?{" "}
          <button
            style={{
              marginLeft: 8,
              borderRadius: 999,
              padding: "4px 10px",
              border: "1px solid #000",
              backgroundColor: "#fff",
              cursor: "pointer",
              fontSize: 12,
            }}
            onClick={() => setView("account")}
          >
            Create new account
          </button>
        </div>
      </div>
    );
  }

  // ACCOUNT CREATION VIEW
  if (view === "account") {
    return (
      <div style={{ width: "100%", height: "100%", position: "relative" }}>
        <BackArrow onClick={() => setView("hub")} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
          }}
        />
        <img
          src="/src/assets/eat.png"
          alt="eat"
          style={{
            position: "absolute",
            left: "1%",
            top: "3%",
            width: 55,
            height: 55,
          }}
        />

        <div
          ref={cardRef}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            transform: "translate(-50%, -50%)",
            width: "90%",
            maxWidth: 360,
            maxHeight: "80vh",
            overflowY: "auto",
            backgroundColor: "rgba(255,255,255,0.97)",
            borderRadius: 20,
            padding: "18px 20px 20px 20px",
            boxShadow: "0 6px 16px rgba(0,0,0,0.35)",
          }}
        >
          <div
            style={{
              textAlign: "center",
              fontWeight: "bold",
              marginBottom: 4,
              fontSize: 18,
            }}
          >
            Create new account
          </div>
          <div
            style={{
              textAlign: "center",
              fontSize: 11,
              marginBottom: 14,
              color: "#555",
            }}
          >
            For customers, leave Restaurant Id empty. For restaurant owners,
            fill all restaurant details.
          </div>

          <InputField
            label="First Name"
            helper="Must be in Capital Letter"
            value={firstName}
            onChange={setFirstName}
          />
          <InputField
            label="Last Name"
            helper="Must be in Capital Letter"
            value={lastName}
            onChange={setLastName}
          />
          <InputField
            label="Email Address"
            helper="Must be in small Letter"
            value={email}
            onChange={setEmail}
          />
          <InputField
            label="Phone Number"
            helper="Must be numeric"
            value={phone}
            onChange={setPhone}
          />

          {/* Restaurant Id */}
          <div style={{ width: "100%", marginBottom: 8 }}>
            <div style={{ fontSize: 12, marginBottom: 2 }}>
              Restaurant Id (optional for owners)
            </div>
            <input
              type="text"
              value={restaurantId}
              onChange={(e) => setRestaurantId(e.target.value)}
              onFocus={handleRestaurantIdFocus}
              placeholder="Click here if you are a restaurant partner"
              style={{
                width: "100%",
                padding: "6px 8px",
                boxSizing: "border-box",
                borderRadius: 6,
                border: "1px solid #ccc",
                fontSize: 13,
              }}
            />
            <div style={{ fontSize: 10, opacity: 0.7 }}>
              If you are a restaurant, enter your unique ID (e.g. DIGI-R001).
            </div>
          </div>

          {(isRestaurantMode || restaurantId) && (
            <>
              <InputField
                label="Restaurant Name"
                helper="Name shown to users on DiGiDine"
                value={restaurantName}
                onChange={setRestaurantName}
              />
              <InputField
                label="Area / Place"
                helper="e.g. Gomti Nagar, Koramangala"
                value={restaurantArea}
                onChange={setRestaurantArea}
              />
              <InputField
                label="City"
                helper="e.g. Lucknow, Mumbai"
                value={restaurantCity}
                onChange={setRestaurantCity}
              />
              <InputField
                label="State"
                helper="e.g. Uttar Pradesh, Karnataka"
                value={restaurantState}
                onChange={setRestaurantState}
              />
            </>
          )}

          <InputField
            label="Generate password"
            helper="Must be unique with at least one special character"
            value={accountPassword}
            onChange={setAccountPassword}
            type="password"
          />
          <InputField
            label="Confirm password"
            helper="Must match the above password"
            value={confirmPassword}
            onChange={setConfirmPassword}
            type="password"
          />

          <button
            style={{
              marginTop: 10,
              width: "100%",
              padding: "8px 16px",
              borderRadius: 999,
              border: "none",
              backgroundColor: "#2196f3",
              color: "#fff",
              cursor: "pointer",
              fontWeight: "bold",
            }}
            onClick={createAccount}
          >
            CREATE ACCOUNT
          </button>
        </div>
      </div>
    );
  }

  // USER LOGIN VIEW
  if (view === "userLogin") {
    return (
      <div style={{ width: "100%", height: "100%", position: "relative" }}>
        <BackArrow onClick={() => setView("hub")} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.3)",
          }}
        />

        <img
          src="/src/assets/eat.png"
          alt="eat"
          style={{
            position: "absolute",
            left: "50%",
            top: "18%",
            transform: "translate(-50%, -50%)",
            width: 140,
            height: 140,
            filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.6))",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "60%",
            transform: "translate(-50%, -50%)",
            width: 320,
            backgroundColor: "rgba(255,255,255,0.97)",
            borderRadius: 20,
            padding: "18px 20px",
            boxShadow: "0 6px 18px rgba(0,0,0,0.45)",
          }}
        >
          <div
            style={{
              fontWeight: "bold",
              fontSize: 18,
              marginBottom: 4,
              textAlign: "center",
            }}
          >
            User Login
          </div>
          <div
            style={{
              fontSize: 11,
              marginBottom: 16,
              textAlign: "center",
              color: "#666",
            }}
          >
            Welcome back! Login to continue ordering with DiGiDine.
          </div>

          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 12, marginBottom: 2 }}>Email</div>
            <input
              type="text"
              placeholder="Enter your email"
              value={userLoginName}
              onChange={(e) => setUserLoginName(e.target.value)}
              style={{
                width: "100%",
                padding: "6px 8px",
                fontSize: 13,
                borderRadius: 6,
                border: "1px solid #ccc",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: 6 }}>
            <div style={{ fontSize: 12, marginBottom: 2 }}>Password</div>
            <input
              type={showUserPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={userLoginPassword}
              onChange={(e) => setUserLoginPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "6px 8px",
                fontSize: 13,
                borderRadius: 6,
                border: "1px solid #ccc",
                boxSizing: "border-box",
              }}
            />
            <div style={{ fontSize: 10, marginTop: 2, color: "#777" }}>
              Use at least 1 special character
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginTop: 6,
              marginBottom: 12,
            }}
          >
            <label
              style={{ fontSize: 11, display: "flex", alignItems: "center" }}
            >
              <input
                type="checkbox"
                style={{ marginRight: 4 }}
                checked={showUserPassword}
                onChange={() => setShowUserPassword((prev) => !prev)}
              />
              Show password
            </label>

            <button
              onClick={() => alert("Forgot password clicked (demo)")}
              style={{
                border: "none",
                background: "transparent",
                fontSize: 11,
                color: "#1976d2",
                cursor: "pointer",
                textDecoration: "underline",
              }}
            >
              Forgot password?
            </button>
          </div>

          <button
            style={{
              width: "100%",
              padding: "8px 0",
              borderRadius: 999,
              border: "none",
              backgroundColor: "#2196f3",
              color: "#fff",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: 14,
              marginBottom: 10,
            }}
            onClick={handleNormalLogin}
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  // RESTAURANT LOGIN VIEW
  if (view === "restLogin") {
    return (
      <div style={{ width: "100%", height: "100%", position: "relative" }}>
        <BackArrow onClick={() => setView("hub")} />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(0,0,0,0.3)",
          }}
        />

        <img
          src="/src/assets/eat.png"
          alt="eat"
          style={{
            position: "absolute",
            left: "50%",
            top: "18%",
            transform: "translate(-50%, -50%)",
            width: 140,
            height: 140,
            filter: "drop-shadow(0 4px 12px rgba(0,0,0,0.6))",
          }}
        />

        <div
          style={{
            position: "absolute",
            left: "50%",
            top: "60%",
            transform: "translate(-50%, -50%)",
            width: 330,
            backgroundColor: "rgba(255,255,255,0.97)",
            borderRadius: 20,
            padding: "18px 20px",
            boxShadow: "0 6px 18px rgba(0,0,0,0.45)",
          }}
        >
          <div
            style={{
              fontWeight: "bold",
              fontSize: 18,
              marginBottom: 4,
              textAlign: "center",
            }}
          >
            Restaurant Login
          </div>
          <div
            style={{
              fontSize: 11,
              marginBottom: 14,
              textAlign: "center",
              color: "#666",
            }}
          >
            For restaurant owners to manage orders, menu and performance.
          </div>

          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 12, marginBottom: 2 }}>
              Restaurant Name or Email
            </div>
            <input
              type="text"
              value={restLoginName}
              onChange={(e) => setRestLoginName(e.target.value)}
              style={{
                width: "100%",
                padding: "6px 8px",
                borderRadius: 6,
                border: "1px solid #ccc",
                fontSize: 13,
              }}
            />
          </div>

          <div style={{ marginBottom: 8 }}>
            <div style={{ fontSize: 12, marginBottom: 2 }}>Password</div>
            <input
              type={showRestPassword ? "text" : "password"}
              value={restLoginPassword}
              onChange={(e) => setRestLoginPassword(e.target.value)}
              style={{
                width: "100%",
                padding: "6px 8px",
                borderRadius: 6,
                border: "1px solid #ccc",
                fontSize: 13,
              }}
            />
          </div>

          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 12, marginBottom: 2 }}>Restaurant Id</div>
            <input
              type="text"
              value={restLoginId}
              onChange={(e) => setRestLoginId(e.target.value)}
              style={{
                width: "100%",
                padding: "6px 8px",
                borderRadius: 6,
                border: "1px solid #ccc",
                fontSize: 13,
              }}
            />
          </div>

          <label
            style={{
              fontSize: 11,
              display: "flex",
              alignItems: "center",
              marginBottom: 10,
            }}
          >
            <input
              type="checkbox"
              style={{ marginRight: 4 }}
              checked={showRestPassword}
              onChange={() => setShowRestPassword((prev) => !prev)}
            />
            Show password
          </label>

          <button
            style={{
              width: "100%",
              padding: "8px 0",
              borderRadius: 999,
              border: "none",
              backgroundColor: "#ff9800",
              color: "#fff",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: 14,
            }}
            onClick={handleRestLogin}
          >
            Login
          </button>
        </div>
      </div>
    );
  }

  return null;
};

export default LoginPage;
