import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, X, Sparkles } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import ProductCard from '@/components/ProductCard';
import { useGetAllProducts } from '@/hooks/useQueries';

export default function ProductsPage() {
  const { data: products = [], isLoading } = useGetAllProducts();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category).filter(Boolean));
    return Array.from(cats).sort();
  }, [products]);

  const filtered = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = !search || p.title.toLowerCase().includes(search.toLowerCase());
      const matchesCat = !selectedCategory || p.category === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [products, search, selectedCategory]);

  return (
    <div>
      {/* Hero Banner */}
      <div className="relative w-full overflow-hidden" style={{ maxHeight: '480px' }}>
        <img
          src="/assets/generated/hero-banner.dim_1440x480.png"
          alt="Welcome to Dondon's little luxuries"
          className="w-full object-cover"
          style={{ maxHeight: '480px' }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-primary/60 via-primary/30 to-transparent flex items-center">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-6 h-6 text-white drop-shadow-lg animate-float" />
              <span className="text-white/90 font-semibold text-sm tracking-widest uppercase drop-shadow">
                Welcome to
              </span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl text-white drop-shadow-lg mb-3">
              Dondon's little luxuries
            </h1>
            <p className="text-white/90 text-base md:text-lg drop-shadow max-w-md font-medium">
              ✨ Cute, cuddly & totally adorable finds just for you! 🎀
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Search & Filter Bar */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search cute products... 🔍"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9 rounded-full border-primary/30 focus:border-primary"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <SlidersHorizontal className="w-4 h-4 text-muted-foreground shrink-0" />
            <Button
              variant={selectedCategory === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className="rounded-full"
            >
              All 🎀
            </Button>
            {categories.map(cat => (
              <Button
                key={cat}
                variant={selectedCategory === cat ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCategory(cat === selectedCategory ? null : cat)}
                className="rounded-full"
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {/* Results count */}
        {!isLoading && (
          <p className="text-sm text-muted-foreground mb-4">
            {filtered.length} product{filtered.length !== 1 ? 's' : ''} found
            {selectedCategory && (
              <span> in <Badge variant="secondary" className="ml-1 rounded-full">{selectedCategory}</Badge></span>
            )}
          </p>
        )}

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="rounded-3xl overflow-hidden border border-border">
                <Skeleton className="aspect-[4/3] w-full" />
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-3/4 rounded-full" />
                  <Skeleton className="h-3 w-full rounded-full" />
                  <Skeleton className="h-3 w-2/3 rounded-full" />
                  <div className="flex justify-between items-center pt-1">
                    <Skeleton className="h-6 w-16 rounded-full" />
                    <Skeleton className="h-8 w-20 rounded-full" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🎀</div>
            <h3 className="text-xl font-bold text-foreground mb-2">No products found~</h3>
            <p className="text-muted-foreground">
              {products.length === 0
                ? 'No products have been added yet. Check back soon! 💕'
                : 'Try adjusting your search or filters, cutie!'}
            </p>
            {(search || selectedCategory) && (
              <Button
                variant="outline"
                className="mt-4 rounded-full"
                onClick={() => { setSearch(''); setSelectedCategory(null); }}
              >
                Clear filters ✨
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filtered.map(product => (
              <ProductCard key={product.id.toString()} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
