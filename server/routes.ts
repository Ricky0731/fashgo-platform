import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertProductSchema, insertCategorySchema, insertServiceSchema, insertStoreSchema, insertOrderSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes prefix
  const apiPrefix = "/api";

  // Health check endpoint
  app.get(`${apiPrefix}/health`, async (req, res) => {
    res.status(200).json({ status: "ok" });
  });

  // Categories endpoints
  app.get(`${apiPrefix}/categories`, async (req, res) => {
    const categories = await storage.getAllCategories();
    res.json(categories);
  });

  // Stores endpoints
  app.get(`${apiPrefix}/stores`, async (req, res) => {
    const stores = await storage.getAllStores();
    res.json(stores);
  });

  app.get(`${apiPrefix}/stores/nearby`, async (req, res) => {
    const stores = await storage.getNearbyStores();
    res.json(stores);
  });

  app.get(`${apiPrefix}/stores/:id`, async (req, res) => {
    const id = parseInt(req.params.id);
    const store = await storage.getStoreById(id);
    if (!store) {
      return res.status(404).json({ message: "Store not found" });
    }
    res.json(store);
  });

  // Products endpoints
  app.get(`${apiPrefix}/products`, async (req, res) => {
    const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
    const storeId = req.query.storeId ? parseInt(req.query.storeId as string) : undefined;
    const products = await storage.getAllProducts({ categoryId, storeId });
    res.json(products);
  });

  app.get(`${apiPrefix}/products/hot-deals`, async (req, res) => {
    const products = await storage.getHotDeals();
    res.json(products);
  });

  app.get(`${apiPrefix}/products/:id`, async (req, res) => {
    const id = parseInt(req.params.id);
    const product = await storage.getProductById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  });

  // Negotiation endpoint
  app.post(`${apiPrefix}/products/:id/negotiate`, async (req, res) => {
    const id = parseInt(req.params.id);
    const { offerPrice } = req.body;
    
    if (!offerPrice || typeof offerPrice !== 'number') {
      return res.status(400).json({ message: "Valid offer price is required" });
    }
    
    const result = await storage.negotiatePrice(id, offerPrice);
    res.json(result);
  });

  // Services endpoints
  app.get(`${apiPrefix}/services`, async (req, res) => {
    const type = req.query.type as string;
    const services = await storage.getAllServices(type);
    res.json(services);
  });

  app.get(`${apiPrefix}/services/:id`, async (req, res) => {
    const id = parseInt(req.params.id);
    const service = await storage.getServiceById(id);
    if (!service) {
      return res.status(404).json({ message: "Service not found" });
    }
    res.json(service);
  });

  // Cart endpoints
  app.get(`${apiPrefix}/cart`, async (req, res) => {
    // In a real app, use userId from auth session
    const userId = 1;
    const cart = await storage.getCartWithItems(userId);
    res.json(cart);
  });

  app.post(`${apiPrefix}/cart/items`, async (req, res) => {
    // In a real app, use userId from auth session
    const userId = 1;
    const { productId, serviceId, quantity, negotiatedPrice } = req.body;
    
    if (!productId && !serviceId) {
      return res.status(400).json({ message: "Product ID or Service ID is required" });
    }
    
    const cartItem = await storage.addToCart(userId, { productId, serviceId, quantity, negotiatedPrice });
    res.json(cartItem);
  });

  app.put(`${apiPrefix}/cart/items/:id`, async (req, res) => {
    const id = parseInt(req.params.id);
    const { quantity } = req.body;
    
    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Valid quantity is required" });
    }
    
    const cartItem = await storage.updateCartItem(id, quantity);
    res.json(cartItem);
  });

  app.delete(`${apiPrefix}/cart/items/:id`, async (req, res) => {
    const id = parseInt(req.params.id);
    await storage.removeFromCart(id);
    res.json({ success: true });
  });

  // Orders endpoints
  app.get(`${apiPrefix}/orders`, async (req, res) => {
    // In a real app, use userId from auth session
    const userId = 1;
    const orders = await storage.getUserOrders(userId);
    res.json(orders);
  });

  app.get(`${apiPrefix}/orders/:id`, async (req, res) => {
    const id = parseInt(req.params.id);
    const order = await storage.getOrderById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  });

  app.post(`${apiPrefix}/orders`, async (req, res) => {
    // In a real app, use userId from auth session
    const userId = 1;
    const { storeId, paymentMethod, deliveryAddress } = req.body;
    
    if (!storeId || !deliveryAddress) {
      return res.status(400).json({ message: "Store ID and delivery address are required" });
    }
    
    const order = await storage.createOrderFromCart(userId, { storeId, paymentMethod, deliveryAddress });
    res.json(order);
  });

  // For retailer dashboard
  app.get(`${apiPrefix}/retailer/products`, async (req, res) => {
    // In a real app, verify this is a retailer account
    const storeId = 1;
    const products = await storage.getStoreProducts(storeId);
    res.json(products);
  });

  app.get(`${apiPrefix}/retailer/orders`, async (req, res) => {
    // In a real app, verify this is a retailer account
    const storeId = 1;
    const orders = await storage.getStoreOrders(storeId);
    res.json(orders);
  });

  const httpServer = createServer(app);
  return httpServer;
}
