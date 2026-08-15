import { MenuItem } from './types';

export interface CartCustomization {
  brewMethod?: string;
  strength?: string;
  milkPreference?: string;
  addOns?: string[];
}

export interface CartItem {
  id: string;
  menuItem: MenuItem;
  quantity: number;
  customization?: CartCustomization;
  pairing?: MenuItem;
  totalPrice: number;
}

export interface CustomerState {
  tableNo: string;
  guestCount: number;
  cart: CartItem[];
  favourites: string[];
  loyaltyPoints: number;
  rewardsUnlocked: number;
  activeOrder: {
    orderNo: string;
    items: CartItem[];
    status: 'brewing' | 'preparing' | 'ready';
    estimatedMinutes: number;
    createdAt: string;
  } | null;
}

const STORAGE_KEY = 'smol_customer_store_v1';

const defaultState: CustomerState = {
  tableNo: '07',
  guestCount: 2,
  cart: [
    {
      id: 'cart-1',
      menuItem: {
        id: 'item-1',
        name: 'tapovan pour over',
        categoryId: 'cat-1',
        price: 180,
        description: 'single-origin South Indian estate beans, light floral notes',
        available: true,
        isVeg: true,
        isSpecial: true,
      },
      quantity: 1,
      customization: {
        brewMethod: 'Pour over',
        strength: 'Balanced',
        milkPreference: 'No milk',
      },
      totalPrice: 180,
    },
    {
      id: 'cart-2',
      menuItem: {
        id: 'item-3',
        name: 'oat milk flat white',
        categoryId: 'cat-1',
        price: 210,
        description: 'creamy microfoam oat milk over velvety espresso',
        available: true,
        isVeg: true,
      },
      quantity: 1,
      customization: {
        milkPreference: 'Oat milk (+₹30)',
      },
      totalPrice: 240,
    },
    {
      id: 'cart-3',
      menuItem: {
        id: 'item-4',
        name: 'himalayan kulhad masala chai',
        categoryId: 'cat-2',
        price: 90,
        description: 'brewed with fresh lemongrass, ginger & green cardamom',
        available: true,
        isVeg: true,
      },
      quantity: 1,
      totalPrice: 90,
    },
    {
      id: 'cart-4',
      menuItem: {
        id: 'item-7',
        name: 'triple decker masala toast',
        categoryId: 'cat-3',
        price: 190,
        description: 'crispy, melty, wildly satisfying toast',
        available: true,
        isVeg: true,
      },
      quantity: 1,
      totalPrice: 190,
    },
  ],
  favourites: ['item-1', 'item-4', 'item-10'],
  loyaltyPoints: 487,
  rewardsUnlocked: 3,
  activeOrder: {
    orderNo: '#SMOL 0427',
    items: [],
    status: 'brewing',
    estimatedMinutes: 8,
    createdAt: new Date().toISOString(),
  },
};

class CustomerStore {
  private state: CustomerState;

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      this.state = saved ? JSON.parse(saved) : defaultState;
    } else {
      this.state = defaultState;
    }
  }

  private save() {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      window.dispatchEvent(new Event('smol_customer_store_change'));
    }
  }

  getState(): CustomerState {
    return this.state;
  }

  addToCart(item: MenuItem, customization?: CartCustomization, pairing?: MenuItem) {
    let extraPrice = 0;
    if (customization?.milkPreference?.includes('+₹30')) extraPrice += 30;
    if (pairing) extraPrice += pairing.price;

    const cartId = `cart-${Date.now()}`;
    const newItem: CartItem = {
      id: cartId,
      menuItem: item,
      quantity: 1,
      customization,
      pairing,
      totalPrice: item.price + extraPrice,
    };

    this.state.cart.push(newItem);
    this.save();
  }

  updateQuantity(cartId: string, delta: number) {
    const item = this.state.cart.find((c) => c.id === cartId);
    if (item) {
      item.quantity += delta;
      if (item.quantity <= 0) {
        this.state.cart = this.state.cart.filter((c) => c.id !== cartId);
      }
      this.save();
    }
  }

  clearCart() {
    this.state.cart = [];
    this.save();
  }

  toggleFavourite(itemId: string) {
    if (this.state.favourites.includes(itemId)) {
      this.state.favourites = this.state.favourites.filter((id) => id !== itemId);
    } else {
      this.state.favourites.push(itemId);
    }
    this.save();
  }

  placeOrder(): string {
    const orderNo = `#SMOL ${Math.floor(1000 + Math.random() * 9000)}`;
    this.state.activeOrder = {
      orderNo,
      items: [...this.state.cart],
      status: 'brewing',
      estimatedMinutes: 8 + Math.floor(Math.random() * 4),
      createdAt: new Date().toISOString(),
    };
    this.state.loyaltyPoints += Math.floor(this.getCartTotal() * 0.1);
    this.state.cart = [];
    this.save();
    return orderNo;
  }

  getCartTotal(): number {
    return this.state.cart.reduce((sum, item) => sum + item.totalPrice * item.quantity, 0);
  }
}

export const customerStore = new CustomerStore();
