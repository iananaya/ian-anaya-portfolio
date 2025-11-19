"use client";

import { RefObject, useCallback } from "react";

export default function useCaretPosition(
  editorRef: RefObject<HTMLDivElement | null>,
  setCaret: (pos: { x: number; y: number; height: number }) => void
) {
  const updateCaretPosition = useCallback(() => {
    const editor = editorRef.current;
    if (!editor) return;

    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !editor.contains(selection.anchorNode))
      return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const editorRect = editor.getBoundingClientRect();

    // Skip if range is collapsed but no measurable rect yet (common when switching focus)
    if (!rect || rect.width === 0) return;

    // Calculate caret offset relative to the editor
    const x = rect.left - editorRect.left - 1; // slight nudge for natural optical alignment
    const y = rect.top - editorRect.top;

    // Estimate cap-height proportionally to text box height
    const height = rect.height * 0.75;

    setCaret({ x, y, height });
  }, [editorRef, setCaret]);

  return { updateCaretPosition };
}
