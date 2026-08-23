"use client";

import React, { useState } from "react";
import { staffLoginAction } from "@/app/kitchen/actions";

interface StaffLoginGateProps {
  onSuccess?: () => void;
}

export const StaffLoginGate: React.FC<StaffLoginGateProps> = ({ onSuccess }) => {
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await staffLoginAction(pin);
      if (result.success) {
        if (onSuccess) {
          onSuccess();
        } else {
          window.location.reload();
        }
      } else {
        setError(result.message || "Invalid staff passcode.");
      }
    } catch {
      setError("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#141211] p-4 text-[#FDFBF7]">
      <div className="w-full max-w-sm rounded-3xl border border-stone-800 bg-[#1C1917] p-8 shadow-2xl">
        <div className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#9B2C2C] text-2xl text-white">
            🍳
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">smol café • kitchen KDS</h2>
          <p className="mt-1 text-xs text-stone-400">Enter staff PIN to access the kitchen board</p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <input
              type="password"
              inputMode="numeric"
              placeholder="Staff PIN (e.g. 1234)"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="w-full rounded-2xl border border-stone-700 bg-stone-900/80 px-4 py-3.5 text-center font-mono text-lg tracking-widest text-white placeholder:text-xs placeholder:tracking-normal placeholder:text-stone-500 focus:border-[#9B2C2C] focus:outline-none"
              autoFocus
            />
          </div>

          {error && (
            <p className="rounded-xl border border-red-900/60 bg-red-950/40 p-2.5 text-center text-xs font-semibold text-red-300">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading || !pin}
            className="flex min-h-[48px] w-full items-center justify-center rounded-2xl bg-[#9B2C2C] py-3.5 text-sm font-bold text-white shadow-lg transition hover:bg-[#822424] active:scale-[0.98] disabled:opacity-50"
          >
            {isLoading ? "Unlocking..." : "Enter Kitchen Display"}
          </button>
        </form>

        <div className="mt-6 text-center">
          <span className="text-[11px] text-stone-500 font-mono">Demo staff PIN: 1234</span>
        </div>
      </div>
    </div>
  );
};
