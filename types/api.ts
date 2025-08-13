export interface ActionResponse<T = any> { ok: boolean; output?: T; error?: string; citations?: { uri: string; title?: string }[] }

