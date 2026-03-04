"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

interface MarkdownContentProps {
  content: string;
}

function ImageWithFallback({ src, alt }: { src?: string; alt?: string }) {
  const isRemote = src?.startsWith("http://") || src?.startsWith("https://");
  const [failed, setFailed] = useState(!isRemote);

  if (failed) {
    return (
      <figure className="my-6">
        <div className="w-full h-56 bg-gradient-to-br from-[#0a1930] via-[#1a2347] to-[#0a1930] border border-[#4fc3f7]/30 rounded-lg flex flex-col items-center justify-center relative overflow-hidden">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(to right, #4fc3f7 1px, transparent 1px),
                linear-gradient(to bottom, #4fc3f7 1px, transparent 1px)
              `,
              backgroundSize: "24px 24px",
              opacity: 0.1,
            }}
          />
          <div className="absolute inset-0 opacity-15">
            <div className="absolute top-4 left-4 text-2xl text-[#4fc3f7]">
              ✦
            </div>
            <div className="absolute bottom-4 right-4 text-2xl text-[#4fc3f7]">
              ✦
            </div>
          </div>
          <div className="relative z-10 flex flex-col items-center justify-center gap-3 px-8 max-w-lg">
            <div
              className="text-xs font-bold text-[#4fc3f7]/50 tracking-widest uppercase"
              style={{ fontFamily: '"Jersey 10", "Press Start 2P", monospace' }}
            >
              TOKAMAK zk-EVM
            </div>
            {alt && (
              <p
                className="text-sm text-white/70 text-center line-clamp-3 leading-relaxed"
                style={{ fontFamily: '"IBM Plex Mono"' }}
              >
                {alt}
              </p>
            )}
          </div>
        </div>
      </figure>
    );
  }

  return (
    <figure className="my-6">
      <img
        src={src}
        alt={alt || ""}
        className="max-w-full h-auto rounded-lg border border-[#4fc3f7]/20"
        loading="lazy"
        onError={() => setFailed(true)}
      />
      {alt && (
        <figcaption
          className="text-center text-white/50 text-sm mt-2"
          style={{ fontFamily: '"IBM Plex Mono"' }}
        >
          {alt}
        </figcaption>
      )}
    </figure>
  );
}

export default function MarkdownContent({ content }: MarkdownContentProps) {
  if (!content) {
    return (
      <div className="text-white text-center py-10">
        <p>No content available</p>
      </div>
    );
  }

  return (
    <div className="markdown-content-wrapper prose prose-invert prose-lg max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          h1: ({ children }) => (
            <h1
              className="text-3xl md:text-4xl font-bold text-white mt-12 mb-6 border-b border-[#4fc3f7]/30 pb-4"
              style={{ fontFamily: '"IBM Plex Mono"' }}
            >
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2
              className="text-2xl md:text-3xl font-bold text-white mt-10 mb-4"
              style={{ fontFamily: '"IBM Plex Mono"' }}
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3
              className="text-xl md:text-2xl font-semibold text-white mt-8 mb-3"
              style={{ fontFamily: '"IBM Plex Mono"' }}
            >
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4
              className="text-lg md:text-xl font-semibold text-white mt-6 mb-2"
              style={{ fontFamily: '"IBM Plex Mono"' }}
            >
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p
              className="text-white/90 leading-relaxed mb-4"
              style={{ fontFamily: '"IBM Plex Mono"', fontSize: "1rem", lineHeight: "1.8" }}
            >
              {children}
            </p>
          ),
          a: ({ href, children }) => (
            <a
              href={href}
              className="text-[#4fc3f7] hover:text-[#028bee] underline underline-offset-4 transition-colors"
              target={href?.startsWith("http") ? "_blank" : undefined}
              rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              {children}
            </a>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-2 mb-6 text-white/90 ml-4">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-2 mb-6 text-white/90 ml-4">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li
              className="text-white/90 leading-relaxed"
              style={{ fontFamily: '"IBM Plex Mono"', fontSize: "1rem" }}
            >
              {children}
            </li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-[#4fc3f7] bg-[#0a1930]/60 pl-6 py-4 my-6 rounded-r-lg">
              {children}
            </blockquote>
          ),
          code: ({ className, children, ...props }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-[#1a2347] text-[#4fc3f7] px-1.5 py-0.5 rounded text-sm font-mono">
                  {children}
                </code>
              );
            }
            return (
              <code className={`${className} block`} {...props}>
                {children}
              </code>
            );
          },
          pre: ({ children }) => (
            <pre className="bg-[#0a1930] border border-[#4fc3f7]/30 rounded-lg p-4 my-6 overflow-x-auto text-sm">
              {children}
            </pre>
          ),
          table: ({ children }) => (
            <div className="overflow-x-auto my-6">
              <table className="w-full border-collapse border border-[#4fc3f7]/30">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-[#1a2347]">{children}</thead>
          ),
          th: ({ children }) => (
            <th
              className="border border-[#4fc3f7]/30 px-4 py-3 text-left text-[#4fc3f7] font-semibold"
              style={{ fontFamily: '"IBM Plex Mono"' }}
            >
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td
              className="border border-[#4fc3f7]/30 px-4 py-3 text-white/90"
              style={{ fontFamily: '"IBM Plex Mono"', fontSize: "0.9rem" }}
            >
              {children}
            </td>
          ),
          tr: ({ children }) => (
            <tr className="hover:bg-[#1a2347]/50 transition-colors">{children}</tr>
          ),
          hr: () => <hr className="border-[#4fc3f7]/30 my-8" />,
          img: ({ src, alt }) => <ImageWithFallback src={typeof src === "string" ? src : undefined} alt={alt} />,
          strong: ({ children }) => (
            <strong className="text-white font-bold">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="text-white/80 italic">{children}</em>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
