<script setup lang="ts">
import { Document, Page, View, Text } from '@ceereals/vue-pdf'
import type { Payslip } from '@/types/payroll'
import type { Style } from '@ceereals/vue-pdf'

defineProps<{
  payslip: Payslip
}>()

function formatCurrency(amount: number) {
  return amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const styles = {
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: 'Helvetica',
    color: '#1a1a1a',
  } as Style,

  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingBottom: 15,
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
  } as Style,
  companyName: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#2563eb',
  } as Style,
  payslipTitle: {
    fontSize: 14,
    fontFamily: 'Helvetica-Bold',
    textAlign: 'right',
  } as Style,
  payPeriod: {
    fontSize: 10,
    color: '#6b7280',
    textAlign: 'right',
    marginTop: 4,
  } as Style,

  // Employee info
  employeeSection: {
    flexDirection: 'row',
    marginBottom: 20,
    backgroundColor: '#f8fafc',
    padding: 12,
    borderRadius: 4,
  } as Style,
  employeeCol: {
    flex: 1,
  } as Style,
  label: {
    fontSize: 8,
    color: '#6b7280',
    marginBottom: 2,
    textTransform: 'uppercase',
  } as Style,
  value: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
  } as Style,

  // Tables
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    marginBottom: 8,
    marginTop: 8,
    color: '#1e293b',
  } as Style,
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    padding: 8,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
  } as Style,
  tableHeaderText: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#475569',
    textTransform: 'uppercase',
  } as Style,
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  } as Style,
  itemName: {
    flex: 1,
  } as Style,
  itemAmount: {
    width: 100,
    textAlign: 'right',
  } as Style,

  // Summary
  summarySection: {
    marginTop: 20,
    borderTopWidth: 2,
    borderTopColor: '#e2e8f0',
    paddingTop: 12,
  } as Style,
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: 4,
  } as Style,
  summaryLabel: {
    width: 150,
    textAlign: 'right',
    paddingRight: 16,
    color: '#6b7280',
  } as Style,
  summaryValue: {
    width: 100,
    textAlign: 'right',
    fontFamily: 'Helvetica-Bold',
  } as Style,
  netPayRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingVertical: 8,
    marginTop: 4,
    backgroundColor: '#2563eb',
    borderRadius: 4,
    paddingHorizontal: 12,
  } as Style,
  netPayLabel: {
    width: 150,
    textAlign: 'right',
    paddingRight: 16,
    color: '#ffffff',
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
  } as Style,
  netPayValue: {
    width: 100,
    textAlign: 'right',
    color: '#ffffff',
    fontSize: 12,
    fontFamily: 'Helvetica-Bold',
  } as Style,

  // Footer
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#9ca3af',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 8,
  } as Style,
}
</script>

<template>
  <Document :title="`Payslip - ${payslip.pay_period}`">
    <Page size="A4" :style="styles.page">
      <!-- Header -->
      <View :style="styles.header">
        <View>
          <Text :style="styles.companyName">Acme Corporation</Text>
        </View>
        <View>
          <Text :style="styles.payslipTitle">PAYSLIP</Text>
          <Text :style="styles.payPeriod">{{ payslip.pay_period }}</Text>
        </View>
      </View>

      <!-- Employee Info -->
      <View :style="styles.employeeSection">
        <View :style="styles.employeeCol">
          <Text :style="styles.label">Employee Name</Text>
          <Text :style="styles.value">{{ payslip.employee_name }}</Text>
          <Text :style="styles.label">Employee Number</Text>
          <Text :style="styles.value">{{ payslip.employee_number }}</Text>
        </View>
        <View :style="styles.employeeCol">
          <Text :style="styles.label">Department</Text>
          <Text :style="styles.value">{{ payslip.department }}</Text>
          <Text :style="styles.label">Position</Text>
          <Text :style="styles.value">{{ payslip.position }}</Text>
        </View>
        <View :style="styles.employeeCol">
          <Text :style="styles.label">Pay Date</Text>
          <Text :style="styles.value">{{ new Date(payslip.pay_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}</Text>
        </View>
      </View>

      <!-- Earnings -->
      <Text :style="styles.sectionTitle">Earnings</Text>
      <View :style="styles.tableHeader">
        <Text :style="[styles.tableHeaderText, styles.itemName]">Description</Text>
        <Text :style="[styles.tableHeaderText, styles.itemAmount]">Amount</Text>
      </View>
      <View v-for="(item, index) in payslip.earnings" :key="index" :style="styles.tableRow">
        <Text :style="styles.itemName">{{ item.name }}</Text>
        <Text :style="styles.itemAmount">{{ formatCurrency(item.amount) }}</Text>
      </View>

      <!-- Deductions -->
      <Text :style="styles.sectionTitle">Deductions</Text>
      <View :style="styles.tableHeader">
        <Text :style="[styles.tableHeaderText, styles.itemName]">Description</Text>
        <Text :style="[styles.tableHeaderText, styles.itemAmount]">Amount</Text>
      </View>
      <View v-for="(item, index) in payslip.deductions" :key="index" :style="styles.tableRow">
        <Text :style="styles.itemName">{{ item.name }}</Text>
        <Text :style="styles.itemAmount">{{ formatCurrency(item.amount) }}</Text>
      </View>

      <!-- Summary -->
      <View :style="styles.summarySection">
        <View :style="styles.summaryRow">
          <Text :style="styles.summaryLabel">Gross Pay</Text>
          <Text :style="styles.summaryValue">{{ formatCurrency(payslip.gross_pay) }}</Text>
        </View>
        <View :style="styles.summaryRow">
          <Text :style="styles.summaryLabel">Total Deductions</Text>
          <Text :style="styles.summaryValue">-{{ formatCurrency(payslip.total_deductions) }}</Text>
        </View>
        <View :style="styles.netPayRow">
          <Text :style="styles.netPayLabel">Net Pay</Text>
          <Text :style="styles.netPayValue">{{ formatCurrency(payslip.net_pay) }}</Text>
        </View>
      </View>

      <!-- Footer -->
      <View :style="styles.footer" fixed>
        <Text>This is a computer-generated document and does not require a signature.</Text>
      </View>
    </Page>
  </Document>
</template>
