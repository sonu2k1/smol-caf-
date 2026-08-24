import React, { useState } from "react";
import type { MenuItemWithDetails } from "@/lib/queries/menu";
import { getFoodImage } from "@/lib/food-images";

interface MenuItemCardProps {
  item: MenuItemWithDetails;
  onOpenDetail: (item: MenuItemWithDetails) => void;
}

export const MenuItemCard: React.FC<MenuItemCardProps> = ({ item, onOpenDetail }) => {
  const [imageError, setImageError] = useState(false);
  const priceRupees = Math.round(item.pricePaise / 100);
  const dietary = (item.metadata?.dietary || "").toLowerCase();
  const isEgg = dietary.includes("egg");
  const spiceLevel = item.metadata?.spice || "";
  const pairing = item.metadata?.best_pairing || "";
  const foodImageUrl = getFoodImage(item.name, item.imageUrl);

  return (
    <div
      onClick={() => onOpenDetail(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpenDetail(item);
        }
      }}
      className="group relative flex items-start justify-between gap-3.5 rounded-2xl border border-[#E8DFD3] bg-[#FCF8F2] p-3.5 text-left shadow-xs transition duration-200 hover:border-[#D8CEBF] hover-lift hover:shadow-md active:scale-[0.98] cursor-pointer animate-fade-in-up"
    >
      {/* Left: Arched Real Food Image */}
      <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-t-full rounded-b-xl border border-[#E2D6C5] bg-[#EFE7DC] shadow-inner">

        {!imageError ? (
          <img
            src={foodImageUrl}
            alt={item.name}
            loading="lazy"
            onError={() => setImageError(true)}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl">
            ☕
          </div>
        )}
      </div>




      {/* Middle: Details */}
      <div className="flex-1 min-w-0 pr-2">
        {/* Title & Dietary Dot */}
        <div className="flex items-center gap-1.5">
          <span
            className={`h-2.5 w-2.5 shrink-0 rounded-full ${
              isEgg ? "bg-[#E5A024]" : "bg-[#2E9946]"
            }`}
            title={isEgg ? "Egg" : "Veg"}
          />
          <h3 className="font-serif text-sm sm:text-base font-bold text-[#1C1917] tracking-tight lowercase truncate">
            {item.name}
          </h3>
        </div>

        {/* Spice Level Indicator */}
        {spiceLevel && (
          <p className="mt-0.5 flex items-center gap-1 font-serif italic text-[11px] text-[#786F66]">
            <span>🌶</span>
            <span>{spiceLevel}</span>
          </p>
        )}

        {/* Description */}
        {item.description && (
          <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-[#5C544D]">
            {item.description}
          </p>
        )}

        {/* Pairing info */}
        {pairing && (
          <p className="mt-1 font-serif italic text-[11px] text-[#A64B38] truncate">
            pairs with: {pairing}
          </p>
        )}
      </div>

      {/* Right: Price */}
      <div className="shrink-0 text-right pt-0.5">
        <span className="font-serif text-base sm:text-lg font-bold text-[#1C1917]">
          ₹{priceRupees}
        </span>
      </div>
    </div>
  );
};

