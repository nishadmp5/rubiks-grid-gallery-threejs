"use client";
import React, { useEffect, useRef, useState } from "react";
import { subscribeToLoading } from "./loadingState";

const CUBE_COLORS = [
  "#6366f1", "#8b5cf6", "#a78bfa",
  "#ec4899", "#f43f5e", "#f97316",
  "#eab308", "#22c55e", "#06b6d4",
];

const LoadingScreen: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [fadeOut, setFadeOut] = useState(false);
  const [hidden, setHidden] = useState(false);
  const loadDoneRef = useRef(false);

  // Fake progress: eases toward 99, stalls there until real load finishes.
  useEffect(() => {
    const id = setInterval(() => {
      setProgress((prev) => {
        if (loadDoneRef.current) return 100;
        // Exponential ease: fast start, asymptotically approaches 99
        const next = prev + (99 - prev) * 0.045;
        return Math.min(next, 98.9); // never actually reach 99 on its own
      });
    }, 50);
    return () => clearInterval(id);
  }, []);

  // Real completion signal — jump to 100 % and fade out.
  useEffect(() => {
    const unsub = subscribeToLoading((_p, done) => {
      if (!done) return;
      loadDoneRef.current = true;
      setProgress(100);
      setTimeout(() => {
        setFadeOut(true);
        setTimeout(() => setHidden(true), 900);
      }, 350);
    });
    return unsub;
  }, []);

  if (hidden) return null;

  return (
    <>
      <style>{`
        @keyframes cubeWave {
          0%, 100% { opacity: 0.2; transform: scale(0.72); }
          50%       { opacity: 1;   transform: scale(1);    }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0);    }
        }
        @keyframes shimmerBar {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }
      `}</style>

      <div
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "36px",
          background: "radial-gradient(ellipse at 50% 40%, #12102a 0%, #07070f 100%)",
          transition: "opacity 0.9s cubic-bezier(0.4,0,0.2,1)",
          opacity: fadeOut ? 0 : 1,
          pointerEvents: fadeOut ? "none" : "all",
          animation: "fadeSlideUp 0.5s ease forwards",
        }}
      >
        {/* 3×3 animated cube mosaic */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "10px",
          }}
        >
          {CUBE_COLORS.map((color, i) => (
            <div
              key={i}
              style={{
                width: 38,
                height: 38,
                borderRadius: 7,
                backgroundColor: color,
                animation: `cubeWave 2s ${i * 0.18}s ease-in-out infinite`,
                boxShadow: `0 0 14px ${color}55`,
              }}
            />
          ))}
        </div>

        {/* Title block */}
        <div
          style={{
            textAlign: "center",
            color: "#fff",
            opacity: 0,
            animation: "fadeSlideUp 0.6s 0.2s ease forwards",
          }}
        >
          <p
            style={{
              fontSize: "0.6rem",
              fontWeight: 600,
              letterSpacing: "0.45em",
              color: "rgba(255,255,255,0.38)",
              marginBottom: 8,
              textTransform: "uppercase",
            }}
          >
            Loading
          </p>
          <p
            style={{
              fontSize: "1.15rem",
              fontWeight: 700,
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              background: "linear-gradient(90deg,#a78bfa,#ec4899,#06b6d4)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Cubic Gallery
          </p>
        </div>

        {/* Progress bar + counter */}
        <div
          style={{
            width: 220,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 12,
            opacity: 0,
            animation: "fadeSlideUp 0.6s 0.4s ease forwards",
          }}
        >
          {/* Track */}
          <div
            style={{
              width: "100%",
              height: 2,
              borderRadius: 2,
              background: "rgba(255,255,255,0.08)",
              overflow: "hidden",
            }}
          >
            {/* Fill */}
            <div
              style={{
                height: "100%",
                width: `${Math.floor(progress)}%`,
                borderRadius: 2,
                background: "linear-gradient(90deg,#6366f1,#ec4899,#06b6d4,#6366f1)",
                backgroundSize: "200% auto",
                animation: "shimmerBar 2s linear infinite",
                transition: "width 0.35s ease",
                boxShadow: "0 0 8px rgba(99,102,241,0.7)",
              }}
            />
          </div>

          {/* Percentage */}
          <span
            style={{
              fontSize: "0.68rem",
              fontWeight: 500,
              letterSpacing: "0.12em",
              color: "rgba(255,255,255,0.32)",
              fontVariantNumeric: "tabular-nums",
            }}
          >
            {String(Math.floor(progress)).padStart(3, "\u2007")}%
          </span>
        </div>
      </div>
    </>
  );
};

export default LoadingScreen;
