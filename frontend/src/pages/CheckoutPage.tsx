import { useState } from 'react';
import { useNavigate } from '@tanstack/react-router';
import { Loader2, ShoppingBag, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';
import { useCreateOrder } from '@/hooks/useQueries';
import { formatPrice, now } from '@/lib/utils';
import type { Order } from '../backend';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCart();
  const createOrder = useCreateOrder();

  const [form, setForm] = useState({ name: '', email: '' });
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});

  if (items.length === 0) {
    navigate({ to: '/' });
    return null;
  }

  const validate = () => {
    const errs: typeof errors = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Valid email is required';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const order: Order = {
      id: BigInt(0),
      buyerName: form.name.trim(),
      buyerEmail: form.email.trim(),
      items: items.map(i => ({
        productId: i.productId,
        quantity: BigInt(i.quantity),
        price: i.price,
      })),
      totalPrice,
      status: 'pending',
      createdAt: now(),
    };

    try {
      const orderId = await createOrder.mutateAsync(order);
      clearCart();
      navigate({
        to: '/order-confirmation',
        search: {
          orderId: orderId.toString(),
          buyerName: form.name,
          total: totalPrice.toString(),
        },
      });
    } catch (err) {
      console.error('Order failed:', err);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate({ to: '/cart' })}
        className="mb-6 gap-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Cart
      </Button>

      <h1 className="font-display text-3xl font-bold mb-8">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Form */}
        <div>
          <h2 className="font-semibold text-lg mb-4">Your Information</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                placeholder="Jane Smith"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address *</Label>
              <Input
                id="email"
                type="email"
                placeholder="jane@example.com"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            {createOrder.isError && (
              <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-3 py-2">
                Something went wrong. Please try again.
              </p>
            )}

            <Button
              type="submit"
              size="lg"
              className="w-full gap-2 mt-2"
              disabled={createOrder.isPending}
            >
              {createOrder.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ShoppingBag className="w-4 h-4" />
              )}
              {createOrder.isPending ? 'Placing Order...' : `Place Order · ${formatPrice(totalPrice)}`}
            </Button>
          </form>
        </div>

        {/* Order Summary */}
        <div>
          <h2 className="font-semibold text-lg mb-4">Order Summary</h2>
          <div className="bg-card rounded-xl border border-border p-5 space-y-3">
            {items.map(item => (
              <div key={item.productId.toString()} className="flex justify-between text-sm">
                <span className="text-muted-foreground truncate mr-2">
                  {item.title} × {item.quantity}
                </span>
                <span className="font-medium shrink-0">
                  {formatPrice(item.price * BigInt(item.quantity))}
                </span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between font-bold text-base">
              <span>Total</span>
              <span className="text-primary font-display">{formatPrice(totalPrice)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
