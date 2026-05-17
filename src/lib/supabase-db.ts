import { supabase } from './supabase';

/* =========================
   CATEGORIES
========================= */

export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_deleted', 0)
    .order('id', { ascending: true });

  if (error) {
    throw error;
  }

  return data;
}

export async function createCategory(category: {
  name: string;
  color?: string;
  icon?: string;
}) {
  const { data, error } = await supabase
    .from('categories')
    .insert({
      name: category.name,
      color: category.color ?? null,
      icon: category.icon ?? null,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateCategory(
  id: number,
  category: {
    name?: string;
    color?: string;
    icon?: string;
  }
) {
  const { data, error } = await supabase
    .from('categories')
    .update(category)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteCategory(id: number) {
  const { error } = await supabase
    .from('categories')
    .update({
      is_deleted: 1,
      deleted_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    throw error;
  }
}

/* =========================
   PRODUCTS
========================= */

export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories (
        id,
        name,
        color,
        icon
      )
    `)
    .eq('is_deleted', 0)
    .order('id', { ascending: true });

  if (error) {
    throw error;
  }

  return data;
}

export async function getProductById(id: number) {
  const { data, error } = await supabase
    .from('products')
    .select(`
      *,
      categories (
        id,
        name,
        color,
        icon
      )
    `)
    .eq('id', id)
    .eq('is_deleted', 0)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function createProduct(product: {
  name: string;
  sku: string;
  category_id?: number | null;
  price: number;
  hpp?: number;
  stock?: number;
  unit?: string;
  photo?: string | null;
  barcode?: string | null;
}) {
  const { data, error } = await supabase
    .from('products')
    .insert({
      name: product.name,
      sku: product.sku,
      category_id: product.category_id ?? null,
      price: product.price,
      hpp: product.hpp ?? 0,
      stock: product.stock ?? 0,
      unit: product.unit ?? 'pcs',
      photo: product.photo ?? null,
      barcode: product.barcode ?? null,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateProduct(
  id: number,
  product: {
    name?: string;
    sku?: string;
    category_id?: number | null;
    price?: number;
    hpp?: number;
    stock?: number;
    unit?: string;
    photo?: string | null;
    barcode?: string | null;
  }
) {
  const { data, error } = await supabase
    .from('products')
    .update({
      ...product,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteProduct(id: number) {
  const { error } = await supabase
    .from('products')
    .update({
      is_deleted: 1,
      deleted_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    throw error;
  }
}

/* =========================
   SUPPLIERS
========================= */

export async function getSuppliers() {
  const { data, error } = await supabase
    .from('suppliers')
    .select('*')
    .eq('is_deleted', 0)
    .order('id', { ascending: true });

  if (error) {
    throw error;
  }

  return data;
}

export async function createSupplier(supplier: {
  name: string;
  phone?: string;
  address?: string;
  notes?: string;
}) {
  const { data, error } = await supabase
    .from('suppliers')
    .insert({
      name: supplier.name,
      phone: supplier.phone ?? null,
      address: supplier.address ?? null,
      notes: supplier.notes ?? null,
    })
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateSupplier(
  id: number,
  supplier: {
    name?: string;
    phone?: string;
    address?: string;
    notes?: string;
  }
) {
  const { data, error } = await supabase
    .from('suppliers')
    .update(supplier)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function deleteSupplier(id: number) {
  const { error } = await supabase
    .from('suppliers')
    .update({
      is_deleted: 1,
      deleted_at: new Date().toISOString(),
    })
    .eq('id', id);

  if (error) {
    throw error;
  }
}

/* =========================
   PAYMENT METHODS
========================= */

export async function getPaymentMethods() {
  const { data, error } = await supabase
    .from('payment_methods')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    throw error;
  }

  return data;
}

/* =========================
   TRANSACTIONS
========================= */

export async function getTransactions() {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      *,
      payment_methods (
        id,
        name,
        category
      ),
      transaction_items (
        id,
        product_id,
        product_name,
        quantity,
        price,
        hpp,
        discount_type,
        discount_value,
        discount_amount,
        subtotal,
        notes
      )
    `)
    .order('date', { ascending: false });

  if (error) {
    throw error;
  }

  return data;
}

export async function createTransaction(transaction: {
  subtotal: number;
  discount_type?: string | null;
  discount_value?: number;
  discount_amount?: number;
  total: number;
  payment_method_id?: number | null;
  payment_amount?: number;
  change?: number;
  profit?: number;
  receipt_number: string;
  status?: string;
  order_number?: string | null;
  customer_name?: string | null;
  table_number?: string | null;
  remarks?: string | null;
  items: Array<{
    product_id?: number | null;
    product_name: string;
    quantity: number;
    price: number;
    hpp?: number;
    discount_type?: string | null;
    discount_value?: number;
    discount_amount?: number;
    subtotal: number;
    notes?: string | null;
  }>;
}) {
  const { data: createdTransaction, error: transactionError } = await supabase
    .from('transactions')
    .insert({
      subtotal: transaction.subtotal,
      discount_type: transaction.discount_type ?? null,
      discount_value: transaction.discount_value ?? 0,
      discount_amount: transaction.discount_amount ?? 0,
      total: transaction.total,
      payment_method_id: transaction.payment_method_id ?? null,
      payment_amount: transaction.payment_amount ?? 0,
      change: transaction.change ?? 0,
      profit: transaction.profit ?? 0,
      receipt_number: transaction.receipt_number,
      status: transaction.status ?? 'completed',
      order_number: transaction.order_number ?? null,
      customer_name: transaction.customer_name ?? null,
      table_number: transaction.table_number ?? null,
      remarks: transaction.remarks ?? null,
    })
    .select()
    .single();

  if (transactionError) {
    throw transactionError;
  }

  const transactionItems = transaction.items.map((item) => ({
    transaction_id: createdTransaction.id,
    product_id: item.product_id ?? null,
    product_name: item.product_name,
    quantity: item.quantity,
    price: item.price,
    hpp: item.hpp ?? 0,
    discount_type: item.discount_type ?? null,
    discount_value: item.discount_value ?? 0,
    discount_amount: item.discount_amount ?? 0,
    subtotal: item.subtotal,
    notes: item.notes ?? null,
  }));

  const { error: itemsError } = await supabase
    .from('transaction_items')
    .insert(transactionItems);

  if (itemsError) {
    throw itemsError;
  }

  return createdTransaction;
}

/* =========================
   STORE SETTINGS
========================= */

export async function getStoreSettings() {
  const { data, error } = await supabase
    .from('store_settings')
    .select('*')
    .order('id', { ascending: true })
    .limit(1)
    .single();

  if (error) {
    throw error;
  }

  return data;
}

export async function updateStoreSettings(settings: {
  store_name?: string;
  address?: string;
  phone?: string;
  receipt_footer?: string;
  onboarding_done?: boolean;
  theme_color?: string | null;
  logo?: string | null;
}) {
  const currentSettings = await getStoreSettings();

  const { data, error } = await supabase
    .from('store_settings')
    .update(settings)
    .eq('id', currentSettings.id)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}
