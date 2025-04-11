import { useLocation } from "wouter";
import { Store } from "@shared/schema";
import { formatDistance, formatDeliveryTime } from "@/lib/utils";

interface StoreCardProps {
  store: Store;
}

const StoreCard = ({ store }: StoreCardProps) => {
  const [_, navigate] = useLocation();
  
  const handleClick = () => {
    navigate(`/products?store=${store.id}`);
  };

  return (
    <div 
      className="min-w-[200px] bg-white rounded-xl shadow-custom overflow-hidden cursor-pointer"
      onClick={handleClick}
    >
      <div className="h-28 w-full bg-light-gray">
        <img 
          src={store.imageUrl} 
          alt={store.name} 
          className="h-full w-full object-cover"
        />
      </div>
      <div className="p-3">
        <h3 className="font-medium text-sm">{store.name}</h3>
        <div className="flex items-center mt-1 text-xs text-mid-gray">
          <i className="fas fa-star text-accent mr-1"></i>
          <span>{store.rating.toFixed(1)}</span>
          <span className="mx-1">•</span>
          <span>{formatDistance(store.distance || 0)}</span>
        </div>
        <div className="text-xs text-success mt-1">
          <i className="fas fa-clock mr-1"></i>
          <span>{formatDeliveryTime(store.deliveryTime || 30)}</span>
        </div>
      </div>
    </div>
  );
};

export default StoreCard;
