'use client'

import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useReducer,
    useState,
} from 'react'
import { ProductType, ProductVariant } from '@/type/ProductType'
import {
    CART_EXPIRE_DURATION_MS,
    CART_EXPIRE_KEY,
    countdownTime,
    emptyCountdown,
} from '@/store/countdownTime'
import {
    CUSTOMER_SESSION_CHANGED_EVENT,
    type CustomerSessionChangedDetail,
} from '@/lib/customerSessionEvents'
import { getCartItemImage } from '@/lib/productImages'

interface CartItem extends ProductType {
    quantity: number
    selectedSize: string
    selectedColor: string
    cartImage?: string
    databaseId?: string | number | null
    product_id?: string | number | null
    catalog_product_id?: string | number | null
    numericId?: string | number | null
    providerType?: string | null
    isImmediateVariant?: boolean

    /*
     * Solo lectura de carritos creados antes de B2B.
     */
    isLocalVariant?: boolean
}

interface CheckoutMeta {
    // Cliente — estructura estándar de cotización
    fullName: string
    taxId: string
    email: string
    phone: string

    // Ubicación — estructura estándar de cotización
    billingCity: string
    billingAddress: string

    // Dirección de envío
    sameAsBilling: boolean
    shippingCountry: string
    shippingDepartment: string
    shippingCity: string
    shippingAddress: string
    shippingPostalCode: string
    shippingReference: string

    // Envío calculado / resumen
    shippingMethod: string
    shippingCost: number

    // Solicitud
    customerNote: string
    privacyAccepted: boolean
    couponCode: string
    discountAmount: number

    // Cuenta
    createAccount: boolean
    password: string
    confirmPassword: string

    // Pago
    paymentMethod: string
}

interface CartState {
    cartArray: CartItem[]
    checkoutMeta: CheckoutMeta
}

type PersistedCartState = {
    version: 1
    expiresAt: number | null
    cartArray: CartItem[]
}

const CART_STORAGE_KEY = 'btlmarketing_cart_v1'
const LEGACY_CART_STORAGE_KEY = 'cart_state'
const CART_STORAGE_VERSION = 1

const initialCheckoutMeta: CheckoutMeta = {
    // Cliente — estructura estándar de cotización
    fullName: '',
    taxId: '',
    email: '',
    phone: '',

    // Ubicación — estructura estándar de cotización
    billingCity: '',
    billingAddress: '',

    // Dirección de envío
    sameAsBilling: true,
    shippingCountry: 'Nicaragua',
    shippingDepartment: 'Managua',
    shippingCity: '',
    shippingAddress: '',
    shippingPostalCode: '',
    shippingReference: '',

    // Envío
    shippingMethod: '',
    shippingCost: 0,

    // Solicitud
    customerNote: '',
    privacyAccepted: false,
    couponCode: '',
    discountAmount: 0,

    // Cuenta
    createAccount: false,
    password: '',
    confirmPassword: '',

    // Pago
    paymentMethod: 'credit-card',
}

const initialCartState: CartState = {
    cartArray: [],
    checkoutMeta: initialCheckoutMeta,
}

type CartAction =
    | { type: 'ADD_TO_CART'; payload: CartItem }
    | { type: 'REMOVE_FROM_CART'; payload: string }
    | {
        type: 'UPDATE_CART'
        payload: {
            itemId: string
            quantity: number
            selectedSize: string
            selectedColor: string
        }
    }
    | { type: 'LOAD_CART_STATE'; payload: CartState }
    | { type: 'CLEAR_CART' }
    | { type: 'SET_CUSTOMER_NOTE'; payload: string }
    | {
        type: 'SET_SHIPPING_METHOD'
        payload: {
            shippingMethod: string
            shippingCost: number
        }
    }
    | {
        type: 'SET_COUPON'
        payload: {
            couponCode: string
            discountAmount: number
        }
    }
    | {
        type: 'SET_CHECKOUT_FIELD'
        payload: {
            field: keyof CheckoutMeta
            value: CheckoutMeta[keyof CheckoutMeta]
        }
    }
    | {
        type: 'SET_CHECKOUT_FIELDS'
        payload: Partial<CheckoutMeta>
    }
    | {
        type: 'SET_BILLING_ADDRESS'
        payload: {
            billingCity?: string
            billingAddress?: string
        }
    }
    | {
        type: 'SET_SHIPPING_ADDRESS'
        payload: {
            shippingCountry?: string
            shippingDepartment?: string
            shippingCity?: string
            shippingAddress?: string
            shippingPostalCode?: string
            shippingReference?: string
        }
    }
    | { type: 'RESET_CHECKOUT_META' }

interface CartContextProps {
    cartState: CartState
    isCartHydrated: boolean
    cartExpiresAt: number | null
    cartTimeLeft: ReturnType<typeof countdownTime>
    addToCart: (item: CartItem) => void
    removeFromCart: (itemId: string) => void
    updateCart: (
        itemId: string,
        quantity: number,
        selectedSize: string,
        selectedColor: string,
    ) => void
    clearCart: () => void
    setCustomerNote: (note: string) => void
    setShippingMethod: (
        shippingMethod: string,
        shippingCost: number,
    ) => void
    setCoupon: (
        couponCode: string,
        discountAmount: number,
    ) => void
    setCheckoutField: <K extends keyof CheckoutMeta>(
        field: K,
        value: CheckoutMeta[K],
    ) => void
    setCheckoutFields: (fields: Partial<CheckoutMeta>) => void
    setBillingAddress: (fields: {
        billingCountry?: string
        billingDepartment?: string
        billingCity?: string
        billingAddress?: string
        billingPostalCode?: string
        billingReference?: string
    }) => void
    setShippingAddress: (fields: {
        shippingCountry?: string
        shippingDepartment?: string
        shippingCity?: string
        shippingAddress?: string
        shippingPostalCode?: string
        shippingReference?: string
    }) => void
    resetCheckoutMeta: () => void
}

const CartContext = createContext<CartContextProps | undefined>(undefined)

const cleanText = (value: unknown) => String(value ?? '').trim()

const positiveInteger = (value: unknown, fallback = 1) => {
    const number = Math.trunc(Number(value))
    return Number.isFinite(number) && number > 0 ? number : fallback
}

const sameText = (left: unknown, right: unknown) => {
    const normalizedLeft = cleanText(left).toLocaleLowerCase('es')
    const normalizedRight = cleanText(right).toLocaleLowerCase('es')

    return normalizedLeft !== '' && normalizedLeft === normalizedRight
}

const resolveSelectedVariation = (item: CartItem) => {
    const variations = Array.isArray(item.variation)
        ? item.variation
        : []

    if (variations.length === 0) return null
    if (variations.length === 1) return variations[0]

    return (
        variations.find((variation) =>
            sameText(variation.sku, item.id),
        ) ||
        variations.find(
            (variation) =>
                (!item.selectedColor ||
                    sameText(variation.color, item.selectedColor)) &&
                (!item.selectedSize ||
                    sameText(variation.size, item.selectedSize)),
        ) ||
        variations.find((variation) =>
            sameText(variation.color, item.selectedColor),
        ) ||
        variations[0]
    )
}

const resolveSelectedDatabaseVariant = (
    item: CartItem,
    selectedVariation: CartItem['variation'][number] | null,
): ProductVariant | null => {
    const variants = Array.isArray(item.variants)
        ? item.variants
        : []

    if (variants.length === 0) return null
    if (variants.length === 1) return variants[0]

    const selectedSku = cleanText(selectedVariation?.sku || item.id)
    const selectedColor = cleanText(
        selectedVariation?.color || item.selectedColor,
    )
    const selectedSize = cleanText(
        selectedVariation?.size || item.selectedSize,
    )

    return (
        variants.find((variant) =>
            sameText(variant.sku, selectedSku),
        ) ||
        variants.find(
            (variant) =>
                (!selectedColor ||
                    sameText(variant.color, selectedColor)) &&
                (!selectedSize ||
                    sameText(variant.size, selectedSize)),
        ) ||
        null
    )
}

const compactCartItem = (item: CartItem): CartItem => {
    const selectedVariation = resolveSelectedVariation(item)
    const selectedVariant = resolveSelectedDatabaseVariant(
        item,
        selectedVariation,
    )
    const quantity = positiveInteger(
        item.quantityPurchase || item.quantity,
    )
    const selectedSize = cleanText(
        item.selectedSize ||
            selectedVariation?.size ||
            selectedVariant?.size ||
            'S/T',
    )
    const selectedColor = cleanText(
        item.selectedColor ||
            selectedVariation?.color ||
            selectedVariant?.color ||
            '',
    )
    const cartImage = getCartItemImage({
        ...item,
        variation: selectedVariation
            ? [selectedVariation]
            : item.variation,
    })

    const compactVariation = selectedVariation
        ? [
              {
                  ...selectedVariation,
                  image: cartImage,
                  colorImage: cartImage,
              },
          ]
        : []

    return {
        id: cleanText(item.id),
        category: cleanText(item.category),
        type: cleanText(item.type),
        name: cleanText(item.name) || 'Producto promocional',
        gender: cleanText(item.gender),
        new: Boolean(item.new),
        sale: Boolean(item.sale),
        rate: Number(item.rate || 0),
        price: Number(item.price || 0),
        originPrice: Number(item.originPrice || 0),
        brand: cleanText(item.brand),
        sold: Number(item.sold || 0),
        quantity,
        quantityPurchase: quantity,
        sizes: selectedSize ? [selectedSize] : [],
        variation: compactVariation,
        thumbImage: [cartImage],
        images: [cartImage],
        description: cleanText(item.description),
        action: cleanText(item.action) || 'add to cart',
        slug: cleanText(item.slug),
        variants: selectedVariant ? [selectedVariant] : [],
        stockFisico:
            selectedVariation?.stockFisico ?? item.stockFisico,
        stockTransito:
            selectedVariation?.stockTransito ?? item.stockTransito,
        selectedSize,
        selectedColor,
        cartImage,
        databaseId: item.databaseId ?? null,
        product_id: item.product_id ?? null,
        catalog_product_id: item.catalog_product_id ?? null,
        numericId: item.numericId ?? null,
        providerType:
            cleanText(item.providerType).toLowerCase() === 'local'
                ? 'immediate'
                : item.providerType ?? null,
        isImmediateVariant: Boolean(
            item.isImmediateVariant ||
            item.isLocalVariant ||
            cleanText(item.providerType).toLowerCase() === 'local' ||
            cleanText(item.providerType).toLowerCase() === 'immediate'
        ),
    }
}

const normalizePersistedItems = (value: unknown): CartItem[] => {
    if (!Array.isArray(value)) return []

    return value
        .filter(
            (item): item is CartItem =>
                typeof item === 'object' &&
                item !== null &&
                cleanText((item as CartItem).id) !== '',
        )
        .map(compactCartItem)
}

const clearPersistedCart = () => {
    sessionStorage.removeItem(CART_STORAGE_KEY)
    sessionStorage.removeItem(LEGACY_CART_STORAGE_KEY)
    sessionStorage.removeItem(CART_EXPIRE_KEY)
}

const readPersistedCart = (): {
    cartArray: CartItem[]
    expiresAt: number | null
} => {
    const currentValue = sessionStorage.getItem(CART_STORAGE_KEY)

    if (currentValue) {
        const parsed = JSON.parse(currentValue) as Partial<PersistedCartState>
        const cartArray = normalizePersistedItems(parsed.cartArray)
        const expiresAt = Number(parsed.expiresAt)

        return {
            cartArray,
            expiresAt:
                Number.isFinite(expiresAt) && expiresAt > 0
                    ? expiresAt
                    : null,
        }
    }

    const legacyValue = sessionStorage.getItem(
        LEGACY_CART_STORAGE_KEY,
    )

    if (!legacyValue) {
        return {
            cartArray: [],
            expiresAt: null,
        }
    }

    const parsedLegacy = JSON.parse(legacyValue) as {
        cartArray?: unknown
    }
    const legacyExpiresAt = Number(
        sessionStorage.getItem(CART_EXPIRE_KEY),
    )

    return {
        cartArray: normalizePersistedItems(parsedLegacy.cartArray),
        expiresAt:
            Number.isFinite(legacyExpiresAt) && legacyExpiresAt > 0
                ? legacyExpiresAt
                : null,
    }
}

const cartReducer = (
    state: CartState,
    action: CartAction,
): CartState => {
    switch (action.type) {
        case 'ADD_TO_CART': {
            const existingItem = state.cartArray.find(
                (item) => item.id === action.payload.id,
            )

            if (existingItem) {
                return {
                    ...state,
                    cartArray: state.cartArray.map((item) =>
                        item.id === action.payload.id
                            ? {
                                  ...item,
                                  ...action.payload,
                                  quantity:
                                      item.quantity +
                                      action.payload.quantity,
                                  quantityPurchase:
                                      item.quantity +
                                      action.payload.quantity,
                              }
                            : item,
                    ),
                }
            }

            return {
                ...state,
                cartArray: [...state.cartArray, action.payload],
            }
        }

        case 'REMOVE_FROM_CART':
            return {
                ...state,
                cartArray: state.cartArray.filter(
                    (item) => item.id !== action.payload,
                ),
            }

        case 'UPDATE_CART':
            return {
                ...state,
                cartArray: state.cartArray.map((item) =>
                    item.id === action.payload.itemId
                        ? {
                              ...item,
                              quantity: action.payload.quantity,
                              quantityPurchase:
                                  action.payload.quantity,
                              selectedSize:
                                  action.payload.selectedSize,
                              selectedColor:
                                  action.payload.selectedColor,
                          }
                        : item,
                ),
            }

        case 'LOAD_CART_STATE':
            return action.payload

        case 'CLEAR_CART':
            return {
                cartArray: [],
                checkoutMeta: { ...initialCheckoutMeta },
            }

        case 'SET_CUSTOMER_NOTE':
            return {
                ...state,
                checkoutMeta: {
                    ...state.checkoutMeta,
                    customerNote: action.payload,
                },
            }

        case 'SET_SHIPPING_METHOD':
            return {
                ...state,
                checkoutMeta: {
                    ...state.checkoutMeta,
                    shippingMethod:
                        action.payload.shippingMethod,
                    shippingCost: action.payload.shippingCost,
                },
            }

        case 'SET_COUPON':
            return {
                ...state,
                checkoutMeta: {
                    ...state.checkoutMeta,
                    couponCode: action.payload.couponCode,
                    discountAmount:
                        action.payload.discountAmount,
                },
            }

        case 'SET_CHECKOUT_FIELD':
            return {
                ...state,
                checkoutMeta: {
                    ...state.checkoutMeta,
                    [action.payload.field]:
                        action.payload.value,
                },
            }

        case 'SET_CHECKOUT_FIELDS':
            return {
                ...state,
                checkoutMeta: {
                    ...state.checkoutMeta,
                    ...action.payload,
                },
            }

        case 'SET_BILLING_ADDRESS':
            return {
                ...state,
                checkoutMeta: {
                    ...state.checkoutMeta,
                    ...action.payload,
                },
            }

        case 'SET_SHIPPING_ADDRESS':
            return {
                ...state,
                checkoutMeta: {
                    ...state.checkoutMeta,
                    ...action.payload,
                },
            }

        case 'RESET_CHECKOUT_META':
            return {
                ...state,
                checkoutMeta: { ...initialCheckoutMeta },
            }

        default:
            return state
    }
}

export const CartProvider: React.FC<{
    children: React.ReactNode
}> = ({ children }) => {
    const [cartState, dispatch] = useReducer(
        cartReducer,
        initialCartState,
    )
    const [isCartHydrated, setIsCartHydrated] = useState(false)
    const [cartExpiresAt, setCartExpiresAt] =
        useState<number | null>(null)
    const [cartTimeLeft, setCartTimeLeft] =
        useState(emptyCountdown)

    const clearCart = useCallback(() => {
        clearPersistedCart()
        setCartExpiresAt(null)
        setCartTimeLeft(emptyCountdown)
        dispatch({ type: 'CLEAR_CART' })
    }, [])

    const addToCart = useCallback((item: CartItem) => {
        const compactItem = compactCartItem(item)

        setCartExpiresAt((current) => {
            if (current && current > Date.now()) {
                return current
            }

            return Date.now() + CART_EXPIRE_DURATION_MS
        })

        dispatch({
            type: 'ADD_TO_CART',
            payload: compactItem,
        })
    }, [])

    const removeFromCart = useCallback((itemId: string) => {
        dispatch({
            type: 'REMOVE_FROM_CART',
            payload: itemId,
        })
    }, [])

    const updateCart = useCallback(
        (
            itemId: string,
            quantity: number,
            selectedSize: string,
            selectedColor: string,
        ) => {
            dispatch({
                type: 'UPDATE_CART',
                payload: {
                    itemId,
                    quantity: positiveInteger(quantity),
                    selectedSize,
                    selectedColor,
                },
            })
        },
        [],
    )

    const setCustomerNote = useCallback((note: string) => {
        dispatch({
            type: 'SET_CUSTOMER_NOTE',
            payload: note,
        })
    }, [])

    const setShippingMethod = useCallback(
        (
            shippingMethod: string,
            shippingCost: number,
        ) => {
            dispatch({
                type: 'SET_SHIPPING_METHOD',
                payload: {
                    shippingMethod,
                    shippingCost,
                },
            })
        },
        [],
    )

    const setCoupon = useCallback(
        (
            couponCode: string,
            discountAmount: number,
        ) => {
            dispatch({
                type: 'SET_COUPON',
                payload: {
                    couponCode,
                    discountAmount,
                },
            })
        },
        [],
    )

    const setCheckoutField = useCallback(
        <K extends keyof CheckoutMeta>(
            field: K,
            value: CheckoutMeta[K],
        ) => {
            dispatch({
                type: 'SET_CHECKOUT_FIELD',
                payload: {
                    field,
                    value,
                },
            })
        },
        [],
    )

    const setCheckoutFields = useCallback(
        (fields: Partial<CheckoutMeta>) => {
            dispatch({
                type: 'SET_CHECKOUT_FIELDS',
                payload: fields,
            })
        },
        [],
    )

    const setBillingAddress = useCallback(
        (fields: {
            billingCountry?: string
            billingDepartment?: string
            billingCity?: string
            billingAddress?: string
            billingPostalCode?: string
            billingReference?: string
        }) => {
            dispatch({
                type: 'SET_BILLING_ADDRESS',
                payload: fields,
            })
        },
        [],
    )

    const setShippingAddress = useCallback(
        (fields: {
            shippingCountry?: string
            shippingDepartment?: string
            shippingCity?: string
            shippingAddress?: string
            shippingPostalCode?: string
            shippingReference?: string
        }) => {
            dispatch({
                type: 'SET_SHIPPING_ADDRESS',
                payload: fields,
            })
        },
        [],
    )

    const resetCheckoutMeta = useCallback(() => {
        dispatch({ type: 'RESET_CHECKOUT_META' })
    }, [])

    useEffect(() => {
        try {
            const persisted = readPersistedCart()

            if (persisted.cartArray.length === 0) {
                clearPersistedCart()
                return
            }

            let expiresAt = persisted.expiresAt

            // Compatibilidad con carritos antiguos que tenían productos,
            // pero perdieron la clave separada del temporizador.
            if (!expiresAt) {
                expiresAt =
                    Date.now() + CART_EXPIRE_DURATION_MS
            }

            if (expiresAt <= Date.now()) {
                clearPersistedCart()
                return
            }

            dispatch({
                type: 'LOAD_CART_STATE',
                payload: {
                    cartArray: persisted.cartArray,
                    checkoutMeta: {
                        ...initialCheckoutMeta,
                    },
                },
            })
            setCartExpiresAt(expiresAt)
            setCartTimeLeft(countdownTime(expiresAt))
        } catch (error) {
            console.error(
                'Error loading cart state from sessionStorage:',
                error,
            )
            clearPersistedCart()
        } finally {
            setIsCartHydrated(true)
        }
    }, [])

    useEffect(() => {
        if (!isCartHydrated) return

        if (cartState.cartArray.length === 0) {
            clearPersistedCart()
            setCartExpiresAt(null)
            setCartTimeLeft(emptyCountdown)
            return
        }

        let expiresAt = cartExpiresAt

        if (!expiresAt || expiresAt <= Date.now()) {
            expiresAt =
                Date.now() + CART_EXPIRE_DURATION_MS
            setCartExpiresAt(expiresAt)
        }

        const persistedState: PersistedCartState = {
            version: CART_STORAGE_VERSION,
            expiresAt,
            cartArray: cartState.cartArray.map(
                compactCartItem,
            ),
        }

        try {
            sessionStorage.setItem(
                CART_STORAGE_KEY,
                JSON.stringify(persistedState),
            )

            // La nueva estructura reemplaza las dos claves antiguas.
            sessionStorage.removeItem(
                LEGACY_CART_STORAGE_KEY,
            )
            sessionStorage.removeItem(CART_EXPIRE_KEY)
        } catch (error) {
            console.error(
                'Error saving cart state to sessionStorage:',
                error,
            )
        }
    }, [
        cartExpiresAt,
        cartState.cartArray,
        isCartHydrated,
    ])

    useEffect(() => {
        if (
            !isCartHydrated ||
            cartState.cartArray.length === 0 ||
            !cartExpiresAt
        ) {
            setCartTimeLeft(emptyCountdown)
            return
        }

        const updateTimer = () => {
            if (cartExpiresAt <= Date.now()) {
                clearCart()
                return
            }

            setCartTimeLeft(
                countdownTime(cartExpiresAt),
            )
        }

        updateTimer()

        const timer = window.setInterval(
            updateTimer,
            1000,
        )

        return () => window.clearInterval(timer)
    }, [
        cartExpiresAt,
        cartState.cartArray.length,
        clearCart,
        isCartHydrated,
    ])

    useEffect(() => {
        const handleCustomerSessionChanged = (
            event: Event,
        ) => {
            const customEvent =
                event as CustomEvent<CustomerSessionChangedDetail>

            if (
                customEvent.detail?.customerId === null
            ) {
                resetCheckoutMeta()
            }
        }

        window.addEventListener(
            CUSTOMER_SESSION_CHANGED_EVENT,
            handleCustomerSessionChanged,
        )

        return () => {
            window.removeEventListener(
                CUSTOMER_SESSION_CHANGED_EVENT,
                handleCustomerSessionChanged,
            )
        }
    }, [resetCheckoutMeta])

    return (
        <CartContext.Provider
            value={{
                cartState,
                isCartHydrated,
                cartExpiresAt,
                cartTimeLeft,
                addToCart,
                removeFromCart,
                updateCart,
                clearCart,
                setCustomerNote,
                setShippingMethod,
                setCoupon,
                setCheckoutField,
                setCheckoutFields,
                setBillingAddress,
                setShippingAddress,
                resetCheckoutMeta,
            }}
        >
            {children}
        </CartContext.Provider>
    )
}

export const useCart = () => {
    const context = useContext(CartContext)

    if (!context) {
        throw new Error(
            'useCart must be used within a CartProvider',
        )
    }

    return context
}

export default CartProvider
