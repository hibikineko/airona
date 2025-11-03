"use client";

import Link from "next/link";

export default function HalloweenBanner() {
  return (
    <section 
      style={{ 
        marginBottom: "3rem",
        background: "linear-gradient(135deg, #1a1a1a 0%, #ff6b00 50%, #1a1a1a 100%)",
        borderRadius: "15px",
        position: "relative",
        overflow: "hidden",
        minHeight: "400px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        border: "3px solid #ff6b00",
        boxShadow: "0 8px 30px rgba(255, 107, 0, 0.4)"
      }}
    >
      <div 
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "radial-gradient(circle, rgba(255,107,0,0.1) 0%, rgba(0,0,0,0.8) 100%)"
        }}
      />
      
      {/* Main Content */}
      <div 
        style={{
          position: "relative",
          zIndex: 2,
          textAlign: "center",
          color: "white",
          padding: "3rem 2rem"
        }}
      >
        <div style={{ fontSize: "5rem", marginBottom: "1rem" }}>
          🎃👻🎃
        </div>
        <h2 style={{ 
          fontSize: "3rem", 
          fontWeight: "bold", 
          marginBottom: "1rem",
          textShadow: "0 0 20px rgba(255, 107, 0, 0.8)"
        }}>
          Halloween Voting is LIVE!
        </h2>
        <p style={{ 
          fontSize: "1.3rem", 
          marginBottom: "2rem",
          maxWidth: "600px",
          margin: "0 auto 2rem auto"
        }}>
          Vote for your favorite Halloween submissions and help us crown the winner! 🏆
        </p>
        
        <Link 
          href="/halloween/vote"
          style={{
            display: "inline-block",
            padding: "15px 40px",
            backgroundColor: "#ff6b00",
            color: "white",
            textDecoration: "none",
            borderRadius: "30px",
            fontWeight: "bold",
            fontSize: "1.3rem",
            boxShadow: "0 6px 20px rgba(255, 107, 0, 0.5)",
            transition: "transform 0.3s ease, box-shadow 0.3s ease",
            border: "2px solid white"
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "scale(1.1)";
            e.currentTarget.style.boxShadow = "0 8px 30px rgba(255, 107, 0, 0.8)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "scale(1)";
            e.currentTarget.style.boxShadow = "0 6px 20px rgba(255, 107, 0, 0.5)";
          }}
        >
          🎃 Vote Now! 🎃
        </Link>
      </div>
    </section>
  );
}
