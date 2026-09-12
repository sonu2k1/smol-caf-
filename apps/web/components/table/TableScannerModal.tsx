"use client";

import React, { useState } from "react";
import { TABLE_ZONES_CONFIG } from "@/lib/table-tag";
import { QrCode, Camera, Check, X, MapPin } from "lucide-react";

interface TableScannerModalProps {
  currentTable: string;
  onClose: () => void;
  onSelectTable: (tableLabel: string) => void;
}

export const TableScannerModal: React.FC<TableScannerModalProps> = ({
  currentTable,
  onClose,
  onSelectTable,
}) => {
  const [activeTab, setActiveTab] = useState<"camera" | "picker">("picker");
  const [simulatedScannedTable, setSimulatedScannedTable] = useState<string | null>(null);

  const tableList = Array.from({ length: 12 }, (_, i) => {
    const label = (i + 1).toString().padStart(2, "0");
    const info = TABLE_ZONES_CONFIG[label] || { zone: "Indoor Cozy", capacity: 2 };
    return {
      label,
      zone: info.zone,
      capacity: info.capacity,
    };
  });

  const handleSimulateScan = (label: string) => {
    setSimulatedScannedTable(label);
    setTimeout(() => {
      onSelectTable(label);
    }, 600);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-3xl border border-[#E2D7C7] bg-[#FAF4EB] p-6 shadow-2xl text-[#241F1C] transition-all animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#E2D7C7] pb-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#B72E35] text-white shadow-sm">
              <QrCode className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold tracking-tight text-[#241F1C]">
                QR Table Scanner
              </h3>
              <p className="font-serif italic text-xs text-[#725039]">
                Scan table stand or select your seating zone
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-200/70 text-stone-600 hover:bg-stone-300 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="my-4 flex rounded-xl bg-[#EFE7DC] p-1 text-xs font-medium">
          <button
            onClick={() => setActiveTab("picker")}
            className={`flex-1 rounded-lg py-2 transition-all ${
              activeTab === "picker"
                ? "bg-white font-bold text-[#B72E35] shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            Select Seated Table (12 Tables)
          </button>
          <button
            onClick={() => setActiveTab("camera")}
            className={`flex items-center justify-center gap-1.5 flex-1 rounded-lg py-2 transition-all ${
              activeTab === "camera"
                ? "bg-white font-bold text-[#B72E35] shadow-xs"
                : "text-stone-600 hover:text-stone-900"
            }`}
          >
            <Camera className="h-3.5 w-3.5" />
            Simulate Camera Scanner
          </button>
        </div>

        {/* Tab 1: 12 Table Grid with Zone Tagging */}
        {activeTab === "picker" && (
          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            <p className="text-xs text-[#725039] font-medium">
              Tap the table stand number at your seat:
            </p>
            <div className="grid grid-cols-3 gap-2.5">
              {tableList.map((t) => {
                const isSelected = currentTable === t.label;
                return (
                  <button
                    key={t.label}
                    onClick={() => onSelectTable(t.label)}
                    className={`group relative flex flex-col items-start rounded-2xl border p-3 text-left transition-all ${
                      isSelected
                        ? "border-[#B72E35] bg-[#FFF8E7] shadow-sm ring-2 ring-[#B72E35]/30"
                        : "border-[#E2D7C7] bg-white hover:border-[#B72E35]/50 hover:bg-amber-50/40"
                    }`}
                  >
                    <div className="flex w-full items-center justify-between">
                      <span className="font-mono text-base font-black text-[#241F1C]">
                        T-{t.label}
                      </span>
                      {isSelected && (
                        <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#B72E35] text-white">
                          <Check className="h-2.5 w-2.5" />
                        </span>
                      )}
                    </div>
                    <span className="mt-1 text-[11px] font-semibold text-[#725039]">
                      {t.zone}
                    </span>
                    <span className="text-[10px] text-stone-500 font-mono">
                      Seats: {t.capacity} guests
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 2: Simulated Camera Scanner */}
        {activeTab === "camera" && (
          <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-[#C9AE8B] bg-[#241F1C] p-6 text-white text-center relative overflow-hidden">
            {/* Viewfinder Target */}
            <div className="relative h-44 w-44 rounded-2xl border-2 border-[#F2C84B] p-2 flex items-center justify-center">
              {/* Animated Scan Laser */}
              <div className="absolute inset-x-2 top-2 h-1 bg-[#B72E35] shadow-[0_0_8px_#B72E35] animate-bounce" />
              <QrCode className="h-28 w-28 text-stone-500 opacity-60" />
            </div>

            <p className="mt-4 text-xs text-stone-300 font-medium">
              Point phone camera at table stand QR token
            </p>

            <div className="mt-3 flex flex-wrap justify-center gap-2">
              <span className="text-[10px] text-[#C9AE8B] font-mono">Quick Scan Test:</span>
              {["02", "04", "07"].map((lbl) => (
                <button
                  key={lbl}
                  onClick={() => handleSimulateScan(lbl)}
                  className="rounded-lg bg-[#B72E35] px-2.5 py-1 text-[11px] font-bold text-white shadow-xs hover:bg-[#91242C] transition"
                >
                  Scan Table {lbl}
                </button>
              ))}
            </div>

            {simulatedScannedTable && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-emerald-400 font-serif font-bold text-sm">
                QR Decoded! Connecting Table {simulatedScannedTable}...
              </div>
            )}
          </div>
        )}

        {/* Modal Footer */}
        <div className="mt-5 flex items-center justify-between border-t border-[#E2D7C7] pt-4 text-xs text-[#725039]">
          <div className="flex items-center gap-1">
            <MapPin className="h-3.5 w-3.5 text-[#B72E35]" />
            <span>Tapovan, Rishikesh</span>
          </div>
          <span className="font-mono text-[10px] text-stone-500">
            Current: Table {currentTable}
          </span>
        </div>
      </div>
    </div>
  );
};
