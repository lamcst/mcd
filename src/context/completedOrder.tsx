'use client'
import { createContext, useContext, useReducer } from 'react';
import { ReactNode } from 'react';

const CompletedOrdersContext = createContext<CompletedOrder[] | null>(null);

const CompletedOrdersDispatchContext = createContext<React.Dispatch<CompletedOrderAction> | null>(null);

const initialCompletedOrders: CompletedOrder[] = [];

/**
 * A reducer to update the completed context
 * @param orders 
 * @param action 
 * @returns Completed orders data
 */
const completedOrdersReducer = (
    orders: CompletedOrder[],
    action: CompletedOrderAction
) => {
    switch (action.type) {
        case 'added': {

            return [...orders, {
                id: orders.length + 1,
                pendingOrderId: action.pendingOrderId,
            }];
        }
        default: {
            throw new Error(`Unknown action: ${action}`);
        }
    }
}
/**
 * Completed Order Provider need to initiate on parent component to use useCompletedOrders() and useCompletedOrdersDispatch() on the component
 * 
 * @returns Completed Order Provider
 */
export function CompletedOrderProvider({ children }: { children: ReactNode }) {
    const [tasks, dispatch] = useReducer(
        completedOrdersReducer,
        initialCompletedOrders
    );

    return (
        <CompletedOrdersContext.Provider value={tasks}>
            <CompletedOrdersDispatchContext.Provider value={dispatch}>
                {children}
            </CompletedOrdersDispatchContext.Provider>
        </CompletedOrdersContext.Provider>
    );
}
/**
 * 
 * @returns Completed Orders data
 */
export function useCompletedOrders() {
    return useContext(CompletedOrdersContext);
}
/**
 * To update completed context
 * @returns Completed Order dispatch function
 */
export function useCompletedOrdersDispatch() {
    return useContext(CompletedOrdersDispatchContext);
}

export type CompletedOrder = {
    id: number;
    pendingOrderId: string;
}

export type CompletedOrderAction = {
    type: 'added';
    pendingOrderId: string;
}