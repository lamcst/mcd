'use client'
import { createContext, useContext, useReducer } from 'react';
import { ReactNode } from 'react';

const CompletedOrdersContext = createContext<CompletedOrder[] | null>(null);

const CompletedOrdersDispatchContext = createContext<React.Dispatch<CompletedOrderAction> | null>(null);

export type CompletedOrder = {
    id: number;
    pendingOrderId: string;
}

const initialCompletedOrders: CompletedOrder[] = [];

export type CompletedOrderAction = {
    type: 'added';
    pendingOrderId: string;
}
const completedOrdersReducer = (
    orders: CompletedOrder[],
    action: CompletedOrderAction
) =>{
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

export function useCompletedOrders() {
    return useContext(CompletedOrdersContext);
}

export function useCompletedOrdersDispatch() {
    return useContext(CompletedOrdersDispatchContext);
}