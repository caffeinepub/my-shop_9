import { useParams, useNavigate } from '@tanstack/react-router';
import { ArrowLeft, ShoppingCart, Package, Tag, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetProduct } from '@/hooks/useQueries';
import { useCart } from '@/contexts/CartContext';
import { formatPrice, formatDate } from '@/lib/utils';

export default function ProductDetailPage() {
  const { id } = useParams({ from: '/product/$id' });
  const navigate = useNavigate();
  const productId = BigInt(id);
  const { data: product, isLoading } = useGetProduct(productId);
  const { addItem, items } = useCart();

  const inCart = items.find(i => i.productId === productId);
  const outOfStock = product ? product.stock === BigInt(0) : false;

  const handleAddToCart = () => {
    if (!product || outOfStock) return;
    addItem({
      productId: product.id,
      title: product.title,
      price: product.price,
      imageUrl: product.imageUrl,
      stock: product.stock,
    });
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-10 max-w-5xl">
        <Skeleton className="h-8 w-32 mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <Skeleton className="aspect-square rounded-2xl" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-12 w-full mt-6" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">😕</div>
        <h2 className="text-2xl font-semibold mb-2">Product not found</h2>
        <p className="text-muted-foreground mb-6">This product may have been removed.</p>
        <Button onClick={() => navigate({ to: '/' })}>Back to Shop</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => navigate({ to: '/' })}
        className="mb-6 gap-2 text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Shop
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* Image */}
        <div className="rounded-2xl overflow-hidden bg-accent aspect-square flex items-center justify-center border border-border">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <Package className="w-24 h-24 text-muted-foreground/30" />
          )}
        </div>

        {/* Details */}
        <div className="flex flex-col gap-4">
          {product.category && (
            <Badge variant="secondary" className="w-fit gap-1.5">
              <Tag className="w-3 h-3" />
              {product.category}
            </Badge>
          )}

          <h1 className="font-display text-3xl font-bold text-foreground leading-tight">
            {product.title}
          </h1>

          <div className="text-3xl font-bold text-primary font-display">
            {formatPrice(product.price)}
          </div>

          {product.description && (
            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          )}

          <div className="flex items-center gap-2 text-sm">
            <Layers className="w-4 h-4 text-muted-foreground" />
            {outOfStock ? (
              <span className="text-destructive font-medium">Out of stock</span>
            ) : (
              <span className="text-muted-foreground">
                <span className="font-semibold text-foreground">{Number(product.stock)}</span> in stock
              </span>
            )}
          </div>

          <div className="pt-2">
            <Button
              size="lg"
              onClick={handleAddToCart}
              disabled={outOfStock}
              variant={inCart ? 'secondary' : 'default'}
              className="w-full gap-2 text-base"
            >
              <ShoppingCart className="w-5 h-5" />
              {outOfStock ? 'Out of Stock' : inCart ? 'Added to Cart ✓' : 'Add to Cart'}
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Listed on {formatDate(product.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
}
