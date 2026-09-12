import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductCarouselProps {
  name: string;
  image: string;
  images?: string[];
  compact?: boolean;
  autoPlay?: boolean;
  autoPlayInterval?: number; // ms
}

export const ProductCarousel: React.FC<ProductCarouselProps> = ({
  name,
  image,
  images,
  compact = false,
  autoPlay = true,
  autoPlayInterval = 3500,
}) => {
  const slides = Array.from(new Set([image, ...(images || [])].filter(Boolean)));
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);
  const hasMultipleSlides = slides.length > 1;
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const showSlide = useCallback((index: number) => {
    setActiveIndex((prev) => (index + slides.length) % slides.length);
  }, [slides.length]);

  // Défilement automatique
  useEffect(() => {
    if (!autoPlay || !hasMultipleSlides || isPaused) return;

    intervalRef.current = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length);
    }, autoPlayInterval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autoPlay, hasMultipleSlides, isPaused, autoPlayInterval, slides.length]);

  const handleTouchStart = (event: React.TouchEvent<HTMLDivElement>) => {
    setTouchStart(event.touches[0].clientX);
    setIsPaused(true);
  };

  const handleTouchEnd = (event: React.TouchEvent<HTMLDivElement>) => {
    if (touchStart === null || !hasMultipleSlides) return;
    const distance = event.changedTouches[0].clientX - touchStart;
    if (Math.abs(distance) > 40) showSlide(activeIndex + (distance < 0 ? 1 : -1));
    setTouchStart(null);
    setIsPaused(false);
  };

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Pile d'images en fondu croisé (crossfade doux) */}
      {slides.map((slide, index) => (
        <img
          key={`${slide}-${index}`}
          src={slide}
          alt={`${name} - vue ${index + 1}`}
          referrerPolicy="no-referrer"
          className={`absolute inset-0 h-full w-full object-cover object-center transition-opacity ease-in-out duration-[1200ms] ${
            index === activeIndex ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}

      {/* Léger voile dégradé en bas pour la lisibilité des points */}
      {hasMultipleSlides && (
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/25 to-transparent" />
      )}

      {hasMultipleSlides && (
        <>
          <button
            type="button"
            aria-label="Image précédente"
            onClick={(event) => {
              event.stopPropagation();
              showSlide(activeIndex - 1);
            }}
            className={`absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 text-stone-700 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-105 ${
              compact ? 'p-1.5' : 'p-2'
            }`}
          >
            <ChevronLeft className={compact ? 'h-4 w-4' : 'h-5 w-5'} />
          </button>
          <button
            type="button"
            aria-label="Image suivante"
            onClick={(event) => {
              event.stopPropagation();
              showSlide(activeIndex + 1);
            }}
            className={`absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/90 text-stone-700 shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white hover:scale-105 ${
              compact ? 'p-1.5' : 'p-2'
            }`}
          >
            <ChevronRight className={compact ? 'h-4 w-4' : 'h-5 w-5'} />
          </button>

          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-stone-900/45 px-2.5 py-1.5 backdrop-blur-sm">
            {slides.map((slide, index) => (
              <button
                key={`dot-${slide}-${index}`}
                type="button"
                aria-label={`Afficher l'image ${index + 1}`}
                onClick={(event) => {
                  event.stopPropagation();
                  showSlide(index);
                  setIsPaused(true);
                }}
                className={`h-1.5 rounded-full transition-all duration-500 ease-out ${
                  index === activeIndex ? 'w-6 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/75'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};