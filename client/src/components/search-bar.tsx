import { useState } from "react";
import { useLocation } from "wouter";

const SearchBar = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [_, navigate] = useLocation();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm)}`);
    }
  };

  return (
    <div className="px-4 pb-3">
      <form onSubmit={handleSearch} className="relative">
        <input
          type="text"
          placeholder="Search products, stores & more..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full py-2 pl-10 pr-4 bg-light-gray rounded-full text-sm focus:outline-none"
        />
        <i className="fas fa-search absolute left-4 top-2.5 text-mid-gray"></i>
        <button
          type="button"
          className="absolute right-3 top-1.5 bg-primary text-white px-2 py-1 rounded-full text-xs"
          onClick={() => navigate("/products")}
        >
          <i className="fas fa-sliders-h mr-1"></i> Filter
        </button>
      </form>
    </div>
  );
};

export default SearchBar;
