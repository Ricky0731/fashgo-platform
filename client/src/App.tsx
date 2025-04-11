import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import ProductListing from "@/pages/product-listing";
import ProductDetail from "@/pages/product-detail";
import Cart from "@/pages/cart";
import Services from "@/pages/services";
import OrderTracking from "@/pages/order-tracking";
import RetailerDashboard from "@/pages/retailer-dashboard";
import NavigationBar from "@/components/layout/navigation-bar";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/products" component={ProductListing} />
      <Route path="/product/:id" component={ProductDetail} />
      <Route path="/cart" component={Cart} />
      <Route path="/services" component={Services} />
      <Route path="/orders/:id?" component={OrderTracking} />
      <Route path="/retailer" component={RetailerDashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="max-w-6xl mx-auto bg-white shadow-sm min-h-screen relative pb-16 md:pb-0">
        <Router />
        <NavigationBar />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
