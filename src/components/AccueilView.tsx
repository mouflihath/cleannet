import React from 'react';
import { Product } from '../types';
import { ProductCarousel } from './ProductCarousel';

interface AccueilViewProps {
  products: Product[];
  onSelectProduct: (productId: string) => void;
}

export const AccueilView: React.FC<AccueilViewProps> = ({ products, onSelectProduct }) => {
  return (
    <div className="py-8 sm:py-12 lg:py-16">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Grille de produits élégante, aérée, type catalogue de marque */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
          {products.map((product) => (
            <div
              key={product.id}
              id={`product-card-${product.id}`}
              onClick={() => onSelectProduct(product.id)}
              className="group cursor-pointer bg-white rounded-2xl border border-stone-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.07)] hover:-translate-y-0.5 transition-all duration-300 flex flex-col overflow-hidden"
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectProduct(product.id);
                }
              }}
            >
              {/* IMAGE DU PRODUIT */}
              <div className="relative aspect-[3/4] w-full bg-[#F6F6F4] overflow-hidden flex items-center justify-center">
                <ProductCarousel name={product.name} image={product.image} images={product.images} compact />
              </div>

              {/* INFORMATIONS ESSENTIELLES : NOM & PRIX */}
              <div className="p-6 text-center flex flex-col justify-center flex-grow bg-white">
                <h2 className="text-lg font-medium text-stone-900 tracking-tight mb-1 group-hover:text-stone-700 transition-colors">
                  {product.name}
                </h2>
                <p className="text-base font-normal text-stone-500 tracking-normal">
                  {product.priceFormatted}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};
