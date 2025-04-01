'use client'
import { NORMAL_PRIORITY, VIP_PRIORITY } from '@/cache/pendingOrderGetId';
import { createContext, useContext, useReducer } from 'react';
import { ReactNode } from 'react';

const PendingOrdersContext = createContext<PendingOrder[] | null>(null);

const PendingOrdersDispatchContext = createContext<React.Dispatch<PendingOrderAction> | null>(null);

const initialOrders: PendingOrder[] = [];
function ordersReducer(orders: PendingOrder[],
    action: PendingOrderAction
): PendingOrder[] {
    
    const handlePriorityOrder = (priority: number): PendingOrder[] => {
        if(!action.id){
            console.error('action id not provided')
            return orders;
        }
        for (let i = 0; i < orders.length; i++) {
            
            if (orders[i].priority > priority) {
                return orders.toSpliced(i, 0, {
                    id: action.id,
                    priority,
                    status: 'PENDING',
                });
            }
        }
        return [ ...orders, {
            id:action.id,
            priority,
            status: 'PENDING',
        }];
    }
    switch (action.type) {
        case 'added-normal': {
            const normalPriority = NORMAL_PRIORITY
            if(!action.id){
                console.error('action id not provided')
                return orders;
            }
            return [...orders, {
                id: action.id,
                priority: normalPriority,
                status: 'PENDING',
            }];
        }
        case 'added-vip': {
            return handlePriorityOrder(VIP_PRIORITY);
        }
        case 'process': {
            return orders.map(o => {
                if (o.id === action.id) {
                    return {
                        ...o,
                        status: 'PROCESSING',
                    }
                }
                return o;
            });
        }
        case 'pending': {
            return orders.map(o => {
                if (o.id === action.id) {
                    return {
                        ...o,
                        status: 'PENDING',
                    }
                }
                return o;
            });
        }
        case 'deleted': {
          return orders.filter(o => o.id !== action.id);
        }
        default: {
            throw Error('Unknown action: ' + action.type);
        }
    }
}

export function PendingOrdersProvider({ children }: { children: ReactNode }) {
    const [tasks, dispatch] = useReducer(
        ordersReducer,
        initialOrders
    );

    return (
        <PendingOrdersContext.Provider value={tasks}>
            <PendingOrdersDispatchContext.Provider value={dispatch}>
                {children}
            </PendingOrdersDispatchContext.Provider>
        </PendingOrdersContext.Provider>
    );
}

export function usePendingOrders() {
    return useContext(PendingOrdersContext);
}

export function usePendingOrdersDispatch() {
    return useContext(PendingOrdersDispatchContext);
}




export type PendingOrderAction = {
    type: 'added-normal' | 'added-vip' | 'deleted' | 'process' | 'pending';
    id?: string;
}

export type PendingOrder = {
    id: string;
    priority: number;
    status: 'PENDING' | 'PROCESSING';
}
