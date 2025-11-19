"use client";

import useEmblaCarousel from "embla-carousel-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

const slides = [
  { src: "/images/featured1.jpg", href: "/projects/project-1" },
  { src: "/images/featured2.jpg", href: "/projects/project-2" },
  { src: "/images/featured3.jpg", href: "/projects/project-3" },
];

export default function Slideshow() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, duration: 20 });

  useEffect(() => {
    if (!emblaApi) return;
    const interval = setInterval(() => emblaApi.scrollNext(), 5000);
    return () => clearInterval(interval);
  }, [emblaApi]);

  return (
    <div ref={emblaRef} className="embla overflow-hidden h-screen w-full">
      <div className="flex h-full">
        {slides.map((slide, i) => (
          <Link
            key={i}
            href={slide.href}
            className="flex-[0_0_100%] h-full relative"
          >
            <Image
              src={slide.src}
              alt={`Featured project ${i + 1}`}
              fill
              priority={i === 0}
              sizes="100vw"
              className="object-cover"
            />
          </Link>
        ))}
      </div>
    </div>
  );
}
