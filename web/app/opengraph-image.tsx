import { ImageResponse } from "next/og";

export const alt = "Studio 1 Barbershop, Barrie";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0F0F0F",
          color: "#F5EEE6",
          padding: 72,
        }}
      >
        <div style={{ display: "flex", fontSize: 26, letterSpacing: 8, color: "#C8A886" }}>BARRIE · YONGE ST</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 190, fontWeight: 800, lineHeight: 0.95, letterSpacing: -2 }}>STUDIO 1</div>
          <div style={{ display: "flex", fontSize: 54, letterSpacing: 14, color: "#D8D0C8" }}>BARBERSHOP</div>
        </div>
        <div style={{ display: "flex", fontSize: 30, color: "#B5ADA5" }}>Fades · Beard work · Hot towel shaves · Open 7 days</div>
      </div>
    ),
    size,
  );
}
