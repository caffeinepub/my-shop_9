import { useState } from 'react';
import { Plus, Pencil, Trash2, Loader2, Package, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';
import { Skeleton } from '@/components/ui/skeleton';
import ProductForm from '@/components/ProductForm';
import OrdersTable from '@/components/OrdersTable';
import { useGetAllProducts, useGetAllOrders, useAddProduct, useUpdateProduct, useDeleteProduct } from '@/hooks/useQueries';
import { formatPrice } from '@/lib/utils';
import type { Product } from '../backend';
import { Package as PackageIcon } from 'lucide-react';

export default function SellerDashboardPage() {
  const { data: products = [], isLoading: loadingProducts } = useGetAllProducts();
  const { data: orders = [], isLoading: loadingOrders } = useGetAllOrders();
  const addProduct = useAddProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<bigint | null>(null);

  const handleOpenAdd = () => {
    setEditingProduct(undefined);
    setDialogOpen(true);
  };

  const handleOpenEdit = (product: Product) => {
    setEditingProduct(product);
    setDialogOpen(true);
  };

  const handleFormSubmit = async (product: Product) => {
    if (editingProduct) {
      await updateProduct.mutateAsync({ id: editingProduct.id, product });
    } else {
      await addProduct.mutateAsync(product);
    }
    setDialogOpen(false);
  };

  const handleDelete = async () => {
    if (deletingId === null) return;
    await deleteProduct.mutateAsync(deletingId);
    setDeletingId(null);
  };

  const isFormLoading = addProduct.isPending || updateProduct.isPending;

  // Stats
  const totalRevenue = orders
    .filter(o => o.status === 'fulfilled')
    .reduce((sum, o) => sum + o.totalPrice, BigInt(0));
  const pendingOrders = orders.filter(o => o.status === 'pending').length;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">Seller Dashboard</h1>
          <p className="text-muted-foreground mt-1">Manage your products and orders</p>
        </div>
        <Button onClick={handleOpenAdd} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" />
          Add Product
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Products', value: products.length.toString(), icon: <Package className="w-5 h-5" /> },
          { label: 'Total Orders', value: orders.length.toString(), icon: <ShoppingBag className="w-5 h-5" /> },
          { label: 'Pending Orders', value: pendingOrders.toString(), icon: <ShoppingBag className="w-5 h-5" />, highlight: pendingOrders > 0 },
          { label: 'Revenue (Fulfilled)', value: formatPrice(totalRevenue), icon: <ShoppingBag className="w-5 h-5" /> },
        ].map(stat => (
          <div key={stat.label} className={`bg-card rounded-xl border p-4 ${stat.highlight ? 'border-primary/40 bg-primary/5' : 'border-border'}`}>
            <div className={`mb-2 ${stat.highlight ? 'text-primary' : 'text-muted-foreground'}`}>
              {stat.icon}
            </div>
            <p className="text-2xl font-bold font-display text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="products">
        <TabsList className="mb-6">
          <TabsTrigger value="products" className="gap-2">
            <Package className="w-4 h-4" />
            Products ({products.length})
          </TabsTrigger>
          <TabsTrigger value="orders" className="gap-2">
            <ShoppingBag className="w-4 h-4" />
            Orders ({orders.length})
          </TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products">
          {loadingProducts ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-24 rounded-xl" />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed border-border rounded-2xl">
              <PackageIcon className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
              <h3 className="font-semibold text-foreground mb-1">No products yet</h3>
              <p className="text-sm text-muted-foreground mb-4">Add your first product to start selling.</p>
              <Button onClick={handleOpenAdd} className="gap-2">
                <Plus className="w-4 h-4" />
                Add Product
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map(product => (
                <div
                  key={product.id.toString()}
                  className="bg-card rounded-xl border border-border p-4 flex gap-3 hover:shadow-card transition-shadow"
                >
                  {/* Thumbnail */}
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-accent shrink-0 flex items-center justify-center">
                    {product.imageUrl ? (
                      <img
                        src={product.imageUrl}
                        alt={product.title}
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    ) : (
                      <PackageIcon className="w-6 h-6 text-muted-foreground/40" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-foreground line-clamp-1">{product.title}</h3>
                    <p className="text-primary font-bold text-sm font-display">{formatPrice(product.price)}</p>
                    <div className="flex items-center gap-2 mt-1">
                      {product.category && (
                        <Badge variant="secondary" className="text-xs px-1.5 py-0">{product.category}</Badge>
                      )}
                      <span className={`text-xs ${Number(product.stock) === 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                        {Number(product.stock) === 0 ? 'Out of stock' : `${Number(product.stock)} in stock`}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={() => handleOpenEdit(product)}
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => setDeletingId(product.id)}
                      disabled={deleteProduct.isPending && deletingId === product.id}
                    >
                      {deleteProduct.isPending && deletingId === product.id
                        ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        : <Trash2 className="w-3.5 h-3.5" />
                      }
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders">
          {loadingOrders ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          ) : (
            <OrdersTable orders={orders} products={products} />
          )}
        </TabsContent>
      </Tabs>

      {/* Add/Edit Product Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">
              {editingProduct ? 'Edit Product' : 'Add New Product'}
            </DialogTitle>
            <DialogDescription>
              {editingProduct
                ? 'Update the details for this product.'
                : 'Fill in the details to list a new product in your shop.'}
            </DialogDescription>
          </DialogHeader>
          <ProductForm
            existing={editingProduct}
            onSubmit={handleFormSubmit}
            onCancel={() => setDialogOpen(false)}
            isLoading={isFormLoading}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deletingId !== null} onOpenChange={open => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Product?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. The product will be permanently removed from your shop.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
