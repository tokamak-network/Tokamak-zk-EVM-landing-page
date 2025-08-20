"use client";

import React from "react";

interface LinesProps {
  height?: number;
}

export const Lines: React.FC<LinesProps> = ({ height = 10 }) => {
  return (
    <div className="relative w-full">
      {Array.from({ length: height }, (_, i) => (
        <div
          key={i}
          className="w-full border-t-2 border-[#00477A]"
          style={{
            marginTop: i === 0 ? 0 : "2px",
          }}
        />
      ))}
    </div>
  );
};
