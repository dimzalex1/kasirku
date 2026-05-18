import { supabase } from '@/lib/supabase';

export const ProductService = {
  async getAll() {
    return supabase
      .from('products')
      .select('*')
      .eq('is_deleted', 0);
  },

  async create(data: any) {
    return supabase.from('products').insert(data);
  },

  async update(id: number, data: any) {
    return supabase.from('products').update(data).eq('id', id);
  },

  async softDelete(id: number) {
    return supabase
      .from('products')
      .update({ is_deleted: 1, deleted_at: new Date().toISOString() })
      .eq('id', id);
  },
};
