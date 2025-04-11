import { Service } from "@shared/schema";
import { formatPrice, formatDistance } from "@/lib/utils";

interface ServiceCardProps {
  service: Service;
  compact?: boolean;
}

const ServiceCard = ({ service, compact = false }: ServiceCardProps) => {
  if (compact) {
    return (
      <div className="relative rounded-xl overflow-hidden h-24 cursor-pointer">
        <img 
          src={service.imageUrl} 
          alt={service.name} 
          className="w-full h-full object-cover" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
        <div className="absolute bottom-2 left-2 text-white">
          <h3 className="font-medium text-sm">{service.name}</h3>
          <p className="text-xs">20+ Services</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-custom overflow-hidden">
      <div className="relative">
        <img 
          src={service.imageUrl} 
          alt={service.name} 
          className="h-32 w-full object-cover" 
        />
        <div className="absolute top-0 right-0 bg-white bg-opacity-90 m-2 px-2 py-1 rounded-lg text-xs flex items-center">
          <i className="fas fa-star text-accent mr-1"></i>
          <span>{service.rating.toFixed(1)}</span>
          <span className="mx-1">•</span>
          <span>{formatDistance(0.5)}</span>
        </div>
      </div>
      <div className="p-3">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold">{service.name}</h3>
          <span className="text-xs bg-success bg-opacity-10 text-success px-2 py-0.5 rounded-full">
            Open Now
          </span>
        </div>
        <p className="text-xs text-mid-gray mb-3">{service.description}</p>
        
        {/* Available Services */}
        <div className="space-y-2 mb-3">
          <div className="flex justify-between items-center">
            <span className="text-sm">Haircut & Styling</span>
            <span className="text-sm font-medium">{formatPrice(499)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Basic Facial</span>
            <span className="text-sm font-medium">{formatPrice(799)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm">Manicure</span>
            <span className="text-sm font-medium">{formatPrice(399)}</span>
          </div>
        </div>
        
        {/* Available Slots */}
        <h4 className="text-sm font-medium mb-2">Available Slots</h4>
        <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2">
          <button className="min-w-max px-3 py-1 bg-white border border-primary text-primary rounded-full text-xs">
            10:00 AM
          </button>
          <button className="min-w-max px-3 py-1 bg-white border border-primary text-primary rounded-full text-xs">
            11:30 AM
          </button>
          <button className="min-w-max px-3 py-1 bg-primary text-white rounded-full text-xs">
            1:00 PM
          </button>
          <button className="min-w-max px-3 py-1 bg-white border border-primary text-primary rounded-full text-xs">
            3:30 PM
          </button>
          <button className="min-w-max px-3 py-1 bg-white border border-primary text-primary rounded-full text-xs">
            5:00 PM
          </button>
        </div>
        
        <button className="w-full py-2 bg-secondary text-white font-medium rounded-lg text-sm mt-3">
          Book Appointment
        </button>
      </div>
    </div>
  );
};

export default ServiceCard;
