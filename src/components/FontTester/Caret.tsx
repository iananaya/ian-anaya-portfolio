"use client";

interface CaretProps {
  x: number;
  y: number;
  height: number;
  fontSize: number;
  accent: string;
}

export default function Caret({ x, y, height, fontSize, accent }: CaretProps) {
  const width = Math.min(Math.max(fontSize / 20, 2), 8); // 2–8px range
  const capHeight = height * 0.7; // approximate cap-height ratio

  return (
    <div
      className="absolute animate-blink"
      style={{
        left: `${x}px`,
        top: `${y + (height - capHeight)}px`,
        width: `${width}px`,
        height: `${capHeight}px`,
        backgroundColor: accent,
        pointerEvents: "none",
      }}
    />
  );
}

// Add blink animation globally
export const caretStyles = `
@keyframes blink {
  0%, 49% { opacity: 1; }
  50%, 100% { opacity: 0; }
}
.animate-blink {
  animation: blink 1s infinite;
}
`;