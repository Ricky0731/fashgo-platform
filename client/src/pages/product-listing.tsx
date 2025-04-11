import { useState, useEffect } from "react";
import { useLocation, useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import ProductCard from "@/components/ui/product-card";
import { Button } from "@/components/ui/button";

const ProductListing = () => {
  const [location] = useLocation();
  const [, params] = useRoute('/products');
  
  // Parse query params
  const queryParams = new URLSearchParams(location.split('?')[1]);
  const categoryId = queryParams.get('category');
  const storeId = queryParams.get('store');
  const searchTerm = queryParams.get('search');
  
  // Active filters
  const [activeFilters, setActiveFilters] = useState<{
    category?: string;
    priceRange?: string;
    rating?: string;
    distance?: string;
  }>({});

  // Fetch products based on filters
  const { data: products, isLoading, isError } = useQuery({
    queryKey: ['/api/products', categoryId, storeId, searchTerm],
  });

  // Handle filter removal
  const removeFilter = (filterKey: string) => {
    setActiveFilters(prev => {
      const newFilters = { ...prev };
      delete newFilters[filterKey as keyof typeof prev];
      return newFilters;
    });
  };

  return (
    <>
      <Header title="Products Near You" showBack showSearch />
      
      {/* Filter Tags */}
      <div className="px-4 pb-3 flex space-x-2 overflow-x-auto no-scrollbar">
        {Object.entries(activeFilters).map(([key, value]) => (
          <span 
            key={key}
            className="bg-primary bg-opacity-10 text-primary text-xs px-3 py-1 rounded-full whitespace-nowrap"
          >
            {value} <i className="fas fa-times-circle ml-1 cursor-pointer" onClick={() => removeFilter(key)}></i>
          </span>
        ))}
        
        {/* If no active filters, show some default ones */}
        {Object.keys(activeFilters).length === 0 && (
          <>
            <span className="bg-primary bg-opacity-10 text-primary text-xs px-3 py-1 rounded-full whitespace-nowrap">
              Dresses <i className="fas fa-times-circle ml-1"></i>
            </span>
            <span className="bg-primary bg-opacity-10 text-primary text-xs px-3 py-1 rounded-full whitespace-nowrap">
              Under ₹2000 <i className="fas fa-times-circle ml-1"></i>
            </span>
            <span className="bg-primary bg-opacity-10 text-primary text-xs px-3 py-1 rounded-full whitespace-nowrap">
              4+ Rating <i className="fas fa-times-circle ml-1"></i>
            </span>
            <span className="bg-primary bg-opacity-10 text-primary text-xs px-3 py-1 rounded-full whitespace-nowrap">
              Within 2km <i className="fas fa-times-circle ml-1"></i>
            </span>
          </>
        )}
      </div>
      
      {/* Product Grid */}
      <div className="p-4 grid grid-cols-2 gap-3 pb-20">
        {isLoading ? (
          // Loading skeletons
          Array(6).fill(0).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-custom overflow-hidden">
              <div className="h-40 w-full bg-light-gray animate-pulse"></div>
              <div className="p-2">
                <div className="h-4 bg-light-gray animate-pulse rounded w-3/4"></div>
                <div className="mt-2 h-3 bg-light-gray animate-pulse rounded w-1/2"></div>
                <div className="mt-2 h-3 bg-light-gray animate-pulse rounded w-2/3"></div>
              </div>
            </div>
          ))
        ) : isError ? (
          <div className="col-span-2 text-center py-8">
            <p className="text-error mb-3">Failed to load products</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        ) : products?.length === 0 ? (
          <div className="col-span-2 text-center py-8">
            <p className="text-mid-gray mb-3">No products found matching your criteria</p>
            <Button onClick={() => window.history.back()}>Go Back</Button>
          </div>
        ) : (
          products?.map((product) => (
            <ProductCard key={product.id} product={product} showRating />
          ))
        )}
      </div>
    </>
  );
};

export default ProductListing;
