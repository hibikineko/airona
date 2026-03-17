import { fetchFanart, fetchScreenshots, fetchSesbian, fetchTwin } from "@/lib/fetchContent";
import GalleryClient from "./GalleryClient";

export default async function GalleryPage() {
  // Fetch initial content from all categories
  const [fanart, screenshots, sesbian, twin] = await Promise.all([
    fetchFanart(0, 12),
    fetchScreenshots(0, 12),
    fetchSesbian(0, 12),
    fetchTwin(0, 12),
  ]);

  console.log('[GALLERY PAGE] Fetched data:', {
    fanart: fanart?.length || 0,
    screenshots: screenshots?.length || 0,
    sesbian: sesbian?.length || 0,
    twin: twin?.length || 0
  });
  console.log('[GALLERY PAGE] Twin data:', twin);

  return (
    <GalleryClient 
      initialFanart={fanart}
      initialScreenshots={screenshots}
      initialSesbian={sesbian}
      initialTwin={twin}
    />
  );
}
