'use client';

import React from 'react';
import { usePayment } from '../hooks/usePayment';
import { Product } from '../types';
import { Star, ShoppingCart } from 'lucide-react';

interface PaymentButtonProps {
  product: Product;
  quantity?: number;
  className?: string;
  onPaymentSuccess?: () => void;
  onPaymentError?: (error: string) => void;
}

export const PaymentButton: React.FC<PaymentButtonProps> = ({
  product,
  quantity = 1,
  className = '',
  onPaymentSuccess,
  onPaymentError
}) => {
  const { processPayment, loading, error, getTelegramUser } = usePayment();

  const handlePayment = async () => {
    const user = getTelegramUser();
    
    if (!user) {
      onPaymentError?.('User not found. Please open this app from Telegram.');
      return;
    }

    if (!product.inStock) {
      onPaymentError?.('Product is out of stock');
      return;
    }

    await processPayment(
      {
        productId: product.id,
        userId: user.id,
        quantity
      },
      onPaymentSuccess,
      onPaymentError
    );
  };

  const totalPrice = product.price * quantity;

  return (
    <div className="space-y-2">
      <button
        onClick={handlePayment}
        disabled={loading || !product.inStock}
        className={`
          flex items-center justify-center gap-2 
          px-6 py-3 rounded-lg font-medium transition-all
          ${product.inStock 
            ? 'bg-telegram-button text-telegram-button-text hover:opacity-90' 
            : 'bg-gray-400 text-gray-600 cursor-not-allowed'
          }
          ${loading ? 'opacity-70 cursor-wait' : ''}
          ${className}
        `}
      >
        {loading ? (
          <div className="animate-spin h-5 w-5 border-2 border-current border-t-transparent rounded-full" />
        ) : (
          <>
            <ShoppingCart size={20} />
            <span className="flex items-center gap-1">
              Pay {totalPrice} <Star size={16} className="text-yellow-400 fill-current" />
            </span>
          </>
        )}
      </button>

      {error && (
        <div className="text-telegram-destructive text-sm bg-red-50 p-2 rounded">
          {error}
        </div>
      )}

      {!product.inStock && (
        <div className="text-gray-500 text-sm text-center">
          Out of stock
        </div>
      )}
    </div>
  );
};