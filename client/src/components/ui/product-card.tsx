import { useLocation } from "wouter";
import { Product } from "@shared/schema";
import { formatPrice, formatDistance } from "@/lib/utils";

interface ProductCardProps {
  product: Product;
  showRating?: boolean;
  showDistance?: boolean;
}

const ProductCard = ({ 
  product, 
  showRating = false,
  showDistance = true 
}: ProductCardProps) => {
  const [_, navigate] = useLocation();
  
  const handleClick = () => {
    navigate(`/product/${product.id}`);
  };

  const handleNegotiate = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/product/${product.id}?negotiate=true`);
  };

  return (
    <div 
      className="bg-white rounded-xl shadow-custom overflow-hidden cursor-pointer"
      onClick={handleClick}
    >
      <div className="relative">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-40 w-full object-cover"
        />
        {product.discountPercentage > 0 && (
          <span className="absolute top-2 right-2 bg-primary text-white text-xs px-2 py-0.5 rounded-full">
            {product.discountPercentage}% OFF
          </span>
        )}
      </div>
      <div className="p-2">
        <h3 className="font-medium text-sm truncate">{product.name}</h3>
        <div className="flex items-center mt-1">
          <span className="text-xs line-through text-mid-gray">
            {formatPrice(product.originalPrice)}
          </span>
          <span className="text-sm font-semibold ml-1">
            {formatPrice(product.finalPrice)}
          </span>
        </div>
        <div className="flex justify-between items-center mt-1">
          <div className="flex items-center text-xs text-mid-gray">
            {showRating && (
              <>
                <i className="fas fa-star text-accent mr-1"></i>
                <span>{product.rating.toFixed(1)}</span>
                <span className="mx-1">•</span>
              </>
            )}
            {showDistance && <span>{formatDistance(0.5)}</span>}
          </div>
          <button 
            className="bg-secondary text-white text-xs px-2 py-0.5 rounded-full"
            onClick={handleNegotiate}
          >
            Negotiate
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
