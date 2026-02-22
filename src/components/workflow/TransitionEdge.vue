<script setup lang="ts">
import { computed, ref } from 'vue'
import { BaseEdge, EdgeLabelRenderer, getBezierPath } from '@vue-flow/core'
import { useWorkflowStore } from '@/stores/workflow'
import type { WorkflowTransition } from '@/stores/workflow'

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
}>()

const workflowStore = useWorkflowStore()
const isEditing = ref(false)
const editedName = ref(props.data?.name || '')

const path = computed(() => {
  const [edgePath] = getBezierPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    sourcePosition: props.sourcePosition,
    targetX: props.targetX,
    targetY: props.targetY,
    targetPosition: props.targetPosition,
  })
  return edgePath
})

const labelPosition = computed(() => ({
  x: (props.sourceX + props.targetX) / 2,
  y: (props.sourceY + props.targetY) / 2,
}))

function handleEditClick() {
  isEditing.value = true
  editedName.value = props.data?.name || ''
}

function saveEdit() {
  if (editedName.value.trim()) {
    workflowStore.updateEdgeData(props.id, { name: editedName.value.trim() })
  }
  isEditing.value = false
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
        <div v-if="isEditing" class="flex gap-1 bg-white dark:bg-gray-800 p-1 rounded shadow-lg border">
          <input
            v-model="editedName"
            type="text"
            class="px-2 py-1 text-xs border rounded"
            @keyup.enter="saveEdit"
            @keyup.escape="isEditing = false"
            autofocus
          />
          <button
            @click="saveEdit"
            class="px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Save
          </button>
        </div>
        <button
          v-else
          @click="handleEditClick"
          class="px-2 py-1 text-xs bg-white dark:bg-gray-800 rounded shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 border font-medium"
        >
          {{ data?.name || 'Click to edit' }}
        </button>
      </div>
    </EdgeLabelRenderer>
  </g>
</template>
