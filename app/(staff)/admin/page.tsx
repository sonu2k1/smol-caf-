'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { MenuItem, Category } from '@/lib/types';
import { APP_CONFIG } from '@/lib/config';
import {
  QrCode,
  Plus,
  Edit2,
  CheckCircle,
  XCircle,
  Copy,
  ExternalLink,
  Search,
  X,
  Sparkles,
} from 'lucide-react';

export default function AdminPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('cat-1');
  const [description, setDescription] = useState('');
  const [isSpecial, setIsSpecial] = useState(false);

  const loadData = () => {
    setMenuItems(db.getMenuItems());
    setCategories(db.getCategories());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('smol_db_change', loadData);
    return () => window.removeEventListener('smol_db_change', loadData);
  }, []);

  const handleToggleAvailable = (id: string) => {
    db.toggleMenuItemAvailability(id);
    loadData();
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !description) return;

    if (editingItem) {
      db.updateMenuItem(editingItem.id, {
        name,
        price: parseFloat(price),
        categoryId,
        description,
        isSpecial,
      });
    } else {
      db.addMenuItem({
        name,
        price: parseFloat(price),
        categoryId,
        description,
        available: true,
        isVeg: true,
        isSpecial,
      });
    }

    setShowAddModal(false);
    setEditingItem(null);
    resetForm();
    loadData();
  };

  const startEdit = (item: MenuItem) => {
    setEditingItem(item);
    setName(item.name);
    setPrice(item.price.toString());
    setCategoryId(item.categoryId);
    setDescription(item.description);
    setIsSpecial(item.isSpecial || false);
    setShowAddModal(true);
  };

  const resetForm = () => {
    setName('');
    setPrice('');
    setDescription('');
    setIsSpecial(false);
  };

  const copyMenuLink = () => {
    const url = typeof window !== 'undefined' ? `${window.location.origin}/menu` : '/menu';
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const filteredItems = menuItems.filter((i) =>
    i.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="px-3 py-3 space-y-4 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-brand-biscuit/30 dark:border-brand-biscuit/10 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-brand-walnut flex items-center justify-center text-white">
            <QrCode className="w-4 h-4" />
          </div>
          <div>
            <span className="font-mono text-[10px] text-brand-walnut dark:text-brand-biscuit uppercase tracking-wider">
              admin panel
            </span>
            <h2 className="font-serif text-lg font-bold text-brand-espresso dark:text-brand-creme lowercase">
              menu & qr management
            </h2>
          </div>
        </div>

        <button
          onClick={() => {
            resetForm();
            setEditingItem(null);
            setShowAddModal(true);
          }}
          className="px-3 py-1.5 rounded-full bg-brand-cherry text-white text-xs font-sans font-bold flex items-center gap-1 shadow-sm active:scale-95"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>new item</span>
        </button>
      </div>

      {/* Live QR Code Generator Banner */}
      <div className="p-4 rounded-2xl bg-brand-biscuit/25 dark:bg-brand-espresso/80 border border-brand-biscuit/40 dark:border-brand-biscuit/20 shadow-sm flex items-center gap-4">
        <div className="w-20 h-20 bg-white p-2 rounded-xl border border-brand-biscuit/40 flex items-center justify-center shadow-inner flex-shrink-0">
          <QrCode className="w-full h-full text-brand-espresso" />
        </div>

        <div className="space-y-1.5 flex-1">
          <h3 className="font-serif font-bold text-sm text-brand-espresso dark:text-brand-creme lowercase">
            customer qr menu code
          </h3>
          <p className="text-[11px] font-sans text-brand-walnut dark:text-brand-biscuit leading-tight">
            Edits below reflect live on customer phone screens instantly without reprinting.
          </p>

          <div className="flex items-center gap-2 pt-1">
            <button
              onClick={copyMenuLink}
              className="px-2.5 py-1 rounded-lg bg-brand-cherry text-white text-[11px] font-mono font-bold flex items-center gap-1"
            >
              <Copy className="w-3 h-3" />
              <span>{copiedLink ? 'copied!' : 'copy url'}</span>
            </button>

            <a
              href="/menu"
              target="_blank"
              rel="noopener noreferrer"
              className="px-2.5 py-1 rounded-lg bg-brand-biscuit/30 text-brand-espresso dark:text-brand-creme text-[11px] font-mono font-bold flex items-center gap-1"
            >
              <ExternalLink className="w-3 h-3" />
              <span>preview</span>
            </a>
          </div>
        </div>
      </div>

      {/* Menu Item Management Table/Cards */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-bold text-brand-walnut dark:text-brand-biscuit uppercase">
            manage items ({menuItems.length})
          </span>
          <div className="relative w-40">
            <Search className="w-3 h-3 absolute left-2.5 top-2.5 text-brand-walnut" />
            <input
              type="text"
              placeholder="search item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-7 pr-2 py-1 rounded-lg bg-brand-biscuit/20 text-xs font-sans text-brand-espresso dark:text-brand-creme focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-3 rounded-xl bg-brand-creme dark:bg-brand-espresso border border-brand-biscuit/40 dark:border-brand-biscuit/20 shadow-card flex items-center justify-between gap-3"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-sans font-bold text-xs text-brand-espresso dark:text-brand-creme lowercase">
                    {item.name}
                  </span>
                  {item.isSpecial && (
                    <span className="bg-brand-butter text-brand-espresso text-[9px] font-mono font-bold px-1 rounded">
                      special
                    </span>
                  )}
                </div>
                <div className="font-mono text-xs text-brand-cherry dark:text-brand-butter font-bold">
                  {APP_CONFIG.defaultCurrency}{item.price}
                </div>
              </div>

              {/* Sold-out toggle & Edit button */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleAvailable(item.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1 transition-colors ${
                    item.available
                      ? 'bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-950/60 dark:text-red-300'
                  }`}
                >
                  {item.available ? (
                    <>
                      <CheckCircle className="w-3 h-3 text-green-600" />
                      <span>in stock</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3 text-red-600" />
                      <span>sold out</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => startEdit(item)}
                  className="p-1.5 rounded-lg bg-brand-biscuit/20 text-brand-espresso dark:text-brand-creme hover:bg-brand-biscuit/40"
                  title="Edit item"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal Add/Edit Item */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <form
            onSubmit={handleSaveItem}
            className="bg-brand-creme dark:bg-brand-espresso rounded-2xl max-w-sm w-full p-5 space-y-4 border border-brand-biscuit/40 dark:border-brand-biscuit/20 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-brand-biscuit/30 pb-2">
              <h3 className="font-serif text-lg font-bold text-brand-espresso dark:text-brand-creme lowercase">
                {editingItem ? 'edit menu item' : 'add new menu item'}
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
                <label className="block text-brand-walnut dark:text-brand-biscuit mb-1">Item Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cardamom Honey Latte"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-brand-biscuit/20 dark:bg-brand-espresso border border-brand-biscuit/40 text-brand-espresso dark:text-brand-creme focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-brand-walnut dark:text-brand-biscuit mb-1">Price (₹)</label>
                <input
                  type="number"
                  required
                  placeholder="180"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-brand-biscuit/20 dark:bg-brand-espresso border border-brand-biscuit/40 text-brand-espresso dark:text-brand-creme focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block text-brand-walnut dark:text-brand-biscuit mb-1">Category</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-brand-biscuit/20 dark:bg-brand-espresso border border-brand-biscuit/40 text-brand-espresso dark:text-brand-creme focus:outline-none"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-brand-walnut dark:text-brand-biscuit mb-1">Description</label>
                <textarea
                  required
                  rows={2}
                  placeholder="short warm item description..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-brand-biscuit/20 dark:bg-brand-espresso border border-brand-biscuit/40 text-brand-espresso dark:text-brand-creme focus:outline-none"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isSpecial"
                  checked={isSpecial}
                  onChange={(e) => setIsSpecial(e.target.checked)}
                  className="w-4 h-4 accent-brand-cherry rounded"
                />
                <label htmlFor="isSpecial" className="text-brand-espresso dark:text-brand-creme font-medium">
                  Highlight as Chef&apos;s Special Badge
                </label>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-brand-cherry text-white font-bold text-xs shadow-lg active:scale-95"
            >
              save menu item
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
