"use client";

import React, { useState, useEffect, useCallback } from "react";
import type { ActiveCashierTable } from "@/app/bill/actions";
import { fetchActiveCashierTablesAction, recordCashPaymentAction } from "@/app/bill/actions";

interface CashierDashboardProps {
  initialTables: ActiveCashierTable[];
}

export const CashierDashboard: React.FC<CashierDashboardProps> = ({ initialTables }) => {
  const [tables, setTables] = useState<ActiveCashierTable[]>(initialTables);
  const [selectedTable, setSelectedTable] = useState<ActiveCashierTable | null>(null);
  const [amountTendered, setAmountTendered] = useState("");
  const [staffName, setStaffName] = useState("Cashier");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resultMessage, setResultMessage] = useState<{
    type: "success" | "error";
    text: string;
    changeRupees?: number;
  } | null>(null);

  const refreshTables = useCallback(async () => {
    try {
      const data = await fetchActiveCashierTablesAction();
      setTables(data);
    } catch (err) {
      console.error("Failed to refresh cashier tables:", err);
    }
  }, []);

  // Poll tables every 4 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        refreshTables();
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [refreshTables]);

  const handleOpenSettlement = (table: ActiveCashierTable) => {
    setSelectedTable(table);
    setAmountTendered(String(Math.round(table.totalPaise / 100)));
    setResultMessage(null);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTable || isSubmitting) return;

    const tenderedPaise = Math.round(parseFloat(amountTendered) * 100);
    if (isNaN(tenderedPaise) || tenderedPaise < selectedTable.totalPaise) {
      setResultMessage({
        type: "error",
        text: "Tendered amount cannot be less than the total bill amount.",
      });
      return;
    }

    setIsSubmitting(true);
    setResultMessage(null);

    try {
      const res = await recordCashPaymentAction(selectedTable.sessionId, tenderedPaise, staffName);

      if (res.success) {
        const change = Math.round((res.changePaise || 0) / 100);
        setResultMessage({
          type: "success",
          text: `Table ${selectedTable.tableLabel} settled successfully!`,
          changeRupees: change,
        });
        refreshTables();
      } else {
        setResultMessage({
          type: "error",
          text: res.message || "Failed to record cash payment.",
        });
      }
    } catch {
      setResultMessage({
        type: "error",
        text: "An unexpected error occurred during cash settlement.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedTotalRupees = selectedTable ? Math.round(selectedTable.totalPaise / 100) : 0;
  const tenderedRupees = parseFloat(amountTendered) || 0;
  const changeDueRupees = Math.max(0, tenderedRupees - selectedTotalRupees);

  return (
    <div className="min-h-screen bg-[#141211] text-[#FDFBF7]">
      {/* Header */}
      <header className="sticky top-0 z-30 border-b border-stone-800 bg-[#1C1917]/95 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl font-black tracking-tight text-[#F6AD55]">
              smol café • Cashier
            </span>
            <span className="rounded-md bg-stone-800 px-2 py-0.5 font-mono text-xs text-stone-400">
              POS Settlement
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-full border border-stone-800 bg-stone-900 px-3 py-1 text-xs font-mono text-stone-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Live (4s)
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl p-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold tracking-tight">Active Dining Tables</h1>
            <p className="text-xs text-stone-400">
              Select a table to record cash settlement & close session
            </p>
          </div>
          <span className="rounded-full bg-stone-800 px-3 py-1 font-mono text-xs font-bold text-stone-300">
            {tables.length} {tables.length === 1 ? "Active Table" : "Active Tables"}
          </span>
        </div>

        {tables.length === 0 ? (
          <div className="rounded-3xl border border-stone-800 bg-[#1A1715] p-12 text-center text-stone-500">
            <span className="text-3xl">🪑</span>
            <p className="mt-2 text-sm font-medium">No open table sessions</p>
            <p className="text-xs text-stone-600 mt-1">All dining tables are currently vacant.</p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tables.map((table) => {
              const isRequested = table.sessionStatus === "PAYMENT_PENDING";
              const totalRupees = Math.round(table.totalPaise / 100);

              return (
                <div
                  key={table.sessionId}
                  onClick={() => handleOpenSettlement(table)}
                  role="button"
                  tabIndex={0}
                  className={`group relative flex flex-col justify-between rounded-3xl border-2 p-5 text-left transition-all hover:scale-[1.01] hover:shadow-xl active:scale-[0.99] cursor-pointer ${
                    isRequested
                      ? "border-amber-500/80 bg-amber-950/30"
                      : "border-stone-800 bg-[#1A1715] hover:border-stone-700"
                  }`}
                >
                  <div>
                    {/* Top Row: Table Label & Status */}
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-black font-mono tracking-tight text-white group-hover:text-[#F6AD55]">
                        {table.tableLabel}
                      </h2>
                      {isRequested ? (
                        <span className="flex items-center gap-1 rounded-full border border-amber-500/80 bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-300 animate-pulse">
                          🔔 Bill Requested
                        </span>
                      ) : (
                        <span className="rounded-full bg-stone-800 px-2.5 py-0.5 text-xs font-semibold text-stone-400">
                          Dining Active
                        </span>
                      )}
                    </div>

                    <p className="mt-2 text-xs text-stone-400">
                      {table.orderCount} {table.orderCount === 1 ? "order round" : "order rounds"}
                    </p>
                  </div>

                  {/* Bottom: Total Bill & Action */}
                  <div className="mt-6 flex items-baseline justify-between border-t border-stone-800/80 pt-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-stone-500">
                        Bill Total
                      </span>
                      <p className="font-mono text-xl font-black text-[#F6AD55]">₹{totalRupees}</p>
                    </div>

                    <button className="rounded-xl bg-[#9B2C2C] px-3.5 py-2 text-xs font-bold text-white shadow transition hover:bg-[#822424]">
                      Settle Cash →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Cash Payment Settlement Modal */}
      {selectedTable && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          onClick={() => setSelectedTable(null)}
        >
          <div
            className="w-full max-w-md rounded-3xl border border-stone-800 bg-[#1C1917] p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-stone-800 pb-4">
              <div>
                <span className="text-xs font-bold text-[#F6AD55]">Cash Settlement</span>
                <h3 className="text-2xl font-black font-mono text-white">
                  Table {selectedTable.tableLabel}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTable(null)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-800 text-stone-400 hover:bg-stone-700"
              >
                ✕
              </button>
            </div>

            {resultMessage ? (
              /* Success / Result View */
              <div className="py-6 text-center space-y-4">
                <div
                  className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ${
                    resultMessage.type === "success"
                      ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                      : "bg-red-950 text-red-300 border border-red-800"
                  }`}
                >
                  {resultMessage.type === "success" ? "✓" : "✕"}
                </div>
                <h4 className="text-lg font-bold text-white">{resultMessage.text}</h4>

                {resultMessage.changeRupees !== undefined && resultMessage.changeRupees > 0 && (
                  <div className="rounded-2xl border border-amber-900/60 bg-amber-950/40 p-4">
                    <span className="text-xs text-amber-300 font-semibold">Change to Return</span>
                    <p className="text-3xl font-black font-mono text-amber-200 mt-1">
                      ₹{resultMessage.changeRupees}
                    </p>
                  </div>
                )}

                <button
                  onClick={() => {
                    setSelectedTable(null);
                    setResultMessage(null);
                  }}
                  className="w-full rounded-2xl bg-stone-800 py-3 text-xs font-bold text-white transition hover:bg-stone-700"
                >
                  Close & Done
                </button>
              </div>
            ) : (
              /* Settlement Form */
              <form onSubmit={handleRecordPayment} className="mt-5 space-y-4">
                {/* Total Bill Display */}
                <div className="flex items-center justify-between rounded-2xl border border-stone-800 bg-stone-900/80 p-4">
                  <span className="text-xs font-bold text-stone-400">Total Bill Due</span>
                  <span className="font-mono text-2xl font-black text-[#F6AD55]">
                    ₹{selectedTotalRupees}
                  </span>
                </div>

                {/* Amount Tendered Input */}
                <div>
                  <label className="block text-xs font-bold text-stone-400 mb-1.5">
                    Amount Tendered by Customer (₹)
                  </label>
                  <input
                    type="number"
                    min={selectedTotalRupees}
                    step="1"
                    value={amountTendered}
                    onChange={(e) => setAmountTendered(e.target.value)}
                    className="w-full rounded-2xl border border-stone-700 bg-stone-900 px-4 py-3.5 font-mono text-xl font-bold text-white focus:border-[#F6AD55] focus:outline-none"
                    autoFocus
                    required
                  />
                </div>

                {/* Change Due Calculator */}
                <div className="flex items-center justify-between rounded-2xl border border-emerald-900/50 bg-emerald-950/30 p-3.5 text-xs">
                  <span className="font-semibold text-emerald-300">Change Due to Customer</span>
                  <span className="font-mono text-lg font-bold text-emerald-300">
                    ₹{changeDueRupees}
                  </span>
                </div>

                {/* Staff Identifier */}
                <div>
                  <label className="block text-xs font-semibold text-stone-500 mb-1">
                    Staff Identifier
                  </label>
                  <input
                    type="text"
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                    className="w-full rounded-xl border border-stone-800 bg-stone-900 px-3 py-2 text-xs text-white focus:border-stone-600 focus:outline-none"
                    required
                  />
                </div>

                {/* Submit Settlement Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting || tenderedRupees < selectedTotalRupees}
                    className="flex min-h-[50px] w-full items-center justify-center gap-2 rounded-2xl bg-[#9B2C2C] py-4 text-base font-bold text-white shadow-xl transition hover:bg-[#822424] active:scale-[0.98] disabled:opacity-50"
                  >
                    {isSubmitting
                      ? "Processing Settlement..."
                      : `Record Cash ₹${selectedTotalRupees} & Close Table`}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
