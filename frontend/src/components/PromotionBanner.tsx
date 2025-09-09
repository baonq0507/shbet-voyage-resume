import React, { useCallback, useEffect, useState } from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from './ui/carousel';
import Autoplay from 'embla-carousel-autoplay';

export const PromotionBanner: React.FC = () => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  const slides = [
    {
      src: '/lovable-uploads/3d744203-60a6-4f06-a3af-ef9f723dae25.png',
      alt: 'DIAMONDBET68 - Thương hiệu giải trí đỉnh cao - Banner 1',
    },
    {
      src: '/lovable-uploads/3b746ef5-0afd-4060-800b-b81351e8b86f.png',
      alt: 'DIAMONDBET68 - Nạp tiền siêu tốc - Banner 2',
    },
  ];

  // Create autoplay plugin with restart capability
  const autoplayPlugin = React.useMemo(
    () => Autoplay({ delay: 3000, stopOnMouseEnter: true, stopOnInteraction: false }),
    []
  );

  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap() + 1);

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap() + 1);
    });
  }, [api]);

  const scrollTo = useCallback((index: number) => {
    if (api) {
      api.scrollTo(index);
      // Restart autoplay after manual navigation
      autoplayPlugin.play();
    }
  }, [api, autoplayPlugin]);

  return (
    <section className="relative w-full overflow-hidden">
      <Carousel 
        setApi={setApi}
        opts={{ loop: true }} 
        plugins={[autoplayPlugin]} 
        className="w-full"
      >
        <CarouselContent>
          {slides.map((s, idx) => (
            <CarouselItem key={idx} className="px-0">
              <img
                src={s.src}
                alt={s.alt}
                loading={idx === 0 ? 'eager' : 'lazy'}
                className="w-full h-auto object-contain"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
        
        {/* Pagination Dots */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => scrollTo(index)}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                current === index + 1
                  ? 'bg-white scale-110 shadow-lg'
                  : 'bg-white/50 hover:bg-white/70'
              }`}
              aria-label={`Chuyển đến slide ${index + 1}`}
            />
          ))}
        </div>
      </Carousel>
    </section>
  );
};