import type {
  OrderStatus,
  PaymentStatus,
  TableSessionStatus,
  Location,
  DiningTable,
  TableQrToken,
  TableSession,
  MenuCategory,
  MenuItem,
  MenuItemVersion,
  MenuPrice,
  Order,
  OrderItem,
  OrderStatusHistory,
  Bill,
  PaymentAttempt,
} from "./schema";

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      locations: {
        Row: Location;
        Insert: Omit<Location, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Location, "id">>;
      };
      dining_tables: {
        Row: DiningTable;
        Insert: Omit<DiningTable, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<DiningTable, "id">>;
      };
      table_qr_tokens: {
        Row: TableQrToken;
        Insert: Omit<TableQrToken, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<TableQrToken, "id">>;
      };
      table_sessions: {
        Row: TableSession;
        Insert: Omit<TableSession, "id" | "created_at" | "opened_at" | "last_activity_at"> & {
          id?: string;
          opened_at?: string;
          last_activity_at?: string;
          created_at?: string;
        };
        Update: Partial<Omit<TableSession, "id">>;
      };
      menu_categories: {
        Row: MenuCategory;
        Insert: Omit<MenuCategory, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<MenuCategory, "id">>;
      };
      menu_items: {
        Row: MenuItem;
        Insert: Omit<MenuItem, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<MenuItem, "id">>;
      };
      menu_item_versions: {
        Row: MenuItemVersion;
        Insert: Omit<MenuItemVersion, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<MenuItemVersion, "id">>;
      };
      menu_prices: {
        Row: MenuPrice;
        Insert: Omit<MenuPrice, "id" | "created_at" | "effective_from"> & {
          id?: string;
          effective_from?: string;
          created_at?: string;
        };
        Update: Partial<Omit<MenuPrice, "id">>;
      };
      orders: {
        Row: Order;
        Insert: Omit<Order, "id" | "created_at" | "updated_at"> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Omit<Order, "id">>;
      };
      order_items: {
        Row: OrderItem;
        Insert: Omit<OrderItem, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<OrderItem, "id">>;
      };
      order_status_history: {
        Row: OrderStatusHistory;
        Insert: Omit<OrderStatusHistory, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<OrderStatusHistory, "id">>;
      };
      bills: {
        Row: Bill;
        Insert: Omit<Bill, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Bill, "id">>;
      };
      payment_attempts: {
        Row: PaymentAttempt;
        Insert: Omit<PaymentAttempt, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<PaymentAttempt, "id">>;
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      order_status: OrderStatus;
      payment_status: PaymentStatus;
      table_session_status: TableSessionStatus;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
