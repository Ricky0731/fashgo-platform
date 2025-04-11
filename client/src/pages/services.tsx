import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import Header from "@/components/layout/header";
import ServiceCard from "@/components/ui/service-card";
import { Button } from "@/components/ui/button";

type ServiceType = "beauty" | "tailoring";

const Services = () => {
  const [location] = useLocation();
  const [activeTab, setActiveTab] = useState<ServiceType>("beauty");
  const [selectedDate, setSelectedDate] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  
  // Parse query params
  useEffect(() => {
    const queryParams = new URLSearchParams(location.split('?')[1]);
    const typeParam = queryParams.get('type');
    if (typeParam === "beauty" || typeParam === "tailoring") {
      setActiveTab(typeParam);
    }
  }, [location]);

  // Fetch services based on active tab
  const { 
    data: services, 
    isLoading, 
    isError 
  } = useQuery({
    queryKey: [`/api/services?type=${activeTab}`],
  });

  // Generate dates for the next 5 days
  const getDates = () => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i < 5; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      let label = i === 0 ? "Today" : date.toLocaleDateString('en-US', { weekday: 'short' });
      
      dates.push({
        day: date.getDate(),
        label,
        date
      });
    }
    
    return dates;
  };
  
  const dates = getDates();

  // Service categories based on active tab
  const getCategories = () => {
    if (activeTab === "beauty") {
      return ["All Services", "Haircut", "Facial", "Manicure", "Waxing"];
    } else {
      return ["All Services", "Stitching", "Alterations", "Embroidery", "Custom"];
    }
  };
  
  const categories = getCategories();

  return (
    <>
      <Header title="Beauty & Tailoring" showBack>
        {/* Tab Navigation */}
        <div className="flex border-b border-light-gray mt-2 w-full">
          <button 
            className={`flex-1 py-3 font-medium ${
              activeTab === "beauty" 
                ? "text-primary border-b-2 border-primary" 
                : "text-mid-gray"
            }`}
            onClick={() => setActiveTab("beauty")}
          >
            Beauty Services
          </button>
          <button 
            className={`flex-1 py-3 font-medium ${
              activeTab === "tailoring" 
                ? "text-primary border-b-2 border-primary" 
                : "text-mid-gray"
            }`}
            onClick={() => setActiveTab("tailoring")}
          >
            Tailoring Services
          </button>
        </div>
      </Header>
      
      <div className="p-4 pb-20">
        {/* Location Bar */}
        <div className="flex items-center bg-light-gray p-2 rounded-lg mb-4">
          <i className="fas fa-map-marker-alt text-primary mr-2 ml-1"></i>
          <span className="text-sm">Near: Indiranagar, Bangalore</span>
          <button className="ml-auto text-primary text-sm">
            Change
          </button>
        </div>
        
        {/* Date Selection */}
        <div className="mb-4">
          <h2 className="text-sm font-medium mb-2">Select Date</h2>
          <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2">
            {dates.map((date, index) => (
              <button
                key={index}
                className={`min-w-[4.5rem] p-2 ${
                  selectedDate === index
                    ? "bg-primary text-white"
                    : "bg-white border border-light-gray"
                } rounded-lg flex flex-col items-center`}
                onClick={() => setSelectedDate(index)}
              >
                <span className={`text-xs ${selectedDate !== index && "text-mid-gray"}`}>
                  {date.label}
                </span>
                <span className={selectedDate !== index ? "font-medium" : "font-semibold"}>
                  {date.day}
                </span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Service Categories */}
        <div className="flex overflow-x-auto no-scrollbar gap-2 mb-4">
          {categories.map((category, index) => (
            <button
              key={index}
              className={`px-4 py-2 ${
                (index === 0 && selectedCategory === "all") || category === selectedCategory
                  ? "bg-primary text-white"
                  : "bg-white border border-light-gray text-mid-gray"
              } rounded-full whitespace-nowrap text-sm`}
              onClick={() => setSelectedCategory(index === 0 ? "all" : category)}
            >
              {category}
            </button>
          ))}
        </div>
        
        {/* Service Providers */}
        <div className="space-y-4">
          {isLoading ? (
            // Loading skeletons
            Array(2).fill(0).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-custom overflow-hidden">
                <div className="h-32 w-full bg-light-gray animate-pulse"></div>
                <div className="p-3">
                  <div className="flex justify-between mb-2">
                    <div className="h-5 bg-light-gray rounded w-1/3 animate-pulse"></div>
                    <div className="h-5 bg-light-gray rounded w-1/4 animate-pulse"></div>
                  </div>
                  <div className="h-3 bg-light-gray rounded w-3/4 animate-pulse mb-3"></div>
                  <div className="space-y-2 mb-3">
                    {Array(3).fill(0).map((_, j) => (
                      <div key={j} className="flex justify-between">
                        <div className="h-4 bg-light-gray rounded w-1/3 animate-pulse"></div>
                        <div className="h-4 bg-light-gray rounded w-1/6 animate-pulse"></div>
                      </div>
                    ))}
                  </div>
                  <div className="h-10 bg-light-gray rounded animate-pulse mt-3"></div>
                </div>
              </div>
            ))
          ) : isError ? (
            <div className="text-center py-8">
              <p className="text-error mb-3">Failed to load services</p>
              <Button onClick={() => window.location.reload()}>Try Again</Button>
            </div>
          ) : services?.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-mid-gray mb-3">No services available at the moment</p>
              <Button onClick={() => window.history.back()}>Go Back</Button>
            </div>
          ) : (
            // Service cards
            services?.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))
          )}
          
          {/* If beauty services and not loading/error, show mock beauty data */}
          {activeTab === "beauty" && !isLoading && !isError && services?.length === 0 && (
            <>
              <div className="bg-white rounded-xl shadow-custom overflow-hidden">
                <div className="relative">
                  <img 
                    src="https://images.unsplash.com/photo-1470259078422-826894b933aa" 
                    alt="Beauty Salon" 
                    className="h-32 w-full object-cover" 
                  />
                  <div className="absolute top-0 right-0 bg-white bg-opacity-90 m-2 px-2 py-1 rounded-lg text-xs flex items-center">
                    <i className="fas fa-star text-accent mr-1"></i>
                    <span>4.8</span>
                    <span className="mx-1">•</span>
                    <span>0.5 km</span>
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">Glamour Beauty Parlour</h3>
                    <span className="text-xs bg-success bg-opacity-10 text-success px-2 py-0.5 rounded-full">
                      Open Now
                    </span>
                  </div>
                  <p className="text-xs text-mid-gray mb-3">Specialized in haircuts, facials and makeup</p>
                  
                  {/* Available Services */}
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Haircut & Styling</span>
                      <span className="text-sm font-medium">₹499</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Basic Facial</span>
                      <span className="text-sm font-medium">₹799</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Manicure</span>
                      <span className="text-sm font-medium">₹399</span>
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
                  
                  <Button variant="secondary" className="w-full py-2 text-sm mt-3">
                    Book Appointment
                  </Button>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-custom overflow-hidden">
                <div className="relative">
                  <img 
                    src="https://images.unsplash.com/photo-1560066984-138dadb4c035" 
                    alt="Beauty Salon" 
                    className="h-32 w-full object-cover" 
                  />
                  <div className="absolute top-0 right-0 bg-white bg-opacity-90 m-2 px-2 py-1 rounded-lg text-xs flex items-center">
                    <i className="fas fa-star text-accent mr-1"></i>
                    <span>4.6</span>
                    <span className="mx-1">•</span>
                    <span>0.8 km</span>
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">Radiance Beauty Studio</h3>
                    <span className="text-xs bg-success bg-opacity-10 text-success px-2 py-0.5 rounded-full">
                      Open Now
                    </span>
                  </div>
                  <p className="text-xs text-mid-gray mb-3">Premium beauty services with experienced professionals</p>
                  
                  {/* Available Services */}
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Premium Haircut</span>
                      <span className="text-sm font-medium">₹699</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Advanced Facial</span>
                      <span className="text-sm font-medium">₹1,299</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Full Body Spa</span>
                      <span className="text-sm font-medium">₹1,999</span>
                    </div>
                  </div>
                  
                  {/* Available Slots */}
                  <h4 className="text-sm font-medium mb-2">Available Slots</h4>
                  <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2">
                    <button className="min-w-max px-3 py-1 bg-white border border-mid-gray text-mid-gray rounded-full text-xs opacity-50">
                      10:00 AM
                    </button>
                    <button className="min-w-max px-3 py-1 bg-white border border-primary text-primary rounded-full text-xs">
                      12:30 PM
                    </button>
                    <button className="min-w-max px-3 py-1 bg-white border border-primary text-primary rounded-full text-xs">
                      2:00 PM
                    </button>
                    <button className="min-w-max px-3 py-1 bg-white border border-primary text-primary rounded-full text-xs">
                      4:30 PM
                    </button>
                    <button className="min-w-max px-3 py-1 bg-white border border-primary text-primary rounded-full text-xs">
                      6:00 PM
                    </button>
                  </div>
                  
                  <Button variant="secondary" className="w-full py-2 text-sm mt-3">
                    Book Appointment
                  </Button>
                </div>
              </div>
            </>
          )}
          
          {/* If tailoring services and not loading/error, show tailoring data */}
          {activeTab === "tailoring" && !isLoading && !isError && services?.length === 0 && (
            <>
              <div className="bg-white rounded-xl shadow-custom overflow-hidden">
                <div className="relative">
                  <img 
                    src="https://images.unsplash.com/photo-1597633125097-5a9961e1f03d" 
                    alt="Tailoring Services" 
                    className="h-32 w-full object-cover" 
                  />
                  <div className="absolute top-0 right-0 bg-white bg-opacity-90 m-2 px-2 py-1 rounded-lg text-xs flex items-center">
                    <i className="fas fa-star text-accent mr-1"></i>
                    <span>4.7</span>
                    <span className="mx-1">•</span>
                    <span>0.7 km</span>
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">Fashion Tailors</h3>
                    <span className="text-xs bg-success bg-opacity-10 text-success px-2 py-0.5 rounded-full">
                      Open Now
                    </span>
                  </div>
                  <p className="text-xs text-mid-gray mb-3">Expert tailoring for all your clothing alterations</p>
                  
                  {/* Available Services */}
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Blouse Stitching</span>
                      <span className="text-sm font-medium">₹599</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Pants Alteration</span>
                      <span className="text-sm font-medium">₹299</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Custom Suit</span>
                      <span className="text-sm font-medium">₹4,999</span>
                    </div>
                  </div>
                  
                  {/* Available Slots */}
                  <h4 className="text-sm font-medium mb-2">Available Slots</h4>
                  <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2">
                    <button className="min-w-max px-3 py-1 bg-white border border-primary text-primary rounded-full text-xs">
                      11:00 AM
                    </button>
                    <button className="min-w-max px-3 py-1 bg-white border border-primary text-primary rounded-full text-xs">
                      1:30 PM
                    </button>
                    <button className="min-w-max px-3 py-1 bg-primary text-white rounded-full text-xs">
                      3:00 PM
                    </button>
                    <button className="min-w-max px-3 py-1 bg-white border border-primary text-primary rounded-full text-xs">
                      5:30 PM
                    </button>
                  </div>
                  
                  <Button variant="secondary" className="w-full py-2 text-sm mt-3">
                    Book Appointment
                  </Button>
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-custom overflow-hidden">
                <div className="relative">
                  <img 
                    src="https://images.unsplash.com/photo-1597633244018-0201d0158951" 
                    alt="Tailoring Services" 
                    className="h-32 w-full object-cover" 
                  />
                  <div className="absolute top-0 right-0 bg-white bg-opacity-90 m-2 px-2 py-1 rounded-lg text-xs flex items-center">
                    <i className="fas fa-star text-accent mr-1"></i>
                    <span>4.5</span>
                    <span className="mx-1">•</span>
                    <span>1.2 km</span>
                  </div>
                </div>
                <div className="p-3">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">Perfect Fit Tailoring</h3>
                    <span className="text-xs bg-success bg-opacity-10 text-success px-2 py-0.5 rounded-full">
                      Open Now
                    </span>
                  </div>
                  <p className="text-xs text-mid-gray mb-3">Personalized tailoring services for the perfect fit</p>
                  
                  {/* Available Services */}
                  <div className="space-y-2 mb-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Dress Stitching</span>
                      <span className="text-sm font-medium">₹899</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Minor Alterations</span>
                      <span className="text-sm font-medium">₹199</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Embroidery (per design)</span>
                      <span className="text-sm font-medium">₹499</span>
                    </div>
                  </div>
                  
                  {/* Available Slots */}
                  <h4 className="text-sm font-medium mb-2">Available Slots</h4>
                  <div className="flex overflow-x-auto no-scrollbar gap-2 pb-2">
                    <button className="min-w-max px-3 py-1 bg-white border border-mid-gray text-mid-gray rounded-full text-xs opacity-50">
                      9:00 AM
                    </button>
                    <button className="min-w-max px-3 py-1 bg-white border border-primary text-primary rounded-full text-xs">
                      12:00 PM
                    </button>
                    <button className="min-w-max px-3 py-1 bg-white border border-primary text-primary rounded-full text-xs">
                      2:30 PM
                    </button>
                    <button className="min-w-max px-3 py-1 bg-white border border-primary text-primary rounded-full text-xs">
                      4:00 PM
                    </button>
                    <button className="min-w-max px-3 py-1 bg-white border border-primary text-primary rounded-full text-xs">
                      6:30 PM
                    </button>
                  </div>
                  
                  <Button variant="secondary" className="w-full py-2 text-sm mt-3">
                    Book Appointment
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Services;
