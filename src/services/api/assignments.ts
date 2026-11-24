import { apiClient } from './client'
import { callOperation } from './operations'

export const assignmentsApi={
  get(id:string,signal?:AbortSignal){return callOperation(apiClient,'getAssignmentV2',{path:{assignment_id:id},signal})},
  list(signal?:AbortSignal) {
    return callOperation(apiClient,'listAssignmentsV2',{signal})
  },
}
