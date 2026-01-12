import { ImageResponse } from "next/og";
import { getBlogPostBySlug } from "@/lib/blog";

// Image metadata
export const alt = "Tokamak Network ZKP Blog";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

// Generate dynamic OG image for each blog post
export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPostBySlug(slug);

  // Fallback if post not found
  const title = post?.title || "Blog Post";
  const author = post?.author || "Tokamak Network";
  const tags = post?.tags?.slice(0, 3) || [];
  const publishDate = post?.publishDate
    ? new Date(post.publishDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "60px",
          background: "linear-gradient(135deg, #0a1930 0%, #1a2347 50%, #0d2341 100%)",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        {/* Top section with logo and tags */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          {/* Logo area */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #4fc3f7 0%, #028bee 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: "24px", color: "white", fontWeight: "bold" }}>T</span>
            </div>
            <span style={{ color: "#4fc3f7", fontSize: "24px", fontWeight: "600" }}>
              Tokamak ZKP
            </span>
          </div>

          {/* Tags */}
          <div style={{ display: "flex", gap: "10px" }}>
            {tags.map((tag, index) => (
              <div
                key={index}
                style={{
                  background: "#028bee",
                  color: "white",
                  padding: "8px 16px",
                  fontSize: "16px",
                  fontWeight: "500",
                }}
              >
                {tag}
              </div>
            ))}
          </div>
        </div>

        {/* Title - Center */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "20px",
            flex: 1,
            justifyContent: "center",
          }}
        >
          <h1
            style={{
              fontSize: title.length > 60 ? "42px" : title.length > 40 ? "52px" : "64px",
              fontWeight: "bold",
              color: "white",
              lineHeight: 1.2,
              margin: 0,
              maxWidth: "100%",
              overflow: "hidden",
              textOverflow: "ellipsis",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
            }}
          >
            {title}
          </h1>
        </div>

        {/* Bottom section with author and date */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "2px solid #4fc3f7",
            paddingTop: "24px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            {/* Author avatar placeholder */}
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "linear-gradient(135deg, #4fc3f7 0%, #028bee 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: "20px", color: "white", fontWeight: "bold" }}>
                {author.charAt(0).toUpperCase()}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ color: "white", fontSize: "20px", fontWeight: "600" }}>
                {author}
              </span>
              <span style={{ color: "#4fc3f7", fontSize: "16px", opacity: 0.8 }}>
                {publishDate}
              </span>
            </div>
          </div>

          {/* Blog label */}
          <div
            style={{
              color: "#4fc3f7",
              fontSize: "18px",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>zkp.tokamak.network/blog</span>
          </div>
        </div>

        {/* Decorative elements */}
        <div
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
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
            bottom: "100px",
            left: "30px",
            fontSize: "32px",
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
