<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue'
import { payrollApi } from '@/services/api/payroll'
import type { PayrollPeriod } from '@/types/payroll'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import ResultDialog from '@/components/common/ResultDialog.vue'
import Pagination from '@/components/common/Pagination.vue'
import { Wallet, Search, Loader2, Play } from 'lucide-vue-next'

const periods = ref<PayrollPeriod[]>([])
const loading = ref(false)
const searchQuery = ref('')
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

// Result dialog
const resultDialog = ref({
  open: false,
  type: 'success' as 'success' | 'error',
  title: '',
  message: '',
})

// Computed
const filteredPeriods = computed(() => {
  if (!searchQuery.value) return periods.value

  const query = searchQuery.value.toLowerCase()
  return periods.value.filter(
    (p) =>
      p.status.toLowerCase().includes(query) ||
      p.processed_by_name?.toLowerCase().includes(query) ||
      formatPeriod(p.start_date, p.end_date).toLowerCase().includes(query)
  )
})

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function formatPeriod(startDate: string, endDate: string) {
  const start = new Date(startDate)
  return start.toLocaleDateString('en-US', { year: 'numeric', month: 'long' })
}

function getStatusVariant(status: string) {
  switch (status) {
    case 'OPEN':
      return 'outline'
    case 'PROCESSING':
      return 'secondary'
    case 'COMPLETED':
      return 'default'
    default:
      return 'secondary'
  }
}

async function loadPeriods() {
  loading.value = true
  try {
    const response = await payrollApi.getPayrollPeriods({ page: page.value, page_size: pageSize.value })
    periods.value = response.data
    total.value = response.total
  } catch (err: any) {
    console.error('Failed to load payroll periods:', err)
    if (err?.error?.code === 'FORBIDDEN' || err?.status === 403) {
      return
    }
    resultDialog.value = {
      open: true,
      type: 'error',
      title: 'Failed to Load Payroll Periods',
      message: 'Unable to load payroll periods. Please try again.',
    }
  } finally {
    loading.value = false
  }
}

async function handleRunPayroll(period: PayrollPeriod) {
  if (!confirm(`Are you sure you want to run payroll for ${formatPeriod(period.start_date, period.end_date)}?`)) {
    return
  }

  try {
    await payrollApi.runPayroll(period.id)
    resultDialog.value = {
      open: true,
      type: 'success',
      title: 'Payroll Processing',
      message: `Payroll for ${formatPeriod(period.start_date, period.end_date)} has been submitted for processing.`,
    }
    await loadPeriods()
  } catch (err: any) {
    console.error('Failed to run payroll:', err)
    resultDialog.value = {
      open: true,
      type: 'error',
      title: 'Failed to Run Payroll',
      message: err?.error?.message || 'Unable to run payroll. Please try again.',
    }
  }
}

// Watch for page changes
watch(page, () => {
  loadPeriods()
})

onMounted(() => {
  loadPeriods()
})
</script>

<template>
  <div class="flex flex-col gap-6 p-6">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Wallet class="w-8 h-8 text-primary" />
          Payroll
        </h1>
        <p class="text-muted-foreground mt-1">
          Manage payroll periods and processing
        </p>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="flex items-center gap-4">
      <div class="relative flex-1 max-w-md">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          v-model="searchQuery"
          placeholder="Search by period, status, or processed by..."
          class="pl-10"
        />
      </div>
      <div class="text-sm text-muted-foreground">
        {{ total }} period{{ total !== 1 ? 's' : '' }} total
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <Loader2 class="w-8 h-8 animate-spin text-muted-foreground" />
    </div>

    <!-- Table -->
    <div v-else class="rounded-lg border px-3 py-2">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Period</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Processed By</TableHead>
            <TableHead>Created</TableHead>
            <TableHead class="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-if="filteredPeriods.length === 0">
            <TableCell colspan="7" class="text-center py-8 text-muted-foreground">
              {{ searchQuery ? 'No payroll periods found matching your search.' : 'No payroll periods yet.' }}
            </TableCell>
          </TableRow>
          <TableRow v-for="period in filteredPeriods" :key="period.id">
            <TableCell class="font-medium">
              {{ formatPeriod(period.start_date, period.end_date) }}
            </TableCell>
            <TableCell>{{ formatDate(period.start_date) }}</TableCell>
            <TableCell>{{ formatDate(period.end_date) }}</TableCell>
            <TableCell>
              <Badge :variant="getStatusVariant(period.status)">
                {{ period.status }}
              </Badge>
            </TableCell>
            <TableCell>
              <span v-if="period.processed_by_name">{{ period.processed_by_name }}</span>
              <span v-else class="text-muted-foreground">-</span>
            </TableCell>
            <TableCell class="text-muted-foreground text-sm">
              {{ formatDate(period.created_at) }}
            </TableCell>
            <TableCell class="text-right">
              <Button
                v-if="period.status === 'OPEN'"
                variant="ghost"
                size="sm"
                @click="handleRunPayroll(period)"
              >
                <Play class="w-4 h-4 mr-1" />
                Run
              </Button>
              <span v-else class="text-sm text-muted-foreground">-</span>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

      <!-- Pagination -->
      <Pagination
        :current-page="page"
        :page-size="pageSize"
        :total="total"
        @update:page="(newPage) => (page = newPage)"
      />
    </div>

    <!-- Result Dialog -->
    <ResultDialog
      :open="resultDialog.open"
      :type="resultDialog.type"
      :title="resultDialog.title"
      :message="resultDialog.message"
      @update:open="(val) => (resultDialog.open = val)"
    />
  </div>
</template>
