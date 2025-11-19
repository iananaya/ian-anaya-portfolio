"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { urlFor } from "@/lib/sanity.image";

interface LightboxProps {
  images: any[];
  index: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export default function Lightbox({
  images,
  index,
  onClose,
  onNext,
  onPrev,
}: LightboxProps) {
  const current = images[index];

  // Keyboard navigation (← → ESC)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onNext, onPrev]);

  if (!current) return null;

  const imageUrl = current.url
    ? current.url
    : current.image
    ? urlFor(current.image).width(2400).quality(100).auto("format").url()
    : null;

  return (
    <div className="fixed inset-0 z-[999] bg-black/90 backdrop-blur-sm flex items-center justify-center">
      {/* Close Button */}
      <button
        className="absolute top-6 right-8 text-white text-3xl font-light hover:text-neutral-400 transition"
        onClick={onClose}
      >
        ×
      </button>

      {/* Navigation Buttons */}
      {images.length > 1 && (
        <>
          <button
            className="absolute left-6 text-white text-2xl font-light hover:text-neutral-400 transition"
            onClick={onPrev}
          >
            ‹
          </button>
          <button
            className="absolute right-6 text-white text-2xl font-light hover:text-neutral-400 transition"
            onClick={onNext}
          >
            ›
          </button>
        </>
      )}

      {/* Animated Image */}
      <div className="max-w-[95vw] max-h-[90vh] flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="flex flex-col items-center"
          >
            {imageUrl && (
              <Image
                src={imageUrl}
                alt={current.caption || `Image ${index + 1}`}
                width={2400}
                height={2400}
                className="object-contain w-auto h-auto max-h-[90vh] max-w-full rounded-none"
              />
            )}
            {current.caption && (
              <p className="text-sm text-neutral-300 mt-4 text-center max-w-3xl">
                {current.caption}
              </p>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
