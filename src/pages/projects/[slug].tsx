import { useRouter } from "next/router";
import { sanity } from "@/lib/sanity.client";
import { urlFor } from "@/lib/sanity.image";
import Image from "next/image";
import { useEffect, useState } from "react";
import Lightbox from "@/components/Lightbox";

const query = `
  *[_type == "project" && slug.current == $slug][0]{
    title,
    client,
    overview,
    services,
    heroImage,
    projectImages[] {
      image,
      caption
    }
  }
`;

export default function ProjectPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState<{ open: boolean; index: number }>({
    open: false,
    index: 0,
  });

  useEffect(() => {
    if (!slug) return;
    const fetchProject = async () => {
      try {
        const data = await sanity.fetch(query, { slug });
        setProject(data);
      } catch (err) {
        console.error("Sanity fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProject();
  }, [slug]);

  if (loading)
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-neutral-400">Loading project...</p>
      </main>
    );

  if (!project)
    return (
      <main className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-neutral-400">Project not found.</p>
      </main>
    );

  // Lightbox controls
  const openLightbox = (index: number) => setLightbox({ open: true, index });
  const closeLightbox = () => setLightbox({ open: false, index: 0 });
  const nextImage = () =>
    setLightbox((prev) => ({
      ...prev,
      index: (prev.index + 1) % project.projectImages.length,
    }));
  const prevImage = () =>
    setLightbox((prev) => ({
      ...prev,
      index:
        (prev.index - 1 + project.projectImages.length) %
        project.projectImages.length,
    }));

  return (
    <main className="bg-white text-neutral-900">
      {/* HERO IMAGE */}
      {project.heroImage && (
        <div className="px-[10%] pt-7">
          <div className="overflow-hidden">
            <Image
              src={urlFor(project.heroImage)
                .width(2400)
                .quality(95)
                .auto("format")
                .url()}
              alt={project.title}
              width={2400}
              height={1350}
              className="w-full h-auto object-cover rounded-none"
              priority
            />
          </div>
        </div>
      )}

      {/* INFO SECTION */}
      <section className="px-[10%] pt-16 pb-12">
        {/* DESKTOP (4-COLUMN) */}
        <div className="hidden lg:flex flex-wrap w-full">
          <div className="w-[10%] pr-6 text-neutral-500 italic">
            <p className="mb-8">Client</p>
            <p>Overview</p>
          </div>
          <div className="w-[38%] pr-[4%] mr-[4%]">
            <p className="mb-8">{project.client}</p>
            <p className="whitespace-pre-line leading-relaxed">
              {project.overview}
            </p>
          </div>
          <div className="w-[10%] pr-6 text-neutral-500 italic">
            <p className="mb-8">Project</p>
            <p>Services</p>
          </div>
          <div className="w-[38%]">
            <p className="mb-8">{project.title}</p>
            <p className="whitespace-pre-line leading-relaxed">
              {Array.isArray(project.services)
                ? project.services.join(", ")
                : project.services}
            </p>
          </div>
        </div>

        {/* TABLET (2-COLUMN) */}
        <div className="hidden sm:grid lg:hidden grid-cols-2 gap-x-12 gap-y-10">
          <div>
            <p className="text-neutral-500 italic mb-1">Client</p>
            <p>{project.client}</p>
          </div>
          <div>
            <p className="text-neutral-500 italic mb-1">Project</p>
            <p>{project.title}</p>
          </div>
          <div>
            <p className="text-neutral-500 italic mb-1">Overview</p>
            <p className="whitespace-pre-line leading-relaxed">
              {project.overview}
            </p>
          </div>
          <div>
            <p className="text-neutral-500 italic mb-1">Services</p>
            <p className="whitespace-pre-line leading-relaxed">
              {Array.isArray(project.services)
                ? project.services.join(", ")
                : project.services}
            </p>
          </div>
        </div>

        {/* MOBILE (STACKED) */}
        <div className="block sm:hidden w-full space-y-8 text-neutral-900">
          {[
            ["Client", project.client],
            ["Project", project.title],
            ["Overview", project.overview],
            [
              "Services",
              Array.isArray(project.services)
                ? project.services.join(", ")
                : project.services,
            ],
          ].map(([label, value], i) => (
            <div
              key={i}
              className="border-t border-neutral-200 pt-6 first:border-t-0 first:pt-0"
            >
              <p className="text-neutral-500 italic mb-1">{label}</p>
              <p className="whitespace-pre-line leading-relaxed">{value}</p>
            </div>
          ))}
        </div>
      </section>

      {/* DIVIDER LINE */}
      <div className="px-[10%]">
        <div className="border-t border-neutral-200 my-6" />
      </div>

      {/* PROJECT IMAGE GRID */}
      {project.projectImages && project.projectImages.length > 0 && (
        <section className="px-[10%] pt-12 pb-24">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
            {project.projectImages.map(
              (
                img: { image?: any; url?: string; caption?: string },
                i: number
              ) => {
                const imageUrl = img.url
                  ? img.url
                  : img.image
                  ? urlFor(img.image)
                      .width(1600)
                      .height(1600)
                      .quality(95)
                      .auto("format")
                      .url()
                  : null;

                return (
                  <div
                    key={i}
                    className="relative aspect-square overflow-hidden group cursor-pointer"
                    onClick={() => openLightbox(i)}
                  >
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={img.caption || `Project image ${i + 1}`}
                        width={1600}
                        height={1600}
                        className="object-cover w-full h-full rounded-none transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="bg-neutral-100 w-full h-full flex items-center justify-center text-neutral-400 text-sm">
                        Missing Image
                      </div>
                    )}

                    {/* Caption Overlay */}
                    {img.caption && (
                      <div className="absolute inset-0 flex items-end justify-start opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/40 via-black/20 to-transparent">
                        <p className="text-white text-xs sm:text-sm px-3 py-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                          {img.caption}
                        </p>
                      </div>
                    )}
                  </div>
                );
              }
            )}
          </div>

          {/* LIGHTBOX */}
          {lightbox.open && (
            <Lightbox
              images={project.projectImages}
              index={lightbox.index}
              onClose={closeLightbox}
              onNext={nextImage}
              onPrev={prevImage}
            />
          )}
        </section>
      )}
    </main>
  );
}
