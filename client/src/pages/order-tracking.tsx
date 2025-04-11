import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { formatPrice, formatRelativeDate, getEstimatedDeliveryTime } from "@/lib/utils";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";

// Order status types
type OrderStatus = "confirmed" | "packed" | "on_the_way" | "delivered";

// Status step component
interface StatusStepProps {
  status: OrderStatus;
  title: string;
  time: string;
  description: string;
  isActive: boolean;
  isComplete: boolean;
}

const StatusStep = ({ status, title, time, description, isActive, isComplete }: StatusStepProps) => {
  let iconClass = "fas ";
  
  switch (status) {
    case "confirmed":
      iconClass += "fa-check";
      break;
    case "packed":
      iconClass += "fa-box";
      break;
    case "on_the_way":
      iconClass += "fa-motorcycle";
      break;
    case "delivered":
      iconClass += "fa-check-circle";
      break;
  }
  
  return (
    <div className="relative flex mb-6">
      <div className={`w-6 h-6 rounded-full z-10 mt-0.5 flex items-center justify-center ${
        isComplete ? "bg-primary" : isActive ? "bg-primary animate-pulse-slow" : "bg-light-gray"
      }`}>
        <i className={`${iconClass} ${isComplete || isActive ? "text-white" : "text-mid-gray"} text-xs`}></i>
      </div>
      <div className="ml-4">
        <h3 className={`font-medium ${!isActive && !isComplete ? "text-mid-gray" : ""}`}>{title}</h3>
        <p className="text-xs text-mid-gray">{time}</p>
        <p className={`text-sm ${!isActive && !isComplete ? "text-mid-gray" : ""}`}>{description}</p>
      </div>
    </div>
  );
};

const OrderTracking = () => {
  const [, params] = useRoute('/orders/:id');
  const [_, navigate] = useLocation();
  
  const orderId = params?.id ? parseInt(params.id) : 1; // Default to 1 if no ID
  
  const { 
    data: order,
    isLoading,
    isError
  } = useQuery({
    queryKey: [`/api/orders/${orderId}`],
  });

  // Determine order status for UI
  const getOrderStatusIndex = (status?: string): number => {
    switch (status) {
      case "confirmed": return 0;
      case "packed": return 1;
      case "on_the_way": return 2;
      case "delivered": return 3;
      default: return 0;
    }
  };
  
  const orderStatusIndex = getOrderStatusIndex(order?.status);

  if (isLoading) {
    return (
      <>
        <Header title="Order Tracking" showBack />
        <div className="p-4 animate-pulse">
          <div className="bg-white rounded-xl shadow-custom p-3 mb-4">
            <div className="h-6 bg-light-gray rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-light-gray rounded w-3/4 mb-2"></div>
          </div>
          
          <div className="bg-white rounded-xl shadow-custom overflow-hidden mb-4">
            <div className="h-48 bg-light-gray"></div>
          </div>
          
          <div className="bg-white rounded-xl shadow-custom p-3 mb-4">
            <div className="h-6 bg-light-gray rounded w-1/3 mb-4"></div>
            <div className="h-24 bg-light-gray rounded mb-4"></div>
            <div className="h-24 bg-light-gray rounded mb-4"></div>
            <div className="h-24 bg-light-gray rounded"></div>
          </div>
        </div>
      </>
    );
  }

  if (isError || !order) {
    return (
      <>
        <Header title="Order Tracking" showBack />
        <div className="p-8 text-center">
          <p className="text-error mb-4">Failed to load order details</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Order Tracking" showBack>
        <button className="text-primary">
          <i className="fas fa-headset"></i>
        </button>
      </Header>
      
      <div className="p-4 pb-20">
        {/* Order ID and Details */}
        <div className="bg-white rounded-xl shadow-custom p-3 mb-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-medium">Order #{order.id}</h2>
            <span className="text-xs bg-primary bg-opacity-10 text-primary px-2 py-0.5 rounded-full">
              {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
            </span>
          </div>
          <div className="flex items-center text-sm text-mid-gray">
            <span>{formatRelativeDate(new Date(order.createdAt))}</span>
            <span className="mx-2">•</span>
            <span>{order.items.length} {order.items.length === 1 ? 'item' : 'items'}</span>
            <span className="mx-2">•</span>
            <span>{formatPrice(order.totalAmount)}</span>
          </div>
        </div>
        
        {/* Live Tracking Map */}
        <div className="bg-white rounded-xl shadow-custom overflow-hidden mb-4">
          <div className="h-48 bg-light-gray relative">
            {/* Map Placeholder - In a real app, this would be an actual map */}
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-mid-gray">Interactive map would go here</p>
            </div>
            
            {/* ETA */}
            <div className="absolute bottom-3 left-3 right-3 bg-white rounded-lg p-2 shadow-custom flex justify-between items-center">
              <div>
                <p className="text-xs text-mid-gray">Estimated Delivery</p>
                <p className="font-medium">
                  {order.estimatedDeliveryTime 
                    ? new Date(order.estimatedDeliveryTime).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })
                    : getEstimatedDeliveryTime(30)}
                </p>
              </div>
              <button className="bg-primary text-white text-xs px-3 py-1 rounded-full">
                Live Status
              </button>
            </div>
          </div>
        </div>
        
        {/* Order Status */}
        <div className="bg-white rounded-xl shadow-custom p-3 mb-4">
          <h2 className="font-medium mb-4">Order Status</h2>
          
          <div className="relative">
            {/* Progress Line */}
            <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-light-gray"></div>
            
            {/* Status Steps */}
            <StatusStep
              status="confirmed"
              title="Order Confirmed"
              time={order.createdAt ? new Date(order.createdAt).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              }) : "1:20 PM"}
              description="Your order has been confirmed"
              isActive={orderStatusIndex === 0}
              isComplete={orderStatusIndex > 0}
            />
            
            <StatusStep
              status="packed"
              title="Order Packed"
              time={order.updatedAt ? new Date(order.updatedAt).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              }) : "1:30 PM"}
              description={`Your order is being packed by ${order.store.name}`}
              isActive={orderStatusIndex === 1}
              isComplete={orderStatusIndex > 1}
            />
            
            <StatusStep
              status="on_the_way"
              title="On the way"
              time={`Expected by ${new Date(Date.now() + 20 * 60 * 1000).toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
              })}`}
              description="Your order will be picked up soon"
              isActive={orderStatusIndex === 2}
              isComplete={orderStatusIndex > 2}
            />
            
            <StatusStep
              status="delivered"
              title="Delivered"
              time={`Expected by ${order.estimatedDeliveryTime 
                ? new Date(order.estimatedDeliveryTime).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })
                : "2:15 PM"}`}
              description="Your order will be delivered soon"
              isActive={orderStatusIndex === 3}
              isComplete={orderStatusIndex > 3}
            />
          </div>
        </div>
        
        {/* Delivery Person */}
        <div className="bg-white rounded-xl shadow-custom p-3 mb-4">
          <h2 className="font-medium mb-3">Delivery Partner</h2>
          
          <div className="flex items-center">
            <img 
              src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d" 
              alt="Delivery Person" 
              className="w-12 h-12 rounded-full object-cover mr-3" 
            />
            <div className="flex-1">
              <h3 className="font-medium">Rahul K</h3>
              <div className="flex items-center text-xs text-mid-gray">
                <i className="fas fa-star text-accent mr-1"></i>
                <span>4.8</span>
                <span className="mx-1">•</span>
                <span>500+ deliveries</span>
              </div>
            </div>
            <div className="flex">
              <a 
                href="tel:+1234567890" 
                className="w-10 h-10 bg-light-gray rounded-full flex items-center justify-center mr-2"
              >
                <i className="fas fa-phone text-primary"></i>
              </a>
              <a 
                href="sms:+1234567890" 
                className="w-10 h-10 bg-light-gray rounded-full flex items-center justify-center"
              >
                <i className="fas fa-comment text-primary"></i>
              </a>
            </div>
          </div>
        </div>
        
        {/* Order Details */}
        <div className="bg-white rounded-xl shadow-custom p-3">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-medium">Order Summary</h2>
            <button className="text-primary text-sm">View Details</button>
          </div>
          
          {order.items.map((item) => {
            const product = item.product;
            const service = item.service;
            
            return (
              <div key={item.id} className="flex items-center border-b border-light-gray pb-3 mb-3">
                <div className="w-8 h-8 bg-light-gray rounded-md flex items-center justify-center mr-2 text-xs">
                  {item.quantity}x
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium">{product?.name || service?.name}</h3>
                  <p className="text-xs text-mid-gray">
                    {product && "Size: M • Blue"}
                    {service && `Duration: ${service.duration} mins`}
                  </p>
                </div>
                <span className="text-sm">{formatPrice(item.negotiatedPrice || item.price)}</span>
              </div>
            );
          })}
          
          <div className="flex justify-between text-sm mb-2">
            <span className="text-mid-gray">Item Total</span>
            <span>{formatPrice(order.totalAmount - (order.deliveryFee || 0) - (order.taxAmount || 0))}</span>
          </div>
          
          <div className="flex justify-between text-sm mb-2">
            <span className="text-mid-gray">Delivery Fee</span>
            <span>{formatPrice(order.deliveryFee || 49)}</span>
          </div>
          
          <div className="flex justify-between text-sm mb-3">
            <span className="text-mid-gray">Taxes & Charges</span>
            <span>{formatPrice(order.taxAmount || 29)}</span>
          </div>
          
          <div className="border-t border-light-gray pt-3">
            <div className="flex justify-between font-semibold">
              <span>Total Amount</span>
              <span className="text-primary">{formatPrice(order.totalAmount)}</span>
            </div>
            {order.discountAmount > 0 && (
              <div className="text-xs text-success text-right mt-1">
                You saved {formatPrice(order.discountAmount)} on this order
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default OrderTracking;
