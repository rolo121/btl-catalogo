'use client'

// WishlistContext.tsx
import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { ProductType } from '@/type/ProductType';

type WishlistItem = ProductType

interface WishlistState {
    wishlistArray: WishlistItem[]
}

type WishlistAction =
    | { type: 'ADD_TO_WISHLIST'; payload: ProductType }
    | { type: 'REMOVE_FROM_WISHLIST'; payload: string }
    | { type: 'LOAD_WISHLIST'; payload: WishlistItem[] }

interface WishlistContextProps {
    wishlistState: WishlistState;
    addToWishlist: (item: ProductType) => void;
    removeFromWishlist: (itemId: string) => void;
}

const WISHLIST_STORAGE_KEY = 'btlmarketing_wishlist';

const WishlistContext = createContext<WishlistContextProps | undefined>(undefined);

const WishlistReducer = (state: WishlistState, action: WishlistAction): WishlistState => {
    switch (action.type) {
        case 'ADD_TO_WISHLIST': {
            const exists = state.wishlistArray.some((item) => item.id === action.payload.id);

            if (exists) {
                return state;
            }

            const newItem: WishlistItem = { ...action.payload };

            return {
                ...state,
                wishlistArray: [...state.wishlistArray, newItem],
            };
        }
        case 'REMOVE_FROM_WISHLIST':
            return {
                ...state,
                wishlistArray: state.wishlistArray.filter((item) => item.id !== action.payload),
            };
        case 'LOAD_WISHLIST':
            return {
                ...state,
                wishlistArray: action.payload,
            };
        default:
            return state;
    }
};

export const WishlistProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [wishlistState, dispatch] = useReducer(WishlistReducer, { wishlistArray: [] });
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        try {
            const storedWishlist = window.localStorage.getItem(WISHLIST_STORAGE_KEY);

            if (storedWishlist) {
                const parsedWishlist = JSON.parse(storedWishlist);

                if (Array.isArray(parsedWishlist)) {
                    dispatch({ type: 'LOAD_WISHLIST', payload: parsedWishlist });
                }
            }
        } catch (error) {
            console.error('Error cargando favoritos desde localStorage:', error);
        } finally {
            setIsHydrated(true);
        }
    }, []);

    useEffect(() => {
        if (!isHydrated) return;

        try {
            window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(wishlistState.wishlistArray));
        } catch (error) {
            console.error('Error guardando favoritos en localStorage:', error);
        }
    }, [wishlistState.wishlistArray, isHydrated]);

    const addToWishlist = (item: ProductType) => {
        dispatch({ type: 'ADD_TO_WISHLIST', payload: item });
    };

    const removeFromWishlist = (itemId: string) => {
        dispatch({ type: 'REMOVE_FROM_WISHLIST', payload: itemId });
    };

    return (
        <WishlistContext.Provider value={{ wishlistState, addToWishlist, removeFromWishlist }}>
            {children}
        </WishlistContext.Provider>
    );
};

export const useWishlist = () => {
    const context = useContext(WishlistContext);
    if (!context) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
};
