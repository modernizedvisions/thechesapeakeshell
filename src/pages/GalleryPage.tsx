import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchSoldProducts } from '../lib/api';
import { Product } from '../lib/types';
import { useGalleryImages } from '../lib/hooks/useGalleryImages';
import { getGallerySize, type GallerySize } from '../lib/galleryLayout';

export function GalleryPage() {
  const [soldProducts, setSoldProducts] = useState<Product[]>([]);
  const [isLoadingSold, setIsLoadingSold] = useState(true);
  const { images: galleryImages, isLoading: isLoadingGallery } = useGalleryImages();

  useEffect(() => {
    const loadSold = async () => {
      try {
        const sold = await fetchSoldProducts();
        setSoldProducts(sold);
      } catch (error) {
        console.error('Error loading gallery data:', error);
      } finally {
        setIsLoadingSold(false);
      }
    };
    loadSold();
  }, []);

  const isLoading = isLoadingGallery || isLoadingSold;
  const SIZE_CLASSES: Record<GallerySize, string> = {
    lg: 'col-span-12 md:col-span-8 lg:col-span-6 row-span-2',
    wide: 'col-span-12 md:col-span-8 lg:col-span-6 row-span-1',
    tall: 'col-span-6 md:col-span-4 lg:col-span-4 row-span-2',
    sm: 'col-span-6 md:col-span-4 lg:col-span-4 row-span-1',
  };

  return (
    <div className="py-12 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-center text-3xl md:text-4xl font-semibold uppercase tracking-wide text-slate-900 mb-2">
          Gallery
        </h1>
        <p className="text-center text-slate-600 text-sm md:text-base mb-10 font-serif">
          Explore our collection of art pieces and sold works.
        </p>
        <div className="flex justify-center mb-8">
          <Link
            to="/shop"
            className="inline-flex items-center justify-center rounded-full bg-gray-900 px-6 py-2 text-sm font-medium text-white shadow-md transition hover:bg-gray-800"
          >
            Shop The Collection
          </Link>
        </div>
        <div className="mt-8"></div>

        {isLoading ? (
          <div className="gallery-grid gallery-dense grid grid-cols-12 gap-3 md:gap-4">
            {Array.from({ length: 10 }).map((_, index) => {
              const size = getGallerySize(index);
              return (
                <div
                  key={`skeleton-${index}`}
                  className={`bg-slate-100 animate-pulse ${SIZE_CLASSES[size]}`}
                />
              );
            })}
          </div>
        ) : (
          <>
            <section className="mb-12">
              {galleryImages.length === 0 ? (
                <div className="text-gray-500">Gallery coming soon.</div>
              ) : (
                <div className="gallery-grid gallery-dense grid grid-cols-12 gap-3 md:gap-4">
                  {galleryImages.map((item, index) => {
                    const size = getGallerySize(index);
                    return (
                      <div key={item.id} className={`bg-white overflow-hidden ${SIZE_CLASSES[size]}`}>
                        <img
                          src={item.imageUrl}
                          alt={item.title || 'Gallery item'}
                          className="h-full w-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Sold Products</h2>
              {soldProducts.length === 0 ? (
                <div className="text-gray-500">No sold products yet.</div>
              ) : (
                <div className="gallery-grid gallery-dense grid grid-cols-12 gap-3 md:gap-4">
                  {soldProducts.map((item, index) => {
                    const size = getGallerySize(index);
                    return (
                      <div key={item.id} className={`bg-white overflow-hidden ${SIZE_CLASSES[size]}`}>
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="h-full w-full object-cover"
                            loading="lazy"
                            decoding="async"
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center text-gray-400 bg-slate-100">
                            No image
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </>
        )}
      </div>
    </div>
  );
}
