import { useState, useEffect } from "react";
import { useRoute, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import PriceTag from "@/components/ui/price-tag";
import NegotiationModal from "@/components/ui/negotiation-modal";
import { formatPrice, formatDistance } from "@/lib/utils";

const ProductDetail = () => {
  const [, params] = useRoute('/product/:id');
  const [_, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const productId = params?.id ? parseInt(params.id) : 0;
  const queryParams = new URLSearchParams(window.location.search);
  const showNegotiateModal = queryParams.get('negotiate') === 'true';
  
  const [selectedSize, setSelectedSize] = useState('M');
  const [showNegotiation, setShowNegotiation] = useState(showNegotiateModal);
  const [negotiatedPrice, setNegotiatedPrice] = useState<number | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const images = ["image1", "image2", "image3", "image4"];
  
  // Fetch product details
  const { 
    data: product, 
    isLoading, 
    isError 
  } = useQuery({
    queryKey: [`/api/products/${productId}`],
    enabled: !!productId
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest(
        'POST', 
        '/api/cart/items', 
        { 
          productId, 
          quantity: 1,
          negotiatedPrice: negotiatedPrice || undefined
        }
      );
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive"
      });
    }
  });

  const handleNegotiationComplete = (finalPrice: number) => {
    setNegotiatedPrice(finalPrice);
    setShowNegotiation(false);
    
    toast({
      title: "Price negotiated",
      description: `New price: ${formatPrice(finalPrice)}`,
    });
  };

  const handleAddToCart = () => {
    addToCartMutation.mutate();
  };

  const handleBuyNow = () => {
    addToCartMutation.mutate();
    navigate('/cart');
  };

  if (isLoading) {
    return (
      <>
        <Header title="Product Details" showBack />
        <div className="p-4 animate-pulse">
          <div className="h-80 bg-light-gray mb-4"></div>
          <div className="h-6 bg-light-gray rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-light-gray rounded w-1/2 mb-4"></div>
          <div className="bg-light-gray p-3 rounded-lg mb-4 h-20"></div>
          <div className="mb-4">
            <div className="h-4 bg-light-gray rounded w-1/4 mb-2"></div>
            <div className="flex space-x-2">
              {Array(5).fill(0).map((_, i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-light-gray"></div>
              ))}
            </div>
          </div>
          <div className="flex space-x-3 mt-8">
            <div className="flex-1 h-10 bg-light-gray rounded-full"></div>
            <div className="flex-1 h-10 bg-light-gray rounded-full"></div>
          </div>
        </div>
      </>
    );
  }

  if (isError || !product) {
    return (
      <>
        <Header title="Product Details" showBack />
        <div className="p-8 text-center">
          <p className="text-error mb-4">Failed to load product details</p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Product Details" showBack>
        <div className="flex space-x-4">
          <button className="text-dark">
            <i className="far fa-heart"></i>
          </button>
          <button className="text-dark" onClick={() => navigate("/cart")}>
            <i className="fas fa-shopping-bag"></i>
          </button>
        </div>
      </Header>
      
      {/* Product Images */}
      <div className="relative">
        <div className="h-80 bg-light-gray">
          {product && (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          )}
        </div>
        <div className="absolute bottom-4 right-4 flex space-x-1">
          {images.map((_, index) => (
            <span 
              key={index}
              className={`w-2 h-2 rounded-full ${index === currentImageIndex ? 'bg-primary' : 'bg-white bg-opacity-60'}`}
              onClick={() => setCurrentImageIndex(index)}
            ></span>
          ))}
        </div>
      </div>
      
      {/* Product Info */}
      <div className="p-4">
        {product && (
          <>
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-xl font-semibold font-poppins">{product.name}</h2>
              <div className="flex items-center text-sm">
                <i className="fas fa-star text-accent mr-1"></i>
                <span>{product.rating.toFixed(1)}</span>
                <span className="text-xs text-mid-gray ml-1">({product.reviewCount})</span>
              </div>
            </div>
            
            <p className="text-sm text-mid-gray mb-4">
              {product.description}
            </p>
            
            {/* Price Section */}
            <div className="bg-light-gray p-3 rounded-lg mb-4">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-xs text-mid-gray">MRP</p>
                  <p className="text-lg line-through text-mid-gray">{formatPrice(product.originalPrice)}</p>
                </div>
                <div>
                  <p className="text-xs text-success">Discount</p>
                  <p className="text-lg text-success">{product.discountPercentage}%</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-primary">Final Price</p>
                  <p className="text-xl font-bold text-primary">
                    {formatPrice(negotiatedPrice || product.finalPrice)}
                  </p>
                </div>
              </div>
            </div>
          </>
        )}
        
        {/* Size Selection */}
        <div className="mb-4">
          <h3 className="text-sm font-medium mb-2">Select Size</h3>
          <div className="flex space-x-2">
            {['XS', 'S', 'M', 'L', 'XL'].map((size) => (
              <button 
                key={size}
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm ${
                  selectedSize === size 
                    ? 'bg-primary text-white border border-primary' 
                    : 'border border-mid-gray text-mid-gray'
                }`}
                onClick={() => setSelectedSize(size)}
              >
                {size}
              </button>
            ))}
          </div>
        </div>
        
        {/* Store Info */}
        {product.store && (
          <div className="flex items-center justify-between p-3 bg-light-gray rounded-lg mb-4">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mr-3">
                <i className="fas fa-store text-primary"></i>
              </div>
              <div>
                <h3 className="text-sm font-medium">{product.store.name}</h3>
                <p className="text-xs text-mid-gray">{formatDistance(product.store.distance || 0)} away</p>
              </div>
            </div>
            <div className="text-xs text-success">
              <i className="fas fa-clock mr-1"></i>
              <span>{product.store.deliveryTime || 30} min delivery</span>
            </div>
          </div>
        )}
        
        {/* Negotiate Price */}
        <div className="mb-6">
          <Button 
            variant="secondary"
            className="w-full py-3 mb-3 flex items-center justify-center"
            onClick={() => setShowNegotiation(true)}
          >
            <i className="fas fa-comments-dollar mr-2"></i>
            {negotiatedPrice ? "Re-Negotiate Price" : "Negotiate Price"}
          </Button>
          
          <div className="grid grid-cols-2 gap-3">
            <Button 
              variant="outline"
              className="py-3 border border-primary text-primary"
              onClick={handleAddToCart}
              disabled={addToCartMutation.isPending}
            >
              Add to Cart
            </Button>
            <Button 
              className="py-3"
              onClick={handleBuyNow}
              disabled={addToCartMutation.isPending}
            >
              Buy Now
            </Button>
          </div>
        </div>
      </div>
      
      {/* Negotiation Modal */}
      {product && (
        <NegotiationModal
          isOpen={showNegotiation}
          onClose={() => setShowNegotiation(false)}
          productId={productId}
          originalPrice={product.originalPrice}
          finalPrice={product.finalPrice}
          onNegotiationComplete={handleNegotiationComplete}
        />
      )}
    </>
  );
};

export default ProductDetail;
