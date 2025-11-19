'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { sanity } from '@/lib/sanity.client';
import { groq } from 'next-sanity';

interface FontFile {
  _key: string;
  styleName: string;
  webFontUrl: string;
}

interface Typeface {
  _id: string;
  slug: { current: string };
  familyName: string;
  accentColor?: { hex: string };
  fontFiles: FontFile[];
}

export default function TypefacesPage() {
  const [typefaces, setTypefaces] = useState<Typeface[]>([]);
  const [loadedFonts, setLoadedFonts] = useState<Record<string, boolean>>({});
  const router = useRouter();

  // Load all typefaces from Sanity
useEffect(() => {
  async function fetchTypefaces() {
    try {
      const data = await sanity.fetch(groq`
        *[_type == "typeface"]{
          _id,
          familyName,
          slug,
          accentColor,
          fontFiles[]{
            _key,
            styleName,
            "webFontUrl": webFont.asset->url,
            "sourceFontUrl": sourceFont.asset->url,
            isPrimary
          }
        } | order(familyName asc)
      `);

      console.log("✅ Sanity data fetched:", data);
      setTypefaces(data);
    } catch (err) {
      console.error("❌ Sanity fetch failed:", err);
    }
  }
  fetchTypefaces();
}, []);


  // Load each font dynamically
  useEffect(() => {
    async function loadFonts() {
      for (const tf of typefaces) {
        for (const file of tf.fontFiles) {
          const url = file.webFontUrl;
          if (!url) continue;

          const fileName = url.split('/').pop()?.replace('.woff2', '') || '';
          const [base, stylePart = 'Regular'] = fileName.split(/-(?=[^-]+$)/);
          const family = base.replace(/([A-Z])/g, ' $1').trim();
          const fontName = `${family} ${stylePart}`.trim();

          const style = /italic/i.test(stylePart) ? 'italic' : 'normal';
          const weight = /bold/i.test(stylePart) ? '700' : '400';

          try {
            const font = new FontFace(fontName, `url(${url}) format("woff2")`, {
  style,
  weight,
  display: 'swap',
});
const loaded = await font.load();

            document.fonts.add(loaded);
            setLoadedFonts((prev) => ({ ...prev, [fontName]: true }));
            console.log(`✅ Loaded: ${fontName}`);
          } catch (err) {
            console.warn(`❌ Failed to load ${fontName}`, err);
          }
        }
      }
    }

    if (typefaces.length > 0) loadFonts();
  }, [typefaces]);

  if (typefaces.length === 0) {
    return (
      <div
        className="flex items-center justify-center min-h-screen"
        style={{ color: '#cccccc', background: '#0c0c0c' }}
      >
        Loading typefaces...
      </div>
    );
  }

  return (
    <main
      className="min-h-screen w-full flex flex-col items-center -mt-[64px] pt-[134px] pb-16"
      style={{ backgroundColor: '#0c0c0c', color: '#cccccc', paddingTop: '130px' }}
    >
      {typefaces.map((tf, idx) => {
        const primary =
          tf.fontFiles.find((f) => f.styleName?.toLowerCase().includes('regular')) ||
          tf.fontFiles[0];
        const url = primary?.webFontUrl;
        const fileName = url?.split('/').pop()?.replace('.woff2', '') || '';
        const [base, stylePart = 'Regular'] = fileName.split(/-(?=[^-]+$)/);
        const family = base.replace(/([A-Z])/g, ' $1').trim();
        const primaryFontName = `${family} ${stylePart}`.trim();
        const primaryLoaded = loadedFonts[primaryFontName];
        const accent = tf.accentColor?.hex || '#cccccc';

        return (
          <section
            key={tf._id}
            className="w-full max-w-6xl text-center mb-24 cursor-pointer transition-colors duration-75"
            onClick={() => router.push(`/typefaces/${tf.slug.current}`)}
            style={{
              '--accent': accent,
            } as React.CSSProperties}
          >
            {/* Family name */}
            <h1
              className="transition-colors duration-[30ms]"
              style={{
                fontFamily: primaryLoaded ? `"${primaryFontName}"` : 'sans-serif',
                fontSize: 'clamp(48px, 10vw, 160px)',
                lineHeight: 1.1,
                marginBottom: '0.5em',
                color: '#cccccc',
                cursor: 'pointer',
                transition: 'color 0.03s ease-in-out',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.color = accent;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.color = '#cccccc';
              }}
            >
              {tf.familyName}
            </h1>

            {/* Style list */}
            <div
              className="flex flex-wrap justify-center gap-8"
              style={{ fontSize: '32pt', color: '#cccccc' }}
            >
              {tf.fontFiles.map((file) => {
                const sUrl = file.webFontUrl;
                if (!sUrl) return null;
                const sFile = sUrl.split('/').pop()?.replace('.woff2', '') || '';
                const [sBase, sStylePart = 'Regular'] = sFile.split(/-(?=[^-]+$)/);
                const sFamily = sBase.replace(/([A-Z])/g, ' $1').trim();
                const sFontName = `${sFamily} ${sStylePart}`.trim();
                const sLoaded = loadedFonts[sFontName];

                return (
                  <span
                    key={file._key}
                    style={{
                      fontFamily: sLoaded ? `"${sFontName}"` : 'sans-serif',
                    }}
                  >
                    {file.styleName}
                  </span>
                );
              })}
            </div>

            {/* Divider */}
            {idx < typefaces.length - 1 && (
              <div
                className="mx-auto mt-16"
                style={{
                  height: '1px',
                  width: '100%',
                  backgroundColor: '#333333',
                }}
              />
            )}
          </section>
        );
      })}
    </main>
  );
}
