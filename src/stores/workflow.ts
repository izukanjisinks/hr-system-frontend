import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Node, Edge } from '@vue-flow/core'
import { workflowApi } from '@/services/api/workflow'
import type { BackendWorkflow, BackendWorkflowStep, BackendWorkflowTransition } from '@/types/workflow'

export interface WorkflowState {
  id: string
  name: string
  stateType: 'initial' | 'middle' | 'final'
  displayOrder: number
  stepId: string // Backend step ID
  allowedRoles: string[]
}

export interface WorkflowTransition {
  name: string
  transitionId?: string // Backend transition ID
  actionName?: string
}

export interface Workflow {
  id: string
  name: string
  description: string
  isActive: boolean
  nodes: Node<WorkflowState>[]
  edges: Edge<WorkflowTransition>[]
  createdAt: string
  updatedAt: string
  createdBy: string
}

export const useWorkflowStore = defineStore('workflow', () => {
  const workflows = ref<Workflow[]>([])
  const currentWorkflow = ref<Workflow | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  // Computed
  const activeWorkflows = computed(() =>
    workflows.value.filter(w => w.isActive)
  )

  const workflowById = (id: string) =>
    workflows.value.find(w => w.id === id)

  // Helper: Convert backend data to Vue Flow format
  function convertToVueFlow(
    workflow: BackendWorkflow,
    steps: BackendWorkflowStep[],
    transitions: BackendWorkflowTransition[]
  ): Workflow {
    // Sort steps by order
    const sortedSteps = [...steps].sort((a, b) => a.step_order - b.step_order)

    // Create nodes from steps
    const nodes: Node<WorkflowState>[] = sortedSteps.map((step, index) => {
      let stateType: 'initial' | 'middle' | 'final' = 'middle'
      if (step.initial) stateType = 'initial'
      if (step.final) stateType = 'final'

      return {
        id: step.id,
        type: 'state',
        position: {
          x: 100 + index * 200,
          y: 150 + (step.final ? 50 : 0) - (step.initial ? 50 : 0)
        },
        data: {
          id: step.id,
          name: step.step_name,
          stateType,
          displayOrder: step.step_order,
          stepId: step.id,
          allowedRoles: step.allowed_roles,
        },
      }
    })

    // Create edges from transitions
    const edges: Edge<WorkflowTransition>[] = transitions.map(transition => ({
      id: transition.id,
      source: transition.from_step_id,
      target: transition.to_step_id,
      type: 'default',
      data: {
        name: transition.action_name,
        transitionId: transition.id,
        actionName: transition.action_name,
      },
    }))

    return {
      id: workflow.id,
      name: workflow.name,
      description: workflow.description,
      isActive: workflow.is_active,
      nodes,
      edges,
      createdAt: workflow.created_at,
      updatedAt: workflow.updated_at,
      createdBy: workflow.created_by,
    }
  }

  // Fetch all workflows from backend
  async function fetchWorkflows() {
    loading.value = true
    error.value = null
    try {
      const response = await workflowApi.getAllWorkflows()

      // Fetch structure for each workflow
      const workflowsWithStructure = await Promise.all(
        response.workflows.map(async (w) => {
          try {
            const structure = await workflowApi.getWorkflowStructure(w.id)
            return convertToVueFlow(structure.workflow, structure.steps, structure.transitions)
          } catch (err) {
            console.error(`Failed to load structure for workflow ${w.id}:`, err)
            // Return workflow with empty structure if fetch fails
            return convertToVueFlow(w, [], [])
          }
        })
      )

      workflows.value = workflowsWithStructure
    } catch (err) {
      console.error('Failed to load workflows:', err)
      error.value = (err as any)?.error?.message || (err as Error)?.message || 'Failed to load workflows'
    } finally {
      loading.value = false
    }
  }

  // Load a specific workflow with full structure
  async function loadWorkflow(id: string) {
    loading.value = true
    error.value = null
    try {
      const structure = await workflowApi.getWorkflowStructure(id)
      const workflow = convertToVueFlow(structure.workflow, structure.steps, structure.transitions)

      // Update in workflows list
      const index = workflows.value.findIndex(w => w.id === id)
      if (index !== -1) {
        workflows.value[index] = workflow
      } else {
        workflows.value.push(workflow)
      }

      // Set as current
      currentWorkflow.value = JSON.parse(JSON.stringify(workflow))
    } catch (err) {
      console.error('Failed to load workflow:', err)
      error.value = (err as any)?.error?.message || (err as Error)?.message || 'Failed to load workflow'
    } finally {
      loading.value = false
    }
  }

  // Set current workflow
  function setCurrentWorkflow(id: string | null) {
    if (!id) {
      currentWorkflow.value = null
      return
    }
    const workflow = workflowById(id)
    if (workflow) {
      currentWorkflow.value = JSON.parse(JSON.stringify(workflow))
    } else {
      // Load from backend if not in cache
      loadWorkflow(id)
    }
  }

  // Create new workflow
  async function createWorkflow(name: string, description: string) {
    loading.value = true
    error.value = null
    try {
      const newWorkflow = await workflowApi.createWorkflow({ name, description })

      // Convert to Vue Flow format (no steps/transitions yet)
      const workflow = convertToVueFlow(newWorkflow, [], [])
      workflows.value.push(workflow)

      return newWorkflow.id
    } catch (err) {
      console.error('Failed to create workflow:', err)
      error.value = (err as any)?.error?.message || (err as Error)?.message || 'Failed to create workflow'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Delete workflow (not implemented in backend yet, keep local for now)
  function deleteWorkflow(id: string) {
    const index = workflows.value.findIndex(w => w.id === id)
    if (index !== -1) {
      workflows.value.splice(index, 1)
      if (currentWorkflow.value?.id === id) {
        currentWorkflow.value = null
      }
    }
  }

  // Node operations (local until we implement backend sync)
  function addNode(node: Node<WorkflowState>) {
    if (!currentWorkflow.value) return
    currentWorkflow.value.nodes = [...currentWorkflow.value.nodes, node]
  }

  function updateNodePosition(nodeId: string, position: { x: number; y: number }) {
    if (!currentWorkflow.value) return
    const node = currentWorkflow.value.nodes.find(n => n.id === nodeId)
    if (node) {
      node.position = position
      currentWorkflow.value.nodes = [...currentWorkflow.value.nodes]
    }
  }

  function updateNodeData(nodeId: string, data: Partial<WorkflowState>) {
    if (!currentWorkflow.value) return
    const node = currentWorkflow.value.nodes.find(n => n.id === nodeId)
    if (node) {
      node.data = { ...node.data, ...data }
      currentWorkflow.value.nodes = [...currentWorkflow.value.nodes]
    }
  }

  function removeNode(nodeId: string) {
    if (!currentWorkflow.value) return
    currentWorkflow.value.nodes = currentWorkflow.value.nodes.filter(n => n.id !== nodeId)
    currentWorkflow.value.edges = currentWorkflow.value.edges.filter(
      e => e.source !== nodeId && e.target !== nodeId
    )
  }

  // Edge operations (local until we implement backend sync)
  function addEdge(edge: Edge<WorkflowTransition>) {
    if (!currentWorkflow.value) return
    currentWorkflow.value.edges = [...currentWorkflow.value.edges, edge]
  }

  function updateEdgeData(edgeId: string, data: Partial<WorkflowTransition>) {
    if (!currentWorkflow.value) return
    const edge = currentWorkflow.value.edges.find(e => e.id === edgeId)
    if (edge) {
      edge.data = { ...edge.data, ...data }
      currentWorkflow.value.edges = [...currentWorkflow.value.edges]
    }
  }

  function removeEdge(edgeId: string) {
    if (!currentWorkflow.value) return
    currentWorkflow.value.edges = currentWorkflow.value.edges.filter(e => e.id !== edgeId)
  }

  // Save current workflow back to workflows list
  function saveCurrentWorkflow() {
    if (!currentWorkflow.value) return
    const index = workflows.value.findIndex(w => w.id === currentWorkflow.value!.id)
    if (index !== -1) {
      currentWorkflow.value.updatedAt = new Date().toISOString()
      workflows.value[index] = JSON.parse(JSON.stringify(currentWorkflow.value))
    }
  }

  return {
    // State
    workflows,
    currentWorkflow,
    loading,
    error,

    // Computed
    activeWorkflows,
    workflowById,

    // Actions
    fetchWorkflows,
    loadWorkflow,
    setCurrentWorkflow,
    createWorkflow,
    deleteWorkflow,
    addNode,
    updateNodePosition,
    updateNodeData,
    removeNode,
    addEdge,
    updateEdgeData,
    removeEdge,
    saveCurrentWorkflow,
  }
})
