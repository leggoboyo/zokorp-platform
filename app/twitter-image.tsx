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
            "radial-gradient(circle at bottom left, rgba(250,204,21,0.18), transparent 22%), linear-gradient(135deg, #081f3d, #0f3460 45%, #0a6f87)",
          color: "white",
          padding: "64px",
        }}
      >
        <div style={{ fontSize: 32, letterSpacing: 2, textTransform: "uppercase", opacity: 0.82 }}>ZoKorp Platform</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 900 }}>
          <div style={{ fontSize: 66, fontWeight: 700, lineHeight: 1.06 }}>
            One platform for software, services, and billing context.
          </div>
          <div style={{ fontSize: 28, opacity: 0.88 }}>
            Server-validated tools for practical AWS and AI delivery work.
          </div>
        </div>
        <div style={{ fontSize: 22, opacity: 0.92 }}>zokorp-web.vercel.app</div>
      </div>
    ),
    size,
  );
}
