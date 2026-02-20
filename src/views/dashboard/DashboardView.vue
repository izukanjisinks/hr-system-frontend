<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { dashboardApi } from '@/services/api/dashboard'
import type { DashboardData } from '@/types/dashboard'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { CalendarDays, CalendarOff, CalendarCheck } from 'lucide-vue-next'
import { Skeleton } from '@/components/ui/skeleton'
import { today, getLocalTimeZone } from '@internationalized/date'

const authStore = useAuthStore()
const data = ref<DashboardData | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const selectedDate = ref(today(getLocalTimeZone()))

const leaveStats = computed(() => {
  if (!data.value) return []
  return [
    {
      title: 'Leave Days This Month',
      value: data.value.leave_days_this_month,
      description: 'Days taken this month',
      icon: CalendarDays,
    },
    {
      title: 'Yearly Entitlement',
      value: data.value.yearly_entitlement,
      description: 'Total annual leave days',
      icon: CalendarCheck,
    },
    {
      title: 'Pending Requests',
      value: data.value.leave_requests,
      description: 'Awaiting approval',
      icon: CalendarOff,
    },
  ]
})

const holidaysThisMonth = computed(() => data.value?.holidays_this_month.details ?? [])

async function fetchDashboard() {
  loading.value = true
  error.value = null
  try {
    data.value = await dashboardApi.getDashboard()
    console.log('Dashboard data loaded:', data.value)
  } catch (err) {
    console.error('Failed to load dashboard:', err)
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
        Welcome back, {{ data?.employee_details.employee_name ?? authStore.user?.email }}
      </p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="rounded-md bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
      {{ error }}
    </div>

    <!-- Leave Stats Cards -->
    <div v-if="loading" class="grid gap-4 sm:grid-cols-3">
      <Card v-for="i in 3" :key="i">
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <Skeleton class="h-4 w-32" />
          <Skeleton class="size-4 rounded" />
        </CardHeader>
        <CardContent>
          <Skeleton class="h-8 w-16 mb-2" />
          <Skeleton class="h-3 w-24" />
        </CardContent>
      </Card>
    </div>

    <div v-else class="grid gap-4 sm:grid-cols-3">
      <Card v-for="stat in leaveStats" :key="stat.title">
        <CardHeader class="flex flex-row items-center justify-between pb-2">
          <CardTitle class="text-sm font-medium">{{ stat.title }}</CardTitle>
          <component :is="stat.icon" class="size-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <p class="text-2xl font-bold">{{ stat.value }}</p>
          <CardDescription>{{ stat.description }}</CardDescription>
        </CardContent>
      </Card>
    </div>

    <!-- Bottom Section: Calendar + Employee Stats -->
    <div class="grid gap-4 lg:grid-cols-2">
      <!-- Calendar Card with Holidays -->
      <Card>
        <CardHeader>
          <CardTitle>Holidays This Month</CardTitle>
          <CardDescription>
            {{ data?.holidays_this_month.total ?? 0 }} holiday{{ (data?.holidays_this_month.total ?? 0) === 1 ? '' : 's' }} in {{ new Date(selectedDate.year, selectedDate.month - 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) }}
          </CardDescription>
        </CardHeader>
        <CardContent class="flex flex-col gap-4">
          <Calendar v-model="selectedDate" />

          <!-- Holidays List -->
          <div v-if="holidaysThisMonth.length > 0" class="space-y-2 border-t pt-4">
            <p class="text-sm font-medium">Upcoming Holidays</p>
            <div v-for="holiday in holidaysThisMonth" :key="holiday.name" class="flex items-center justify-between text-sm">
              <span class="text-foreground">{{ holiday.name }}</span>
              <span class="text-muted-foreground">{{ new Date(holiday.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) }}</span>
            </div>
          </div>
          <p v-else class="text-sm text-muted-foreground border-t pt-4">
            No holidays this month
          </p>
        </CardContent>
      </Card>

      <!-- Employee Stats Card -->
      <Card>
        <CardHeader>
          <CardTitle>Employee Details</CardTitle>
          <CardDescription v-if="data">{{ data.employee_details.position }}</CardDescription>
        </CardHeader>
        <CardContent v-if="loading">
          <div class="space-y-3">
            <Skeleton class="h-4 w-full" />
            <Skeleton class="h-4 w-3/4" />
            <Skeleton class="h-4 w-5/6" />
            <Skeleton class="h-4 w-2/3" />
          </div>
        </CardContent>
        <CardContent v-else-if="data" class="space-y-3">
          <div class="flex justify-between text-sm">
            <span class="text-muted-foreground">Department</span>
            <span class="font-medium">{{ data.employee_details.department }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-muted-foreground">Supervisor</span>
            <span class="font-medium">{{ data.employee_details.supervisor }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-muted-foreground">Position Code</span>
            <span class="font-medium">{{ data.employee_details.position_code }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-muted-foreground">Employment Period</span>
            <span class="font-medium">{{ data.employee_details.employment_period }} months</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-muted-foreground">Employment Type</span>
            <span class="font-medium capitalize">{{ data.employee_details.role.replace('_', ' ') }}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
</template>
