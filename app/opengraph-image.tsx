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
            "radial-gradient(circle at top right, rgba(34,197,94,0.14), transparent 26%), linear-gradient(135deg, #081f3d, #0f3460 45%, #0a6f87)",
          color: "white",
          padding: "64px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 18, height: 18, borderRadius: 9999, background: "#14b8a6" }} />
          <div style={{ fontSize: 34, fontWeight: 700 }}>ZoKorp Platform</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20, maxWidth: 900 }}>
          <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.05 }}>
            Practical AI delivery software and AWS readiness workflows.
          </div>
          <div style={{ fontSize: 28, opacity: 0.88 }}>
            Verified access, account-linked billing, and platform-supported execution.
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: 22, opacity: 0.92 }}>
          <div>Software</div>
          <div>Services</div>
          <div>Billing</div>
        </div>
      </div>
    ),
    size,
  );
}
