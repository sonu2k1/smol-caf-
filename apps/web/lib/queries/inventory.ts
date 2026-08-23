import { createAdminClient } from "@/lib/supabase/admin";

export interface IngredientStockItem {
  id: string;
  name: string;
  unitSymbol: string;
  availableQty: number;
  minThreshold: number;
  isLowStock: boolean;
  costPerUnitPaise: number;
}

/**
 * Returns the computed servable quantity for a menu item based on its recipe ingredients and manual 86 status.
 */
export async function getServableQuantity(menuItemId: string): Promise<number> {
  const supabase = createAdminClient();
  try {
    const { data, error } = await supabase.rpc("servable_qty", {
      p_menu_item_id: menuItemId,
    });
    if (error) {
      console.warn("Error calculating servable_qty:", error.message);
      return 9999;
    }
    return typeof data === "number" ? data : 9999;
  } catch (err) {
    console.error("Failed to fetch servable quantity:", err);
    return 9999;
  }
}

/**
 * Returns current stock levels and low-stock alerts across all ingredients.
 */
export async function getInventoryStatus(): Promise<IngredientStockItem[]> {
  const supabase = createAdminClient();

  try {
    // 1. Fetch ingredients and their units
    const { data: ingredients, error: ingErr } = await supabase
      .from("ingredients")
      .select("*, units(symbol)")
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (ingErr || !ingredients || ingredients.length === 0) {
      return [];
    }

    // 2. Fetch available qty for each ingredient
    const stockItems: IngredientStockItem[] = [];

    for (const ing of ingredients as Array<{
      id: string;
      name: string;
      cost_per_unit_paise: number;
      min_threshold: number;
      units: { symbol: string } | null;
    }>) {
      const { data: availData } = await supabase.rpc("get_ingredient_available_qty", {
        p_ingredient_id: ing.id,
      });

      const availableQty = typeof availData === "number" ? availData : 0;
      const minThreshold = ing.min_threshold || 0;

      stockItems.push({
        id: ing.id,
        name: ing.name,
        unitSymbol: ing.units?.symbol || "units",
        availableQty,
        minThreshold,
        isLowStock: availableQty <= minThreshold,
        costPerUnitPaise: ing.cost_per_unit_paise,
      });
    }

    return stockItems;
  } catch (err) {
    console.error("Error fetching inventory status:", err);
    return [];
  }
}
