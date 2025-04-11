import { 
  users, User, InsertUser,
  stores, Store, InsertStore,
  categories, Category, InsertCategory,
  products, Product, InsertProduct,
  services, Service, InsertService,
  orders, Order, InsertOrder,
  orderItems, OrderItem, InsertOrderItem,
  carts, Cart, InsertCart,
  cartItems, CartItem, InsertCartItem
} from "@shared/schema";

// Product with store information
export interface ProductWithStore extends Product {
  store: Store;
}

// Order with items and store information
export interface OrderWithDetails extends Order {
  items: (OrderItem & { product?: Product; service?: Service })[];
  store: Store;
}

// Cart with items and product/service details
export interface CartWithItems {
  id: number;
  userId: number;
  items: (CartItem & { 
    product?: Product & { store?: Store }; 
    service?: Service & { store?: Store }; 
  })[];
  totalAmount: number;
}

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Category methods
  getAllCategories(): Promise<Category[]>;
  getCategoryById(id: number): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;

  // Store methods
  getAllStores(): Promise<Store[]>;
  getNearbyStores(): Promise<Store[]>;
  getStoreById(id: number): Promise<Store | undefined>;
  createStore(store: InsertStore): Promise<Store>;

  // Product methods
  getAllProducts(filters?: { categoryId?: number, storeId?: number }): Promise<Product[]>;
  getHotDeals(): Promise<Product[]>;
  getProductById(id: number): Promise<ProductWithStore | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  getStoreProducts(storeId: number): Promise<Product[]>;
  
  // Price negotiation
  negotiatePrice(productId: number, offerPrice: number): Promise<{
    accepted: boolean;
    counterOffer?: number;
    finalPrice: number;
  }>;

  // Service methods
  getAllServices(type?: string): Promise<Service[]>;
  getServiceById(id: number): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;

  // Cart methods
  getCartWithItems(userId: number): Promise<CartWithItems>;
  addToCart(userId: number, item: {
    productId?: number;
    serviceId?: number;
    quantity?: number;
    negotiatedPrice?: number;
  }): Promise<CartItem>;
  updateCartItem(cartItemId: number, quantity: number): Promise<CartItem>;
  removeFromCart(cartItemId: number): Promise<void>;

  // Order methods
  getUserOrders(userId: number): Promise<Order[]>;
  getStoreOrders(storeId: number): Promise<Order[]>;
  getOrderById(id: number): Promise<OrderWithDetails | undefined>;
  createOrderFromCart(userId: number, orderData: {
    storeId: number;
    paymentMethod?: string;
    deliveryAddress: string;
  }): Promise<Order>;
  updateOrderStatus(orderId: number, status: string): Promise<Order>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private categories: Map<number, Category>;
  private stores: Map<number, Store>;
  private products: Map<number, Product>;
  private services: Map<number, Service>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem>;
  private carts: Map<number, Cart>;
  private cartItems: Map<number, CartItem>;
  
  private userCurrentId: number;
  private categoryCurrentId: number;
  private storeCurrentId: number;
  private productCurrentId: number;
  private serviceCurrentId: number;
  private orderCurrentId: number;
  private orderItemCurrentId: number;
  private cartCurrentId: number;
  private cartItemCurrentId: number;

  constructor() {
    this.users = new Map();
    this.categories = new Map();
    this.stores = new Map();
    this.products = new Map();
    this.services = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.carts = new Map();
    this.cartItems = new Map();

    this.userCurrentId = 1;
    this.categoryCurrentId = 1;
    this.storeCurrentId = 1;
    this.productCurrentId = 1;
    this.serviceCurrentId = 1;
    this.orderCurrentId = 1;
    this.orderItemCurrentId = 1;
    this.cartCurrentId = 1;
    this.cartItemCurrentId = 1;

    // Initialize with some sample data
    this.initializeData();
  }

  private initializeData(): void {
    // Create a regular user
    this.createUser({
      username: "user",
      password: "password",
      name: "John Doe",
      phone: "1234567890",
      email: "user@example.com",
      address: "123 Main St, City",
      isRetailer: false
    });

    // Create a retailer user
    const retailer = this.createUser({
      username: "retailer",
      password: "password",
      name: "Fashion Boutique",
      phone: "9876543210",
      email: "retailer@example.com",
      address: "456 Fashion St, City",
      isRetailer: true
    });

    // Create categories
    const clothing = this.createCategory({ name: "Clothing", icon: "fa-tshirt" });
    const footwear = this.createCategory({ name: "Footwear", icon: "fa-shoe-prints" });
    const accessories = this.createCategory({ name: "Accessories", icon: "fa-gem" });
    const beauty = this.createCategory({ name: "Beauty", icon: "fa-spray-can" });
    const tailoring = this.createCategory({ name: "Tailoring", icon: "fa-cut" });
    const menswear = this.createCategory({ name: "Men's Fashion", icon: "fa-male" });
    const womenswear = this.createCategory({ name: "Women's Fashion", icon: "fa-female" });

    // Create stores
    const store1 = this.createStore({
      userId: retailer.id,
      name: "Trendy Fashion Hub",
      description: "Latest fashion trends for all occasions",
      address: "123 Fashion St, City",
      rating: 4.7,
      reviewCount: 156,
      latitude: 12.9716,
      longitude: 77.5946,
      distance: 0.4,
      deliveryTime: 25,
      imageUrl: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04"
    });

    const store2 = this.createStore({
      userId: retailer.id,
      name: "Fashion Boutique",
      description: "Premium fashion with personalized service",
      address: "456 Style Ave, City",
      rating: 4.5,
      reviewCount: 124,
      latitude: 12.9769,
      longitude: 77.6014,
      distance: 0.8,
      deliveryTime: 30,
      imageUrl: "https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5"
    });

    const store3 = this.createStore({
      userId: retailer.id,
      name: "Style Avenue",
      description: "Affordable and trendy fashion for everyone",
      address: "789 Fashion Blvd, City",
      rating: 4.2,
      reviewCount: 98,
      latitude: 12.9780,
      longitude: 77.6108,
      distance: 1.2,
      deliveryTime: 35,
      imageUrl: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a"
    });

    // Create products
    this.createProduct({
      storeId: store1.id,
      categoryId: clothing.id,
      name: "Summer Floral Dress",
      description: "Light and airy floral dress perfect for summer outings",
      originalPrice: 1999,
      discountPercentage: 20,
      finalPrice: 1599,
      minAcceptablePrice: 1299,
      stock: 15,
      rating: 4.5,
      reviewCount: 28,
      imageUrl: "https://images.unsplash.com/photo-1525507119028-ed4c629a60a3"
    });

    this.createProduct({
      storeId: store2.id,
      categoryId: clothing.id,
      name: "Premium Denim Jacket",
      description: "High-quality denim jacket with comfortable fit",
      originalPrice: 2499,
      discountPercentage: 15,
      finalPrice: 2124,
      minAcceptablePrice: 1899,
      stock: 10,
      rating: 4.6,
      reviewCount: 36,
      imageUrl: "https://images.unsplash.com/photo-1543076447-215ad9ba6923"
    });

    this.createProduct({
      storeId: store3.id,
      categoryId: footwear.id,
      name: "Canvas Sneakers",
      description: "Comfortable canvas sneakers for everyday wear",
      originalPrice: 1299,
      discountPercentage: 25,
      finalPrice: 974,
      minAcceptablePrice: 799,
      stock: 20,
      rating: 4.3,
      reviewCount: 42,
      imageUrl: "https://images.unsplash.com/photo-1603344797033-f0f4f587ab60"
    });

    this.createProduct({
      storeId: store1.id,
      categoryId: accessories.id,
      name: "Leather Crossbody Bag",
      description: "Stylish leather crossbody bag with multiple compartments",
      originalPrice: 3499,
      discountPercentage: 10,
      finalPrice: 3149,
      minAcceptablePrice: 2799,
      stock: 8,
      rating: 4.7,
      reviewCount: 19,
      imageUrl: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea"
    });

    this.createProduct({
      storeId: store2.id,
      categoryId: clothing.id,
      name: "Floral Maxi Dress",
      description: "Elegant floral maxi dress for special occasions",
      originalPrice: 1899,
      discountPercentage: 20,
      finalPrice: 1519,
      minAcceptablePrice: 1299,
      stock: 12,
      rating: 4.5,
      reviewCount: 31,
      imageUrl: "https://images.unsplash.com/photo-1595777457583-95e059d581b8"
    });

    this.createProduct({
      storeId: store3.id,
      categoryId: clothing.id,
      name: "Summer Wrap Dress",
      description: "Comfortable wrap dress for summer days",
      originalPrice: 1699,
      discountPercentage: 15,
      finalPrice: 1444,
      minAcceptablePrice: 1199,
      stock: 14,
      rating: 4.3,
      reviewCount: 27,
      imageUrl: "https://images.unsplash.com/photo-1562572159-4efc207f5aff"
    });

    this.createProduct({
      storeId: store1.id,
      categoryId: clothing.id,
      name: "Floral Print Midi Dress",
      description: "Beautiful floral midi dress for casual wear",
      originalPrice: 1499,
      discountPercentage: 10,
      finalPrice: 1349,
      minAcceptablePrice: 1099,
      stock: 18,
      rating: 4.7,
      reviewCount: 34,
      imageUrl: "https://images.unsplash.com/photo-1617019114583-affb34d1b3cd"
    });

    this.createProduct({
      storeId: store2.id,
      categoryId: clothing.id,
      name: "Embroidered Sundress",
      description: "Beautiful embroidered sundress with adjustable straps",
      originalPrice: 1999,
      discountPercentage: 25,
      finalPrice: 1499,
      minAcceptablePrice: 1199,
      stock: 10,
      rating: 4.6,
      reviewCount: 22,
      imageUrl: "https://images.unsplash.com/photo-1623609163859-ca93d401e835"
    });

    // Men's formal shirts
    this.createProduct({
      storeId: store1.id,
      categoryId: menswear.id,
      name: "Crisp White Formal Shirt",
      description: "Premium cotton white formal shirt for a polished look",
      originalPrice: 1799,
      discountPercentage: 15,
      finalPrice: 1529,
      minAcceptablePrice: 1299,
      stock: 25,
      rating: 4.7,
      reviewCount: 48,
      imageUrl: "https://images.unsplash.com/photo-1603252109303-2751441dd157"
    });

    this.createProduct({
      storeId: store2.id,
      categoryId: menswear.id,
      name: "Blue Striped Formal Shirt",
      description: "Elegant blue striped formal shirt for office and special occasions",
      originalPrice: 1899,
      discountPercentage: 10,
      finalPrice: 1709,
      minAcceptablePrice: 1499,
      stock: 18,
      rating: 4.5,
      reviewCount: 32,
      imageUrl: "https://images.unsplash.com/photo-1607345366928-199ea26cfe3e"
    });

    // Men's formal pants
    this.createProduct({
      storeId: store3.id,
      categoryId: menswear.id,
      name: "Classic Black Trousers",
      description: "Tailored black formal trousers with perfect fit and comfort",
      originalPrice: 2499,
      discountPercentage: 20,
      finalPrice: 1999,
      minAcceptablePrice: 1799,
      stock: 15,
      rating: 4.8,
      reviewCount: 37,
      imageUrl: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a"
    });

    this.createProduct({
      storeId: store1.id,
      categoryId: menswear.id,
      name: "Navy Blue Slim Fit Pants",
      description: "Modern navy blue slim fit formal pants for a stylish look",
      originalPrice: 2299,
      discountPercentage: 15,
      finalPrice: 1954,
      minAcceptablePrice: 1699,
      stock: 12,
      rating: 4.6,
      reviewCount: 29,
      imageUrl: "https://images.unsplash.com/photo-1584865288642-42078afe6942"
    });

    // Women's accessories
    this.createProduct({
      storeId: store2.id,
      categoryId: womenswear.id,
      name: "Pearl Necklace Set",
      description: "Elegant pearl necklace and earring set for special occasions",
      originalPrice: 3499,
      discountPercentage: 10,
      finalPrice: 3149,
      minAcceptablePrice: 2899,
      stock: 8,
      rating: 4.9,
      reviewCount: 26,
      imageUrl: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f"
    });

    this.createProduct({
      storeId: store3.id,
      categoryId: womenswear.id,
      name: "Designer Silk Scarf",
      description: "Luxury silk scarf with beautiful prints for a touch of elegance",
      originalPrice: 1999,
      discountPercentage: 5,
      finalPrice: 1899,
      minAcceptablePrice: 1699,
      stock: 10,
      rating: 4.7,
      reviewCount: 18,
      imageUrl: "https://images.unsplash.com/photo-1584917865442-de89df76afd3"
    });

    // Unisex sneakers
    this.createProduct({
      storeId: store1.id,
      categoryId: footwear.id,
      name: "Urban White Sneakers",
      description: "Trendy white sneakers for casual everyday wear",
      originalPrice: 2499,
      discountPercentage: 20,
      finalPrice: 1999,
      minAcceptablePrice: 1799,
      stock: 20,
      rating: 4.6,
      reviewCount: 52,
      imageUrl: "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77"
    });

    this.createProduct({
      storeId: store2.id,
      categoryId: footwear.id,
      name: "Sports Performance Sneakers",
      description: "High-performance sports sneakers with advanced comfort technology",
      originalPrice: 3499,
      discountPercentage: 15,
      finalPrice: 2974,
      minAcceptablePrice: 2699,
      stock: 15,
      rating: 4.8,
      reviewCount: 64,
      imageUrl: "https://images.unsplash.com/photo-1542291026-7eec264c27ff"
    });

    // Men's accessories
    this.createProduct({
      storeId: store3.id,
      categoryId: accessories.id,
      name: "Classic Leather Wallet",
      description: "Premium genuine leather wallet with multiple compartments",
      originalPrice: 1299,
      discountPercentage: 10,
      finalPrice: 1169,
      minAcceptablePrice: 999,
      stock: 25,
      rating: 4.5,
      reviewCount: 38,
      imageUrl: "https://images.unsplash.com/photo-1627123424574-724758594e93"
    });

    this.createProduct({
      storeId: store1.id,
      categoryId: accessories.id,
      name: "Stainless Steel Watch",
      description: "Elegant stainless steel watch for a sophisticated look",
      originalPrice: 4999,
      discountPercentage: 20,
      finalPrice: 3999,
      minAcceptablePrice: 3599,
      stock: 8,
      rating: 4.8,
      reviewCount: 45,
      imageUrl: "https://images.unsplash.com/photo-1542496658-e33a6d0d50f6"
    });

    // Create services
    this.createService({
      storeId: store1.id,
      name: "Glamour Beauty Parlour",
      description: "Specialized in haircuts, facials, and makeup",
      type: "beauty",
      price: 499,
      duration: 60,
      rating: 4.8,
      reviewCount: 112,
      imageUrl: "https://images.unsplash.com/photo-1470259078422-826894b933aa"
    });

    this.createService({
      storeId: store2.id,
      name: "Radiance Beauty Studio",
      description: "Premium beauty services with experienced professionals",
      type: "beauty",
      price: 699,
      duration: 90,
      rating: 4.6,
      reviewCount: 98,
      imageUrl: "https://images.unsplash.com/photo-1560066984-138dadb4c035"
    });

    this.createService({
      storeId: store3.id,
      name: "Fashion Tailors",
      description: "Expert tailoring for all your clothing alterations",
      type: "tailoring",
      price: 299,
      duration: 45,
      rating: 4.7,
      reviewCount: 87,
      imageUrl: "https://images.unsplash.com/photo-1597633125097-5a9961e1f03d"
    });

    this.createService({
      storeId: store1.id,
      name: "Perfect Fit Tailoring",
      description: "Personalized tailoring services for the perfect fit",
      type: "tailoring",
      price: 399,
      duration: 60,
      rating: 4.5,
      reviewCount: 76,
      imageUrl: "https://images.unsplash.com/photo-1597633244018-0201d0158951"
    });

    // Create a cart for the user
    this.getOrCreateCart(1);

    // Create an order for the user
    const order = this.createOrder({
      userId: 1,
      storeId: store2.id,
      status: "packed",
      totalAmount: 1377,
      deliveryFee: 49,
      taxAmount: 29,
      discountAmount: 700,
      paymentMethod: "cod",
      deliveryAddress: "123 Main St, City",
      estimatedDeliveryTime: new Date(Date.now() + 30 * 60 * 1000) // 30 mins from now
    });

    // Add item to the order
    this.createOrderItem({
      orderId: order.id,
      productId: 8,
      quantity: 1,
      price: 1999,
      negotiatedPrice: 1299,
      totalPrice: 1299
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  // Category methods
  async getAllCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async getCategoryById(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.categoryCurrentId++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }

  // Store methods
  async getAllStores(): Promise<Store[]> {
    return Array.from(this.stores.values());
  }

  async getNearbyStores(): Promise<Store[]> {
    // Sort by distance and return the closest stores
    return Array.from(this.stores.values())
      .sort((a, b) => (a.distance || 0) - (b.distance || 0))
      .slice(0, 5);
  }

  async getStoreById(id: number): Promise<Store | undefined> {
    return this.stores.get(id);
  }

  async createStore(insertStore: InsertStore): Promise<Store> {
    const id = this.storeCurrentId++;
    const store: Store = { ...insertStore, id };
    this.stores.set(id, store);
    return store;
  }

  // Product methods
  async getAllProducts(filters?: { categoryId?: number, storeId?: number }): Promise<Product[]> {
    let products = Array.from(this.products.values());
    
    if (filters) {
      if (filters.categoryId) {
        products = products.filter(p => p.categoryId === filters.categoryId);
      }
      if (filters.storeId) {
        products = products.filter(p => p.storeId === filters.storeId);
      }
    }
    
    return products;
  }

  async getHotDeals(): Promise<Product[]> {
    // Return products with highest discount percentage
    return Array.from(this.products.values())
      .sort((a, b) => (b.discountPercentage || 0) - (a.discountPercentage || 0))
      .slice(0, 4);
  }

  async getProductById(id: number): Promise<ProductWithStore | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const store = await this.getStoreById(product.storeId);
    return { ...product, store: store! };
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.productCurrentId++;
    const product: Product = { ...insertProduct, id };
    this.products.set(id, product);
    return product;
  }

  async getStoreProducts(storeId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.storeId === storeId);
  }

  // Price negotiation
  async negotiatePrice(productId: number, offerPrice: number): Promise<{
    accepted: boolean;
    counterOffer?: number;
    finalPrice: number;
  }> {
    const product = await this.getProductById(productId);
    if (!product) {
      throw new Error("Product not found");
    }

    const minAcceptablePrice = product.minAcceptablePrice || product.finalPrice * 0.8;
    
    if (offerPrice >= minAcceptablePrice) {
      return {
        accepted: true,
        finalPrice: offerPrice
      };
    } else {
      return {
        accepted: false,
        counterOffer: minAcceptablePrice,
        finalPrice: minAcceptablePrice
      };
    }
  }

  // Service methods
  async getAllServices(type?: string): Promise<Service[]> {
    let services = Array.from(this.services.values());
    
    if (type) {
      services = services.filter(s => s.type === type);
    }
    
    return services;
  }

  async getServiceById(id: number): Promise<Service | undefined> {
    return this.services.get(id);
  }

  async createService(insertService: InsertService): Promise<Service> {
    const id = this.serviceCurrentId++;
    const service: Service = { ...insertService, id };
    this.services.set(id, service);
    return service;
  }

  // Cart methods
  private async getOrCreateCart(userId: number): Promise<Cart> {
    const existingCart = Array.from(this.carts.values()).find(c => c.userId === userId);
    
    if (existingCart) {
      return existingCart;
    }
    
    const id = this.cartCurrentId++;
    const cart: Cart = { id, userId, createdAt: new Date(), updatedAt: new Date() };
    this.carts.set(id, cart);
    return cart;
  }

  async getCartWithItems(userId: number): Promise<CartWithItems> {
    const cart = await this.getOrCreateCart(userId);
    const items = Array.from(this.cartItems.values())
      .filter(item => item.cartId === cart.id)
      .map(async (item) => {
        let extendedItem: any = { ...item };
        
        if (item.productId) {
          const product = await this.getProductById(item.productId);
          extendedItem.product = product;
        }
        
        if (item.serviceId) {
          const service = await this.getServiceById(item.serviceId);
          if (service) {
            const store = await this.getStoreById(service.storeId);
            extendedItem.service = { ...service, store };
          }
        }
        
        return extendedItem;
      });

    const resolvedItems = await Promise.all(items);
    
    // Calculate total amount
    let totalAmount = 0;
    for (const item of resolvedItems) {
      const price = item.negotiatedPrice || 
        (item.product ? item.product.finalPrice : 0) || 
        (item.service ? item.service.price : 0);
      totalAmount += price * (item.quantity || 1);
    }

    return {
      id: cart.id,
      userId: cart.userId,
      items: resolvedItems,
      totalAmount
    };
  }

  async addToCart(userId: number, item: {
    productId?: number;
    serviceId?: number;
    quantity?: number;
    negotiatedPrice?: number;
  }): Promise<CartItem> {
    const cart = await this.getOrCreateCart(userId);
    
    // Check if the item already exists in the cart
    const existingItem = Array.from(this.cartItems.values()).find(
      ci => ci.cartId === cart.id && 
           ci.productId === item.productId && 
           ci.serviceId === item.serviceId
    );
    
    if (existingItem) {
      // Update the quantity
      existingItem.quantity = (existingItem.quantity || 1) + (item.quantity || 1);
      if (item.negotiatedPrice) {
        existingItem.negotiatedPrice = item.negotiatedPrice;
      }
      return existingItem;
    }
    
    // Add new item to cart
    const id = this.cartItemCurrentId++;
    const cartItem: CartItem = {
      id,
      cartId: cart.id,
      productId: item.productId,
      serviceId: item.serviceId,
      quantity: item.quantity || 1,
      negotiatedPrice: item.negotiatedPrice
    };
    
    this.cartItems.set(id, cartItem);
    return cartItem;
  }

  async updateCartItem(cartItemId: number, quantity: number): Promise<CartItem> {
    const cartItem = this.cartItems.get(cartItemId);
    if (!cartItem) {
      throw new Error("Cart item not found");
    }
    
    cartItem.quantity = quantity;
    return cartItem;
  }

  async removeFromCart(cartItemId: number): Promise<void> {
    this.cartItems.delete(cartItemId);
  }

  // Order methods
  async getUserOrders(userId: number): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter(order => order.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getStoreOrders(storeId: number): Promise<Order[]> {
    return Array.from(this.orders.values())
      .filter(order => order.storeId === storeId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getOrderById(id: number): Promise<OrderWithDetails | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;

    const store = await this.getStoreById(order.storeId);
    if (!store) return undefined;

    const orderItems = Array.from(this.orderItems.values())
      .filter(item => item.orderId === id)
      .map(async (item) => {
        let extendedItem: any = { ...item };
        
        if (item.productId) {
          const product = await this.getProductById(item.productId);
          extendedItem.product = product;
        }
        
        if (item.serviceId) {
          const service = await this.getServiceById(item.serviceId);
          extendedItem.service = service;
        }
        
        return extendedItem;
      });

    const resolvedItems = await Promise.all(orderItems);

    return {
      ...order,
      items: resolvedItems,
      store
    };
  }

  private createOrder(insertOrder: InsertOrder): Order {
    const id = this.orderCurrentId++;
    const now = new Date();
    const order: Order = { 
      ...insertOrder, 
      id,
      createdAt: now,
      updatedAt: now
    };
    this.orders.set(id, order);
    return order;
  }

  private createOrderItem(insertOrderItem: InsertOrderItem): OrderItem {
    const id = this.orderItemCurrentId++;
    const orderItem: OrderItem = { ...insertOrderItem, id };
    this.orderItems.set(id, orderItem);
    return orderItem;
  }

  async createOrderFromCart(userId: number, orderData: {
    storeId: number;
    paymentMethod?: string;
    deliveryAddress: string;
  }): Promise<Order> {
    const cart = await this.getCartWithItems(userId);
    
    if (cart.items.length === 0) {
      throw new Error("Cart is empty");
    }
    
    // Create the order
    const order = this.createOrder({
      userId,
      storeId: orderData.storeId,
      status: "confirmed",
      totalAmount: cart.totalAmount,
      deliveryFee: 49,
      taxAmount: 29,
      discountAmount: 0, // Calculate based on original vs negotiated prices
      paymentMethod: orderData.paymentMethod || "cod",
      deliveryAddress: orderData.deliveryAddress,
      estimatedDeliveryTime: new Date(Date.now() + 45 * 60 * 1000) // 45 mins from now
    });
    
    // Create order items from cart items
    for (const item of cart.items) {
      const price = item.product ? item.product.originalPrice : 
                   (item.service ? item.service.price : 0);
      
      const negotiatedPrice = item.negotiatedPrice || 
                             (item.product ? item.product.finalPrice : price);
      
      this.createOrderItem({
        orderId: order.id,
        productId: item.productId,
        serviceId: item.serviceId,
        quantity: item.quantity || 1,
        price,
        negotiatedPrice,
        totalPrice: negotiatedPrice * (item.quantity || 1)
      });
    }
    
    // Clear the cart
    for (const item of cart.items) {
      this.cartItems.delete(item.id);
    }
    
    return order;
  }

  async updateOrderStatus(orderId: number, status: string): Promise<Order> {
    const order = this.orders.get(orderId);
    if (!order) {
      throw new Error("Order not found");
    }
    
    order.status = status;
    order.updatedAt = new Date();
    return order;
  }
}

export const storage = new MemStorage();
