import { apiClient } from './client'
import type {
  GetWorkflowsResponse,
  BackendWorkflow,
  WorkflowStructure,
  CreateWorkflowPayload,
  BackendWorkflowStep,
  CreateStepPayload,
  BackendWorkflowTransition,
  CreateTransitionPayload,
} from '@/types/workflow'

export const workflowApi = {
  // Workflow Management
  getAllWorkflows(): Promise<GetWorkflowsResponse> {
    return apiClient.get<GetWorkflowsResponse>('/admin/workflows')
  },

  getWorkflowById(id: string): Promise<BackendWorkflow> {
    return apiClient.get<BackendWorkflow>(`/admin/workflows/${id}`)
  },

  createWorkflow(payload: CreateWorkflowPayload): Promise<BackendWorkflow> {
    return apiClient.post<BackendWorkflow>('/admin/workflows', payload)
  },

  getWorkflowStructure(id: string): Promise<WorkflowStructure> {
    return apiClient.get<WorkflowStructure>(`/admin/workflows/${id}/structure`)
  },

  // Step Management
  getWorkflowSteps(workflowId: string): Promise<BackendWorkflowStep[]> {
    return apiClient.get<BackendWorkflowStep[]>(`/admin/workflows/${workflowId}/steps`)
  },

  getStepById(stepId: string): Promise<BackendWorkflowStep> {
    return apiClient.get<BackendWorkflowStep>(`/admin/workflow-steps/${stepId}`)
  },

  createStep(payload: CreateStepPayload): Promise<BackendWorkflowStep> {
    return apiClient.post<BackendWorkflowStep>('/admin/workflow-steps', payload)
  },

  // Transition Management
  getWorkflowTransitions(workflowId: string): Promise<BackendWorkflowTransition[]> {
    return apiClient.get<BackendWorkflowTransition[]>(`/admin/workflows/${workflowId}/transitions`)
  },

  getValidTransitionsFromStep(stepId: string): Promise<BackendWorkflowTransition[]> {
    return apiClient.get<BackendWorkflowTransition[]>(`/admin/workflow-steps/${stepId}/transitions`)
  },

  createTransition(payload: CreateTransitionPayload): Promise<BackendWorkflowTransition> {
    return apiClient.post<BackendWorkflowTransition>('/admin/workflow-transitions', payload)
  },
}
