export async function useFontLoader(
  familyName: string,
  fontFiles: { styleName?: string; fileUrl?: string; webFontUrl?: string }[],
  setLoadedFonts: (update: (prev: Record<string, boolean>) => Record<string, boolean>) => void
) {
  if (!fontFiles || fontFiles.length === 0) return;

  const fontsToLoad = fontFiles
    .map((file) => {
      const url = file.webFontUrl || file.fileUrl || "";
      if (!url) return null;
      const fontUrl = url.startsWith("http") ? url : `https:${url}`;
      const name = `${familyName}-${file.styleName || "Regular"}`;
      return { name, url: fontUrl };
    })
    .filter(Boolean) as { name: string; url: string }[];

  // Preload WOFF2 fonts
  fontsToLoad.forEach((f) => {
    if (f.url.endsWith(".woff2") && !document.querySelector(`link[href="${f.url}"]`)) {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "font";
      link.type = "font/woff2";
      link.crossOrigin = "anonymous";
      link.href = f.url;
      document.head.appendChild(link);
    }
  });

  await Promise.all(
    fontsToLoad.map(async (f) => {
      try {
        if (document.fonts.check(`1em "${f.name}"`)) {
          setLoadedFonts((prev) => ({ ...prev, [f.name]: true }));
          return;
        }

        const fontFace = new FontFace(f.name, `url(${f.url})`, { display: "swap" });
        (fontFace as any).crossOrigin = "anonymous";
        const loaded = await fontFace.load();
        document.fonts.add(loaded);
        await document.fonts.ready;
        setLoadedFonts((prev) => ({ ...prev, [f.name]: true }));
        console.info(`✅ Loaded font: ${f.name}`);
      } catch (err) {
        console.error(`❌ Failed to load font ${f.name}`, err);
      }
    })
  );
}
