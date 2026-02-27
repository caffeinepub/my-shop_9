import { useNavigate, Link } from '@tanstack/react-router';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/utils';
import { Package } from 'lucide-react';

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems } = useCart();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center max-w-lg">
        <ShoppingBag className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="text-2xl font-display font-semibold mb-2">Your cart is empty</h2>
        <p className="text-muted-foreground mb-6">
          Looks like you haven't added anything yet. Start shopping!
        </p>
        <Button onClick={() => navigate({ to: '/' })} className="gap-2">
          <ShoppingBag className="w-4 h-4" />
          Browse Products
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="font-display text-3xl font-bold mb-6">
        Shopping Cart
        <span className="text-muted-foreground text-lg font-normal ml-3">
          ({totalItems} item{totalItems !== 1 ? 's' : ''})
        </span>
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map(item => (
            <div
              key={item.productId.toString()}
              className="bg-card rounded-xl border border-border p-4 flex gap-4"
            >
              {/* Image */}
              <Link to="/product/$id" params={{ id: item.productId.toString() }}>
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-accent shrink-0 flex items-center justify-center">
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  ) : (
                    <Package className="w-8 h-8 text-muted-foreground/40" />
                  )}
                </div>
              </Link>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <Link to="/product/$id" params={{ id: item.productId.toString() }}>
                  <h3 className="font-semibold text-foreground hover:text-primary transition-colors line-clamp-1">
                    {item.title}
                  </h3>
                </Link>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {formatPrice(item.price)} each
                </p>

                {/* Quantity controls */}
                <div className="flex items-center gap-2 mt-3">
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                  >
                    <Minus className="w-3 h-3" />
                  </Button>
                  <span className="w-8 text-center font-medium text-sm">{item.quantity}</span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                    disabled={item.quantity >= Number(item.stock)}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-destructive hover:text-destructive ml-2"
                    onClick={() => removeItem(item.productId)}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              {/* Subtotal */}
              <div className="text-right shrink-0">
                <p className="font-bold text-primary font-display">
                  {formatPrice(item.price * BigInt(item.quantity))}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="bg-card rounded-xl border border-border p-6 sticky top-24">
            <h2 className="font-display font-semibold text-lg mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              {items.map(item => (
                <div key={item.productId.toString()} className="flex justify-between text-muted-foreground">
                  <span className="truncate mr-2">{item.title} × {item.quantity}</span>
                  <span className="shrink-0">{formatPrice(item.price * BigInt(item.quantity))}</span>
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span className="text-primary font-display">{formatPrice(totalPrice)}</span>
            </div>
            <Button
              className="w-full mt-4 gap-2"
              size="lg"
              onClick={() => navigate({ to: '/checkout' })}
            >
              Proceed to Checkout
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              className="w-full mt-2 text-muted-foreground"
              onClick={() => navigate({ to: '/' })}
            >
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
