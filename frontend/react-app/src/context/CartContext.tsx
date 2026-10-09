import type {ReactNode} from "react";
import {useCallback, useMemo, useState} from "react";
import {useLocation} from "react-router-dom";
import type {CartItem} from "../models/CartItem";
import type {Product} from "../models/Product";
import {CartContext} from "./cart-context";

interface CartProviderProps {
    readonly children: ReactNode;
}

export function CartProvider({children}: CartProviderProps) {
    const {pathname} = useLocation();

    const businessSlug = pathname.match(
        /^\/shop\/([^/]+)(?:\/|$)/,
    )?.[1];

    const cartKey = businessSlug ?? "default";

    const [carts, setCarts] = useState<Record<string, CartItem[]>>({});

    const items = carts[cartKey] ?? [];

    const addItem = useCallback(
        (product: Product) => {
            if (!product.active) {
                return;
            }

            setCarts((currentCarts) => {
                const currentItems = currentCarts[cartKey] ?? [];
                const productExists = currentItems.some(
                    (item) => item.product.id === product.id,
                );

                const updatedItems = productExists
                    ? currentItems.map((item) =>
                        item.product.id === product.id
                            ? {...item, quantity: item.quantity + 1}
                            : item,
                    )
                    : [...currentItems, {product, quantity: 1}];

                return {...currentCarts, [cartKey]: updatedItems};
            });
        },
        [cartKey],
    );

    const removeItem = useCallback(
        (productId: string) => {
            setCarts((currentCarts) => ({
                ...currentCarts,
                [cartKey]: (currentCarts[cartKey] ?? []).filter(
                    (item) => item.product.id !== productId,
                ),
            }));
        },
        [cartKey],
    );

    const updateQuantity = useCallback(
        (productId: string, quantity: number) => {
            if (!Number.isInteger(quantity)) {
                return;
            }

            if (quantity <= 0) {
                removeItem(productId);
                return;
            }

            setCarts((currentCarts) => ({
                ...currentCarts,
                [cartKey]: (currentCarts[cartKey] ?? []).map((item) =>
                    item.product.id === productId
                        ? {...item, quantity}
                        : item,
                ),
            }));
        },
        [cartKey, removeItem],
    );

    const clearCart = useCallback(() => {
        setCarts((currentCarts) => ({
            ...currentCarts,
            [cartKey]: [],
        }));
    }, [cartKey]);

    const totalQuantity = items.reduce(
        (total, item) => total + item.quantity,
        0,
    );

    const totalPrice = items.reduce(
        (total, item) =>
            total + item.product.sellingPrice * item.quantity,
        0,
    );

    const contextValue = useMemo(
        () => ({
            items,
            addItem,
            removeItem,
            updateQuantity,
            clearCart,
            totalQuantity,
            totalPrice,
        }),
        [
            items,
            addItem,
            removeItem,
            updateQuantity,
            clearCart,
            totalQuantity,
            totalPrice,
        ],
    );

    return (
        <CartContext.Provider value={contextValue}>
            {children}
        </CartContext.Provider>
    );
}
