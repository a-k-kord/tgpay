'use client';

import { useEffect } from 'react';

/**
 * Auto-setup component that runs webhook configuration on app load
 * This ensures webhook is configured automatically without manual intervention
 */
export function WebhookAutoSetup() {
    useEffect(() => {
        // Only run in production and only once
        if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
            const hasRunSetup = sessionStorage.getItem('webhook-auto-setup');

            if (!hasRunSetup) {
                console.log('🔧 Running automatic webhook setup...');

                // Call the smart auto-setup endpoint that detects URL automatically
                fetch('/api/auto-setup-smart')
                    .then(response => response.json())
                    .then(data => {
                        if (data.success) {
                            console.log('✅ Webhook auto-setup completed successfully');
                        } else {
                            console.warn('⚠️ Webhook auto-setup failed:', data.error);
                        }
                        // Mark as completed to avoid running again in this session
                        sessionStorage.setItem('webhook-auto-setup', 'completed');
                    })
                    .catch(error => {
                        console.error('❌ Webhook auto-setup error:', error);
                        // Still mark as attempted to avoid loops
                        sessionStorage.setItem('webhook-auto-setup', 'attempted');
                    });
            }
        }
    }, []);

    // This component doesn't render anything
    return null;
} 