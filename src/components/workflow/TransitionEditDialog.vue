<script setup lang="ts">
import { ref, watch } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import type { WorkflowTransition } from '@/stores/workflow'

const props = defineProps<{
  open: boolean
  transitionData?: WorkflowTransition | null
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'save': [data: Partial<WorkflowTransition>]
}>()

const conditionTypes = [
  { value: 'always', label: 'Always' },
  { value: 'equals', label: 'Equals' },
  { value: 'not_equals', label: 'Not Equals' },
  { value: 'contains', label: 'Contains' },
]

const formData = ref({
  actionName: '',
  conditionType: 'always',
  conditionValue: '',
})

// Watch both transitionData and open state to reset form when dialog opens
watch([() => props.transitionData, () => props.open], ([newData, isOpen]) => {
  if (newData && isOpen) {
    formData.value = {
      actionName: newData.actionName || '',
      conditionType: newData.conditionType || 'always',
      conditionValue: newData.conditionValue || '',
    }
  }
}, { immediate: true })

function handleSave() {
  emit('save', {
    name: formData.value.actionName,
    actionName: formData.value.actionName,
    conditionType: formData.value.conditionType,
    conditionValue: formData.value.conditionValue,
  })
  emit('update:open', false)
}

function handleClose() {
  emit('update:open', false)
}
</script>

<template>
  <Dialog :open="open" @update:open="(val) => emit('update:open', val)">
    <DialogContent class="sm:max-w-[500px]">
      <DialogHeader>
        <DialogTitle>Edit Transition</DialogTitle>
        <DialogDescription>
          Configure transition action and conditions
        </DialogDescription>
      </DialogHeader>

      <div class="grid gap-4 py-4">
        <!-- Action Name -->
        <div class="grid gap-2">
          <Label for="action-name">Action Name</Label>
          <input
            id="action-name"
            v-model="formData.actionName"
            type="text"
            placeholder="e.g., approve, reject, submit"
            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
          <p class="text-xs text-muted-foreground">
            The action that triggers this transition
          </p>
        </div>

        <!-- Condition Type -->
        <div class="grid gap-2">
          <Label for="condition-type">Condition Type</Label>
          <select
            id="condition-type"
            v-model="formData.conditionType"
            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option v-for="type in conditionTypes" :key="type.value" :value="type.value">
              {{ type.label }}
            </option>
          </select>
          <p class="text-xs text-muted-foreground">
            When should this transition be allowed?
          </p>
        </div>

        <!-- Condition Value -->
        <div v-if="formData.conditionType !== 'always'" class="grid gap-2">
          <Label for="condition-value">Condition Value</Label>
          <input
            id="condition-value"
            v-model="formData.conditionValue"
            type="text"
            placeholder="Enter condition value"
            class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          />
          <p class="text-xs text-muted-foreground">
            The value to check against
          </p>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="handleClose">
          Cancel
        </Button>
        <Button @click="handleSave" :disabled="!formData.actionName.trim()">
          Save Changes
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
