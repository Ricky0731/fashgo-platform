import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format price to currency string with rupee symbol
export function formatPrice(price: number): string {
  return `₹${price.toLocaleString('en-IN')}`;
}

// Calculate discount percentage
export function calculateDiscount(originalPrice: number, finalPrice: number): number {
  if (!originalPrice || !finalPrice || originalPrice <= 0) return 0;
  return Math.round(((originalPrice - finalPrice) / originalPrice) * 100);
}

// Calculate savings amount
export function calculateSavings(originalPrice: number, finalPrice: number): number {
  if (!originalPrice || !finalPrice || originalPrice <= 0) return 0;
  return originalPrice - finalPrice;
}

// Format distance (km)
export function formatDistance(distance: number): string {
  return `${distance.toFixed(1)} km`;
}

// Format time (minutes)
export function formatDeliveryTime(minutes: number): string {
  return `${minutes} min delivery`;
}

// Format rating
export function formatRating(rating: number, reviewCount?: number): string {
  if (reviewCount !== undefined) {
    return `${rating.toFixed(1)} (${reviewCount})`;
  }
  return rating.toFixed(1);
}

// Format date to relative time (today, yesterday, etc)
export function formatRelativeDate(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minute = 60 * 1000;
  const hour = minute * 60;
  const day = hour * 24;
  
  if (diff < minute) {
    return 'Just now';
  } else if (diff < hour) {
    const minutes = Math.floor(diff / minute);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diff < day) {
    const hours = Math.floor(diff / hour);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else if (diff < day * 2) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
  }
}

// Get estimated delivery time
export function getEstimatedDeliveryTime(deliveryMinutes: number): string {
  const now = new Date();
  const deliveryTime = new Date(now.getTime() + deliveryMinutes * 60 * 1000);
  
  const timeStr = deliveryTime.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
  
  return `${timeStr} (in ${deliveryMinutes} mins)`;
}
