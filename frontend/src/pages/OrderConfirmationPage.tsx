import { useSearch, useNavigate } from '@tanstack/react-router';
import { CheckCircle2, ShoppingBag, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatPrice } from '@/lib/utils';

export default function OrderConfirmationPage() {
  const search = useSearch({ from: '/order-confirmation' });
  const navigate = useNavigate();

  const orderId = (search as Record<string, string>).orderId ?? '';
  const buyerName = (search as Record<string, string>).buyerName ?? '';
  const total = (search as Record<string, string>).total ?? '0';

  return (
    <div className="container mx-auto px-4 py-20 max-w-lg text-center">
      <div className="bg-card rounded-2xl border border-border p-10 shadow-card">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-9 h-9 text-green-600" />
        </div>

        <h1 className="font-display text-3xl font-bold text-foreground mb-2">
          Order Confirmed!
        </h1>
        <p className="text-muted-foreground mb-6">
          Thank you{buyerName ? `, ${buyerName}` : ''}! Your order has been placed successfully.
        </p>

        <div className="bg-accent rounded-xl p-4 mb-6 text-left space-y-2">
          {orderId && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Order ID</span>
              <span className="font-mono font-medium">#{orderId}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Paid</span>
            <span className="font-bold text-primary font-display">
              {formatPrice(BigInt(total))}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <span className="text-amber-700 font-medium">Pending</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            className="flex-1 gap-2"
            onClick={() => navigate({ to: '/' })}
          >
            <ShoppingBag className="w-4 h-4" />
            Continue Shopping
          </Button>
          <Button
            variant="outline"
            className="flex-1 gap-2"
            onClick={() => navigate({ to: '/seller' })}
          >
            <LayoutDashboard className="w-4 h-4" />
            View Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
