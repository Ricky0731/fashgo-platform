import { useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import CategoryItem from "@/components/ui/category-item";
import StoreCard from "@/components/ui/store-card";
import ProductCard from "@/components/ui/product-card";
import ServiceCard from "@/components/ui/service-card";
import { Button } from "@/components/ui/button";

const Home = () => {
  const [_, navigate] = useLocation();

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ['/api/categories'],
  });

  // Fetch nearby stores
  const { data: nearbyStores, isLoading: storesLoading } = useQuery({
    queryKey: ['/api/stores/nearby'],
  });
  
  // Fetch hot deals products
  const { data: hotDeals, isLoading: productsLoading } = useQuery({
    queryKey: ['/api/products/hot-deals'],
  });
  
  // Fetch beauty services
  const { data: services, isLoading: servicesLoading } = useQuery({
    queryKey: ['/api/services?type=beauty'],
  });

  return (
    <>
      <Header showSearch showIcons />

      <main className="pb-16">
        {/* Hero Banner */}
        <div className="relative h-48 bg-gradient-to-r from-primary to-secondary rounded-b-2xl overflow-hidden mb-6">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="relative h-full flex flex-col justify-center px-6 text-white">
            <h2 className="text-2xl font-bold font-poppins mb-1">Shop. Negotiate.</h2>
            <h3 className="text-xl font-semibold font-poppins mb-4">Get it in 30 mins!</h3>
            <p className="text-sm opacity-90 max-w-xs">
              Shop from local stores and get fashion delivered to your doorstep within minutes.
            </p>
            <Button 
              className="bg-white text-primary font-medium rounded-full px-5 py-2 mt-4 self-start shadow-custom"
              onClick={() => navigate("/products")}
            >
              Shop Now
            </Button>
          </div>
        </div>
        
        {/* Categories Scrollbar */}
        <div className="px-4 mb-6">
          <h2 className="text-lg font-semibold font-poppins mb-3">Shop by Category</h2>
          <div className="flex overflow-x-auto no-scrollbar gap-3 pb-2">
            {categoriesLoading ? (
              Array(5).fill(0).map((_, i) => (
                <div key={i} className="flex flex-col items-center min-w-[4.5rem]">
                  <div className="w-16 h-16 rounded-full bg-light-gray animate-pulse"></div>
                  <div className="w-12 h-3 bg-light-gray animate-pulse mt-1 rounded"></div>
                </div>
              ))
            ) : (
              categories?.map((category) => (
                <CategoryItem key={category.id} category={category} />
              ))
            )}
          </div>
        </div>
        
        {/* Near You */}
        <div className="px-4 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold font-poppins">Near You</h2>
            <button 
              className="text-primary text-sm font-medium"
              onClick={() => navigate("/products")}
            >
              View All
            </button>
          </div>
          <div className="flex overflow-x-auto no-scrollbar gap-4 pb-2">
            {storesLoading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="min-w-[200px] bg-white rounded-xl shadow-custom overflow-hidden">
                  <div className="h-28 w-full bg-light-gray animate-pulse"></div>
                  <div className="p-3">
                    <div className="h-4 bg-light-gray animate-pulse rounded w-3/4"></div>
                    <div className="mt-2 h-3 bg-light-gray animate-pulse rounded w-1/2"></div>
                    <div className="mt-2 h-3 bg-light-gray animate-pulse rounded w-2/3"></div>
                  </div>
                </div>
              ))
            ) : (
              nearbyStores?.map((store) => (
                <StoreCard key={store.id} store={store} />
              ))
            )}
          </div>
        </div>
        
        {/* Hot Deals */}
        <div className="px-4 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold font-poppins">Hot Deals</h2>
            <button 
              className="text-primary text-sm font-medium"
              onClick={() => navigate("/products")}
            >
              View All
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {productsLoading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="bg-white rounded-xl shadow-custom overflow-hidden">
                  <div className="h-40 w-full bg-light-gray animate-pulse"></div>
                  <div className="p-2">
                    <div className="h-4 bg-light-gray animate-pulse rounded w-3/4"></div>
                    <div className="mt-2 h-3 bg-light-gray animate-pulse rounded w-1/2"></div>
                    <div className="mt-2 h-3 bg-light-gray animate-pulse rounded w-2/3"></div>
                  </div>
                </div>
              ))
            ) : (
              hotDeals?.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))
            )}
          </div>
        </div>
        
        {/* Services */}
        <div className="px-4 mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-lg font-semibold font-poppins">Services</h2>
            <button 
              className="text-primary text-sm font-medium"
              onClick={() => navigate("/services")}
            >
              View All
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {servicesLoading ? (
              Array(2).fill(0).map((_, i) => (
                <div key={i} className="relative rounded-xl overflow-hidden h-24 bg-light-gray animate-pulse"></div>
              ))
            ) : (
              <>
                <div 
                  className="relative rounded-xl overflow-hidden h-24 cursor-pointer"
                  onClick={() => navigate("/services?type=beauty")}
                >
                  <img 
                    src="https://images.unsplash.com/photo-1562322140-8baeececf3df" 
                    alt="Beauty Services" 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
                  <div className="absolute bottom-2 left-2 text-white">
                    <h3 className="font-medium text-sm">Beauty</h3>
                    <p className="text-xs">20+ Services</p>
                  </div>
                </div>
                <div 
                  className="relative rounded-xl overflow-hidden h-24 cursor-pointer"
                  onClick={() => navigate("/services?type=tailoring")}
                >
                  <img 
                    src="https://images.unsplash.com/photo-1597633125097-5a9961e1f03d" 
                    alt="Tailoring Services" 
                    className="w-full h-full object-cover" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
                  <div className="absolute bottom-2 left-2 text-white">
                    <h3 className="font-medium text-sm">Tailoring</h3>
                    <p className="text-xs">15+ Services</p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
