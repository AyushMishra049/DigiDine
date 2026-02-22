import React from "react";
import Lottie from "lottie-react";
import loaderAnimation from "../assets/loader.json";

const GlobalLoader = () => {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(6px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 99999,
      }}
    >
      <Lottie
        animationData={loaderAnimation}
        loop={true}
        style={{ width: 200 }}
      />
    </div>
  );
};

export default GlobalLoader;