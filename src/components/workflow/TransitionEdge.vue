<script setup lang="ts">
import { computed, ref } from 'vue'
import { BaseEdge, EdgeLabelRenderer, getBezierPath, Position } from '@vue-flow/core'
import { useWorkflowStore } from '@/stores/workflow'
import type { WorkflowTransition } from '@/stores/workflow'

// @ts-ignore - Vue SFC component
import TransitionEditDialog from './TransitionEditDialog.vue'

const props = defineProps<{
  id: string
  sourceX: number
  sourceY: number
  targetX: number
  targetY: number
  sourcePosition: any
  targetPosition: any
  data: WorkflowTransition
  markerEnd?: string
  sourceHandleId?: string
  targetHandleId?: string
}>()

const workflowStore = useWorkflowStore()
const showEditDialog = ref(false)

const path = computed(() => {
  const [edgePath] = getBezierPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    sourcePosition: props.sourcePosition,
    targetX: props.targetX,
    targetY: props.targetY,
    targetPosition: props.targetPosition,
    curvature: 0.25,
  })
  return edgePath
})

const labelPosition = computed(() => {
  // Position label with slight offset to avoid overlap
  const yDiff = props.targetY - props.sourceY
  const baseY = (props.sourceY + props.targetY) / 2
  const offsetY = yDiff > 0 ? 10 : -10

  return {
    x: (props.sourceX + props.targetX) / 2,
    y: baseY + offsetY,
  }
})

function handleEditClick() {
  showEditDialog.value = true
}

async function handleSave(data: Partial<WorkflowTransition>) {
  // Update local state first
  workflowStore.updateEdgeData(props.id, data)

  // Determine if this is a new transition (temporary ID) or existing transition (UUID)
  const isNewTransition = props.id.startsWith('e')

  try {
    if (isNewTransition && workflowStore.currentWorkflow) {
      // Get the edge to find source and target
      const edge = workflowStore.currentWorkflow.edges.find(e => e.id === props.id)
      if (edge) {
        // Create new transition in backend
        await workflowStore.createTransition(
          workflowStore.currentWorkflow.id,
          edge.source,
          edge.target,
          data as WorkflowTransition
        )
      }
    } else if (!isNewTransition) {
      // Update existing transition in backend
      await workflowStore.updateTransition(props.id, data)
    }
  } catch (err) {
    console.error('Failed to save transition:', err)
    alert('Failed to save transition. Please try again.')
  }
}
</script>

<template>
  <g>
    <BaseEdge
      :id="id"
      :path="path[0]"
      :marker-end="markerEnd"
      class="stroke-2 stroke-gray-400"
    />
    <EdgeLabelRenderer>
      <div
        :style="{
          position: 'absolute',
          transform: `translate(-50%, -50%) translate(${labelPosition.x}px,${labelPosition.y}px)`,
          pointerEvents: 'all',
        }"
        class="nodrag nopan"
      >
        <button
          @click="handleEditClick"
          class="px-2 py-1 text-xs bg-white dark:bg-gray-800 rounded shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 border font-medium"
        >
          {{ data?.actionName || data?.name || 'Click to edit' }}
        </button>
      </div>
    </EdgeLabelRenderer>

    <!-- Edit Dialog -->
    <TransitionEditDialog
      :open="showEditDialog"
      :transition-data="data"
      @update:open="(val) => showEditDialog = val"
      @save="handleSave"
    />
  </g>
</template>
