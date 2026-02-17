import React, { useState } from 'react';
import { Heart, ShoppingCart, Star, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Product } from '@/api/store.api';

interface ProductCardProps {
    product: Product;
    onAddToCart: (productId: number) => Promise<void>;
    onToggleWishlist: (productId: number, isWishlisted: boolean) => Promise<void>;
    onClick?: () => void;
}

const ProductCard: React.FC<ProductCardProps> = ({
    product,
    onAddToCart,
    onToggleWishlist,
    onClick
}) => {
    const [isAddingToCart, setIsAddingToCart] = useState(false);
    const [isTogglingWishlist, setIsTogglingWishlist] = useState(false);
    const [isWishlisted, setIsWishlisted] = useState(product.is_wishlisted);

    const handleAddToCart = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!product.in_stock || isAddingToCart) return;
        
        setIsAddingToCart(true);
        try {
            await onAddToCart(product.id);
        } finally {
            setIsAddingToCart(false);
        }
    };

    const handleToggleWishlist = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isTogglingWishlist) return;
        
        setIsTogglingWishlist(true);
        try {
            await onToggleWishlist(product.id, isWishlisted);
            setIsWishlisted(!isWishlisted);
        } catch {
            // Revert on error
        } finally {
            setIsTogglingWishlist(false);
        }
    };

    const rating = parseFloat(product.rating);
    const price = parseFloat(product.price);

    return (
        <div
            onClick={onClick}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer group"
        >
            {/* Product Image */}
            <div className="relative aspect-square overflow-hidden bg-gray-100">
                {product.image ? (
                    <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400?text=No+Image';
                        }}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <ShoppingCart className="w-12 h-12" />
                    </div>
                )}
                
                {/* Wishlist Button */}
                <button
                    onClick={handleToggleWishlist}
                    disabled={isTogglingWishlist}
                    className={cn(
                        "absolute top-3 right-3 w-9 h-9 rounded-full flex items-center justify-center transition-all",
                        isWishlisted 
                            ? "bg-red-500 text-white" 
                            : "bg-white/90 text-gray-600 hover:bg-red-50 hover:text-red-500"
                    )}
                >
                    {isTogglingWishlist ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <Heart className={cn("w-4 h-4", isWishlisted && "fill-current")} />
                    )}
                </button>

                {/* Out of Stock Badge */}
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
                {/* Category */}
                {product.category_name && (
                    <p className="text-xs text-blue-600 font-medium mb-1">
                        {product.category_name}
                    </p>
                )}

                {/* Name */}
                <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
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
                        onClick={handleAddToCart}
                        disabled={!product.in_stock || isAddingToCart}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
                            product.in_stock
                                ? "bg-blue-600 text-white hover:bg-blue-700"
                                : "bg-gray-200 text-gray-500 cursor-not-allowed"
                        )}
                    >
                        {isAddingToCart ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <ShoppingCart className="w-4 h-4" />
                        )}
                        <span className="hidden sm:inline">Add</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
