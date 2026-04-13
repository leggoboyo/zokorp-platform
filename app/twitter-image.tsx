import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background:
            "linear-gradient(135deg, #0f172a 0%, #1f2937 60%, #111827 100%)",
          color: "#f8fafc",
          padding: "64px",
        }}
      >
        <div style={{ fontSize: 32, letterSpacing: 2, textTransform: "uppercase", opacity: 0.82 }}>ZoKorp</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 900 }}>
          <div style={{ fontSize: 66, fontWeight: 700, lineHeight: 1.06 }}>
            Founder-led AWS architecture, validation, and optimization.
          </div>
          <div style={{ fontSize: 28, opacity: 0.88 }}>
            Review, readiness, cost cleanup, and software without generic agency theater.
          </div>
        </div>
        <div style={{ fontSize: 22, opacity: 0.92 }}>www.zokorp.com</div>
      </div>
    ),
    size,
  );
}
