'use client'
import { createContext, ReactNode, useContext, useReducer } from 'react';

const BotsContext = createContext<Bot[] | null>(null);

const BotsDispatchContext = createContext<React.Dispatch<BotAction> | null>(null);

const initialBots: Bot[] = [];

const reducer = (bots: Bot[], action: BotAction): Bot[] => {
    switch (action.type) {
        case 'added': {
            if(!action.id){
                console.error('No id provided for bot');
                return bots;
            }
            
            return [...bots, {
                id: action.id,
                pendingOrderId: action.pendingOrderId ?? null,
                status: 'IDLE',
                processFunction: action.processFunction,
            }];
        }
        case 'idle': {
            const bot = bots.find((bot) => bot.id === action.id);
            if(!bot) {
                return bots;
            }
            return bots.map((b) => {
                if(b.id === action.id) {
                    return {
                        ...b,
                        pendingOrderId: null,
                        status: 'IDLE',
                    };
                }
                return b;
            });
        }

        case 'assign-pending-order': {
            const pendingOrderId = action.pendingOrderId
            if(!pendingOrderId) {
                return bots;
            }
            const bot = bots.find((bot) => bot.id === action.id);
            if(!bot) {
                return bots;
            }
            return bots.map((b) => {
                if(b.id === action.id) {
                    return {
                        ...b,
                        pendingOrderId,
                        status: 'PROCESSING',
                        processFunction: action.processFunction,
                    };
                }
                return b;
            });
        }
        case 'start-idle': {
            const idleBot = bots.find((bot) => bot.status === 'IDLE');
            if(!idleBot) {
                return bots;
            }
            if(!action.processFunction) {
                console.warn('No process function provided for bot');
                return bots;
            }
            return bots.map((b) => {
                if(b.id === action.id && action.processFunction) {
                    return {
                        ...b,
                        status: 'PROCESSING',
                        pendingOrderId: action.pendingOrderId ?? null,
                        processFunction: action.processFunction,
                    };
                }
                return b;
            });
        }
        case 'deleted': {
            return bots.filter((bot) => bot.id !== action.id);
        }
        default:
            return bots;
    }
};
export function BotsProvider({ children }: { children: ReactNode }) {
    const [tasks, dispatch] = useReducer(
        reducer,
        initialBots
    );

    return (
        <BotsContext.Provider value={tasks}>
            <BotsDispatchContext.Provider value={dispatch}>
                {children}
            </BotsDispatchContext.Provider>
        </BotsContext.Provider>
    );
}
export function useBots() {
    return useContext(BotsContext);
}

export function useBotsDispatch() {
    return useContext(BotsDispatchContext);
}
export type Bot ={
    id: number;
    status: 'IDLE' | 'PROCESSING';
    pendingOrderId: string | null;
    processFunction: ReturnType<typeof setTimeout> | undefined;
}
export type BotAction = {
    id?: number;
    pendingOrderId?: string;
    processFunction?: ReturnType<typeof setTimeout>;
    type: 'added' | 'idle'  | 'deleted' | 'assign-pending-order' | 'start-idle';
}