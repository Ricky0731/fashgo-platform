import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  address: text("address"),
  isRetailer: boolean("is_retailer").default(false)
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  phone: true,
  email: true,
  address: true,
  isRetailer: true
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Store schema
export const stores = pgTable("stores", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  description: text("description"),
  address: text("address").notNull(),
  rating: doublePrecision("rating").default(0),
  reviewCount: integer("review_count").default(0),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  distance: doublePrecision("distance"),
  deliveryTime: integer("delivery_time").default(30),
  imageUrl: text("image_url")
});

export const insertStoreSchema = createInsertSchema(stores).pick({
  userId: true,
  name: true,
  description: true,
  address: true,
  rating: true,
  reviewCount: true,
  latitude: true,
  longitude: true,
  distance: true,
  deliveryTime: true,
  imageUrl: true
});

export type InsertStore = z.infer<typeof insertStoreSchema>;
export type Store = typeof stores.$inferSelect;

// Product category schema
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  icon: text("icon").notNull()
});

export const insertCategorySchema = createInsertSchema(categories).pick({
  name: true,
  icon: true
});

export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;

// Product schema
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id").notNull().references(() => stores.id),
  categoryId: integer("category_id").references(() => categories.id),
  name: text("name").notNull(),
  description: text("description"),
  originalPrice: doublePrecision("original_price").notNull(),
  discountPercentage: integer("discount_percentage").default(0),
  finalPrice: doublePrecision("final_price").notNull(),
  minAcceptablePrice: doublePrecision("min_acceptable_price"),
  stock: integer("stock").default(0),
  rating: doublePrecision("rating").default(0),
  reviewCount: integer("review_count").default(0),
  imageUrl: text("image_url")
});

export const insertProductSchema = createInsertSchema(products).pick({
  storeId: true,
  categoryId: true,
  name: true,
  description: true,
  originalPrice: true,
  discountPercentage: true,
  finalPrice: true,
  minAcceptablePrice: true,
  stock: true,
  rating: true,
  reviewCount: true,
  imageUrl: true
});

export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Product = typeof products.$inferSelect;

// Service schema (for beauty and tailoring)
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id").notNull().references(() => stores.id),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(), // 'beauty' or 'tailoring'
  price: doublePrecision("price").notNull(),
  duration: integer("duration").default(30), // in minutes
  rating: doublePrecision("rating").default(0),
  reviewCount: integer("review_count").default(0),
  imageUrl: text("image_url")
});

export const insertServiceSchema = createInsertSchema(services).pick({
  storeId: true,
  name: true,
  description: true,
  type: true,
  price: true,
  duration: true,
  rating: true,
  reviewCount: true,
  imageUrl: true
});

export type InsertService = z.infer<typeof insertServiceSchema>;
export type Service = typeof services.$inferSelect;

// Order schema
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  storeId: integer("store_id").notNull().references(() => stores.id),
  status: text("status").notNull().default("pending"), // pending, confirmed, packed, on_the_way, delivered
  totalAmount: doublePrecision("total_amount").notNull(),
  deliveryFee: doublePrecision("delivery_fee").default(0),
  taxAmount: doublePrecision("tax_amount").default(0),
  discountAmount: doublePrecision("discount_amount").default(0),
  paymentMethod: text("payment_method").default("cod"),
  deliveryAddress: text("delivery_address"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  estimatedDeliveryTime: timestamp("estimated_delivery_time")
});

export const insertOrderSchema = createInsertSchema(orders).pick({
  userId: true,
  storeId: true,
  status: true,
  totalAmount: true,
  deliveryFee: true,
  taxAmount: true,
  discountAmount: true,
  paymentMethod: true,
  deliveryAddress: true,
  estimatedDeliveryTime: true
});

export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type Order = typeof orders.$inferSelect;

// Order items schema
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => orders.id),
  productId: integer("product_id").references(() => products.id),
  serviceId: integer("service_id").references(() => services.id),
  quantity: integer("quantity").default(1),
  price: doublePrecision("price").notNull(),
  negotiatedPrice: doublePrecision("negotiated_price"),
  totalPrice: doublePrecision("total_price").notNull()
});

export const insertOrderItemSchema = createInsertSchema(orderItems).pick({
  orderId: true,
  productId: true,
  serviceId: true,
  quantity: true,
  price: true,
  negotiatedPrice: true,
  totalPrice: true
});

export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type OrderItem = typeof orderItems.$inferSelect;

// Cart schema
export const carts = pgTable("carts", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow()
});

export const insertCartSchema = createInsertSchema(carts).pick({
  userId: true
});

export type InsertCart = z.infer<typeof insertCartSchema>;
export type Cart = typeof carts.$inferSelect;

// Cart items schema
export const cartItems = pgTable("cart_items", {
  id: serial("id").primaryKey(),
  cartId: integer("cart_id").notNull().references(() => carts.id),
  productId: integer("product_id").references(() => products.id),
  serviceId: integer("service_id").references(() => services.id),
  quantity: integer("quantity").default(1),
  negotiatedPrice: doublePrecision("negotiated_price")
});

export const insertCartItemSchema = createInsertSchema(cartItems).pick({
  cartId: true,
  productId: true,
  serviceId: true,
  quantity: true,
  negotiatedPrice: true
});

export type InsertCartItem = z.infer<typeof insertCartItemSchema>;
export type CartItem = typeof cartItems.$inferSelect;
