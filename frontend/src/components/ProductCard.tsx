import { Link } from '@tanstack/react-router';
import { ShoppingCart, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/utils';
import type { Product } from '../backend';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { addItem, items } = useCart();
  const inCart = items.find(i => i.productId === product.id);
  const outOfStock = product.stock === BigInt(0);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    addItem({
      productId: product.id,
      title: product.title,
      price: product.price,
      imageUrl: product.imageUrl,
      stock: product.stock,
    });
  };

  return (
    <Link to="/product/$id" params={{ id: product.id.toString() }} className="group block">
      <div className="bg-card rounded-xl overflow-hidden shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1 border border-border h-full flex flex-col">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden bg-accent">
          {product.imageUrl ? (
            <img
              src={product.imageUrl}
              alt={product.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-12 h-12 text-muted-foreground/40" />
            </div>
          )}
          {outOfStock && (
            <div className="absolute inset-0 bg-background/60 flex items-center justify-center">
              <Badge variant="secondary" className="text-xs font-semibold">Out of Stock</Badge>
            </div>
          )}
          {product.category && (
            <Badge className="absolute top-2 left-2 text-xs bg-primary/90 text-primary-foreground border-0">
              {product.category}
            </Badge>
          )}
        </div>

        {/* Content */}
        <div className="p-4 flex flex-col flex-1 gap-2">
          <h3 className="font-semibold text-foreground line-clamp-2 leading-snug group-hover:text-primary transition-colors">
            {product.title}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2 flex-1">
            {product.description}
          </p>
          <div className="flex items-center justify-between mt-2 gap-2">
            <span className="text-lg font-bold text-primary font-display">
              {formatPrice(product.price)}
            </span>
            <Button
              size="sm"
              variant={inCart ? 'secondary' : 'default'}
              onClick={handleAddToCart}
              disabled={outOfStock}
              className="shrink-0 gap-1.5"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              {inCart ? 'In Cart' : 'Add'}
            </Button>
          </div>
          {!outOfStock && (
            <p className="text-xs text-muted-foreground">
              {Number(product.stock)} in stock
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
