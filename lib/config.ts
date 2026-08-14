import { Role } from './types';

export const APP_CONFIG = {
  appName: 'smol café',
  tagline: 'small place. long stay.',
  location: 'Tapovan, Rishikesh',
  taxRatePercent: 5, // 5% GST standard for cafes
  defaultDiscountPercent: 0,
  expiringSoonDaysThreshold: 2, // items expiring within 2 days flagged as expiring soon
  kitchenPollingIntervalMs: 5000,
  defaultCurrency: '₹',
  orderPrefix: 'SMOL-',
  demoUsers: [
    { id: 'u1', name: 'Owner (Sonu)', role: 'super_admin' as Role, pin: '9999', active: true, createdAt: '2026-08-01' },
    { id: 'u2', name: 'Manager (Rahul)', role: 'admin' as Role, pin: '1111', active: true, createdAt: '2026-08-01' },
    { id: 'u3', name: 'Cashier (Priya)', role: 'cashier' as Role, pin: '2222', active: true, createdAt: '2026-08-02' },
    { id: 'u4', name: 'Chef (Aman)', role: 'kitchen' as Role, pin: '3333', active: true, createdAt: '2026-08-02' },
    { id: 'u5', name: 'Inventory Chef (Vikram)', role: 'chef' as Role, pin: '4444', active: true, createdAt: '2026-08-03' },
  ],
  quoteLines: [
    "a café people remember because stories happen there.",
    "invite people in; never make them perform belonging.",
    "slow mornings, quiet coffee & books.",
    "familiar comforts beside small experiments.",
    "thank you for lingering with us at smol café."
  ]
};
