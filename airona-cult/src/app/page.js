import Link from "next/link";
import { fetchFanart, fetchScreenshots, fetchPosts } from "@/lib/fetchContent";
import ContentCarousel from "@/components/ContentCarousel";

export default async function HomePage() {
  const [fanart, screenshots, posts] = await Promise.all([
    fetchFanart(0,12),
    fetchScreenshots(0,12),
    fetchPosts(0,12),
  ]);

  return (
    <main style={{ padding: "2rem" }}>
      {/* --- Keep your existing top hero/intro section --- */}
      <section style={{ marginBottom: "3rem" }}>
        <h1>Welcome to Airona Cult</h1>
        <p>A community hub for everyone who loves and adores Airona ✨</p>
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

      {/* --- Posts Section --- */}
      <section style={{ marginBottom: "3rem" }}>
        <ContentCarousel title="Latest Posts" items={posts} type="posts" />
        <div style={{ textAlign: "right", marginTop: "0.5rem" }}>
          <Link href="/gallery/posts">View More →</Link>
        </div>
      </section>
    </main>
  );
}
