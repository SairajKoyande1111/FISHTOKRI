import { db } from "./db";
import {
  users,
  products,
  orderRequests,
  type User,
  type InsertUser,
  type Product,
  type InsertProduct,
  type UpdateProductRequest,
  type OrderRequest,
  type InsertOrderRequest,
} from "@shared/schema";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, updates: UpdateProductRequest): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<void>;

  getOrderRequests(): Promise<OrderRequest[]>;
  getOrderRequest(id: number): Promise<OrderRequest | undefined>;
  createOrderRequest(order: InsertOrderRequest): Promise<OrderRequest>;
  updateOrderRequestStatus(id: number, status: string): Promise<OrderRequest | undefined>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Products
  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.isArchived, false));
  }

  async getProduct(id: number): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(eq(products.id, id));
    return product;
  }

  async createProduct(product: InsertProduct): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: number, updates: UpdateProductRequest): Promise<Product | undefined> {
    const [updated] = await db
      .update(products)
      .set(updates)
      .where(eq(products.id, id))
      .returning();
    return updated;
  }

  async deleteProduct(id: number): Promise<void> {
    await db.update(products).set({ isArchived: true }).where(eq(products.id, id));
  }

  // Orders
  async getOrderRequests(): Promise<OrderRequest[]> {
    return await db.select().from(orderRequests).orderBy(orderRequests.createdAt);
  }

  async getOrderRequest(id: number): Promise<OrderRequest | undefined> {
    const [order] = await db.select().from(orderRequests).where(eq(orderRequests.id, id));
    return order;
  }

  async createOrderRequest(order: InsertOrderRequest): Promise<OrderRequest> {
    const [newOrder] = await db.insert(orderRequests).values(order).returning();
    return newOrder;
  }

  async updateOrderRequestStatus(id: number, status: string): Promise<OrderRequest | undefined> {
    const [updated] = await db
      .update(orderRequests)
      .set({ status })
      .where(eq(orderRequests.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();
