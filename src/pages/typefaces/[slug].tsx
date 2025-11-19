"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import { sanity } from "@/lib/sanity.client";
import Image from "next/image";
import { urlFor } from "@/lib/sanity.image";
import opentype from "opentype.js";

const query = `
  *[_type == "typeface" && slug.current == $slug][0]{
    familyName,
    previewText,
    accentColor,
    fontFiles[]{
      styleName,
      "webFontUrl": webFont.asset->url,
      "sourceFontUrl": sourceFont.asset->url,
      isPrimary
    },
    sampleImages[]
  }
`;

interface FontFile {
  styleName: string;
  webFontUrl: string;
  sourceFontUrl?: string;
  isPrimary?: boolean;
}

export default function TypefacePage() {
  const router = useRouter();
  const { slug } = router.query;

  const [typeface, setTypeface] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeStyle, setActiveStyle] = useState<string | null>(null);
  const [fontSize, setFontSize] = useState<number>(36);
  const [previewText, setPreviewText] = useState<string>("");
  const [loadedFonts, setLoadedFonts] = useState<Record<string, boolean>>({});
  const [viewMode, setViewMode] = useState<"test" | "glyphs">("test");
  const [glyphs, setGlyphs] = useState<any[]>([]);
  const [glyphsLoading, setGlyphsLoading] = useState<boolean>(false);

  const previewRef = useRef<HTMLDivElement | null>(null);
  const caretRef = useRef<HTMLDivElement | null>(null);

  const getContrastColor = (hex?: string): string => {
    if (!hex) return "#FFFFFF";
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 150 ? "#000000" : "#FFFFFF";
  };

  const getFontWeight = (styleName: string): string => {
    const s = styleName.toLowerCase();
    if (s.includes("thin")) return "100";
    if (s.includes("extralight") || s.includes("extra light")) return "200";
    if (s.includes("light")) return "300";
    if (s.includes("regular") || s === "") return "400";
    if (s.includes("medium")) return "500";
    if (s.includes("semibold") || s.includes("semi bold")) return "600";
    if (s.includes("bold")) return "700";
    if (s.includes("extrabold") || s.includes("extra bold")) return "800";
    if (s.includes("black") || s.includes("heavy")) return "900";
    return "400";
  };

  // FETCH TYPEFACE + LOAD FONTS
  useEffect(() => {
    if (!slug) return;

    const fetchTypeface = async () => {
      const data = await sanity.fetch(query, { slug });
      setTypeface(data);
      setPreviewText(
        data?.previewText ||
          "The quick brown fox jumps over the lazy dog. 0123456789"
      );
      setLoading(false);

      if (!data?.fontFiles?.length) return;

      // Load each font file distinctly
      data.fontFiles.forEach((file: FontFile) => {
        if (!file.webFontUrl) return;

        const familyName = data.familyName.trim();
        const url = file.webFontUrl;
        const styleName = file.styleName || "Regular";
        const fontStyle = styleName.toLowerCase().includes("italic")
          ? "italic"
          : "normal";
        const fontWeight = getFontWeight(styleName);

        const alreadyLoaded = Array.from(document.fonts).some(
          (f) =>
            f.family === familyName &&
            f.style === fontStyle &&
            f.weight === fontWeight &&
            f.status === "loaded"
        );
        if (alreadyLoaded) {
          setLoadedFonts((prev) => ({ ...prev, [familyName]: true }));
          return;
        }

        try {
          const font = new FontFace(familyName, `url(${url}) format("woff2")`, {
            style: fontStyle,
            weight: fontWeight,
            display: "swap",
          });

          font
            .load()
            .then((loaded) => {
              document.fonts.add(loaded);
              setLoadedFonts((prev) => ({
                ...prev,
                [familyName]: true,
              }));
              console.info(
                `✅ Loaded: ${familyName} (${styleName}) [${fontWeight}, ${fontStyle}]`
              );
            })
            .catch((err) =>
              console.error(
                `❌ Failed to load ${familyName} (${styleName})`,
                err
              )
            );
        } catch (err) {
          console.error(
            `Error initializing font ${familyName} (${styleName})`,
            err
          );
        }
      });

      const primary =
        data.fontFiles.find((f: FontFile) => f.isPrimary) ||
        data.fontFiles[0];
      setActiveStyle(primary.styleName || data.fontFiles[0].styleName);
    };

    fetchTypeface();
  }, [slug]);

  // CUSTOM CARET LOGIC
  const updateCaretPosition = () => {
    const editor = previewRef.current;
    let caret = caretRef.current;
    if (!editor) return;

    const selection = window.getSelection();
    if (
      !selection ||
      selection.rangeCount === 0 ||
      !editor.contains(selection.anchorNode)
    ) {
      if (caret) caret.style.display = "none";
      return;
    }

    const range = selection.getRangeAt(0);
    const rects = range.getClientRects();
    const rect = rects[rects.length - 1];
    if (!rect) return;

    if (!caret) {
      caret = document.createElement("div");
      caretRef.current = caret;
      caret.className = "custom-caret";
      caret.style.position = "absolute";
      caret.style.zIndex = "9999";
      caret.style.animation = "blink 1s step-end infinite";
      caret.style.pointerEvents = "none";
      document.body.appendChild(caret);
    }

    caret.style.display = "block";
    const x = rect.left + window.scrollX;
    const y = rect.top + window.scrollY - fontSize / 2;
    const height = rect.height * 1.75;
    const accent = typeface?.accentColor?.hex || "#000000";

    caret.style.left = `${x}px`;
    caret.style.top = `${y}px`;
    caret.style.height = `${height}px`;
    caret.style.width = `clamp(1px, ${fontSize / 12}px, 4px)`;
    caret.style.backgroundColor = accent;
  };

  const handleInput = () => requestAnimationFrame(updateCaretPosition);
  const handleClick = () => requestAnimationFrame(updateCaretPosition);

  useEffect(() => {
    const handleKey = () => requestAnimationFrame(updateCaretPosition);
    const handleGlobalClick = (e: MouseEvent) => {
      const editor = previewRef.current;
      const caret = caretRef.current;
      if (editor && caret && !editor.contains(e.target as Node)) {
        caret.style.display = "none";
      }
    };

    window.addEventListener("keyup", handleKey);
    window.addEventListener("mouseup", handleKey);
    window.addEventListener("click", handleGlobalClick);

    return () => {
      window.removeEventListener("keyup", handleKey);
      window.removeEventListener("mouseup", handleKey);
      window.removeEventListener("click", handleGlobalClick);
      const caret = caretRef.current;
      if (caret && caret.parentNode) caret.parentNode.removeChild(caret);
    };
  }, []);

  useEffect(() => {
    const caret = caretRef.current;
    if (caret) caret.style.width = `clamp(1px, ${fontSize / 12}px, 4px)`;
    requestAnimationFrame(updateCaretPosition);
  }, [fontSize]);

  // LOAD GLYPHS (Type-safe, sorted by Unicode)
  useEffect(() => {
    if (!typeface || !activeStyle) return;

    const selectedStyle = typeface.fontFiles.find(
      (f: FontFile) => f.styleName === activeStyle
    );
    const glyphUrl = selectedStyle?.sourceFontUrl;
    if (!glyphUrl) {
      setGlyphs([]);
      return;
    }

    const isSupported =
      glyphUrl.toLowerCase().endsWith(".ttf") ||
      glyphUrl.toLowerCase().endsWith(".otf");

    if (!isSupported) {
      setGlyphs([]);
      return;
    }

    setGlyphsLoading(true);

    opentype.load(glyphUrl, (err, font) => {
      if (err || !font) {
        console.error("Glyph loading failed:", err);
        setGlyphsLoading(false);
        return;
      }

      // ✅ Type-safe iteration workaround
      const collected: any[] = [];
      const glyphSet: any = font.glyphs as any; // bypass missing typing
      if (glyphSet && typeof glyphSet.forEach === "function") {
        glyphSet.forEach((g: any) => {
          if (g?.path && g.path.commands.length > 0) collected.push(g);
        });
      } else if (glyphSet && typeof glyphSet.all === "function") {
        glyphSet.all().forEach((g: any) => {
          if (g?.path && g.path.commands.length > 0) collected.push(g);
        });
      }

      const all = collected
        .sort((a: any, b: any) => {
          if (typeof a.unicode === "number" && typeof b.unicode === "number")
            return a.unicode - b.unicode;
          if (typeof a.unicode === "number") return -1;
          if (typeof b.unicode === "number") return 1;
          return 0;
        })
        .map((g: any) => ({
          name: g.name,
          unicode: g.unicode,
          path: g.path.toPathData(2),
          advanceWidth: g.advanceWidth || font.unitsPerEm,
          unitsPerEm: font.unitsPerEm,
        }));

      setGlyphs(all);
      setGlyphsLoading(false);
    });
  }, [typeface, activeStyle]);

  if (loading)
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-neutral-400">Loading typeface...</p>
      </main>
    );

  if (!typeface)
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-neutral-400">Typeface not found.</p>
      </main>
    );

  const accent = typeface.accentColor?.hex || "#000000";
  const contrastText = getContrastColor(accent);
  const fontFamily = typeface.familyName;
  const fontLoaded = loadedFonts[fontFamily];

  const styleLower = activeStyle?.toLowerCase() || "";
  const fontStyle = styleLower.includes("italic") ? "italic" : "normal";
  const fontWeight = getFontWeight(styleLower);

  return (
    <main className="bg-white text-neutral-900 relative">
      {/* HEADER */}
      <header
        className="relative -mt-[64px] pt-[134px] pb-16 mb-12"
        style={{ backgroundColor: accent, color: contrastText }}
      >
        <div className="px-[10%]">
          <h1
            className="font-medium"
            style={{
              fontSize: "60pt",
              fontFamily: fontLoaded
                ? `"${fontFamily}", sans-serif`
                : "sans-serif",
              fontWeight,
              fontStyle,
              lineHeight: 1.1,
            }}
          >
            {typeface.familyName}
          </h1>
        </div>
      </header>

      {/* CONTROLS */}
      <section className="px-[10%]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 space-y-6 sm:space-y-0">
          <div>
            <label className="text-sm text-neutral-600 block mb-1">
              Font Style (debug)
            </label>
            <select
              className="border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-neutral-400"
              value={activeStyle || ""}
              onChange={(e) => setActiveStyle(e.target.value)}
            >
              {typeface.fontFiles.map((f: FontFile) => {
                const weight = getFontWeight(f.styleName || "");
                return (
                  <option key={f.styleName} value={f.styleName}>
                    {f.styleName || "Unnamed Style"} ({weight})
                  </option>
                );
              })}
            </select>
          </div>

          <div className="w-full sm:w-1/3">
            <label className="text-sm text-neutral-600 block mb-1">
              Font Size ({fontSize}pt)
            </label>
            <input
              type="range"
              min={10}
              max={120}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-full cursor-pointer"
              style={{ accentColor: accent }}
            />
          </div>
        </div>

        {/* VIEW TOGGLE */}
        <div className="flex justify-center mb-6 gap-6">
          <button
            onClick={() => setViewMode("test")}
            className={`pb-1 border-b-2 transition-all ${
              viewMode === "test"
                ? "border-neutral-900 text-neutral-900"
                : "border-transparent text-neutral-500"
            }`}
          >
            Test Font
          </button>
          <button
            onClick={() => setViewMode("glyphs")}
            className={`pb-1 border-b-2 transition-all ${
              viewMode === "glyphs"
                ? "border-neutral-900 text-neutral-900"
                : "border-transparent text-neutral-500"
            }`}
          >
            View Glyphs
          </button>
        </div>
      </section>

      {/* MAIN PREVIEW */}
      <section className="px-[10%] py-10 border-t border-neutral-200 border-b relative min-h-[300px]">
        {viewMode === "test" ? (
          <div
            ref={previewRef}
            onInput={handleInput}
            onClick={handleClick}
            contentEditable
            suppressContentEditableWarning
            className="w-full bg-transparent text-neutral-900 focus:outline-none whitespace-pre-wrap break-words relative"
            style={{
              fontSize: `${fontSize}pt`,
              fontFamily: fontLoaded
                ? `"${fontFamily}", sans-serif`
                : "sans-serif",
              fontStyle,
              fontWeight,
              lineHeight: 1.3,
              paddingTop: "0.4em",
              paddingBottom: "0.4em",
              caretColor: "transparent",
              minHeight: "1.2em",
            }}
          >
            {previewText}
          </div>
        ) : glyphsLoading ? (
          <div className="flex justify-center items-center h-[200px]">
            <div className="w-8 h-8 border-4 border-neutral-300 border-t-neutral-700 rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-4">
            {glyphs.map((g, i) => (
              <div key={i} className="flex items-center justify-center p-2 text-center">
                <svg
                  viewBox={`0 0 ${g.advanceWidth} ${g.unitsPerEm}`}
                  width={fontSize * 1.3}
                  height={fontSize * 1.3}
                  preserveAspectRatio="xMidYMid meet"
                  style={{ transform: "scale(1, -1)", overflow: "visible" }}
                >
                  <path d={g.path} fill="currentColor" />
                </svg>
              </div>
            ))}
          </div>
        )}

        <style jsx global>{`
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0; }
          }
          [contenteditable]::selection {
            background-color: ${accent}22;
          }
        `}</style>
      </section>

      {/* SAMPLE IMAGES */}
      {typeface.sampleImages && typeface.sampleImages.length > 0 && (
        <section className="px-[10%] py-16 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {typeface.sampleImages.map((img: any, i: number) => (
            <div key={i} className="relative overflow-hidden">
              <Image
                src={urlFor(img).width(1600).auto("format").url()}
                alt={`${typeface.familyName} sample ${i + 1}`}
                width={1600}
                height={1200}
                className="object-cover w-full h-full rounded-none"
              />
            </div>
          ))}
        </section>
      )}
    </main>
  );
}
