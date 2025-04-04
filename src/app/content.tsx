'use client'

import { useEffect, useMemo } from "react";
import botIdCounter from "@/cache/botIdCounter";
import { GET_NORMAL_ID, GET_VIP_ID } from "@/cache/pendingOrderGetId";
import { useBots, useBotsDispatch } from "@/context/bot";
import { useCompletedOrders, useCompletedOrdersDispatch } from "@/context/completedOrder";
import { usePendingOrders, usePendingOrdersDispatch } from "@/context/pendingOrder";

export default function Content() {
    const pendingOrdersFromContext = usePendingOrders()
    const completedOrdersFromContext = useCompletedOrders()
    const botsFromContext = useBots()

    const bots = useMemo(() => { return botsFromContext ? [...botsFromContext] : [] }, [botsFromContext]);
    const pendingOrders = useMemo(() => { return pendingOrdersFromContext ? [...pendingOrdersFromContext] : [] }, [pendingOrdersFromContext]);
    const completedOrders = useMemo(() => { return completedOrdersFromContext ? [...completedOrdersFromContext] : [] }, [completedOrdersFromContext]);
    const dispatchPendingOrder = usePendingOrdersDispatch();
    const dispatchBots = useBotsDispatch()
    const dispatchCompletedOrder = useCompletedOrdersDispatch()

    if (!dispatchPendingOrder) {
        throw new Error('Dispatch pending function is null');
    }
    if (!dispatchBots) {
        throw new Error('Dispatch bots is null')
    }
    if (!dispatchCompletedOrder) {
        throw new Error('Dispatch completed function is null')
    }

    /**
     * Automated process handling for robot 
     */
    useEffect(() => {
        const idleBots = bots.filter(bot => bot.status === 'IDLE');
        const localProcessedOrderIds: string[] = [];
        idleBots.forEach(bot => {
            const filterPendingOrders = pendingOrders.filter(o => o.status === 'PENDING' && localProcessedOrderIds.indexOf(o.id) < 0);
            const pendingOrder = filterPendingOrders && filterPendingOrders[0];
            if (pendingOrder) {
                const timerFunction = setTimeout(() => {
                    dispatchPendingOrder({ type: 'deleted', id: pendingOrder.id });
                    dispatchCompletedOrder({ type: 'added', pendingOrderId: pendingOrder.id });
                    dispatchBots({ type: 'idle', id: bot.id });
                }, 10 * 1000)
                dispatchBots({
                    type: 'assign-pending-order', id: bot.id, pendingOrderId: pendingOrder.id,
                    processFunction: timerFunction
                });
                localProcessedOrderIds.push(pendingOrder.id)
                dispatchPendingOrder({ type: 'process', id: pendingOrder.id });
            }
        });
    }, [bots, pendingOrders, dispatchCompletedOrder, dispatchBots, dispatchPendingOrder]);
    const newNormalOrder = () => {
        dispatchPendingOrder({ type: 'added-normal', id: GET_NORMAL_ID() });
    }
    const newVipOrder = () => {
        dispatchPendingOrder({ type: 'added-vip', id: GET_VIP_ID() });
    }
    const addBot = () => {
        botIdCounter.counter++
        const newBotId = botIdCounter.counter;
        dispatchBots({ type: 'added', id: newBotId });
    }
    const removeBot = () => {
        const [bot] = bots;
        if (!bot) {
            return
        }
        if (bot.processFunction) {
            clearTimeout(bot.processFunction)
        }
        dispatchBots({ 'type': 'deleted', id: bot?.id })
        dispatchPendingOrder({ 'type': 'pending', id: bot?.pendingOrderId || undefined })
    }

    const printPriority = (val: number) => {
        switch (val) {
            case 1:
                return 'VIP'
            case 2:
                return 'NORMAL'
            default:
                return String(val)
        }
    }
    return (
        <div>
            <h1>Welcome to the McDonald&apos;s Dashboard</h1>
            <p>This is a simple dashboard for managing McDonald&apos;s orders.</p>
            <div style={{ width: '100%', flexDirection: 'row', display: 'flex', gap: '10px' }}>
                <button onClick={newNormalOrder}>New Normal Order</button>
                <button onClick={newVipOrder}>New VIP Order</button>
                <button onClick={addBot}>+ Bot</button>
                <button onClick={removeBot}>- Bot</button>
            </div>
            <div style={{ width: '100%', flexDirection: 'row', display: 'flex', gap: '20px' }}>
                <div style={{ width: '100%', }}>
                    <h3>PENDING</h3>
                    {
                        pendingOrders.length === 0 && (
                            <p>No pending orders found.</p>
                        )
                    }
                    {
                        pendingOrders.length > 0 && (
                            <p>No. pending orders found: {pendingOrders.length}</p>
                        )
                    }
                    {
                        pendingOrders.length > 0 && (
                            <table style={{ width: '100%' }}>
                                <thead>
                                    <tr>
                                        <th>Pending Order No.</th>
                                        <th>Priority</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {pendingOrders && pendingOrders.map((order) => (
                                        <tr key={order.id}>
                                            <td>{order.id}</td>
                                            <td>{printPriority(order.priority)}</td>
                                            <td>{order.status}</td>
                                        </tr>
                                    ))}

                                </tbody>
                            </table>
                        )
                    }
                </div>
                <div style={{ width: '100%', }}>
                    <h3>BOT</h3>
                    {
                        bots.length === 0 && (
                            <p>No bot found.</p>
                        )
                    }
                    {
                        bots.length > 0 && (
                            <p>No. bot found: {bots.length}</p>
                        )
                    }
                    {
                        bots.length > 0 && (
                            <table style={{ width: '100%' }}>
                                <thead>
                                    <tr>
                                        <th>Id</th>
                                        <th>Pending Order No.</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bots.map((bot) => (
                                        <tr key={bot.id}>
                                            <td>{bot.id}</td>
                                            <td>{bot.pendingOrderId}</td>
                                            <td>{bot.status}</td>
                                        </tr>
                                    ))}

                                </tbody>
                            </table>
                        )
                    }
                </div>
                <div style={{ width: '100%', }}>
                    <h3>COMPLETED</h3>
                    {
                        completedOrders.length === 0 && (
                            <p>No completed orders found.</p>
                        )
                    }
                    {
                        completedOrders.length > 0 && (
                            <p>No. completed orders found: {completedOrders.length}</p>
                        )
                    }
                    {
                        completedOrders.length > 0 && (
                            <table style={{ width: '100%', }}>
                                <thead>
                                    <tr>
                                        <th>Id</th>
                                        <th>Pending Order No.</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {completedOrders && completedOrders.map((order) => (
                                        <tr key={order.id}>
                                            <td>{order.id}</td>
                                            <td>{order.pendingOrderId}</td>
                                        </tr>
                                    ))}

                                </tbody>
                            </table>
                        )
                    }
                </div>
            </div>

        </div>
    )
}
