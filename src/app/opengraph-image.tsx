import { ImageResponse } from "next/og";

// Image metadata
export const alt = "Tokamak Network ZKP - Zero-Knowledge Proof Solutions for Ethereum";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

// Homepage OG image
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
            gap: "20px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #4fc3f7 0%, #028bee 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 40px rgba(79, 195, 247, 0.4)",
            }}
          >
            <span style={{ fontSize: "52px", color: "white", fontWeight: "bold" }}>T</span>
          </div>
        </div>

        {/* Title */}
        <h1
          style={{
            fontSize: "64px",
            fontWeight: "bold",
            color: "white",
            margin: 0,
            marginBottom: "16px",
            textAlign: "center",
          }}
        >
          Tokamak Network ZKP
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "32px",
            color: "#4fc3f7",
            margin: 0,
            marginBottom: "40px",
            textAlign: "center",
          }}
        >
          Zero-Knowledge Proof Solutions for Ethereum
        </p>

        {/* Features */}
        <div
          style={{
            display: "flex",
            gap: "24px",
            marginTop: "20px",
          }}
        >
          {["zk-EVM Rollups", "Threshold Signatures", "Private Channels"].map((feature, index) => (
            <div
              key={index}
              style={{
                background: "rgba(79, 195, 247, 0.15)",
                border: "2px solid #4fc3f7",
                color: "white",
                padding: "16px 28px",
                fontSize: "20px",
                fontWeight: "500",
              }}
            >
              {feature}
            </div>
          ))}
        </div>

        {/* URL */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            color: "#4fc3f7",
            fontSize: "20px",
            opacity: 0.8,
          }}
        >
          zkp.tokamak.network
        </div>

        {/* Decorative elements */}
        <div
          style={{
            position: "absolute",
            top: "40px",
            left: "40px",
            fontSize: "72px",
            opacity: 0.12,
            color: "#4fc3f7",
          }}
        >
          ✦
        </div>
        <div
          style={{
            position: "absolute",
            top: "60px",
            right: "80px",
            fontSize: "48px",
            opacity: 0.08,
            color: "#4fc3f7",
          }}
        >
          ✦
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "100px",
            left: "60px",
            fontSize: "36px",
            opacity: 0.1,
            color: "#4fc3f7",
          }}
        >
          +
        </div>
        <div
          style={{
            position: "absolute",
            top: "180px",
            right: "40px",
            fontSize: "28px",
            opacity: 0.1,
            color: "#4fc3f7",
          }}
        >
          +
        </div>
        <div
          style={{
            position: "absolute",
            bottom: "140px",
            right: "120px",
            fontSize: "52px",
            opacity: 0.1,
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
