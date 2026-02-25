<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { userApi } from '@/services/api/user'
import type { SystemUser } from '@/types/user'
import type { Role } from '@/types/role'
import { roleApi } from '@/services/api/role'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  UserPlus,
  Search,
  MoreVertical,
  Edit,
  Trash2,
  Shield,
  Lock,
  Unlock,
  KeyRound,
  Loader2,
  AlertCircle,
} from 'lucide-vue-next'
import { Skeleton } from '@/components/ui/skeleton'
import ConfirmDialog from '@/components/common/ConfirmDialog.vue'

const users = ref<SystemUser[]>([])
const roles = ref<Role[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const searchQuery = ref('')

// Confirmation dialog state
const confirmDialog = ref({
  open: false,
  title: '',
  description: '',
  variant: 'default' as 'default' | 'destructive',
  confirmText: 'Confirm',
  icon: AlertCircle,
  action: null as (() => Promise<void>) | null,
  loading: false,
})

const selectedUser = ref<SystemUser | null>(null)

const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value

  const query = searchQuery.value.toLowerCase()
  return users.value.filter(user =>
    user.email.toLowerCase().includes(query) ||
    user.role.name.toLowerCase().includes(query)
  )
})

async function fetchUsers() {
  loading.value = true
  error.value = null
  try {
    users.value = await userApi.getUsers()
  } catch (err: any) {
    error.value = err?.error?.message || 'Failed to load users'
  } finally {
    loading.value = false
  }
}

async function fetchRoles() {
  try {
    roles.value = await roleApi.getRoles()
  } catch (err) {
    console.error('Failed to load roles:', err)
  }
}

function getRoleBadgeVariant(roleName: string) {
  switch (roleName) {
    case 'super_admin':
      return 'destructive'
    case 'hr_manager':
      return 'default'
    case 'manager':
      return 'secondary'
    default:
      return 'outline'
  }
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function openLockDialog(user: SystemUser) {
  selectedUser.value = user
  const isLocking = !user.is_locked

  confirmDialog.value = {
    open: true,
    title: isLocking ? 'Lock Account' : 'Unlock Account',
    description: isLocking
      ? `Are you sure you want to lock ${user.email}? They will not be able to access the system.`
      : `Are you sure you want to unlock ${user.email}? They will regain access to the system.`,
    variant: isLocking ? 'destructive' : 'default',
    confirmText: isLocking ? 'Lock Account' : 'Unlock Account',
    icon: isLocking ? Lock : Unlock,
    action: async () => {
      await handleLockToggle(user)
    },
    loading: false,
  }
}

function openDeleteDialog(user: SystemUser) {
  selectedUser.value = user

  confirmDialog.value = {
    open: true,
    title: 'Delete User',
    description: `Are you sure you want to delete ${user.email}? This action cannot be undone and will permanently remove all user data.`,
    variant: 'destructive',
    confirmText: 'Delete User',
    icon: Trash2,
    action: async () => {
      await handleDelete(user)
    },
    loading: false,
  }
}

async function handleLockToggle(user: SystemUser) {
  confirmDialog.value.loading = true
  try {
    await userApi.updateUser(user.user_id, { is_locked: !user.is_locked })
    await fetchUsers()
    confirmDialog.value.open = false
  } catch (err: any) {
    error.value = err?.error?.message || 'Failed to update user'
  } finally {
    confirmDialog.value.loading = false
  }
}

async function handleDelete(user: SystemUser) {
  confirmDialog.value.loading = true
  try {
    await userApi.deleteUser(user.user_id)
    await fetchUsers()
    confirmDialog.value.open = false
  } catch (err: any) {
    error.value = err?.error?.message || 'Failed to delete user'
  } finally {
    confirmDialog.value.loading = false
  }
}

async function handleConfirmAction() {
  if (confirmDialog.value.action) {
    await confirmDialog.value.action()
  }
}

onMounted(() => {
  fetchUsers()
  fetchRoles()
})
</script>

<template>
  <div class="flex flex-col gap-6 p-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold">System Users</h1>
        <p class="text-muted-foreground">
          Manage user accounts and permissions
        </p>
      </div>
      <Button>
        <UserPlus class="size-4 mr-2" />
        Add User
      </Button>
    </div>

    <!-- Search and Filters -->
    <Card>
      <CardContent class="pt-6">
        <div class="flex items-center gap-4">
          <div class="relative flex-1 max-w-sm">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              v-model="searchQuery"
              placeholder="Search by email or role..."
              class="pl-9"
            />
          </div>
        </div>
      </CardContent>
    </Card>

    <!-- Error State -->
    <div v-if="error" class="rounded-lg bg-destructive/10 border border-destructive/20 p-4 flex items-start gap-3">
      <AlertCircle class="size-5 text-destructive shrink-0 mt-0.5" />
      <div>
        <p class="text-sm font-medium text-destructive">Error loading users</p>
        <p class="text-sm text-destructive/90 mt-1">{{ error }}</p>
      </div>
    </div>

    <!-- Users Table -->
    <Card>
      <CardHeader>
        <CardTitle>All Users</CardTitle>
        <CardDescription>
          {{ filteredUsers.length }} {{ filteredUsers.length === 1 ? 'user' : 'users' }} in total
        </CardDescription>
      </CardHeader>
      <CardContent>
        <!-- Loading State -->
        <div v-if="loading" class="space-y-3">
          <Skeleton v-for="i in 5" :key="i" class="h-12 w-full" />
        </div>

        <!-- Table -->
        <div v-else-if="filteredUsers.length > 0" class="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Last Updated</TableHead>
                <TableHead class="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="user in filteredUsers" :key="user.user_id">
                <TableCell class="font-medium">
                  {{ user.email }}
                </TableCell>
                <TableCell>
                  <Badge :variant="getRoleBadgeVariant(user.role.name)" class="capitalize">
                    {{ user.role.name.replace(/_/g, ' ') }}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div class="flex items-center gap-2">
                    <Badge
                      :variant="user.is_active ? 'default' : 'secondary'"
                      class="capitalize"
                    >
                      {{ user.is_active ? 'Active' : 'Inactive' }}
                    </Badge>
                    <Lock v-if="user.is_locked" class="size-3.5 text-muted-foreground" />
                    <AlertCircle
                      v-if="user.change_password"
                      class="size-3.5 text-amber-600"
                      title="Password change required"
                    />
                  </div>
                </TableCell>
                <TableCell class="text-muted-foreground text-sm">
                  {{ formatDate(user.created_at) }}
                </TableCell>
                <TableCell class="text-muted-foreground text-sm">
                  {{ formatDate(user.updated_at) }}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                      <Button variant="ghost" size="icon">
                        <MoreVertical class="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <Edit class="size-4 mr-2" />
                        Edit User
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Shield class="size-4 mr-2" />
                        Change Role
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <KeyRound class="size-4 mr-2" />
                        Reset Password
                      </DropdownMenuItem>
                      <DropdownMenuItem @click="openLockDialog(user)">
                        <component :is="user.is_locked ? Unlock : Lock" class="size-4 mr-2" />
                        {{ user.is_locked ? 'Unlock' : 'Lock' }} Account
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem @click="openDeleteDialog(user)" class="text-destructive focus:text-destructive">
                        <Trash2 class="size-4 mr-2" />
                        Delete User
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>

        <!-- Empty State -->
        <div v-else class="text-center py-12">
          <div class="size-12 rounded-full bg-muted mx-auto flex items-center justify-center mb-4">
            <Search class="size-6 text-muted-foreground" />
          </div>
          <h3 class="text-lg font-medium mb-1">No users found</h3>
          <p class="text-sm text-muted-foreground">
            Try adjusting your search criteria
          </p>
        </div>
      </CardContent>
    </Card>

    <!-- Confirmation Dialog -->
    <ConfirmDialog
      :open="confirmDialog.open"
      @update:open="(val) => confirmDialog.open = val"
      :title="confirmDialog.title"
      :description="confirmDialog.description"
      :variant="confirmDialog.variant"
      :confirm-text="confirmDialog.confirmText"
      :icon="confirmDialog.icon"
      :loading="confirmDialog.loading"
      @confirm="handleConfirmAction"
    />
  </div>
</template>
