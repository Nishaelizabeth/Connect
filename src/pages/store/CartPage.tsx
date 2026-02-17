import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    ShoppingCart, 
    Trash2, 
    Plus, 
    Minus, 
    ArrowLeft,
    Loader2,
    ShoppingBag
} from 'lucide-react';
import { Navbar } from '@/components/ui/navbar';
import Sidebar from '@/components/dashboard/Sidebar';
import {
    getCart,
    updateCartItem,
    removeFromCart,
    type Cart,
    type CartItem
} from '@/api/store.api';

const CartPage: React.FC = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(true);
    const [updatingItems, setUpdatingItems] = useState<Set<number>>(new Set());

    useEffect(() => {
        const fetchCart = async () => {
            try {
                const data = await getCart();
                setCart(data);
            } catch (error) {
                console.error('Failed to fetch cart:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchCart();
    }, []);

    const handleUpdateQuantity = async (productId: number, newQuantity: number) => {
        if (updatingItems.has(productId)) return;
        
        setUpdatingItems(prev => new Set(prev).add(productId));
        try {
            const response = await updateCartItem(productId, newQuantity);
            setCart(response.cart);
        } catch (error: any) {
            console.error('Failed to update quantity:', error);
            alert(error.response?.data?.quantity?.[0] || 'Failed to update quantity');
        } finally {
            setUpdatingItems(prev => {
                const next = new Set(prev);
                next.delete(productId);
                return next;
            });
        }
    };

    const handleRemoveItem = async (productId: number) => {
        if (updatingItems.has(productId)) return;
        
        setUpdatingItems(prev => new Set(prev).add(productId));
        try {
            const response = await removeFromCart(productId);
            setCart(response.cart);
        } catch (error) {
            console.error('Failed to remove item:', error);
        } finally {
            setUpdatingItems(prev => {
                const next = new Set(prev);
                next.delete(productId);
                return next;
            });
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <Sidebar activeItem="store" />
                <main className="ml-56 pt-16 min-h-screen flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </main>
            </div>
        );
    }

    const totalAmount = parseFloat(cart?.total_amount || '0');

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Sidebar activeItem="store" />

            <main className="ml-56 pt-16 min-h-screen">
                <div className="p-6 max-w-4xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={() => navigate('/store')}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <ShoppingCart className="w-7 h-7 text-blue-600" />
                                Shopping Cart
                            </h1>
                            <p className="text-gray-600">
                                {cart?.total_items || 0} items in your cart
                            </p>
                        </div>
                    </div>

                    {!cart || cart.items.length === 0 ? (
                        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                            <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Your cart is empty
                            </h3>
                            <p className="text-gray-500 mb-6">
                                Start shopping to add items to your cart
                            </p>
                            <button
                                onClick={() => navigate('/store')}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Browse Products
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Cart Items */}
                            <div className="lg:col-span-2 space-y-4">
                                {cart.items.map((item) => (
                                    <CartItemCard
                                        key={item.id}
                                        item={item}
                                        isUpdating={updatingItems.has(item.product.id)}
                                        onUpdateQuantity={(qty) => handleUpdateQuantity(item.product.id, qty)}
                                        onRemove={() => handleRemoveItem(item.product.id)}
                                    />
                                ))}
                            </div>

                            {/* Order Summary */}
                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                        Order Summary
                                    </h3>
                                    
                                    <div className="space-y-3 mb-6">
                                        <div className="flex justify-between text-gray-600">
                                            <span>Subtotal ({cart.total_items} items)</span>
                                            <span>${totalAmount.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600">
                                            <span>Shipping</span>
                                            <span className="text-green-600">Free</span>
                                        </div>
                                        <div className="border-t pt-3 flex justify-between text-lg font-semibold text-gray-900">
                                            <span>Total</span>
                                            <span>${totalAmount.toFixed(2)}</span>
                                        </div>
                                    </div>

                                    <button
                                        onClick={() => navigate('/store/checkout')}
                                        className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                                    >
                                        Proceed to Checkout
                                    </button>
                                    
                                    <button
                                        onClick={() => navigate('/store')}
                                        className="w-full py-3 mt-3 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                                    >
                                        Continue Shopping
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

// Cart Item Card Component
interface CartItemCardProps {
    item: CartItem;
    isUpdating: boolean;
    onUpdateQuantity: (quantity: number) => void;
    onRemove: () => void;
}

const CartItemCard: React.FC<CartItemCardProps> = ({
    item,
    isUpdating,
    onUpdateQuantity,
    onRemove
}) => {
    const price = parseFloat(item.product.price);
    const subtotal = parseFloat(item.subtotal);

    return (
        <div className="bg-white rounded-xl border border-gray-200 p-4 flex gap-4">
            {/* Product Image */}
            <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                {item.product.image ? (
                    <img
                        src={item.product.image}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ShoppingCart className="w-8 h-8" />
                    </div>
                )}
            </div>

            {/* Product Info */}
            <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 line-clamp-1">
                    {item.product.name}
                </h4>
                <p className="text-sm text-gray-500 mb-2">
                    ${price.toFixed(2)} each
                </p>
                
                {/* Quantity Controls */}
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onUpdateQuantity(item.quantity - 1)}
                        disabled={isUpdating || item.quantity <= 1}
                        className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center font-medium">
                        {isUpdating ? (
                            <Loader2 className="w-4 h-4 animate-spin mx-auto" />
                        ) : (
                            item.quantity
                        )}
                    </span>
                    <button
                        onClick={() => onUpdateQuantity(item.quantity + 1)}
                        disabled={isUpdating || item.quantity >= item.product.stock_quantity}
                        className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <Plus className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Price & Remove */}
            <div className="flex flex-col items-end justify-between">
                <span className="font-bold text-gray-900">
                    ${subtotal.toFixed(2)}
                </span>
                <button
                    onClick={onRemove}
                    disabled={isUpdating}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                >
                    <Trash2 className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
};

export default CartPage;
