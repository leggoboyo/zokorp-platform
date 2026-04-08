import { ImageResponse } from "next/og";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
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
            "linear-gradient(135deg, #f5f2ec 0%, #ece7de 100%)",
          border: "1px solid #d9d1c3",
          color: "white",
          padding: "64px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 18, height: 18, borderRadius: 9999, background: "#3139a1" }} />
          <div style={{ fontSize: 34, fontWeight: 700, color: "#101828" }}>ZoKorp</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 900 }}>
          <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.05, color: "#101828" }}>
            AWS architecture, AI/ML advisory, and software that lead to real delivery.
          </div>
          <div style={{ fontSize: 28, color: "#475467" }}>
            Founder-led consulting plus software for teams that need clear next steps.
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: 22, color: "#344054" }}>
          <div>Architecture Review</div>
          <div>AWS Readiness</div>
          <div>Software</div>
        </div>
      </div>
    ),
    size,
  );
}
