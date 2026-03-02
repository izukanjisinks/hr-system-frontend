<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { dashboardApi } from '@/services/api/dashboard'
import type { AdminDashboardData } from '@/types/dashboard'
import type { ChartConfig } from '@/components/ui/chart'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  componentToString,
} from '@/components/ui/chart'
import { Donut } from '@unovis/ts'
import { VisDonut, VisSingleContainer } from '@unovis/vue'
import {
  Users,
  Building2,
  Wallet,
} from 'lucide-vue-next'

const authStore = useAuthStore()
const data = ref<AdminDashboardData | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const statCards = [
  { key: 'total_employees', title: 'Total Employees', icon: Users, description: 'Active employees' },
  { key: 'total_departments', title: 'Departments', icon: Building2, description: 'Organizational units' },
  { key: 'active_payroll_periods', title: 'Active Payroll', icon: Wallet, description: 'Open periods' },
]

const leaveChartConfig = {
  count: { label: 'Requests' },
  pending: { label: 'Pending', color: 'var(--chart-4)' },
  approved: { label: 'Approved', color: 'var(--chart-2)' },
  rejected: { label: 'Rejected', color: 'var(--chart-1)' },
} satisfies ChartConfig

type LeaveChartItem = { status: string, count: number, fill: string }

const leaveChartData = computed<LeaveChartItem[]>(() => {
  if (!data.value) return []
  return [
    { status: 'pending', count: data.value.leave_requests_summary.pending, fill: 'var(--color-pending)' },
    { status: 'approved', count: data.value.leave_requests_summary.approved, fill: 'var(--color-approved)' },
    { status: 'rejected', count: data.value.leave_requests_summary.rejected, fill: 'var(--color-rejected)' },
  ]
})

const totalLeaveRequests = computed(() => {
  if (!data.value) return 0
  const s = data.value.leave_requests_summary
  return s.pending + s.approved + s.rejected
})

function getLeaveCount(d: LeaveChartItem) {
  return d.count
}

function getLeaveColor(d: LeaveChartItem) {
  return leaveChartConfig[d.status as keyof typeof leaveChartConfig]?.color ?? ''
}

const leaveTooltipTriggers = computed(() => ({
  [Donut.selectors.segment]: componentToString(leaveChartConfig, ChartTooltipContent, { hideLabel: true }) ?? '',
}))

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

async function fetchDashboard() {
  loading.value = true
  error.value = null
  try {
    data.value = await dashboardApi.getAdminDashboard()
  } catch (err) {
    console.error('Failed to load admin dashboard:', err)
    error.value = `Failed to load dashboard data: ${(err as any)?.error?.message || (err as Error)?.message || 'Unknown error'}`
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDashboard()
})
</script>

<template>
  <div class="flex flex-col gap-6 p-6">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-semibold">Dashboard</h1>
      <p class="text-muted-foreground">
        Welcome back, {{ authStore.user?.email }}
      </p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
      {{ error }}
    </div>

    <!-- Stat Cards -->
    <div v-if="loading" class="grid gap-4 sm:grid-cols-3">
      <Card v-for="i in 3" :key="i" class="shadow-none">
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <Skeleton class="h-4 w-24" />
          <Skeleton class="size-4 rounded" />
        </CardHeader>
        <CardContent>
          <Skeleton class="h-8 w-12 mb-2" />
          <Skeleton class="h-3 w-20" />
        </CardContent>
      </Card>
    </div>

    <div v-else-if="data" class="grid gap-4 sm:grid-cols-3">
      <Card v-for="stat in statCards" :key="stat.key" class="shadow-none">
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="text-sm font-medium">{{ stat.title }}</CardTitle>
          <component :is="stat.icon" class="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p class="text-2xl font-bold">{{ (data as any)[stat.key] }}</p>
          <CardDescription>{{ stat.description }}</CardDescription>
        </CardContent>
      </Card>
    </div>

    <!-- Bottom Section -->
    <div v-if="!loading && data" class="grid gap-4 lg:grid-cols-2">
      <!-- Leave Requests Summary - Donut Chart -->
      <Card class="flex flex-col shadow-none">
        <CardHeader class="items-center pb-0">
          <CardTitle>Leave Requests Overview</CardTitle>
          <CardDescription>Current status of all leave requests</CardDescription>
        </CardHeader>
        <CardContent class="flex-1 pb-0">
          <ChartContainer
            :config="leaveChartConfig"
            class="mx-auto aspect-square max-h-[250px]"
            :style="{
              '--vis-donut-central-label-font-size': 'var(--text-3xl)',
              '--vis-donut-central-label-font-weight': 'var(--font-weight-bold)',
              '--vis-donut-central-label-text-color': 'var(--foreground)',
              '--vis-donut-central-sub-label-text-color': 'var(--muted-foreground)',
            }"
          >
            <VisSingleContainer :data="leaveChartData" :margin="{ top: 30, bottom: 30 }">
              <VisDonut
                :value="getLeaveCount"
                :color="getLeaveColor"
                :arc-width="30"
                :central-label-offset-y="10"
                :central-label="totalLeaveRequests.toLocaleString()"
                central-sub-label="Requests"
              />
              <ChartTooltip :triggers="leaveTooltipTriggers" />
            </VisSingleContainer>
          </ChartContainer>
        </CardContent>
        <div class="flex justify-center gap-6 pb-6 text-sm">
          <div class="flex items-center gap-2">
            <span class="size-3 rounded-full" style="background: var(--chart-4)" />
            <span class="text-muted-foreground">Pending ({{ data.leave_requests_summary.pending }})</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="size-3 rounded-full" style="background: var(--chart-2)" />
            <span class="text-muted-foreground">Approved ({{ data.leave_requests_summary.approved }})</span>
          </div>
          <div class="flex items-center gap-2">
            <span class="size-3 rounded-full" style="background: var(--chart-1)" />
            <span class="text-muted-foreground">Rejected ({{ data.leave_requests_summary.rejected }})</span>
          </div>
        </div>
      </Card>

      <!-- Recent Hires -->
      <Card class="shadow-none">
        <CardHeader>
          <CardTitle>Recent Hires</CardTitle>
          <CardDescription>Newest team members</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div v-for="hire in data.recent_hires" :key="hire.name" class="flex items-center gap-3">
            <div class="size-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <span class="text-sm font-semibold text-primary">{{ hire.name.charAt(0) }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium truncate">{{ hire.name }}</p>
              <p class="text-xs text-muted-foreground truncate">{{ hire.position }} &middot; {{ hire.department }}</p>
            </div>
            <p class="text-xs text-muted-foreground shrink-0">{{ formatDate(hire.start_date) }}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
