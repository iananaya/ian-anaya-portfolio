"use client";

import { useEffect, useRef, useState } from "react";
import Caret from "./Caret";
import useCaretPosition from "./useCaretPosition";

interface FontTesterProps {
  fontFamily: string;
  fontSize: number;
  accent: string;
  initialText?: string;
}

export default function FontTester({
  fontFamily,
  fontSize,
  accent,
  initialText = "The quick brown fox jumps over the lazy dog. 0123456789",
}: FontTesterProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [text, setText] = useState(initialText);
  const [caret, setCaret] = useState({ x: 0, y: 0, height: 0 });

  const { updateCaretPosition } = useCaretPosition(editorRef, setCaret);

  // Ensure caret updates whenever text or font size changes
  useEffect(() => {
    updateCaretPosition();
  }, [text, fontSize]);

  return (
    <div className="relative w-full py-10 border-t border-b border-neutral-200">
      {/* Editable Text Area */}
      <div
        ref={editorRef}
        contentEditable
        suppressContentEditableWarning
        onInput={(e) => {
          setText(e.currentTarget.textContent || "");
          updateCaretPosition();
        }}
        onKeyUp={updateCaretPosition}
        onMouseUp={updateCaretPosition}
        className="w-full outline-none whitespace-pre-wrap break-words cursor-text"
        style={{
          fontFamily: `"${fontFamily}", sans-serif`,
          fontSize: `${fontSize}pt`,
          lineHeight: 1.3,
          caretColor: "transparent", // hide native caret
        }}
      >
        {text}
      </div>

      {/* Custom Caret */}
      <Caret
        x={caret.x}
        y={caret.y}
        height={caret.height}
        fontSize={fontSize}
        accent={accent}
      />
    </div>
  );
}
