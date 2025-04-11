import { formatPrice } from "@/lib/utils";

interface PriceTagProps {
  originalPrice: number;
  finalPrice: number;
  size?: "sm" | "md" | "lg";
  showDiscount?: boolean;
}

const PriceTag = ({ 
  originalPrice, 
  finalPrice, 
  size = "md",
  showDiscount = false
}: PriceTagProps) => {
  const discount = Math.round(((originalPrice - finalPrice) / originalPrice) * 100);
  
  const originalPriceClasses = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base"
  };
  
  const finalPriceClasses = {
    sm: "text-sm",
    md: "text-base font-semibold",
    lg: "text-lg font-bold"
  };
  
  return (
    <div className="flex items-center">
      {originalPrice > finalPrice && (
        <span className={`line-through text-mid-gray ${originalPriceClasses[size]}`}>
          {formatPrice(originalPrice)}
        </span>
      )}
      <span className={`${finalPriceClasses[size]} ml-1 text-primary`}>
        {formatPrice(finalPrice)}
      </span>
      {showDiscount && discount > 0 && (
        <span className="text-xs text-success ml-2">
          {discount}% OFF
        </span>
      )}
    </div>
  );
};

export default PriceTag;
