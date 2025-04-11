import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface NavItemProps {
  icon: string;
  label: string;
  path: string;
  active: boolean;
}

const NavItem = ({ icon, label, path, active }: NavItemProps) => {
  const [_, setLocation] = useLocation();

  return (
    <button
      className={cn(
        "flex flex-col items-center py-2 px-3 border-t-2",
        active 
          ? "text-primary border-primary" 
          : "text-mid-gray border-transparent"
      )}
      onClick={() => setLocation(path)}
    >
      <i className={`fas ${icon} text-lg`}></i>
      <span className="text-xs mt-1">{label}</span>
    </button>
  );
};

const NavigationBar = () => {
  const [location] = useLocation();
  
  const isActive = (path: string) => {
    if (path === "/") return location === path;
    return location.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-light-gray md:hidden z-10">
      <div className="flex justify-around">
        <NavItem
          icon="fa-home"
          label="Home"
          path="/"
          active={isActive("/")}
        />
        <NavItem
          icon="fa-th-large"
          label="Categories"
          path="/products"
          active={isActive("/products")}
        />
        <NavItem
          icon="fa-cut"
          label="Services"
          path="/services"
          active={isActive("/services")}
        />
        <NavItem
          icon="fa-box"
          label="Orders"
          path="/orders"
          active={isActive("/orders")}
        />
        <NavItem
          icon="fa-store"
          label="Retailer"
          path="/retailer"
          active={isActive("/retailer")}
        />
      </div>
    </nav>
  );
};

export default NavigationBar;
