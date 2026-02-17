/**
 * Travel Store API Service
 * 
 * API functions for the ecommerce store functionality.
 */

import api from './axios';

// Types
export interface ProductCategory {
    id: number;
    name: string;
    icon: string;
}

export interface Product {
    id: number;
    name: string;
    description: string;
    price: string;
    stock_quantity: number;
    image: string;
    category: number | null;
    category_name: string | null;
    rating: string;
    in_stock: boolean;
    is_wishlisted: boolean;
    created_at: string;
}

export interface WishlistItem {
    id: number;
    product: Product;
    created_at: string;
}

export interface CartItem {
    id: number;
    product: Product;
    quantity: number;
    subtotal: string;
}

export interface Cart {
    id: number;
    items: CartItem[];
    total_amount: string;
    total_items: number;
    updated_at: string;
}

export interface OrderItem {
    id: number;
    product_name: string;
    quantity: number;
    price: string;
    subtotal: string;
}

export interface Order {
    id: number;
    total_amount: string;
    status: 'pending' | 'paid' | 'cancelled';
    shipping_address: string;
    items: OrderItem[];
    created_at: string;
}

export interface ProductsResponse {
    count: number;
    results: Product[];
}

export interface WishlistResponse {
    count: number;
    results: WishlistItem[];
}

export interface OrdersResponse {
    count: number;
    results: Order[];
}

export interface CheckoutResponse {
    status: string;
    message: string;
    order_id: number;
    order: Order;
}

// API Functions

/**
 * Get all product categories
 */
export const getCategories = async (): Promise<ProductCategory[]> => {
    const response = await api.get<ProductCategory[]>('/store/categories/');
    return response.data;
};

/**
 * Get products with optional filters
 */
export const getProducts = async (params?: {
    search?: string;
    category?: number;
    sort?: 'price_low' | 'price_high' | 'rating';
}): Promise<ProductsResponse> => {
    const response = await api.get<ProductsResponse>('/store/products/', { params });
    return response.data;
};

/**
 * Get a single product by ID
 */
export const getProduct = async (productId: number): Promise<Product> => {
    const response = await api.get<Product>(`/store/products/${productId}/`);
    return response.data;
};

/**
 * Get user's wishlist
 */
export const getWishlist = async (): Promise<WishlistResponse> => {
    const response = await api.get<WishlistResponse>('/store/wishlist/');
    return response.data;
};

/**
 * Add product to wishlist
 */
export const addToWishlist = async (productId: number): Promise<WishlistItem> => {
    const response = await api.post<WishlistItem>('/store/wishlist/', {
        product_id: productId
    });
    return response.data;
};

/**
 * Remove from wishlist
 */
export const removeFromWishlist = async (wishlistItemId: number): Promise<void> => {
    await api.delete(`/store/wishlist/${wishlistItemId}/`);
};

/**
 * Get user's cart
 */
export const getCart = async (): Promise<Cart> => {
    const response = await api.get<Cart>('/store/cart/');
    return response.data;
};

/**
 * Add item to cart
 */
export const addToCart = async (productId: number, quantity: number = 1): Promise<{
    message: string;
    cart: Cart;
}> => {
    const response = await api.post('/store/cart/add/', {
        product_id: productId,
        quantity
    });
    return response.data;
};

/**
 * Update cart item quantity
 */
export const updateCartItem = async (productId: number, quantity: number): Promise<{
    message: string;
    cart: Cart;
}> => {
    const response = await api.patch('/store/cart/update/', {
        product_id: productId,
        quantity
    });
    return response.data;
};

/**
 * Remove item from cart
 */
export const removeFromCart = async (productId: number): Promise<{
    message: string;
    cart: Cart;
}> => {
    const response = await api.delete('/store/cart/remove/', {
        data: { product_id: productId }
    });
    return response.data;
};

/**
 * Checkout and create order
 */
export const checkout = async (shippingAddress?: string): Promise<CheckoutResponse> => {
    const response = await api.post<CheckoutResponse>('/store/checkout/', {
        shipping_address: shippingAddress || ''
    });
    return response.data;
};

/**
 * Get user's orders
 */
export const getOrders = async (): Promise<OrdersResponse> => {
    const response = await api.get<OrdersResponse>('/store/orders/');
    return response.data;
};

/**
 * Get a single order by ID
 */
export const getOrder = async (orderId: number): Promise<Order> => {
    const response = await api.get<Order>(`/store/orders/${orderId}/`);
    return response.data;
};
