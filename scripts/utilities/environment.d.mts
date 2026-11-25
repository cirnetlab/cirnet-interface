export function environmentValue(name:string, environment?:NodeJS.ProcessEnv):string|undefined
export function synchronizeEnvironment<T extends NodeJS.ProcessEnv>(environment?:T):T
