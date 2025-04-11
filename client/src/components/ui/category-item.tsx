import { useLocation } from "wouter";
import { Category } from "@shared/schema";

interface CategoryItemProps {
  category: Category;
}

const CategoryItem = ({ category }: CategoryItemProps) => {
  const [_, navigate] = useLocation();
  
  const handleClick = () => {
    navigate(`/products?category=${category.id}`);
  };

  return (
    <div className="flex flex-col items-center min-w-[4.5rem]" onClick={handleClick}>
      <div className="w-16 h-16 rounded-full bg-light-gray flex items-center justify-center shadow-sm mb-1">
        <i className={`fas ${category.icon} text-primary text-xl`}></i>
      </div>
      <span className="text-xs text-center">{category.name}</span>
    </div>
  );
};

export default CategoryItem;
