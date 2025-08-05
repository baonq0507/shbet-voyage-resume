import React from 'react';

export const PromotionBanner: React.FC = () => {
  return (
    <section className="relative h-[200px] md:h-[250px] lg:h-[300px] overflow-hidden">
      <div className="absolute inset-0">
        <img 
          src="/lovable-uploads/973568b4-22dc-4593-b4a5-cf21aba80a76.png" 
          alt="DIAMONDBET68 Promotion Banner" 
          className="w-full h-full object-cover object-top"
        />
      </div>
    </section>
  );
};