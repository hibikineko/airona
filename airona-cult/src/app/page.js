import Link from "next/link";
import { fetchFanart, fetchScreenshots, fetchSesbian } from "@/lib/fetchContentSecure";
import ContentCarousel from "@/components/ContentCarousel";
export default async function HomePage() {
  const [fanart, screenshots, sesbian] = await Promise.all([
    fetchFanart(0,12),
    fetchScreenshots(0,12),
    fetchSesbian(0,12),
  ]);

  return (
    <>
      <main style={{ padding: "2rem" }}>
      {/* --- POP♡RONA Hero Section --- */}
      <section 
        style={{ 
          marginBottom: "3rem",
          backgroundImage: "url('/airona/popronagang.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: "15px",
          position: "relative",
          overflow: "hidden",
          minHeight: "600px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "space-between"
        }}
      >
        <div 
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.2)",
            backdropFilter: "blur(1px)"
          }}
        />
        
        {/* Top Section */}
        <div 
          style={{
            position: "relative",
            zIndex: 2,
            textAlign: "center",
            color: "white",
            padding: "2rem",
            marginTop: "auto"
          }}
        >
        </div>

        {/* Bottom Section with Button */}
        <div 
          style={{
            position: "relative",
            zIndex: 2,
            textAlign: "center",
            padding: "2rem",
            marginBottom: "5rem"
          }}
        >
          <Link 
            href="/poprona"
            style={{
              display: "inline-block",
              padding: "12px 30px",
              backgroundColor: "#ff6b9d",
              color: "white",
              textDecoration: "none",
              borderRadius: "25px",
              fontWeight: "bold",
              fontSize: "1.1rem",
              boxShadow: "0 4px 15px rgba(255, 107, 157, 0.4)",
              transition: "all 0.3s ease",
              border: "2px solid transparent"
            }}
            className="poprona-button"
          >
            Enter POP♡RONA World ✨
          </Link>
        </div>
      </section>

      {/* --- Fanart Section --- */}
      <section style={{ marginBottom: "3rem" }}>
        <ContentCarousel title="Latest Fanart" items={fanart} type="fanart" />
        <div style={{ textAlign: "right", marginTop: "0.5rem" }}>
          <Link href="/gallery/fanart">View More →</Link>
        </div>
      </section>

      {/* --- Screenshot Section --- */}
      <section style={{ marginBottom: "3rem" }}>
        <ContentCarousel
          title="Latest Screenshots"
          items={screenshots}
          type="screenshot"
        />
        <div style={{ textAlign: "right", marginTop: "0.5rem" }}>
          <Link href="/gallery/screenshot">View More →</Link>
        </div>
      </section>

      {/* --- Sesbian Section --- */}
      <section style={{ marginBottom: "3rem" }}>
        <ContentCarousel
          title="Latest Sesbian"
          items={sesbian}
          type="sesbian"
        />
        <div style={{ textAlign: "right", marginTop: "0.5rem" }}>
          <Link href="/gallery/sesbian">View More →</Link>
        </div>
      </section>
    </main>
    </>
  );
}
