'use client';

import React, { useState } from 'react';
import { Product } from '../features/payment/types';
import { PaymentButton } from '../features/payment/components/PaymentButton';
import { Star, Package, CheckCircle } from 'lucide-react';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const [showSuccess, setShowSuccess] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const handlePaymentSuccess = () => {
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error);
  };

  return (
    <div className="bg-telegram-secondary-bg rounded-lg shadow-sm border border-telegram-section-separator overflow-hidden">
      {/* Product Image Placeholder */}
      <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
        <Package size={48} className="text-gray-400" />
      </div>
      
      {/* Product Info */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-telegram-text line-clamp-2">
            {product.name}
          </h3>
          <span className="text-xs text-telegram-button bg-telegram-button bg-opacity-10 px-2 py-1 rounded-full">
            {product.category}
          </span>
        </div>
        
        <p className="text-telegram-hint text-sm mb-4 line-clamp-3">
          {product.description}
        </p>
        
        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1">
            <span className="text-xl font-bold text-telegram-accent">
              {product.price}
            </span>
            <Star size={20} className="text-yellow-400 fill-current" />
          </div>
          
          {product.inStock ? (
            <div className="flex items-center gap-1 text-green-600 text-sm">
              <CheckCircle size={16} />
              <span>In Stock</span>
            </div>
          ) : (
            <span className="text-red-500 text-sm">Out of Stock</span>
          )}
        </div>

        {/* Quantity Selector */}
        {product.inStock && (
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm text-telegram-text">Quantity:</span>
            <div className="flex items-center border border-telegram-section-separator rounded">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-1 text-telegram-text hover:bg-telegram-section-separator"
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="px-3 py-1 bg-telegram-bg text-telegram-text min-w-[40px] text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-1 text-telegram-text hover:bg-telegram-section-separator"
              >
                +
              </button>
            </div>
            {quantity > 1 && (
              <span className="text-sm text-telegram-hint">
                Total: {product.price * quantity} ⭐
              </span>
            )}
          </div>
        )}
        
        {/* Success Message */}
        {showSuccess && (
          <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-lg">
            <div className="flex items-center gap-2 text-green-800">
              <CheckCircle size={20} />
              <span className="font-medium">Payment Successful!</span>
            </div>
            <p className="text-green-700 text-sm mt-1">
              Thank you for your purchase. You can access your digital content now.
            </p>
          </div>
        )}
        
        {/* Payment Button */}
        <PaymentButton
          product={product}
          quantity={quantity}
          onPaymentSuccess={handlePaymentSuccess}
          onPaymentError={handlePaymentError}
          className="w-full"
        />
      </div>
    </div>
  );
};