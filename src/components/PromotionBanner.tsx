import React from 'react';

export const PromotionBanner: React.FC = () => {
  return (
    <section className="relative h-[180px] sm:h-[220px] md:h-[280px] lg:h-[320px] xl:h-[360px] overflow-hidden">
      <div className="absolute inset-0">
        <img 
          src="/lovable-uploads/973568b4-22dc-4593-b4a5-cf21aba80a76.png" 
          alt="DIAMONDBET68 Promotion Banner" 
          className="w-full h-full object-cover object-center sm:object-top md:object-center"
        />
      </div>
    </section>
  );
};