import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import SearchBar from "@/components/search-bar";

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showSearch?: boolean;
  showIcons?: boolean;
  children?: React.ReactNode;
}

const Header = ({ 
  title, 
  showBack = false, 
  showSearch = false,
  showIcons = false,
  children 
}: HeaderProps) => {
  const [location, setLocation] = useLocation();

  const handleBack = () => {
    if (location.endsWith('/')) {
      setLocation("/");
    } else {
      window.history.back();
    }
  };

  return (
    <header className="sticky top-0 z-10 bg-white shadow-sm">
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          {showBack && (
            <button className="mr-3" onClick={handleBack}>
              <i className="fas fa-arrow-left"></i>
            </button>
          )}
          
          {title ? (
            <h1 className="text-lg font-semibold font-poppins">{title}</h1>
          ) : (
            <h1 className="text-2xl font-bold font-playfair text-primary">FashGo</h1>
          )}
        </div>
        
        {showIcons && (
          <div className="flex items-center space-x-3">
            <button className="text-dark focus:outline-none">
              <i className="fas fa-bell"></i>
            </button>
            <button className="text-dark focus:outline-none">
              <i className="fas fa-heart"></i>
            </button>
            <button className="w-8 h-8 rounded-full bg-light-gray text-dark flex items-center justify-center">
              <i className="fas fa-user"></i>
            </button>
          </div>
        )}

        {children}
      </div>
      
      {showSearch && <SearchBar />}
    </header>
  );
};

export default Header;
