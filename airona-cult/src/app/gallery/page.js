import { fetchFanart, fetchScreenshots, fetchSesbian } from "@/lib/fetchContent";
import GalleryClient from "./GalleryClient";

export default async function GalleryPage() {
  // Fetch initial content from all categories
  const [fanart, screenshots, sesbian] = await Promise.all([
    fetchFanart(0, 12),
    fetchScreenshots(0, 12),
    fetchSesbian(0, 12),
  ]);

  return (
    <GalleryClient 
      initialFanart={fanart}
      initialScreenshots={screenshots}
      initialSesbian={sesbian}
    />
  );
}
