// src/App.jsx
import React, { useRef, useState, useEffect } from "react";
import "./index.css";
import { useSelector } from "react-redux";

import StartScreen from "./components/StartScreen";
import LoginPage from "./components/LoginPage";
import UserDashboard from "./components/UserDashboard";
import BookingPage from "./components/BookingPage";
import RestaurantControlPanel from "./components/RestaurantControlPanel";
import bgMusic from "./assets/bg-music.mp3";

const App = () => {
  // Redux se data
  const restaurants = useSelector((state) => state.restaurants.list);
  const auth = useSelector((state) => state.auth);

  // agar already logged in user hai to initial screen = dashboard
  const [currentScreen, setCurrentScreen] = useState(() =>
    auth && auth.user ? "dashboard" : "start"
  );

  // audio
  const audioRef = useRef(null);
  const [musicPlaying, setMusicPlaying] = useState(false);
  const [musicMessage, setMusicMessage] = useState("");

  const toggleMusic = () => {
    // if user not logged in
    if (!auth.user) {
      setMusicMessage("🔒 Please login first to play music");
      setTimeout(() => setMusicMessage(""), 3000);
      return;
    }

    if (!audioRef.current) return;

    if (musicPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }

    setMusicPlaying(!musicPlaying);
  };

  const [selectedRestaurantId, setSelectedRestaurantId] = useState(null);
  const [activeRestaurantAccount, setActiveRestaurantAccount] = useState(null);

  // history & favourites shared between Dashboard and Booking page
  const [history, setHistory] = useState([]);
  const [favorites, setFavorites] = useState([]);

  const selectedRestaurant = restaurants.find(
    (r) => r.id === selectedRestaurantId
  );

  const handleOpenBooking = (restaurantId) => {
    setSelectedRestaurantId(restaurantId);
    setCurrentScreen("booking");
  };

  const handleCloseBooking = () => {
    setSelectedRestaurantId(null);
    setCurrentScreen("dashboard");
  };

  // Restaurant side se Back / Logout dono isi ko call karenge
  const handleBackToLogin = () => {
    setActiveRestaurantAccount(null);
    setCurrentScreen("login");
  };

  // stop music automatically when user logs out
  useEffect(() => {
    if (!auth.user && audioRef.current) {
      audioRef.current.pause();
      setMusicPlaying(false);
    }
  }, [auth.user]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        margin: 0,
        overflow: "hidden",
        fontFamily: "sans-serif",
      }}
    >
      {/* Global video background */}
      <video
        src="/src/assets/bgv.mp4"
        autoPlay
        loop
        muted
        playsInline
        style={{
          position: "absolute",
          width: "100vw",
          height: "100vh",
          top: 0,
          left: 0,
          objectFit: "cover",
          zIndex: -1,
        }}
      />

      {currentScreen === "start" && (
        <StartScreen onEnter={() => setCurrentScreen("login")} />
      )}

      {currentScreen === "login" && (
        <LoginPage
          onBack={() => setCurrentScreen("start")}
          onLoginSuccess={() => setCurrentScreen("dashboard")}
          onRestaurantLoginSuccess={(restaurantAccount) => {
            setActiveRestaurantAccount(restaurantAccount);
            setCurrentScreen("restaurant");
          }}
        />
      )}

      {currentScreen === "dashboard" && (
        <UserDashboard
          onBack={() => setCurrentScreen("login")}
          onOpenBooking={handleOpenBooking}
          history={history}
          setHistory={setHistory}
          favorites={favorites}
          setFavorites={setFavorites}
        />
      )}

      {currentScreen === "restaurant" && (
        <RestaurantControlPanel
          restaurant={activeRestaurantAccount}
          onBackToLogin={handleBackToLogin}
        />
      )}

      {currentScreen === "booking" && selectedRestaurant && (
        <BookingPage
          restaurant={selectedRestaurant}
          history={history}
          setHistory={setHistory}
          favorites={favorites}
          setFavorites={setFavorites}
          onBack={handleCloseBooking}
        />
      )}

      {/* Login warning message */}
      {musicMessage && (
        <div
          style={{
            position: "fixed",
            bottom: 70,
            right: 20,
            background: "#222",
            color: "#fff",
            padding: "8px 14px",
            borderRadius: 20,
            fontSize: 13,
            zIndex: 9999,
            boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
          }}
        >
          {musicMessage}
        </div>
      )}

      {/* Global background music */}
      <audio ref={audioRef} src={bgMusic} loop />

      <button
        onClick={toggleMusic}
        style={{
          position: "fixed",
          bottom: 2,
          right: 20,
          padding: "10px 16px",
          borderRadius: 999,
          border: "none",
          backgroundColor: musicPlaying ? "#f44336" : "#43a047",
          color: "#fff",
          fontSize: 10,
          fontWeight: "bold",
          cursor: "pointer",
          zIndex: 9999,
          boxShadow: "0 6px 18px rgba(0,0,0,0.4)",
        }}
      >
        {musicPlaying ? "🔇 Stop Music" : "🔊 Play Music"}
      </button>
    </div>
  );
};

export default App;
