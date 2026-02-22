import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Node, Edge } from '@vue-flow/core'

export interface WorkflowState {
  id: string
  name: string
  stateType: 'initial' | 'middle' | 'final'
  displayOrder: number
}

export interface WorkflowTransition {
  name: string
  assignedTo?: string
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

  // Actions
  function setCurrentWorkflow(id: string | null) {
    if (!id) {
      currentWorkflow.value = null
      return
    }
    const workflow = workflowById(id)
    if (workflow) {
      currentWorkflow.value = JSON.parse(JSON.stringify(workflow))
    }
  }

  function createWorkflow(name: string, description: string) {
    const newWorkflow: Workflow = {
      id: crypto.randomUUID(),
      name,
      description,
      isActive: true,
      nodes: [],
      edges: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    workflows.value.push(newWorkflow)
    return newWorkflow.id
  }

  function updateWorkflowMetadata(id: string, updates: Partial<Pick<Workflow, 'name' | 'description' | 'isActive'>>) {
    const workflow = workflowById(id)
    if (workflow) {
      Object.assign(workflow, updates, { updatedAt: new Date().toISOString() })
    }
  }

  function deleteWorkflow(id: string) {
    const index = workflows.value.findIndex(w => w.id === id)
    if (index !== -1) {
      workflows.value.splice(index, 1)
      if (currentWorkflow.value?.id === id) {
        currentWorkflow.value = null
      }
    }
  }

  // Node operations
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

  // Edge operations
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

  // Initialize with sample workflows for HR processes
  function initializeSampleWorkflows() {
    if (workflows.value.length > 0) return

    // Leave Approval Workflow
    const leaveWorkflow: Workflow = {
      id: 'leave-approval',
      name: 'Leave Approval Process',
      description: 'Standard workflow for employee leave requests',
      isActive: true,
      nodes: [
        {
          id: 'submitted',
          type: 'state',
          position: { x: 100, y: 150 },
          data: { id: 'submitted', name: 'Submitted', stateType: 'initial', displayOrder: 1 },
        },
        {
          id: 'pending-manager',
          type: 'state',
          position: { x: 300, y: 150 },
          data: { id: 'pending-manager', name: 'Pending Manager Review', stateType: 'middle', displayOrder: 2 },
        },
        {
          id: 'approved',
          type: 'state',
          position: { x: 500, y: 100 },
          data: { id: 'approved', name: 'Approved', stateType: 'final', displayOrder: 3 },
        },
        {
          id: 'rejected',
          type: 'state',
          position: { x: 500, y: 200 },
          data: { id: 'rejected', name: 'Rejected', stateType: 'final', displayOrder: 4 },
        },
      ],
      edges: [
        {
          id: 'e1',
          source: 'submitted',
          target: 'pending-manager',
          data: { name: 'Submit to Manager' },
        },
        {
          id: 'e2',
          source: 'pending-manager',
          target: 'approved',
          data: { name: 'Approve' },
        },
        {
          id: 'e3',
          source: 'pending-manager',
          target: 'rejected',
          data: { name: 'Reject' },
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    workflows.value.push(leaveWorkflow)
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
    setCurrentWorkflow,
    createWorkflow,
    updateWorkflowMetadata,
    deleteWorkflow,
    addNode,
    updateNodePosition,
    updateNodeData,
    removeNode,
    addEdge,
    updateEdgeData,
    removeEdge,
    saveCurrentWorkflow,
    initializeSampleWorkflows,
  }
})
