import { supabase } from './supabase';

export async function getCategories() {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('is_deleted', 0)
    .order('id', { ascending: true });

  if (error) throw error;
  return data;
}

export async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(*)')
    .eq('is_deleted', 0)
    .order('id', { ascending: true });

  if (error) throw error;
  return data;
}

export async function createProduct(product: {
  name: string;
  sku: string;
  category_id: number;
  price: number;
  hpp: number;
  stock: number;
  unit: string;
  photo?: string;
  barcode?: string;
}) {
  const { data, error } = await supabase
    .from('products')
    .insert(product)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProduct(id: number, product: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('products')
    .update({
      ...product,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
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

  if (error) throw error;
}
