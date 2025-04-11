import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

interface DeliveryAddress {
  id: number;
  label: string;
  address: string;
  isSelected: boolean;
}

interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  isSelected: boolean;
}

const Cart = () => {
  const [_, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Initial delivery addresses
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([
    {
      id: 1,
      label: "Home",
      address: "123 Main Street, Apartment 4B, Bangalore - 560001",
      isSelected: true
    }
  ]);

  // Payment methods
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: "cod",
      name: "Cash on Delivery",
      icon: "fa-money-bill-wave",
      isSelected: true
    },
    {
      id: "gpay",
      name: "Google Pay",
      icon: "fa-google-pay",
      isSelected: false
    },
    {
      id: "card",
      name: "Credit/Debit Card",
      icon: "fa-credit-card",
      isSelected: false
    }
  ]);

  // Coupon code
  const [couponCode, setCouponCode] = useState("");

  // Fetch cart data
  const { 
    data: cart, 
    isLoading, 
    isError 
  } = useQuery({
    queryKey: ['/api/cart'],
  });

  // Update cart item quantity
  const updateCartItemMutation = useMutation({
    mutationFn: async ({ itemId, quantity }: { itemId: number, quantity: number }) => {
      const res = await apiRequest(
        'PUT',
        `/api/cart/items/${itemId}`,
        { quantity }
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update item quantity",
        variant: "destructive"
      });
    }
  });

  // Remove item from cart
  const removeCartItemMutation = useMutation({
    mutationFn: async (itemId: number) => {
      const res = await apiRequest(
        'DELETE',
        `/api/cart/items/${itemId}`,
        {}
      );
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/cart'] });
      toast({
        title: "Item removed",
        description: "Item has been removed from your cart"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive"
      });
    }
  });

  // Create order from cart
  const createOrderMutation = useMutation({
    mutationFn: async () => {
      const selectedAddress = addresses.find(addr => addr.isSelected);
      const selectedPayment = paymentMethods.find(method => method.isSelected);
      
      if (!selectedAddress) {
        throw new Error("Please select a delivery address");
      }
      
      const res = await apiRequest(
        'POST',
        '/api/orders',
        {
          storeId: cart?.items[0]?.product?.storeId || cart?.items[0]?.service?.storeId,
          paymentMethod: selectedPayment?.id || "cod",
          deliveryAddress: selectedAddress.address
        }
      );
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Order placed",
        description: "Your order has been placed successfully"
      });
      navigate(`/orders/${data.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to place order",
        variant: "destructive"
      });
    }
  });

  // Handle quantity change
  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateCartItemMutation.mutate({ itemId, quantity: newQuantity });
  };

  // Handle address selection
  const handleAddressSelect = (addressId: number) => {
    setAddresses(addresses.map(addr => ({
      ...addr,
      isSelected: addr.id === addressId
    })));
  };

  // Handle payment method selection
  const handlePaymentMethodSelect = (paymentId: string) => {
    setPaymentMethods(methods => methods.map(method => ({
      ...method,
      isSelected: method.id === paymentId
    })));
  };

  // Calculate order summary
  const calculateSummary = () => {
    if (!cart) return { subtotal: 0, deliveryFee: 0, tax: 0, total: 0, savings: 0 };
    
    const subtotal = cart.totalAmount;
    const deliveryFee = 49;
    const tax = 29;
    const total = subtotal + deliveryFee + tax;
    
    // Calculate savings (original price - negotiated/final price)
    const savings = cart.items.reduce((acc, item) => {
      if (item.product) {
        const originalPrice = item.product.originalPrice;
        const finalPrice = item.negotiatedPrice || item.product.finalPrice;
        return acc + ((originalPrice - finalPrice) * (item.quantity || 1));
      }
      return acc;
    }, 0);

    return { subtotal, deliveryFee, tax, total, savings };
  };

  const summary = calculateSummary();

  // Apply coupon
  const handleApplyCoupon = () => {
    if (!couponCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a coupon code",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Invalid coupon",
      description: "The coupon code you entered is invalid or expired",
      variant: "destructive"
    });
  };

  if (isLoading) {
    return (
      <>
        <Header title="Cart & Checkout" showBack />
        <div className="p-4 animate-pulse">
          <div className="bg-white rounded-xl shadow-custom p-3 mb-4">
            <div className="h-6 bg-light-gray rounded w-1/2 mb-4"></div>
            <div className="h-16 bg-light-gray rounded mb-3"></div>
            <div className="h-10 bg-light-gray rounded"></div>
          </div>
          <div className="bg-white rounded-xl shadow-custom p-3 mb-4">
            <div className="h-6 bg-light-gray rounded w-1/2 mb-4"></div>
            <div className="h-16 bg-light-gray rounded mb-3"></div>
          </div>
          <div className="bg-white rounded-xl shadow-custom p-3 mb-4">
            <div className="h-6 bg-light-gray rounded w-1/2 mb-4"></div>
            <div className="h-24 bg-light-gray rounded"></div>
          </div>
        </div>
      </>
    );
  }

  if (isError) {
    return (
      <>
        <Header title="Cart & Checkout" showBack />
        <div className="p-8 text-center">
          <p className="text-error mb-4">Failed to load cart</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </>
    );
  }

  if (!cart || cart.items.length === 0) {
    return (
      <>
        <Header title="Cart & Checkout" showBack />
        <div className="p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-light-gray flex items-center justify-center">
            <i className="fas fa-shopping-cart text-2xl text-mid-gray"></i>
          </div>
          <h2 className="text-lg font-medium mb-2">Your cart is empty</h2>
          <p className="text-mid-gray mb-6">Add items to your cart to continue shopping</p>
          <Button onClick={() => navigate("/")}>Continue Shopping</Button>
        </div>
      </>
    );
  }

  return (
    <>
      <Header title="Cart & Checkout" showBack />
      
      <div className="p-4 pb-32">
        {/* Cart Items */}
        <div className="bg-white rounded-xl shadow-custom p-3 mb-4">
          <h2 className="text-lg font-semibold mb-3">Your Cart ({cart.items.length} {cart.items.length === 1 ? 'item' : 'items'})</h2>
          
          {cart.items.map((item) => {
            const product = item.product;
            const service = item.service;
            const image = product?.imageUrl || service?.imageUrl;
            const name = product?.name || service?.name;
            const originalPrice = product?.originalPrice || (service?.price || 0);
            const finalPrice = item.negotiatedPrice || product?.finalPrice || (service?.price || 0);
            const savings = originalPrice - finalPrice;
            
            return (
              <div key={item.id} className="flex items-center border-b border-light-gray pb-3 mb-3">
                <img 
                  src={image} 
                  alt={name} 
                  className="w-16 h-16 object-cover rounded-lg mr-3" 
                />
                <div className="flex-1">
                  <h3 className="text-sm font-medium">{name}</h3>
                  <p className="text-xs text-mid-gray">
                    {product && `Size: ${item.size || 'M'} • Color: ${item.color || 'Blue'}`}
                    {service && `Duration: ${service.duration || 60} mins`}
                  </p>
                  <div className="flex items-center mt-1">
                    <span className="text-xs line-through text-mid-gray">{formatPrice(originalPrice)}</span>
                    <span className="text-sm font-semibold text-primary ml-1">{formatPrice(finalPrice)}</span>
                    {savings > 0 && (
                      <span className="text-xs text-success ml-2">You saved {formatPrice(savings)}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center border border-mid-gray rounded-full">
                  <button 
                    className="w-7 h-7 flex items-center justify-center text-mid-gray"
                    onClick={() => handleQuantityChange(item.id, (item.quantity || 1) - 1)}
                    disabled={updateCartItemMutation.isPending}
                  >
                    <i className="fas fa-minus"></i>
                  </button>
                  <span className="w-7 text-center">{item.quantity || 1}</span>
                  <button 
                    className="w-7 h-7 flex items-center justify-center text-mid-gray"
                    onClick={() => handleQuantityChange(item.id, (item.quantity || 1) + 1)}
                    disabled={updateCartItemMutation.isPending}
                  >
                    <i className="fas fa-plus"></i>
                  </button>
                </div>
              </div>
            );
          })}
          
          {/* Coupon */}
          <div className="flex items-center justify-between">
            <div className="flex-1 relative">
              <input 
                type="text" 
                placeholder="Enter coupon code" 
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value)}
                className="w-full py-2 px-3 border border-mid-gray rounded-lg text-sm focus:outline-none" 
              />
            </div>
            <Button
              className="ml-2"
              onClick={handleApplyCoupon}
            >
              Apply
            </Button>
          </div>
        </div>
        
        {/* Delivery Address */}
        <div className="bg-white rounded-xl shadow-custom p-3 mb-4">
          <h2 className="text-lg font-semibold mb-3">Delivery Address</h2>
          
          {addresses.map((address) => (
            <div key={address.id} className="flex items-start mb-3">
              <div 
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-0.5 mr-2 ${
                  address.isSelected ? 'border-primary' : 'border-mid-gray'
                }`}
                onClick={() => handleAddressSelect(address.id)}
              >
                {address.isSelected && <div className="w-3 h-3 rounded-full bg-primary"></div>}
              </div>
              <div>
                <h3 className="text-sm font-medium">{address.label}</h3>
                <p className="text-xs text-mid-gray">{address.address}</p>
              </div>
            </div>
          ))}
          
          <Button 
            variant="outline" 
            className="w-full py-2"
          >
            <i className="fas fa-plus mr-1"></i> Add New Address
          </Button>
        </div>
        
        {/* Payment Method */}
        <div className="bg-white rounded-xl shadow-custom p-3 mb-4">
          <h2 className="text-lg font-semibold mb-3">Payment Method</h2>
          
          {paymentMethods.map((method) => (
            <div 
              key={method.id} 
              className="flex items-center mb-3"
              onClick={() => handlePaymentMethodSelect(method.id)}
            >
              <div 
                className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-2 ${
                  method.isSelected ? 'border-primary' : 'border-mid-gray'
                }`}
              >
                {method.isSelected && <div className="w-3 h-3 rounded-full bg-primary"></div>}
              </div>
              <div className="flex items-center flex-1">
                <div className="w-10 h-10 bg-light-gray rounded-md flex items-center justify-center mr-2">
                  <i className={`fas ${method.icon} text-primary`}></i>
                </div>
                <span className="text-sm">{method.name}</span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-custom p-3 mb-4">
          <h2 className="text-lg font-semibold mb-3">Order Summary</h2>
          
          <div className="flex justify-between text-sm mb-2">
            <span className="text-mid-gray">Item Total</span>
            <span>{formatPrice(summary.subtotal)}</span>
          </div>
          
          <div className="flex justify-between text-sm mb-2">
            <span className="text-mid-gray">Delivery Fee</span>
            <span>{formatPrice(summary.deliveryFee)}</span>
          </div>
          
          <div className="flex justify-between text-sm mb-3">
            <span className="text-mid-gray">Taxes & Charges</span>
            <span>{formatPrice(summary.tax)}</span>
          </div>
          
          <div className="border-t border-light-gray pt-3">
            <div className="flex justify-between font-semibold">
              <span>Total Amount</span>
              <span className="text-primary">{formatPrice(summary.total)}</span>
            </div>
            {summary.savings > 0 && (
              <div className="text-xs text-success text-right mt-1">
                You saved {formatPrice(summary.savings)} on this order
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Checkout Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white shadow-custom p-4">
        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="text-sm text-mid-gray">Total Amount</p>
            <p className="text-lg font-bold">{formatPrice(summary.total)}</p>
          </div>
          <div className="text-xs text-mid-gray">
            <i className="fas fa-clock text-success mr-1"></i>
            <span>Delivery in 30-45 mins</span>
          </div>
        </div>
        <Button 
          className="w-full py-3" 
          onClick={() => createOrderMutation.mutate()}
          disabled={createOrderMutation.isPending}
        >
          {createOrderMutation.isPending ? "Processing..." : "Place Order"}
        </Button>
      </div>
    </>
  );
};

export default Cart;
