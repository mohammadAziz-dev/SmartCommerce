import {useCallback, useMemo, useState} from "react";
import type {ReactNode} from "react";
import type {CartItem} from "../models/CartItem";
import type {Product} from "../models/Product";
import {CartContext} from "./cart-context";

interface CartProviderProps {
    readonly children: ReactNode;
}

export function CartProvider({children}: CartProviderProps) {
    const [items, setItems] = useState<CartItem[]>([]);

    const addItem = useCallback((product: Product) => {
        if (!product.active) {
            return;
        }

        setItems((currentItems) => {
            const productExists = currentItems.some(
                (item) => item.product.id === product.id,
            );

            if (productExists) {
                return currentItems.map((item) =>
                    item.product.id === product.id
                        ? {...item, quantity: item.quantity + 1}
                        : item,
                );
            }

            return [...currentItems, {product, quantity: 1}];
        });
    }, []);

    const removeItem = useCallback((productId: string) => {
        setItems((currentItems) =>
            currentItems.filter((item) => item.product.id !== productId),
        );
    }, []);

    const updateQuantity = useCallback(
        (productId: string, quantity: number) => {
            if (!Number.isInteger(quantity)) {
                return;
            }

            if (quantity <= 0) {
                removeItem(productId);
                return;
            }

            setItems((currentItems) =>
                currentItems.map((item) =>
                    item.product.id === productId ? {...item, quantity} : item,
                ),
            );
        },
        [removeItem],
    );

    const totalQuantity = items.reduce((total, item) => total + item.quantity, 0);

    const totalPrice = items.reduce(
        (total, item) => total + item.product.sellingPrice * item.quantity,
        0,
    );

    const contextValue = useMemo(
        () => ({
            items,
            addItem,
            removeItem,
            updateQuantity,
            totalQuantity,
            totalPrice,
        }),
        [
            items,
            addItem,
            removeItem,
            updateQuantity,
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
