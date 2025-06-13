// Custom hook để kiểm tra khách hàng đã tồn tại
// Sử dụng debouncing để tránh call API quá nhiều khi user đang nhập

import { useState, useEffect, useCallback } from 'react';
import { VideoService } from '../../../services/videoService';
import { CustomerExistsResponse } from '../../../types/video.types';

// Debounce delay in milliseconds
const DEBOUNCE_DELAY = 500;

interface UseCustomerCheckResult {
    checkingCustomer: boolean;
    customerExists: boolean | null;
    customerWarning: string | null;
    checkCustomer: (customerName: string) => void;
    clearCheck: () => void;
}

/**
 * Custom hook để kiểm tra khách hàng đã tồn tại trong hệ thống
 * 
 * Features:
 * - Debounced API calls để tránh spam requests
 * - Automatic validation (minimum 2 characters)
 * - Loading state management
 * - Error handling với fallback
 * 
 * @returns UseCustomerCheckResult object với states và methods
 */
export const useCustomerCheck = (): UseCustomerCheckResult => {
    const [checkingCustomer, setCheckingCustomer] = useState(false);
    const [customerExists, setCustomerExists] = useState<boolean | null>(null);
    const [customerWarning, setCustomerWarning] = useState<string | null>(null);
    const [debounceTimeout, setDebounceTimeout] = useState<NodeJS.Timeout | null>(null);

    /**
     * Thực hiện check khách hàng với API call
     */
    const performCustomerCheck = useCallback(async (customerName: string) => {
        if (!customerName || customerName.trim().length < 2) {
            setCustomerExists(null);
            setCustomerWarning(null);
            return;
        }

        setCheckingCustomer(true);
        
        try {
            console.log('Checking customer existence:', customerName);
            const response: CustomerExistsResponse = await VideoService.checkCustomerExists(customerName.trim());
            
            if (response.success && response.data) {
                setCustomerExists(response.data.exists);
                setCustomerWarning(response.data.warning || null);
                
                if (response.data.exists) {
                    console.log('Customer exists warning:', response.data.warning);
                }
            } else {
                // Fallback: treat as customer doesn't exist if API response is invalid
                setCustomerExists(false);
                setCustomerWarning(null);
            }
        } catch (error) {
            console.error('Error checking customer existence:', error);
            // Fallback: don't show warning if API fails
            setCustomerExists(null);
            setCustomerWarning(null);
        } finally {
            setCheckingCustomer(false);
        }
    }, []);

    /**
     * Debounced check customer function
     */
    const checkCustomer = useCallback((customerName: string) => {
        // Clear existing timeout
        if (debounceTimeout) {
            clearTimeout(debounceTimeout);
        }

        // Clear previous results immediately
        setCustomerExists(null);
        setCustomerWarning(null);

        // Skip check if input is too short
        if (!customerName || customerName.trim().length < 2) {
            setCheckingCustomer(false);
            return;
        }

        // Set new timeout for debounced check
        const timeout = setTimeout(() => {
            performCustomerCheck(customerName);
        }, DEBOUNCE_DELAY);

        setDebounceTimeout(timeout);
    }, [debounceTimeout, performCustomerCheck]);

    /**
     * Clear all check results
     */
    const clearCheck = useCallback(() => {
        if (debounceTimeout) {
            clearTimeout(debounceTimeout);
            setDebounceTimeout(null);
        }
        setCheckingCustomer(false);
        setCustomerExists(null);
        setCustomerWarning(null);
    }, [debounceTimeout]);

    // Cleanup timeout on unmount
    useEffect(() => {
        return () => {
            if (debounceTimeout) {
                clearTimeout(debounceTimeout);
            }
        };
    }, [debounceTimeout]);

    return {
        checkingCustomer,
        customerExists,
        customerWarning,
        checkCustomer,
        clearCheck
    };
};