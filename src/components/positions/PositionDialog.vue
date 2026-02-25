<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Loader2, Briefcase, AlertCircle, Check } from 'lucide-vue-next'
import type { Position, CreatePositionPayload, UpdatePositionPayload } from '@/services/api/position'
import type { Role } from '@/types/role'

const props = defineProps<{
  open: boolean
  position: Position | null
  departments: Array<{ id: string; name: string }>
  roles: Role[]
}>()

const emit = defineEmits<{
  'update:open': [value: boolean]
  'save': [payload: CreatePositionPayload | UpdatePositionPayload, onError: (error: string) => void]
}>()

const saving = ref(false)
const errorMessage = ref('')

const formData = ref({
  title: '',
  code: '',
  department_id: '',
  role_id: '',
  grade_level: '',
  min_salary: 0,
  max_salary: 0,
  description: '',
})

const isEditMode = computed(() => props.position !== null)
const dialogTitle = computed(() => isEditMode.value ? 'Edit Position' : 'Add New Position')

// Watch for dialog open/close and position changes
watch([() => props.open, () => props.position], ([isOpen, position]) => {
  if (!isOpen) return

  errorMessage.value = ''

  if (position) {
    formData.value = {
      title: position.title,
      code: position.code,
      department_id: position.department_id,
      role_id: position.role_id || '',
      grade_level: position.grade_level,
      min_salary: position.min_salary,
      max_salary: position.max_salary,
      description: position.description || '',
    }
  } else {
    resetForm()
  }
})

function resetForm() {
  formData.value = {
    title: '',
    code: '',
    department_id: '',
    role_id: '',
    grade_level: '',
    min_salary: 0,
    max_salary: 0,
    description: '',
  }
}

function handleRoleToggle(roleId: string, checked: boolean | string) {
  console.log('handleRoleToggle called:', { roleId, checked, currentSelection: formData.value.role_id })
  const isChecked = Boolean(checked)

  if (isChecked) {
    // Radio behavior: set only this role, clearing others
    console.log('Setting role to:', roleId)
    formData.value.role_id = roleId
  } else {
    // If unchecking the currently selected role, clear it
    if (formData.value.role_id === roleId) {
      console.log('Clearing role')
      formData.value.role_id = ''
    }
  }
  console.log('After toggle, role_id is:', formData.value.role_id)
}

function isRoleSelected(roleId: string): boolean {
  const selected = formData.value.role_id === roleId
  console.log('isRoleSelected:', { roleId, currentRoleId: formData.value.role_id, selected })
  return selected
}


async function handleSave() {
  saving.value = true
  errorMessage.value = ''

  try {
    const payload: any = { ...formData.value }

    // Convert salary numbers to strings for API
    payload.min_salary = String(payload.min_salary)
    payload.max_salary = String(payload.max_salary)

    // Clean up empty optional fields
    if (!payload.description) delete payload.description

    console.log('Position Dialog Payload:', JSON.stringify(payload, null, 2))

    emit('save', payload, (error: string) => {
      errorMessage.value = error
      saving.value = false
    })
  } catch (err) {
    saving.value = false
  }
}

function handleClose() {
  emit('update:open', false)
  if (!isEditMode.value) {
    resetForm()
  }
}
</script>

<template>
  <Dialog :open="open" @update:open="(val) => emit('update:open', val)">
    <DialogContent :key="position?.id || 'new'" class="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle class="flex items-center gap-2">
          <Briefcase class="w-5 h-5" />
          {{ dialogTitle }}
        </DialogTitle>
        <DialogDescription>
          {{ isEditMode ? 'Update position information below.' : 'Fill in the position details to create a new position.' }}
        </DialogDescription>
      </DialogHeader>

      <!-- Error Message -->
      <div v-if="errorMessage" class="bg-destructive/10 border border-destructive/20 rounded-lg p-4 flex items-start gap-3">
        <AlertCircle class="w-5 h-5 text-destructive shrink-0 mt-0.5" />
        <div class="flex-1">
          <p class="text-sm font-medium text-destructive">Error</p>
          <p class="text-sm text-destructive/90 mt-1">{{ errorMessage }}</p>
        </div>
      </div>

      <div class="grid gap-4 py-4">
        <div class="grid grid-cols-2 gap-4">
          <div class="grid gap-2">
            <Label for="title">Position Title *</Label>
            <Input id="title" v-model="formData.title" required placeholder="e.g., Software Engineer" />
          </div>
          <div class="grid gap-2">
            <Label for="code">Position Code *</Label>
            <Input id="code" v-model="formData.code" required placeholder="e.g., SE-01" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="grid gap-2">
            <Label for="department_id">Department *</Label>
            <Select v-model="formData.department_id">
              <SelectTrigger>
                <SelectValue placeholder="Select department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem v-for="dept in departments" :key="dept.id" :value="dept.id">
                  {{ dept.name }}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div class="grid gap-2">
            <Label for="grade_level">Grade Level *</Label>
            <Input id="grade_level" v-model="formData.grade_level" required placeholder="e.g., L3" />
          </div>
        </div>

        <div class="grid grid-cols-2 gap-4">
          <div class="grid gap-2">
            <Label for="min_salary">Minimum Salary *</Label>
            <Input id="min_salary" v-model.number="formData.min_salary" type="number" required placeholder="60000" />
          </div>
          <div class="grid gap-2">
            <Label for="max_salary">Maximum Salary *</Label>
            <Input id="max_salary" v-model.number="formData.max_salary" type="number" required placeholder="100000" />
          </div>
        </div>

        <div class="grid gap-2">
          <Label for="description">Description</Label>
          <Textarea
            id="description"
            v-model="formData.description"
            placeholder="Brief description of the position"
            rows="3"
          />
        </div>

        <div class="grid gap-2">
          <Label>Allowed Role</Label>
          <p class="text-xs text-muted-foreground mb-2">
            Select which role can apply for this position
          </p>
          <div class="grid gap-2">
            <div
              v-for="role in roles"
              :key="role.role_id"
              class="hover:bg-accent/50 flex items-start gap-3 rounded-lg border p-3 cursor-pointer"
              :class="isRoleSelected(role.role_id) ? 'border-primary bg-primary/5' : ''"
              @click="handleRoleToggle(role.role_id, !isRoleSelected(role.role_id))"
            >
              <div
                class="size-4 shrink-0 rounded-lg border shadow-xs flex items-center justify-center mt-0.5"
                :class="isRoleSelected(role.role_id) ? 'border-primary bg-primary text-primary-foreground' : 'border-input'"
              >
                <Check v-if="isRoleSelected(role.role_id)" class="size-3.5" />
              </div>
              <div class="grid gap-1.5 font-normal flex-1">
                <p class="text-sm leading-none font-medium capitalize">
                  {{ role.name.replace(/_/g, ' ') }}
                </p>
                <p class="text-muted-foreground text-sm">
                  {{ role.description }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" @click="handleClose" :disabled="saving">
          Cancel
        </Button>
        <Button @click="handleSave" :disabled="saving">
          <Loader2 v-if="saving" class="w-4 h-4 mr-2 animate-spin" />
          {{ isEditMode ? 'Update Position' : 'Create Position' }}
        </Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>
</template>
