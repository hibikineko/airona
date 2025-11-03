import Link from "next/link";
import { fetchFanart, fetchScreenshots, fetchSesbian } from "@/lib/fetchContentSecure";
import ContentCarousel from "@/components/ContentCarousel";
import HalloweenBanner from "@/components/HalloweenBanner";

export default async function HomePage() {
  const [fanart, screenshots, sesbian] = await Promise.all([
    fetchFanart(0,12),
    fetchScreenshots(0,12),
    fetchSesbian(0,12),
  ]);

  return (
    <>
      <main style={{ padding: "2rem" }}>
      {/* --- Halloween Voting Hero Section --- */}
      <HalloweenBanner />

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
