'use client';

import React, { useState, useEffect } from 'react';
import { ProductCard } from '../components/ProductCard';
import { PaymentHistory } from '../features/payment/components/PaymentHistory';
import { useTelegram } from '../providers/TelegramProvider';
import { products, categories, getProductsByCategory } from '../data/products';
import { ShoppingBag, History, User, Star, Filter } from 'lucide-react';

type TabType = 'shop' | 'history' | 'profile';

export default function Home() {
    const { webApp, user, isReady } = useTelegram();
    const [activeTab, setActiveTab] = useState<TabType>('shop');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [filteredProducts, setFilteredProducts] = useState(products);

    useEffect(() => {
        if (webApp) {
            // Configure Telegram WebApp
            webApp.ready();
            webApp.expand();

            // Set header color to match theme
            if (webApp.themeParams.header_bg_color) {
                document.documentElement.style.setProperty(
                    '--tg-theme-header-bg-color',
                    webApp.themeParams.header_bg_color
                );
            }
        }
    }, [webApp]);

    useEffect(() => {
        const filtered = getProductsByCategory(selectedCategory);
        setFilteredProducts(filtered);
    }, [selectedCategory]);

    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab);
        // Provide haptic feedback
        webApp?.HapticFeedback?.selectionChanged();
    };

    const renderShopTab = () => (
        <div className="space-y-6">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-6 rounded-lg">
                <h1 className="text-2xl font-bold mb-2">Welcome to Digital Shop!</h1>
                <p className="text-blue-100">
                    Discover premium digital products and pay securely with Telegram Stars
                </p>
                <div className="flex items-center gap-2 mt-3">
                    <Star size={20} className="text-yellow-300 fill-current" />
                    <span className="text-sm">Pay with Telegram Stars • Instant Access • Secure</span>
                </div>
            </div>

            {/* Category Filter */}
            <div className="space-y-3">
                <div className="flex items-center gap-2">
                    <Filter size={20} className="text-telegram-hint" />
                    <h3 className="font-medium text-telegram-text">Categories</h3>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {categories.map((category) => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap btn-scale ${selectedCategory === category
                                ? 'bg-telegram-button text-telegram-button-text'
                                : 'bg-telegram-secondary-bg text-telegram-text hover:bg-telegram-section-separator'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Products Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredProducts.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>

            {filteredProducts.length === 0 && (
                <div className="text-center py-12">
                    <ShoppingBag size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-telegram-hint">No products found in this category</p>
                </div>
            )}
        </div>
    );

    const renderHistoryTab = () => (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <History size={24} className="text-telegram-button" />
                <h2 className="text-xl font-semibold text-telegram-text">Payment History</h2>
            </div>
            <PaymentHistory />
        </div>
    );

    const renderProfileTab = () => (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <User size={24} className="text-telegram-button" />
                <h2 className="text-xl font-semibold text-telegram-text">Profile</h2>
            </div>

            {user ? (
                <div className="bg-telegram-secondary-bg rounded-lg p-6 space-y-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-telegram-button rounded-full flex items-center justify-center">
                            <span className="text-2xl text-telegram-button-text font-bold">
                                {user.first_name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-telegram-text">
                                {user.first_name} {user.last_name || ''}
                            </h3>
                            {user.username && (
                                <p className="text-telegram-hint">@{user.username}</p>
                            )}
                            {user.is_premium && (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full mt-1">
                                    <Star size={12} className="fill-current" />
                                    Premium
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="pt-4 border-t border-telegram-section-separator">
                        <h4 className="font-medium text-telegram-text mb-2">Account Information</h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-telegram-hint">User ID:</span>
                                <span className="text-telegram-text">{user.id}</span>
                            </div>
                            {user.language_code && (
                                <div className="flex justify-between">
                                    <span className="text-telegram-hint">Language:</span>
                                    <span className="text-telegram-text">{user.language_code.toUpperCase()}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-center py-8">
                    <User size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-telegram-hint">
                        Please open this app from Telegram to view your profile
                    </p>
                </div>
            )}

            {/* App Information */}
            <div className="bg-telegram-secondary-bg rounded-lg p-6 space-y-3">
                <h4 className="font-medium text-telegram-text">About This App</h4>
                <div className="space-y-2 text-sm text-telegram-hint">
                    <p>• Digital marketplace for premium content</p>
                    <p>• Secure payments with Telegram Stars</p>
                    <p>• Instant access to purchased items</p>
                    <p>• Built with Next.js and Telegram Mini Apps</p>
                </div>
            </div>
        </div>
    );

    if (!isReady) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin h-12 w-12 border-3 border-telegram-button border-t-transparent rounded-full mx-auto mb-4"></div>
                    <p className="text-telegram-hint">Loading Telegram WebApp...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-telegram-bg">
            {/* Main Content */}
            <main className="pb-24">
                <div className="max-w-4xl mx-auto p-4">
                    {activeTab === 'shop' && renderShopTab()}
                    {activeTab === 'history' && renderHistoryTab()}
                    {activeTab === 'profile' && renderProfileTab()}
                </div>
            </main>

            {/* Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 bg-telegram-secondary-bg border-t border-telegram-section-separator telegram-safe-area backdrop-blur-md bg-opacity-95 z-50">
                <div className="flex">
                    {[
                        { id: 'shop', label: 'Shop', icon: ShoppingBag },
                        { id: 'history', label: 'History', icon: History },
                        { id: 'profile', label: 'Profile', icon: User },
                    ].map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => handleTabChange(id as TabType)}
                            className={`flex-1 flex flex-col items-center gap-1 py-3 btn-scale ${activeTab === id
                                ? 'text-telegram-button'
                                : 'text-telegram-hint hover:text-telegram-text'
                                }`}
                        >
                            <Icon size={20} />
                            <span className="text-xs font-medium">{label}</span>
                        </button>
                    ))}
                </div>
            </nav>
        </div>
    );
}