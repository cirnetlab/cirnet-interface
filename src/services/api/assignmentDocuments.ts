import type {AssignmentAuthoringSaveV2,AssignmentAuthoringPublicationV2} from '@cirnet/contracts/dto'
import type {AssignmentDefinition} from '../../types/assignment'
import {apiClient} from './client'
import {callOperation} from './operations'
export const assignmentDocumentsApi={
 list(query:{limit?:number;cursor?:string|null}={},signal?:AbortSignal){return callOperation(apiClient,'listAssignmentDocumentsV2',{query,signal})},
 get(id:string,signal?:AbortSignal){return callOperation(apiClient,'getAssignmentDocumentV2',{path:{assignment_id:id},signal})},
 create(definition:AssignmentDefinition,signal?:AbortSignal){return callOperation(apiClient,'createAssignmentDocumentV2',{body:{definition},signal})},
 save(id:string,body:AssignmentAuthoringSaveV2,signal?:AbortSignal){return callOperation(apiClient,'saveAssignmentDocumentV2',{path:{assignment_id:id},body,signal})},
 publish(id:string,body:AssignmentAuthoringPublicationV2,signal?:AbortSignal){return callOperation(apiClient,'publishAssignmentDocumentV2',{path:{assignment_id:id},body,signal})},
}
