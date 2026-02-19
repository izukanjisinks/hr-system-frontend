<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Users, CalendarDays, DollarSign, UserSearch } from 'lucide-vue-next'

const authStore = useAuthStore()

const stats = [
  { title: 'Total Employees', value: '—', description: 'Active headcount', icon: Users },
  { title: 'Leave Requests', value: '—', description: 'Pending approval', icon: CalendarDays },
  { title: 'Payroll', value: '—', description: 'Last processed period', icon: DollarSign },
  { title: 'Open Positions', value: '—', description: 'Active job postings', icon: UserSearch },
]
</script>

<template>
  <div class="flex flex-col gap-6 p-6">
    <div>
      <h1 class="text-2xl font-semibold">Dashboard</h1>
      <p class="text-muted-foreground">
        Welcome back, {{ authStore.user?.email }}
      </p>
    </div>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card v-for="stat in stats" :key="stat.title">
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
  </div>
</template>
