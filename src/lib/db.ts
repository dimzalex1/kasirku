import Dexie, { type Table } from 'dexie';

// === Interfaces ===

export interface Category {
  id?: number;
  name: string;
  color: string;
  icon: string;
  createdAt: Date;
  isDeleted: number; // 0 = active, 1 = deleted
  deletedAt: Date | null;
}

export interface Product {
  id?: number;
  name: string;
  sku?: string; // ← dibuat optional agar aman untuk data lama
  categoryId: number;
  price: number;
  hpp: number;
  stock: number;
  unit: string;
  photo?: string;
  barcode?: string;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: number;
  deletedAt: Date | null;
}

export interface Supplier {
  id?: number;
  name: string;
  phone: string;
  address: string;
  notes: string;
  createdAt: Date;
  isDeleted: number;
  deletedAt: Date | null;
}

export interface StockIn {
  id?: number;
  productId: number;
  supplierId: number;
  quantity: number;
  buyPrice: number;
  totalPrice: number;
  date: Date;
  notes: string;
}

export interface StockOut {
  id?: number;
  productId: number;
  quantity: number;
  reason: string;
  date: Date;
  notes: string;
}

export interface HppHistory {
  id?: number;
  productId: number;
  oldHpp: number;
  newHpp: number;
  source: 'stock_in' | 'manual';
  date: Date;
}

export interface PaymentMethod {
  id?: number;
  name: string;
  category: string;
  isDefault: boolean;
  createdAt: Date;
}

export interface Transaction {
  id?: number;
  subtotal: number;
  discountType: 'percentage' | 'nominal' | null;
  discountValue: number;
  discountAmount: number;
  total: number;
  paymentMethodId: number;
  paymentAmount: number;
  change: number;
  profit: number;
  date: Date;
  receiptNumber: string;
  status: 'open' | 'completed';
  orderNumber?: string;
  customerName?: string;
  tableNumber?: string;
  remarks?: string;
  openedAt?: Date;
  closedAt?: Date;
}

export interface TransactionItemRecord {
  id?: number;
  transactionId: number;
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  hpp: number;
  discountType: 'percentage' | 'nominal' | null;
  discountValue: number;
  discountAmount: number;
  subtotal: number;
  notes?: string;
}

export interface StoreSettings {
  id?: number;
  storeName: string;
  address: string;
  phone: string;
  receiptFooter: string;
  onboardingDone: boolean;
  lastBackupAt: Date | null;
  themeColor?: string;
  logo?: string;
  deviceId: string;
}

// === Database ===

class PosDatabase extends Dexie {
  categories!: Table<Category>;
  products!: Table<Product>;
  suppliers!: Table<Supplier>;
  stockIns!: Table<StockIn>;
  stockOuts!: Table<StockOut>;
  hppHistory!: Table<HppHistory>;
  paymentMethods!: Table<PaymentMethod>;
  transactions!: Table<Transaction>;
  transactionItems!: Table<TransactionItemRecord>;
  storeSettings!: Table<StoreSettings>;

  constructor() {
    super('kasirgratisan-db');

    this.version(1).stores({
      categories: '++id, name',
      products: '++id, name, sku, categoryId, barcode',
      suppliers: '++id, name',
      stockIns: '++id, productId, supplierId, date',
      stockOuts: '++id, productId, date',
      hppHistory: '++id, productId, date',
      paymentMethods: '++id, name, category',
      transactions: '++id, date, receiptNumber, paymentMethodId',
      storeSettings: '++id',
    });

    this.version(2).stores({
      categories: '++id, name, isDeleted',
      products: '++id, name, sku, categoryId, barcode, isDeleted',
      suppliers: '++id, name, isDeleted',
      stockIns: '++id, productId, supplierId, date',
      stockOuts: '++id, productId, date',
      hppHistory: '++id, productId, date',
      paymentMethods: '++id, name, category',
      transactions: '++id, date, &receiptNumber, paymentMethodId',
      transactionItems: '++id, transactionId, productId',
      storeSettings: '++id',
    }).upgrade(async (tx) => {
      const catTable = tx.table('categories');
      await catTable.toCollection().modify((cat: any) => {
        cat.isDeleted = 0;
        cat.deletedAt = null;
      });

      const prodTable = tx.table('products');
      await prodTable.toCollection().modify((prod: any) => {
        prod.isDeleted = 0;
        prod.deletedAt = null;
      });

      const supTable = tx.table('suppliers');
      await supTable.toCollection().modify((sup: any) => {
        sup.isDeleted = 0;
        sup.deletedAt = null;
      });

      const storeTable = tx.table('storeSettings');
      await storeTable.toCollection().modify((s: any) => {
        if (!s.deviceId) {
          s.deviceId = crypto.randomUUID();
        }
      });
    });

    this.version(3).stores({
      categories: '++id, name, isDeleted',
      products: '++id, name, sku, categoryId, barcode, isDeleted',
      suppliers: '++id, name, isDeleted',
      stockIns: '++id, productId, supplierId, date',
      stockOuts: '++id, productId, date',
      hppHistory: '++id, productId, date',
      paymentMethods: '++id, name, category',
      transactions: '++id, date, &receiptNumber, paymentMethodId, status, orderNumber',
      transactionItems: '++id, transactionId, productId',
      storeSettings: '++id',
    }).upgrade(async (tx) => {
      await tx.table('transactions').toCollection().modify((t: any) => {
        if (!t.status) {
          t.status = 'completed';
        }
      });
    });

    this.version(4).stores({
      categories: '++id, name, isDeleted',
      products: '++id, name, &sku, categoryId, barcode, isDeleted',
      suppliers: '++id, name, isDeleted',
      stockIns: '++id, productId, supplierId, date',
      stockOuts: '++id, productId, date',
      hppHistory: '++id, productId, date',
      paymentMethods: '++id, name, category',
      transactions: '++id, date, &receiptNumber, paymentMethodId, status, orderNumber',
      transactionItems: '++id, transactionId, productId',
      storeSettings: '++id',
    }).upgrade(async (tx) => {
      const prodTable = tx.table('products');
      const allProducts = await prodTable.toArray();

      const usedSku = new Set<string>();

      for (const p of allProducts as any[]) {
        let sku = p.sku;

        if (!sku || sku.trim() === '') {
          sku = `SKU-${p.id}`;
        }

        while (usedSku.has(sku)) {
          sku = `${sku}-${Math.floor(Math.random() * 1000)}`;
        }

        usedSku.add(sku);

        await prodTable.update(p.id, { sku });
      }
    });
  }
}

export const db = new PosDatabase();

// === Seed Default Data ===

export async function seedDefaultData() {
  const categoryCount = await db.categories.count();

  if (categoryCount === 0) {
    await db.categories.bulkAdd([
      {
        name: 'Makanan',
        color: '#FF6B35',
        icon: '🍕',
        createdAt: new Date(),
        isDeleted: 0,
        deletedAt: null,
      },
      {
        name: 'Minuman',
        color: '#4ECDC4',
        icon: '🥤',
        createdAt: new Date(),
        isDeleted: 0,
        deletedAt: null,
      },
      {
        name: 'Lainnya',
        color: '#95A5A6',
        icon: '📦',
        createdAt: new Date(),
        isDeleted: 0,
        deletedAt: null,
      },
    ]);
  }

  const pmCount = await db.paymentMethods.count();

  if (pmCount === 0) {
    await db.paymentMethods.bulkAdd([
      {
        name: 'Tunai',
        category: 'tunai',
        isDefault: true,
        createdAt: new Date(),
      },
      {
        name: 'Transfer Bank',
        category: 'transfer',
        isDefault: false,
        createdAt: new Date(),
      },
      {
        name: 'QRIS',
        category: 'qris',
        isDefault: false,
        createdAt: new Date(),
      },
    ]);
  }

  const storeCount = await db.storeSettings.count();

  if (storeCount === 0) {
    await db.storeSettings.add({
      storeName: 'Toko Saya',
      address: '',
      phone: '',
      receiptFooter: 'Terima kasih atas kunjungan Anda!',
      onboardingDone: false,
      lastBackupAt: null,
      deviceId: crypto.randomUUID(),
    });
  }
}
