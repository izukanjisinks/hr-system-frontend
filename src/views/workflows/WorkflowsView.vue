<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useWorkflowStore } from '@/stores/workflow'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2, Eye } from 'lucide-vue-next'

const router = useRouter()
const workflowStore = useWorkflowStore()
const dialogOpen = ref(false)

// Form state
const formData = ref({
  name: '',
  description: '',
})

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function handleCreate() {
  if (!formData.value.name.trim()) return

  const id = workflowStore.createWorkflow(
    formData.value.name.trim(),
    formData.value.description.trim()
  )

  // Reset form
  formData.value = { name: '', description: '' }
  dialogOpen.value = false

  // Navigate to the new workflow
  router.push(`/workflows/${id}`)
}

function handleToggleActive(id: string, isActive: boolean) {
  workflowStore.updateWorkflowMetadata(id, { isActive })
}

function handleDelete(id: string, name: string) {
  if (confirm(`Delete workflow "${name}"?`)) {
    workflowStore.deleteWorkflow(id)
  }
}

function viewWorkflow(id: string) {
  router.push(`/workflows/${id}`)
}

onMounted(() => {
  workflowStore.initializeSampleWorkflows()
})
</script>

<template>
  <div class="flex flex-col gap-6 p-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold">Workflows</h1>
        <p class="text-muted-foreground">Manage HR process workflows</p>
      </div>

      <!-- New Workflow Dialog -->
      <Dialog v-model:open="dialogOpen">
        <DialogTrigger as-child>
          <Button>
            <Plus class="size-4 mr-2" />
            New Workflow
          </Button>
        </DialogTrigger>
        <DialogContent class="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create New Workflow</DialogTitle>
            <DialogDescription>
              Create a new workflow for HR processes
            </DialogDescription>
          </DialogHeader>

          <div class="grid gap-4 py-4">
            <!-- Name -->
            <div class="grid gap-2">
              <Label for="workflow-name">Workflow Name</Label>
              <input
                id="workflow-name"
                v-model="formData.name"
                type="text"
                placeholder="e.g., Leave Approval Process"
                class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <!-- Description -->
            <div class="grid gap-2">
              <Label for="workflow-description">Description</Label>
              <Textarea
                id="workflow-description"
                v-model="formData.description"
                placeholder="Describe the workflow..."
                class="resize-none"
                rows="3"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" @click="dialogOpen = false">
              Cancel
            </Button>
            <Button @click="handleCreate" :disabled="!formData.name.trim()">
              Create Workflow
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>

    <!-- Table Card -->
    <Card>
      <CardHeader>
        <CardTitle>All Workflows</CardTitle>
        <CardDescription>
          {{ workflowStore.workflows.length }} workflow{{ workflowStore.workflows.length === 1 ? '' : 's' }}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>States</TableHead>
              <TableHead>Transitions</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead class="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-if="workflowStore.workflows.length === 0">
              <TableCell colspan="7" class="text-center text-muted-foreground">
                No workflows found. Create your first workflow!
              </TableCell>
            </TableRow>
            <TableRow v-for="workflow in workflowStore.workflows" :key="workflow.id">
              <TableCell class="font-medium">{{ workflow.name }}</TableCell>
              <TableCell class="max-w-xs truncate">{{ workflow.description || '-' }}</TableCell>
              <TableCell>{{ workflow.nodes.length }}</TableCell>
              <TableCell>{{ workflow.edges.length }}</TableCell>
              <TableCell>
                <div class="flex items-center gap-2">
                  <Switch
                    :checked="workflow.isActive"
                    @update:checked="(val) => handleToggleActive(workflow.id, val)"
                  />
                  <Badge :variant="workflow.isActive ? 'default' : 'secondary'">
                    {{ workflow.isActive ? 'Active' : 'Inactive' }}
                  </Badge>
                </div>
              </TableCell>
              <TableCell class="text-muted-foreground">{{ formatDate(workflow.createdAt) }}</TableCell>
              <TableCell class="text-right">
                <div class="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    @click="viewWorkflow(workflow.id)"
                  >
                    <Eye class="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    @click="handleDelete(workflow.id, workflow.name)"
                  >
                    <Trash2 class="size-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
</template>
