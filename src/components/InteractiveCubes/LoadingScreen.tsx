"use client";
import React, { useEffect, useState } from "react";
import { subscribeToLoading } from "./loadingState";

const LoadingScreen: React.FC = () => {
  const [fadeOut, setFadeOut] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const unsub = subscribeToLoading((_p, done) => {
      if (!done) return;
      setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => setHidden(true), 900);
      }, 350);
    });
    return unsub;
  }, []);

  if (hidden) return null;

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#000",
        transition: "opacity 0.9s cubic-bezier(0.4,0,0.2,1)",
        opacity: fadeOut ? 0 : 1,
        pointerEvents: fadeOut ? "none" : "all",
      }}
    >
      <span style={{ color: "#fff", fontSize: "1rem", letterSpacing: "0.15em" }}>
        Loading
      </span>
    </div>
  );
};

export default LoadingScreen;
