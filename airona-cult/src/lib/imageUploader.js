"use client";

import { useState } from "react";
import Image from "next/image";
import { supabase } from "../lib/supabaseClient";

export default function ImageUploader() {
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");

  const handleUpload = async (event) => {
    try {
      setUploading(true);
      const file = event.target.files[0];
      if (!file) return;

      const fileName = `${Date.now()}-${file.name}`;

      const { data, error } = await supabase.storage
        .from("fanart") // your bucket name
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const { data: publicUrl } = supabase.storage
        .from("fanart")
        .getPublicUrl(fileName);

      setImageUrl(publicUrl.publicUrl);
    } catch (error) {
      console.error("Upload error:", error.message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleUpload} disabled={uploading} />
      {uploading && <p>Uploading...</p>}
      {imageUrl && (
        <div>
          <p>Uploaded Image:</p>
          <Image src={imageUrl} alt="Fanart" width={300} height={200} style={{objectFit: "contain"}} />
        </div>
      )}
    </div>
  );
}
