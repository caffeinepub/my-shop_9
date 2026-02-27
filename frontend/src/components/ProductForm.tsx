import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2 } from 'lucide-react';
import { now } from '@/lib/utils';
import type { Product } from '../backend';

interface ProductFormProps {
  existing?: Product;
  onSubmit: (product: Product) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const EMPTY_FORM = {
  title: '',
  description: '',
  price: '',
  stock: '',
  category: '',
  imageUrl: '',
};

export default function ProductForm({ existing, onSubmit, onCancel, isLoading }: ProductFormProps) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState<Partial<typeof EMPTY_FORM>>({});

  useEffect(() => {
    if (existing) {
      setForm({
        title: existing.title,
        description: existing.description,
        price: (Number(existing.price) / 100).toFixed(2),
        stock: existing.stock.toString(),
        category: existing.category,
        imageUrl: existing.imageUrl,
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [existing]);

  const validate = () => {
    const errs: Partial<typeof EMPTY_FORM> = {};
    if (!form.title.trim()) errs.title = 'Title is required';
    if (!form.price || isNaN(Number(form.price)) || Number(form.price) < 0) errs.price = 'Valid price required';
    if (!form.stock || isNaN(Number(form.stock)) || Number(form.stock) < 0) errs.stock = 'Valid stock required';
    if (!form.category.trim()) errs.category = 'Category is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    const product: Product = {
      id: existing?.id ?? BigInt(0),
      title: form.title.trim(),
      description: form.description.trim(),
      price: BigInt(Math.round(Number(form.price) * 100)),
      stock: BigInt(Math.max(0, Math.floor(Number(form.stock)))),
      category: form.category.trim(),
      imageUrl: form.imageUrl.trim(),
      sellerId: existing?.sellerId ?? 'seller',
      createdAt: existing?.createdAt ?? now(),
    };
    await onSubmit(product);
  };

  const field = (key: keyof typeof EMPTY_FORM) => ({
    value: form[key],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm(f => ({ ...f, [key]: e.target.value })),
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2 space-y-1.5">
          <Label htmlFor="title">Product Title *</Label>
          <Input id="title" placeholder="e.g. Handmade Ceramic Mug" {...field('title')} />
          {errors.title && <p className="text-xs text-destructive">{errors.title}</p>}
        </div>

        <div className="sm:col-span-2 space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" placeholder="Describe your product..." rows={3} {...field('description')} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="price">Price (USD) *</Label>
          <Input id="price" type="number" step="0.01" min="0" placeholder="0.00" {...field('price')} />
          {errors.price && <p className="text-xs text-destructive">{errors.price}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="stock">Stock Quantity *</Label>
          <Input id="stock" type="number" min="0" step="1" placeholder="0" {...field('stock')} />
          {errors.stock && <p className="text-xs text-destructive">{errors.stock}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="category">Category *</Label>
          <Input id="category" placeholder="e.g. Ceramics, Jewelry..." {...field('category')} />
          {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="imageUrl">Image URL</Label>
          <Input id="imageUrl" placeholder="https://..." {...field('imageUrl')} />
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button type="submit" disabled={isLoading} className="flex-1 gap-2">
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
          {existing ? 'Save Changes' : 'Add Product'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
