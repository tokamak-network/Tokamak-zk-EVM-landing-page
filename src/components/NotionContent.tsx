"use client";

import dynamic from "next/dynamic";
import type { ExtendedRecordMap } from "notion-types";

// Import react-notion-x styles
import "react-notion-x/src/styles.css";

// Import prismjs for code highlighting
import "prismjs/themes/prism-tomorrow.css";

// Import katex for math equations
import "katex/dist/katex.min.css";

// Dynamically import NotionRenderer to avoid SSR issues
const NotionRenderer = dynamic(
  () => import("react-notion-x").then((mod) => mod.NotionRenderer),
  { ssr: false }
);

// Dynamically import code block component for syntax highlighting
const Code = dynamic(
  () => import("react-notion-x/build/third-party/code").then((mod) => mod.Code),
  { ssr: false }
);

// Dynamically import equation component for math rendering
const Equation = dynamic(
  () => import("react-notion-x/build/third-party/equation").then((mod) => mod.Equation),
  { ssr: false }
);

interface NotionContentProps {
  recordMap: ExtendedRecordMap;
  rootPageId?: string;
}

export default function NotionContent({ recordMap, rootPageId }: NotionContentProps) {
  if (!recordMap) {
    return (
      <div className="text-white text-center py-10">
        <p>No content available</p>
      </div>
    );
  }

  return (
    <div className="notion-content-wrapper">
      <NotionRenderer
        recordMap={recordMap}
        fullPage={false}
        darkMode={true}
        rootPageId={rootPageId}
        disableHeader={true}
        mapPageUrl={(pageId) => `/blog/${pageId}`}
        components={{
          Code,
          Equation,
        }}
      />
    </div>
  );
}

