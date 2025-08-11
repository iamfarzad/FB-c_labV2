export function hasConsent(allow: boolean): boolean { return !!allow }
export function contextReady(ctx: any): boolean { return !!(ctx?.company || ctx?.person || ctx?.role) }


