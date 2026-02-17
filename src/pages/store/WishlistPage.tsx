import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Heart, 
    ShoppingCart, 
    ArrowLeft,
    Loader2,
    Star,
    Trash2
} from 'lucide-react';
import { Navbar } from '@/components/ui/navbar';
import Sidebar from '@/components/dashboard/Sidebar';
import { cn } from '@/lib/utils';
import {
    getWishlist,
    removeFromWishlist,
    addToCart,
    type WishlistItem
} from '@/api/store.api';

const WishlistPage: React.FC = () => {
    const navigate = useNavigate();
    const [wishlist, setWishlist] = useState<WishlistItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionItemId, setActionItemId] = useState<number | null>(null);

    useEffect(() => {
        const fetchWishlist = async () => {
            try {
                const data = await getWishlist();
                setWishlist(data.results);
            } catch (error) {
                console.error('Failed to fetch wishlist:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchWishlist();
    }, []);

    const handleRemove = async (wishlistItemId: number) => {
        if (actionItemId) return;
        
        setActionItemId(wishlistItemId);
        try {
            await removeFromWishlist(wishlistItemId);
            setWishlist(prev => prev.filter(item => item.id !== wishlistItemId));
        } catch (error) {
            console.error('Failed to remove from wishlist:', error);
        } finally {
            setActionItemId(null);
        }
    };

    const handleAddToCart = async (productId: number, wishlistItemId: number) => {
        if (actionItemId) return;
        
        setActionItemId(wishlistItemId);
        try {
            await addToCart(productId, 1);
            // Optionally remove from wishlist after adding to cart
            await removeFromWishlist(wishlistItemId);
            setWishlist(prev => prev.filter(item => item.id !== wishlistItemId));
        } catch (error: any) {
            console.error('Failed to add to cart:', error);
            alert(error.response?.data?.quantity?.[0] || 'Failed to add to cart');
        } finally {
            setActionItemId(null);
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

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Sidebar activeItem="store" />

            <main className="ml-56 pt-16 min-h-screen">
                <div className="p-6 max-w-5xl mx-auto">
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
                                <Heart className="w-7 h-7 text-red-500 fill-red-500" />
                                My Wishlist
                            </h1>
                            <p className="text-gray-600">
                                {wishlist.length} items saved for later
                            </p>
                        </div>
                    </div>

                    {wishlist.length === 0 ? (
                        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
                            <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                Your wishlist is empty
                            </h3>
                            <p className="text-gray-500 mb-6">
                                Save items you love by clicking the heart icon
                            </p>
                            <button
                                onClick={() => navigate('/store')}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                Browse Products
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {wishlist.map((item) => {
                                const product = item.product;
                                const price = parseFloat(product.price);
                                const rating = parseFloat(product.rating);
                                const isProcessing = actionItemId === item.id;

                                return (
                                    <div
                                        key={item.id}
                                        className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all"
                                    >
                                        {/* Product Image */}
                                        <div 
                                            className="relative aspect-square overflow-hidden bg-gray-100 cursor-pointer"
                                            onClick={() => navigate(`/store/product/${product.id}`)}
                                        >
                                            {product.image ? (
                                                <img
                                                    src={product.image}
                                                    alt={product.name}
                                                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                    <ShoppingCart className="w-12 h-12" />
                                                </div>
                                            )}
                                            
                                            {/* Remove Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemove(item.id);
                                                }}
                                                disabled={isProcessing}
                                                className="absolute top-3 right-3 w-9 h-9 rounded-full bg-white/90 flex items-center justify-center text-red-500 hover:bg-red-50 transition-all"
                                            >
                                                {isProcessing ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4" />
                                                )}
                                            </button>

                                            {/* Out of Stock */}
                                            {!product.in_stock && (
                                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                                    <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                                                        Out of Stock
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Product Info */}
                                        <div className="p-4">
                                            {product.category_name && (
                                                <p className="text-xs text-blue-600 font-medium mb-1">
                                                    {product.category_name}
                                                </p>
                                            )}
                                            
                                            <h3 
                                                className="font-semibold text-gray-900 line-clamp-2 mb-2 cursor-pointer hover:text-blue-600"
                                                onClick={() => navigate(`/store/product/${product.id}`)}
                                            >
                                                {product.name}
                                            </h3>

                                            {/* Rating */}
                                            <div className="flex items-center gap-1 mb-3">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star
                                                        key={i}
                                                        className={cn(
                                                            "w-4 h-4",
                                                            i < Math.floor(rating)
                                                                ? "text-yellow-400 fill-yellow-400"
                                                                : "text-gray-300"
                                                        )}
                                                    />
                                                ))}
                                                <span className="text-sm text-gray-500 ml-1">
                                                    ({rating.toFixed(1)})
                                                </span>
                                            </div>

                                            {/* Price & Add to Cart */}
                                            <div className="flex items-center justify-between">
                                                <span className="text-xl font-bold text-gray-900">
                                                    ${price.toFixed(2)}
                                                </span>
                                                
                                                <button
                                                    onClick={() => handleAddToCart(product.id, item.id)}
                                                    disabled={!product.in_stock || isProcessing}
                                                    className={cn(
                                                        "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
                                                        product.in_stock
                                                            ? "bg-blue-600 text-white hover:bg-blue-700"
                                                            : "bg-gray-200 text-gray-500 cursor-not-allowed"
                                                    )}
                                                >
                                                    {isProcessing ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <ShoppingCart className="w-4 h-4" />
                                                    )}
                                                    Add
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default WishlistPage;
