'use client'

import React, { createContext, useContext, useReducer, useEffect, useRef, useCallback } from 'react';
import { ProductType } from '@/type/ProductType';

type CompareItem = ProductType

interface CompareState {
    compareArray: CompareItem[];
    compareExpiresAt: number | null;
}

type CompareAction =
    | { type: 'ADD_TO_COMPARE'; payload: ProductType }
    | { type: 'REMOVE_FROM_COMPARE'; payload: string | number }
    | { type: 'LOAD_COMPARE_STATE'; payload: CompareState }
    | { type: 'SET_COMPARE_EXPIRES_AT'; payload: number | null }
    | { type: 'CLEAR_COMPARE' };

interface CompareContextProps {
    compareState: CompareState;
    addToCompare: (item: ProductType) => void;
    removeFromCompare: (itemId: string | number) => void;
    clearCompare: () => void;
    startCompareExpiry: () => void;
    cancelCompareExpiry: () => void;
    expireCompareNow: () => void;
    isCompareReady: boolean;
}

const CompareContext = createContext<CompareContextProps | undefined>(undefined);

const COMPARE_STORAGE_KEY = 'compare_products_state';
const LEGACY_COMPARE_STORAGE_KEY = 'compare_products';
const COMPARE_EXPIRY_MS = 2 * 60 * 1000;

const initialState: CompareState = {
    compareArray: [],
    compareExpiresAt: null,
};

const CompareReducer = (state: CompareState, action: CompareAction): CompareState => {
    switch (action.type) {
        case 'ADD_TO_COMPARE': {
            const alreadyExists = state.compareArray.some(
                (item) => String(item.id) === String(action.payload.id)
            );

            if (alreadyExists) return state;
            if (state.compareArray.length >= 3) return state;

            return {
                ...state,
                compareArray: [...state.compareArray, { ...action.payload }],
            };
        }

        case 'REMOVE_FROM_COMPARE': {
            return {
                ...state,
                compareArray: state.compareArray.filter(
                    (item) => String(item.id) !== String(action.payload)
                ),
            };
        }

        case 'LOAD_COMPARE_STATE': {
            return {
                compareArray: Array.isArray(action.payload.compareArray)
                    ? action.payload.compareArray.slice(0, 3)
                    : [],
                compareExpiresAt:
                    typeof action.payload.compareExpiresAt === 'number'
                        ? action.payload.compareExpiresAt
                        : null,
            };
        }

        case 'SET_COMPARE_EXPIRES_AT':
            return {
                ...state,
                compareExpiresAt: action.payload,
            };

        case 'CLEAR_COMPARE':
            return {
                compareArray: [],
                compareExpiresAt: null,
            };

        default:
            return state;
    }
};

export const CompareProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [compareState, dispatch] = useReducer(CompareReducer, initialState);

    const didLoadFromStorage = useRef(false);
    const expiryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [isCompareReady, setIsCompareReady] = React.useState(false);

    const clearExpiryTimer = useCallback(() => {
        if (expiryTimerRef.current) {
            clearTimeout(expiryTimerRef.current);
            expiryTimerRef.current = null;
        }
    }, []);

    const expireCompareNow = useCallback(() => {
        clearExpiryTimer();
        dispatch({ type: 'CLEAR_COMPARE' });

        if (typeof window !== 'undefined') {
            try {
                window.localStorage.removeItem(COMPARE_STORAGE_KEY);
                window.localStorage.removeItem(LEGACY_COMPARE_STORAGE_KEY);
            } catch (error) {
                console.error('Error clearing compare data from localStorage:', error);
            }
        }
    }, [clearExpiryTimer]);

    const scheduleExpiry = useCallback((expiresAt: number) => {
        clearExpiryTimer();

        const remainingTime = expiresAt - Date.now();

        if (remainingTime <= 0) {
            expireCompareNow();
            return;
        }

        expiryTimerRef.current = setTimeout(() => {
            expireCompareNow();
        }, remainingTime);
    }, [clearExpiryTimer, expireCompareNow]);

    const startCompareExpiry = () => {
        const expiresAt = Date.now() + COMPARE_EXPIRY_MS;
        dispatch({ type: 'SET_COMPARE_EXPIRES_AT', payload: expiresAt });
        scheduleExpiry(expiresAt);
    };

    const cancelCompareExpiry = () => {
        clearExpiryTimer();
        dispatch({ type: 'SET_COMPARE_EXPIRES_AT', payload: null });
    };

    useEffect(() => {
        if (typeof window === 'undefined') return;

        try {
            const storedState = window.localStorage.getItem(COMPARE_STORAGE_KEY);
            const legacyStoredCompare = window.localStorage.getItem(LEGACY_COMPARE_STORAGE_KEY);

            if (storedState) {
                const parsedState = JSON.parse(storedState);

                const compareArray = Array.isArray(parsedState?.compareArray)
                    ? parsedState.compareArray.slice(0, 3)
                    : [];

                const compareExpiresAt =
                    typeof parsedState?.compareExpiresAt === 'number'
                        ? parsedState.compareExpiresAt
                        : null;

                if (compareArray.length > 0 && compareExpiresAt && Date.now() >= compareExpiresAt) {
                    window.localStorage.removeItem(COMPARE_STORAGE_KEY);
                    window.localStorage.removeItem(LEGACY_COMPARE_STORAGE_KEY);
                    dispatch({ type: 'CLEAR_COMPARE' });
                } else {
                    dispatch({
                        type: 'LOAD_COMPARE_STATE',
                        payload: {
                            compareArray,
                            compareExpiresAt,
                        },
                    });

                    if (compareArray.length > 0 && compareExpiresAt) {
                        scheduleExpiry(compareExpiresAt);
                    }
                }
            } else if (legacyStoredCompare) {
                const parsedCompare = JSON.parse(legacyStoredCompare);

                if (Array.isArray(parsedCompare)) {
                    dispatch({
                        type: 'LOAD_COMPARE_STATE',
                        payload: {
                            compareArray: parsedCompare.slice(0, 3),
                            compareExpiresAt: null,
                        },
                    });
                }
            }
        } catch (error) {
            console.error('Error loading compare products from localStorage:', error);
        } finally {
            didLoadFromStorage.current = true;
            setIsCompareReady(true);
        }
    }, [scheduleExpiry]);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        if (!didLoadFromStorage.current) return;

        try {
            if (compareState.compareArray.length === 0) {
                window.localStorage.removeItem(COMPARE_STORAGE_KEY);
                window.localStorage.removeItem(LEGACY_COMPARE_STORAGE_KEY);
                return;
            }

            window.localStorage.setItem(
                COMPARE_STORAGE_KEY,
                JSON.stringify({
                    compareArray: compareState.compareArray,
                    compareExpiresAt: compareState.compareExpiresAt,
                })
            );

            window.localStorage.removeItem(LEGACY_COMPARE_STORAGE_KEY);
        } catch (error) {
            console.error('Error saving compare products to localStorage:', error);
        }
    }, [compareState.compareArray, compareState.compareExpiresAt]);

    useEffect(() => {
        if (!didLoadFromStorage.current) return;

        if (compareState.compareArray.length === 0) {
            clearExpiryTimer();
            return;
        }

        if (compareState.compareExpiresAt) {
            scheduleExpiry(compareState.compareExpiresAt);
        } else {
            clearExpiryTimer();
        }
    }, [
        compareState.compareArray.length,
        compareState.compareExpiresAt,
        clearExpiryTimer,
        scheduleExpiry,
    ]);

    useEffect(() => {
        return () => {
            clearExpiryTimer();
        };
    }, [clearExpiryTimer]);

    const addToCompare = (item: ProductType) => {
        cancelCompareExpiry();
        dispatch({ type: 'ADD_TO_COMPARE', payload: item });
    };

    const removeFromCompare = (itemId: string | number) => {
        const nextCompareArray = compareState.compareArray.filter(
            (item) => String(item.id) !== String(itemId)
        );

        if (nextCompareArray.length === 0) {
            expireCompareNow();
            return;
        }

        dispatch({ type: 'REMOVE_FROM_COMPARE', payload: itemId });
    };

    const clearCompare = () => {
        expireCompareNow();
    };

    return (
        <CompareContext.Provider
            value={{
                compareState,
                addToCompare,
                removeFromCompare,
                clearCompare,
                startCompareExpiry,
                cancelCompareExpiry,
                expireCompareNow,
                isCompareReady,
            }}
        >
            {children}
        </CompareContext.Provider>
    );
};

export const useCompare = () => {
    const context = useContext(CompareContext);

    if (!context) {
        throw new Error('useCompare must be used within a CompareProvider');
    }

    return context;
};