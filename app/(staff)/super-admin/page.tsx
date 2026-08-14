'use client';

import React, { useState, useEffect } from 'react';
import { db } from '@/lib/db';
import { AnalyticsSummary, User, Role } from '@/lib/types';
import { APP_CONFIG } from '@/lib/config';
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  ShoppingBag,
  UserPlus,
  UserX,
  UserCheck,
  Shield,
  CreditCard,
  QrCode,
  Banknote,
  X,
} from 'lucide-react';

const roleBadgeColors: Record<Role, string> = {
  super_admin: 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300',
  admin: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  cashier: 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300',
  kitchen: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  chef: 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300',
  customer: 'bg-gray-100 text-gray-800',
};

export default function SuperAdminPage() {
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  // New staff form state
  const [newUserName, setNewUserName] = useState('');
  const [newUserRole, setNewUserRole] = useState<Role>('cashier');
  const [newUserPin, setNewUserPin] = useState('');

  const loadData = () => {
    setAnalytics(db.getAnalyticsSummary());
    setUsers(db.getUsers());
  };

  useEffect(() => {
    loadData();
    window.addEventListener('smol_db_change', loadData);
    return () => window.removeEventListener('smol_db_change', loadData);
  }, []);

  const handleToggleUserActive = (id: string) => {
    db.toggleUserActive(id);
    loadData();
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserPin || newUserPin.length !== 4) return;

    db.addUser({
      name: newUserName,
      role: newUserRole,
      pin: newUserPin,
      active: true,
    });

    setShowAddUserModal(false);
    setNewUserName('');
    setNewUserPin('');
    loadData();
  };

  if (!analytics) return null;

  const maxRevenue = Math.max(...analytics.dailySalesTrend.map((d) => d.revenue), 1);

  return (
    <div className="px-3 py-3 space-y-5 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex items-center justify-between border-b border-brand-biscuit/30 dark:border-brand-biscuit/10 pb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-brand-electricViolet flex items-center justify-center text-white">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <span className="font-mono text-[10px] text-brand-walnut dark:text-brand-biscuit uppercase tracking-wider">
              owner oversight
            </span>
            <h2 className="font-serif text-lg font-bold text-brand-espresso dark:text-brand-creme lowercase">
              super admin analytics
            </h2>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 rounded-xl bg-brand-creme dark:bg-brand-espresso border border-brand-biscuit/40 dark:border-brand-biscuit/20 shadow-card text-center space-y-0.5">
          <span className="font-mono text-[10px] text-brand-walnut dark:text-brand-biscuit uppercase">revenue</span>
          <div className="font-mono text-sm font-bold text-brand-cherry dark:text-brand-butter">
            {APP_CONFIG.defaultCurrency}{analytics.totalRevenue}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-brand-creme dark:bg-brand-espresso border border-brand-biscuit/40 dark:border-brand-biscuit/20 shadow-card text-center space-y-0.5">
          <span className="font-mono text-[10px] text-brand-walnut dark:text-brand-biscuit uppercase">total orders</span>
          <div className="font-mono text-sm font-bold text-brand-espresso dark:text-brand-creme">
            {analytics.totalOrders}
          </div>
        </div>
        <div className="p-3 rounded-xl bg-brand-creme dark:bg-brand-espresso border border-brand-biscuit/40 dark:border-brand-biscuit/20 shadow-card text-center space-y-0.5">
          <span className="font-mono text-[10px] text-brand-walnut dark:text-brand-biscuit uppercase">aov</span>
          <div className="font-mono text-sm font-bold text-brand-dustyPool">
            {APP_CONFIG.defaultCurrency}{analytics.averageOrderValue}
          </div>
        </div>
      </div>

      {/* Graphical Sales Trend Chart */}
      <div className="p-4 rounded-2xl bg-brand-creme dark:bg-brand-espresso border border-brand-biscuit/40 dark:border-brand-biscuit/20 shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-serif font-bold text-sm text-brand-espresso dark:text-brand-creme lowercase flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-brand-cherry" />
            <span>7-day sales trend</span>
          </h3>
          <span className="font-mono text-[10px] text-brand-walnut dark:text-brand-biscuit uppercase">
            weekly revenue
          </span>
        </div>

        {/* Visual Bar Chart */}
        <div className="flex items-end justify-between gap-1.5 h-32 pt-4 px-1 border-b border-brand-biscuit/30 dark:border-brand-biscuit/10">
          {analytics.dailySalesTrend.map((day) => {
            const heightPercent = Math.round((day.revenue / maxRevenue) * 100);
            return (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                <span className="font-mono text-[9px] text-brand-walnut dark:text-brand-biscuit opacity-0 group-hover:opacity-100 transition-opacity">
                  {APP_CONFIG.defaultCurrency}{day.revenue}
                </span>
                <div
                  style={{ height: `${Math.max(12, heightPercent)}%` }}
                  className="w-full bg-brand-cherry dark:bg-brand-butter rounded-t-lg transition-all shadow-sm group-hover:bg-brand-electricViolet"
                />
                <span className="font-mono text-[10px] text-brand-espresso dark:text-brand-creme font-semibold">
                  {day.date}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top Selling Items & Payment Methods Split */}
      <div className="grid grid-cols-2 gap-3">
        {/* Top Selling Items */}
        <div className="p-3.5 rounded-2xl bg-brand-creme dark:bg-brand-espresso border border-brand-biscuit/40 dark:border-brand-biscuit/20 shadow-card space-y-2">
          <h4 className="font-serif font-bold text-xs text-brand-espresso dark:text-brand-creme lowercase">
            top sellers
          </h4>
          <div className="space-y-1.5 font-sans text-xs">
            {analytics.topSellingItems.map((item) => (
              <div key={item.name} className="flex justify-between items-center text-[11px]">
                <span className="truncate text-brand-espresso dark:text-brand-creme">{item.name}</span>
                <span className="font-mono font-bold text-brand-cherry dark:text-brand-butter flex-shrink-0 ml-1">
                  {item.count}x
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Split */}
        <div className="p-3.5 rounded-2xl bg-brand-creme dark:bg-brand-espresso border border-brand-biscuit/40 dark:border-brand-biscuit/20 shadow-card space-y-2">
          <h4 className="font-serif font-bold text-xs text-brand-espresso dark:text-brand-creme lowercase">
            payment split
          </h4>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1"><QrCode className="w-3 h-3 text-purple-500" /> UPI</span>
              <span className="font-bold">{APP_CONFIG.defaultCurrency}{analytics.paymentMethodBreakdown.upi}</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1"><Banknote className="w-3 h-3 text-green-500" /> Cash</span>
              <span className="font-bold">{APP_CONFIG.defaultCurrency}{analytics.paymentMethodBreakdown.cash}</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="flex items-center gap-1"><CreditCard className="w-3 h-3 text-blue-500" /> Card</span>
              <span className="font-bold">{APP_CONFIG.defaultCurrency}{analytics.paymentMethodBreakdown.card}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Staff User Management Section */}
      <div className="p-4 rounded-2xl bg-brand-creme dark:bg-brand-espresso border border-brand-biscuit/40 dark:border-brand-biscuit/20 shadow-card space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-brand-cherry" />
            <h3 className="font-serif font-bold text-sm text-brand-espresso dark:text-brand-creme lowercase">
              staff account management ({users.length})
            </h3>
          </div>
          <button
            onClick={() => setShowAddUserModal(true)}
            className="px-3 py-1 rounded-full bg-brand-cherry text-white text-xs font-sans font-bold flex items-center gap-1 active:scale-95"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>add staff</span>
          </button>
        </div>

        {/* Staff Table */}
        <div className="space-y-2">
          {users.map((u) => (
            <div
              key={u.id}
              className={`p-3 rounded-xl border flex items-center justify-between gap-2 transition-all ${
                u.active
                  ? 'bg-brand-biscuit/10 dark:bg-brand-espresso/60 border-brand-biscuit/30 dark:border-brand-biscuit/20'
                  : 'bg-red-50/50 dark:bg-red-950/20 border-red-200 opacity-60'
              }`}
            >
              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <span className="font-sans font-bold text-xs text-brand-espresso dark:text-brand-creme">
                    {u.name}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${roleBadgeColors[u.role]}`}>
                    {u.role.replace('_', ' ')}
                  </span>
                </div>
                <div className="font-mono text-[11px] text-brand-walnut dark:text-brand-biscuit">
                  PIN: <span className="font-bold text-brand-cherry dark:text-brand-butter">{u.pin}</span> · Added {u.createdAt}
                </div>
              </div>

              {/* Deactivate/Reactivate Button */}
              <button
                onClick={() => handleToggleUserActive(u.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold flex items-center gap-1 ${
                  u.active
                    ? 'bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 hover:bg-red-200'
                    : 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300 hover:bg-green-200'
                }`}
                title={u.active ? 'Deactivate user' : 'Reactivate user'}
              >
                {u.active ? (
                  <>
                    <UserX className="w-3 h-3 text-red-600" />
                    <span>deactivate</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-3 h-3 text-green-600" />
                    <span>activate</span>
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Add New Staff Modal */}
      {showAddUserModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <form
            onSubmit={handleAddUser}
            className="bg-brand-creme dark:bg-brand-espresso rounded-2xl max-w-sm w-full p-5 space-y-4 border border-brand-biscuit/40 dark:border-brand-biscuit/20 shadow-2xl"
          >
            <div className="flex items-center justify-between border-b border-brand-biscuit/30 pb-2">
              <h3 className="font-serif text-lg font-bold text-brand-espresso dark:text-brand-creme lowercase">
                add new staff account
              </h3>
              <button
                type="button"
                onClick={() => setShowAddUserModal(false)}
                className="w-7 h-7 rounded-full bg-brand-biscuit/30 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs font-sans">
              <div>
                <label className="block text-brand-walnut dark:text-brand-biscuit mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rohan Sharma"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-brand-biscuit/20 dark:bg-brand-espresso border border-brand-biscuit/40 text-brand-espresso dark:text-brand-creme focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-brand-walnut dark:text-brand-biscuit mb-1">Role</label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as Role)}
                  className="w-full p-2.5 rounded-xl bg-brand-biscuit/20 dark:bg-brand-espresso border border-brand-biscuit/40 text-brand-espresso dark:text-brand-creme focus:outline-none"
                >
                  <option value="cashier">Cashier / Counter</option>
                  <option value="kitchen">Kitchen</option>
                  <option value="chef">Chef (Inventory)</option>
                  <option value="admin">Admin (Menu/QR)</option>
                  <option value="super_admin">Super Admin (Owner)</option>
                </select>
              </div>

              <div>
                <label className="block text-brand-walnut dark:text-brand-biscuit mb-1">4-Digit Security PIN</label>
                <input
                  type="text"
                  maxLength={4}
                  required
                  placeholder="e.g. 5555"
                  value={newUserPin}
                  onChange={(e) => setNewUserPin(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-brand-biscuit/20 dark:bg-brand-espresso border border-brand-biscuit/40 text-brand-espresso dark:text-brand-creme focus:outline-none font-mono font-bold"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-brand-cherry text-white font-bold text-xs shadow-lg active:scale-95"
            >
              create staff account
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
