import { useEffect, useState, useRef } from 'react';
import type { Product, Category } from '@/lib/db';

import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
} from '@/lib/supabase-db';

import {
  Plus,
  Search,
  Edit2,
  Trash2,
  Package as PackageIcon,
  Camera,
  X,
  Copy,
} from 'lucide-react';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { compressImage } from '@/lib/image-utils';
import { toast } from 'sonner';

export default function Produk() {
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const [dialogOpen, setDialogOpen] = useState(false);

  const [deleteId, setDeleteId] = useState<number | null>(null);

  const [editProduct, setEditProduct] = useState<any | null>(null);

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);

  // Form
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [price, setPrice] = useState('');
  const [hpp, setHpp] = useState('');
  const [stock, setStock] = useState('');
  const [unit, setUnit] = useState('pcs');
  const [barcode, setBarcode] = useState('');
  const [photo, setPhoto] = useState<string | undefined>(undefined);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadData = async () => {
    try {
      const prod = await getProducts();
      const cat = await getCategories();

      setProducts(prod || []);
      setCategories(cat || []);
    } catch (err) {
      console.error(err);
      toast.error('Gagal memuat data');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = products.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());

    const matchCategory =
      filterCategory === 'all' ||
      p.category_id === Number(filterCategory);

    return matchSearch && matchCategory;
  });

  const getCategoryName = (catId: number) =>
    categories.find((c) => c.id === catId)?.name ?? '-';

  const getCategoryColor = (catId: number) =>
    categories.find((c) => c.id === catId)?.color ?? '#999';

  const openAdd = () => {
    setEditProduct(null);

    setName('');
    setSku('');
    setCategoryId(categories?.[0]?.id?.toString() ?? '');
    setPrice('');
    setHpp('');
    setStock('');
    setUnit('pcs');
    setBarcode('');
    setPhoto(undefined);

    setDialogOpen(true);
  };

  const openEdit = (p: any) => {
    setEditProduct(p);

    setName(p.name);
    setSku(p.sku);
    setCategoryId(p.category_id.toString());
    setPrice(p.price.toString());
    setHpp(p.hpp.toString());
    setStock(p.stock.toString());
    setUnit(p.unit);
    setBarcode(p.barcode ?? '');
    setPhoto(p.photo ?? undefined);

    setDialogOpen(true);
  };

  const handlePhotoSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('File harus berupa gambar');
      return;
    }

    try {
      const compressed = await compressImage(file);
      setPhoto(compressed);
    } catch {
      toast.error('Gagal memproses gambar');
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = async () => {
    if (!name.trim() || !categoryId || !sku.trim()) return;

    try {
      const data = {
        name: name.trim(),
        sku: sku.trim(),
        category_id: Number(categoryId),
        price: Number(price) || 0,
        hpp: Number(hpp) || 0,
        stock: Number(stock) || 0,
        unit: unit.trim() || 'pcs',
        barcode: barcode.trim() || null,
        photo: photo || null,
      };

      if (editProduct?.id) {
        await updateProduct(editProduct.id, data);

        toast.success('Produk berhasil diupdate');
      } else {
        await createProduct(data);

        toast.success('Produk berhasil ditambahkan');
      }

      await loadData();

      setDialogOpen(false);
    } catch (err) {
      console.error(err);

      toast.error('Gagal menyimpan produk');
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;

    try {
      await deleteProduct(deleteId);

      await loadData();

      toast.success('Produk berhasil dihapus');
    } catch (err) {
      console.error(err);

      toast.error('Gagal menghapus produk');
    }

    setDeleteId(null);
  };

  return (
    <div className="px-4 pt-6 pb-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold flex items-center gap-2">
          <PackageIcon className="w-5 h-5 text-primary" />
          Produk
        </h1>

        <Button
          size="sm"
          onClick={openAdd}
          className="h-9 gap-1.5"
        >
          <Plus className="w-4 h-4" />
          Tambah
        </Button>
      </div>

      {/* Search */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />

          <Input
            placeholder="Cari produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10"
          />
        </div>

        <Select
          value={filterCategory}
          onValueChange={setFilterCategory}
        >
          <SelectTrigger className="w-[120px] h-10">
            <SelectValue placeholder="Kategori" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="all">Semua</SelectItem>

            {categories?.map((c) => (
              <SelectItem
                key={c.id}
                value={c.id!.toString()}
              >
                {c.icon} {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Count */}
      <p className="text-xs text-muted-foreground">
        {filtered.length} produk ditemukan
      </p>

      {/* Product list */}
      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <PackageIcon className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />

          <p className="text-sm text-muted-foreground">
            Belum ada produk
          </p>

          <Button
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={openAdd}
          >
            <Plus className="w-4 h-4 mr-1" />
            Tambah Produk
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => (
            <Card key={p.id} className="border-0 shadow-sm">
              <CardContent className="p-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                    {p.photo ? (
                      <img
                        src={p.photo}
                        alt={p.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <PackageIcon className="w-5 h-5 text-muted-foreground/40" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-semibold truncate">
                        {p.name}
                      </h3>

                      <Badge
                        variant="outline"
                        className="text-[10px] shrink-0"
                        style={{
                          borderColor: getCategoryColor(
                            p.category_id
                          ),
                          color: getCategoryColor(
                            p.category_id
                          ),
                        }}
                      >
                        {getCategoryName(p.category_id)}
                      </Badge>
                    </div>

                    <p className="text-xs text-muted-foreground mt-0.5">
                      SKU: {p.sku || '-'}
                    </p>

                    <div className="flex items-center gap-3 mt-1.5">
                      <span className="text-sm font-bold text-primary">
                        Rp {p.price.toLocaleString('id-ID')}
                      </span>

                      <span className="text-xs text-muted-foreground">
                        HPP: Rp {p.hpp.toLocaleString('id-ID')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={cn(
                          'text-xs font-medium px-1.5 py-0.5 rounded',
                          p.stock <= 5
                            ? 'bg-destructive/10 text-destructive'
                            : 'bg-success/10 text-success'
                        )}
                      >
                        Stok: {p.stock} {p.unit}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEdit(p)}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => setDeleteId(p.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
