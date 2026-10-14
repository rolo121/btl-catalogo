'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { ProductFeatureObject, ProductType, ProductVariant } from '@/type/ProductType';

interface ModalQuickviewContextProps {
    children: ReactNode;
}

type QuickviewCategory = {
    id?: string | number
    name?: string
    slug?: string
}

type QuickviewProduct = Omit<ProductType, 'features' | 'variation'> & {
    features?: ProductFeatureObject | string | null
    categories?: QuickviewCategory[]
    variation?: ProductVariant[]
}

interface ModalQuickviewContextValue {
    selectedProduct: QuickviewProduct | null;
    openQuickview: (product: QuickviewProduct) => void;
    closeQuickview: () => void;
}

const ModalQuickviewContext = createContext<ModalQuickviewContextValue | undefined>(undefined);

export const ModalQuickviewProvider: React.FC<ModalQuickviewContextProps> = ({ children }) => {
    const [selectedProduct, setSelectedProduct] = useState<QuickviewProduct | null>(null);

    const openQuickview = (product: QuickviewProduct) => {
        setSelectedProduct(product);
    };

    const closeQuickview = () => {
        setSelectedProduct(null);
    };

    return (
        <ModalQuickviewContext.Provider value={{ selectedProduct, openQuickview, closeQuickview }}>
            {children}
        </ModalQuickviewContext.Provider>
    );
};

export const useModalQuickviewContext = () => {
    const context = useContext(ModalQuickviewContext);
    if (!context) {
        throw new Error('useModalQuickviewContext must be used within a ModalQuickviewProvider');
    }
    return context;
};