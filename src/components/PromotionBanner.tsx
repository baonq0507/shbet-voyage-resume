import React from 'react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from './ui/carousel';
import Autoplay from 'embla-carousel-autoplay';

export const PromotionBanner: React.FC = () => {
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

  return (
    <section className="relative w-full overflow-hidden">
      <Carousel opts={{ loop: true }} plugins={[Autoplay({ delay: 3000, stopOnMouseEnter: true })]} className="w-full">
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
      </Carousel>
    </section>
  );
};