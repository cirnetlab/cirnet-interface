import type { HealthResponse } from '../../types/api'
import { apiClient } from './client'
import { callOperation } from './operations'
export { circuitsApi, validateCircuit } from './circuits'
export { stationsApi } from './stations'
export { experimentsApi } from './experiments'
export { ApiError } from './client'

export function health(signal?: AbortSignal): Promise<HealthResponse> {
  return callOperation(apiClient, 'getHealth', { signal })
}
