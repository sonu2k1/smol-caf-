export type Role =
  | 'super_admin'
  | 'admin'
  | 'cashier'
  | 'kitchen'
  | 'chef'
  | 'customer';

export interface User {
  id: string;
  name: string;
  role: Role;
  pin: string;
  active: boolean;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  order: number;
}

export interface MenuItem {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  description: string;
  available: boolean;
  isVeg?: boolean;
  isEgg?: boolean;
  isVegan?: boolean;
  isSpecial?: boolean;
  image?: string;
  subcategory?: string;
  coreIngredients?: string;
  sharedPrePrep?: string;
  primaryEquipment?: string;
  servingWare?: string;
  targetPrice?: number;
  ceilingPrice?: number;
  availability?: string;
  bestPairing?: string;
  dietary?: string;
  proteinFocus?: string;
  spice?: string;
  menuStatus?: string;
  notes?: string | null;
}

export type OrderStatus =
  | 'received'
  | 'started'
  | 'preparing'
  | 'ready'
  | 'completed'
  | 'cancelled';

export type PaymentMethod = 'cash' | 'upi' | 'card';

export interface OrderItem {
  id: string;
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  orderType: 'dine_in' | 'takeaway';
  createdAt: string;
  updatedAt: string;
  cashierName?: string;
}

export type ShelfLifeStatus = 'fresh' | 'expiring_soon' | 'expired';

export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category: string;
  minThreshold: number;
  dateAdded: string;
  expiryDate: string;
  status: ShelfLifeStatus;
  notes?: string;
}

export interface AnalyticsSummary {
  totalRevenue: number;
  totalOrders: number;
  averageOrderValue: number;
  paymentMethodBreakdown: { cash: number; upi: number; card: number };
  topSellingItems: { name: string; count: number; total: number }[];
  dailySalesTrend: { date: string; revenue: number; orders: number }[];
}
