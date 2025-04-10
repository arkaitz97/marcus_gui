// src/store/customizationStore.js
import { create } from 'zustand';
import { apiService } from '@/services/api'; // Import apiService

export const useCustomizationStore = create((set, get) => ({
    product: null,
    selectedOptions: {}, // { partId: optionId }
    totalPrice: null, // Will be string from API
    basePrice: 0, // Store base price if needed
    isValidConfiguration: true,
    validationErrors: [],
    isLoadingPrice: false,
    isLoadingValidation: false,

    setProduct: (product) => {
        const base = product?.base_price || 0; // Use base_price from product data if exists

        set({
            product: product,
            selectedOptions: {}, // Reset selections when product changes
            totalPrice: null, // Reset price
            basePrice: base,
            isValidConfiguration: true, // Assume valid initially
            validationErrors: [],
            isLoadingPrice: false,
            isLoadingValidation: false,
        });
    },

    setSelectedOption: (partId, optionId) => {
        set((state) => ({
            selectedOptions: {
                ...state.selectedOptions,
                [partId]: optionId,
            },
            // Reset validation/price until re-checked
            isValidConfiguration: true, // Temporarily assume valid
            validationErrors: [],
            totalPrice: null, // Indicate price needs recalculation
        }));
        // Trigger validation and price calculation after state update
        get().recalculateAndValidate();
    },

    getSelectedOptionIds: () => {
        return Object.values(get().selectedOptions).filter(id => id !== null && id !== undefined);
    },

    isFullyConfigured: () => {
        const { product, selectedOptions } = get();
        if (!product || !product.parts) return false;
        // Ensure every part defined in the product has a selection
        return product.parts.every(part => selectedOptions[part.id] !== undefined && selectedOptions[part.id] !== null);
    },

    recalculateAndValidate: async () => {
        const { product, selectedOptions, isFullyConfigured } = get();

        // Only proceed if a product is loaded and fully configured
        if (!product || !isFullyConfigured()) {
            set({ totalPrice: null, isValidConfiguration: true, validationErrors: [] }); // Reset if not fully configured
            return;
        }

        const selectedIds = get().getSelectedOptionIds();

        set({ isLoadingValidation: true, isLoadingPrice: true, validationErrors: [] });

        try {
            // Perform validation and price calculation in parallel if possible
            const [validationResult, priceResult] = await Promise.all([
                apiService.validateSelection(selectedIds),
                apiService.calculatePrice(selectedIds)
            ]);

            set({
                isValidConfiguration: validationResult.valid,
                validationErrors: validationResult.errors || [],
                totalPrice: priceResult.total_price,
                isLoadingValidation: false,
                isLoadingPrice: false,
            });

        } catch (error) {
            console.error("Error during validation/price calculation:", error);
            set({
                isLoadingValidation: false,
                isLoadingPrice: false,
                isValidConfiguration: false, // Mark as invalid on error
                validationErrors: [`Failed to validate or calculate price: ${error.message}`],
                totalPrice: null, // Clear price on error
            });
        }
    },

    resetCustomization: () => set({
        // product: null, // Decide if you want to clear the product context too
        selectedOptions: {},
        totalPrice: null,
        isValidConfiguration: true,
        validationErrors: [],
        isLoadingPrice: false,
        isLoadingValidation: false,
    }),
}));