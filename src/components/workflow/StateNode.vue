<script setup lang="ts">
import { computed, ref } from 'vue'
import { Handle, Position } from '@vue-flow/core'
import { useWorkflowStore } from '@/stores/workflow'
import { Edit2, Trash2 } from 'lucide-vue-next'
import type { WorkflowState } from '@/stores/workflow'

const props = defineProps<{
  id: string
  data: WorkflowState
}>()

const workflowStore = useWorkflowStore()
const isHovered = ref(false)
const isEditing = ref(false)
const editedName = ref(props.data.name)

const stateTypeColor = computed(() => {
  switch (props.data.stateType) {
    case 'initial':
      return 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950'
    case 'middle':
      return 'border-blue-500 bg-blue-50 dark:bg-blue-950'
    case 'final':
      return 'border-red-500 bg-red-50 dark:bg-red-950'
    default:
      return 'border-gray-500 bg-gray-50 dark:bg-gray-950'
  }
})

function handleEdit() {
  isEditing.value = true
  editedName.value = props.data.name
}

function saveEdit() {
  if (editedName.value.trim()) {
    workflowStore.updateNodeData(props.id, { name: editedName.value.trim() })
  }
  isEditing.value = false
}

function handleDelete() {
  if (confirm(`Delete state "${props.data.name}"?`)) {
    workflowStore.removeNode(props.id)
  }
}
</script>

<template>
  <div
    class="relative px-4 py-3 shadow-md rounded-lg border-2 min-w-[150px] transition-all"
    :class="stateTypeColor"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <!-- Source Handle (left) -->
    <Handle
      type="target"
      :position="Position.Left"
      class="!w-3 !h-3 !bg-gray-400 !border-2 !border-white"
    />

    <!-- Content -->
    <div class="flex flex-col gap-1">
      <div v-if="isEditing" class="flex gap-1">
        <input
          v-model="editedName"
          type="text"
          class="flex-1 px-2 py-1 text-sm border rounded"
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
      <div v-else class="font-semibold text-sm">{{ data.name }}</div>

      <div class="text-xs text-muted-foreground capitalize">{{ data.stateType }}</div>
    </div>

    <!-- Action Buttons (show on hover) -->
    <div
      v-if="isHovered && !isEditing"
      class="absolute -top-2 -right-2 flex gap-1"
    >
      <button
        @click="handleEdit"
        class="p-1 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-100 dark:hover:bg-gray-700 border"
      >
        <Edit2 class="size-3" />
      </button>
      <button
        @click="handleDelete"
        class="p-1 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-red-100 dark:hover:bg-red-900 border"
      >
        <Trash2 class="size-3" />
      </button>
    </div>

    <!-- Target Handle (right) -->
    <Handle
      type="source"
      :position="Position.Right"
      class="!w-3 !h-3 !bg-gray-400 !border-2 !border-white"
    />
  </div>
</template>
