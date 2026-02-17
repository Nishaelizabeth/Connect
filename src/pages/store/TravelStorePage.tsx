import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Search, 
    SlidersHorizontal, 
    ShoppingCart, 
    Heart,
    ChevronDown,
    Package
} from 'lucide-react';
import { Navbar } from '@/components/ui/navbar';
import Sidebar from '@/components/dashboard/Sidebar';
import ProductCard from './ProductCard';
import {
    getProducts,
    getCategories,
    addToCart,
    addToWishlist,
    removeFromWishlist,
    getWishlist,
    getCart,
    type Product,
    type ProductCategory,
    type WishlistItem
} from '@/api/store.api';

type SortOption = 'newest' | 'price_low' | 'price_high' | 'rating';

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
    { value: 'newest', label: 'Newest' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'rating', label: 'Top Rated' },
];

const TravelStorePage: React.FC = () => {
    const navigate = useNavigate();
    
    // State
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [wishlistItems, setWishlistItems] = useState<WishlistItem[]>([]);
    const [cartCount, setCartCount] = useState(0);
    
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
    const [sortBy, setSortBy] = useState<SortOption>('newest');
    const [showSortDropdown, setShowSortDropdown] = useState(false);

    // Fetch products
    const fetchProducts = useCallback(async () => {
        setLoading(true);
        try {
            const params: { search?: string; category?: number; sort?: 'price_low' | 'price_high' | 'rating' } = {};
            
            if (searchQuery.trim()) {
                params.search = searchQuery.trim();
            }
            if (selectedCategory) {
                params.category = selectedCategory;
            }
            if (sortBy !== 'newest') {
                params.sort = sortBy as 'price_low' | 'price_high' | 'rating';
            }
            
            const response = await getProducts(params);
            setProducts(response.results);
        } catch (error) {
            console.error('Failed to fetch products:', error);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, selectedCategory, sortBy]);

    // Initial data load
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                const [categoriesRes, wishlistRes, cartRes] = await Promise.all([
                    getCategories(),
                    getWishlist(),
                    getCart()
                ]);
                setCategories(categoriesRes);
                setWishlistItems(wishlistRes.results);
                setCartCount(cartRes.total_items);
            } catch (error) {
                console.error('Failed to load initial data:', error);
            }
        };
        loadInitialData();
    }, []);

    // Fetch products when filters change
    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // Search debounce
    const [debouncedSearch, setDebouncedSearch] = useState(searchQuery);
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearch(searchQuery);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        if (debouncedSearch !== searchQuery) return;
        fetchProducts();
    }, [debouncedSearch]);

    // Handlers
    const handleAddToCart = async (productId: number) => {
        try {
            const response = await addToCart(productId, 1);
            setCartCount(response.cart.total_items);
        } catch (error: any) {
            console.error('Failed to add to cart:', error);
            alert(error.response?.data?.quantity?.[0] || 'Failed to add to cart');
        }
    };

    const handleToggleWishlist = async (productId: number, currentlyWishlisted: boolean) => {
        try {
            if (currentlyWishlisted) {
                const wishlistItem = wishlistItems.find(w => w.product.id === productId);
                if (wishlistItem) {
                    await removeFromWishlist(wishlistItem.id);
                    setWishlistItems(prev => prev.filter(w => w.id !== wishlistItem.id));
                }
            } else {
                const newItem = await addToWishlist(productId);
                setWishlistItems(prev => [...prev, newItem]);
            }
            
            // Update product in list
            setProducts(prev => prev.map(p => 
                p.id === productId 
                    ? { ...p, is_wishlisted: !currentlyWishlisted }
                    : p
            ));
        } catch (error) {
            console.error('Failed to toggle wishlist:', error);
            throw error;
        }
    };

    // Loading skeleton
    const ProductSkeleton = () => (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden animate-pulse">
            <div className="aspect-square bg-gray-200" />
            <div className="p-4 space-y-3">
                <div className="h-3 bg-gray-200 rounded w-1/4" />
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
                <div className="flex justify-between items-center pt-2">
                    <div className="h-6 bg-gray-200 rounded w-1/4" />
                    <div className="h-10 bg-gray-200 rounded w-1/3" />
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <Sidebar activeItem="store" />

            <main className="ml-56 pt-16 min-h-screen">
                <div className="p-6">
                    {/* Header */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                            <Package className="w-7 h-7 text-blue-600" />
                            Travel Store
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Everything you need for your next adventure
                        </p>
                    </div>

                    {/* Top Bar */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
                        <div className="flex flex-wrap gap-4 items-center">
                            {/* Search */}
                            <div className="flex-1 min-w-50 max-w-md">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Search products..."
                                        className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            {/* Category Filter */}
                            <div className="flex gap-2 flex-wrap">
                                <button
                                    onClick={() => setSelectedCategory(null)}
                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        !selectedCategory
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                                >
                                    All
                                </button>
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => setSelectedCategory(cat.id)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                                            selectedCategory === cat.id
                                                ? 'bg-blue-600 text-white'
                                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                        }`}
                                    >
                                        {cat.name}
                                    </button>
                                ))}
                            </div>

                            {/* Sort Dropdown */}
                            <div className="relative">
                                <button
                                    onClick={() => setShowSortDropdown(!showSortDropdown)}
                                    className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <SlidersHorizontal className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm text-gray-700">
                                        {SORT_OPTIONS.find(o => o.value === sortBy)?.label}
                                    </span>
                                    <ChevronDown className="w-4 h-4 text-gray-500" />
                                </button>
                                
                                {showSortDropdown && (
                                    <>
                                        <div 
                                            className="fixed inset-0 z-10" 
                                            onClick={() => setShowSortDropdown(false)} 
                                        />
                                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20">
                                            {SORT_OPTIONS.map((option) => (
                                                <button
                                                    key={option.value}
                                                    onClick={() => {
                                                        setSortBy(option.value);
                                                        setShowSortDropdown(false);
                                                    }}
                                                    className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 ${
                                                        sortBy === option.value
                                                            ? 'text-blue-600 font-medium'
                                                            : 'text-gray-700'
                                                    }`}
                                                >
                                                    {option.label}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>

                            {/* Quick Links */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => navigate('/store/wishlist')}
                                    className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    <Heart className="w-4 h-4 text-red-500" />
                                    <span className="text-sm text-gray-700">Wishlist</span>
                                    {wishlistItems.length > 0 && (
                                        <span className="bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                                            {wishlistItems.length}
                                        </span>
                                    )}
                                </button>
                                <button
                                    onClick={() => navigate('/store/cart')}
                                    className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <ShoppingCart className="w-4 h-4" />
                                    <span className="text-sm">Cart</span>
                                    {cartCount > 0 && (
                                        <span className="bg-white text-blue-600 text-xs px-1.5 py-0.5 rounded-full font-medium">
                                            {cartCount}
                                        </span>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Products Grid */}
                    {loading ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {[...Array(8)].map((_, i) => (
                                <ProductSkeleton key={i} />
                            ))}
                        </div>
                    ) : products.length === 0 ? (
                        <div className="text-center py-16">
                            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                No products found
                            </h3>
                            <p className="text-gray-500">
                                Try adjusting your search or filters
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.map((product) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    onAddToCart={handleAddToCart}
                                    onToggleWishlist={handleToggleWishlist}
                                    onClick={() => navigate(`/store/product/${product.id}`)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default TravelStorePage;
