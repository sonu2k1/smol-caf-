"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import type {
  Vendor,
  PurchaseOrder,
  PurchaseOrderLine,
  PurchaseOrderStatus,
  GoodsReceipt,
  GoodsReceiptLine,
  Ingredient,
} from "@smol-cafe/db";

export interface POLineInput {
  ingredientId: string;
  orderedQty: number;
  unitCostPaise: number;
}

export interface CreatePOInput {
  vendorId: string;
  expectedDeliveryDate?: string;
  notes?: string;
  lines: POLineInput[];
}

export interface GRNLineInput {
  poLineId?: string;
  ingredientId: string;
  receivedQty: number;
  unitCostPaise: number;
}

export interface RecordGRNInput {
  poId?: string;
  vendorId: string;
  invoiceNo?: string;
  notes?: string;
  lines: GRNLineInput[];
}

export interface EnrichedPO extends PurchaseOrder {
  vendor_name: string;
  lines: (PurchaseOrderLine & { ingredient_name: string; unit_symbol: string })[];
}

export interface EnrichedGRN extends GoodsReceipt {
  vendor_name: string;
  lines: (GoodsReceiptLine & { ingredient_name: string })[];
}

export interface ProcurementData {
  success: boolean;
  vendors: Vendor[];
  ingredients: Ingredient[];
  purchaseOrders: EnrichedPO[];
  goodsReceipts: EnrichedGRN[];
  message?: string;
}

/**
 * Server Action: Fetches all procurement overview data
 */
export async function fetchProcurementDataAction(): Promise<ProcurementData> {
  const supabase = createAdminClient();

  try {
    // 1. Fetch Vendors
    const { data: vendors } = await supabase
      .from("vendors")
      .select("*")
      .order("name", { ascending: true });

    // 2. Fetch Ingredients with Unit
    const { data: ingredients } = await supabase
      .from("ingredients")
      .select("*, units(*)")
      .order("name", { ascending: true });

    // 3. Fetch Purchase Orders with lines
    const { data: pos } = await supabase
      .from("purchase_orders")
      .select(
        `
        *,
        vendors(name),
        purchase_order_lines(
          *,
          ingredients(name, units(symbol))
        )
      `
      )
      .order("created_at", { ascending: false });

    // 4. Fetch Goods Receipts with lines
    const { data: grns } = await supabase
      .from("goods_receipts")
      .select(
        `
        *,
        vendors(name),
        goods_receipt_lines(
          *,
          ingredients(name)
        )
      `
      )
      .order("received_at", { ascending: false });

    const enrichedPOs: EnrichedPO[] = ((pos as unknown[]) || []).map((rawItem) => {
      const raw = rawItem as Record<string, unknown>;
      const vendorObj = raw.vendors as { name?: string } | undefined;
      const rawLines = (raw.purchase_order_lines as Record<string, unknown>[]) || [];

      return {
        id: String(raw.id),
        po_number: String(raw.po_number),
        vendor_id: String(raw.vendor_id),
        status: raw.status as PurchaseOrderStatus,
        total_amount_paise: Number(raw.total_amount_paise),
        expected_delivery_date: (raw.expected_delivery_date as string) || null,
        notes: (raw.notes as string) || null,
        created_at: String(raw.created_at),
        updated_at: String(raw.updated_at),
        vendor_name: vendorObj?.name || "Unknown Vendor",
        lines: rawLines.map((l) => {
          const ing = l.ingredients as { name?: string; units?: { symbol?: string } } | undefined;
          return {
            id: String(l.id),
            po_id: String(l.po_id),
            ingredient_id: String(l.ingredient_id),
            ordered_qty: Number(l.ordered_qty),
            received_qty: Number(l.received_qty),
            unit_cost_paise: Number(l.unit_cost_paise),
            line_total_paise: Number(l.line_total_paise),
            created_at: String(l.created_at),
            ingredient_name: ing?.name || "Item",
            unit_symbol: ing?.units?.symbol || "units",
          };
        }),
      };
    });

    const enrichedGRNs: EnrichedGRN[] = ((grns as unknown[]) || []).map((rawItem) => {
      const raw = rawItem as Record<string, unknown>;
      const vendorObj = raw.vendors as { name?: string } | undefined;
      const rawLines = (raw.goods_receipt_lines as Record<string, unknown>[]) || [];

      return {
        id: String(raw.id),
        grn_number: String(raw.grn_number),
        po_id: (raw.po_id as string) || null,
        vendor_id: String(raw.vendor_id),
        invoice_no: (raw.invoice_no as string) || null,
        received_at: String(raw.received_at),
        notes: (raw.notes as string) || null,
        created_at: String(raw.created_at),
        vendor_name: vendorObj?.name || "Unknown Vendor",
        lines: rawLines.map((l) => {
          const ing = l.ingredients as { name?: string } | undefined;
          return {
            id: String(l.id),
            grn_id: String(l.grn_id),
            po_line_id: (l.po_line_id as string) || null,
            ingredient_id: String(l.ingredient_id),
            received_qty: Number(l.received_qty),
            unit_cost_paise: Number(l.unit_cost_paise),
            created_at: String(l.created_at),
            ingredient_name: ing?.name || "Item",
          };
        }),
      };
    });

    return {
      success: true,
      vendors: (vendors as Vendor[]) || [],
      ingredients: (ingredients as Ingredient[]) || [],
      purchaseOrders: enrichedPOs,
      goodsReceipts: enrichedGRNs,
    };
  } catch (err) {
    console.error("Error fetching procurement data:", err);
    return {
      success: false,
      vendors: [],
      ingredients: [],
      purchaseOrders: [],
      goodsReceipts: [],
      message: "Failed to load procurement data.",
    };
  }
}

/**
 * Server Action: Creates a Purchase Order (NEVER mutates inventory stock)
 */
export async function createPurchaseOrderAction(
  input: CreatePOInput
): Promise<{ success: boolean; poNumber?: string; message?: string }> {
  if (!input.vendorId || input.lines.length === 0) {
    return { success: false, message: "Please select a vendor and add at least one line item." };
  }

  const supabase = createAdminClient();
  const now = new Date();
  const yyyymm = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, "0")}`;

  try {
    // Generate sequential PO Number
    const { count } = await supabase
      .from("purchase_orders")
      .select("*", { count: "exact", head: true });

    const poSeq = String((count || 0) + 1).padStart(4, "0");
    const poNumber = `PO-${yyyymm}-${poSeq}`;

    // Compute totals
    let totalAmountPaise = 0;
    const linesToInsert = input.lines.map((l) => {
      const lineTotal = Math.round(l.orderedQty * l.unitCostPaise);
      totalAmountPaise += lineTotal;
      return {
        ingredient_id: l.ingredientId,
        ordered_qty: l.orderedQty,
        received_qty: 0,
        unit_cost_paise: l.unitCostPaise,
        line_total_paise: lineTotal,
      };
    });

    // Insert PO Header
    const { data: po, error: poErr } = await supabase
      .from("purchase_orders")
      .insert({
        po_number: poNumber,
        vendor_id: input.vendorId,
        status: "DRAFT",
        total_amount_paise: totalAmountPaise,
        expected_delivery_date: input.expectedDeliveryDate || null,
        notes: input.notes?.trim() || null,
      })
      .select("id")
      .single();

    if (poErr || !po) {
      console.error("Error creating PO:", poErr);
      return { success: false, message: "Could not create purchase order." };
    }

    // Insert PO Lines
    const { error: linesErr } = await supabase.from("purchase_order_lines").insert(
      linesToInsert.map((l) => ({
        po_id: po.id,
        ...l,
      }))
    );

    if (linesErr) {
      console.error("Error creating PO lines:", linesErr);
      return { success: false, message: "Could not create purchase order line items." };
    }

    return {
      success: true,
      poNumber,
      message: `Purchase Order ${poNumber} created successfully! (Stock unaffected until received)`,
    };
  } catch (err) {
    console.error("Error in createPurchaseOrderAction:", err);
    return { success: false, message: "An unexpected error occurred." };
  }
}

/**
 * Server Action: Records Goods Receipt and atomically updates inventory (RECEIVE)
 */
export async function recordGoodsReceiptAction(
  input: RecordGRNInput
): Promise<{ success: boolean; grnNumber?: string; message?: string }> {
  if (input.lines.length === 0) {
    return { success: false, message: "Please specify received quantities." };
  }

  const supabase = createAdminClient();

  try {
    const formattedLines = input.lines.map((l) => ({
      po_line_id: l.poLineId || null,
      ingredient_id: l.ingredientId,
      received_qty: l.receivedQty,
      unit_cost_paise: l.unitCostPaise,
    }));

    const { data: res, error } = await supabase.rpc("record_goods_receipt", {
      p_po_id: input.poId || null,
      p_vendor_id: input.vendorId,
      p_invoice_no: input.invoiceNo?.trim() || null,
      p_notes: input.notes?.trim() || null,
      p_lines: formattedLines,
    });

    if (error) {
      console.error("Error in record_goods_receipt RPC:", error);
      return { success: false, message: "Failed to record goods receipt." };
    }

    const parsed = res as { success: boolean; grn_number?: string; message?: string };
    return {
      success: parsed.success,
      grnNumber: parsed.grn_number,
      message: parsed.message || "Goods receipt recorded and inventory stock updated.",
    };
  } catch (err) {
    console.error("Error in recordGoodsReceiptAction:", err);
    return { success: false, message: "An unexpected error occurred." };
  }
}

/**
 * Server Action: Updates PO status
 */
export async function updatePurchaseOrderStatusAction(
  poId: string,
  status: PurchaseOrderStatus
): Promise<{ success: boolean; message?: string }> {
  const supabase = createAdminClient();

  try {
    const { error } = await supabase
      .from("purchase_orders")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", poId);

    if (error) return { success: false, message: "Failed to update PO status." };
    return { success: true, message: `PO status updated to ${status}.` };
  } catch {
    return { success: false, message: "An unexpected error occurred." };
  }
}

/**
 * Server Action: Adds a new vendor
 */
export async function createVendorAction(data: {
  name: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  address?: string;
  taxId?: string;
  notes?: string;
}): Promise<{ success: boolean; vendor?: Vendor; message?: string }> {
  if (!data.name.trim()) return { success: false, message: "Vendor name is required." };

  const supabase = createAdminClient();
  try {
    const { data: vendor, error } = await supabase
      .from("vendors")
      .insert({
        name: data.name.trim(),
        contact_person: data.contactPerson?.trim() || null,
        phone: data.phone?.trim() || null,
        email: data.email?.trim() || null,
        address: data.address?.trim() || null,
        tax_id: data.taxId?.trim() || null,
        notes: data.notes?.trim() || null,
      })
      .select("*")
      .single();

    if (error || !vendor) return { success: false, message: "Failed to create vendor." };
    return { success: true, vendor: vendor as Vendor, message: "Vendor created!" };
  } catch {
    return { success: false, message: "An unexpected error occurred." };
  }
}
