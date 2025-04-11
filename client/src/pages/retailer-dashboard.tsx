import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { useIsMobile as useMobile } from "@/hooks/use-mobile";

// Tab types
type DashboardTab = "dashboard" | "products" | "orders" | "delivery" | "analytics" | "settings";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
  subtext: string;
}

const StatCard = ({ title, value, icon, color, subtext }: StatCardProps) => (
  <div className="bg-white rounded-xl shadow-custom p-4">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-mid-gray">{title}</p>
        <h3 className="text-2xl font-semibold mt-1">{value}</h3>
      </div>
      <div className={`w-10 h-10 bg-${color}-200 text-${color}-600 rounded-lg flex items-center justify-center`}>
        <i className={`fas ${icon}`}></i>
      </div>
    </div>
    <p className="text-xs text-success mt-2">
      {subtext}
    </p>
  </div>
);

const RetailerDashboard = () => {
  const [_, navigate] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const isMobile = useMobile();
  
  const [activeTab, setActiveTab] = useState<DashboardTab>("dashboard");
  const [deliveryRadius, setDeliveryRadius] = useState<number>(5);
  const [deliveryMethod, setDeliveryMethod] = useState<string>("fashgo");
  const [deliveryTime, setDeliveryTime] = useState<string>("30");
  const [minOrderValue, setMinOrderValue] = useState<string>("199");
  
  // Fetch retailer's products
  const { 
    data: products, 
    isLoading: productsLoading 
  } = useQuery({
    queryKey: ['/api/retailer/products'],
    enabled: activeTab === "dashboard" || activeTab === "products"
  });
  
  // Fetch retailer's orders
  const { 
    data: orders, 
    isLoading: ordersLoading 
  } = useQuery({
    queryKey: ['/api/retailer/orders'],
    enabled: activeTab === "dashboard" || activeTab === "orders"
  });

  // Save delivery settings
  const saveSettingsMutation = useMutation({
    mutationFn: async () => {
      // In a real app, this would update the retailer's settings
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Settings saved",
        description: "Your delivery settings have been updated"
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save settings",
        variant: "destructive"
      });
    }
  });

  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (productId: number) => {
      // In a real app, this would delete the product
      return { success: true };
    },
    onSuccess: () => {
      toast({
        title: "Product deleted",
        description: "Product has been removed from your inventory"
      });
      queryClient.invalidateQueries({ queryKey: ['/api/retailer/products'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive"
      });
    }
  });

  const handleSaveSettings = () => {
    saveSettingsMutation.mutate();
  };

  const handleDeleteProduct = (productId: number) => {
    if (window.confirm("Are you sure you want to delete this product?")) {
      deleteProductMutation.mutate(productId);
    }
  };

  // If mobile, show notice
  if (isMobile) {
    return (
      <div className="p-6 flex flex-col items-center justify-center h-screen text-center">
        <i className="fas fa-desktop text-primary text-5xl mb-4"></i>
        <h2 className="text-xl font-semibold mb-2">Retailer Dashboard</h2>
        <p className="text-mid-gray mb-4">The retailer dashboard is optimized for larger screens. Please access it from a tablet or desktop device.</p>
        <Button onClick={() => navigate("/")}>
          Go to Customer View
        </Button>
      </div>
    );
  }

  return (
    <div className="flex w-full">
      {/* Sidebar */}
      <div className="w-64 bg-white h-screen shadow-sm p-4 fixed left-0 top-0">
        <div className="flex items-center mb-8">
          <h1 className="text-2xl font-bold font-playfair text-primary">Fashgo</h1>
          <span className="ml-2 px-2 py-0.5 bg-secondary text-white text-xs rounded-md">Retailer</span>
        </div>
        
        <nav className="space-y-1">
          <a 
            href="#" 
            className={`flex items-center p-3 rounded-lg ${
              activeTab === "dashboard" 
                ? "bg-primary bg-opacity-10 text-primary" 
                : "text-mid-gray hover:bg-light-gray"
            }`}
            onClick={(e) => { e.preventDefault(); setActiveTab("dashboard"); }}
          >
            <i className="fas fa-tachometer-alt w-5"></i>
            <span className="ml-3">Dashboard</span>
          </a>
          <a 
            href="#" 
            className={`flex items-center p-3 rounded-lg ${
              activeTab === "products" 
                ? "bg-primary bg-opacity-10 text-primary" 
                : "text-mid-gray hover:bg-light-gray"
            }`}
            onClick={(e) => { e.preventDefault(); setActiveTab("products"); }}
          >
            <i className="fas fa-box w-5"></i>
            <span className="ml-3">Products</span>
          </a>
          <a 
            href="#" 
            className={`flex items-center p-3 rounded-lg ${
              activeTab === "orders" 
                ? "bg-primary bg-opacity-10 text-primary" 
                : "text-mid-gray hover:bg-light-gray"
            }`}
            onClick={(e) => { e.preventDefault(); setActiveTab("orders"); }}
          >
            <i className="fas fa-shopping-bag w-5"></i>
            <span className="ml-3">Orders</span>
          </a>
          <a 
            href="#" 
            className={`flex items-center p-3 rounded-lg ${
              activeTab === "delivery" 
                ? "bg-primary bg-opacity-10 text-primary" 
                : "text-mid-gray hover:bg-light-gray"
            }`}
            onClick={(e) => { e.preventDefault(); setActiveTab("delivery"); }}
          >
            <i className="fas fa-truck w-5"></i>
            <span className="ml-3">Delivery</span>
          </a>
          <a 
            href="#" 
            className={`flex items-center p-3 rounded-lg ${
              activeTab === "analytics" 
                ? "bg-primary bg-opacity-10 text-primary" 
                : "text-mid-gray hover:bg-light-gray"
            }`}
            onClick={(e) => { e.preventDefault(); setActiveTab("analytics"); }}
          >
            <i className="fas fa-chart-bar w-5"></i>
            <span className="ml-3">Analytics</span>
          </a>
          <a 
            href="#" 
            className={`flex items-center p-3 rounded-lg ${
              activeTab === "settings" 
                ? "bg-primary bg-opacity-10 text-primary" 
                : "text-mid-gray hover:bg-light-gray"
            }`}
            onClick={(e) => { e.preventDefault(); setActiveTab("settings"); }}
          >
            <i className="fas fa-cog w-5"></i>
            <span className="ml-3">Settings</span>
          </a>
        </nav>
        
        <div className="absolute bottom-4 left-4 right-4">
          <div className="bg-light-gray rounded-lg p-3">
            <div className="flex items-center">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb" 
                alt="Store Owner" 
                className="w-10 h-10 rounded-full object-cover" 
              />
              <div className="ml-3">
                <h3 className="text-sm font-medium">Fashion Boutique</h3>
                <p className="text-xs text-mid-gray">Store Owner</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="ml-64 w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Dashboard</h2>
          <div className="flex items-center">
            <span className="px-3 py-1 bg-success bg-opacity-10 text-success rounded-full text-sm mr-4">
              <i className="fas fa-circle text-xs mr-1"></i> Store Online
            </span>
            <div className="relative">
              <button className="relative">
                <i className="fas fa-bell text-mid-gray"></i>
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"></span>
              </button>
            </div>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-4 gap-6 mb-6">
          <StatCard 
            title="Today's Orders"
            value="12"
            icon="fa-shopping-bag"
            color="primary"
            subtext={<><i className="fas fa-arrow-up mr-1"></i> 25% from yesterday</>}
          />
          
          <StatCard 
            title="Revenue"
            value="₹15,240"
            icon="fa-rupee-sign"
            color="secondary"
            subtext={<><i className="fas fa-arrow-up mr-1"></i> 18% from last week</>}
          />
          
          <StatCard 
            title="Products"
            value="143"
            icon="fa-box"
            color="accent"
            subtext="12 out of stock"
          />
          
          <StatCard 
            title="Rating"
            value={<>4.8 <span className="text-sm text-mid-gray">/5</span></>}
            icon="fa-star"
            color="success"
            subtext="Based on 230 reviews"
          />
        </div>
        
        {/* Recent Orders */}
        <div className="bg-white rounded-xl shadow-custom p-4 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Recent Orders</h3>
            <button className="text-primary text-sm">View All</button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full min-w-full">
              <thead>
                <tr className="border-b border-light-gray">
                  <th className="text-left py-3 px-2 text-sm font-medium text-mid-gray">Order ID</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-mid-gray">Customer</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-mid-gray">Items</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-mid-gray">Amount</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-mid-gray">Status</th>
                  <th className="text-left py-3 px-2 text-sm font-medium text-mid-gray">Action</th>
                </tr>
              </thead>
              <tbody>
                {ordersLoading ? (
                  Array(4).fill(0).map((_, i) => (
                    <tr key={i} className="border-b border-light-gray">
                      <td className="py-3 px-2">
                        <div className="h-4 bg-light-gray rounded w-16 animate-pulse"></div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="h-4 bg-light-gray rounded w-24 animate-pulse"></div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="h-4 bg-light-gray rounded w-32 animate-pulse"></div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="h-4 bg-light-gray rounded w-16 animate-pulse"></div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="h-4 bg-light-gray rounded w-20 animate-pulse"></div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="h-4 bg-light-gray rounded w-8 animate-pulse"></div>
                      </td>
                    </tr>
                  ))
                ) : orders?.length ? (
                  orders.map((order) => (
                    <tr key={order.id} className="border-b border-light-gray">
                      <td className="py-3 px-2">#{order.id}</td>
                      <td className="py-3 px-2">John Doe</td>
                      <td className="py-3 px-2">
                        {order.items.map(item => 
                          item.product?.name || item.service?.name
                        ).join(", ")}
                      </td>
                      <td className="py-3 px-2">{formatPrice(order.totalAmount)}</td>
                      <td className="py-3 px-2">
                        <span className={`px-2 py-1 bg-opacity-10 rounded-full text-xs ${
                          order.status === 'delivered' ? 'bg-success text-success' : 
                          order.status === 'on_the_way' ? 'bg-warning text-warning' : 
                          'bg-primary text-primary'
                        }`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1).replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <button 
                          className="text-secondary"
                          onClick={() => navigate(`/orders/${order.id}`)}
                        >
                          <i className="fas fa-eye"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-4 text-center text-mid-gray">No orders found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Product Management and Delivery Settings */}
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-2 bg-white rounded-xl shadow-custom p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Manage Products</h3>
              <Button>
                <i className="fas fa-plus mr-1"></i> Add New
              </Button>
            </div>
            
            <div className="flex mb-4">
              <div className="relative flex-1 mr-2">
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  className="w-full py-2 pl-9 pr-3 border border-light-gray rounded-lg text-sm" 
                />
                <i className="fas fa-search absolute left-3 top-2.5 text-mid-gray"></i>
              </div>
              <button className="bg-light-gray px-3 py-2 rounded-lg">
                <i className="fas fa-filter text-mid-gray"></i>
              </button>
            </div>
            
            <div className="space-y-3">
              {productsLoading ? (
                Array(3).fill(0).map((_, i) => (
                  <div key={i} className="flex items-center border border-light-gray rounded-lg p-2">
                    <div className="w-14 h-14 bg-light-gray rounded-md animate-pulse mr-3"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-light-gray rounded w-1/3 animate-pulse mb-2"></div>
                      <div className="h-3 bg-light-gray rounded w-1/4 animate-pulse"></div>
                    </div>
                    <div className="text-right">
                      <div className="h-4 bg-light-gray rounded w-16 animate-pulse mb-2"></div>
                      <div className="h-3 bg-light-gray rounded w-24 animate-pulse"></div>
                    </div>
                    <div className="ml-4 flex space-x-2">
                      <div className="w-6 h-6 bg-light-gray rounded animate-pulse"></div>
                      <div className="w-6 h-6 bg-light-gray rounded animate-pulse"></div>
                    </div>
                  </div>
                ))
              ) : products?.length ? (
                products.map((product) => (
                  <div key={product.id} className="flex items-center border border-light-gray rounded-lg p-2">
                    <img 
                      src={product.imageUrl} 
                      alt={product.name} 
                      className="w-14 h-14 rounded-md object-cover mr-3" 
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">{product.name}</h4>
                      <div className="flex items-center text-xs text-mid-gray">
                        <span>SKU: {`PR-${product.id}`}</span>
                        <span className="mx-2">•</span>
                        <span>Stock: {product.stock}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatPrice(product.originalPrice)}</p>
                      <p className="text-xs text-success">
                        Min. Accept: {formatPrice(product.minAcceptablePrice || product.finalPrice * 0.8)}
                      </p>
                    </div>
                    <div className="ml-4 flex space-x-2">
                      <button className="text-secondary">
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        className="text-error"
                        onClick={() => handleDeleteProduct(product.id)}
                      >
                        <i className="fas fa-trash"></i>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-mid-gray">
                  No products found. Add some products to get started.
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-custom p-4">
            <h3 className="text-lg font-semibold mb-4">Delivery Settings</h3>
            
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Delivery Method</h4>
              <div className="flex items-center mb-2">
                <div 
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-2 ${
                    deliveryMethod === "fashgo" ? "border-primary" : "border-mid-gray"
                  }`}
                  onClick={() => setDeliveryMethod("fashgo")}
                >
                  {deliveryMethod === "fashgo" && <div className="w-3 h-3 rounded-full bg-primary"></div>}
                </div>
                <span className="text-sm">Fashgo Delivery</span>
              </div>
              <div className="flex items-center">
                <div 
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mr-2 ${
                    deliveryMethod === "self" ? "border-primary" : "border-mid-gray"
                  }`}
                  onClick={() => setDeliveryMethod("self")}
                >
                  {deliveryMethod === "self" && <div className="w-3 h-3 rounded-full bg-primary"></div>}
                </div>
                <span className="text-sm">Self Delivery</span>
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Delivery Radius</h4>
              <div className="relative mb-2">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={deliveryRadius}
                  onChange={(e) => setDeliveryRadius(parseInt(e.target.value))}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-mid-gray">
                  <span>1 km</span>
                  <span>{deliveryRadius} km</span>
                  <span>10 km</span>
                </div>
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Delivery Time</h4>
              <select 
                className="w-full py-2 px-3 border border-light-gray rounded-lg text-sm appearance-none bg-white"
                value={deliveryTime}
                onChange={(e) => setDeliveryTime(e.target.value)}
              >
                <option value="30">Within 30 minutes</option>
                <option value="60">30-60 minutes</option>
                <option value="120">1-2 hours</option>
              </select>
            </div>
            
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2">Minimum Order Value</h4>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-mid-gray">₹</span>
                <input 
                  type="number" 
                  value={minOrderValue}
                  onChange={(e) => setMinOrderValue(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 border border-light-gray rounded-lg text-sm" 
                />
              </div>
            </div>
            
            <Button 
              className="w-full py-2 mt-4"
              onClick={handleSaveSettings}
              disabled={saveSettingsMutation.isPending}
            >
              {saveSettingsMutation.isPending ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RetailerDashboard;
