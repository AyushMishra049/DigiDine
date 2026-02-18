// src/components/StartScreen.jsx
import React, { useEffect, useState } from "react";

const StartScreen = ({ onEnter }) => {
  const [imageStyle, setImageStyle] = useState({
    position: "absolute",
    left: "0%",
    top: "0%",
    width: 100,
    height: 100,
    transition: "all 2.2s ease",
    opacity: 0,
  });

  useEffect(() => {
    setImageStyle((prev) => ({
      ...prev,
      left: "50%",
      top: "45%",
      transform: "translate(-50%, -50%) scale(1)",
      width: 120,
      height: 120,
      opacity: 1,
    }));
  }, []);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
      }}
    >
      {/* overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(circle at top, rgba(0,0,0,0.4), rgba(0,0,0,0.75))",
          zIndex: -0.5,
        }}
      />

      <img
        src="/src/assets/eat.png"
        alt="eat"
        style={{
          ...imageStyle,
          filter: "drop-shadow(0 0 18px rgba(255,255,255,0.6))",
        }}
      />

      {/* DiGiDine button */}
      <div
        className="glowText"
        onClick={onEnter}
        style={{
          position: "absolute",
          left: "50%",
          top: "67%",
          transform: "translate(-50%, -50%)",
          textAlign: "center",
          fontSize: 40,
          fontWeight: "bold",
          color: "#FFD54F",
          padding: "8px 20px",
          borderRadius: "999px",
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.18))",
          boxShadow: "0 0 22px rgba(255,213,79,0.45)",
          backdropFilter: "blur(6px)",
          letterSpacing: 2,
          cursor: "pointer",
        }}
      >
        DiGiDine
      </div>

      <div
        style={{
          position: "absolute",
          left: "50%",
          top: "77%",
          transform: "translate(-50%, -50%)",
          color: "#f5f5f5",
          fontSize: 13,
          opacity: 0.9,
        }}
      >
        Tap <strong>DiGiDine</strong> to begin your dining journey
      </div>
    </div>
  );
};

export default StartScreen;
