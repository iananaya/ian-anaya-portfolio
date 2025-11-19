"use client";

import { useState, useEffect } from "react";
import { sanity } from "@/lib/sanity.client";
import { urlFor } from "@/lib/sanity.image";
import Image from "next/image";
import Link from "next/link";
import Lightbox from "@/components/Lightbox";

const query = `
  *[_type == "project"] | order(_createdAt desc) {
    title,
    client,
    displayPreference,
    "slug": slug.current,
    heroImage,
    projectType,
    projectImages[] {
      image,
      caption
    },
    accentColor,
    tags
  }
`;

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [filter, setFilter] = useState("all");
  const [lightbox, setLightbox] = useState<{ open: boolean; images: any[]; index: number }>({
    open: false,
    images: [],
    index: 0,
  });

  useEffect(() => {
    const fetchProjects = async () => {
      const data = await sanity.fetch(query);
      setProjects(data);
    };
    fetchProjects();
  }, []);

  const filteredProjects =
    filter === "all"
      ? projects
      : projects.filter((p) => p.tags && p.tags.includes(filter));

  // Lightbox handlers
  const openLightbox = (images: any[], index = 0) => {
    setLightbox({ open: true, images, index });
  };
  const closeLightbox = () => setLightbox({ open: false, images: [], index: 0 });
  const nextImage = () =>
    setLightbox((prev) => ({
      ...prev,
      index: (prev.index + 1) % prev.images.length,
    }));
  const prevImage = () =>
    setLightbox((prev) => ({
      ...prev,
      index: (prev.index - 1 + prev.images.length) % prev.images.length,
    }));

  const getContrastColor = (hex?: string): string => {
    if (!hex) return "#FFFFFF";
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness > 150 ? "#000000" : "#FFFFFF";
  };

  // --- Tile Wrapper Component ---
interface TileWrapperProps {
  href?: string;
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

const TileWrapper = ({ href, className, style, children }: TileWrapperProps) => {
  if (href) {
    return (
      <Link href={href} legacyBehavior>
        <a className={className} style={style}>
          {children}
        </a>
      </Link>
    );
  }

  return (
    <div className={className} style={style}>
      {children}
    </div>
  );
};


  return (
    <main className="min-h-screen bg-white px-[10%] py-16">
      {/* FILTER MENU */}
      <div className="flex justify-center mb-12 space-x-8 text-sm font-medium text-neutral-600">
        {["all", "brand", "logo", "fonts"].map((tag) => (
          <button
            key={tag}
            onClick={() => setFilter(tag)}
            className={`uppercase tracking-wide transition-colors ${
              filter === tag
                ? "text-black border-b border-black pb-1"
                : "hover:text-black"
            }`}
          >
            {tag === "all"
              ? "All"
              : tag.charAt(0).toUpperCase() + tag.slice(1)}
          </button>
        ))}
      </div>

      {/* PROJECT GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
        {filteredProjects.map((project, projectIndex) => {
          const heroImageUrl = project.heroImage
            ? urlFor(project.heroImage)
                .width(1600)
                .height(1600)
                .quality(95)
                .auto("format")
                .url()
            : null;

          const accent = project.accentColor?.hex || "#000000";
          const contrastText = getContrastColor(accent);

          const isCaseStudy = project.projectType === "caseStudy";
          const isLightbox = project.projectType === "lightbox";

          const displayTitle =
            project.displayPreference === "client"
              ? project.client
              : project.title;

          const handleClick = () => {
            if (isLightbox) {
              const imagesToShow =
                project.projectImages?.length > 0
                  ? project.projectImages
                  : [
                      {
                        image: project.heroImage,
                        caption: project.title || "Project Image",
                      },
                    ];
              openLightbox(imagesToShow, 0);
            }
          };

          const href = isCaseStudy ? `/projects/${project.slug}` : undefined;

          return (
            <TileWrapper
              key={project.slug || projectIndex}
              href={href}
              className="group relative aspect-square overflow-hidden cursor-pointer"
              style={{ backgroundColor: accent }}
            >
              {/* inner clickable area */}
              <div
                onClick={!isCaseStudy ? handleClick : undefined}
                className="w-full h-full"
              >
                {heroImageUrl ? (
                  <Image
                    src={heroImageUrl}
                    alt={project.title}
                    width={1600}
                    height={1600}
                    className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="bg-neutral-100 w-full h-full flex items-center justify-center text-neutral-400 text-sm">
                    Missing Image
                  </div>
                )}

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />

                {/* Text */}
                <div
                  className="absolute bottom-4 left-4 right-4"
                  style={{ color: contrastText }}
                >
                  <h3 className="text-lg font-medium leading-tight">
                    {displayTitle}
                  </h3>
                </div>
              </div>
            </TileWrapper>
          );
        })}
      </div>

      {/* LIGHTBOX */}
      {lightbox.open && (
        <Lightbox
          images={lightbox.images}
          index={lightbox.index}
          onClose={closeLightbox}
          onNext={nextImage}
          onPrev={prevImage}
        />
      )}
    </main>
  );
}
