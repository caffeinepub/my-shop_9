import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Order {
    id: bigint;
    status: string;
    buyerEmail: string;
    createdAt: string;
    items: Array<OrderItem>;
    buyerName: string;
    totalPrice: bigint;
}
export interface Product {
    id: bigint;
    title: string;
    createdAt: string;
    description: string;
    stock: bigint;
    imageUrl: string;
    category: string;
    sellerId: string;
    price: bigint;
}
export interface OrderItem {
    productId: bigint;
    quantity: bigint;
    price: bigint;
}
export interface backendInterface {
    addProduct(product: Product): Promise<bigint>;
    createOrder(order: Order): Promise<bigint>;
    deleteProduct(id: bigint): Promise<void>;
    getAllOrders(): Promise<Array<Order>>;
    getAllProducts(): Promise<Array<Product>>;
    getOrder(id: bigint): Promise<Order | null>;
    getOrdersByBuyer(email: string): Promise<Array<Order>>;
    getOrdersBySeller(sellerId: string): Promise<Array<Order>>;
    getProduct(id: bigint): Promise<Product | null>;
    getProductsByCategory(category: string): Promise<Array<Product>>;
    getProductsBySeller(sellerId: string): Promise<Array<Product>>;
    updateOrderStatus(id: bigint, status: string): Promise<void>;
    updateProduct(id: bigint, product: Product): Promise<void>;
}
