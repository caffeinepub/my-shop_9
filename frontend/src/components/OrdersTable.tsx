import { useState } from 'react';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { formatPrice, formatDate } from '@/lib/utils';
import { useUpdateOrderStatus } from '@/hooks/useQueries';
import type { Order, Product } from '../backend';

interface OrdersTableProps {
  orders: Order[];
  products: Product[];
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800 border-amber-200',
  fulfilled: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
};

export default function OrdersTable({ orders, products }: OrdersTableProps) {
  const updateStatus = useUpdateOrderStatus();
  const [updatingId, setUpdatingId] = useState<bigint | null>(null);

  const getProductTitle = (productId: bigint) => {
    const p = products.find(p => p.id === productId);
    return p?.title ?? `Product #${productId}`;
  };

  const handleStatusChange = async (orderId: bigint, status: string) => {
    setUpdatingId(orderId);
    try {
      await updateStatus.mutateAsync({ id: orderId, status });
    } finally {
      setUpdatingId(null);
    }
  };

  if (orders.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <p className="text-lg font-medium">No orders yet</p>
        <p className="text-sm mt-1">Orders will appear here once customers check out.</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-border">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50">
            <TableHead className="w-16">Order</TableHead>
            <TableHead>Buyer</TableHead>
            <TableHead>Items</TableHead>
            <TableHead className="text-right">Total</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map(order => (
            <TableRow key={order.id.toString()} className="hover:bg-accent/30">
              <TableCell className="font-mono text-xs text-muted-foreground">
                #{order.id.toString()}
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium text-sm">{order.buyerName}</p>
                  <p className="text-xs text-muted-foreground">{order.buyerEmail}</p>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-0.5">
                  {order.items.map((item, idx) => (
                    <p key={idx} className="text-xs text-muted-foreground">
                      {getProductTitle(item.productId)} × {item.quantity.toString()}
                    </p>
                  ))}
                </div>
              </TableCell>
              <TableCell className="text-right font-semibold text-primary">
                {formatPrice(order.totalPrice)}
              </TableCell>
              <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                {formatDate(order.createdAt)}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {updatingId === order.id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  ) : (
                    <Select
                      value={order.status}
                      onValueChange={(val) => handleStatusChange(order.id, val)}
                    >
                      <SelectTrigger className="h-7 w-32 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="fulfilled">Fulfilled</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                  )}
                  <Badge
                    variant="outline"
                    className={`text-xs capitalize ${STATUS_COLORS[order.status] ?? ''}`}
                  >
                    {order.status}
                  </Badge>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
