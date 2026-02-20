'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';

const testimonials = [
  { text: "Landed my first React role in 2 weeks!", author: "Sarah J.", role: "Frontend Dev" },
  { text: "The filters actually make sense for devs.", author: "Mike T.", role: "Backend Intern" },
  { text: "Love the no-nonsense application process.", author: "Elena R.", role: "Fullstack" }
];

const TestimonialCard: React.FC<{ t: typeof testimonials[0] }> = ({ t }) => (
  <div className="bg-white border-2 border-black p-4 rounded-lg shadow-neo-sm">
    <p className="text-sm font-medium italic mb-3">&quot;{t.text}&quot;</p>
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-full bg-gray-200 border border-black overflow-hidden flex items-center justify-center text-xs font-bold">
        {t.author[0]}
      </div>
      <div className="text-xs">
        <span className="font-bold block">{t.author}</span>
        <span className="text-gray-500">{t.role}</span>
      </div>
    </div>
  </div>
);

export const TestimonialStrip: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const scrollToIndex = useCallback((index: number) => {
    if (!scrollRef.current) return;
    const child = scrollRef.current.children[index] as HTMLElement;
    if (child) {
      scrollRef.current.scrollTo({ left: child.offsetLeft - 16, behavior: 'smooth' });
    }
  }, []);

  // Auto-play carousel on mobile
  useEffect(() => {
    const startAutoPlay = () => {
      autoPlayRef.current = setInterval(() => {
        setActiveIndex(prev => {
          const next = (prev + 1) % testimonials.length;
          scrollToIndex(next);
          return next;
        });
      }, 4000);
    };

    startAutoPlay();
    return () => clearInterval(autoPlayRef.current);
  }, [scrollToIndex]);

  // Sync active dot with scroll position
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const scrollLeft = container.scrollLeft;
    const cardWidth = (container.children[0] as HTMLElement)?.offsetWidth || 1;
    const index = Math.round(scrollLeft / cardWidth);
    setActiveIndex(index);

    // Reset auto-play on manual scroll
    clearInterval(autoPlayRef.current);
    autoPlayRef.current = setInterval(() => {
      setActiveIndex(prev => {
        const next = (prev + 1) % testimonials.length;
        scrollToIndex(next);
        return next;
      });
    }, 4000);
  };

  return (
    <section className="py-12 bg-indigo-50 border-y-2 border-black">
      <div className="max-w-7xl mx-auto px-4">
        {/* Desktop: grid */}
        <div className="hidden md:grid grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <TestimonialCard key={i} t={t} />
          ))}
        </div>

        {/* Mobile: carousel */}
        <div className="md:hidden">
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none', WebkitOverflowScrolling: 'touch' }}
          >
            {testimonials.map((t, i) => (
              <div key={i} className="snap-center shrink-0 w-[85%]">
                <TestimonialCard t={t} />
              </div>
            ))}
          </div>
          {/* Dot indicators */}
          <div className="flex justify-center gap-2 mt-3">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => { scrollToIndex(i); setActiveIndex(i); }}
                className={`w-2 h-2 rounded-full transition-all duration-300 ${
                  i === activeIndex ? 'bg-black w-6' : 'bg-gray-400'
                }`}
                aria-label={`Go to testimonial ${i + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
