'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { Order, OrderStatus } from '@/lib/types';
import { APP_CONFIG } from '@/lib/config';
import { ChefHat, Clock, CheckCircle, ArrowRight, Volume2, VolumeX, AlertCircle } from 'lucide-react';

const statusFlow: OrderStatus[] = ['received', 'started', 'preparing', 'ready', 'completed'];

const statusStyles: Record<OrderStatus, { label: string; btnColor: string; badgeColor: string }> = {
  received: { label: 'Received', btnColor: 'bg-brand-biscuit text-brand-espresso', badgeColor: 'bg-brand-biscuit/30 text-brand-walnut' },
  started: { label: 'Started', btnColor: 'bg-brand-butter text-brand-espresso font-bold', badgeColor: 'bg-brand-butter/30 text-brand-espresso' },
  preparing: { label: 'Preparing', btnColor: 'bg-brand-dustyPool text-white font-bold', badgeColor: 'bg-brand-dustyPool/30 text-brand-dustyPool' },
  ready: { label: 'Mark Ready', btnColor: 'bg-brand-cherry text-white font-bold animate-pulse', badgeColor: 'bg-brand-cherry text-white font-bold' },
  completed: { label: 'Completed', btnColor: 'bg-gray-400 text-white', badgeColor: 'bg-gray-200 text-gray-700' },
  cancelled: { label: 'Cancelled', btnColor: 'bg-red-200 text-red-800', badgeColor: 'bg-red-100 text-red-700' },
};

export default function KitchenPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [nowTime, setNowTime] = useState<number>(Date.now());

  const loadOrders = () => {
    const all = db.getOrders();
    // Exclude completed/cancelled from live kitchen view
    const active = all.filter((o) => o.status !== 'completed' && o.status !== 'cancelled');
    setOrders(active);
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(() => {
      loadOrders();
      setNowTime(Date.now());
    }, APP_CONFIG.kitchenPollingIntervalMs);

    window.addEventListener('smol_db_change', loadOrders);
    return () => {
      clearInterval(interval);
      window.removeEventListener('smol_db_change', loadOrders);
    };
  }, []);

  const handleAdvanceStatus = (order: Order) => {
    const currentIdx = statusFlow.indexOf(order.status);
    if (currentIdx !== -1 && currentIdx < statusFlow.length - 1) {
      const nextStatus = statusFlow[currentIdx + 1];
      db.updateOrderStatus(order.id, nextStatus);
      loadOrders();
    }
  };

  const getMinutesElapsed = (createdAtStr: string): number => {
    const created = new Date(createdAtStr).getTime();
    return Math.max(0, Math.floor((nowTime - created) / 60000));
  };

  return (
    <div className="px-3 py-3 space-y-4 animate-in fade-in duration-200">
      {/* Kitchen Bar Header */}
      <div className="flex items-center justify-between border-b border-brand-biscuit/30 dark:border-brand-biscuit/10 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-brand-butter flex items-center justify-center text-brand-espresso">
            <ChefHat className="w-4 h-4" />
          </div>
          <div>
            <span className="font-mono text-[10px] text-brand-walnut dark:text-brand-biscuit uppercase tracking-wider">
              live kds queue
            </span>
            <h2 className="font-serif text-lg font-bold text-brand-espresso dark:text-brand-creme lowercase">
              kitchen order queue ({orders.length})
            </h2>
          </div>
        </div>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="p-2 rounded-full bg-brand-biscuit/20 dark:bg-brand-espresso border border-brand-biscuit/30 text-brand-espresso dark:text-brand-creme"
          title="Toggle chime"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-brand-cherry" /> : <VolumeX className="w-4 h-4 text-gray-400" />}
        </button>
      </div>

      {/* Orders List */}
      {orders.length === 0 ? (
        <div className="text-center py-16 space-y-3 bg-brand-biscuit/10 dark:bg-brand-espresso/40 rounded-2xl border border-brand-biscuit/20">
          <CheckCircle className="w-10 h-10 text-brand-dustyPool mx-auto" />
          <h3 className="font-serif text-xl text-brand-espresso dark:text-brand-creme font-semibold">
            all clear in the kitchen!
          </h3>
          <p className="font-sans text-xs text-brand-walnut dark:text-brand-biscuit">
            no active kitchen orders right now. new orders will pop up automatically.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const elapsed = getMinutesElapsed(order.createdAt);
            const isLate = elapsed > 15;
            const currentIdx = statusFlow.indexOf(order.status);
            const nextStatus = currentIdx < statusFlow.length - 1 ? statusFlow[currentIdx + 1] : null;

            return (
              <div
                key={order.id}
                className={`p-4 rounded-2xl border-2 transition-all shadow-md ${
                  order.status === 'ready'
                    ? 'bg-brand-cherry/10 border-brand-cherry'
                    : isLate
                    ? 'bg-red-50 dark:bg-red-950/30 border-red-500'
                    : 'bg-brand-creme dark:bg-brand-espresso border-brand-biscuit/50 dark:border-brand-biscuit/20'
                }`}
              >
                {/* Card Top Info */}
                <div className="flex items-center justify-between border-b border-brand-biscuit/30 dark:border-brand-biscuit/10 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-lg font-extrabold text-brand-cherry dark:text-brand-butter">
                      {order.orderNumber}
                    </span>
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-brand-biscuit/30 text-brand-espresso dark:text-brand-creme font-bold">
                      {order.orderType}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 font-mono text-xs">
                    <Clock className={`w-3.5 h-3.5 ${isLate ? 'text-red-600 animate-bounce' : 'text-brand-walnut'}`} />
                    <span className={`font-bold ${isLate ? 'text-red-600' : 'text-brand-walnut dark:text-brand-biscuit'}`}>
                      {elapsed} min ago
                    </span>
                  </div>
                </div>

                {/* Items List (Large font for glanceability across kitchen) */}
                <div className="py-3 space-y-2">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-start justify-between gap-2">
                      <div className="font-sans font-bold text-base text-brand-espresso dark:text-brand-creme lowercase flex items-baseline gap-2">
                        <span className="font-mono text-lg text-brand-cherry dark:text-brand-butter font-extrabold">
                          {item.quantity}×
                        </span>
                        <span>{item.name}</span>
                      </div>
                      {item.notes && (
                        <span className="text-xs font-serif italic text-brand-walnut dark:text-brand-biscuit bg-brand-butter/30 px-2 py-0.5 rounded">
                          {item.notes}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Large Status Action Button */}
                <div className="pt-2 border-t border-brand-biscuit/30 dark:border-brand-biscuit/10 flex items-center justify-between gap-3">
                  <div className="text-xs font-mono text-brand-walnut dark:text-brand-biscuit">
                    Status: <span className="font-bold uppercase text-brand-espresso dark:text-brand-creme">{order.status}</span>
                  </div>

                  {nextStatus && (
                    <button
                      onClick={() => handleAdvanceStatus(order)}
                      className={`px-5 py-3 rounded-xl text-sm font-sans font-bold flex items-center gap-2 shadow-lg active:scale-95 transition-transform ${
                        statusStyles[nextStatus]?.btnColor
                      }`}
                    >
                      <span>{statusStyles[nextStatus]?.label}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
