import { ImageResponse } from "next/og";

// Image metadata
export const alt = "Tokamak Network ZKP Blog";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

// Static OG image for blog listing page
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "60px",
          background: "linear-gradient(135deg, #0a1930 0%, #1a2347 50%, #0d2341 100%)",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Logo */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #4fc3f7 0%, #028bee 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span style={{ fontSize: "40px", color: "white", fontWeight: "bold" }}>T</span>
          </div>
          <span style={{ color: "#4fc3f7", fontSize: "36px", fontWeight: "600" }}>
            Tokamak ZKP
          </span>
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: "72px",
            fontWeight: "bold",
            color: "white",
            margin: 0,
            marginBottom: "24px",
            textAlign: "center",
          }}
        >
          Blog
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "28px",
            color: "#4fc3f7",
            margin: 0,
            textAlign: "center",
            maxWidth: "800px",
            lineHeight: 1.4,
          }}
        >
          Expert insights on zero-knowledge proofs, zk-EVM development, and blockchain privacy technology
        </p>

        {/* Tags */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginTop: "40px",
          }}
        >
          {["ZK Proofs", "zk-EVM", "Layer 2", "Privacy"].map((tag, index) => (
            <div
              key={index}
              style={{
                background: "#028bee",
                color: "white",
                padding: "12px 24px",
                fontSize: "18px",
                fontWeight: "500",
              }}
            >
              {tag}
            </div>
          ))}
        </div>

        {/* Decorative elements */}
        <div
          style={{
            position: "absolute",
            top: "40px",
            left: "40px",
            fontSize: "64px",
            opacity: 0.15,
            color: "#4fc3f7",
          }}
        >
          ✦
        </div>
        <div
          style={{
            position: "absolute",
            top: "80px",
            right: "60px",
            fontSize: "48px",
            opacity: 0.1,
            color: "#4fc3f7",
          }}
        >
          ✦
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "80px",
            left: "80px",
            fontSize: "32px",
            opacity: 0.1,
            color: "#4fc3f7",
          }}
        >
          +
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "120px",
            right: "100px",
            fontSize: "40px",
            opacity: 0.12,
            color: "#4fc3f7",
          }}
        >
          ✦
        </div>

        {/* Rainbow stripe at bottom */}
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            height: "8px",
            background: "linear-gradient(90deg, #ef4444, #eab308, #22c55e, #3b82f6, #6366f1, #a855f7)",
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
