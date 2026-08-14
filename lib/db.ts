import {
  Category,
  MenuItem,
  InventoryItem,
  Order,
  OrderStatus,
  User,
  AnalyticsSummary,
  ShelfLifeStatus,
} from './types';
import {
  initialCategories,
  initialMenuItems,
  initialInventoryItems,
  initialOrders,
} from './initial-data';
import { APP_CONFIG } from './config';

const STORAGE_KEYS = {
  USERS: 'smol_cafe_users',
  CATEGORIES: 'smol_cafe_categories',
  MENU_ITEMS: 'smol_cafe_menu_items',
  INVENTORY: 'smol_cafe_inventory',
  ORDERS: 'smol_cafe_orders',
};

// Helper for date calculation
export function calculateShelfLifeStatus(expiryDate: string): ShelfLifeStatus {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);

  const diffTime = expiry.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'expired';
  if (diffDays <= APP_CONFIG.expiringSoonDaysThreshold) return 'expiring_soon';
  return 'fresh';
}

class LocalDBService {
  private isClient = typeof window !== 'undefined';

  private getItem<T>(key: string, fallback: T): T {
    if (!this.isClient) return fallback;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch {
      return fallback;
    }
  }

  private setItem<T>(key: string, value: T): void {
    if (!this.isClient) return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
      // Dispatch custom event for cross-tab or same-page reactive state updates
      window.dispatchEvent(new Event('smol_db_change'));
    } catch (e) {
      console.error('Storage save error:', e);
    }
  }

  // --- Users ---
  getUsers(): User[] {
    return this.getItem<User[]>(STORAGE_KEYS.USERS, APP_CONFIG.demoUsers);
  }

  saveUsers(users: User[]): void {
    this.setItem(STORAGE_KEYS.USERS, users);
  }

  addUser(user: Omit<User, 'id' | 'createdAt'>): User {
    const users = this.getUsers();
    const newUser: User = {
      ...user,
      id: `u-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
    };
    users.push(newUser);
    this.saveUsers(users);
    return newUser;
  }

  toggleUserActive(id: string): User | null {
    const users = this.getUsers();
    const idx = users.findIndex((u) => u.id === id);
    if (idx !== -1) {
      users[idx].active = !users[idx].active;
      this.saveUsers(users);
      return users[idx];
    }
    return null;
  }

  // --- Categories ---
  getCategories(): Category[] {
    return this.getItem<Category[]>(STORAGE_KEYS.CATEGORIES, initialCategories);
  }

  // --- Menu Items ---
  getMenuItems(): MenuItem[] {
    return this.getItem<MenuItem[]>(STORAGE_KEYS.MENU_ITEMS, initialMenuItems);
  }

  saveMenuItems(items: MenuItem[]): void {
    this.setItem(STORAGE_KEYS.MENU_ITEMS, items);
  }

  toggleMenuItemAvailability(id: string): MenuItem | null {
    const items = this.getMenuItems();
    const idx = items.findIndex((i) => i.id === id);
    if (idx !== -1) {
      items[idx].available = !items[idx].available;
      this.saveMenuItems(items);
      return items[idx];
    }
    return null;
  }

  addMenuItem(item: Omit<MenuItem, 'id'>): MenuItem {
    const items = this.getMenuItems();
    const newItem: MenuItem = { ...item, id: `item-${Date.now()}` };
    items.push(newItem);
    this.saveMenuItems(items);
    return newItem;
  }

  updateMenuItem(id: string, updates: Partial<MenuItem>): MenuItem | null {
    const items = this.getMenuItems();
    const idx = items.findIndex((i) => i.id === id);
    if (idx !== -1) {
      items[idx] = { ...items[idx], ...updates };
      this.saveMenuItems(items);
      return items[idx];
    }
    return null;
  }

  // --- Orders ---
  getOrders(): Order[] {
    return this.getItem<Order[]>(STORAGE_KEYS.ORDERS, initialOrders);
  }

  saveOrders(orders: Order[]): void {
    this.setItem(STORAGE_KEYS.ORDERS, orders);
  }

  createOrder(orderData: Omit<Order, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>): Order {
    const orders = this.getOrders();
    const nextNum = orders.length + 101;
    const now = new Date().toISOString();
    const newOrder: Order = {
      ...orderData,
      id: `ord-${Date.now()}`,
      orderNumber: `${APP_CONFIG.orderPrefix}${nextNum}`,
      createdAt: now,
      updatedAt: now,
    };
    orders.unshift(newOrder); // newest first
    this.saveOrders(orders);
    return newOrder;
  }

  updateOrderStatus(id: string, status: OrderStatus): Order | null {
    const orders = this.getOrders();
    const idx = orders.findIndex((o) => o.id === id);
    if (idx !== -1) {
      orders[idx].status = status;
      orders[idx].updatedAt = new Date().toISOString();
      this.saveOrders(orders);
      return orders[idx];
    }
    return null;
  }

  // --- Inventory ---
  getInventory(): InventoryItem[] {
    const items = this.getItem<InventoryItem[]>(STORAGE_KEYS.INVENTORY, initialInventoryItems);
    // Recalculate status dynamically based on current date
    return items.map((item) => ({
      ...item,
      status: calculateShelfLifeStatus(item.expiryDate),
    }));
  }

  saveInventory(inventory: InventoryItem[]): void {
    this.setItem(STORAGE_KEYS.INVENTORY, inventory);
  }

  addInventoryItem(item: Omit<InventoryItem, 'id' | 'status'>): InventoryItem {
    const inventory = this.getInventory();
    const status = calculateShelfLifeStatus(item.expiryDate);
    const newItem: InventoryItem = { ...item, id: `inv-${Date.now()}`, status };
    inventory.push(newItem);
    this.saveInventory(inventory);
    return newItem;
  }

  updateInventoryQuantity(id: string, delta: number): InventoryItem | null {
    const inventory = this.getInventory();
    const idx = inventory.findIndex((i) => i.id === id);
    if (idx !== -1) {
      inventory[idx].quantity = Math.max(0, parseFloat((inventory[idx].quantity + delta).toFixed(2)));
      this.saveInventory(inventory);
      return inventory[idx];
    }
    return null;
  }

  // --- Analytics ---
  getAnalyticsSummary(): AnalyticsSummary {
    const orders = this.getOrders();
    const validOrders = orders.filter((o) => o.status !== 'cancelled');

    const totalRevenue = validOrders.reduce((sum, o) => sum + o.total, 0);
    const totalOrders = validOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    const paymentMethodBreakdown = { cash: 0, upi: 0, card: 0 };
    const itemMap: Record<string, { count: number; total: number }> = {};

    validOrders.forEach((order) => {
      paymentMethodBreakdown[order.paymentMethod] =
        (paymentMethodBreakdown[order.paymentMethod] || 0) + order.total;

      order.items.forEach((item) => {
        if (!itemMap[item.name]) {
          itemMap[item.name] = { count: 0, total: 0 };
        }
        itemMap[item.name].count += item.quantity;
        itemMap[item.name].total += item.price * item.quantity;
      });
    });

    const topSellingItems = Object.entries(itemMap)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Mock 7-day trend
    const dailySalesTrend = [
      { date: 'Mon', revenue: 4200, orders: 12 },
      { date: 'Tue', revenue: 5800, orders: 16 },
      { date: 'Wed', revenue: 5100, orders: 14 },
      { date: 'Thu', revenue: 6400, orders: 18 },
      { date: 'Fri', revenue: 8900, orders: 24 },
      { date: 'Sat', revenue: 11200, orders: 31 },
      { date: 'Today', revenue: Math.round(totalRevenue), orders: totalOrders },
    ];

    return {
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      totalOrders,
      averageOrderValue: Math.round(averageOrderValue * 100) / 100,
      paymentMethodBreakdown,
      topSellingItems,
      dailySalesTrend,
    };
  }

  // Reset to default sample data for testing
  resetDemoData(): void {
    if (!this.isClient) return;
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.CATEGORIES);
    localStorage.removeItem(STORAGE_KEYS.MENU_ITEMS);
    localStorage.removeItem(STORAGE_KEYS.INVENTORY);
    localStorage.removeItem(STORAGE_KEYS.ORDERS);
    window.dispatchEvent(new Event('smol_db_change'));
  }
}

export const db = new LocalDBService();
