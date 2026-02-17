import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    CreditCard,
    ArrowLeft,
    Loader2,
    CheckCircle,
    MapPin,
    Truck,
    ShoppingBag,
    PartyPopper
} from 'lucide-react';
import { Navbar } from '@/components/ui/navbar';
import Sidebar from '@/components/dashboard/Sidebar';
import { cn } from '@/lib/utils';
import {
    getCart,
    checkout,
    type Cart
} from '@/api/store.api';

const CheckoutPage: React.FC = () => {
    const navigate = useNavigate();
    const [cart, setCart] = useState<Cart | null>(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [orderPlaced, setOrderPlaced] = useState(false);
    const [orderId, setOrderId] = useState<number | null>(null);
    
    // Form state
    const [shippingAddress, setShippingAddress] = useState({
        fullName: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        phone: ''
    });
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod'>('card');

    useEffect(() => {
        const fetchCart = async () => {
            try {
                const data = await getCart();
                if (!data.items || data.items.length === 0) {
                    navigate('/store/cart');
                    return;
                }
                setCart(data);
            } catch (error) {
                console.error('Failed to fetch cart:', error);
                navigate('/store/cart');
            } finally {
                setLoading(false);
            }
        };
        fetchCart();
    }, [navigate]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setShippingAddress(prev => ({ ...prev, [name]: value }));
    };

    const formatAddress = () => {
        const { fullName, address, city, state, zipCode, phone } = shippingAddress;
        return `${fullName}\n${address}\n${city}, ${state} ${zipCode}\nPhone: ${phone}`;
    };

    const handlePlaceOrder = async () => {
        if (processing) return;
        
        // Basic validation
        const { fullName, address, city, state, zipCode } = shippingAddress;
        if (!fullName || !address || !city || !state || !zipCode) {
            alert('Please fill in all shipping details');
            return;
        }
        
        setProcessing(true);
        try {
            const response = await checkout(formatAddress());
            setOrderId(response.order_id);
            setOrderPlaced(true);
        } catch (error: any) {
            console.error('Checkout failed:', error);
            alert(error.response?.data?.detail || 'Failed to place order');
        } finally {
            setProcessing(false);
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

    // Success screen
    if (orderPlaced) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <Sidebar activeItem="store" />
                <main className="ml-56 pt-16 min-h-screen flex items-center justify-center">
                    <div className="bg-white rounded-2xl border border-gray-200 p-12 text-center max-w-md">
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <PartyPopper className="w-10 h-10 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Order Placed Successfully! 🎉
                        </h2>
                        <p className="text-gray-600 mb-6">
                            Thank you for your purchase. Your order #{orderId} has been confirmed.
                        </p>
                        <div className="space-y-3">
                            <button
                                onClick={() => navigate('/store')}
                                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                            >
                                Continue Shopping
                            </button>
                            <button
                                onClick={() => navigate('/store/orders')}
                                className="w-full py-3 border border-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                            >
                                View Orders
                            </button>
                        </div>
                    </div>
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
                <div className="p-6 max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center gap-4 mb-6">
                        <button
                            onClick={() => navigate('/store/cart')}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-600" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                <CreditCard className="w-7 h-7 text-blue-600" />
                                Checkout
                            </h1>
                            <p className="text-gray-600">
                                Complete your purchase
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Forms */}
                        <div className="lg:col-span-2 space-y-6">
                            {/* Shipping Address */}
                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <MapPin className="w-5 h-5 text-blue-600" />
                                    Shipping Address
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Full Name
                                        </label>
                                        <input
                                            type="text"
                                            name="fullName"
                                            value={shippingAddress.fullName}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Address
                                        </label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={shippingAddress.address}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="123 Main St, Apt 4B"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            City
                                        </label>
                                        <input
                                            type="text"
                                            name="city"
                                            value={shippingAddress.city}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="New York"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            State
                                        </label>
                                        <input
                                            type="text"
                                            name="state"
                                            value={shippingAddress.state}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="NY"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Zip Code
                                        </label>
                                        <input
                                            type="text"
                                            name="zipCode"
                                            value={shippingAddress.zipCode}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="10001"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Phone (Optional)
                                        </label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={shippingAddress.phone}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            placeholder="+1 (555) 000-0000"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Payment Method */}
                            <div className="bg-white rounded-xl border border-gray-200 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-blue-600" />
                                    Payment Method
                                </h3>
                                
                                <div className="space-y-3">
                                    <label
                                        className={cn(
                                            "flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all",
                                            paymentMethod === 'card'
                                                ? "border-blue-500 bg-blue-50"
                                                : "border-gray-200 hover:border-gray-300"
                                        )}
                                    >
                                        <input
                                            type="radio"
                                            name="payment"
                                            checked={paymentMethod === 'card'}
                                            onChange={() => setPaymentMethod('card')}
                                            className="w-4 h-4 text-blue-600"
                                        />
                                        <CreditCard className="w-5 h-5 text-gray-600" />
                                        <div>
                                            <p className="font-medium text-gray-900">Credit/Debit Card</p>
                                            <p className="text-sm text-gray-500">Pay securely with your card</p>
                                        </div>
                                    </label>
                                    
                                    <label
                                        className={cn(
                                            "flex items-center gap-4 p-4 border rounded-lg cursor-pointer transition-all",
                                            paymentMethod === 'cod'
                                                ? "border-blue-500 bg-blue-50"
                                                : "border-gray-200 hover:border-gray-300"
                                        )}
                                    >
                                        <input
                                            type="radio"
                                            name="payment"
                                            checked={paymentMethod === 'cod'}
                                            onChange={() => setPaymentMethod('cod')}
                                            className="w-4 h-4 text-blue-600"
                                        />
                                        <Truck className="w-5 h-5 text-gray-600" />
                                        <div>
                                            <p className="font-medium text-gray-900">Cash on Delivery</p>
                                            <p className="text-sm text-gray-500">Pay when you receive</p>
                                        </div>
                                    </label>
                                </div>

                                {paymentMethod === 'card' && (
                                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                        <p className="text-sm text-yellow-800">
                                            <strong>Demo Mode:</strong> No actual payment will be processed. 
                                            Click "Pay Now" to simulate a successful payment.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Order Summary */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-24">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <ShoppingBag className="w-5 h-5 text-blue-600" />
                                    Order Summary
                                </h3>
                                
                                {/* Cart Items */}
                                <div className="space-y-3 mb-4 max-h-64 overflow-y-auto">
                                    {cart?.items.map((item) => (
                                        <div key={item.id} className="flex gap-3">
                                            <div className="w-12 h-12 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                                                {item.product.image && (
                                                    <img
                                                        src={item.product.image}
                                                        alt={item.product.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-gray-900 line-clamp-1">
                                                    {item.product.name}
                                                </p>
                                                <p className="text-xs text-gray-500">
                                                    Qty: {item.quantity}
                                                </p>
                                            </div>
                                            <span className="text-sm font-medium text-gray-900">
                                                ${parseFloat(item.subtotal).toFixed(2)}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <div className="border-t pt-4 space-y-3">
                                    <div className="flex justify-between text-gray-600">
                                        <span>Subtotal</span>
                                        <span>${totalAmount.toFixed(2)}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Shipping</span>
                                        <span className="text-green-600">Free</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600">
                                        <span>Tax</span>
                                        <span>$0.00</span>
                                    </div>
                                    <div className="border-t pt-3 flex justify-between text-lg font-bold text-gray-900">
                                        <span>Total</span>
                                        <span>${totalAmount.toFixed(2)}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={handlePlaceOrder}
                                    disabled={processing}
                                    className="w-full py-3 mt-6 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {processing ? (
                                        <>
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            Processing...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle className="w-5 h-5" />
                                            Pay Now - ${totalAmount.toFixed(2)}
                                        </>
                                    )}
                                </button>

                                <p className="text-xs text-gray-500 text-center mt-4">
                                    By placing this order, you agree to our Terms & Conditions
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default CheckoutPage;
