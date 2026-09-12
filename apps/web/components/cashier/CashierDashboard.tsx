"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { ActiveCashierTable } from "@/app/bill/actions";
import {
  fetchActiveCashierTablesAction,
  recordCashPaymentAction,
  openTableSessionAction,
} from "@/app/bill/actions";
import {
  fetchPendingCashierOrdersAction,
  confirmCashierOrderAction,
  rejectCashierOrderAction,
  type PendingOrderVerification,
} from "@/app/cashier/actions";
import { Bell, Armchair, Sparkles, Check, Receipt } from "lucide-react";

interface CashierDashboardProps {
  initialTables: ActiveCashierTable[];
}

export const CashierDashboard: React.FC<CashierDashboardProps> = ({ initialTables }) => {
  const [activeTab, setActiveTab] = useState<"queue" | "tables">("queue");
  const [tables, setTables] = useState<ActiveCashierTable[]>(initialTables);
  const [pendingOrders, setPendingOrders] = useState<PendingOrderVerification[]>([]);
  const [selectedTable, setSelectedTable] = useState<ActiveCashierTable | null>(null);
  const [amountTendered, setAmountTendered] = useState("");
  const [staffName, setStaffName] = useState("Cashier");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);
  const [resultMessage, setResultMessage] = useState<{
    type: "success" | "error";
    text: string;
    changeRupees?: number;
  } | null>(null);

  const refreshData = useCallback(async () => {
    try {
      const [tableData, pendingData] = await Promise.all([
        fetchActiveCashierTablesAction(),
        fetchPendingCashierOrdersAction(),
      ]);
      setTables(tableData);
      if (pendingData.success) {
        setPendingOrders(pendingData.orders);
      }
    } catch (err) {
      console.error("Failed to refresh cashier data:", err);
    }
  }, []);

  const handleOpenTableForGuest = async (label: string) => {
    await openTableSessionAction(label);
    refreshData();
  };

  // Poll pending orders and tables every 3 seconds
  useEffect(() => {
    refreshData();
    const interval = setInterval(() => {
      if (document.visibilityState === "visible") {
        refreshData();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [refreshData]);

  const handleConfirmOrder = async (orderId: string) => {
    setIsSubmitting(true);
    setActionFeedback(null);
    try {
      const res = await confirmCashierOrderAction(orderId, staffName);
      if (res.success) {
        setActionFeedback({ type: "success", text: res.message || "Order confirmed & sent to kitchen!" });
        refreshData();
      } else {
        setActionFeedback({ type: "error", text: res.message || "Failed to confirm order." });
      }
    } catch {
      setActionFeedback({ type: "error", text: "Network error confirming order." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    const reason = prompt("Enter reason for order cancellation/rejection:", "Customer requested cancellation");
    if (!reason) return;

    setIsSubmitting(true);
    setActionFeedback(null);
    try {
      const res = await rejectCashierOrderAction(orderId, reason, staffName);
      if (res.success) {
        setActionFeedback({ type: "success", text: res.message || "Order rejected." });
        refreshData();
      } else {
        setActionFeedback({ type: "error", text: res.message || "Failed to reject order." });
      }
    } catch {
      setActionFeedback({ type: "error", text: "Network error rejecting order." });
    } finally {
      setIsSubmitting(false);
    }
  };

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
        refreshData();
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
            <Link
              href="/smol-backdoor"
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-stone-800 text-stone-300 hover:bg-stone-700 transition"
              title="Back to staff portal"
            >
              ←
            </Link>
            <div>
              <span className="text-xl font-black tracking-tight text-[#F6AD55]">
                smol café • Cashier Desk
              </span>
              <span className="ml-2 rounded-md bg-stone-800 px-2 py-0.5 font-mono text-[10px] text-stone-400">
                Front-Desk Queue &amp; POS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-full border border-stone-800 bg-stone-900 px-3 py-1 text-xs font-mono text-stone-400">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              Live 3s
            </span>
            <Link
              href="/smol-backdoor"
              className="rounded-xl border border-stone-800 bg-stone-900 px-3 py-1 text-xs font-mono text-stone-400 hover:bg-stone-800 transition"
            >
              Role Portal
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-5xl p-6 space-y-6">
        {actionFeedback && (
          <div
            className={`rounded-2xl p-4 text-xs font-serif ${
              actionFeedback.type === "error"
                ? "bg-rose-950/50 text-rose-300 border border-rose-900/60"
                : "bg-emerald-950/50 text-emerald-300 border border-emerald-900/60"
            }`}
          >
            {actionFeedback.text}
          </div>
        )}

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-stone-800 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab("queue")}
            className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold transition-all ${
              activeTab === "queue"
                ? "bg-[#B72E35] text-white shadow-md"
                : "bg-stone-900 text-stone-400 hover:bg-stone-800"
            }`}
          >
            <Bell className="h-4 w-4 shrink-0 text-[#F6AD55]" />
            <span>Order Confirmation Queue</span>
            {pendingOrders.length > 0 && (
              <span className="rounded-full bg-white px-2 py-0.2 text-[10px] font-black text-[#B72E35] animate-bounce">
                {pendingOrders.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("tables")}
            className={`flex items-center gap-2 rounded-2xl px-5 py-2.5 text-xs font-bold transition-all ${
              activeTab === "tables"
                ? "bg-[#F6AD55] text-stone-900 shadow-md font-extrabold"
                : "bg-stone-900 text-stone-400 hover:bg-stone-800"
            }`}
          >
            <Armchair className="h-4 w-4 shrink-0 text-amber-400" />
            <span>Tables &amp; Settlement</span>
            <span className="rounded-full bg-stone-800 px-2 py-0.2 text-[10px] font-mono text-stone-300">
              {tables.length}
            </span>
          </button>
        </div>

        {/* TAB 1: ORDER VERIFICATION & CONFIRMATION QUEUE */}
        {activeTab === "queue" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-extrabold tracking-tight">
                  Incoming Order Confirmation Queue
                </h1>
                <p className="text-xs text-stone-400">
                  Verify customer Table PIN &amp; confirm before pushing ticket to Kitchen KDS
                </p>
              </div>
              <span className="rounded-full bg-[#B72E35]/20 border border-[#B72E35]/40 px-3 py-1 font-mono text-xs font-bold text-[#F2C84B]">
                {pendingOrders.length} Awaiting Verification
              </span>
            </div>

            {pendingOrders.length === 0 ? (
              <div className="rounded-3xl border border-stone-800 bg-[#1A1715] p-12 text-center text-stone-500 space-y-2">
                <Sparkles className="h-8 w-8 text-amber-500 mx-auto" />
                <p className="text-sm font-bold text-stone-200">No pending orders in queue</p>
                <p className="text-xs text-stone-500">
                  All customer orders have been confirmed and sent to kitchen preparation.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {pendingOrders.map((order) => (
                  <div
                    key={order.id}
                    className="relative flex flex-col justify-between rounded-3xl border-2 border-amber-500/60 bg-[#1A1715] p-5 shadow-xl space-y-4 animate-scale-in"
                  >
                    <div>
                      {/* Top Row: Table Badge & Verification PIN */}
                      <div className="flex items-start justify-between border-b border-stone-800 pb-3">
                        <div>
                          <span className="font-mono text-2xl font-black text-white">
                            Table {order.tableLabel}
                          </span>
                          <p className="font-mono text-xs text-stone-400">
                            Order #{order.orderNo} • {new Date(order.submittedAt || Date.now()).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>

                        {/* Customer 4-digit PIN */}
                        <div className="rounded-2xl border-2 border-[#F2C84B] bg-[#F2C84B]/10 px-3 py-1.5 text-right">
                          <span className="block font-mono text-[9px] uppercase font-bold text-[#F2C84B] tracking-wider">
                            VERIFY PIN
                          </span>
                          <span className="font-mono text-xl font-black text-[#F2C84B]">
                            {order.verificationCode}
                          </span>
                        </div>
                      </div>

                      {/* Special Instructions Note if present */}
                      {order.instructions && (
                        <div className="mt-3 rounded-xl border border-amber-800/40 bg-amber-950/20 p-2.5 text-xs text-amber-300 font-serif italic">
                          &quot;{order.instructions}&quot;
                        </div>
                      )}

                      {/* Items List */}
                      <div className="mt-3 space-y-1.5 font-sans text-xs divide-y divide-stone-800/60">
                        {order.items.map((item) => (
                          <div key={item.id} className="pt-1.5 flex items-center justify-between">
                            <span className="font-medium text-stone-200">
                              <strong className="font-mono text-[#F6AD55]">{item.qty}x</strong> {item.name}
                            </span>
                            <span className="font-mono text-stone-400">
                              ₹{Math.round(item.lineSubtotal / 100)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Bottom: Total & Confirm Action */}
                    <div className="border-t border-stone-800 pt-3 flex items-center justify-between">
                      <div>
                        <span className="block font-mono text-[9px] uppercase font-bold text-stone-500">
                          ORDER TOTAL
                        </span>
                        <span className="font-mono text-xl font-black text-emerald-400">
                          ₹{Math.round(order.totalPaise / 100)}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => handleRejectOrder(order.id)}
                          className="rounded-xl border border-rose-900/60 bg-rose-950/30 px-3 py-2 text-xs font-bold text-rose-300 hover:bg-rose-900/40 transition active:scale-95 disabled:opacity-50"
                        >
                          Reject
                        </button>
                        <button
                          type="button"
                          disabled={isSubmitting}
                          onClick={() => handleConfirmOrder(order.id)}
                          className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow-md hover:bg-emerald-500 active:scale-95 transition disabled:opacity-50"
                        >
                          <Check className="h-4 w-4" />
                          <span>Confirm &amp; Push to Kitchen</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TABLES & CASH BILLING POS */}
        {activeTab === "tables" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-extrabold tracking-tight">Active Dining Tables</h1>
                <p className="text-xs text-stone-400">
                  Select a table to record cash settlement &amp; close session
                </p>
              </div>
              <span className="rounded-full bg-stone-800 px-3 py-1 font-mono text-xs font-bold text-stone-300">
                {tables.length} {tables.length === 1 ? "Active Table" : "Active Tables"}
              </span>
            </div>

            {tables.length === 0 ? (
              <div className="rounded-3xl border border-stone-800 bg-[#1A1715] p-8 text-center text-stone-400 space-y-4">
                <Armchair className="h-8 w-8 text-stone-500 mx-auto" />
                <p className="text-sm font-bold text-stone-200">No open table sessions</p>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  All tables are currently settled. Open a table for walk-in guests:
                </p>
                <div className="flex flex-wrap justify-center gap-2 pt-2">
                  {["01", "02", "03", "04", "05", "06"].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleOpenTableForGuest(num)}
                      className="rounded-xl border border-stone-700 bg-stone-900 px-4 py-2 font-mono text-xs font-bold text-[#F6AD55] hover:bg-stone-800 active:scale-95 transition"
                    >
                      + Open Table {num}
                    </button>
                  ))}
                </div>
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
                            Table {table.tableLabel}
                          </h2>
                          {isRequested ? (
                            <span className="flex items-center gap-1 rounded-full border border-amber-500/80 bg-amber-500/20 px-2.5 py-0.5 text-xs font-bold text-amber-300 animate-pulse">
                              <Receipt className="h-3.5 w-3.5" /> Bill Requested
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
