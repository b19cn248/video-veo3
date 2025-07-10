import { useState, useEffect, useCallback } from 'react';
import { VideoPricingResponseDto } from '../../../../types/video.types';
import { VideoService } from '../../../../services/videoService';
import { extractErrorMessage } from '../../../../utils/errorUtils';

interface UsePricingDataReturn {
    pricingData: VideoPricingResponseDto[];
    loading: boolean;
    error: string | null;
    loadPricingData: () => Promise<void>;
    refreshPricingData: () => Promise<void>;
}

export const usePricingData = (): UsePricingDataReturn => {
    const [pricingData, setPricingData] = useState<VideoPricingResponseDto[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const loadPricingData = useCallback(async () => {
        setLoading(true);
        setError(null);
        
        try {
            console.log('Loading pricing data...');
            const response = await VideoService.getAllPricingInfo();
            
            if (response.success && response.data) {
                console.log('Pricing data loaded successfully:', response.data);
                setPricingData(response.data);
            } else {
                throw new Error(response.message || 'Failed to load pricing data');
            }
        } catch (err) {
            console.error('Error loading pricing data:', err);
            const errorMessage = extractErrorMessage(err);
            setError(errorMessage);
            setPricingData([]);
        } finally {
            setLoading(false);
        }
    }, []);

    const refreshPricingData = useCallback(async () => {
        console.log('Refreshing pricing data...');
        await loadPricingData();
    }, [loadPricingData]);

    // Auto-load pricing data on mount
    useEffect(() => {
        loadPricingData();
    }, [loadPricingData]);

    return {
        pricingData,
        loading,
        error,
        loadPricingData,
        refreshPricingData
    };
};