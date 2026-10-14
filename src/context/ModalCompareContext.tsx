'use client'

import React, { createContext, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { useCompare } from './CompareContext';

interface ModalCompareContextProps {
    children: ReactNode;
}

interface ModalCompareContextValue {
    isModalOpen: boolean;
    openModalCompare: () => void;
    closeModalCompare: () => void;
}

const ModalCompareContext = createContext<ModalCompareContextValue | undefined>(undefined);

export const useModalCompareContext = (): ModalCompareContextValue => {
    const context = useContext(ModalCompareContext);

    if (!context) {
        throw new Error('useModalCompareContext must be used within a ModalCompareProvider');
    }

    return context;
};

export const ModalCompareProvider: React.FC<ModalCompareContextProps> = ({ children }) => {
    const { compareState, isCompareReady } = useCompare();
    const pathname = usePathname();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const hasCompareItems = compareState.compareArray.length > 0;
    const hasExpiry = compareState.compareExpiresAt !== null;
    const isComparePage = pathname === '/comparar';

    useEffect(() => {
        if (!isCompareReady) return;

        if (!hasCompareItems) {
            setIsModalOpen(false);
            return;
        }

        if (isComparePage) {
            setIsModalOpen(false);
            return;
        }

        if (hasCompareItems && !hasExpiry) {
            setIsModalOpen(true);
        }
    }, [isCompareReady, hasCompareItems, hasExpiry, isComparePage]);

    const openModalCompare = () => {
        setIsModalOpen(true);
    };

    const closeModalCompare = () => {
        setIsModalOpen(false);
    };

    const contextValue = useMemo(
        () => ({
            isModalOpen,
            openModalCompare,
            closeModalCompare,
        }),
        [isModalOpen]
    );

    return (
        <ModalCompareContext.Provider value={contextValue}>
            {children}
        </ModalCompareContext.Provider>
    );
};