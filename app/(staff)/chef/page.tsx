'use client';

import React, { useState, useEffect } from 'react';
import { db, calculateShelfLifeStatus } from '@/lib/db';
import { InventoryItem, ShelfLifeStatus } from '@/lib/types';
import {
  Package,
  Plus,
  Minus,
  AlertTriangle,
  Clock,
  Sparkles,
  Search,
  X,
  CheckCircle2,
  Trash2,
} from 'lucide-react';

const statusBadgeStyles: Record<
  ShelfLifeStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  fresh: {
    label: 'fresh',
    bg: 'bg-teal-100 dark:bg-teal-950/50',
    text: 'text-teal-800 dark:text-teal-300 font-bold',
    border: 'border-teal-300 dark:border-teal-800',
  },
  expiring_soon: {
    label: 'expiring soon',
    bg: 'bg-amber-100 dark:bg-amber-950/50',
    text: 'text-amber-900 dark:text-amber-300 font-bold',
    border: 'border-amber-400 dark:border-amber-700',
  },
  expired: {
    label: 'expired',
    bg: 'bg-red-100 dark:bg-red-950/50',
    text: 'text-red-800 dark:text-red-300 font-bold',
    border: 'border-red-400 dark:border-red-800',
  },
};

export default function ChefPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ShelfLifeStatus>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // New item form state
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('');
  const [newItemUnit, setNewItemUnit] = useState('kg');
  const [newItemCategory, setNewItemCategory] = useState('Produce');
  const [newItemExpiry, setNewItemExpiry] = useState('');

  const loadInventory = () => {
    setInventory(db.getInventory());
  };

  useEffect(() => {
    loadInventory();
    window.addEventListener('smol_db_change', loadInventory);
    return () => window.removeEventListener('smol_db_change', loadInventory);
  }, []);

  const handleUpdateQty = (id: string, delta: number) => {
    db.updateInventoryQuantity(id, delta);
    loadInventory();
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newItemQty || !newItemExpiry) return;

    db.addInventoryItem({
      name: newItemName,
      quantity: parseFloat(newItemQty),
      unit: newItemUnit,
      category: newItemCategory,
      minThreshold: 2,
      dateAdded: new Date().toISOString().split('T')[0],
      expiryDate: newItemExpiry,
    });

    setShowAddModal(false);
    setNewItemName('');
    setNewItemQty('');
    setNewItemExpiry('');
    loadInventory();
  };

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const expiringCount = inventory.filter((i) => i.status === 'expiring_soon').length;
  const expiredCount = inventory.filter((i) => i.status === 'expired').length;

  return (
    <div className="px-3 py-3 space-y-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-brand-biscuit/30 dark:border-brand-biscuit/10 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-brand-dustyPool flex items-center justify-center text-white">
            <Package className="w-4 h-4" />
          </div>
          <div>
            <span className="font-mono text-[10px] text-brand-walnut dark:text-brand-biscuit uppercase tracking-wider">
              chef inventory & shelf life
            </span>
            <h2 className="font-serif text-lg font-bold text-brand-espresso dark:text-brand-creme lowercase">
              stock manager
            </h2>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3 py-1.5 rounded-full bg-brand-cherry text-white text-xs font-sans font-bold flex items-center gap-1 shadow-sm active:scale-95 transition-transform"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>add item</span>
        </button>
      </div>

      {/* Alert Banner for Expiring/Expired Stock */}
      {(expiringCount > 0 || expiredCount > 0) && (
        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-xs font-sans text-amber-900 dark:text-amber-200 leading-snug">
            <span className="font-bold">Shelf Life Audit:</span>{' '}
            {expiringCount > 0 && <span>{expiringCount} item(s) expiring within 2 days. </span>}
            {expiredCount > 0 && <span className="text-red-600 dark:text-red-400 font-bold">{expiredCount} item(s) expired.</span>}
          </div>
        </div>
      )}

      {/* Search & Filter Tabs */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-brand-walnut dark:text-brand-biscuit opacity-60" />
          <input
            type="text"
            placeholder="search ingredient or product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-brand-biscuit/20 dark:bg-brand-espresso/60 border border-brand-biscuit/40 dark:border-brand-biscuit/20 text-xs font-sans text-brand-espresso dark:text-brand-creme focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-full text-xs font-sans transition-colors ${
              statusFilter === 'all'
                ? 'bg-brand-cherry text-white font-bold'
                : 'bg-brand-biscuit/20 text-brand-walnut dark:text-brand-biscuit'
            }`}
          >
            all ({inventory.length})
          </button>
          <button
            onClick={() => setStatusFilter('fresh')}
            className={`px-3 py-1 rounded-full text-xs font-sans transition-colors ${
              statusFilter === 'fresh'
                ? 'bg-teal-700 text-white font-bold'
                : 'bg-brand-biscuit/20 text-brand-walnut dark:text-brand-biscuit'
            }`}
          >
            fresh
          </button>
          <button
            onClick={() => setStatusFilter('expiring_soon')}
            className={`px-3 py-1 rounded-full text-xs font-sans transition-colors ${
              statusFilter === 'expiring_soon'
                ? 'bg-amber-600 text-white font-bold'
                : 'bg-brand-biscuit/20 text-brand-walnut dark:text-brand-biscuit'
            }`}
          >
            expiring soon ({expiringCount})
          </button>
          <button
            onClick={() => setStatusFilter('expired')}
            className={`px-3 py-1 rounded-full text-xs font-sans transition-colors ${
              statusFilter === 'expired'
                ? 'bg-red-700 text-white font-bold'
                : 'bg-brand-biscuit/20 text-brand-walnut dark:text-brand-biscuit'
            }`}
          >
            expired ({expiredCount})
          </button>
        </div>
      </div>

      {/* Inventory Items List */}
      <div className="space-y-2.5">
        {filteredInventory.map((item) => {
          const badge = statusBadgeStyles[item.status];
          return (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-brand-creme dark:bg-brand-espresso border border-brand-biscuit/40 dark:border-brand-biscuit/20 shadow-card space-y-2.5"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-0.5">
                  <div className="font-sans font-bold text-sm text-brand-espresso dark:text-brand-creme">
                    {item.name}
                  </div>
                  <div className="text-[11px] font-mono text-brand-walnut dark:text-brand-biscuit">
                    Category: {item.category} · Expiry: {item.expiryDate}
                  </div>
                </div>

                <span
                  className={`px-2.5 py-1 rounded-full text-[10px] font-mono border ${badge.bg} ${badge.text} ${badge.border}`}
                >
                  {badge.label}
                </span>
              </div>

              {/* Quantity and Stepper Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-brand-biscuit/30 dark:border-brand-biscuit/10">
                <div className="font-mono text-xs font-bold text-brand-espresso dark:text-brand-creme">
                  Stock: <span className="text-base text-brand-cherry dark:text-brand-butter">{item.quantity}</span> {item.unit}
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleUpdateQty(item.id, -1)}
                    className="px-2.5 py-1 rounded-lg bg-brand-biscuit/30 dark:bg-brand-biscuit/20 text-xs font-bold text-brand-espresso dark:text-brand-creme hover:bg-brand-biscuit/50 active:scale-95"
                    title="Mark 1 Used"
                  >
                    -1 used
                  </button>
                  <button
                    onClick={() => handleUpdateQty(item.id, 1)}
                    className="px-2.5 py-1 rounded-lg bg-brand-cherry text-white text-xs font-bold hover:bg-brand-cherry/90 active:scale-95"
                    title="Add Stock"
                  >
                    +1 stock
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add New Inventory Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <form
            onSubmit={handleAddItem}
            className="bg-brand-creme dark:bg-brand-espresso rounded-2xl max-w-sm w-full p-5 space-y-4 border border-brand-biscuit/40 dark:border-brand-biscuit/20 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-brand-biscuit/30 pb-2">
              <h3 className="font-serif text-lg font-bold text-brand-espresso dark:text-brand-creme lowercase">
                add inventory item
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="w-7 h-7 rounded-full bg-brand-biscuit/30 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-sans">
              <div>
                <label className="block text-brand-walnut dark:text-brand-biscuit mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fresh Goat Cheese"
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-brand-biscuit/20 dark:bg-brand-espresso border border-brand-biscuit/40 text-brand-espresso dark:text-brand-creme focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-brand-walnut dark:text-brand-biscuit mb-1">Quantity</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="e.g. 5"
                    value={newItemQty}
                    onChange={(e) => setNewItemQty(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-brand-biscuit/20 dark:bg-brand-espresso border border-brand-biscuit/40 text-brand-espresso dark:text-brand-creme focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-brand-walnut dark:text-brand-biscuit mb-1">Unit</label>
                  <select
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-brand-biscuit/20 dark:bg-brand-espresso border border-brand-biscuit/40 text-brand-espresso dark:text-brand-creme focus:outline-none"
                  >
                    <option value="kg">kg</option>
                    <option value="litres">litres</option>
                    <option value="pcs">pcs</option>
                    <option value="loaves">loaves</option>
                    <option value="packets">packets</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-brand-walnut dark:text-brand-biscuit mb-1">Category</label>
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-brand-biscuit/20 dark:bg-brand-espresso border border-brand-biscuit/40 text-brand-espresso dark:text-brand-creme focus:outline-none"
                >
                  <option value="Produce">Produce</option>
                  <option value="Dairy & Alternatives">Dairy & Alternatives</option>
                  <option value="Bakery">Bakery</option>
                  <option value="Coffee & Beverage">Coffee & Beverage</option>
                </select>
              </div>

              <div>
                <label className="block text-brand-walnut dark:text-brand-biscuit mb-1">Expiry Date</label>
                <input
                  type="date"
                  required
                  value={newItemExpiry}
                  onChange={(e) => setNewItemExpiry(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-brand-biscuit/20 dark:bg-brand-espresso border border-brand-biscuit/40 text-brand-espresso dark:text-brand-creme focus:outline-none font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-brand-cherry text-white font-bold text-xs shadow-lg active:scale-95"
            >
              save inventory stock
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
