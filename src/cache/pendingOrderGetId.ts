interface PriorityCache {
    [key: string]: number
}
const pendingOrderCache: PriorityCache = {};
const getId = (priority: number) => {
    const key = String(priority);
    if (!pendingOrderCache[key]) {
        pendingOrderCache[key] = 1;
    }
    else {
        pendingOrderCache[key]++
    }
    return `po-${key}-${pendingOrderCache[key]}`;
}
export const VIP_PRIORITY = 1;
export const NORMAL_PRIORITY = 2;
export const GET_VIP_ID = () => {
    return getId(VIP_PRIORITY)
}
export const GET_NORMAL_ID = () => {
    return getId(NORMAL_PRIORITY)
}