import { fetchFanart, fetchScreenshots, fetchSesbian } from "@/lib/fetchContentSecure";
import ModernBPSRClient from "./ModernBPSRClient";

export default async function ModernBPSRPage() {
  // Fetch content from database
  const [fanart, screenshots, sesbian] = await Promise.all([
    fetchFanart(0, 12),
    fetchScreenshots(0, 12),
    fetchSesbian(0, 12),
  ]);

  return (
    <ModernBPSRClient 
      fanart={fanart}
      screenshots={screenshots}
      sesbian={sesbian}
    />
  );
}
