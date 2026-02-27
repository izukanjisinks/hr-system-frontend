<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { payrollApi } from '@/services/api/payroll'
import type { Payslip } from '@/types/payroll'
import { PDFViewer, PDFDownloadLink } from '@ceereals/vue-pdf'
import PayslipDocument from '@/components/payroll/PayslipDocument.vue'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { FileText, Download, DollarSign } from 'lucide-vue-next'

const payslips = ref<Payslip[]>([])
const selectedPayslip = ref<Payslip | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

function formatCurrency(amount: number) {
  return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

function selectPayslip(payslip: Payslip) {
  selectedPayslip.value = payslip
}

async function fetchPayslips() {
  loading.value = true
  error.value = null
  try {
    payslips.value = await payrollApi.getMyPayslips()
    if (payslips.value.length > 0) {
      selectedPayslip.value = payslips.value[0]
    }
  } catch (err: any) {
    error.value = err?.error?.message || 'Failed to load payslips'
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPayslips()
})
</script>

<template>
  <div class="flex flex-col gap-6 p-6 h-full">
    <!-- Header -->
    <div>
      <h1 class="text-2xl font-semibold">Payslips</h1>
      <p class="text-muted-foreground">View and download your payslips</p>
    </div>

    <!-- Error State -->
    <div v-if="error" class="rounded-lg bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
      {{ error }}
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex gap-6 flex-1">
      <div class="w-80 shrink-0 space-y-3">
        <Skeleton v-for="i in 4" :key="i" class="h-20 w-full" />
      </div>
      <Skeleton class="flex-1 h-150" />
    </div>

    <!-- Content -->
    <div v-else class="flex gap-6 flex-1 min-h-0">
      <!-- Left Panel: Payslip List -->
      <div class="w-80 shrink-0">
        <Card>
          <CardHeader class="pb-3">
            <CardTitle class="text-base">Pay History</CardTitle>
          </CardHeader>
          <CardContent class="p-0">
            <div v-if="payslips.length === 0" class="p-6 text-center">
              <div class="size-12 rounded-full bg-muted mx-auto flex items-center justify-center mb-3">
                <FileText class="size-6 text-muted-foreground" />
              </div>
              <p class="text-sm text-muted-foreground">No payslips found</p>
            </div>

            <div v-else class="divide-y">
              <div
                v-for="payslip in payslips"
                :key="payslip.id"
                class="flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-accent/50"
                :class="selectedPayslip?.id === payslip.id ? 'bg-accent' : ''"
                @click="selectPayslip(payslip)"
              >
                <div class="size-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <DollarSign class="size-4 text-primary" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-sm font-medium truncate">{{ payslip.pay_period }}</p>
                  <p class="text-xs text-muted-foreground">{{ formatDate(payslip.pay_date) }}</p>
                </div>
                <p class="text-sm font-semibold tabular-nums">
                  {{ formatCurrency(payslip.net_pay) }}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <!-- Right Panel: PDF Preview -->
      <div class="flex-1 flex flex-col min-h-0">
        <div v-if="!selectedPayslip" class="flex-1 flex items-center justify-center border rounded-lg bg-muted/30">
          <div class="text-center">
            <FileText class="size-12 text-muted-foreground mx-auto mb-3" />
            <p class="text-sm text-muted-foreground">Select a payslip to preview</p>
          </div>
        </div>

        <template v-else>
          <!-- Toolbar -->
          <div class="flex items-center justify-between mb-3">
            <div>
              <h2 class="text-lg font-semibold">{{ selectedPayslip.pay_period }}</h2>
              <p class="text-sm text-muted-foreground">
                Net Pay: {{ formatCurrency(selectedPayslip.net_pay) }}
              </p>
            </div>
            <PDFDownloadLink :file-name="`Payslip-${selectedPayslip.pay_period.replace(/\s/g, '-')}.pdf`">
              <template #default>
                <PayslipDocument :payslip="selectedPayslip" />
              </template>
              <template #label>
                <Button>
                  <Download class="size-4 mr-2" />
                  Download PDF
                </Button>
              </template>
            </PDFDownloadLink>
          </div>

          <!-- PDF Viewer -->
          <div class="flex-1 border rounded-lg overflow-hidden min-h-150">
            <PDFViewer :key="selectedPayslip.id" :show-toolbar="false" class="w-full h-full">
              <PayslipDocument :payslip="selectedPayslip" />
            </PDFViewer>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
