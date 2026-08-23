/**
 * Core schema types and enums for Smol Café.
 */

export type OrderStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "ACCEPTED"
  | "PREPARING"
  | "READY"
  | "SERVED"
  | "CLOSED"
  | "CANCELLED"
  | "REJECTED";

export type PaymentStatus =
  | "CREATED"
  | "PENDING"
  | "AUTHORIZED"
  | "CAPTURED"
  | "FAILED"
  | "CANCELLED"
  | "PARTIALLY_REFUNDED"
  | "REFUNDED";

export type TableSessionStatus = "OPEN" | "PAYMENT_PENDING" | "CLOSED" | "EXPIRED";

export interface Location {
  id: string;
  name: string;
  timezone: string;
  created_at: string;
  updated_at: string;
}

export interface DiningTable {
  id: string;
  location_id: string;
  label: string;
  seats: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TableQrToken {
  id: string;
  table_id: string;
  token_hash: string;
  version: number;
  revoked_at: string | null;
  created_at: string;
}

export interface TableSession {
  id: string;
  location_id: string;
  table_id: string;
  status: TableSessionStatus;
  opened_at: string;
  closed_at: string | null;
  guest_count: number;
  bill_id: string | null;
  session_token_version: number;
  last_activity_at: string;
  created_at: string;
}

export interface MenuCategory {
  id: string;
  location_id: string;
  name: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  status: string;
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface MenuItemVersion {
  id: string;
  menu_item_id: string;
  description: string | null;
  image_url: string | null;
  metadata?: Record<string, unknown>;
  created_at: string;
}

export interface MenuPrice {
  id: string;
  menu_item_id: string;
  amount_paise: number;
  currency: string;
  effective_from: string;
  effective_to: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  location_id: string;
  table_session_id: string | null;
  order_no: number;
  status: OrderStatus;
  service_mode: string;
  submitted_at: string | null;
  accepted_at: string | null;
  ready_at: string | null;
  served_at: string | null;
  subtotal_snapshot: number;
  tax_snapshot: number;
  total_snapshot: number;
  idempotency_key?: string | null;
  version: number;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string | null;
  menu_item_version_id: string | null;
  name_snapshot: string;
  unit_price_snapshot: number;
  qty: number;
  line_subtotal: number;
  item_status: string;
  created_at: string;
}

export interface OrderStatusHistory {
  id: string;
  order_id: string;
  from_status: OrderStatus | null;
  to_status: OrderStatus;
  actor_type: string;
  actor_id: string | null;
  created_at: string;
}

export interface Bill {
  id: string;
  table_session_id: string;
  status: string;
  subtotal: number;
  tax: number;
  total: number;
  paid_amount: number;
  created_at: string;
  closed_at: string | null;
}

export interface PaymentAttempt {
  id: string;
  bill_id: string;
  provider: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  idempotency_key: string;
  created_at: string;
  captured_at: string | null;
}

export interface WebhookEvent {
  id: string;
  provider: string;
  provider_event_id: string;
  event_type: string;
  payload: Record<string, unknown>;
  status: string;
  processed_at: string;
  created_at: string;
}

export type InventoryMovementType =
  "RECEIVE" | "RESERVE" | "RELEASE" | "CONSUME" | "WASTE" | "ADJUST";

export interface Unit {
  id: string;
  name: string;
  symbol: string;
  category: string;
  created_at: string;
}

export interface Ingredient {
  id: string;
  location_id: string;
  name: string;
  unit_id: string | null;
  cost_per_unit_paise: number;
  min_threshold: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Recipe {
  id: string;
  menu_item_id: string;
  version: number;
  is_active: boolean;
  created_at: string;
}

export interface RecipeComponent {
  id: string;
  recipe_id: string;
  ingredient_id: string;
  qty_per_item: number;
  unit_id: string | null;
  is_optional: boolean;
  created_at: string;
}

export interface InventoryMovement {
  id: string;
  ingredient_id: string;
  movement_type: InventoryMovementType;
  quantity: number;
  reference_type: string | null;
  reference_id: string | null;
  actor_type: string;
  actor_id: string | null;
  notes: string | null;
  created_at: string;
}
